import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Find events happening in the next 23-25 hours (to catch within hourly runs)
    const now = new Date();
    const in23Hours = new Date(now.getTime() + 23 * 60 * 60 * 1000);
    const in25Hours = new Date(now.getTime() + 25 * 60 * 60 * 1000);

    // Get published/live events in the reminder window
    const { data: upcomingEvents, error: eventsError } = await supabase
      .from("events")
      .select("id, title, venue, event_date, start_time, end_time, status")
      .in("status", ["published", "live"])
      .gte("event_date", in23Hours.toISOString().split("T")[0])
      .lte("event_date", in25Hours.toISOString().split("T")[0]);

    if (eventsError) {
      console.error("Error fetching events:", eventsError);
      throw eventsError;
    }

    if (!upcomingEvents || upcomingEvents.length === 0) {
      console.log("No events in the reminder window");
      return new Response(
        JSON.stringify({ message: "No events to remind", sent: 0 }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log(`Found ${upcomingEvents.length} events in reminder window`);

    let totalSent = 0;

    for (const event of upcomingEvents) {
      // Check if the event datetime is actually in the 24-hour window
      const eventDateTime = new Date(`${event.event_date}T${event.start_time}`);
      const hoursUntilEvent = (eventDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);
      
      if (hoursUntilEvent < 23 || hoursUntilEvent > 25) {
        console.log(`Event ${event.id} is ${hoursUntilEvent.toFixed(1)} hours away, skipping`);
        continue;
      }

      // Get registered participants for this event
      const { data: registrations, error: regError } = await supabase
        .from("participation_ledger")
        .select("participant_id")
        .eq("event_id", event.id)
        .eq("action", "registered");

      if (regError) {
        console.error(`Error fetching registrations for event ${event.id}:`, regError);
        continue;
      }

      if (!registrations || registrations.length === 0) {
        console.log(`No registrations for event ${event.id}`);
        continue;
      }

      // Get participants who haven't received a reminder yet
      const participantIds = registrations.map(r => r.participant_id);
      
      const { data: alreadySent, error: sentError } = await supabase
        .from("reminder_log")
        .select("participant_id")
        .eq("event_id", event.id)
        .eq("reminder_type", "event_reminder")
        .in("participant_id", participantIds);

      if (sentError) {
        console.error(`Error checking sent reminders for event ${event.id}:`, sentError);
        continue;
      }

      const sentParticipantIds = new Set(alreadySent?.map(s => s.participant_id) || []);
      const participantsToRemind = participantIds.filter(id => !sentParticipantIds.has(id));

      if (participantsToRemind.length === 0) {
        console.log(`All participants for event ${event.id} already reminded`);
        continue;
      }

      // Get participant details
      const { data: participants, error: partError } = await supabase
        .from("profiles")
        .select("id, display_name, email")
        .in("id", participantsToRemind);

      if (partError) {
        console.error(`Error fetching participants for event ${event.id}:`, partError);
        continue;
      }

      // Format event details
      const eventDate = new Date(event.event_date).toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });

      const formatTime = (time: string) => {
        const [hours, minutes] = time.split(":");
        const h = parseInt(hours);
        const ampm = h >= 12 ? "PM" : "AM";
        const h12 = h % 12 || 12;
        return `${h12}:${minutes} ${ampm}`;
      };

      // Send reminders
      for (const participant of participants || []) {
        if (!participant.email) continue;

        const html = `
          <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #1a1a1a;">Event Reminder ⏰</h1>
            <p>Hi ${participant.display_name},</p>
            <p>Just a friendly reminder that <strong>${event.title}</strong> is happening tomorrow!</p>
            
            <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0;">Event Details</h3>
              <p><strong>📅 Date:</strong> ${eventDate}</p>
              <p><strong>🕐 Time:</strong> ${formatTime(event.start_time)}${event.end_time ? ` - ${formatTime(event.end_time)}` : ""}</p>
              <p><strong>📍 Venue:</strong> ${event.venue}</p>
            </div>
            
            <p>Make sure to have your QR code ready for check-in!</p>
            <p style="color: #666; font-size: 14px;">See you there!</p>
          </div>
        `;

        try {
          const emailResponse = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${RESEND_API_KEY}`,
            },
            body: JSON.stringify({
              from: "SNOVAA Events <onboarding@resend.dev>",
              to: [participant.email],
              subject: `Reminder: ${event.title} is tomorrow!`,
              html,
            }),
          });

          if (emailResponse.ok) {
            // Log the sent reminder
            await supabase.from("reminder_log").insert({
              event_id: event.id,
              participant_id: participant.id,
              reminder_type: "event_reminder",
            });
            totalSent++;
            console.log(`Sent reminder to ${participant.email} for event ${event.id}`);
          } else {
            const errorData = await emailResponse.json();
            console.error(`Failed to send email to ${participant.email}:`, errorData);
          }
        } catch (emailError) {
          console.error(`Error sending email to ${participant.email}:`, emailError);
        }
      }
    }

    console.log(`Total reminders sent: ${totalSent}`);

    return new Response(
      JSON.stringify({ success: true, sent: totalSent }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in send-event-reminders function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);

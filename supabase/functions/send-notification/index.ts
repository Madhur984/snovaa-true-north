import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NotificationRequest {
  type: "registration_confirmation" | "event_reminder" | "attendance_confirmed";
  eventId: string;
  participantId: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { type, eventId, participantId }: NotificationRequest = await req.json();

    if (!type || !eventId || !participantId) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: type, eventId, participantId" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Fetch event details
    const { data: event, error: eventError } = await supabase
      .from("events")
      .select("title, venue, event_date, start_time, end_time")
      .eq("id", eventId)
      .single();

    if (eventError || !event) {
      return new Response(
        JSON.stringify({ error: "Event not found" }),
        { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Fetch participant details
    const { data: participant, error: participantError } = await supabase
      .from("profiles")
      .select("display_name, email")
      .eq("id", participantId)
      .single();

    if (participantError || !participant || !participant.email) {
      return new Response(
        JSON.stringify({ error: "Participant not found or no email" }),
        { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

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

    let subject = "";
    let html = "";

    switch (type) {
      case "registration_confirmation":
        subject = `You're registered for ${event.title}`;
        html = `
          <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #1a1a1a;">You're In! 🎉</h1>
            <p>Hi ${participant.display_name},</p>
            <p>You've successfully registered for <strong>${event.title}</strong>.</p>
            
            <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0;">Event Details</h3>
              <p><strong>📅 Date:</strong> ${eventDate}</p>
              <p><strong>🕐 Time:</strong> ${formatTime(event.start_time)}${event.end_time ? ` - ${formatTime(event.end_time)}` : ""}</p>
              <p><strong>📍 Venue:</strong> ${event.venue}</p>
            </div>
            
            <p>Don't forget to check in at the event using your QR code!</p>
            <p style="color: #666; font-size: 14px;">See you there!</p>
          </div>
        `;
        break;

      case "event_reminder":
        subject = `Reminder: ${event.title} is coming up!`;
        html = `
          <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #1a1a1a;">Event Reminder ⏰</h1>
            <p>Hi ${participant.display_name},</p>
            <p>Just a friendly reminder that <strong>${event.title}</strong> is coming up soon!</p>
            
            <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0;">Event Details</h3>
              <p><strong>📅 Date:</strong> ${eventDate}</p>
              <p><strong>🕐 Time:</strong> ${formatTime(event.start_time)}${event.end_time ? ` - ${formatTime(event.end_time)}` : ""}</p>
              <p><strong>📍 Venue:</strong> ${event.venue}</p>
            </div>
            
            <p>Make sure to have your QR code ready for check-in!</p>
            <p style="color: #666; font-size: 14px;">See you soon!</p>
          </div>
        `;
        break;

      case "attendance_confirmed":
        subject = `Attendance confirmed for ${event.title}`;
        html = `
          <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #1a1a1a;">Thanks for Attending! ✅</h1>
            <p>Hi ${participant.display_name},</p>
            <p>Your attendance at <strong>${event.title}</strong> has been confirmed.</p>
            
            <div style="background: #e8f5e9; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0; font-size: 16px;">Your participation has been recorded on the ledger.</p>
            </div>
            
            <p style="color: #666; font-size: 14px;">Thank you for being part of this event!</p>
          </div>
        `;
        break;
    }

    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "SNOVAA Events <onboarding@resend.dev>",
        to: [participant.email],
        subject,
        html,
      }),
    });

    const emailResult = await emailResponse.json();

    if (!emailResponse.ok) {
      throw new Error(emailResult.message || "Failed to send email");
    }

    console.log("Email sent successfully:", emailResult);

    return new Response(JSON.stringify({ success: true, emailId: emailResult.id }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error in send-notification function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);

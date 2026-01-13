import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const moduleTypes = [
  { id: "agenda", label: "Agenda / Schedule", description: "Show event timeline and sessions" },
  { id: "speakers", label: "Speakers", description: "Feature event speakers and their bios" },
  { id: "resources", label: "Resources", description: "Share materials, documents and links" },
  { id: "qna", label: "Q&A", description: "Collect and manage questions from attendees" },
  { id: "networking", label: "Networking", description: "Facilitate participant connections" },
];

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { title, description } = await req.json();
    
    if (!title && !description) {
      return new Response(
        JSON.stringify({ error: "Title or description is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are an event planning assistant for SNOVAA, a platform for organizing offline events and meetups.
    
Available modules that can be enabled for events:
${moduleTypes.map(m => `- ${m.id}: ${m.label} - ${m.description}`).join('\n')}

Based on the event title and description, suggest which modules would be most beneficial.
Consider the event type, scale, and objectives when making recommendations.`;

    const userPrompt = `Event Title: ${title || 'Not provided'}
Event Description: ${description || 'Not provided'}

Analyze this event and suggest appropriate modules to enable.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "suggest_modules",
              description: "Suggest event modules based on event details",
              parameters: {
                type: "object",
                properties: {
                  suggestions: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        module_id: { 
                          type: "string", 
                          enum: ["agenda", "speakers", "resources", "qna", "networking"]
                        },
                        recommended: { type: "boolean" },
                        reason: { type: "string" }
                      },
                      required: ["module_id", "recommended", "reason"],
                      additionalProperties: false
                    }
                  },
                  event_type_detected: { type: "string" },
                  overall_recommendation: { type: "string" }
                },
                required: ["suggestions", "event_type_detected", "overall_recommendation"],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "suggest_modules" } }
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add funds." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    
    if (!toolCall?.function?.arguments) {
      throw new Error("No suggestions returned from AI");
    }

    const suggestions = JSON.parse(toolCall.function.arguments);
    
    return new Response(
      JSON.stringify(suggestions),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("suggest-modules error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

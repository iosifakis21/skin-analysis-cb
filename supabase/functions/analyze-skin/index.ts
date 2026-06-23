import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, X-Client-Info, Apikey",
};

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(supabaseUrl, serviceRoleKey);

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { photoDataUrl, skinType, ageGroup } = await req.json();

    if (!photoDataUrl) {
      return new Response(
        JSON.stringify({ error: "photoDataUrl is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const { data: task, error: insertError } = await supabase
      .from("skin_analysis_tasks")
      .insert({ status: "pending" })
      .select("id")
      .single();

    if (insertError || !task) {
      throw new Error(insertError?.message || "Failed to create task");
    }

    const taskId = task.id;

    EdgeRuntime.waitUntil(
      processAnalysis(taskId, photoDataUrl, skinType, ageGroup),
    );

    return new Response(
      JSON.stringify({ task_id: taskId }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("analyze-skin error:", err);
    return new Response(
      JSON.stringify({ error: "Failed to start skin analysis" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});

async function processAnalysis(
  taskId: string,
  photoDataUrl: string,
  skinType: string,
  ageGroup: string,
) {
  try {
    const apiKey = Deno.env.get("OPENROUTER_API_KEY");
    if (!apiKey) {
      await supabase
        .from("skin_analysis_tasks")
        .update({ status: "error", error_message: "OPENROUTER_API_KEY not configured" })
        .eq("id", taskId);
      return;
    }

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
          "HTTP-Referer": "https://constantinebeauty.gr",
          "X-Title": "Constantine Beauty Skin Analysis",
        },
        body: JSON.stringify({
          model: "anthropic/claude-sonnet-4-5",
          max_tokens: 300,
          messages: [
            {
              role: "user",
              content: [
                { type: "image_url", image_url: { url: photoDataUrl } },
                {
                  type: "text",
                  text: `Analyze this face photo for skin concerns. Return ONLY raw JSON, no markdown, no explanation:
{
  "pores": <0-100>,
  "wrinkles": <0-100>,
  "dark_circles": <0-100>,
  "dehydration": <0-100>,
  "dark_spots": <0-100>,
  "primary_concern": "<highest score key>",
  "key_strength": "<lowest score key>"
}
Skin type: ${skinType || "normal"}. Age: ${ageGroup || "25-34"}. Be accurate and honest.`,
                },
              ],
            },
          ],
        }),
      },
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenRouter error:", response.status, errorText);
      await supabase
        .from("skin_analysis_tasks")
        .update({
          status: "error",
          error_message: `AI service returned status ${response.status}`,
        })
        .eq("id", taskId);
      return;
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content?.trim();

    if (!content) {
      await supabase
        .from("skin_analysis_tasks")
        .update({ status: "error", error_message: "No content in AI response" })
        .eq("id", taskId);
      return;
    }

    const clean = content.replace(/```json|```/g, "").trim();
    const scores = JSON.parse(clean);

    await supabase
      .from("skin_analysis_tasks")
      .update({ status: "success", result: scores })
      .eq("id", taskId);
  } catch (err) {
    console.error("processAnalysis error:", err);
    await supabase
      .from("skin_analysis_tasks")
      .update({
        status: "error",
        error_message: err instanceof Error ? err.message : "Unknown error",
      })
      .eq("id", taskId);
  }
}

import { google } from "@ai-sdk/google";
import { generateText } from "ai";
import { OpikExporter } from "opik-vercel";
import { createClient } from "@/utils/supabase/server";

export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return new Response(null, { status: 404 });
  }

  const { text } = await generateText({
    model: google("gemini-2.5-flash-lite"),
    system: "Say hello back and nothing more.",
    prompt: "Hello",
    experimental_telemetry: OpikExporter.getSettings({
      name: "hello-gemini",
      metadata: {
        isItWorking: false, // TODO: ask opik support, can't see this metadata in the trace, why?
      },
    }),
  });

  console.log("Generated text:", text);

  return Response.json({ message: text });
}

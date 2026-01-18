import { google } from "@ai-sdk/google";
import { generateText } from "ai";
import { OpikExporter } from "opik-vercel";

export async function POST() {
  const { text } = await generateText({
    model: google("gemini-2.5-flash-lite"),
    system: "Say hello back and nothing more.",
    prompt: "Hello",
    experimental_telemetry: OpikExporter.getSettings({
      name: "test-gemini",
    }),
  });

  console.log("Generated text:", text);

  return Response.json({ message: text });
}

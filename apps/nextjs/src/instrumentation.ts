import { registerOTel } from "@vercel/otel";
import { OpikExporter } from "opik-vercel";

export function register() {
  registerOTel({
    serviceName: "homecuistot-hackathon",
    traceExporter: new OpikExporter({
      tags: ["nextjs", process.env.NODE_ENV],
      metadata: {
        env: process.env.NODE_ENV,
      },
    }),
  });
}

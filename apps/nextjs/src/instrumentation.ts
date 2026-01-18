import { registerOTel } from "@vercel/otel";
import { OpikExporter } from "opik-vercel";

export function register() {
  const env = process.env.VERCEL_ENV || "development";
  const commitSha = process.env.VERCEL_GIT_COMMIT_SHA || "";
  const vercelUrl = process.env.VERCEL_URL || "";
  registerOTel({
    serviceName: "homecuistot-hackathon",
    traceExporter: new OpikExporter({
      tags: ["nextjs", env, commitSha, vercelUrl].filter(Boolean),
    }),
  });
}

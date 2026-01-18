import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  serverExternalPackages: ["opik", "opik-vercel", "@opentelemetry/api-logs", "@opentelemetry/sdk-logs"],
};

export default nextConfig;

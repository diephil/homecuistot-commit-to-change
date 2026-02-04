import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/services/admin-auth";

export async function GET() {
  const auth = await requireAdmin();
  if (!auth.ok) return auth.response;

  return NextResponse.json({
    workspace: process.env.OPIK_WORKSPACE || "local",
    projectName: process.env.OPIK_PROJECT_NAME || "homecuistot-hackathon",
  });
}

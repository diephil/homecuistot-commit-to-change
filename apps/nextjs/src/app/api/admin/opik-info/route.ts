import { NextResponse } from "next/server";
// DEMO: open to all authenticated users for project review
// import { requireAdmin } from "@/lib/services/admin-auth";
import { requireUser } from "@/lib/services/admin-auth";

export async function GET() {
  // const auth = await requireAdmin();
  const auth = await requireUser();
  if (!auth.ok) return auth.response;

  return NextResponse.json({
    workspace: process.env.OPIK_WORKSPACE || "local",
    projectName: process.env.OPIK_PROJECT_NAME || "homecuistot-hackathon",
  });
}

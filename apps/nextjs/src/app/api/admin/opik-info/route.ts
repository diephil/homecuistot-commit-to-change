import { NextResponse } from "next/server";
import { checkIsAdmin, requireUser } from "@/lib/services/admin-auth";

export async function GET() {
  const auth = await requireUser();
  if (!auth.ok) return auth.response;

  const isAdmin = await checkIsAdmin();

  return NextResponse.json({
    workspace: process.env.OPIK_WORKSPACE || "local",
    projectName: process.env.OPIK_PROJECT_NAME || "homecuistot-hackathon",
    isAdmin,
  });
}

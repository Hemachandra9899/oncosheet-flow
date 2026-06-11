import { NextResponse } from "next/server";
import { createOAuthState } from "@/lib/session";
import { getOAuthClient, GOOGLE_SCOPES } from "@/lib/google";

export async function GET() {
  const state = await createOAuthState();
  const oauth2Client = getOAuthClient();
  const url = oauth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    include_granted_scopes: true,
    scope: GOOGLE_SCOPES,
    state
  });
  return NextResponse.redirect(url);
}

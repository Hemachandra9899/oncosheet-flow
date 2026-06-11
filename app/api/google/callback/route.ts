import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import { prisma } from "@/lib/prisma";
import { encryptText } from "@/lib/crypto";
import { createSession, verifyOAuthState } from "@/lib/session";
import { getOAuthClient } from "@/lib/google";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const state = searchParams.get("state");

  if (!code) return NextResponse.redirect(new URL("/?error=missing_code", request.url));
  if (!(await verifyOAuthState(state))) {
    return NextResponse.redirect(new URL("/?error=bad_oauth_state", request.url));
  }

  const oauth2Client = getOAuthClient();
  const { tokens } = await oauth2Client.getToken(code);
  oauth2Client.setCredentials(tokens);

  const oauth2 = google.oauth2({ version: "v2", auth: oauth2Client });
  const userInfo = await oauth2.userinfo.get();
  const email = userInfo.data.email;
  if (!email) return NextResponse.redirect(new URL("/?error=no_google_email", request.url));

  const user = await prisma.user.upsert({
    where: { email },
    update: { name: userInfo.data.name, image: userInfo.data.picture },
    create: { email, name: userInfo.data.name, image: userInfo.data.picture }
  });

  const existing = await prisma.googleAccount.findUnique({ where: { userId: user.id } });
  const refreshToken = tokens.refresh_token || (existing ? undefined : null);

  if (!refreshToken && !existing) {
    return NextResponse.redirect(new URL("/?error=no_refresh_token", request.url));
  }

  await prisma.googleAccount.upsert({
    where: { userId: user.id },
    update: {
      googleEmail: email,
      encryptedRefreshToken: refreshToken ? encryptText(refreshToken) : existing!.encryptedRefreshToken,
      encryptedAccessToken: tokens.access_token ? encryptText(tokens.access_token) : undefined,
      accessTokenExpiresAt: tokens.expiry_date ? new Date(tokens.expiry_date) : undefined,
      scopes: tokens.scope || ""
    },
    create: {
      userId: user.id,
      googleEmail: email,
      encryptedRefreshToken: encryptText(refreshToken!),
      encryptedAccessToken: tokens.access_token ? encryptText(tokens.access_token) : undefined,
      accessTokenExpiresAt: tokens.expiry_date ? new Date(tokens.expiry_date) : undefined,
      scopes: tokens.scope || ""
    }
  });

  await createSession(user.id);
  return NextResponse.redirect(new URL("/connect", request.url));
}

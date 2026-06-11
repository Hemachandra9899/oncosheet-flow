import { google } from "googleapis";
import { prisma } from "./prisma";
import { decryptText } from "./crypto";

export const GOOGLE_SCOPES = [
  "openid",
  "email",
  "profile",
  "https://www.googleapis.com/auth/drive.file",
  "https://www.googleapis.com/auth/spreadsheets",
];

export function getOAuthClient() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );
}

export async function getGoogleClientsForUser(userId: string) {
  const account = await prisma.googleAccount.findUnique({ where: { userId } });
  if (!account) throw new Error("Google account is not connected");

  const auth = getOAuthClient();
  auth.setCredentials({
    refresh_token: decryptText(account.encryptedRefreshToken),
    access_token: account.encryptedAccessToken ? decryptText(account.encryptedAccessToken) : undefined,
    expiry_date: account.accessTokenExpiresAt?.getTime()
  });

  return {
    auth,
    sheets: google.sheets({ version: "v4", auth }),
    drive: google.drive({ version: "v3", auth })
  };
}

export function extractSheetGid(input: string) {
  const match = input.match(/[?&#]gid=(\d+)/);
  return match ? Number(match[1]) : null;
}

export function extractSpreadsheetId(input: string) {
  const fromUrl = input.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/)?.[1];
  if (fromUrl) return fromUrl;
  if (/^[a-zA-Z0-9-_]{20,}$/.test(input)) return input;
  throw new Error("Invalid Google Sheet URL or spreadsheet ID");
}

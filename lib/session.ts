import crypto from "crypto";
import { cookies } from "next/headers";

const SESSION_COOKIE = "opensheet_session";
const LEGACY_SESSION_COOKIE = "oncosheet_session";
const OAUTH_STATE_COOKIE = "opensheet_oauth_state";

function secret() {
  const value = process.env.SESSION_SECRET;
  if (!value) throw new Error("SESSION_SECRET is missing");
  return value;
}

function sign(value: string) {
  return crypto.createHmac("sha256", secret()).update(value).digest("base64url");
}

export async function createSession(userId: string) {
  const token = `${userId}.${sign(userId)}`;
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30
  });
}

export async function getUserIdFromSession() {
  const store = await cookies();

  const token =
    store.get(SESSION_COOKIE)?.value ||
    store.get(LEGACY_SESSION_COOKIE)?.value;

  if (!token) return null;

  const [userId, signature] = token.split(".");
  if (!userId || !signature) return null;

  return sign(userId) === signature ? userId : null;
}

export async function requireUserId() {
  const userId = await getUserIdFromSession();
  if (!userId) throw new Error("Not connected with Google");
  return userId;
}

export async function createOAuthState() {
  const state = crypto.randomBytes(24).toString("base64url");
  const store = await cookies();
  store.set(OAUTH_STATE_COOKIE, state, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 10
  });
  return state;
}

export async function verifyOAuthState(state: string | null) {
  const store = await cookies();
  const saved = store.get(OAUTH_STATE_COOKIE)?.value;
  store.delete(OAUTH_STATE_COOKIE);
  return Boolean(state && saved && state === saved);
}

export async function clearSession() {
  const store = await cookies();

  store.delete(SESSION_COOKIE);
  store.delete(LEGACY_SESSION_COOKIE);
}

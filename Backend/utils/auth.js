import { createHash, randomBytes, scryptSync, timingSafeEqual } from "crypto";

export const SESSION_COOKIE = "deepgpt_session";
export const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export const normalizeEmail = (email = "") => email.trim().toLowerCase();

export const hashPassword = (password) => {
  const salt = randomBytes(16).toString("hex");
  const hashed = scryptSync(password, salt, 64).toString("hex");

  return `${salt}:${hashed}`;
};

export const verifyPassword = (password, storedHash) => {
  const [salt, originalHash] = storedHash.split(":");

  if (!salt || !originalHash) {
    return false;
  }

  const derivedHash = scryptSync(password, salt, 64);
  const originalBuffer = Buffer.from(originalHash, "hex");

  if (derivedHash.length !== originalBuffer.length) {
    return false;
  }

  return timingSafeEqual(derivedHash, originalBuffer);
};

export const createSessionToken = () => randomBytes(32).toString("hex");

export const hashSessionToken = (token) =>
  createHash("sha256").update(token).digest("hex");

export const parseBearerToken = (authorizationHeader = "") => {
  const [scheme, token] = authorizationHeader.trim().split(/\s+/, 2);

  if (!scheme || !token || scheme.toLowerCase() !== "bearer") {
    return "";
  }

  return token.trim();
};

export const getSessionTokenFromRequest = (req) => {
  const cookies = parseCookies(req.headers.cookie);
  return cookies[SESSION_COOKIE] || parseBearerToken(req.headers.authorization) || "";
};

export const parseCookies = (cookieHeader = "") =>
  cookieHeader
    .split(";")
    .map((pair) => pair.trim())
    .filter(Boolean)
    .reduce((cookies, pair) => {
      const separatorIndex = pair.indexOf("=");

      if (separatorIndex === -1) {
        return cookies;
      }

      const key = pair.slice(0, separatorIndex).trim();
      const value = pair.slice(separatorIndex + 1).trim();

      cookies[key] = decodeURIComponent(value);
      return cookies;
    }, {});

import express from "express";
import User from "../models/User.js";
import Session from "../models/Session.js";
import { requireAuth } from "../middleware/auth.js";
import {
  SESSION_COOKIE,
  SESSION_TTL_MS,
  createSessionToken,
  hashPassword,
  hashSessionToken,
  normalizeEmail,
  parseCookies,
  verifyPassword,
} from "../utils/auth.js";

const router = express.Router();
const isProduction = process.env.NODE_ENV === "production";

const buildCookieOptions = () => ({
  httpOnly: true,
  sameSite: isProduction ? "none" : "lax",
  secure: isProduction,
  maxAge: SESSION_TTL_MS,
  path: "/",
});

const setSessionCookie = (res, token) => {
  const options = buildCookieOptions();
  res.cookie(SESSION_COOKIE, token, options);
};

const clearSessionCookie = (res) => {
  res.clearCookie(SESSION_COOKIE, {
    httpOnly: true,
    sameSite: isProduction ? "none" : "lax",
    secure: isProduction,
    path: "/",
  });
};

const createSession = async (userId) => {
  const token = createSessionToken();
  const tokenHash = hashSessionToken(token);

  await Session.create({
    userId,
    tokenHash,
    expiresAt: new Date(Date.now() + SESSION_TTL_MS),
  });

  return token;
};

router.post("/signup", async (req, res) => {
  try {
    const name = req.body?.name?.trim();
    const email = normalizeEmail(req.body?.email);
    const password = req.body?.password || "";

    if (!name || !email || password.length < 6) {
      return res.status(400).json({
        message: "Name, email, and a password of at least 6 characters are required",
      });
    }

    const existingUser = await User.findOne({ email }).lean();

    if (existingUser) {
      return res.status(409).json({ message: "An account already exists with this email" });
    }

    const user = await User.create({
      name,
      email,
      passwordHash: hashPassword(password),
    });

    const token = await createSession(user._id);
    setSessionCookie(res, token);

    res.status(201).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ message: "Unable to create account" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const identifier = (req.body?.identifier || req.body?.email || "").trim();
    const password = req.body?.password || "";

    if (!identifier || !password) {
      return res.status(400).json({ message: "Username or email and password are required" });
    }

    const normalizedEmail = normalizeEmail(identifier);
    const user = await User.findOne({
      $or: [{ email: normalizedEmail }, { name: identifier }],
    });

    if (!user || !verifyPassword(password, user.passwordHash)) {
      return res.status(401).json({ message: "Invalid username, email, or password" });
    }

    const token = await createSession(user._id);
    setSessionCookie(res, token);

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Unable to log in" });
  }
});

router.post("/logout", async (req, res) => {
  try {
    const cookies = parseCookies(req.headers.cookie);
    const token = cookies[SESSION_COOKIE];

    if (token) {
      await Session.findOneAndDelete({ tokenHash: hashSessionToken(token) });
    }

    clearSessionCookie(res);
    res.json({ message: "Logged out" });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ message: "Unable to log out" });
  }
});

router.get("/me", requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).lean();

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Load current user error:", error);
    res.status(500).json({ message: "Unable to load current user" });
  }
});

export default router;

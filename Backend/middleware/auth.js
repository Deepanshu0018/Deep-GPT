import Session from "../models/Session.js";
import { SESSION_COOKIE, hashSessionToken, parseCookies } from "../utils/auth.js";

export const requireAuth = async (req, res, next) => {
  try {
    const cookies = parseCookies(req.headers.cookie);
    const token = cookies[SESSION_COOKIE];

    if (!token) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const tokenHash = hashSessionToken(token);
    const session = await Session.findOne({
      tokenHash,
      expiresAt: { $gt: new Date() },
    }).lean();

    if (!session) {
      return res.status(401).json({ message: "Session expired. Please log in again." });
    }

    req.user = {
      id: session.userId.toString(),
      sessionId: session._id.toString(),
    };

    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    res.status(500).json({ message: "Authentication failed" });
  }
};

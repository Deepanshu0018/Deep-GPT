import express from "express";
import cors from "cors";
import "dotenv/config";
import mongoose from "mongoose";
import chatRoutes from "./routes/chat.js";
import authRoutes from "./routes/auth.js";
import seedAdmin from "./utils/seedAdmin.js";

const app = express();
const PORT = process.env.PORT || 8080;

// ✅ Allowed origins
const allowedOrigins = [
  ...String(process.env.FRONTEND_URL || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
  "http://localhost:5173",
  "http://127.0.0.1:5173",
].map((origin) => origin.replace(/\/+$/, ""));

// ✅ Middleware
app.use(express.json());

// ✅ CORS (fixed + safer + debug-friendly)
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);

      const normalizedOrigin = origin.replace(/\/+$/, "");

      if (allowedOrigins.includes(normalizedOrigin)) {
        return callback(null, true);
      }

      console.error("❌ CORS blocked:", origin);
      return callback(new Error(`Origin ${origin} not allowed`));
    },
    credentials: true,
  }),
);

// ✅ Routes
app.use("/api/auth", authRoutes);
app.use("/api", chatRoutes);

// ✅ Health check
app.get("/", (req, res) => res.send("🚀 Server is working"));

// ❗ OPTIONAL: catch unknown routes (prevents HTML response confusion)
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// ❗ GLOBAL ERROR HANDLER (VERY IMPORTANT)
app.use((err, req, res, next) => {
  console.error("🔥 Server Error:", err.message);
  res.status(500).json({ message: err.message || "Server error" });
});

// ✅ Database
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.ATLASDB_URL);
    console.log(`[${new Date().toLocaleString()}] Database connected`);
  } catch (err) {
    console.error("DB connection failed:", err.message);
    process.exit(1);
  }
};

// ✅ Start server
const start = async () => {
  await connectDB();
  await seedAdmin();

  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
};

start();

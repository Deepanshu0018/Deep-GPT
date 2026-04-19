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
  "http://localhost:5174",
  "http://127.0.0.1:5174",
];

// ✅ CORS (fixed + safer + debug-friendly)
app.use(
  cors({
    origin: true, // Allow all origins (temporary debug)
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

// ✅ Middleware
app.use(express.json());

// ✅ Debug middleware - log all requests
app.use((req, res, next) => {
  console.log(
    `[${new Date().toISOString()}] ${req.method} ${req.path} - Origin: ${req.get("origin")}`,
  );
  next();
});

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

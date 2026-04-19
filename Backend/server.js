import express from "express";
import cors from "cors";
import "dotenv/config";
import mongoose from "mongoose";
import chatRoutes from "./routes/chat.js";
import authRoutes from "./routes/auth.js";
import seedAdmin from "./utils/seedAdmin.js";

const app = express();
const PORT = process.env.PORT || 8080;
const allowedOrigins = [
  ...String(process.env.FRONTEND_URL || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
  "http://localhost:5173",
  "http://127.0.0.1:5173",
].map((origin) => origin.replace(/\/+$/, ""));

// middleware
app.use(express.json());
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) {
        callback(null, true);
        return;
      }

      const normalizedOrigin = origin.replace(/\/+$/, "");

      if (allowedOrigins.includes(normalizedOrigin)) {
        callback(null, true);
        return;
      }

      callback(new Error(`Origin ${origin} is not allowed by CORS`));
    },
    credentials: true,
  }),
);

// Auth route
app.use("/api/auth", authRoutes);

// Chat route
app.use("/api", chatRoutes);
// route
app.get("/", (req, res) => res.send("🚀 Server is working"));

//Database connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.ATLASDB_URL);
    console.log(`[${new Date().toLocaleString()}] Database connected`);
  } catch (err) {
    console.error(
      `[${new Date().toLocaleString()}] Database connection failed:`,
      err.message,
    );
    process.exit(1);
  }
};

//Start server
const start = async () => {
  await connectDB();
  await seedAdmin();

  app.listen(PORT, () =>
    console.log(
      `[${new Date().toLocaleString()}] Server running at http://localhost:${PORT}`,
    ),
  );
};

start();

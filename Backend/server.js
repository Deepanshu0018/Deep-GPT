import express from "express";
import cors from "cors";
import "dotenv/config";
import mongoose from "mongoose";
import chatRoutes from "./routes/chat.js";
import authRoutes from "./routes/auth.js";
import seedAdmin from "./utils/seedAdmin.js";

const app = express();
const PORT = process.env.PORT || 8080;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

// middleware
app.use(express.json());
app.use(
  cors({
    origin: FRONTEND_URL,
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

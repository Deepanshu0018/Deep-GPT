import express from "express";
import Thread from "../models/Thread.js";
import getOpenAI from "../utils/openai.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

router.use(requireAuth);

//GET ALL THREADS

router.get("/thread", async (req, res) => {
  try {
    const threads = await Thread.find({ userId: req.user.id }).sort({ updatedAt: -1 });
    res.json(threads);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server Error" });
  }
});

//GET THREAD BY ID

router.get("/thread/:threadId", async (req, res) => {
  try {
    const { threadId } = req.params;

    const thread = await Thread.findOne({ threadId, userId: req.user.id });

    if (!thread) {
      return res.status(404).json({ message: "Thread not found" });
    }

    res.json(thread);
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server Error" });
  }
});

//DELETE THREAD

router.delete("/thread/:threadId", async (req, res) => {
  try {
    const { threadId } = req.params;

    const deletedThread = await Thread.findOneAndDelete({
      threadId,
      userId: req.user.id,
    });

    if (!deletedThread) {
      return res.status(404).json({ message: "Thread not found" });
    }

    res.json({ message: "Thread deleted successfully" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server Error" });
  }
});

router.post("/chat", async (req, res) => {
  try {
    const { threadId, message } = req.body;

    if (!threadId || !message || message.trim() === "") {
      return res.status(400).json({
        message: "Valid threadId and non-empty message required",
      });
    }

    let thread = await Thread.findOne({ threadId });
    if (thread && thread.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "You do not have access to this thread" });
    }

    if (!thread) {
      thread = new Thread({
        userId: req.user.id,
        threadId,
        title: message.slice(0, 30),
        messages: [],
      });
    }

    const userMessage = {
      role: "user",
      content: message.trim(),
    };

    thread.messages.push(userMessage);

    const messages = thread.messages
      .filter((msg) => msg.content && msg.content.trim() !== "")
      .map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

    if (messages.length === 0) {
      return res.status(400).json({
        message: "No valid messages to send",
      });
    }

    let assistantReply;
    try {
      assistantReply = await getOpenAI(messages);
    } catch (err) {
      console.error("OpenAI Error:", err);
      return res.status(500).json({
        message: "AI failed to respond",
      });
    }

    thread.messages.push({
      role: "assistant",
      content: assistantReply,
    });

    thread.updatedAt = new Date();

    await thread.save();

    res.json({
      reply: assistantReply,
      thread,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Server Error" });
  }
});

export default router;

import "./ChatWindow.css";
import Chat from "./Chat.jsx";
import { MyContext } from "./MyContext.jsx";
import { useContext, useState } from "react";
import { ScaleLoader } from "react-spinners";
import { apiFetch } from "./api.js";

function ChatWindow() {
  const {
    prompt,
    setPrompt,
    currThreadId,
    setMessages,
    setNewChat,
    setAllThreads,
    user,
    setUser,
    resetChatState
  } = useContext(MyContext);

  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // 🔥 SEND MESSAGE FUNCTION
  const getReply = async () => {
    if (!prompt.trim()) return;

    const messageToSend = prompt.trim();

    setLoading(true);
    setNewChat(false);

    // Add user message
    const userMsg = { role: "user", content: messageToSend };
    setMessages(prev => [...prev, userMsg]);
    setPrompt("");

    try {
      const response = await apiFetch("/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          message: messageToSend,
          threadId: currThreadId
        })
      });

      const res = await response.json();

      if (!response.ok) {
        throw new Error(res.message || "Failed to get reply");
      }

      // Add bot reply
      const assistantMsg = {
        role: "assistant",
        content: res.reply || "No reply received."
      };

      setMessages(prev => [...prev, assistantMsg]);

      if (res.thread?.threadId) {
        setAllThreads((prev) => {
          const nextThread = {
            threadId: res.thread.threadId,
            title: res.thread.title || "New Chat",
            updatedAt: res.thread.updatedAt,
            preview: assistantMsg.content
          };

          const remainingThreads = prev.filter(
            (thread) => thread.threadId !== res.thread.threadId
          );

          return [nextThread, ...remainingThreads];
        });
      }

    } catch (err) {
      console.error("API Error:", err);
      setMessages(prev => [
        ...prev,
        {
          role: "assistant",
          content: err.message || "Something went wrong while getting a reply."
        }
      ]);
      setNewChat(prev => prev && false);
    }

    setLoading(false);
  };

  const handleProfileClick = () => {
    setIsOpen(prev => !prev);
  };

  const handleLogout = async () => {
    try {
      await apiFetch("/auth/logout", { method: "POST" });
    } catch (error) {
      console.error("Logout error:", error);
    }

    setIsOpen(false);
    resetChatState();
    setUser(null);
  };

  return (
    <div className="chatWindow">

      {/* 🔝 NAVBAR */}
      <div className="navbar">
        <span>
          DeepGPT <i className="fa-solid fa-chevron-down"></i>
        </span>

        <div className="userIconDiv" onClick={handleProfileClick}>
          <span className="userIcon">
            {user?.name?.[0]?.toUpperCase() || <i className="fa-solid fa-user"></i>}
          </span>
        </div>
      </div>

      {/* 🔽 DROPDOWN */}
      {isOpen && (
        <div className="dropDown">
          <div className="dropDownItem">
            <i className="fa-solid fa-gear"></i> Settings
          </div>
          <div className="dropDownItem">
            <i className="fa-solid fa-cloud-arrow-up"></i> Upgrade plan
          </div>
          <div className="dropDownItem" onClick={handleLogout}>
            <i className="fa-solid fa-arrow-right-from-bracket"></i> Log out
          </div>
        </div>
      )}

      {/* 💬 CHAT CONTENT */}
      <div className="chatContent">
        <Chat />
      </div>

      {/* ⏳ LOADER */}
      {loading && (
        <div className="loader">
          <ScaleLoader color="#ffffff" height={15} />
        </div>
      )}

      {/* ✍️ INPUT */}
      <div className="chatInput">
        <div className="inputBox">
          <input
            type="text"
            placeholder="Ask anything"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && getReply()}
          />

          <div id="submit" onClick={getReply}>
            <i className="fa-solid fa-paper-plane"></i>
          </div>
        </div>

        <p className="info">
          DeepGPT can make mistakes. Check important info.
        </p>
      </div>
    </div>
  );
}

export default ChatWindow;

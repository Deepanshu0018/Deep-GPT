import "./Chat.css";
import React, { useContext, useState, useEffect, useRef } from "react";
import { MyContext } from "./MyContext";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import "highlight.js/styles/github-dark.css";

function Chat() {
  const { newChat, messages = [] } = useContext(MyContext);

  const [latestReply, setLatestReply] = useState(null);
  const bottomRef = useRef(null); // 🔥 for auto scroll

  // 🔥 Typing effect
  useEffect(() => {
    if (!messages.length) {
      setLatestReply(null);
      return;
    }

    const lastMessage = messages[messages.length - 1];

    if (lastMessage.role !== "assistant") {
      setLatestReply(null);
      return;
    }

    const words = lastMessage.content.split(" ");
    let idx = 0;

    const interval = setInterval(() => {
      setLatestReply(words.slice(0, idx + 1).join(" "));
      idx++;

      if (idx >= words.length) clearInterval(interval);
    }, 30);

    return () => clearInterval(interval);
  }, [messages]);

  // 🔥 Auto scroll to bottom (fixes scrollbar issue)
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, latestReply]);

  return (
    <div className="chats">

      {/* 🔥 Show heading ONLY when no messages */}
      {messages.length === 0 && newChat && (
        <div className="emptyState">
          <p className="emptyStateEyebrow">DeepGPT</p>
          <h1>Start chatting</h1>
          <p className="emptyStateText">Ask anything.</p>
        </div>
      )}

      {/* 🔥 Render messages */}
      {messages.map((chat, idx) => {
        const isLast = idx === messages.length - 1;
        const isAssistant = chat.role === "assistant";

        return (
          <div
            className={chat.role === "user" ? "userDiv" : "gptDiv"}
            key={idx}
          >
            {chat.role === "user" ? (
              <p className="userMessage">{chat.content}</p>
            ) : (
              <ReactMarkdown rehypePlugins={[rehypeHighlight]}>
                {isLast && isAssistant && latestReply
                  ? latestReply
                  : chat.content}
              </ReactMarkdown>
            )}
          </div>
        );
      })}

      {/* 🔥 invisible div for scroll */}
      <div ref={bottomRef}></div>
    </div>
  );
}

export default Chat;

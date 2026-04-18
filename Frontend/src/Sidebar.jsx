import "./Sidebar.css";
import { useContext, useEffect } from "react";
import { MyContext } from "./MyContext.jsx";
import { v1 as uuidv1 } from "uuid";
import { apiFetch } from "./api.js";

const formatThreadTitle = (title) => {
    if (!title?.trim()) {
        return "Untitled Chat";
    }

    return title.length > 28 ? `${title.slice(0, 28)}...` : title;
};

function Sidebar() {
    const {
        allThreads,
        setAllThreads,
        currThreadId,
        setNewChat,
        setPrompt,
        setMessages,
        setCurrThreadId,
        setIsLoading
    } = useContext(MyContext);

    // 🔹 Fetch all threads (only once on load)
    const getAllThreads = async () => {
        try {
            const response = await apiFetch("/thread");
            const res = await response.json();

            if (!response.ok) {
                throw new Error(res.message || "Failed to load threads");
            }

            const filteredData = res.map(thread => ({
                threadId: thread.threadId,
                title: thread.title,
                updatedAt: thread.updatedAt,
                preview: thread.messages?.[thread.messages.length - 1]?.content || ""
            }));

            setAllThreads(filteredData);
        } catch (err) {
            console.log(err);
        }
    };

    useEffect(() => {
        getAllThreads();
    }, []); // ✅ FIXED: removed currThreadId dependency


    // 🔹 Create New Chat
    const createNewChat = () => {
        const newId = uuidv1();

        setNewChat(true);
        setPrompt("");
        setMessages([]);
        setCurrThreadId(newId);
        setIsLoading(false);
        setAllThreads((prev) => prev.filter((thread) => thread.title !== "New Chat"));
    };


    // 🔹 Switch Thread
    const changeThread = async (newThreadId) => {
        setCurrThreadId(newThreadId);

        try {
            const response = await apiFetch(`/thread/${newThreadId}`);
            const res = await response.json();

            if (!response.ok) {
                throw new Error(res.message || "Failed to load thread");
            }

            const threadMessages = Array.isArray(res?.messages) ? res.messages : [];

            setMessages(threadMessages);
            setPrompt("");
            setNewChat(threadMessages.length === 0);

            setAllThreads((prev) =>
                prev.map((thread) =>
                    thread.threadId === newThreadId
                        ? {
                            ...thread,
                            title: res.title || thread.title,
                            preview: threadMessages[threadMessages.length - 1]?.content || thread.preview,
                            updatedAt: res.updatedAt || thread.updatedAt
                        }
                        : thread
                )
            );
        } catch (err) {
            console.log(err);
        }
    };


    // 🔹 Delete Thread
    const deleteThread = async (threadId) => {
        const threadToDelete = allThreads.find((thread) => thread.threadId === threadId);
        const isDraftThread = threadToDelete?.title === "New Chat";

        try {
            if (!isDraftThread) {
                const response = await apiFetch(`/thread/${threadId}`, {
                    method: "DELETE"
                });

                const res = await response.json();

                if (!response.ok) {
                    throw new Error(res.message || "Failed to delete thread");
                }
            }

            // ✅ Remove from UI instantly
            setAllThreads(prev =>
                prev.filter(thread => thread.threadId !== threadId)
            );

            // ✅ If current thread deleted → start new chat
            if (threadId === currThreadId) {
                createNewChat();
            }

        } catch (err) {
            console.log(err);
        }
    };


    return (
        <section className="sidebar">

            {/* 🔹 New Chat Button */}
            <button className="newChatButton" onClick={createNewChat}>
                <div className="newChatLabel">
                    <img
                        src="src/assets/blacklogo.png"
                        alt="gpt logo"
                        className="logo"
                    />
                    <div className="newChatText">
                        <strong>New chat</strong>
                        <small>Start a fresh conversation</small>
                    </div>
                </div>
                <span>
                    <i className="fa-solid fa-pen-to-square"></i>
                </span>
            </button>


            {/* 🔹 Chat History */}
            <div className="historySection">
                <div className="historyHeading">
                    <span>Recent Chats</span>
                    <small>{allThreads?.length || 0}</small>
                </div>

            <ul className="history">
                {allThreads?.length === 0 && (
                    <li className="historyEmpty">
                        Your previous chats will appear here.
                    </li>
                )}
                {allThreads?.map((thread) => (
                    <li
                        key={thread.threadId} // ✅ FIXED key
                        onClick={() => changeThread(thread.threadId)}
                        className={
                            thread.threadId === currThreadId
                                ? "highlighted"
                                : ""
                        }
                    >
                        <div className="threadInfo">
                            <div className="threadTitleRow">
                                <span className="threadTitle">{formatThreadTitle(thread.title)}</span>
                            </div>
                            <p className="threadPreview">
                                {thread.preview?.trim() || "Open this conversation"}
                            </p>
                        </div>

                        <button
                            type="button"
                            className="threadDeleteButton"
                            onClick={(e) => {
                                e.stopPropagation(); // prevent switching thread
                                deleteThread(thread.threadId);
                            }}
                            aria-label={`Delete ${thread.title || "thread"}`}
                        >
                            <i className="fa-solid fa-trash"></i>
                        </button>
                    </li>
                ))}
            </ul>
            </div>


            {/* 🔹 Footer */}
            <div className="sign">
                <p>
                    By <span className="name">DeepanshuGupta</span> ♥
                </p>
            </div>

        </section>
    );
}

export default Sidebar;

import './App.css';
import Sidebar from "./Sidebar.jsx";
import ChatWindow from "./ChatWindow.jsx";
import { MyContext } from "./MyContext.jsx";
import { useEffect, useState } from 'react';
import { v1 as uuidv1 } from "uuid";
import AuthPage from "./AuthPage.jsx";
import { apiFetch, clearSessionToken } from "./api.js";

function App() {
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState([]);
  const [currThreadId, setCurrThreadId] = useState(uuidv1());
  const [newChat, setNewChat] = useState(true);
  const [allThreads, setAllThreads] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // ✅ Load current user on app start
  useEffect(() => {
    let isMounted = true;

    const loadCurrentUser = async () => {
      try {
        const data = await apiFetch("/api/auth/me");

        if (!isMounted) return;

        setUser(data.user);

      } catch (error) {
        // ✅ Handle 401 silently (normal case)
        if (error.message === "Authentication required") {
          setUser(null);
        } else {
          console.error("Auth error:", error);
          clearSessionToken();
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setAuthLoading(false);
        }
      }
    };

    loadCurrentUser();

    return () => {
      isMounted = false;
    };
  }, []);

  // ✅ Reset chat state after login/logout
  const resetChatState = () => {
    setPrompt("");
    setMessages([]);
    setCurrThreadId(uuidv1());
    setNewChat(true);
    setAllThreads([]);
    setIsLoading(false);
  };

  // ✅ After successful login/signup
  const handleAuthSuccess = (nextUser) => {
    setUser(nextUser);
    resetChatState();
  };

  const providerValues = {
    prompt, setPrompt,
    messages, setMessages,
    currThreadId, setCurrThreadId,
    newChat, setNewChat,
    allThreads, setAllThreads,
    isLoading, setIsLoading,
    user, setUser,
    resetChatState,
  };

  // ⏳ Loading screen
  if (authLoading) {
    return (
      <div className="appLoader">
        <p>Loading...</p>
      </div>
    );
  }

  // 🔐 Not logged in → show auth page
  if (!user) {
    return <AuthPage onAuthSuccess={handleAuthSuccess} />;
  }

  // 💬 Main app
  return (
    <div className='app'>
      <MyContext.Provider value={providerValues}>
        <Sidebar />
        <ChatWindow />
      </MyContext.Provider>
    </div>
  );
}

export default App;
import './App.css';
import Sidebar from "./Sidebar.jsx";
import ChatWindow from "./ChatWindow.jsx";
import { MyContext } from "./MyContext.jsx";
import { useEffect, useState } from 'react';
import { v1 as uuidv1 } from "uuid";
import AuthPage from "./AuthPage.jsx";
import { apiFetch } from "./api.js";

function App() {
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState([]);
  const [currThreadId, setCurrThreadId] = useState(uuidv1());
  const [newChat, setNewChat] = useState(true);
  const [allThreads, setAllThreads] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadCurrentUser = async () => {
      try {
        const response = await apiFetch("/auth/me");

        if (!isMounted) {
          return;
        }

        if (response.status === 401) {
          setUser(null);
          setAuthLoading(false);
          return;
        }

        const res = await response.json();

        if (!response.ok) {
          throw new Error(res.message || "Unable to load session");
        }

        setUser(res.user);
      } catch (error) {
        console.error("Auth bootstrap error:", error);
        setUser(null);
      }

      if (isMounted) {
        setAuthLoading(false);
      }
    };

    loadCurrentUser();

    return () => {
      isMounted = false;
    };
  }, []);

  const resetChatState = () => {
    setPrompt("");
    setMessages([]);
    setCurrThreadId(uuidv1());
    setNewChat(true);
    setAllThreads([]);
    setIsLoading(false);
  };

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

  if (authLoading) {
    return (
      <div className="appLoader">
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return <AuthPage onAuthSuccess={handleAuthSuccess} />;
  }

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

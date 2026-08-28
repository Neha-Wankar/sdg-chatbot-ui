import { useEffect, useRef, useState } from "react";
import ChatBot from "./components/ChatBot/ChatBot";
import Sidebar from "./components/Sidebar/Sidebar";
import LoginPage from "./pages/LoginPage/LoginPage";
import { isAuthenticated, logout } from "./auth/authService/authService";
import { useConversationHistory } from "./hooks/useConversationHistory";

const initialMessage = {
  id: "welcome",
  role: "bot",
  text: "Hello! I'm the Synthetic Data Generator. Describe your business requirement and I'll find the closest business scenarios. After you select a scenario, we'll work through its process steps and I'll ask for information only when a step requires it."
};

const newConvId = () => `conv-${Date.now()}-${Math.random().toString(16).slice(2)}`;

export default function App() {
  const [authenticated, setAuthenticated] = useState(isAuthenticated());
  const [messages, setMessages] = useState([initialMessage]);
  const [conversationId, setConversationId] = useState(newConvId);
  const { history, saveConversation, deleteConversation } = useConversationHistory();

  // Track whether the current conversation was loaded from history (to avoid
  // re-saving the very first welcome-only state as a new entry).
  const loadedFromHistory = useRef(false);

  const handleLogout = () => {
    logout();
    setAuthenticated(false);
    setMessages([initialMessage]);
    setConversationId(newConvId());
    loadedFromHistory.current = false;
  };

  const resetConversation = () => {
    setMessages([initialMessage]);
    setConversationId(newConvId());
    loadedFromHistory.current = false;
  };

  // Load a saved conversation from the sidebar history list.
  const loadConversation = (saved) => {
    setMessages(saved.messages);
    setConversationId(saved.id);
    loadedFromHistory.current = true;
  };

  // Auto-save the active conversation whenever messages change.
  useEffect(() => {
    saveConversation(conversationId, messages);
  }, [conversationId, messages, saveConversation]);

  if (!authenticated) return <LoginPage onLogin={() => setAuthenticated(true)} />;

  return (
    <div className="flex w-full h-dvh min-h-0 overflow-hidden">
      <Sidebar
        onNewConversation={resetConversation}
        onLogout={handleLogout}
        history={history}
        activeConversationId={conversationId}
        onLoadConversation={loadConversation}
        onDeleteConversation={deleteConversation}
      />
      <ChatBot
        messages={messages}
        setMessages={setMessages}
        conversationId={conversationId}
      />
    </div>
  );
}

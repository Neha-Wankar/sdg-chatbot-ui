import { useState } from "react";
import ChatBot from "./components/ChatBot/ChatBot";
import Sidebar from "./components/Sidebar/Sidebar";
import LoginPage from "./pages/LoginPage/LoginPage";
import { isAuthenticated, logout } from "./auth/authService/authService";
import "./App.css";

const initialMessage = {
  id: "welcome",
  role: "bot",
  text: "Hello! I’m the Synthetic Data Generator. Describe your business requirement and I’ll find the closest business scenarios. After you select a scenario, we’ll work through its process steps and I’ll ask for information only when a step requires it."
};

export default function App() {
  const [authenticated, setAuthenticated] = useState(isAuthenticated());
  const [messages, setMessages] = useState([initialMessage]);
  const [conversationId, setConversationId] = useState(0);

  const handleLogout = () => {
    logout();
    setAuthenticated(false);
    setMessages([initialMessage]);
  };

  const resetConversation = () => {
    setMessages([initialMessage]);
    setConversationId((current) => current + 1);
  };

  if (!authenticated) return <LoginPage onLogin={() => setAuthenticated(true)} />;

  return <div className="app-shell d-flex min-vh-100"><Sidebar onNewConversation={resetConversation} onLogout={handleLogout} /><ChatBot messages={messages} setMessages={setMessages} conversationId={conversationId} /></div>;
}

import { useEffect, useState } from "react";
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

const emptySap = { source: null, sourceLandscape: null, target: null, targetLandscape: null };
const newConvId = () => `conv-${Date.now()}-${Math.random().toString(16).slice(2)}`;

export default function App() {
  const [authenticated, setAuthenticated] = useState(isAuthenticated());

  // ── Conversation identity ─────────────────────────────────────────────────
  const [conversationId, setConversationId] = useState(newConvId);
  const [messages, setMessages] = useState([initialMessage]);

  // ── ChatBot phase & workflow state — lifted here so they can be persisted
  // and restored when the user clicks a past conversation in the sidebar. ────
  const [phase, setPhase] = useState("idle");
  const [workflow, setWorkflow] = useState(null);
  const [workflowSubmitted, setWorkflowSubmitted] = useState(false);
  const [sapSelection, setSapSelection] = useState(emptySap);

  const { history, saveConversation, deleteConversation } = useConversationHistory();

  // ── Persistence: auto-save on every state change ─────────────────────────
  useEffect(() => {
    saveConversation(conversationId, messages, {
      phase,
      workflow,
      workflowSubmitted,
      sapSelection,
    });
  }, [conversationId, messages, phase, workflow, workflowSubmitted, sapSelection, saveConversation]);

  // ── Conversation management ───────────────────────────────────────────────
  const resetConversation = () => {
    setConversationId(newConvId());
    setMessages([initialMessage]);
    setPhase("idle");
    setWorkflow(null);
    setWorkflowSubmitted(false);
    setSapSelection(emptySap);
  };

  const handleLogout = () => {
    logout();
    setAuthenticated(false);
    resetConversation();
  };

  // Restore a saved conversation — messages AND all phase/workflow state.
  const loadConversation = (saved) => {
    setConversationId(saved.id);
    setMessages(saved.messages ?? [initialMessage]);
    setPhase(saved.phase ?? "idle");
    setWorkflow(saved.workflow ?? null);
    setWorkflowSubmitted(saved.workflowSubmitted ?? false);
    setSapSelection(saved.sapSelection ?? emptySap);
  };

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
        phase={phase}
        setPhase={setPhase}
        workflow={workflow}
        setWorkflow={setWorkflow}
        workflowSubmitted={workflowSubmitted}
        setWorkflowSubmitted={setWorkflowSubmitted}
        sapSelection={sapSelection}
        setSapSelection={setSapSelection}
      />
    </div>
  );
}

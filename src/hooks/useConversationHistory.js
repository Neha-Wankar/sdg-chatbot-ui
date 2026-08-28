import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "sdg_conversation_history";
const MAX_CONVERSATIONS = 50;

function loadHistory() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveHistory(history) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  } catch {
    // Storage quota exceeded or unavailable — fail silently.
  }
}

/**
 * Manages the persisted list of past conversations.
 *
 * Returns:
 *   history          — array of { id, title, createdAt, messages }
 *   saveConversation — upsert the active conversation snapshot
 *   deleteConversation — remove one entry by id
 *   clearHistory     — wipe everything
 */
export function useConversationHistory() {
  const [history, setHistory] = useState(loadHistory);

  // Sync to localStorage whenever history changes.
  useEffect(() => {
    saveHistory(history);
  }, [history]);

  const saveConversation = useCallback((id, messages) => {
    // Only persist conversations that have at least one user message.
    const hasUserMessage = messages.some((m) => m.role === "user");
    if (!hasUserMessage) return;

    // Derive a title from the first user message.
    const firstUserMsg = messages.find((m) => m.role === "user");
    const title = firstUserMsg
      ? String(firstUserMsg.text).slice(0, 72)
      : "Conversation";

    setHistory((prev) => {
      const exists = prev.find((c) => c.id === id);
      let updated;
      if (exists) {
        updated = prev.map((c) =>
          c.id === id ? { ...c, title, messages } : c
        );
      } else {
        const newEntry = {
          id,
          title,
          createdAt: new Date().toISOString(),
          messages,
        };
        // Newest first; cap at MAX_CONVERSATIONS.
        updated = [newEntry, ...prev].slice(0, MAX_CONVERSATIONS);
      }
      return updated;
    });
  }, []);

  const deleteConversation = useCallback((id) => {
    setHistory((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  return { history, saveConversation, deleteConversation, clearHistory };
}

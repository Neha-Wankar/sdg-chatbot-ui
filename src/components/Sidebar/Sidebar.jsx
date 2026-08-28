import "./Sidebar.css";

/** Format a stored ISO timestamp into a short relative label. */
function relativeDate(isoString) {
  try {
    const diff = Date.now() - new Date(isoString).getTime();
    const minutes = Math.floor(diff / 60_000);
    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return new Date(isoString).toLocaleDateString(undefined, { month: "short", day: "numeric" });
  } catch {
    return "";
  }
}

export default function Sidebar({
  onNewConversation,
  onLogout,
  history = [],
  activeConversationId,
  onLoadConversation,
  onDeleteConversation,
}) {
  return (
    <aside className="flex flex-col shrink-0 h-dvh overflow-hidden sidebar-responsive bg-brand-dark">
      {/* Brand header */}
      <div className="flex items-center gap-3 px-4 py-4 sidebar-full border-b border-white/10">
        <div className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center shrink-0 ring-1 ring-white/20">
          <img
            src="/ibm-logo.png"
            alt="IBM"
            className="w-7 h-7 object-contain rounded-lg"
          />
        </div>
        <div className="sidebar-label min-w-0">
          <strong className="block text-sm font-bold text-white tracking-tight leading-tight">SDG</strong>
          <span className="text-[11px] text-white/50 leading-tight block truncate">Synthetic Data Generator</span>
        </div>
      </div>

      {/* Nav body */}
      <div className="flex-1 flex flex-col min-h-0 overflow-y-auto p-3 gap-1">
        {/* New conversation */}
        <button
          onClick={onNewConversation}
          className="flex items-center gap-2.5 w-full px-3 py-2.5 mb-2 rounded-xl border border-white/20 text-sm text-white text-left transition-all hover:bg-white/10 hover:border-white/30 active:scale-[0.98] group"
        >
          <span className="w-7 h-7 rounded-lg bg-white/10 group-hover:bg-white/20 flex items-center justify-center shrink-0 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          </span>
          <span className="sidebar-label text-sm font-medium">New conversation</span>
        </button>

        {/* Workspace section */}
        <div className="sidebar-label text-[10px] font-bold uppercase text-white/35 px-2 mb-1 mt-2 tracking-widest workspace-label">
          Workspace
        </div>

        {/* Saved conversation history */}
        {history.length === 0 ? (
          <div className="sidebar-label px-3 py-2 text-xs text-white/30 italic">
            No saved conversations yet.
          </div>
        ) : (
          <div className="flex flex-col gap-0.5">
            {history.map((conv) => {
              const isActive = conv.id === activeConversationId;
              return (
                <div
                  key={conv.id}
                  className={`group flex items-center gap-2 w-full px-3 py-2 rounded-xl text-left transition-colors cursor-pointer ${
                    isActive
                      ? "bg-white/15 text-white"
                      : "text-white/60 hover:bg-white/8 hover:text-white/90"
                  }`}
                  onClick={() => onLoadConversation?.(conv)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === "Enter" && onLoadConversation?.(conv)}
                  title={conv.title}
                >
                  {/* Chat bubble icon */}
                  <span className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-white/50 group-hover:text-white/80 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </span>

                  {/* Title + timestamp */}
                  <div className="sidebar-label flex-1 min-w-0 overflow-hidden">
                    <div className="text-xs font-medium leading-snug truncate">{conv.title}</div>
                    <div className="text-[10px] text-white/35 leading-tight">{relativeDate(conv.createdAt)}</div>
                  </div>

                  {/* Delete button — only visible on hover */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteConversation?.(conv.id);
                    }}
                    className="sidebar-label shrink-0 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-lg hover:bg-white/15 text-white/40 hover:text-white/80"
                    title="Delete"
                    aria-label="Delete conversation"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-white/10 flex flex-col gap-2">
        {/* How it works blurb */}
        <div className="sidebar-label px-3 py-3 rounded-xl bg-white/5 border border-white/8 mb-1">
          <div className="flex items-center gap-1.5 mb-1.5">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 text-brand-300 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <strong className="text-white text-xs font-semibold">How it works</strong>
          </div>
          <p className="text-[11px] leading-relaxed text-white/45">
            Describe a business requirement. The assistant maps it to approved scenarios, data sources and execution artifacts.
          </p>
        </div>

        {/* Sign out */}
        <button
          onClick={onLogout}
          className="flex items-center gap-2.5 w-full px-3 py-2.5 rounded-xl border border-white/15 text-sm text-white/70 text-left transition-all hover:bg-white/8 hover:text-white hover:border-white/25 active:scale-[0.98] group"
        >
          <span className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-white/50 group-hover:text-white/80 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v1" />
            </svg>
          </span>
          <span className="sidebar-label text-sm font-medium">Sign out</span>
        </button>
      </div>
    </aside>
  );
}

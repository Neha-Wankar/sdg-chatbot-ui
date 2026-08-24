import "./Sidebar.css";

export default function Sidebar({ onNewConversation, onLogout }) {
  return (
    <aside
      className="flex flex-col shrink-0 h-dvh overflow-hidden p-3 text-white sidebar-responsive"
      style={{ background: "rgb(47 74 114)" }}
    >
      {/* Brand */}
      <div className="flex items-center gap-2 px-1 pb-5 sidebar-full">
        <img
          src="/ibm-logo.png"
          alt="IBM"
          className="w-10 h-10 rounded-full bg-white object-contain p-1 shrink-0"
        />
        <div className="sidebar-label">
          <strong className="block text-sm">SDG</strong>
          <span className="text-xs text-white/50">Synthetic Data Generator</span>
        </div>
      </div>

      {/* New conversation */}
      <button
        onClick={onNewConversation}
        className="flex items-center gap-2 w-full px-3 py-2 mb-5 rounded-lg border border-white/30 text-sm text-white text-left transition hover:bg-white/10 hover:border-white/50"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
        <span className="sidebar-label">New conversation</span>
      </button>

      {/* Workspace label */}
      <div className="sidebar-label text-xs font-bold uppercase text-white/40 px-1 mb-2 tracking-widest workspace-label">
        Workspace
      </div>

      {/* Search history */}
      <button className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-left transition text-white/70 hover:bg-white/10 hover:text-white">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
        </svg>
        <span className="sidebar-label">Search history</span>
      </button>

      {/* How it works */}
      <div
        className="sidebar-label mt-auto pt-4 mb-4 text-xs text-white/50"
        style={{ borderTop: "1px solid rgba(255,255,255,.12)" }}
      >
        <strong className="text-white block mb-1">How it works</strong>
        <p className="leading-relaxed">
          Describe a business requirement. The assistant searches approved knowledge sources and maps it to business scenarios, data sources and execution artifacts.
        </p>
      </div>

      {/* Sign out */}
      <button
        onClick={onLogout}
        className="flex items-center gap-2 w-full px-3 py-2 rounded-lg border border-white/30 text-sm text-white text-left transition hover:bg-white/10 hover:border-white/50"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v1" />
        </svg>
        <span className="sidebar-label">Sign out</span>
      </button>
    </aside>
  );
}

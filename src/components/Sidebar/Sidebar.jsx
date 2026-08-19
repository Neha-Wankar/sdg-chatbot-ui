import "./Sidebar.css";

export default function Sidebar({ onNewConversation, onLogout }) {
  return (
    <aside className="sidebar-shell text-white p-3 d-flex flex-column flex-shrink-0">
      <div className="d-flex align-items-center gap-2 px-1 pb-4">
        <div className="sidebar-brand-logo rounded-circle bg-white text-dark d-flex align-items-center justify-content-center fw-bold">S</div>
        <div className="sidebar-label">
          <strong className="d-block">SDG</strong>
          <span className="text-white-50 small">Synthetic Data Generator</span>
        </div>
      </div>

      <button className="btn btn-outline-light text-start mb-4" onClick={onNewConversation}>
        <i className="bi bi-plus-lg me-2" />
        <span className="sidebar-label">New conversation</span>
      </button>

      <div className="workspace-label text-white-50 text-uppercase small fw-bold mb-2">Workspace</div>
      {/* <button className="sidebar-item active border-0 rounded w-100 text-start px-3 py-2 bg-transparent">
        <i className="bi bi-circle-half me-2" /> <span className="sidebar-label">Scenario Mapping</span>
      </button> */}
      <button className="sidebar-item border-0 rounded w-100 text-start px-3 py-2 bg-transparent">
        <i className="bi bi-search me-2" /> <span className="sidebar-label">Search history</span>
      </button>

      <div className="sidebar-help mt-auto pt-3 mb-3 text-white-50 small">
        <strong className="text-white">How it works</strong>
        <p className="mb-0 mt-1">Describe a business requirement. The assistant searches approved knowledge sources and maps it to business scenarios, data sources and execution artifacts.</p>
      </div>

      <button className="btn btn-outline-light text-start" onClick={onLogout}>
        <i className="bi bi-box-arrow-right me-2" />
        <span className="sidebar-label">Sign out</span>
      </button>
    </aside>
  );
}

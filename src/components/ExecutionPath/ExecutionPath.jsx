export default function ExecutionPath({ execution }) { 
    return <section className="border-top p-4">
        <div className="d-flex gap-3">
            <span className="fw-bold text-secondary small">03</span>
            <div className="flex-grow-1">
                <h3 className="h6 mb-1">Execution path</h3>
                <small className="text-secondary">ART script / API identified for downstream execution</small>
                <div className="row g-2 mt-3">
                    <div className="col-md-6">
                        <div className="border rounded-3 p-3 h-100 bg-body-tertiary">
                            <small className="text-secondary d-block mb-2">PRIMARY</small>
                            <span className={`badge rounded-pill ${execution.available ? "text-bg-success" : "text-bg-warning"}`}>{execution.status || "Unknown"}</span>
                            <strong className="d-block small mt-2">{execution.type || "Not available"}</strong>
                            <span className="text-secondary small">{execution.name || "No artifact identified"}</span>
                        </div>
                    </div>
                    {execution.fallback && (
                        <div className="col-md-6">
                            <div className="border rounded-3 p-3 h-100">
                                <small className="text-secondary d-block mb-2">FALLBACK</small>
                                <span className="badge rounded-pill text-bg-secondary">{execution.fallback.type}</span>
                                <strong className="d-block small mt-2">{execution.fallback.type}</strong>
                                <span className="text-secondary small">{execution.fallback.name}</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    </section>;
}

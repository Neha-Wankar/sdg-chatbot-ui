function StatusBadge({ status }) {
    return <span className={`badge rounded-pill ${status === "Preferred" ? "text-bg-success" : "text-bg-warning"}`}>{status}</span>;

}
export default function DataSources({ sources }) {
    return <section className="border-top p-4">
        <div className="d-flex gap-3">
            <span className="fw-bold text-secondary small">02</span>
            <div className="flex-grow-1">
                <h3 className="h6 mb-1">Data sources</h3>
                <small className="text-secondary">Snowflake is shown first when available</small>
                <div className="mt-3">
                    {sources.map((source, i) => (
                        <div className="d-flex align-items-center gap-3 border rounded-3 p-2 mb-2" key={`${source.name}-${i}`}>
                            <div className="source-icon rounded-2 bg-body-secondary d-flex align-items-center justify-content-center small fw-bold">
                                {source.type === "Snowflake" ? "SF" : "SAP"}
                            </div>
                            <div className="flex-grow-1">
                                <strong className="d-block small">{source.name}</strong>
                                <small className="text-secondary">{source.type}</small>
                            </div>
                            <StatusBadge status={source.status} />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    </section>;
}

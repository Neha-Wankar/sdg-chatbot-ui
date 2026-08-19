import DataSources from "../DataSources/DataSources";
import ExecutionPath from "../ExecutionPath/ExecutionPath";
import "./WorkflowCard.css";

function ActionButton({ children, onClick, loading }) {
  return (
    <button className="btn btn-primary workflow-action-btn" disabled={loading} onClick={onClick}>
      {loading ? (<>
        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
        Processing...
      </>) : children}
    </button>
  );
}

function PreviewTable({ data }) {
  if (!data?.preview?.length) return null;
  const columns = Object.keys(data.preview[0]);
  return (
    <div className="table-responsive border rounded-3 mt-3">
      <table className="table table-sm mb-0 align-middle">
        <thead className="table-light"><tr>{columns.map((column) => <th key={column}>{column}</th>)}</tr></thead>
        <tbody>{data.preview.map((row, index) => <tr key={index}>{columns.map((column) => <td key={column}>{String(row[column])}</td>)}</tr>)}</tbody>
      </table>
    </div>
  );
}

export default function WorkflowCard({ type, data, onContinue, loading }) {
  if (type === "scenario") {
    const confidence = Math.round((data?.scenario?.confidence || 0) * 100);
    return <div className="workflow-card bg-white border rounded-3 shadow-sm">
      <div className="p-4">
        <div className="text-uppercase small fw-bold text-secondary">01 · Describe scenario</div>
        <div className="small text-secondary mt-2">Identified Scenario: <span className="badge text-bg-light border">{data?.scenario?.name}</span></div>
        <div className="small text-secondary mt-2">NLP confidence: <strong>{confidence}%</strong></div>
        <div className="alert alert-success py-2 mt-3 mb-0 small">☑ ART template available — data will be pushed to ART.</div>
        <div className="mt-3"><DataSources sources={data?.dataSources || []} /><ExecutionPath execution={data?.execution || {}} /></div>
      </div>
      <div className="border-top p-3 d-flex flex-wrap gap-2">
        <ActionButton onClick={() => onContinue?.("scenario")} loading={loading}>Identify scenario</ActionButton>
        <ActionButton onClick={() => onContinue?.("scenarioNlp")} loading={loading}>Identify scenario with NLP</ActionButton>
      </div>
    </div>;
  }

  if (type === "steps") return <div className="workflow-card bg-white border rounded-3 shadow-sm">
    <div className="p-4">
      <div className="text-uppercase small fw-bold text-secondary">01 · Execution steps</div>
      <p className="small text-secondary mt-2">Execution steps mapped for the selected scenario.</p>
      <ol className="list-group list-group-numbered">{(data?.steps || []).map((step) => <li className="list-group-item border rounded-3 mb-2 bg-light" key={step}>{step}</li>)}</ol>
    </div>
    <div className="border-top p-3 d-flex justify-content-end"><ActionButton onClick={() => onContinue?.("steps")} loading={loading}>Pull input data <i className="bi bi-arrow-right ms-2" /></ActionButton></div>
  </div>;

  if (type === "pull") return <div className="workflow-card bg-white border rounded-3 shadow-sm">
    <div className="p-4">
      <div className="text-uppercase small fw-bold text-secondary">02 · Input data</div>
      <p className="small text-secondary mt-2 mb-2">Choose data source</p>
      <div className="d-flex flex-column gap-2 mb-3">
        <label className="form-check"><input className="form-check-input" type="radio" name={`dataSource-${data?.fileKey || "workflow"}`} defaultChecked /> <span className="form-check-label">Pull data from datalake</span></label>
        <label className="form-check"><input className="form-check-input" type="radio" name={`dataSource-${data?.fileKey || "workflow"}`} /> <span className="form-check-label">Pull data from SAP</span></label>
      </div>
      <div className="alert alert-info py-2 small">Database data will be used for testing. This is useful for development and testing without connecting to SAP.</div>
      <div className="row g-2 mt-2">
        <div className="col-6"><div className="border rounded-3 p-3"><small className="text-secondary d-block">Records</small><strong>{data?.rows}</strong></div></div>
        <div className="col-6"><div className="border rounded-3 p-3"><small className="text-secondary d-block">Columns</small><strong>{data?.columns?.length}</strong></div></div>
      </div>
      <PreviewTable data={data} />
    </div>
    <div className="border-top p-3 d-flex flex-wrap gap-2">
      <ActionButton onClick={() => onContinue?.("pullDatalake")} loading={loading}>Pull data from datalake</ActionButton>
      <ActionButton onClick={() => onContinue?.("pullSap")} loading={loading}>Pull data from SAP</ActionButton>
    </div>
  </div>;

  if (type === "identify") return <div className="workflow-card bg-white border rounded-3 shadow-sm">
    <div className="p-4">
      <div className="text-uppercase small fw-bold text-secondary">03 · Data masking</div>
      <p className="small text-secondary mt-2">Review the detected columns before masking.</p>
      <div className="table-responsive border rounded-3"><table className="table table-sm mb-0"><thead className="table-light"><tr><th>Column</th><th>Detected type</th><th>Sensitive</th><th>Masking</th></tr></thead><tbody>{(data?.reviewRows || []).map((row) => <tr key={row.column}><td className="fw-semibold">{row.column}</td><td>{row.detectedType}</td><td>{row.sensitive ? <span className="badge text-bg-warning">Yes</span> : <span className="badge text-bg-light border">No</span>}</td><td>{row.maskingRequired ? <span className="badge text-bg-danger">Required</span> : <span className="badge text-bg-light border">No</span>}</td></tr>)}</tbody></table></div>
    </div>
    <div className="border-top p-3 d-flex flex-wrap gap-2">
      <ActionButton onClick={() => onContinue?.("identifyColumns")} loading={loading}>Identify columns to mask</ActionButton>
      <ActionButton onClick={() => onContinue?.("identify")} loading={loading}>Mask data and preview</ActionButton>
    </div>
  </div>;

  if (type === "mask") return <div className="workflow-card bg-white border rounded-3 shadow-sm"><div className="p-4"><div className="text-uppercase small fw-bold text-secondary">04 · Data masking</div><div className="alert alert-success py-2 mt-3">Data masking completed successfully.</div><div className="d-flex flex-wrap gap-2 mt-3">{(data?.maskedColumns || []).map((column) => <span className="badge text-bg-warning" key={column}>{column}</span>)}</div><p className="small text-secondary mt-3 mb-0">{data?.rows} records are ready for synthetic data generation.</p></div><div className="border-top p-3 d-flex justify-content-end"><ActionButton onClick={() => onContinue?.("mask")} loading={loading}>Generate synthetic data <i className="bi bi-arrow-right ms-2" /></ActionButton></div></div>;

  if (type === "generate") return <div className="workflow-card bg-white border rounded-3 shadow-sm"><div className="p-4"><div className="text-uppercase small fw-bold text-secondary">05 · Generate synthetic data</div><h2 className="h6 mt-2">{data?.outputFilename}</h2><div className="row g-2 mt-3"><div className="col-6"><div className="border rounded-3 p-3"><small className="text-secondary d-block">Generated records</small><strong>{data?.rows}</strong></div></div><div className="col-6"><div className="border rounded-3 p-3"><small className="text-secondary d-block">Mode</small><strong>{data?.mode}</strong></div></div></div></div><div className="border-top p-3 d-flex justify-content-end"><ActionButton onClick={() => onContinue?.("generate")} loading={loading}>Push data to ART <i className="bi bi-arrow-right ms-2" /></ActionButton></div></div>;

  if (type === "push") return <div className="workflow-card bg-white border rounded-3 shadow-sm"><div className="p-4"><div className="text-uppercase small fw-bold text-success">06 · Push data to ART</div><div className="alert alert-success mt-3 mb-0">{data?.message}</div><p className="small text-secondary mt-3 mb-0">Target: {data?.target} · Execution path: {data?.api}</p></div></div>;

  return null;
}

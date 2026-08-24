import DataSources from "../DataSources/DataSources";
import ExecutionPath from "../ExecutionPath/ExecutionPath";

function ActionButton({ children, onClick, loading }) {
  return (
    <button
      className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm text-white font-medium transition hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed min-w-[210px]"
      style={{ background: "rgb(65 116 192)" }}
      disabled={loading}
      onClick={onClick}
    >
      {loading ? (
        <>
          <svg className="animate-spin h-4 w-4 text-white shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          Processing...
        </>
      ) : children}
    </button>
  );
}

function PreviewTable({ data }) {
  if (!data?.preview?.length) return null;
  const columns = Object.keys(data.preview[0]);
  return (
    <div className="overflow-x-auto border border-gray-200 rounded-xl mt-3">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>{columns.map((col) => <th key={col} className="px-3 py-2 text-left text-xs font-semibold text-gray-600 whitespace-nowrap">{col}</th>)}</tr>
        </thead>
        <tbody>
          {data.preview.map((row, i) => (
            <tr key={i} className="border-b border-gray-100 last:border-0">
              {columns.map((col) => <td key={col} className="px-3 py-2 text-gray-700 text-xs whitespace-nowrap">{String(row[col])}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function WorkflowCard({ type, data, onContinue, loading }) {

  if (type === "scenario") {
    const confidence = Math.round((data?.scenario?.confidence || 0) * 100);
    return (
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-5">
          <div className="text-xs uppercase font-bold tracking-wider text-gray-400 mb-1">01 · Describe scenario</div>
          <div className="text-xs text-gray-500 mt-1">
            Identified Scenario:{" "}
            <span className="inline-block px-2 py-0.5 bg-gray-100 border border-gray-200 rounded text-xs font-medium text-gray-700">
              {data?.scenario?.name}
            </span>
          </div>
          <div className="text-xs text-gray-500 mt-1">NLP confidence: <strong className="text-gray-800">{confidence}%</strong></div>
          <div className="flex items-center gap-2 mt-3 px-3 py-2 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-700">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            ART template available — data will be pushed to ART.
          </div>
          <div className="mt-4">
            <DataSources sources={data?.dataSources || []} />
            <ExecutionPath execution={data?.execution || {}} />
          </div>
        </div>
        <div className="border-t border-gray-100 p-4 flex flex-wrap gap-2">
          <ActionButton onClick={() => onContinue?.("scenario")} loading={loading}>Identify scenario</ActionButton>
          <ActionButton onClick={() => onContinue?.("scenarioNlp")} loading={loading}>Identify scenario with NLP</ActionButton>
        </div>
      </div>
    );
  }

  if (type === "steps") return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
      <div className="p-5">
        <div className="text-xs uppercase font-bold tracking-wider text-gray-400 mb-1">01 · Execution steps</div>
        <p className="text-xs text-gray-500 mt-1">Execution steps mapped for the selected scenario.</p>
        <ol className="flex flex-col gap-1.5 mt-3">
          {(data?.steps || []).map((step) => (
            <li key={step} className="flex items-start gap-2.5 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700">{step}</li>
          ))}
        </ol>
      </div>
      <div className="border-t border-gray-100 p-4 flex justify-end">
        <ActionButton onClick={() => onContinue?.("steps")} loading={loading}>
          Pull input data
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </ActionButton>
      </div>
    </div>
  );

  if (type === "pull") return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
      <div className="p-5">
        <div className="text-xs uppercase font-bold tracking-wider text-gray-400 mb-1">02 · Input data</div>
        <p className="text-xs text-gray-500 mt-1 mb-3">Choose data source</p>
        <div className="flex flex-col gap-2 mb-4">
          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
            <input type="radio" name={`dataSource-${data?.fileKey || "workflow"}`} defaultChecked className="accent-brand-500" />
            Pull data from datalake
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
            <input type="radio" name={`dataSource-${data?.fileKey || "workflow"}`} className="accent-brand-500" />
            Pull data from SAP
          </label>
        </div>
        <div className="flex items-start gap-2 px-3 py-2.5 rounded-lg bg-blue-50 border border-blue-200 text-xs text-blue-700">
          Database data will be used for testing. This is useful for development and testing without connecting to SAP.
        </div>
        <div className="grid grid-cols-2 gap-2 mt-3">
          <div className="border border-gray-200 rounded-xl p-3">
            <p className="text-xs text-gray-500">Records</p>
            <strong className="text-sm text-gray-900">{data?.rows}</strong>
          </div>
          <div className="border border-gray-200 rounded-xl p-3">
            <p className="text-xs text-gray-500">Columns</p>
            <strong className="text-sm text-gray-900">{data?.columns?.length}</strong>
          </div>
        </div>
        <PreviewTable data={data} />
      </div>
      <div className="border-t border-gray-100 p-4 flex flex-wrap gap-2">
        <ActionButton onClick={() => onContinue?.("pullDatalake")} loading={loading}>Pull data from datalake</ActionButton>
        <ActionButton onClick={() => onContinue?.("pullSap")} loading={loading}>Pull data from SAP</ActionButton>
      </div>
    </div>
  );

  if (type === "identify") return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
      <div className="p-5">
        <div className="text-xs uppercase font-bold tracking-wider text-gray-400 mb-1">03 · Data masking</div>
        <p className="text-xs text-gray-500 mt-1">Review the detected columns before masking.</p>
        <div className="overflow-x-auto border border-gray-200 rounded-xl mt-3">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {["Column", "Detected type", "Sensitive", "Masking"].map((h) => (
                  <th key={h} className="px-3 py-2 text-left text-xs font-semibold text-gray-600">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(data?.reviewRows || []).map((row) => (
                <tr key={row.column} className="border-b border-gray-100 last:border-0">
                  <td className="px-3 py-2 font-semibold text-xs text-gray-900">{row.column}</td>
                  <td className="px-3 py-2 text-xs text-gray-700">{row.detectedType}</td>
                  <td className="px-3 py-2">
                    {row.sensitive
                      ? <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">Yes</span>
                      : <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">No</span>}
                  </td>
                  <td className="px-3 py-2">
                    {row.maskingRequired
                      ? <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-red-100 text-red-700">Required</span>
                      : <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">No</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="border-t border-gray-100 p-4 flex flex-wrap gap-2">
        <ActionButton onClick={() => onContinue?.("identifyColumns")} loading={loading}>Identify columns to mask</ActionButton>
        <ActionButton onClick={() => onContinue?.("identify")} loading={loading}>Mask data and preview</ActionButton>
      </div>
    </div>
  );

  if (type === "mask") return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
      <div className="p-5">
        <div className="text-xs uppercase font-bold tracking-wider text-gray-400 mb-1">04 · Data masking</div>
        <div className="flex items-center gap-2 mt-3 px-3 py-2 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-700">
          Data masking completed successfully.
        </div>
        <div className="flex flex-wrap gap-1.5 mt-3">
          {(data?.maskedColumns || []).map((col) => (
            <span key={col} className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-100 text-amber-700">{col}</span>
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-3">{data?.rows} records are ready for synthetic data generation.</p>
      </div>
      <div className="border-t border-gray-100 p-4 flex justify-end">
        <ActionButton onClick={() => onContinue?.("mask")} loading={loading}>
          Generate synthetic data
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </ActionButton>
      </div>
    </div>
  );

  if (type === "generate") return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
      <div className="p-5">
        <div className="text-xs uppercase font-bold tracking-wider text-gray-400 mb-1">05 · Generate synthetic data</div>
        <h2 className="text-sm font-semibold text-gray-900 mt-2">{data?.outputFilename}</h2>
        <div className="grid grid-cols-2 gap-2 mt-3">
          <div className="border border-gray-200 rounded-xl p-3">
            <p className="text-xs text-gray-500">Generated records</p>
            <strong className="text-sm text-gray-900">{data?.rows}</strong>
          </div>
          <div className="border border-gray-200 rounded-xl p-3">
            <p className="text-xs text-gray-500">Mode</p>
            <strong className="text-sm text-gray-900">{data?.mode}</strong>
          </div>
        </div>
      </div>
      <div className="border-t border-gray-100 p-4 flex justify-end">
        <ActionButton onClick={() => onContinue?.("generate")} loading={loading}>
          Push data to ART
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </ActionButton>
      </div>
    </div>
  );

  if (type === "push") return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
      <div className="p-5">
        <div className="text-xs uppercase font-bold tracking-wider text-emerald-600 mb-1">06 · Push data to ART</div>
        <div className="flex items-center gap-2 mt-3 px-3 py-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-sm text-emerald-700">{data?.message}</div>
        <p className="text-xs text-gray-500 mt-3">Target: {data?.target} · Execution path: {data?.api}</p>
      </div>
    </div>
  );

  return null;
}

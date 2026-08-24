function StatusBadge({ status }) {
  const isPreferred = status === "Preferred";
  return (
    <span
      className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
        isPreferred
          ? "bg-emerald-100 text-emerald-700"
          : "bg-amber-100 text-amber-700"
      }`}
    >
      {status}
    </span>
  );
}

export default function DataSources({ sources }) {
  return (
    <section className="border-t border-gray-100 px-5 py-4">
      <div className="flex gap-4">
        <span className="font-bold text-gray-400 text-xs mt-0.5">02</span>
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-gray-900 mb-0.5">Data sources</h3>
          <p className="text-xs text-gray-500 mb-3">Snowflake is shown first when available</p>
          <div className="flex flex-col gap-2">
            {sources.map((source, i) => (
              <div
                key={`${source.name}-${i}`}
                className="flex items-center gap-3 border border-gray-200 rounded-xl p-2.5"
              >
                <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-600 shrink-0">
                  {source.type === "Snowflake" ? "SF" : "SAP"}
                </div>
                <div className="flex-1 min-w-0">
                  <strong className="block text-sm font-semibold text-gray-900">{source.name}</strong>
                  <span className="text-xs text-gray-500">{source.type}</span>
                </div>
                <StatusBadge status={source.status} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

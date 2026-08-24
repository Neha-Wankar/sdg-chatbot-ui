export default function ExecutionPath({ execution }) {
  return (
    <section className="border-t border-gray-100 px-5 py-4">
      <div className="flex gap-4">
        <span className="font-bold text-gray-400 text-xs mt-0.5">03</span>
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-gray-900 mb-0.5">Execution path</h3>
          <p className="text-xs text-gray-500 mb-3">ART script / API identified for downstream execution</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {/* Primary */}
            <div className="border border-gray-200 rounded-xl p-3 bg-gray-50">
              <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-2">Primary</p>
              <span
                className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                  execution.available
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-amber-100 text-amber-700"
                }`}
              >
                {execution.status || "Unknown"}
              </span>
              <strong className="block text-sm text-gray-900 mt-2">{execution.type || "Not available"}</strong>
              <span className="text-xs text-gray-500">{execution.name || "No artifact identified"}</span>
            </div>

            {/* Fallback */}
            {execution.fallback && (
              <div className="border border-gray-200 rounded-xl p-3">
                <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-2">Fallback</p>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-gray-100 text-gray-600">
                  {execution.fallback.type}
                </span>
                <strong className="block text-sm text-gray-900 mt-2">{execution.fallback.type}</strong>
                <span className="text-xs text-gray-500">{execution.fallback.name}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

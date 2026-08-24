export default function BusinessSteps({ steps }) {
  return (
    <section className="border-t border-gray-100 px-5 py-4">
      <div className="flex gap-4">
        <span className="font-bold text-gray-400 text-xs mt-0.5">01</span>
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-gray-900 mb-0.5">Business steps</h3>
          <p className="text-xs text-gray-500 mb-3">Steps mapped from the knowledge base</p>
          <ol className="flex flex-col gap-1.5">
            {steps.map((step, i) => (
              <li
                key={`${step}-${i}`}
                className="flex items-start gap-2.5 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-700"
              >
                <span className="text-xs font-bold text-gray-400 mt-px shrink-0">{String(i + 1).padStart(2, "0")}</span>
                {step}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

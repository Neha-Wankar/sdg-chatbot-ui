export default function BusinessSteps({ steps }) {
  return <section className="border-top p-4">
    <div className="d-flex gap-3">
      <span className="fw-bold text-secondary small">01</span>
      <div className="flex-grow-1">
        <h3 className="h6 mb-1">Business steps</h3>
        <small className="text-secondary">Steps mapped from the knowledge base</small>
        <ol className="list-group list-group-numbered mt-3">{steps.map((step, i) => <li className="list-group-item bg-light border rounded-3 mb-2 py-2 small" key={`${step}-${i}`}>{step}</li>)}</ol>
      </div>
    </div>
  </section>;
}

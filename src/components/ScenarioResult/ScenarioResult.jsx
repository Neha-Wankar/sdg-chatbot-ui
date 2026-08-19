import "./ScenarioResult.css";

export default function ScenarioResult({ scenarios = [], selectedId, onSelect, disabled }) {
  return (
    <div className="scenario-results mt-3">
      {/* <div className="small text-secondary mb-2">I found the following matching business scenarios. Please select one:</div> */}
      <div className="d-flex flex-column gap-2">
        {scenarios.map((scenario, index) => {
          const selected = selectedId === scenario.id;
          const parts = scenario.name.split(" > ");
          return (
            <button
              type="button"
              key={scenario.id}
              disabled={disabled}
              onClick={() => onSelect?.(scenario)}
              className={`scenario-card text-start border rounded-3 p-3 bg-white ${selected ? "selected" : ""}`}
            >
              <div className="d-flex gap-3 align-items-start">
                <span className={`scenario-number rounded-circle d-flex align-items-center justify-content-center ${selected ? "selected-number" : ""}`}>{index + 1}</span>
                <div className="flex-grow-1 min-width-0">
                  <div className="fw-semibold">{parts[0]}</div>
                  <div className="small text-secondary mt-1">{parts.slice(1).join(" → ")}</div>
                </div>
                <i className={`bi ${selected ? "bi-check-circle-fill text-success" : "bi-chevron-right text-secondary"} fs-5`} />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

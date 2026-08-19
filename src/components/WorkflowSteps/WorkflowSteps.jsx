import "./WorkflowSteps.css";

export default function WorkflowSteps({ steps = [], currentIndex = 0, completed = [] }) {
  return (
    <div className="workflow-steps mt-3">
      <div className="small text-secondary mb-2">Process steps for the selected scenario</div>
      <div className="border rounded-3 bg-white overflow-hidden">
        {steps.map((step, index) => {
          const done = completed.includes(step.id);
          const current = index === currentIndex && !done;
          return (
            <div key={step.id} className={`workflow-step d-flex gap-3 align-items-start p-3 ${current ? "current" : ""}`}>
              <div className={`step-icon rounded-circle d-flex align-items-center justify-content-center ${done ? "done" : current ? "current-icon" : ""}`}>
                {done ? <i className="bi bi-check-lg" /> : index + 1}
              </div>
              <div className="flex-grow-1">
                <div>{step.name}</div>
                {current && <div className="small text-secondary mt-1">Current step</div>}
                {step.requiresInput && <span className="badge input-badge mt-2">Input required</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

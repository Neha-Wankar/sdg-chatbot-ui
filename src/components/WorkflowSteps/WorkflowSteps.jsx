import React, { useEffect, useRef } from "react";
import DynamicStepForm from "../DynamicStepForm/DynamicStepForm";
import "./WorkflowSteps.css";

export default function WorkflowSteps({
  steps = [],
  currentStepIndex = 0,
  completedStepIds = [],
  workflowSubmitted = false,
  workflowValues = {},
  onStepContinue,
  onSubmit,
}) {
  const completed = new Set(completedStepIds);
  const activeStepRef = useRef(null);


  // useEffect(() => {
  //   if (!workflowSubmitted && activeStepRef.current) {
  //     setTimeout(() => {
  //       activeStepRef.current.scrollIntoView({
  //         behavior: "smooth",
  //         block: "nearest",
  //       });
  //     }, 100);
  //   }
  // }, [currentStepIndex, workflowSubmitted]);

  useEffect(() => {
    if (workflowSubmitted) {
      return;
    }

    const timer = setTimeout(() => {
      activeStepRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }, 50);

    return () => clearTimeout(timer);
  }, [currentStepIndex]);

  return (
    <div className="workflow-container">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <div className="fw-bold">Process Steps</div>
          <div className="small text-secondary">
            Complete the steps sequentially. You can submit at any point.
          </div>
        </div>
      </div>

      <div className="workflow-list">
        {steps.map((step, index) => {
          const isCompleted = completed.has(step.id);
          const isCurrent = !workflowSubmitted && !isCompleted && index === currentStepIndex;
          const isFuture = !workflowSubmitted && !isCompleted && index > currentStepIndex;

          return (
            <div
              key={step.id || index}
              ref={isCurrent ? activeStepRef : null}
              className={`workflow-step-card ${isCompleted ? "completed" : ""
                } ${isCurrent ? "current" : ""} ${isFuture || workflowSubmitted ? "locked" : ""
                }`}
            >
              <div className="workflow-step-number">
                {isCompleted ? <i className="bi bi-check-lg" /> : index + 1}
              </div>

              <div className="workflow-step-content">
                <div className="workflow-step-name">{step.name}</div>

                {isCompleted && (
                  <div className="small text-success mt-1">
                    <i className="bi bi-check-circle me-1" />Completed
                  </div>
                )}

                {isFuture && (
                  <div className="small text-secondary mt-1">
                    <i className="bi bi-lock-fill me-1" />Complete the previous step first
                  </div>
                )}

                {isCurrent && !step.requiresInput && (
                  <div className="workflow-current-action">
                    <div className="small text-secondary mb-2">
                      Please continue with this step.
                    </div>
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      onClick={() => onStepContinue(step, index)}
                    >
                      Continue <i className="bi bi-arrow-right ms-2" />
                    </button>
                  </div>
                )}

                {/* Current step - editable input form */}
                {isCurrent && step.requiresInput && (
                  <div className="workflow-inline-form">
                    <div className="small text-secondary mb-3">
                      Please provide the information required for this step.
                    </div>

                    <DynamicStepForm
                      step={step}
                      initialValues={workflowValues?.[step.id] || {}}
                      disabled={false}
                      onSubmit={(values) =>
                        onStepContinue(step, index, values)
                      }
                    />
                  </div>
                )}

                {/* Completed step - keep input values visible but disabled */}
                {isCompleted && step.requiresInput && (
                  <div className="workflow-inline-form mt-3">

                    <div className="small text-success mb-3">
                      <i className="bi bi-check-circle me-1" />
                      Input submitted for this step
                    </div>

                    <DynamicStepForm
                      step={step}
                      initialValues={workflowValues?.[step.id] || {}}
                      disabled={true}
                      hideSubmit={true}
                      onSubmit={() => { }}
                    />

                  </div>
                )}
              </div>

              {isCurrent && step.requiresInput && (
                <span className="badge bg-primary-subtle text-primary flex-shrink-0">
                  Input required
                </span>
              )}

              {isFuture && (
                <i className="bi bi-lock-fill text-secondary flex-shrink-0" />
              )}
            </div>
          );
        })}
      </div>

      {!workflowSubmitted && steps.length > 0 && (
        <div className="workflow-submit-area">
          <div className="small text-secondary mb-2">
            Do you want to submit the process steps?
          </div>
          <button type="button" className="btn btn-primary" onClick={onSubmit} disabled={completedStepIds.length === 0}>
            Submit <i className="bi bi-check2 ms-2" />
          </button>
        </div>
      )}

      {workflowSubmitted && (
        <>
          <div className="alert mt-4 mb-0 border-success bg-success-subtle text-success">
            Workflow submitted successfully. You can now review and configure the masking data.
          </div>
          <div className="alert alert-primary mt-4 mb-0">
            <i className="bi bi-shield-check me-2" />
            Review and configure masking data
          </div>
        </>

      )}
    </div>
  );
}

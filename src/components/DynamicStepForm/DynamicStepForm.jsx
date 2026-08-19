import { useEffect, useMemo, useState } from "react";
import "./DynamicStepForm.css";

function getInitialValues(fields, previous = {}) {
  return fields.reduce((acc, field) => {
    acc[field.name] = previous[field.name] ?? field.defaultValue ?? "";
    return acc;
  }, {});
}

export default function DynamicStepForm({ step, initialValues = {}, onSubmit, loading }) {
  const [values, setValues] = useState(() => getInitialValues(step.fields || [], initialValues));
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setValues(getInitialValues(step.fields || [], initialValues));
    setErrors({});
  }, [step.id]);

  const minDate = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const update = (name, value) => setValues((current) => ({ ...current, [name]: value }));

  const submit = (event) => {
    event.preventDefault();
    const nextErrors = {};
    (step.fields || []).forEach((field) => {
      if (field.required && !String(values[field.name] || "").trim()) nextErrors[field.name] = "This field is required.";
      if (field.type === "date" && field.futureOnly && values[field.name] && values[field.name] <= minDate) nextErrors[field.name] = "Please select a future date.";
    });
    setErrors(nextErrors);
    if (!Object.keys(nextErrors).length) onSubmit?.(values);
  };

  return (
    <form className="dynamic-step-form bg-white border rounded-3 shadow-sm mt-3" onSubmit={submit}>
      <div className="p-3 border-bottom">
        <div className="small text-uppercase fw-bold text-secondary">Input required</div>
        <div className="fw-semibold mt-1">{step.name}</div>
        <div className="small text-secondary mt-1">Please provide the following information to continue.</div>
      </div>
      <div className="p-3">
        <div className="row g-3">
          {(step.fields || []).map((field) => (
            <div className="col-12 col-md-6" key={field.name}>
              <label className="form-label small fw-semibold" htmlFor={`step-${step.id}-${field.name}`}>
                {field.label} {field.required && <span className="text-danger">*</span>}
              </label>
              <input
                id={`step-${step.id}-${field.name}`}
                className={`form-control ${errors[field.name] ? "is-invalid" : ""}`}
                type={field.type || "text"}
                value={values[field.name]}
                min={field.type === "date" && field.futureOnly ? minDate : undefined}
                onChange={(e) => update(field.name, e.target.value)}
                disabled={loading}
              />
              {errors[field.name] && <div className="invalid-feedback">{errors[field.name]}</div>}
            </div>
          ))}
        </div>
      </div>
      <div className="p-3 border-top d-flex justify-content-end">
        <button className="btn step-primary" type="submit" disabled={loading}>
          {loading ? <><span className="spinner-border spinner-border-sm me-2" />Processing...</> : <>Continue <i className="bi bi-arrow-right ms-2" /></>}
        </button>
      </div>
    </form>
  );
}

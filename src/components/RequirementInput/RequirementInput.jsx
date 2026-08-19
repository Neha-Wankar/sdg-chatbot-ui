import "./RequirementInput.css";

export default function RequirementInput({ value, disabled, onChange, onSubmit }) {
	const handleKeyDown = (event) => {
		if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); onSubmit(); }
	};

	return (
		<div className="composer mx-auto bg-white border rounded-4 shadow-sm p-2 d-flex gap-2 align-items-end">
			<textarea className="form-control border-0 shadow-none chat-input" value={value} disabled={disabled} onChange={(e) => onChange(e.target.value)} onKeyDown={handleKeyDown} placeholder="Describe your business requirement..." rows={1} />
			<button className="send-button btn rounded-3 d-flex align-items-center justify-content-center" disabled={!value.trim() || disabled} onClick={onSubmit} aria-label="Send"><i className={disabled ? "bi bi-three-dots" : "bi bi-arrow-up"} /></button>
		</div>
	);
}

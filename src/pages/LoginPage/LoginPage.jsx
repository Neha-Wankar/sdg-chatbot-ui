import { useState } from "react";
import { login } from "../../auth/authService/authService";
import "./LoginPage.css";

export default function LoginPage({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    if (!username.trim() || !password) {
      setError("Please enter both username and password.");
      return;
    }
    setIsLoading(true);
    try {
      await login(username, password);
      onLogin();
    } catch (error) {
      const detail = error?.response?.data?.detail;
      setError(Array.isArray(detail) ? detail.map((item) => item?.msg).filter(Boolean).join(" ") : detail || error?.message || "Invalid username or password.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="login-page d-flex align-items-center justify-content-center bg-light px-3">
      <div className="login-card card border shadow-sm p-4 p-md-5">
        <div className="d-flex align-items-center gap-3 mb-4">
          <div className="login-logo rounded-circle text-white d-flex align-items-center justify-content-center fw-bold fs-4">S</div>
          <div>
            <strong className="d-block fs-5">SDG</strong>
            <span className="text-secondary small">Synthetic Data Generator</span>
          </div>
        </div>

        <div className="mb-4">
          <h1 className="h3 mb-2">Welcome</h1>
          <p className="text-secondary small mb-0">Sign in to continue to the Synthetic Data Generator.</p>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="mb-3">
            <label className="form-label small fw-semibold" htmlFor="username">Username</label>
            <input className="form-control" id="username" type="text" autoComplete="username" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Enter your username" />
          </div>

          <div className="mb-3">
            <label className="form-label small fw-semibold" htmlFor="password">Password</label>
            <div className="password-field">
              <input className="form-control" id="password" type={showPassword ? "text" : "password"} autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" />
              
              <button type="button" className="password-toggle btn btn-link btn-sm" onClick={() => setShowPassword((v) => !v)}>{showPassword ? "Hide" : "Show"}</button>
            </div>
          </div>

          {error && <div className="alert alert-danger py-2 small" role="alert">{error}</div>}

          <button className="btn sign-btn w-100 py-2" type="submit" disabled={isLoading}>
            {isLoading ? (<> <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />Signing in...</>) : "Sign in"}
          </button>
        </form>
      </div>
    </main>
  );
}

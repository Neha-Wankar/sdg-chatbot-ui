import { useState } from "react";
import { login } from "../../auth/authService/authService";

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
      setError(
        Array.isArray(detail)
          ? detail.map((item) => item?.msg).filter(Boolean).join(" ")
          : detail || error?.message || "Invalid username or password."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "radial-gradient(circle at top left, #ccdcf4 0, transparent 34%), #f7f5f1" }}
    >
      <div className="w-full max-w-[420px] bg-white rounded-2xl shadow-md border border-gray-200 p-8 md:p-10">

        {/* Logo + brand */}
        <div className="flex items-center gap-3 mb-6">
          <img
            src="/ibm-logo.png"
            alt="IBM"
            className="rounded-full bg-white object-contain p-1 shrink-0"
            style={{ width: 52, height: 52 }}
          />
          <div>
            <strong className="block text-base font-semibold text-gray-900">SDG</strong>
            <span className="text-sm text-gray-500">Synthetic Data Generator</span>
          </div>
        </div>

        {/* Heading */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Welcome back</h1>
          <p className="text-sm text-gray-500">Sign in to continue to the Synthetic Data Generator.</p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          {/* Username */}
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-semibold mb-1"
              style={{ color: "rgb(69 97 139)" }}
            >
              Username
            </label>
            <input
              id="username"
              type="text"
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              className="w-full text-sm px-3 py-2 rounded-lg border border-gray-300 outline-none transition focus:border-[rgb(65_116_192)] focus:ring-2 focus:ring-[rgb(65_116_192)]/20"
            />
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-semibold mb-1"
              style={{ color: "rgb(69 97 139)" }}
            >
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full text-sm px-3 py-2 pr-16 rounded-lg border border-gray-300 outline-none transition focus:border-[rgb(65_116_192)] focus:ring-2 focus:ring-[rgb(65_116_192)]/20"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium no-underline"
                style={{ color: "rgb(65 116 192)" }}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div
              role="alert"
              className="text-sm px-3 py-2 rounded-lg bg-red-50 border border-red-200 text-red-700"
            >
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 rounded-lg text-white text-sm font-semibold transition hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            style={{ background: "rgb(65 116 192)" }}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Signing in...
              </>
            ) : "Sign in"}
          </button>
        </form>
      </div>
    </main>
  );
}

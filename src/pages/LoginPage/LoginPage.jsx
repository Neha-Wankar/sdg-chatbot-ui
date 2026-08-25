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
    <main className="min-h-screen flex items-center justify-center px-4 bg-[#f0f4f9] relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-brand-200/30 blur-3xl" />
        <div className="absolute -bottom-24 -right-24 w-80 h-80 rounded-full bg-brand-300/20 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-brand-100/20 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Card */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/80 p-8 md:p-10">

          {/* Logo + brand */}
          <div className="flex items-center gap-3.5 mb-8">
            <div className="w-13 h-13 rounded-xl bg-brand-500 flex items-center justify-center shadow-md shrink-0">
              <img
                src="/ibm-logo.png"
                alt="IBM"
                className="w-10 h-10 object-contain rounded-lg"
              />
            </div>
            <div>
              <strong className="block text-base font-bold text-gray-900 tracking-tight">SDG</strong>
              <span className="text-sm text-gray-500">Synthetic Data Generator</span>
            </div>
          </div>

          {/* Heading */}
          <div className="mb-7">
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight mb-1">Welcome back</h1>
            <p className="text-sm text-gray-500 leading-relaxed">Sign in to continue to the Synthetic Data Generator.</p>
          </div>

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {/* Username */}
            <div>
              <label htmlFor="username" className="block text-xs font-semibold mb-1.5 text-brand-700">
                Username
              </label>
              <div className="relative">
                <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <input
                  id="username"
                  type="text"
                  autoComplete="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  className="w-full text-sm pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 outline-none transition focus:bg-white focus:border-brand-400 focus:ring-3 focus:ring-brand-500/15 placeholder:text-gray-400"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-xs font-semibold mb-1.5 text-brand-700">
                Password
              </label>
              <div className="relative">
                <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full text-sm pl-9 pr-16 py-2.5 rounded-xl border border-gray-200 bg-gray-50 outline-none transition focus:bg-white focus:border-brand-400 focus:ring-3 focus:ring-brand-500/15 placeholder:text-gray-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-brand-500 hover:text-brand-600 transition"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div
                role="alert"
                className="flex items-start gap-2.5 text-sm px-3.5 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-1 py-2.5 rounded-xl text-white text-sm font-semibold transition-all bg-brand-500 hover:bg-brand-600 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm shadow-brand-500/30"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Signing in…
                </>
              ) : "Sign in"}
            </button>
          </form>

          {/* Footer note */}
          <p className="mt-6 text-center text-xs text-gray-400">
            Use your approved IBM SDG credentials to continue.
          </p>
        </div>
      </div>
    </main>
  );
}

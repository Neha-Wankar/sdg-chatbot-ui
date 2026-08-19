import { loginApi } from "../../api/authApi";

const AUTH_KEY = "sdg_authenticated";
const TOKEN_KEY = "sdg_auth_token";

const useMockAuth = String(import.meta.env.VITE_USE_MOCK_AUTH ?? "false").toLowerCase() === "true";
const demoUsername = import.meta.env.VITE_DEMO_USERNAME || "testuser";
const demoPassword = import.meta.env.VITE_DEMO_PASSWORD || "Test@123";

export async function login(username, password) {
  if (useMockAuth) {
    const valid = username.trim() === demoUsername && password === demoPassword;
    if (!valid) throw new Error("Invalid username or password.");
    sessionStorage.setItem(AUTH_KEY, "true");
    sessionStorage.setItem("sdg_username", username.trim());
    return { authenticated: true, user_id: username.trim() };
  }

  const data = await loginApi(username.trim(), password);
  sessionStorage.setItem(AUTH_KEY, "true");
  sessionStorage.setItem("sdg_username", username.trim());
  if (data?.access_token || data?.token) {
    sessionStorage.setItem(TOKEN_KEY, data.access_token || data.token);
  }
  return data;
}

export function isAuthenticated() {
  return sessionStorage.getItem(AUTH_KEY) === "true";
}

export function logout() {
  sessionStorage.removeItem(AUTH_KEY);
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem("sdg_username");
}

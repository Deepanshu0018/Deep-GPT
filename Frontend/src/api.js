// ✅ Auto-detect production based on hostname
const IS_PROD =
  window.location.hostname !== "localhost" &&
  window.location.hostname !== "127.0.0.1";

const server = IS_PROD
  ? "https://deep-gpt.onrender.com"
  : "http://localhost:8080";

// ✅ API helper (centralized fetch)
export const apiFetch = async (endpoint, options = {}) => {
  try {
    const token = localStorage.getItem("token");

    const res = await fetch(`${server}${endpoint}`, {
      method: options.method || "GET",
      headers: {
        "Content-Type": "application/json",
        ...(token && { Authorization: `Bearer ${token}` }),
        ...(options.headers || {}),
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "API Error");
    }

    return data;
  } catch (err) {
    // Only log non-401 errors
    if (!err.message.includes("required")) {
      console.error("API ERROR:", err.message);
    }
    throw err;
  }
};

// ✅ Save token (login)
export const persistSessionToken = (token) => {
  localStorage.setItem("token", token);
};

// ✅ Remove token (logout)
export const clearSessionToken = () => {
  localStorage.removeItem("token");
};

// ✅ Optional: get token (useful sometimes)
export const getSessionToken = () => {
  return localStorage.getItem("token");
};

// ✅ Default export (server URL if needed anywhere)
export default server;

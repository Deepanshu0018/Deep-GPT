const trimTrailingSlash = (value = "") => value.replace(/\/+$/, "");

const resolveApiBase = () => {
  const configuredBase = trimTrailingSlash(import.meta.env.VITE_API_BASE_URL || "");

  if (configuredBase) {
    return configuredBase;
  }

  if (typeof window === "undefined") {
    return "http://localhost:8080/api";
  }

  const { hostname, origin } = window.location;
  const isLocalHost =
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "[::1]";

  return isLocalHost ? "http://localhost:8080/api" : `${origin}/api`;
};

export const API_BASE = resolveApiBase();

export const apiFetch = (path, options = {}) => {
  const { headers = {}, ...restOptions } = options;

  return fetch(`${API_BASE}${path}`, {
    credentials: "include",
    headers,
    ...restOptions,
  }).catch((error) => {
    throw new Error(
      error?.message === "Failed to fetch"
        ? "Unable to reach the API. Check VITE_API_BASE_URL on the frontend and FRONTEND_URL on the backend."
        : error?.message || "Request failed",
    );
  });
};

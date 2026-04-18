const trimTrailingSlash = (value = "") => value.replace(/\/+$/, "");

export const API_BASE = trimTrailingSlash(
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api",
);

export const apiFetch = (path, options = {}) => {
  const { headers = {}, ...restOptions } = options;

  return fetch(`${API_BASE}${path}`, {
    credentials: "include",
    headers,
    ...restOptions,
  });
};

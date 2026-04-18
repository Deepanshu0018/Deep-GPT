export const API_BASE = "http://localhost:8080/api";

export const apiFetch = (path, options = {}) => {
  const { headers = {}, ...restOptions } = options;

  return fetch(`${API_BASE}${path}`, {
    credentials: "include",
    headers,
    ...restOptions,
  });
};

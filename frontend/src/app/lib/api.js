const rawApiBaseUrl = process.env.NEXT_PUBLIC_API || "/api/v1";
export const API_BASE_URL = rawApiBaseUrl.replace(/\/$/, "");

export async function fetchApi(url, options = {}) {
  const response = await fetch(`${API_BASE_URL}${url}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`Error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

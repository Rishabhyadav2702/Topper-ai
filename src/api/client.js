export const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";

const TOKEN_KEY = "topper_token";
const USER_KEY = "topper_user";

export const getAuthToken = () => localStorage.getItem(TOKEN_KEY);

export const getStoredUser = () => {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const setAuthSession = (data) => {
  if (data?.token) {
    localStorage.setItem(TOKEN_KEY, data.token);
  }
  localStorage.setItem(
    USER_KEY,
    JSON.stringify({
      _id: data._id,
      name: data.name,
      email: data.email,
      grade: data.grade,
      targetExam: data.targetExam,
    })
  );
};

export const clearAuthSession = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

export const apiRequest = async (path, options = {}) => {
  const token = getAuthToken();
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (token && !headers.Authorization) {
    headers.Authorization = `Bearer ${token}`;
  }

  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers,
    });
  } catch {
    throw new Error(
      "Unable to connect to server. Please ensure backend is running on http://localhost:5001"
    );
  }

  if (response.status >= 502 && response.status <= 504) {
    throw new Error(
      "Unable to connect to server. Please ensure backend is running on http://localhost:5001"
    );
  }

  let data;
  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    data = await response.json();
  } else {
    const text = await response.text();
    data = text ? { message: text } : {};
  }

  if (!response.ok) {
    if (response.status === 401 && !path.startsWith("/auth/")) {
      clearAuthSession();
    }
    throw new Error(data?.message || `Request failed (${response.status})`);
  }

  return data;
};

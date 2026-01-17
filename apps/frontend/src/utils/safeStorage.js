export const safeGetJSON = (key, fallback = null) => {
  if (typeof window === "undefined") return fallback;

  try {
    const value = localStorage.getItem(key);
    if (!value || value === "undefined") return fallback;
    return JSON.parse(value);
  } catch {
    return fallback;
  }
};

export const safeSetJSON = (key, value) => {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch { }
};

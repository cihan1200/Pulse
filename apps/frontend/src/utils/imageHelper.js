// utils/imageHelper.js

export const getImageUrl = (path) => {
  if (!path) return "";

  // 1. If it's already a full URL (like Cloudinary), return it as is.
  if (
    path.startsWith("http://") ||
    path.startsWith("https://") ||
    path.startsWith("data:")
  ) {
    return path;
  }

  // 2. Ensure path starts with a slash
  if (!path.startsWith("/")) {
    path = `/${path}`;
  }

  // 3. Use Environment Variable for the base URL
  // If you are using Vite, use import.meta.env.VITE_API_URL
  // If you are using Create React App, use process.env.REACT_APP_API_URL
  const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

  return `${BASE_URL}${path}`;
};
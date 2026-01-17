export const getImageUrl = (path) => {
  if (!path) return "";

  if (
    path.startsWith("http://") ||
    path.startsWith("https://") ||
    path.startsWith("data:")
  ) {
    return path;
  }

  if (!path.startsWith("/")) {
    path = `/${path}`;
  }

  return `http://localhost:5000${path}`;
};
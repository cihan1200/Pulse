import { safeGetJSON, safeSetJSON } from "@/utils/safeStorage";

const STORAGE_KEY = "pulse_recent_posts";
const MAX_RECENTS = 6;

const isBrowser =
  typeof window !== "undefined" &&
  typeof localStorage !== "undefined";

export const getRecentPosts = () => {
  if (!isBrowser) return [];

  const parsed = safeGetJSON(STORAGE_KEY, []);
  return Array.isArray(parsed) ? parsed : [];
};

export const addRecentPost = (post) => {
  if (!isBrowser || !post) return;

  try {
    const current = getRecentPosts();

    const newEntry = {
      _id: post?._id ?? crypto.randomUUID(),
      title: post?.postTitle ?? "Untitled",
      author: post?.postedBy?.username ?? "Unknown",
      votes: Number(post?.likesCount ?? post?.likes?.length ?? 0),
      comments: Number(post?.commentsCount ?? post?.comments?.length ?? 0),
      thumbnail:
        post?.postType === "image" &&
          Array.isArray(post?.postContent) &&
          post.postContent.length > 0
          ? post.postContent[0]
          : null,
      type: post?.postType ?? "text",
      visitedAt: new Date().toISOString()
    };

    const filtered = current.filter(
      (p) => p?._id && p._id !== newEntry._id
    );

    const updated = [newEntry, ...filtered].slice(0, MAX_RECENTS);

    safeSetJSON(STORAGE_KEY, updated);

    window.dispatchEvent(new Event("recentPostsUpdated"));
  } catch (e) {
    console.error("Error saving recent post", e);
  }
};

export const clearRecentPosts = () => {
  if (!isBrowser) return;

  localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new Event("recentPostsUpdated"));
};

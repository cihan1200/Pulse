const STORAGE_KEY = "pulse_recent_posts";
const MAX_RECENTS = 6;

export const getRecentPosts = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    return [];
  }
};

export const addRecentPost = (post) => {
  try {
    const current = getRecentPosts();
    const newEntry = {
      _id: post._id,
      title: post.postTitle,
      author: post.postedBy?.username || "Unknown",
      votes: post.likesCount || post.likes?.length || 0,
      comments: post.commentsCount || post.comments?.length || 0,
      thumbnail: post.postType === "image" ? post.postContent[0] : null,
      type: post.postType,
      visitedAt: new Date().toISOString()
    };
    const filtered = current.filter(p => p._id !== post._id);
    const updated = [newEntry, ...filtered].slice(0, MAX_RECENTS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event("recentPostsUpdated"));
  } catch (e) {
    console.error("Error saving recent post", e);
  }
};

export const clearRecentPosts = () => {
  localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new Event("recentPostsUpdated"));
};
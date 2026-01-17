import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Image as ImageIcon, FileText, Video } from "lucide-react";
import { getRecentPosts, clearRecentPosts } from "@/utils/recentManager";
import { getImageUrl } from "@/utils/imageHelper";
import styles from "./RightSidebar.module.css";

export default function RightSidebar() {
  const navigate = useNavigate();
  const [recents, setRecents] = useState([]);
  const loadRecents = () => {
    setRecents(getRecentPosts());
  };

  useEffect(() => {
    loadRecents();
    window.addEventListener("recentPostsUpdated", loadRecents);
    return () => {
      window.removeEventListener("recentPostsUpdated", loadRecents);
    };
  }, []);

  return (
    <aside className={styles["right-sidebar"]}>
      <div className={styles["header"]}>
        <span className={styles["title"]}>RECENT POSTS</span>
        {recents.length > 0 && (
          <button className={styles["clear-btn"]} onClick={clearRecentPosts}>
            Clear
          </button>
        )}
      </div>

      <div className={styles["list"]}>
        {recents.length === 0 ? (
          <p className={styles["empty-message"]}>No recent posts yet.</p>
        ) : (
          recents.map((post) => (
            <div
              key={post._id}
              className={styles["item"]}
              onClick={() => navigate(`/post/${post._id}`)}
            >
              <div className={styles["item-left"]}>
                <div className={styles["meta"]}>
                  {post.thumbnail ? (
                    <div className={styles["icon-placeholder"]}>
                      <ImageIcon size={14} />
                    </div>
                  ) : (
                    <div className={styles["icon-placeholder"]}>
                      {post.type === 'video' ? <Video size={14} /> : <FileText size={14} />}
                    </div>
                  )}
                  <span className={styles["author"]}>{post.author}</span>
                </div>

                <div className={styles["post-title"]}>
                  {post.title}
                </div>

                <div className={styles["stats"]}>
                  <span>{post.votes} upvotes</span>
                  <span>·</span>
                  <span>{post.comments} comments</span>
                </div>
              </div>
              {post.thumbnail && (
                <div className={styles["large-thumb-container"]}>
                  <img src={getImageUrl(post.thumbnail)} alt="preview" />
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </aside>
  );
}
// Home.jsx
import styles from "./Home.module.css";
import { Fragment, useEffect, useState, useRef, useCallback } from "react";
import { useSearchParams } from "react-router-dom"; // Import useSearchParams
import { formatDistanceToNow } from 'date-fns';
import Post from "@/components/Post";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import RightSidebar from "@/components/RightSidebar";
import api from "@/api/axios";

export default function Home() {
  const [searchParams] = useSearchParams(); // Get URL params
  const searchQuery = searchParams.get("search"); // Get search term

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const sortQuery = searchParams.get("sort");

  // We use a ref to track if we need to reset the list due to a new search
  const page = useRef(1);

  // Modified fetchPosts to accept reset logic
  const fetchPosts = useCallback(async (pageNum, isNewSearch = false) => {
    setLoading(true);
    try {
      const searchStr = searchQuery ? `&search=${searchQuery}` : "";
      const sortStr = sortQuery ? `&sort=${sortQuery}` : ""; // NEW

      const { data } = await api.get(`/posts?page=${pageNum}&limit=50${searchStr}${sortStr}`);

      if (data.length === 0) {
        setHasMore(false);
        if (isNewSearch) setPosts([]);
        setLoading(false);
        return;
      }

      const formattedPosts = data.map((post) => ({
        ...post,
        postContent:
          post.postType === "text"
            ? post.postContent
            : post.postContent.map((path) =>
              path.startsWith("http")
                ? path
                : `http://localhost:5000${path}`
            ),
        date: formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })
      }));

      setPosts((prev) => {
        if (isNewSearch) return formattedPosts;
        const newPosts = formattedPosts.filter(
          (newP) => !prev.some((existingP) => existingP._id === newP._id)
        );
        return [...prev, ...newPosts];
      });

      if (data.length < 50) setHasMore(false);

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, sortQuery]); // Re-create function when searchQuery changes

  // Trigger fetch when Search Query changes
  useEffect(() => {
    page.current = 1;
    setHasMore(true);
    fetchPosts(1, true);
  }, [searchQuery, sortQuery, fetchPosts]);

  // Infinite Scroll Handler
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop + 100 >=
        document.documentElement.offsetHeight
      ) {
        if (!loading && hasMore) {
          page.current += 1;
          fetchPosts(page.current, false); // Fetch next page, isNewSearch = false
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [loading, hasMore, fetchPosts]);

  return (
    <>
      <Header />
      <Sidebar />
      <RightSidebar />
      <div className={styles["feed"]}>
        {posts.length === 0 && !loading && (
          <p className={styles["message"]}>
            {searchQuery ? `No results found for "${searchQuery}"` : "No posts yet."}
          </p>
        )}

        {posts.map((item, index) => (
          <Fragment key={item._id || index}>
            <Post {...item} />
            {index < posts.length - 1 && (
              <div className={styles["divider"]}></div>
            )}
          </Fragment>
        ))}

        {loading && (
          <div className={styles["spinner-container"]}>
            <div className={styles["spinner"]}></div>
          </div>
        )}

        {!hasMore && posts.length > 0 && (
          <p className={styles["message"]}>You have reached the end.</p>
        )}
      </div>
    </>
  );
}
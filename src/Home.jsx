import { useState, useEffect } from "react";
import axios from "axios";
import "./Home.css";
import Header from "./Header";
import Post from "./Post";
import Footer from "./Footer";

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await axios.get("http://localhost:3000/posts");
        setPosts(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching posts:", error);
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <>
        <Header />
        <p className="no-post-text">There is no posts yet.</p>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      {posts.map((post, index) => {
        return (
          <Post
            key={post._id}
            index={index}
            post={post}
          />
        );
      })}
      <Footer />
    </>
  );
}
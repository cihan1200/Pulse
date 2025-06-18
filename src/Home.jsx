import { useState, useEffect } from "react";
import axios from "axios";
import Header from "./Header";
import Post from "./Post";
import Footer from "./Footer";

export default function Home() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await axios.get(`https://pulse-0o0k.onrender.com/posts`);
        setPosts(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching posts:", error);
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  const updatePost = (postId, updatedFields) => {
    setPosts(prevPosts =>
      prevPosts.map(post =>
        post._id === postId ? { ...post, ...updatedFields } : post
      )
    );
  };

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
        <div className="page-content">
          <p className="no-post-text">There is no posts yet.</p>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="page-content">
        {posts.map((post, index) => {
          return (
            <Post
              key={post._id}
              post={post}
              updatePost={updatePost}
              isLastPost={index === posts.length - 1}
            />
          );
        })}
      </div>
      <Footer />
    </>
  );
}
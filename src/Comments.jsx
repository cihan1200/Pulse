import "./Comments.css";
import { useLocation } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import { jwtDecode } from "jwt-decode";
import Header from './Header';
import Footer from './Footer';
import Post from './Post';
import axios from 'axios';

export default function Comments() {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [post, setPost] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFocused, setIsFocused] = useState(false);
  const location = useLocation();
  const postId = location.state.postId || {};
  const textareaRef = useRef(null);
  const token = localStorage.getItem("authToken");
  const userId = token ? jwtDecode(token).id : null;

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [newComment]);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/posts/${postId}`);
        setLoading(false);
        setPost(response.data.post);
        setComments(response.data.post.comments || []);
      } catch (error) {
        console.error("Error fetching post:", error);
      }
    };
    fetchPost();
  }, [postId]);

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  const handleCommentCancel = () => {
    setNewComment("");
  };

  const handleCommentSubmit = async () => {
    if (!newComment) return;
    try {
      const response = await axios.post(`http://localhost:3000/posts/${postId}/new-comment`, {
        comment: newComment,
        userId: userId,
      });
      setComments(prevComments => [...prevComments, response.data.comment]);
      setNewComment("");
    } catch (error) {
      console.error("Error submitting comment:", error);
    }
  };

  return (
    <>
      <Header />
      <Post post={post} />
      <div className="align-center">
        <div className="organize-elements">
          <p className="total-comments">Total Comments: {comments.length}</p>
        </div>
      </div>
      <div className="align-center">
        <div className={`organize-comment-input ${isFocused ? 'focused' : ''}`}>
          <img className="profile-picture-comments" src={post.postedBy.profilePicture} alt="profile" />
          <textarea className="new-comment-input" ref={textareaRef} value={newComment} onChange={(e) => setNewComment(e.target.value)} onFocus={() => setIsFocused(true)} onBlur={() => setIsFocused(false)} placeholder="Add a comment..." rows={1} />
        </div>
      </div>
      <div className="align-center">
        <div className="cancel-and-submit-buttons">
          <button className="cancel-button" onClick={handleCommentCancel}>Cancel</button>
          <button className={`submit-button ${newComment ? 'activate' : ''}`} disabled={!newComment} onClick={handleCommentSubmit}>Comment</button>
        </div>
      </div>
      <div className="align-center">
        <div className="comments-container">
          <div className="user">
            <img className="pp" src={post.postedBy.profilePicture} alt="profile-picture" />
            <span><span className="username">username</span> • date</span>
          </div>
          <p className="comment">comment</p>
        </div>
      </div>
      <Footer />
    </>
  );
}
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
  const [postLoading, setPostLoading] = useState(true);
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [userLoading, setUserLoading] = useState(true);
  const [isFocused, setIsFocused] = useState(false);
  const [user, setUser] = useState({});
  const location = useLocation();
  const postId = location.state.postId || {};
  const textareaRef = useRef(null);
  const token = localStorage.getItem("authToken");
  const userId = token ? jwtDecode(token).id : null;
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [newComment]);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await axios.get(`https://pulse-0o0k.onrender.com/posts/${postId}`);
        setPost(response.data.post);
        setPostLoading(false);
      } catch (error) {
        console.error("Error fetching post:", error);
      }
    };
    const fetchComments = async () => {
      try {
        const response = await axios.get(`https://pulse-0o0k.onrender.com/posts/${postId}/comments`);
        setComments(response.data.comments || []);
        setCommentsLoading(false);
      } catch (error) {
        console.error("Error fetching comments:", error);
      }
    };
    const fetchCurrentUser = async () => {
      try {
        const response = await axios.get(`https://pulse-0o0k.onrender.com/users/${userId}`);
        setUserLoading(false);
        setUser(response.data);
      } catch (error) {
        console.error("Error fetching current user:", error);
      }
    };
    fetchPost();
    fetchComments();
    fetchCurrentUser();
  }, [postId]);

  if (postLoading || commentsLoading || userLoading) {
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
      const response = await axios.post(`https://pulse-0o0k.onrender.com/posts/${postId}/new-comment`, {
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
      <div className="page-content">
        <Post post={post} />
        <div className="align-center">
          <div className="organize-elements">
            <p className="total-comments">Total Comments: {comments.length}</p>
          </div>
        </div>
        <div className="align-center">
          <div className={`organize-comment-input ${isFocused ? 'focused' : ''}`}>
            <img className="profile-picture-comments" src={user.profilePicture} alt="profile" />
            <textarea className="new-comment-input" ref={textareaRef} value={newComment} onChange={(e) => setNewComment(e.target.value)} onFocus={() => setIsFocused(true)} onBlur={() => setIsFocused(false)} placeholder="Add a comment..." rows={1} />
          </div>
        </div>
        <div className="align-center">
          <div className="cancel-and-submit-buttons">
            <button className="cancel-button" onClick={handleCommentCancel}>Cancel</button>
            <button className={`submit-button ${newComment ? '' : 'deactivate'}`} disabled={!newComment} onClick={handleCommentSubmit}>Comment</button>
          </div>
        </div>
        {comments.map((comment) => (
          <div className="align-center" key={comment._id}>
            <div className="comments-container">
              <div className="user">
                <img className="pp" src={comment.postedBy.profilePicture} alt="profile-picture" />
                <span><span className="username">{comment.postedBy.username}</span> • {new Date(comment.createdAt).toLocaleDateString()}</span>
              </div>
              <p className="comment">{comment.content}</p>
            </div>
          </div>
        ))}
      </div>
      <Footer />
    </>
  );
}
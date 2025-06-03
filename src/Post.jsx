import "./Post.css";
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import thumbsUpIcon from "./assets/thumbs-up-icon.svg";
import thumbsDownIcon from "./assets/thumbs-down-icon.svg";
import commentIcon from "./assets/comment-icon.svg";
import prevMediaButtonIcon from "./assets/prev-media-button-icon.svg";
import nextMediaButtonIcon from "./assets/next-media-button-icon.svg";


export default function Post({ post, index }) {
  const [likesHovered, setLikesHovered] = useState({});
  const [dislikesHovered, setDislikesHovered] = useState({});
  const [posts, setPosts] = useState([]);
  const navigate = useNavigate();
  const token = localStorage.getItem("authToken");
  const userId = token ? jwtDecode(token).id : null;
  const timeoutRef = useRef(null);
  const userPanelRef = useRef(null);
  const [mediaIndex, setMediaIndex] = useState(0);
  const medias = post.media || [];
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const postDividers = document.querySelectorAll('.post-divider');
    const lastPostDivider = postDividers[postDividers.length - 1];
    lastPostDivider.classList.add('hide');
  });

  const handleMouseEnterUserLink = () => {
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      userPanelRef.current.classList.add('active');
    }, 500);
  };

  const handleMouseLeaveUserLink = () => {
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      if (!userPanelRef.current.matches(':hover')) {
        userPanelRef.current.classList.remove('active');
      }
    }, 500);
  };

  const handleMouseEnterUserPanel = () => {
    clearTimeout(timeoutRef.current);
  };

  const handleMouseLeaveUserPanel = () => {
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      userPanelRef.current.classList.remove('active');
    }, 500);
  };

  const handleMouseEnterLikesButton = (postId) => {
    setLikesHovered(prev => ({ ...prev, [postId]: true }));
  };

  const handleMouseLeaveLikesButton = (postId) => {
    setLikesHovered(prev => ({ ...prev, [postId]: false }));
  };

  const handleMouseEnterDislikesButton = (postId) => {
    setDislikesHovered(prev => ({ ...prev, [postId]: true }));
  };

  const handleMouseLeaveDislikesButton = (postId) => {
    setDislikesHovered(prev => ({ ...prev, [postId]: false }));
  };

  const handleClickPostLikeButton = async (postId) => {
    if (!userId) {
      console.error("User ID not found");
      return;
    }
    setPosts(prevPosts =>
      prevPosts.map(post => {
        if (post._id !== postId) return post;
        const hasLiked = post.likes?.includes(userId);
        const updatedLikes = hasLiked
          ? post.likes?.filter(id => id !== userId) || []
          : [...(post.likes || []), userId];
        const updatedDislikes = post.dislikes?.filter(id => id !== userId) || [];
        return { ...post, likes: updatedLikes, dislikes: updatedDislikes };
      })
    );
    try {
      const response = await fetch(`${API_URL}/posts/${postId}/like`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      const data = await response.json();
      setPosts(prevPosts =>
        prevPosts.map(post =>
          post._id === postId
            ? { ...post, likes: data.likes, dislikes: data.dislikes }
            : post
        )
      );
    } catch (error) {
      console.error("Error liking post:", error);
    }
  };

  const handleClickPostDislikeButton = async (postId) => {
    if (!userId) {
      console.error("User ID not found");
      return;
    }
    setPosts(prevPosts =>
      prevPosts.map(post => {
        if (post._id !== postId) return post;
        const hasDisliked = post.dislikes?.includes(userId);
        const updatedDislikes = hasDisliked
          ? post.dislikes?.filter(id => id !== userId) || []
          : [...(post.dislikes || []), userId];
        const updatedLikes = post.likes?.filter(id => id !== userId) || [];
        return { ...post, likes: updatedLikes, dislikes: updatedDislikes };
      })
    );
    try {
      const response = await fetch(`${API_URL}/posts/${postId}/dislike`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      const data = await response.json();
      setPosts(prevPosts =>
        prevPosts.map(post =>
          post._id === postId
            ? { ...post, likes: data.likes, dislikes: data.dislikes }
            : post
        )
      );
    } catch (error) {
      console.error("Error disliking post:", error);
    }
  };

  const handleClickCommentButton = (postId) => {
    navigate(`/comments`, { state: { postId } });
  };

  return (
    <div className="post-container">
      <div className="user-info">
        <img className="profile-picture" src={post.postedBy?.profilePicture} alt="profile picture" />
        <div className="user-info-wrapper" onMouseEnter={handleMouseEnterUserLink} onMouseLeave={handleMouseLeaveUserLink}>
          <a className="user-name" href="#">{post.postedBy?.username}</a>
          <div className="user-panel" ref={userPanelRef} onMouseEnter={handleMouseEnterUserPanel} onMouseLeave={handleMouseLeaveUserPanel}>
            <div className="user-panel-header">
              <img className="panel-profile-picture" src={post.postedBy?.profilePicture} alt="profile picture" />
              <div className="user-stats">
                <span className="user-panel-name">{post.postedBy?.username}</span>
                <span className="follower-count">{post.postedBy?.followers.length} followers</span>
              </div>
            </div>
            <div className="user-bio">{post.postedBy?.about}</div>
            <div className="user-actions">
              <button className="follow-button">Follow</button>
            </div>
          </div>
        </div>
        <span>•</span>
        <span className="time-since-posted">{new Date(post.createdAt).toLocaleString()}</span>
      </div>
      <strong className="title-of-post">{post.title}</strong>
      <p className={`post-text ${post.type === "text" ? "" : "hide"}`}>{post.body}</p>
      <div className={`post-media-container ${post.type === "media" ? "" : "hide"}`}>
        {medias.length > 0 && (medias[mediaIndex].includes("mp4") ?
          (<video className="video" src={`http://${medias[mediaIndex]}`} controls loading="lazy" alt="Post Media" />)
          :
          (<img className="image" src={`http://${medias[mediaIndex]}`} loading="lazy" alt="Post Media" />)
        )}
        {medias.length > 1 && (
          <div className="media-navigation">
            <button className="prev-media-button" onClick={() => { setMediaIndex((prevIndex) => (prevIndex - 1 + medias.length) % medias.length); }}>
              <img src={prevMediaButtonIcon} alt="Previous media" />
            </button>
            <button className="next-media-button" onClick={() => { setMediaIndex((prevIndex) => (prevIndex + 1) % medias.length); }}>
              <img src={nextMediaButtonIcon} alt="Next media" />
            </button>
          </div>
        )}
      </div>
      <div className="post-buttons-container">
        <button className={`feedback-buttons ${likesHovered[post._id] ? 'hover-likes' : ''} ${dislikesHovered[post._id] ? 'hover-dislikes' : ''}`}>
          <div className="likes-container" onClick={() => handleClickPostLikeButton(post._id)} onMouseEnter={() => handleMouseEnterLikesButton(post._id)} onMouseLeave={() => handleMouseLeaveLikesButton(post._id)}>
            <span>{posts.find(p => p._id === post._id)?.likes?.length || 0}</span>
            <img className="thumbs-up-icon" src={thumbsUpIcon} alt="Like" />
          </div>
          <div className="dislikes-container" onClick={() => handleClickPostDislikeButton(post._id)} onMouseEnter={() => handleMouseEnterDislikesButton(post._id)} onMouseLeave={() => handleMouseLeaveDislikesButton(post._id)}>
            <span>{posts.find(p => p._id === post._id)?.dislikes?.length || 0}</span>
            <img className="thumbs-down-icon" src={thumbsDownIcon} alt="Dislike" />
          </div>
        </button>
        <button className="comments-button" onClick={() => handleClickCommentButton(post._id)}>
          <span>{post.comments.length || 0}</span>
          <img className="comment-icon" src={commentIcon} alt="comment icon" />
        </button>
      </div>
      {index !== posts.length - 1 && <hr className="post-divider" />}
    </div>
  );
}

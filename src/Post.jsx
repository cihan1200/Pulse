import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import thumbsUpIcon from "./assets/thumbs-up-icon.svg";
import thumbsDownIcon from "./assets/thumbs-down-icon.svg";
import commentIcon from "./assets/comment-icon.svg";
import prevMediaButtonIcon from "./assets/prev-media-button-icon.svg";
import nextMediaButtonIcon from "./assets/next-media-button-icon.svg";
import axios from "axios";

export default function Post({ post, updatePost, isLastPost }) {
  const [likesHovered, setLikesHovered] = useState({});
  const [dislikesHovered, setDislikesHovered] = useState({});
  const [isInteracting, setIsInteracting] = useState(false);
  const navigate = useNavigate();
  const token = localStorage.getItem("authToken");
  const userId = token ? jwtDecode(token).id : null;
  const timeoutRef = useRef(null);
  const userPanelRef = useRef(null);
  const [mediaIndex, setMediaIndex] = useState(0);
  const [followers, setFollowers] = useState(post.postedBy?.followers || []);
  const medias = post.media || [];

  useEffect(() => { }, [followers]);

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
    if (isInteracting) return;
    setIsInteracting(true);

    // Backup current state for rollback
    const prevLikes = [...post.likes];
    const prevDislikes = [...post.dislikes];

    // Optimistic update
    const alreadyLiked = post.likes.includes(userId);
    const newLikes = alreadyLiked
      ? post.likes.filter(id => id !== userId)
      : [...post.likes, userId];
    const newDislikes = post.dislikes.filter(id => id !== userId);
    updatePost(postId, { likes: newLikes, dislikes: newDislikes });

    try {
      const response = await axios.post(`https://pulse-0o0k.onrender.com/posts/${postId}/like`, { userId });
      updatePost(postId, {
        likes: response.data.likes,
        dislikes: response.data.dislikes
      });
    } catch (error) {
      console.error("Error liking post:", error);
      // Rollback to previous state
      updatePost(postId, { likes: prevLikes, dislikes: prevDislikes });
    } finally {
      setIsInteracting(false);
    }
  };

  const handleClickPostDislikeButton = async (postId) => {
    if (isInteracting) return;
    setIsInteracting(true);

    // Backup current state for rollback
    const prevLikes = [...post.likes];
    const prevDislikes = [...post.dislikes];

    // Optimistic update
    const alreadyDisliked = post.dislikes.includes(userId);
    const newDislikes = alreadyDisliked
      ? post.dislikes.filter(id => id !== userId)
      : [...post.dislikes, userId];
    const newLikes = post.likes.filter(id => id !== userId);
    updatePost(postId, { likes: newLikes, dislikes: newDislikes });

    try {
      const response = await axios.post(`https://pulse-0o0k.onrender.com/posts/${postId}/dislike`, { userId });
      updatePost(postId, {
        likes: response.data.likes,
        dislikes: response.data.dislikes
      });
    } catch (error) {
      console.error("Error disliking post:", error);
      // Rollback to previous state
      updatePost(postId, { likes: prevLikes, dislikes: prevDislikes });
    } finally {
      setIsInteracting(false);
    }
  };

  const handleClickCommentButton = (postId) => {
    navigate(`/comments`, { state: { postId } });
  };

  const handleFollowUser = async (userId) => {
    if (!token) {
      // Handle not logged in state
      return;
    }

    try {
      const response = await axios.post(`https://pulse-0o0k.onrender.com/users/${userId}/follow`, { token });
      setFollowers(response.data.followers);
    } catch (error) {
      console.error("Error following user:", error);
    }
  };

  return (
    <div className="post-container">
      <div className="user-info">
        <img className="profile-picture" src={post.postedBy?.profilePicture} alt="profile picture" />
        <div className="user-info-wrapper" onMouseEnter={handleMouseEnterUserLink} onMouseLeave={handleMouseLeaveUserLink}>
          <a className="user-name" href="#">{post.postedBy?.username}</a>
          <div className={isLastPost && post.type === "text" && post.body.length <= 800 ? `user-panel adjust-positioning` : `user-panel`} ref={userPanelRef} onMouseEnter={handleMouseEnterUserPanel} onMouseLeave={handleMouseLeaveUserPanel}>
            <div className="user-panel-header">
              <img className="panel-profile-picture" src={post.postedBy?.profilePicture} alt="profile picture" />
              <div className="user-stats">
                <span className="user-panel-name">{post.postedBy?.username}</span>
                <span className="follower-count">{followers.length} followers</span>
              </div>
            </div>
            <div className="user-bio">{post.postedBy?.about}</div>
            <div className="user-actions">
              <button className="follow-button" onClick={() => handleFollowUser(post.postedBy?.id)}>Follow</button>
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
          (<video className="video" src={`${medias[mediaIndex]}`} controls loading="lazy" alt="Post Media" />)
          :
          (<img className="image" src={`${medias[mediaIndex]}`} loading="lazy" alt="Post Media" />)
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
            <span className="like-count">{post.likes.length || 0}</span>
            <img className="thumbs-up-icon" src={thumbsUpIcon} alt="Like" />
          </div>
          <div className="dislikes-container" onClick={() => handleClickPostDislikeButton(post._id)} onMouseEnter={() => handleMouseEnterDislikesButton(post._id)} onMouseLeave={() => handleMouseLeaveDislikesButton(post._id)}>
            <span className="dislike-count">{post.dislikes.length || 0}</span>
            <img className="thumbs-down-icon" src={thumbsDownIcon} alt="Dislike" />
          </div>
        </button>
        <button className="comments-button" onClick={() => handleClickCommentButton(post._id)}>
          <span>{post.comments.length || 0}</span>
          <img className="comment-icon" src={commentIcon} alt="comment icon" />
        </button>
      </div>
      {!isLastPost && <hr className="post-divider" />}
    </div>
  );
}

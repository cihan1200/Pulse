import { useState, useRef } from 'react';
import "./Post.css";
import thumbsUpIcon from "./assets/thumbs-up-icon.svg";
import thumbsDownIcon from "./assets/thumbs-down-icon.svg";
import commentIcon from "./assets/comment-icon.svg";

export default function Post() {
  const [isLikesHovered, setIsLikesHovered] = useState(false);
  const [isDislikesHovered, setIsDislikesHovered] = useState(false);
  const [showUserPanel, setShowUserPanel] = useState(false);
  const [isMouseOverPanel, setIsMouseOverPanel] = useState(false);
  const hoverTimeout = useRef(null);
  const leaveTimeout = useRef(null);

  const handleMouseEnter = () => {
    clearTimeout(leaveTimeout.current);
    hoverTimeout.current = setTimeout(() => {
      setShowUserPanel(true);
    }, 500);
  };

  const handleMouseLeave = () => {
    clearTimeout(hoverTimeout.current);
    leaveTimeout.current = setTimeout(() => {
      if (!isMouseOverPanel) {
        setShowUserPanel(false);
      }
    }, 300);
  };

  const handlePanelMouseEnter = () => {
    clearTimeout(leaveTimeout.current);
    setIsMouseOverPanel(true);
  };

  const handlePanelMouseLeave = () => {
    setIsMouseOverPanel(false);
    leaveTimeout.current = setTimeout(() => {
      setShowUserPanel(false);
    }, 300);
  };

  return (
    <>
      <div className="post-container">
        <div className="user-info">
          <img className="profile-picture" src="https://picsum.photos/200" alt="profile picture" />
          <a className="user-name" href="" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>Username</a>
          {showUserPanel && (
            <div className="user-panel" onMouseEnter={handlePanelMouseEnter} onMouseLeave={handlePanelMouseLeave}>
              <div className="user-panel-header">
                <img className="panel-profile-picture" src="https://picsum.photos/200" alt="profile" />
                <div className="user-stats">
                  <span className="user-panel-name">Username</span>
                  <span className="follower-count">1.2k followers</span>
                </div>
              </div>
              <div className="user-bio">Lorem ipsum dolor sit amet, consectetur adipisicing elit. Quod repudiandae iure soluta facilis amet dolorem cumque laboriosam, laborum voluptatum odit velit. Eos totam ullam quos, fugit debitis quisquam nam inventore!</div>
              <div className="user-actions">
                <button className="follow-button">Follow</button>
              </div>
            </div>
          )}
          <span>•</span>
          <span className="time-since-postes">Time</span>
        </div>
        <strong className="post-title">Title</strong>
        <div className="post-media-container">
          <img className="post-media" src="https://picsum.photos/2000" loading="lazy" alt="random image" />
        </div>
        <div className="post-buttons-container">
          <button className={`feedback-buttons ${isLikesHovered ? 'hover-likes' : ''} ${isDislikesHovered ? 'hover-dislikes' : ''}`}>
            <div className="likes-container" onMouseEnter={() => setIsLikesHovered(true)} onMouseLeave={() => setIsLikesHovered(false)}>
              <span>0</span>
              <img className="thumbs-up-icon" src={thumbsUpIcon} alt="Like" />
            </div>
            <div className="dislikes-container" onMouseEnter={() => setIsDislikesHovered(true)} onMouseLeave={() => setIsDislikesHovered(false)}>
              <span>0</span>
              <img className="thumbs-down-icon" src={thumbsDownIcon} alt="Dislike" />
            </div>
          </button>
          <button className="comments-button">
            <span>0</span>
            <img className="comment-icon" src={commentIcon} alt="" />
          </button>
        </div>
      </div>
      <hr className="post-divider" />
    </>
  );
}
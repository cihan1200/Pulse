import styles from "./Post.module.css";
import { ThumbsUp, ThumbsDown, MessageCircle, ChevronLeft, ChevronRight, X, Maximize2, AlertCircle } from "lucide-react";
import { usePostLogic } from "./helpers";
import { addRecentPost } from "@/utils/recentManager";

export default function Post(props) {
  const {
    // State
    expanded, setExpanded,
    currentSlide,
    isFullscreen,
    isPanelOpen,
    likesList,
    dislikesList,
    likeAnim,
    dislikeAnim,
    toastMessage,
    isClosing,

    // Follow State (NEW)
    isFollowing,
    followerCount,

    // Computed
    isLiked,
    isDisliked,
    avatarUrl,
    currentUserId,

    // Handlers
    toggleFullscreen,
    nextSlide,
    prevSlide,
    handleUsernameEnter,
    handleUsernameLeave,
    handlePanelEnter,
    handlePanelLeave,
    handleLike,
    handleDislike,
    handleFollow, // (NEW)
    handleCommentClick,
    navigateToDetails: originalNavigate
  } = usePostLogic(props);

  const { postedBy, postContent, date, postTitle, postType, commentsCount } = props;

  const handlePostClick = (e) => {
    // Save to local storage
    addRecentPost(props);
    // Perform original navigation
    originalNavigate(e);
  };

  return (
    <>
      <article className={styles["post-container"]} onClick={handlePostClick}>

        <header className={styles["post-header"]}>
          <div className={styles["avatar-wrapper"]}>
            <img
              src={avatarUrl}
              alt="Profile"
              className={styles["avatar"]}
            />
          </div>

          {/* post info section */}
          <div>
            <h4
              className={styles["username"]}
              onMouseEnter={handleUsernameEnter}
              onMouseLeave={handleUsernameLeave}
            >
              {postedBy?.username}
            </h4>
            <span className={styles["post-date"]}>{date}</span>
          </div>

          {/* user panel section */}
          <div
            className={`${styles["detailed-info-panel"]} ${isPanelOpen ? styles["active"] : ""}`}
            onMouseEnter={handlePanelEnter}
            onMouseLeave={handlePanelLeave}
          >
            <div className={styles["user-with-follow-button"]}>
              <div className={styles["panel-pp-and-username-container"]}>
                <div className={styles["avatar-wrapper-panel"]}>
                  <img
                    src={avatarUrl}
                    alt="Profile"
                    className={styles["avatar"]}
                  />
                </div>
                <span className={styles["panel-username"]}>{postedBy?.username}</span>
              </div>

              {/* FOLLOW BUTTON LOGIC */}
              {postedBy?._id !== currentUserId && (
                <button
                  className={styles["follow-btn"]}
                  onClick={handleFollow}
                  style={isFollowing ? { backgroundColor: "#d1d5db", color: "#374151" } : {}}
                >
                  {isFollowing ? "Unfollow" : "Follow"}
                </button>
              )}
            </div>
            <i className={styles["about-user"]}>
              {postedBy?.bio}
            </i>
            <div className={styles["divider"]}></div>
            <div className={styles["followers-count"]}>
              {/* Use dynamic follower count */}
              <span className={styles["total-count"]}>{followerCount}</span>
              <br />
              <span className={styles["text"]}>Followers</span>
            </div>
          </div>
        </header>

        {/* ... Rest of the component (Image/Video logic) stays exactly the same ... */}
        <div className={styles["content-container"]}>
          {postType === "text" && (
            <>
              <span className={styles["title"]}>{postTitle}</span>
              {postContent[0].length < 500 ? (
                <span className={styles["short-text-content"]}>{postContent[0]}</span>
              ) : (
                <div className={styles["long-text-content"]}>
                  {!expanded ? (
                    <>
                      <span className={styles["short-text-content"]}>
                        {postContent[0].slice(0, 500)}...
                      </span>
                      <span
                        className={styles["toggle-long-text"]}
                        onClick={(e) => {
                          e.stopPropagation();
                          setExpanded(!expanded);
                        }}
                      >
                        Continue reading
                      </span>
                    </>
                  ) : (
                    <>
                      <span className={styles["short-text-content"]}>{postContent[0]}</span>
                      <span
                        className={styles["toggle-long-text"]}
                        onClick={(e) => {
                          e.stopPropagation();
                          setExpanded(!expanded);
                        }}
                      >
                        Show less
                      </span>
                    </>
                  )}
                </div>
              )}
            </>
          )}

          {postType === "image" && (
            <>
              <span className={styles["title"]}>{postTitle}</span>
              <div
                className={styles["image-container"]}
                onClick={toggleFullscreen}
              >
                <div className={styles["backgrounds-wrapper"]}>
                  {postContent.map((imgUrl, index) => (
                    <div
                      key={index}
                      className={`${styles["blurred-bg"]} ${currentSlide === index ? styles["active"] : ""}`}
                      style={{ "--bg-url": `url("${imgUrl}")` }}
                    />
                  ))}
                </div>
                <div
                  className={styles["slides-track"]}
                  style={{ "--slide-index": currentSlide }}
                >
                  {postContent.map((imgUrl, index) => (
                    <div key={index} className={styles["slide"]}>
                      <img
                        className={styles["image-content"]}
                        src={imgUrl}
                        alt={`slide ${index}`}
                      />
                    </div>
                  ))}
                </div>
                {postContent.length > 1 && (
                  <>
                    <button
                      className={styles["nav-button-left"]}
                      onClick={prevSlide}
                    >
                      <ChevronLeft size={24} />
                    </button>
                    <button
                      className={styles["nav-button-right"]}
                      onClick={nextSlide}
                    >
                      <ChevronRight size={24} />
                    </button>
                    <div className={styles["dots-container"]}>
                      {postContent.map((_, idx) => (
                        <div
                          key={idx}
                          className={`${styles["dot"]} ${currentSlide === idx ? styles["active"] : ""}`}
                          onClick={(e) => {
                            e.stopPropagation();
                          }}
                        />
                      ))}
                    </div>
                  </>
                )}
                <div className={styles["expand-hint"]}>
                  <Maximize2 size="1.2em" />
                </div>
              </div>
            </>
          )}

          {postType === "video" && (
            <>
              <span className={styles["title"]}>{postTitle}</span>
              {postContent.length === 1 && (
                <div onClick={(e) => e.stopPropagation()}>
                  <video
                    src={postContent[0]}
                    controls
                    className={styles["video-player"]}
                  />
                </div>
              )}
            </>
          )}
        </div>

        <div className={styles["action-buttons-container"]}>
          {/* like button */}
          <button
            className={`${styles["interaction-btn"]} ${isLiked ? styles["liked"] : ""}`}
            onClick={handleLike}
          >
            <div className={`${styles["icon-wrapper"]} ${likeAnim ? styles["animate-pop"] : ""}`}>
              <ThumbsUp size="1.3em" strokeWidth={isLiked ? 3 : 2.5} />
            </div>
            <span className={styles["count-wrapper"]}>
              {likesList.length}
            </span>
          </button>

          {/* dislike button */}
          <button
            className={`${styles["interaction-btn"]} ${isDisliked ? styles["disliked"] : ""}`}
            onClick={handleDislike}
          >
            <div className={`${styles["icon-wrapper"]} ${dislikeAnim ? styles["animate-pop"] : ""}`}>
              <ThumbsDown size="1.3em" strokeWidth={isDisliked ? 3 : 2.5} />
            </div>
            <span className={styles["count-wrapper"]}>
              {dislikesList.length}
            </span>
          </button>

          {/* comments button */}
          <button className={styles["interaction-btn"]} onClick={handleCommentClick}>
            <div className={styles["icon-wrapper"]}>
              <MessageCircle size="1.3em" strokeWidth={2.5} />
            </div>
            <span className={styles["count-wrapper"]}>
              {commentsCount}
            </span>
          </button>
        </div>

      </article>

      {toastMessage && (
        <div className={`${styles["toast-notification"]} ${isClosing ? styles["exit"] : ""}`}>
          <AlertCircle size={18} />
          {toastMessage}
        </div>
      )}

      {isFullscreen && postType === "image" && (
        <div className={styles["fullscreen-overlay"]} onClick={toggleFullscreen}>
          <button className={styles["fullscreen-close-button"]} onClick={toggleFullscreen}>
            <X size="1.4em" />
          </button>
          <div className={styles["fullscreen-track-container"]} onClick={(e) => e.stopPropagation()}>
            <div className={styles["slides-track"]} style={{ "--slide-index": currentSlide }}>
              {postContent.map((imgUrl, index) => (
                <div key={index} className={styles["fullscreen-slide"]}>
                  <img className={styles["fullscreen-image"]} src={imgUrl} alt={`full screen slide ${index}`} />
                </div>
              ))}
            </div>
          </div>
          {postContent.length > 1 && (
            <>
              <button className={styles["nav-button-left"]} onClick={prevSlide}><ChevronLeft size={48} /></button>
              <button className={styles["nav-button-right"]} onClick={nextSlide}><ChevronRight size={48} /></button>
              <div className={styles["dots-container"]}>
                {postContent.map((_, idx) => (
                  <div key={idx} className={`${styles["dot"]} ${currentSlide === idx ? styles["active"] : ""}`} onClick={(e) => e.stopPropagation()} />
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
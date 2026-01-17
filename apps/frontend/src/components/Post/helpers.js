import { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/api/axios";
import { getImageUrl } from "@/utils/imageHelper";

export const getCurrentUser = () => {
  try {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  } catch (error) {
    return null;
  }
};

export const usePostLogic = ({ _id, postedBy, postContent, likes, dislikes, isDetailsView }) => {
  const navigate = useNavigate();

  const [expanded, setExpanded] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [likesList, setLikesList] = useState(likes || []);
  const [dislikesList, setDislikesList] = useState(dislikes || []);
  const [likeAnim, setLikeAnim] = useState(false);
  const [dislikeAnim, setDislikeAnim] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [isClosing, setIsClosing] = useState(false);

  // NEW: Follow State
  // We check if the current user ID exists in the author's followers array
  const currentUserId = useMemo(() => {
    const user = getCurrentUser();
    return user?.id || user?._id;
  }, []);

  const [isFollowing, setIsFollowing] = useState(
    postedBy?.followers?.includes(currentUserId) || false
  );
  // Track follower count locally to update UI immediately
  const [followerCount, setFollowerCount] = useState(
    Array.isArray(postedBy?.followers) ? postedBy.followers.length : (postedBy?.followers || 0)
  );

  const toastTimerRef = useRef(null);
  const closeTimerRef = useRef(null);
  const hoverTimerRef = useRef(null);
  const panelCloseTimerRef = useRef(null);
  const isHoveringUsernameRef = useRef(false);
  const isHoveringPanelRef = useRef(false);

  const avatarUrl = getImageUrl(postedBy?.profilePicture) || "https://api.dicebear.com/9.x/avataaars/svg?seed=guest";
  const isLiked = likesList.includes(currentUserId);
  const isDisliked = dislikesList.includes(currentUserId);

  useEffect(() => {
    if (isFullscreen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isFullscreen]);

  // Cleanups
  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
      if (panelCloseTimerRef.current) clearTimeout(panelCloseTimerRef.current);
      if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    };
  }, []);

  const showToast = (msg) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);

    setToastMessage(msg);
    setIsClosing(false);

    toastTimerRef.current = setTimeout(() => {
      setIsClosing(true);
      closeTimerRef.current = setTimeout(() => {
        setToastMessage(null);
        setIsClosing(false);
      }, 300);
    }, 3000);
  };

  const toggleFullscreen = (e) => {
    if (e) e.stopPropagation();
    setIsFullscreen(!isFullscreen);
  };

  const nextSlide = (e) => {
    e.stopPropagation();
    setCurrentSlide((prev) => (prev === postContent.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = (e) => {
    e.stopPropagation();
    setCurrentSlide((prev) => (prev === 0 ? postContent.length - 1 : prev - 1));
  };

  // --- Hover Panel Logic ---
  const handleUsernameEnter = () => {
    isHoveringUsernameRef.current = true;
    if (panelCloseTimerRef.current) {
      clearTimeout(panelCloseTimerRef.current);
      panelCloseTimerRef.current = null;
    }
    hoverTimerRef.current = setTimeout(() => {
      if (isHoveringUsernameRef.current) {
        setIsPanelOpen(true);
      }
    }, 600);
  };

  const handleUsernameLeave = () => {
    isHoveringUsernameRef.current = false;
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }
    panelCloseTimerRef.current = setTimeout(() => {
      if (!isHoveringPanelRef.current) {
        setIsPanelOpen(false);
      }
    }, 120);
  };

  const handlePanelEnter = () => {
    isHoveringPanelRef.current = true;
    if (panelCloseTimerRef.current) {
      clearTimeout(panelCloseTimerRef.current);
      panelCloseTimerRef.current = null;
    }
    setIsPanelOpen(true);
  };

  const handlePanelLeave = () => {
    isHoveringPanelRef.current = false;
    panelCloseTimerRef.current = setTimeout(() => {
      if (!isHoveringUsernameRef.current) {
        setIsPanelOpen(false);
      }
    }, 120);
  };

  // --- Like/Dislike Logic ---
  const triggerAnimation = (type) => {
    if (type === "like") {
      setLikeAnim(true);
      setTimeout(() => setLikeAnim(false), 400);
    } else {
      setDislikeAnim(true);
      setTimeout(() => setDislikeAnim(false), 400);
    }
  };

  const handleLike = async (e) => {
    if (e) e.stopPropagation();
    if (!currentUserId) {
      showToast("Please signin first to like posts");
      return;
    }
    if (!isLiked) triggerAnimation("like");

    if (isLiked) {
      setLikesList((prev) => prev.filter((id) => id !== currentUserId));
    } else {
      setLikesList((prev) => [...prev, currentUserId]);
      setDislikesList((prev) => prev.filter((id) => id !== currentUserId));
    }

    try {
      await api.put(`/posts/${_id}/like`);
    } catch (err) {
      console.error("Failed to like post:", err);
    }
  };

  const handleDislike = async (e) => {
    if (e) e.stopPropagation();
    if (!currentUserId) {
      showToast("Please signin first to dislike posts");
      return;
    }
    if (!isDisliked) triggerAnimation("dislike");

    if (isDisliked) {
      setDislikesList((prev) => prev.filter((id) => id !== currentUserId));
    } else {
      setDislikesList((prev) => [...prev, currentUserId]);
      setLikesList((prev) => prev.filter((id) => id !== currentUserId));
    }

    try {
      await api.put(`/posts/${_id}/dislike`);
    } catch (err) {
      console.error("Failed to dislike post:", err);
    }
  };

  // --- NEW: Handle Follow Logic ---
  const handleFollow = async (e) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault(); // Good practice to keep if it might be used in other contexts
    }
    if (!currentUserId) {
      showToast("Please signin first to follow users");
      return;
    }
    if (postedBy._id === currentUserId) return; // Cannot follow self

    // Optimistic Update
    if (isFollowing) {
      setFollowerCount(prev => Math.max(0, prev - 1));
      setIsFollowing(false);
    } else {
      setFollowerCount(prev => prev + 1);
      setIsFollowing(true);
    }

    try {
      await api.put(`/users/${postedBy._id}/follow`);
    } catch (err) {
      console.error("Failed to follow user:", err);
      // Revert on error
      if (isFollowing) {
        setFollowerCount(prev => prev + 1);
        setIsFollowing(true);
      } else {
        setFollowerCount(prev => Math.max(0, prev - 1));
        setIsFollowing(false);
      }
      showToast("Failed to update follow status");
    }
  };

  const handleCommentClick = (e) => {
    if (e) e.stopPropagation();
    if (isDetailsView) return;
    navigate(`/post/${_id}`);
  };

  const navigateToDetails = () => {
    if (isDetailsView) return;
    navigate(`/post/${_id}`);
  };

  return {
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
    handleFollow, // Exported new handler
    handleCommentClick,
    navigateToDetails
  };
};
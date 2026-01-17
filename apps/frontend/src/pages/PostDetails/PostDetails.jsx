import { useReducer, useEffect, useMemo, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Send } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

import api from "@/api/axios";
import { getImageUrl } from "@/utils/imageHelper";
import { useAutoResize } from "@/hooks/useAutoResize";
import styles from "./PostDetails.module.css";

// Components
import Post from "@/components/Post";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import CommentItem from "@/components/CommentItem";
import RightSidebar from "@/components/RightSidebar";

// --- REDUCER CONFIGURATION ---
const ACTIONS = {
  FETCH_START: "FETCH_START",
  FETCH_SUCCESS: "FETCH_SUCCESS",
  FETCH_ERROR: "FETCH_ERROR",
  INPUT_CHANGE: "INPUT_CHANGE",
  SUBMIT_START: "SUBMIT_START",
  SUBMIT_SUCCESS: "SUBMIT_SUCCESS",
  SUBMIT_ERROR: "SUBMIT_ERROR",
  UPDATE_POST_DATA: "UPDATE_POST_DATA", // For child components to update state
};

/**
 * Reducer to manage the complex state of the post details page.
 * Handles fetching, user input, and submission states.
 */
function postDetailsReducer(state, action) {
  switch (action.type) {
    case ACTIONS.FETCH_START:
      return { ...state, loading: true, error: null };

    case ACTIONS.FETCH_SUCCESS:
      return { ...state, loading: false, post: action.payload };

    case ACTIONS.FETCH_ERROR:
      return { ...state, loading: false, error: action.payload };

    case ACTIONS.INPUT_CHANGE:
      return { ...state, commentText: action.payload };

    case ACTIONS.SUBMIT_START:
      return { ...state, isSubmitting: true };

    case ACTIONS.SUBMIT_SUCCESS:
      return {
        ...state,
        isSubmitting: false,
        post: action.payload, // Update post with new comment
        commentText: ""       // Reset input
      };

    case ACTIONS.SUBMIT_ERROR:
      return { ...state, isSubmitting: false };

    case ACTIONS.UPDATE_POST_DATA:
      return { ...state, post: action.payload };

    default:
      return state;
  }
}

export default function PostDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const textareaRef = useRef(null);

  // --- 1. STATE MANAGEMENT (useReducer) ---
  const [state, dispatch] = useReducer(postDetailsReducer, {
    post: null,
    loading: true,
    error: null,
    commentText: "",
    isSubmitting: false,
  });

  // --- 2. CUSTOM HOOKS ---
  // Auto-resize the main comment input based on text content
  useAutoResize(textareaRef, state.commentText);

  // --- 3. DERIVED VALUES ---
  const currentUser = useMemo(() => {
    try { return JSON.parse(localStorage.getItem("user")); }
    catch { return null; }
  }, []);
  const charCount = state.commentText.replace(/\s/g, "").length;
  const isInputValid = state.commentText.trim().length > 0 && charCount <= 2000;

  // --- 4. HELPER FUNCTIONS ---
  /**
   * Helper: Normalizes raw API data for frontend consumption.
   * Fixes image paths and formats dates.
   */
  const processPostData = (data) => ({
    ...data,
    postContent: data.postType === "text"
      ? data.postContent
      : data.postContent.map((path) =>
        path.startsWith("http") ? path : `http://localhost:5000${path}`
      ),
    date: formatDistanceToNow(new Date(data.createdAt), { addSuffix: true })
  });

  // --- 5. EFFECTS ---
  /**
   * Effect: Fetches the post data when the component mounts or ID changes.
   */
  useEffect(() => {
    const fetchPost = async () => {
      dispatch({ type: ACTIONS.FETCH_START });
      try {
        const res = await api.get(`/posts/${id}`);
        dispatch({ type: ACTIONS.FETCH_SUCCESS, payload: processPostData(res.data) });
      } catch (err) {
        console.error("Error fetching post:", err);
        dispatch({ type: ACTIONS.FETCH_ERROR, payload: "Post not found." });
      }
    };
    fetchPost();
  }, [id]);

  // --- 6. HANDLERS ---
  /**
   * Handler: Updates the comment text state on user input.
   */
  const handleInputChange = (e) => {
    dispatch({ type: ACTIONS.INPUT_CHANGE, payload: e.target.value });
  };

  /**
   * Handler: Submits a new comment to the API.
   */
  const handleCommentSubmit = async (e) => {
    if (e) e.preventDefault();

    const sanitizedText = state.commentText.trim();
    if (!sanitizedText || sanitizedText.length > 2000) return;

    dispatch({ type: ACTIONS.SUBMIT_START });
    try {
      const res = await api.post(`/posts/${id}/comment`, { text: sanitizedText });
      dispatch({ type: ACTIONS.SUBMIT_SUCCESS, payload: processPostData(res.data) });
    } catch (err) {
      console.error("Error posting comment:", err);
      dispatch({ type: ACTIONS.SUBMIT_ERROR });
    }
  };

  /**
   * Handler: Allows submitting the form by pressing Enter (without Shift).
   */
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleCommentSubmit();
    }
  };

  /**
   * Handler: Passed to child components to update the parent post state 
   * (e.g., when a comment is deleted or edited).
   */
  const handlePostUpdate = (updatedPostData) => {
    dispatch({ type: ACTIONS.UPDATE_POST_DATA, payload: updatedPostData });
  };

  // --- 7. RENDER LOGIC ---
  if (state.loading) {
    return (
      <div className={styles["loader-container"]}>
        <div className={styles["spinner"]}></div>
      </div>
    );
  }

  if (state.error || !state.post) {
    return <div className={styles["error-msg"]}>{state.error || "Post not found."}</div>;
  }

  return (
    <>
      <Header />
      <Sidebar />
      <RightSidebar />
      <div className={styles["container"]}>
        {/* --- UI SECTION: NAVIGATION HEADER --- */}
        <div className={styles["header-row"]}>
          <button onClick={() => navigate(-1)} className={styles["back-btn"]}>
            <ArrowLeft size={20} /> <span>Back</span>
          </button>
          <h2>Post Details</h2>
        </div>

        {/* --- UI SECTION: MAIN POST CONTENT --- */}
        <div className={styles["main-post-wrapper"]}>
          <Post
            {...state.post}
            commentsCount={state.post.comments.length}
            isDetailsView={true}
          />
        </div>

        {/* --- UI SECTION: OPTIONAL DESCRIPTION --- */}
        {state.post.description && state.post.postType !== "text" && (
          <div className={styles["description-section"]}>
            <h3>Description</h3>
            <p>{state.post.description}</p>
          </div>
        )}

        {/* --- UI SECTION: COMMENTS AREA --- */}
        <div className={styles["comments-section"]}>
          <h3>Comments ({state.post.comments.length})</h3>

          {/* New Comment Input Form */}
          {currentUser && (
            <div className={styles["add-comment-row"]}>
              <img
                src={getImageUrl(currentUser.profilePicture) || "https://api.dicebear.com/9.x/avataaars/svg?seed=guest"}
                alt="Current User"
                className={styles["user-avatar"]}
              />
              <div className={styles["comment-input-wrapper"]}>
                <form onSubmit={handleCommentSubmit} className={styles["input-form"]}>
                  <textarea
                    ref={textareaRef}
                    placeholder="Write a comment..."
                    value={state.commentText}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    disabled={state.isSubmitting}
                    rows={1}
                  />
                  <button
                    type="submit"
                    disabled={!isInputValid || state.isSubmitting}
                  >
                    {state.isSubmitting ? (
                      <div className={styles["btn-spinner"]}></div>
                    ) : (
                      <Send size={18} />
                    )}
                  </button>
                </form>
                <div className={`${styles["char-counter"]} ${charCount > 2000 ? styles["limit-reached"] : ""}`}>
                  {charCount}/2000
                </div>
              </div>
            </div>
          )}

          {/* List of Existing Comments */}
          <div className={styles["comments-list"]}>
            {state.post.comments.length === 0 ? (
              <p className={styles["no-comments"]}>No comments yet. Be the first!</p>
            ) : (
              [...state.post.comments].reverse().map((comment) => (
                <CommentItem
                  key={comment._id}
                  comment={comment}
                  currentUser={currentUser}
                  postId={state.post._id}
                  onPostUpdate={handlePostUpdate}
                  processPostData={processPostData}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
}
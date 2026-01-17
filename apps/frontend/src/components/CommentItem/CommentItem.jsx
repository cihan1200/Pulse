import { useReducer, useRef, useEffect } from "react";
import { MoreVertical, Pencil, Trash2, X, Check } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import api from "@/api/axios";
import { useAutoResize } from "@/hooks/useAutoResize";
import { getImageUrl } from "@/utils/imageHelper";
import styles from "./CommentItem.module.css";

const ACTIONS = {
  TOGGLE_EXPAND: "TOGGLE_EXPAND",
  START_EDITING: "START_EDITING",
  CANCEL_EDIT: "CANCEL_EDIT",
  UPDATE_TEXT: "UPDATE_TEXT",
  START_SAVING: "START_SAVING",
  FINISH_SAVING: "FINISH_SAVING",
  TOGGLE_MENU: "TOGGLE_MENU",
  CLOSE_MENU: "CLOSE_MENU",
  OPEN_DELETE_MODAL: "OPEN_DELETE_MODAL",
  CLOSE_DELETE_MODAL: "CLOSE_DELETE_MODAL",
  START_DELETING: "START_DELETING",
  DELETE_FAILED: "DELETE_FAILED",
};

function commentReducer(state, action) {
  switch (action.type) {
    case ACTIONS.TOGGLE_EXPAND:
      return { ...state, isExpanded: !state.isExpanded };
    case ACTIONS.START_EDITING:
      return {
        ...state,
        isEditing: true,
        showMenu: false,
        editText: action.payload
      };
    case ACTIONS.CANCEL_EDIT:
      return {
        ...state,
        isEditing: false,
        editText: action.payload
      };
    case ACTIONS.UPDATE_TEXT:
      return { ...state, editText: action.payload };
    case ACTIONS.START_SAVING:
      return { ...state, isSaving: true };
    case ACTIONS.FINISH_SAVING:
      return { ...state, isSaving: false, isEditing: false };
    case ACTIONS.TOGGLE_MENU:
      return { ...state, showMenu: !state.showMenu };
    case ACTIONS.CLOSE_MENU:
      return { ...state, showMenu: false };
    case ACTIONS.OPEN_DELETE_MODAL:
      return { ...state, showDeleteModal: true, showMenu: false };
    case ACTIONS.CLOSE_DELETE_MODAL:
      return { ...state, showDeleteModal: false };
    case ACTIONS.START_DELETING:
      return { ...state, isDeleting: true, showDeleteModal: false };
    case ACTIONS.DELETE_FAILED:
      return { ...state, isDeleting: false };
    default:
      return state;
  }
}

export default function CommentItem({
  comment,
  currentUser,
  postId,
  onPostUpdate,
  processPostData
}) {
  const [state, dispatch] = useReducer(commentReducer, {
    isExpanded: false,
    isEditing: false,
    editText: comment.text,
    isDeleting: false,
    isSaving: false,
    showMenu: false,
    showDeleteModal: false,
  });

  const editRef = useRef(null);
  const menuRef = useRef(null);

  useAutoResize(editRef, state.editText);

  const MAX_LENGTH = 300;
  const isLongComment = comment.text.length > MAX_LENGTH;
  const isOwner = currentUser?.id === comment.userId?._id;
  const editCharCount = state.editText.replace(/\s/g, "").length;
  const isEdited = comment.updatedAt && comment.updatedAt !== comment.createdAt;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        dispatch({ type: ACTIONS.CLOSE_MENU });
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    document.body.style.overflow = state.showDeleteModal ? "hidden" : "auto";
    return () => { document.body.style.overflow = "auto"; };
  }, [state.showDeleteModal]);

  const handleEditClick = () => {
    dispatch({ type: ACTIONS.START_EDITING, payload: comment.text });
  };

  const handleCancelClick = () => {
    dispatch({ type: ACTIONS.CANCEL_EDIT, payload: comment.text });
  };

  const handleTextChange = (e) => {
    dispatch({ type: ACTIONS.UPDATE_TEXT, payload: e.target.value });
  };

  const handleUpdate = async () => {
    const sanitizedText = state.editText.trim();
    if (!sanitizedText) return;
    if (sanitizedText.length > 2000) return;
    if (sanitizedText === comment.text) {
      handleCancelClick();
      return;
    }
    dispatch({ type: ACTIONS.START_SAVING });
    try {
      const res = await api.put(
        `/posts/${postId}/comment/${comment._id}`,
        { text: sanitizedText }
      );
      onPostUpdate(processPostData(res.data));
      dispatch({ type: ACTIONS.FINISH_SAVING });
    } catch (err) {
      console.error("Failed to update comment", err);
      dispatch({ type: ACTIONS.FINISH_SAVING });
    }
  };

  const handleDelete = async () => {
    dispatch({ type: ACTIONS.START_DELETING });
    try {
      const res = await api.delete(`/posts/${postId}/comment/${comment._id}`);
      onPostUpdate(processPostData(res.data));
    } catch (err) {
      console.error("Failed to delete comment", err);
      dispatch({ type: ACTIONS.DELETE_FAILED });
    }
  };

  const renderEditForm = () => (
    <div className={styles["edit-container"]}>
      <textarea
        ref={editRef}
        className={styles["edit-textarea"]}
        value={state.editText}
        onChange={handleTextChange}
        rows={1}
      />
      <div
        className={`${styles["char-counter"]} ${editCharCount > 2000
          ? styles["limit-reached"]
          : ""}`
        }
      >
        {editCharCount}/2000
      </div>
      <div className={styles["edit-actions"]}>
        <button
          onClick={handleCancelClick}
          className={styles["cancel-btn"]}
          disabled={state.isSaving}
        >
          <X size="1.2em" strokeWidth="3" /> Cancel
        </button>
        <button
          onClick={handleUpdate}
          className={styles["save-btn"]}
          disabled={
            state.isSaving ||
            !state.editText.trim() ||
            editCharCount > 2000
          }
        >
          <Check size="1.2em" strokeWidth="3" /> Save
        </button>
      </div>
    </div>
  );

  const renderCommentContent = () => (
    <>
      <p className={styles["comment-text"]}>
        {!state.isExpanded && isLongComment
          ? `${comment.text.slice(0, MAX_LENGTH)}... `
          : comment.text}
      </p>
      {isLongComment && (
        <span
          className={styles["toggle-comment-text"]}
          onClick={() => dispatch({ type: ACTIONS.TOGGLE_EXPAND })}
        >
          {state.isExpanded ? "Show less" : "Continue reading"}
        </span>
      )}
    </>
  );

  return (
    <>
      <div
        className={`${styles["comment-item"]} ${state.isDeleting
          ? styles["fading"]
          : ""}`
        }
      >
        <img
          src={
            getImageUrl(comment.userId?.profilePicture) ||
            "https://api.dicebear.com/9.x/avataaars/svg?seed=guest"
          }
          alt="User"
          className={styles["comment-avatar"]}
        />
        <div className={styles["comment-content"]}>
          <div className={styles["comment-header"]}>
            <div className={styles["user-info"]}>
              <span className={styles["comment-user"]}>
                {comment.userId?.username || "Unknown User"}
              </span>
              <span className={styles["comment-time"]}>
                {formatDistanceToNow(new Date(comment.createdAt), {
                  addSuffix: true
                })}
                {isEdited && " (edited)"}
              </span>
            </div>
            {isOwner && !state.isEditing && (
              <div className={styles["menu-container"]} ref={menuRef}>
                <button
                  className={styles["menu-btn"]}
                  onClick={() => dispatch({ type: ACTIONS.TOGGLE_MENU })}
                >
                  <MoreVertical size="1.2em" />
                </button>
                {state.showMenu && (
                  <div className={styles["menu-dropdown"]}>
                    <button
                      onClick={handleEditClick}
                      className={styles["menu-item"]}
                    >
                      <Pencil size={14} /> Edit
                    </button>
                    <button
                      onClick={() =>
                        dispatch({ type: ACTIONS.OPEN_DELETE_MODAL })
                      }
                      className={`${styles["menu-item"]} ${styles["danger"]}`}
                    >
                      <Trash2 size={14} /> Delete
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
          {state.isEditing ? renderEditForm() : renderCommentContent()}
        </div>
      </div>
      {state.showDeleteModal && (
        <div className={styles["modal-overlay"]}>
          <div className={styles["modal-content"]}>
            <h3 className={styles["modal-title"]}>Delete Comment</h3>
            <p className={styles["modal-text"]}>
              Are you sure? This cannot be undone.
            </p>
            <div className={styles["modal-actions"]}>
              <button
                className={styles["modal-cancel-btn"]}
                onClick={() =>
                  dispatch({ type: ACTIONS.CLOSE_DELETE_MODAL })
                }
              >
                Cancel
              </button>
              <button
                className={styles["modal-delete-btn"]}
                onClick={handleDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
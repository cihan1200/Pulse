import { useEffect, useState, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Upload, Trash2, Save, ChevronRight, AlertCircle } from "lucide-react";
import { getImageUrl } from "@/utils/imageHelper";
import api from "@/api/axios";
import styles from "./EditProfile.module.css";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import RightSidebar from "@/components/RightSidebar";
import SaveChangesModal from "./SaveChangesMoadal";

export default function EditProfile() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  // --- 1. FORM STATE ---
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [bio, setBio] = useState("");
  const [password, setPassword] = useState("");

  // Store initial data to check for changes (to disable/enable Save button)
  const [initialData, setInitialData] = useState({
    username: "",
    email: "",
    bio: ""
  });

  // --- 2. IMAGE STATE ---
  const [profileFile, setProfileFile] = useState(null);
  const [bannerFile, setBannerFile] = useState(null);
  const [previewProfile, setPreviewProfile] = useState("");
  const [previewBanner, setPreviewBanner] = useState("");

  // --- 3. UI STATE (Modals & Toasts) ---
  const [toastMessage, setToastMessage] = useState(null);
  const [isToastClosing, setIsToastClosing] = useState(false);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleteModalClosing, setIsDeleteModalClosing] = useState(false);

  const [activeModalField, setActiveModalField] = useState(null);

  // --- 4. REFS ---
  const toastTimerRef = useRef(null);
  const closeTimerRef = useRef(null);

  const currentUser = useMemo(() => {
    try { return JSON.parse(localStorage.getItem("user")); }
    catch { return null; }
  }, []);

  // --- 5. EFFECTS ---

  // Cleanup toast timers on unmount
  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    };
  }, []);

  // Fetch User Data
  useEffect(() => {
    if (!currentUser?.id) return navigate("/");

    const fetchUser = async () => {
      try {
        const res = await api.get(`/users/${currentUser.id}`);
        const u = res.data;

        // Set form state
        setUsername(u.username);
        setEmail(u.email);
        setBio(u.bio || "");
        setPreviewProfile(getImageUrl(u.profilePicture));
        setPreviewBanner(getImageUrl(u.bannerPicture || ""));

        // Set initial data for comparison
        setInitialData({
          username: u.username,
          email: u.email,
          bio: u.bio || ""
        });
      } catch (err) {
        showToast("Failed to load user data");
      } finally {
        setFetching(false);
      }
    };
    fetchUser();
  }, [currentUser, navigate]);

  // Handle Scroll Locking for Delete Modal
  useEffect(() => {
    if (showDeleteModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [showDeleteModal]);

  // --- 6. HELPER FUNCTIONS ---

  const showToast = (msg) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);

    setToastMessage(msg);
    setIsToastClosing(false);

    toastTimerRef.current = setTimeout(() => {
      setIsToastClosing(true);
      closeTimerRef.current = setTimeout(() => {
        setToastMessage(null);
        setIsToastClosing(false);
      }, 300);
    }, 3000);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalClosing(true);
    setTimeout(() => {
      setShowDeleteModal(false);
      setIsDeleteModalClosing(false);
    }, 200); // 200ms matches CSS animation duration
  };

  const handleImageChange = (e, type) => {
    const file = e.target.files[0];
    if (!file) return;
    if (type === "profile") {
      setProfileFile(file);
      setPreviewProfile(URL.createObjectURL(file));
    } else {
      setBannerFile(file);
      setPreviewBanner(URL.createObjectURL(file));
    }
  };

  const handleModalSave = (field, newValue) => {
    if (field === "username") setUsername(newValue);
    if (field === "email") setEmail(newValue);
    if (field === "bio") setBio(newValue);
    if (field === "password") setPassword(newValue);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();
    formData.append("username", username);
    formData.append("email", email);
    formData.append("bio", bio);
    if (password) formData.append("password", password);
    if (profileFile) formData.append("profilePicture", profileFile);
    if (bannerFile) formData.append("bannerPicture", bannerFile);

    try {
      const res = await api.put(`/users/${currentUser.id}`, formData);
      const updatedUser = res.data;
      localStorage.setItem("user", JSON.stringify(updatedUser));

      showToast("Profile updated successfully!");

      // Update initial data so the button becomes disabled again until new changes occur
      setInitialData({
        username: updatedUser.username,
        email: updatedUser.email,
        bio: updatedUser.bio || ""
      });
      setPassword(""); // Clear password field after save
      setProfileFile(null);
      setBannerFile(null);

    } catch (err) {
      console.error(err);
      const errorMsg = err.response?.data?.message || "Failed to update profile";
      showToast(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/users/${currentUser.id}`);
      localStorage.clear();
      window.location.href = "/";
    } catch (err) {
      showToast("Failed to delete account");
      closeDeleteModal();
    }
  };

  // Check if any changes have been made
  const hasChanges =
    username !== initialData.username ||
    email !== initialData.email ||
    bio !== initialData.bio ||
    password.length > 0 ||
    profileFile !== null ||
    bannerFile !== null;

  if (fetching) return <div className={styles.centered}>Loading...</div>;

  return (
    <>
      <Header />
      <Sidebar />
      <RightSidebar />
      <div className={styles.container}>
        <div className={styles.headerRow}>
          <button onClick={() => navigate(-1)} className={styles.backBtn}>
            <ArrowLeft size={20} /> Back
          </button>
          <h2>Edit Profile</h2>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>

          {/* --- IMAGES --- */}
          <div className={styles.imagesSection}>
            <div className={styles["banner"]}>
              {previewBanner &&
                <img src={previewBanner} alt="banner image" />
              }
              <label className={styles["upload-button"]}>
                <Upload size={16} /> {previewBanner === "" ? "Add banner image" : "Change banner"}
                <input type="file" hidden accept="image/*" onChange={(e) => handleImageChange(e, "banner")} />
              </label>
            </div>
            <div className={styles["avatar-wrapper"]}>
              <img src={previewProfile} alt="Profile" className={styles["avatar"]} />
              <label className={styles["upload-avatar-button"]}>
                <Upload size={16} />
                <input type="file" hidden accept="image/*" onChange={(e) => handleImageChange(e, "profile")} />
              </label>
            </div>
          </div>

          {/* --- CLICKABLE FIELDS --- */}

          {/* Username */}
          <div className={styles["field"]} onClick={() => setActiveModalField("username")}>
            <span>Username</span>
            <div className={styles["navigate"]}>
              <span>{username}</span>
              <div className={styles["field-icon"]}><ChevronRight size="1.5em" /></div>
            </div>
          </div>

          {/* Email (with truncation) */}
          <div className={styles["field"]} onClick={() => setActiveModalField("email")}>
            <span>Email address</span>
            <div className={styles["navigate"]}>
              <span title={email}>
                {email.length > 50 ? `${email.slice(0, 50)}...` : email}
              </span>
              <div className={styles["field-icon"]}><ChevronRight size="1.5em" /></div>
            </div>
          </div>

          {/* Bio */}
          <div className={styles["field"]} onClick={() => setActiveModalField("bio")}>
            <span>About description</span>
            <div className={styles["navigate"]}>
              <div className={styles["field-icon"]}><ChevronRight size="1.5em" /></div>
            </div>
          </div>

          {/* Password */}
          <div className={styles["field"]} onClick={() => setActiveModalField("password")}>
            <span>Change password</span>
            <div className={styles["navigate"]}>
              <div className={styles["field-icon"]}><ChevronRight size="1.5em" /></div>
            </div>
          </div>

          {/* --- SAVE CHANGES MODAL (Conditionally Rendered) --- */}
          {activeModalField && (
            <SaveChangesModal
              field={activeModalField}
              initialValue={
                activeModalField === 'username' ? username :
                  activeModalField === 'email' ? email :
                    activeModalField === 'bio' ? bio :
                      ''
              }
              onClose={() => setActiveModalField(null)}
              onSave={handleModalSave}
            />
          )}

          {/* --- ACTIONS FOOTER --- */}
          <div className={styles.actions}>
            <button type="button" className={styles.deleteBtn} onClick={() => setShowDeleteModal(true)}>
              <Trash2 size={18} /> Delete Account
            </button>
            <button
              type="submit"
              className={styles.saveBtn}
              disabled={loading || !hasChanges} // Disabled if no changes or loading
            >
              <Save size={18} /> {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>

        {/* --- DELETE CONFIRMATION MODAL --- */}
        {showDeleteModal && (
          <div
            className={`${styles.modalOverlay} ${isDeleteModalClosing ? styles.closing : ''}`}
            onClick={closeDeleteModal}
          >
            <div
              className={`${styles.modal} ${isDeleteModalClosing ? styles.closing : ''}`}
              onClick={(e) => e.stopPropagation()}
            >
              <h3>Delete Account?</h3>
              <p>This action is irreversible. All your data will be lost.</p>
              <div className={styles.modalActions}>
                <button
                  onClick={closeDeleteModal}
                  className={styles.cancelBtn}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className={styles.confirmDeleteBtn}
                >
                  Yes, Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* --- TOAST NOTIFICATION --- */}
      {toastMessage && (
        <div
          className={`${styles["toast-notification"]} ${isToastClosing ? styles["exit"] : ""}`}
        >
          <AlertCircle size={18} />
          {toastMessage}
        </div>
      )}

    </>
  );
}
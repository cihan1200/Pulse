import styles from "./CreatePost.module.css";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import Button from "@/components/Button";
import RightSidebar from "@/components/RightSidebar";
import api from "@/api/axios";
import { useState, useEffect, useRef } from "react";
import { Trash, Plus, ChevronRight, ChevronLeft, AlertCircle, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";

const CATEGORIES = ["General", "Technology", "Lifestyle", "Gaming", "Art", "Music", "Science", "Sports"];

export default function CreatePost() {
  const navigate = useNavigate();
  const [postType, setPostType] = useState("text");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("General");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isDropdownClosing, setIsDropdownClosing] = useState(false);
  const dropdownRef = useRef(null);
  const [body, setBody] = useState("");
  const [images, setImages] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [imageUrls, setImageUrls] = useState([]);
  const [video, setVideo] = useState(null);
  const [videoUrl, setVideoUrl] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [isClosing, setIsClosing] = useState(false);
  const [loading, setLoading] = useState(false);
  const toastTimerRef = useRef(null);
  const closeTimerRef = useRef(null);

  const toggleDropdown = () => {
    if (isDropdownOpen) {
      closeDropdown();
    } else {
      setIsDropdownOpen(true);
    }
  };

  const closeDropdown = () => {
    if (isDropdownOpen) {
      setIsDropdownClosing(true);
      setTimeout(() => {
        setIsDropdownOpen(false);
        setIsDropdownClosing(false);
      }, 200);
    }
  };

  const handleCategorySelect = (cat) => {
    setCategory(cat);
    closeDropdown();
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        closeDropdown();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isDropdownOpen]);

  useEffect(() => {
    const urls = images.map((img) => URL.createObjectURL(img));
    setImageUrls(urls);
    return () => urls.forEach((url) => URL.revokeObjectURL(url));
  }, [images]);

  useEffect(() => {
    if (!video) { setVideoUrl(null); return; }
    const url = URL.createObjectURL(video);
    setVideoUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [video]);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
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

  const handleImageFiles = (files) => {
    const incoming = Array.from(files).filter((file) => file.type.startsWith("image/"));
    if (incoming.length === 0) return;
    if (images.length >= 10) { showToast("You have reached the maximum limit of 10 images."); return; }
    const remainingSlots = 10 - images.length;
    const filesToAdd = incoming.slice(0, remainingSlots);
    if (incoming.length > remainingSlots) { showToast(`Limit reached. Only added the first ${remainingSlots} image(s).`); }
    setImages((prev) => {
      const updated = [...prev, ...filesToAdd];
      setCurrentSlide(updated.length - filesToAdd.length);
      return updated;
    });
  };

  const handleVideoFile = (files) => {
    const file = files[0];
    if (file && file.type.startsWith("video/")) setVideo(file);
    else showToast("Please upload a valid video file.");
  };

  const handleDrop = (e, type) => {
    e.preventDefault();
    setIsDragging(false);
    if (type === "image") handleImageFiles(e.dataTransfer.files);
    if (type === "video") handleVideoFile(e.dataTransfer.files);
  };

  const removeCurrentImage = () => {
    setImages((prev) => {
      if (prev.length === 1) return [];
      const updated = prev.filter((_, i) => i !== currentSlide);
      setCurrentSlide((s) => (s >= updated.length ? updated.length - 1 : s));
      return updated;
    });
  };

  const nextSlide = (e) => {
    e.stopPropagation();
    setCurrentSlide((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = (e) => {
    e.stopPropagation();
    setCurrentSlide((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) {
      showToast("You have to sign in first");
      return;
    }
    setLoading(true);
    try {
      let data;
      const config = { headers: {} };
      if (postType === "text") {
        data = { title, body, type: "text", category };
      } else {
        const formData = new FormData();
        formData.append("title", title);
        formData.append("type", postType);
        formData.append("category", category);
        formData.append("body", body);
        if (postType === "image") {
          images.forEach((img) => formData.append("images", img));
        } else if (postType === "video") {
          formData.append("video", video);
        }
        data = formData;
      }
      await api.post("/posts", data, config);
      navigate("/");
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to create post");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <Sidebar />
      <RightSidebar />
      <div className={styles["container"]}>
        <h1>Create post</h1>
        <div className={styles["category-wrapper"]} ref={dropdownRef}>
          <div
            className={`${styles["dropdown-trigger"]} ${isDropdownOpen ? styles["open"] : ""}`}
            onClick={toggleDropdown}
          >
            <span>{category}</span>
            <ChevronDown className={styles["select-icon"]} size={18} />
          </div>
          {(isDropdownOpen || isDropdownClosing) && (
            <div
              className={`${styles["dropdown-menu"]} ${isDropdownClosing ? styles["closing"] : ""}`}
            >
              {CATEGORIES.map((cat) => (
                <div
                  key={cat}
                  className={`${styles["dropdown-item"]} ${category === cat ? styles["selected"] : ""}`}
                  onClick={() => handleCategorySelect(cat)}
                >
                  {cat}
                </div>
              ))}
            </div>
          )}
        </div>
        <nav className={styles["post-type-nav"]}>
          {["text", "image", "video"].map((type) => (
            <span
              key={type}
              className={postType === type ? styles["active-nav-item"] : ""}
              onClick={() => setPostType(type)}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </span>
          ))}
        </nav>
        {postType === "text" && (
          <form className={styles["text-container"]} onSubmit={handleSubmit}>
            <div className={styles["field"]}>
              <input
                type="text"
                id="title"
                className={styles["post-title"]}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                autoComplete="off"
              />
              <label htmlFor="title">Title <span>*</span></label>
            </div>
            <textarea
              className={styles["post-text"]}
              placeholder="Body text (optional)"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              maxLength={2000}
            />
            <div className={`${styles["char-counter"]} ${body.length >= 2000 ? styles["limit-reached"] : ""}`}>
              {body.length}/2000
            </div>
            <Button
              type="submit"
              onClick={handleSubmit}
              disabled={!title || loading}
            >
              {loading ? "Posting..." : "Submit"}
            </Button>
          </form>
        )}
        {postType === "image" && (
          <form className={styles["media-container-form"]} onSubmit={handleSubmit}>
            <div className={styles["field"]}>
              <input
                type="text"
                id="image-title"
                className={styles["post-title"]}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                autoComplete="off"
              />
              <label htmlFor="image-title">Title <span>*</span></label>
            </div>
            <div
              className={`${styles["media-upload-container"]} ${isDragging ? styles["dragging"] : ""} ${images.length > 0 ? styles["has-media"] : ""}`}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => handleDrop(e, "image")}
              onClick={() => document.getElementById("image-input").click()}
            >
              <input id="image-input" type="file" accept="image/*" multiple hidden onChange={(e) => handleImageFiles(e.target.files)} />
              {images.length > 0 && (
                <button type="button" className={styles["remove-media"]} onClick={(e) => { e.stopPropagation(); removeCurrentImage(); }}>
                  <Trash size="1em" />
                </button>
              )}
              {images.length > 0 && images.length < 10 && (
                <button type="button" className={styles["add-more-media"]} onClick={(e) => { e.stopPropagation(); document.getElementById("image-input").click(); }}>
                  <Plus size="1em" />
                </button>
              )}
              {images.length === 0 ? (
                <span className={styles["upload-placeholder"]}>Drag & drop images here or click to upload</span>
              ) : (
                <>
                  <div className={styles["backgrounds-wrapper"]}>
                    {imageUrls.map((url, index) => (
                      <div key={index} className={`${styles["blurred-bg"]} ${currentSlide === index ? styles["active"] : ""}`} style={{ backgroundImage: `url(${url})` }} />
                    ))}
                  </div>
                  <div className={styles["slides-track"]} style={{ transform: `translateX(-${currentSlide * 100}%)` }}>
                    {imageUrls.map((url, index) => (
                      <div key={index} className={styles["slide"]}>
                        <img className={styles["media-content"]} src={url} alt={`preview ${index}`} />
                      </div>
                    ))}
                  </div>
                  {images.length > 1 && (
                    <>
                      <button type="button" className={styles["nav-button-left"]} onClick={prevSlide}><ChevronLeft size="1em" /></button>
                      <button type="button" className={styles["nav-button-right"]} onClick={nextSlide}><ChevronRight size="1em" /></button>
                      <div className={styles["dots-container"]}>
                        {images.map((_, idx) => (
                          <div key={idx} className={`${styles["dot"]} ${currentSlide === idx ? styles["active"] : ""}`} onClick={(e) => { e.stopPropagation(); setCurrentSlide(idx); }} />
                        ))}
                      </div>
                    </>
                  )}
                </>
              )}
            </div>
            <textarea
              className={styles["post-description"]}
              placeholder="Body text (optional)"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              maxLength={2000}
            />
            <div className={`${styles["char-counter"]} ${body.length >= 2000 ? styles["limit-reached"] : ""}`}>
              {body.length}/2000
            </div>
            <Button
              type="submit"
              onClick={handleSubmit}
              disabled={!title || images.length === 0 || loading}
            >
              {loading ? "Posting..." : "Submit"}
            </Button>
          </form>
        )}
        {postType === "video" && (
          <form className={styles["media-container-form"]} onSubmit={handleSubmit}>
            <div className={styles["field"]}>
              <input
                type="text"
                id="video-title"
                className={styles["post-title"]}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                autoComplete="off"
              />
              <label htmlFor="video-title">Title <span>*</span></label>
            </div>
            <div
              className={`${styles["media-upload-container"]} ${isDragging ? styles["dragging"] : ""} ${video ? styles["has-media"] : ""} ${video ? styles["cursor-default"] : ""}`}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => handleDrop(e, "video")}
              onClick={() => !video && document.getElementById("video-input").click()}
            >
              <input id="video-input" type="file" accept="video/*" hidden onChange={(e) => handleVideoFile(e.target.files)} />
              {video && (
                <button type="button" className={styles["remove-media"]} onClick={(e) => { e.stopPropagation(); setVideo(null); }}>
                  <Trash size="1em" />
                </button>
              )}
              {!video ? (
                <span className={styles["upload-placeholder"]}>Drag & drop video here or click to upload</span>
              ) : (
                <video className={styles["media-content"]} src={videoUrl} controls />
              )}
            </div>
            <textarea
              className={styles["post-description"]}
              placeholder="Body text (optional)"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              maxLength={2000}
            />
            <div className={`${styles["char-counter"]} ${body.length >= 2000 ? styles["limit-reached"] : ""}`}>
              {body.length}/2000
            </div>
            <Button
              type="submit"
              onClick={handleSubmit}
              disabled={!title || !video || loading}
            >
              {loading ? "Posting..." : "Submit"}
            </Button>
          </form>
        )}
      </div>
      {toastMessage && (
        <div className={`${styles["toast-notification"]} ${isClosing ? styles["exit"] : ""}`}>
          <AlertCircle size={18} />
          {toastMessage}
        </div>
      )}
      {loading && (
        <div className={styles["loading-overlay"]}>
          <div className={styles["spinner"]} />
        </div>
      )}
    </>
  );
}
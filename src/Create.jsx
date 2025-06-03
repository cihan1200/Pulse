import "./Create.css";
import xMarkIcon from "./assets/xmark.svg";
import Header from "./Header";
import Footer from "./Footer";
import TextPostForm from "./TextPostForm";
import MediaPostForm from "./MediaPostForm";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import axios from "axios";

export default function Create() {
  const [mediaFiles, setMediaFiles] = useState([]);
  const [postType, setPostType] = useState("text");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [uploadError, setUploadError] = useState("");
  const [loading, setLoading] = useState(false);
  const API_URL = import.meta.env.VITE_API_URL;
  const timeoutRef = useRef(null);
  const navigate = useNavigate();
  const rootDiv = document.getElementById("root");
  rootDiv.style.height = "100vh";

  useEffect(() => {
    if (uploadError !== "") {
      const errorElement = document.querySelector(".upload-error");
      errorElement.classList.remove("hide");
      timeoutRef.current = setTimeout(() => {
        errorElement.classList.add("hide");
        setUploadError("");
      }, 3000);
    }
  }, [uploadError]);

  const handleClickErrorCloseButton = () => {
    timeoutRef.current && clearTimeout(timeoutRef.current);
    const errorElement = document.querySelector(".upload-error");
    errorElement.classList.add("hide");
    setUploadError("");
  };

  const handleSubmit = async () => {

    const token = localStorage.getItem("authToken");
    const userId = token ? jwtDecode(token).id : null;
    const formData = new FormData();
    formData.append("userId", userId);
    formData.append("title", title);
    formData.append("body", body);
    formData.append("type", postType);
    mediaFiles.forEach((file) => {
      formData.append("media", file);
    });
    try {
      setLoading(true);
      if (loading) {
        return (
          <div className="loading">
            <div className="spinner"></div>
          </div>
        );
      }
      await axios.post(`${API_URL}/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      navigate("/home");
    } catch (err) {
      console.error("Submission error:", err);
    }
  };

  return (
    <>
      <Header />
      <div className="page-content">
        <div className="wrapper">
          <h1 className="page-title">Create post</h1>
          <div className="post-type-selector">
            <a className={`post-type-text ${postType === "text" ? "" : "remove-underline"}`} onClick={() => setPostType("text")}>
              Text
            </a>
            <a className={`post-type-media ${postType === "media" ? "" : "remove-underline"}`} onClick={() => setPostType("media")}>
              Images & Video
            </a>
          </div>
          {postType === "text" ? (
            <TextPostForm
              title={title}
              setTitle={setTitle}
              body={body}
              setBody={setBody} />
          ) : (
            <MediaPostForm
              title={title}
              setTitle={setTitle}
              mediaFiles={mediaFiles}
              setMediaFiles={setMediaFiles}
              uploadError={uploadError}
              setUploadError={setUploadError}
            />
          )}
          <div className="submit-and-cancel-buttons">
            <button className={title && (body || mediaFiles.length > 0) ? "" : "deactive"} onClick={handleSubmit}>Submit</button>
            <button onClick={() => navigate("/home")}>Cancel</button>
          </div>
        </div>
        <div className="center-items">
          <div className="upload-error hide">{uploadError}<button className="close-button" onClick={handleClickErrorCloseButton}><img className="xmark" src={xMarkIcon} /></button></div>
        </div>
      </div>
      <Footer />
    </>
  );
}

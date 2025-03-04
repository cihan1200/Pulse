import "./Create.css";
import uploadIcon from "./assets/upload-icon.svg";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "./Header";

export default function Create() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [postType, setPostType] = useState("text");
  const maxTitleLength = 300;
  const maxBodyLength = 1000;
  const navigate = useNavigate();

  useEffect(() => {
    if (postType === "text") {
      document.querySelector(".body").classList.remove("hide");
      document.querySelector(".body-char-counter").classList.remove("hide");
      document.querySelector(".media-upload-area").classList.add("hide");
    } else if (postType === "media") {
      document.querySelector(".media-upload-area").classList.remove("hide");
      document.querySelector(".body").classList.add("hide");
      document.querySelector(".body-char-counter").classList.add("hide");
    }
  }, [postType]);

  const handleTitleChange = (e) => {
    if (e.target.value.length <= maxTitleLength) {
      setTitle(e.target.value);
    }
  };

  const handleBodyChange = (e) => {
    if (e.target.value.length <= maxBodyLength) {
      setBody(e.target.value);
    }
  };

  const handleTextType = () => {
    setPostType("text");
  };

  const handleMediaType = () => {
    setPostType("media");
  };

  return (
    <>
      <Header />
      <div className="wrapper">
        <div className="create-post-form">
          <h1 className="form-title">Create post</h1>
          <div className="post-type-buttons">
            <button className={`type-text ${postType === "text" ? "active" : ""}`} onClick={handleTextType}>Text</button>
            <button className={`type-media ${postType === "media" ? "active" : ""}`} onClick={handleMediaType}>Images & Video</button>
          </div>
          <input className="create-post-title" type="text" placeholder="Title" value={title} onChange={handleTitleChange} />
          <span className="char-counter">{title.length}/{maxTitleLength}</span>
          <textarea className="body" name="body" id="body" placeholder="Body" value={body} onChange={handleBodyChange}></textarea>
          <div className="media-upload-area">
            <label>Drag and Drop or upload media</label>
            <button className="upload-media-button">
              <img className="upload-icon" src={uploadIcon} alt="upload icon" />
            </button>
          </div>
          <span className="body-char-counter">{body.length}/{maxBodyLength}</span>
          <div className="navigate-buttons">
            <button className="post-button">Post</button>
            <button className="post-button" onClick={() => { navigate("/home"); }}>Cancel</button>
          </div>
        </div>
      </div>
    </>
  );
}
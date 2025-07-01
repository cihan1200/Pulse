import uploadMediaButtonIcon from "./assets/upload-media-button-icon.svg";
import nextMediaButtonIcon from "./assets/next-media-button-icon.svg";
import prevMediaButtonIcon from "./assets/prev-media-button-icon.svg";
import plusIcon from "./assets/plus-icon.svg";
import deleteMediaButtonIcon from "./assets/delete-media-button-icon.svg";
import { useState, useEffect } from "react";

export default function MediaPostForm({ setUploadError, title, setTitle, mediaFiles, setMediaFiles }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [mediaPreviews, setMediaPreviews] = useState([]);
  const [mediaTypes, setMediaTypes] = useState([]);

  const maxTitleLength = 300;

  useEffect(() => {
    // Each time the mediaPreviews array changes, set the current index
    // to the last item in the array
    if (mediaPreviews.length > 0) {
      setCurrentIndex(mediaPreviews.length - 1);
    } else {
      setCurrentIndex(0);
    }
  }, [mediaPreviews]);

  const handleTitleChange = (e) => {
    // Title length limit set to 300 characters
    if (e.target.value.length <= maxTitleLength) {
      setTitle(e.target.value);
    }
  };

  const handleFiles = (files) => {
    // First a new array created from the files object to loop through it
    const filesArray = Array.from(files);

    // Conditions to check if there is a video in the coming array or in the
    // current gallery (if so, it will be the only file in the gallery)
    const isGalleryContainVideo = filesArray.find(file => file.type.split("/")[0] === "video");
    const isThereVideoInCurrentGallery = mediaTypes.find(type => type === "video");
    if (mediaPreviews.length >= 1 && isThereVideoInCurrentGallery) {
      setMediaFiles([]);
      setMediaPreviews([]);
      setMediaTypes([]);
      setUploadError("Galleries can only contain images or GIFs.");
      return;
    }
    else if (isGalleryContainVideo && filesArray.length === 1) {
      setMediaFiles(filesArray);
      setMediaPreviews([URL.createObjectURL(filesArray[0])]);
      setMediaTypes([filesArray[0].type.split("/")[0]]);
      setUploadError("");
      return;
      // If there is mixed media (video and images) in the array, set an error message
    } else if (isGalleryContainVideo) {
      setMediaFiles([]);
      setMediaPreviews([]);
      setMediaTypes([]);
      setUploadError("Galleries can only contain images or GIFs.");
      return;
    }

    // New arrays created to set the states in the next step to increse performance
    // and avoid mutating the state directly
    const newFiles = [...mediaFiles];
    const newPreviews = [...mediaPreviews];
    const newTypes = [...mediaTypes];

    filesArray.forEach((file) => {
      newFiles.push(file);
      newPreviews.push(URL.createObjectURL(file));
      newTypes.push(file.type.split("/")[0]);
    });

    setMediaFiles(newFiles);
    setMediaPreviews(newPreviews);
    setMediaTypes(newTypes);
    setUploadError("");
  };

  const handleDelete = () => {
    // Make sure mediaPreviews is not empty before trying to delete an item
    if (mediaPreviews.length === 0) return;

    // Remove the currently previewing media file and its preview from the arrays
    const newFiles = mediaFiles.filter((_, index) => index !== currentIndex);
    const newPreviews = mediaPreviews.filter((_, index) => index !== currentIndex);
    const newTypes = mediaTypes.filter((_, index) => index !== currentIndex);

    // Set states with the new arrays
    setMediaFiles(newFiles);
    setMediaPreviews(newPreviews);
    setMediaTypes(newTypes);

    // Update the current index to ensure it doesn't go out of bounds
    if (newPreviews.length === 0) {
      setCurrentIndex(0);
    } else if (currentIndex >= newPreviews.length) {
      setCurrentIndex(newPreviews.length - 1);
    }
  };

  const goToPrevious = () => {
    // This logic ensures that if the current index is 0, it wraps around to the
    // last item in the array. Otherwise, it simply decrements the index by 1.
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? mediaPreviews.length - 1 : prevIndex - 1
    );
  };

  const goToNext = () => {
    // Same logic as above, but for the next item in the array.
    // If the current index is the last item, it wraps around to the first item.
    setCurrentIndex((prevIndex) =>
      prevIndex === mediaPreviews.length - 1 ? 0 : prevIndex + 1
    );
  };

  const handleDragOver = (e) => {
    // Sets some styles and UI when the user drags a file over the upload area
    e.preventDefault();
    e.currentTarget.classList.add("drag-over");
    document.getElementById("label").textContent = "Drop media here";
  };

  const handleDragLeave = (e) => {
    // Removes the styles and UI when the user drags a file out of the upload area
    e.currentTarget.classList.remove("drag-over");
    document.getElementById("label").textContent = "Drag and Drop or upload media";
  };

  const handleDrop = (e) => {
    // Handles the drop event and calls the handleFiles function
    // with the dropped files
    e.preventDefault();
    e.currentTarget.classList.remove("drag-over");
    document.getElementById("label").textContent = "Drag and Drop or upload media";
    handleFiles(e.dataTransfer.files);
  };

  return (
    <>
      <label className="post-title-label" htmlFor="post-title">Title</label>
      <input className="post-title" autoComplete="off" id="post-title" type="text" value={title} onChange={handleTitleChange} />
      <span className="char-counter">{title.length}/{maxTitleLength}</span>

      <div
        className="media-upload-area"
        style={{
          backgroundImage: mediaPreviews.length > 0 && mediaTypes[currentIndex] === "image"
            ? `url(${mediaPreviews[currentIndex]})`
            : "none",
        }}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onDragLeave={handleDragLeave}
      >
        {mediaPreviews.length > 0 && mediaTypes[currentIndex] === "video" && (
          <video className="video-file" controls src={mediaPreviews[currentIndex]} />
        )}

        <div className={`media-upload-button-and-info-text ${mediaPreviews.length > 0 ? "hide" : ""}`}>
          <span className="media-upload-info" id="label">Drag and Drop or upload media</span>
          <button className="media-upload-button" onClick={() => document.getElementById("fileInput").click()}>
            <img className="upload-icon" src={uploadMediaButtonIcon} alt="upload media button icon" />
          </button>
        </div>

        <input
          className="hide"
          type="file"
          id="fileInput"
          accept=".jpg,.jpeg,.mp4,image/jpeg,video/mp4"
          onChange={(e) => { handleFiles(e.target.files); e.target.value = ''; }}
          multiple
        />

        {mediaPreviews.length > 0 && (
          <div className="add-and-delete-media-buttons">
            {mediaTypes[0]?.includes("image") && (
              <button onClick={() => document.getElementById("fileInput").click()}>
                <img className="add-media-button-icon" draggable="false" src={plusIcon} alt="add media button icon" /> Add
              </button>
            )}
            <button onClick={handleDelete}>
              <img className="delete-media-button-icon" draggable="false" src={deleteMediaButtonIcon} alt="delete media button icon" /> Delete
            </button>
          </div>
        )}

        {mediaPreviews.length > 1 && (
          <div className="media-navigation">
            <button className="prev-media-button" onClick={goToPrevious}>
              <img className="prev-media-button-icon" draggable="false" src={prevMediaButtonIcon} alt="previous media button icon" />
            </button>
            <button className="next-media-button" onClick={goToNext}>
              <img className="next-media-button-icon" draggable="false" src={nextMediaButtonIcon} alt="next media button icon" />
            </button>
          </div>
        )}
      </div>
    </>
  );
}
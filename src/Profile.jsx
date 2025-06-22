import Header from './Header';
import Footer from './Footer';
import { useState, useEffect } from "react";
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';
import editIcon from './assets/edit-icon.svg';
import circleCheckIcon from './assets/circle-check-icon.svg';
import circleXMarkIcon from './assets/circle-xmark-icon.svg';

export default function Profile() {
  const [userId, setUserId] = useState(null);
  const [userName, setUserName] = useState("");
  const [newUserName, setNewUserName] = useState("");
  const [profilePicture, setProfilePicture] = useState("");
  const [profilePictureFile, setProfilePictureFile] = useState(null);
  const [trigger, setTrigger] = useState(false);
  const [about, setAbout] = useState("");
  const [newAbout, setNewAbout] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      const decodedToken = jwtDecode(token);
      setUserId(decodedToken.id);
    }
  }, [userId]);

  useEffect(() => {
    if (userId != null) {
      axios.get(`https://pulse-0o0k.onrender.com/users/${userId}`)
        .then(response => {
          setUserName(response.data.username);
          setNewUserName(response.data.username);
          setProfilePicture(response.data.profilePicture);
          setAbout(response.data.about);
          setLoading(false);
        })
        .catch(error => {
          console.error("Error fetching user data:", error);
        });
    }
  }, [userId, trigger]);

  const editProfilePicture = () => {
    const saveButton = document.querySelector(".save");
    const cancelButton = document.querySelector(".cancel");
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = "image/*";
    fileInput.onchange = async (event) => {
      const file = event.target.files[0];
      if (file) {
        setProfilePictureFile(file); // Store the file
        setProfilePicture(URL.createObjectURL(file)); // For preview
        saveButton.classList.remove("deactive");
        cancelButton.classList.remove("deactive");
      }
    };
    fileInput.click();
  };

  const editUserName = () => {
    const newUsernameInputContainer = document.querySelector(".new-username-input-container");
    const newAboutFieldContainer = document.querySelector(".new-about-field-container");
    newAboutFieldContainer.classList.add("hide");
    newUsernameInputContainer.classList.remove("hide");
  };

  const editAbout = () => {
    const newAboutFieldContainer = document.querySelector(".new-about-field-container");
    const newUsernameInputContainer = document.querySelector(".new-username-input-container");
    newUsernameInputContainer.classList.add("hide");
    newAboutFieldContainer.classList.remove("hide");
  };

  const cancelChanges = () => {
    setLoading(true);
    setTrigger(prev => !prev);
  };

  const saveChanges = async () => {
    const saveButton = document.querySelector(".save");
    if (saveButton.classList.contains("deactive")) {
      return;
    }

    const requests = [];

    // Check if username actually changed
    if (newUserName.trim() !== "") {
      requests.push(
        axios.put(`https://pulse-0o0k.onrender.com/users/${userId}/username`, { newUsername: newUserName })
      );
    }

    // Check if about actually changed
    if (newAbout.trim() !== "") {
      requests.push(
        axios.put(`https://pulse-0o0k.onrender.com/users/${userId}/about`, { newAbout: newAbout })
      );
    }

    // Check if profile picture actually changed
    if (profilePictureFile) { // If a new picture is selected
      const formData = new FormData();
      formData.append("profilePicture", profilePictureFile);
      requests.push(
        axios.put(`https://pulse-0o0k.onrender.com/users/${userId}/profile-picture`, formData)
      );
    }

    if (requests.length === 0) return; // Nothing changed, no need to send requests

    try {
      setLoading(true);
      await Promise.all(requests);
      setTrigger(prev => !prev);
    } catch (error) {
      console.error("Error saving changes:", error);
    } finally {
      setLoading(false);
    }
  };

  const rejectUserNameChanges = () => {
    const newUsernameInputContainer = document.querySelector(".new-username-input-container");
    newUsernameInputContainer.classList.add("hide");
  };

  const applyUserNameChanges = () => {
    const saveButton = document.querySelector(".save");
    const cancelButton = document.querySelector(".cancel");
    const newUsernameInput = document.querySelector(".new-username-input");
    const newUsernameInputContainer = document.querySelector(".new-username-input-container");
    if (newUsernameInput && newUsernameInput.value.trim() !== "") {
      setUserName(newUsernameInput.value.trim());
    }
    newUsernameInputContainer.classList.add("hide");
    saveButton.classList.remove("deactive");
    cancelButton.classList.remove("deactive");
  };

  const applyAboutChanges = () => {
    const saveButton = document.querySelector(".save");
    const cancelButton = document.querySelector(".cancel");
    const newAboutField = document.querySelector(".new-about-field");
    const newAboutFieldContainer = document.querySelector(".new-about-field-container");
    if (newAboutField && newAboutField.value.trim() !== "") {
      setAbout(newAboutField.value.trim());
    }
    newAboutFieldContainer.classList.add("hide");
    saveButton.classList.remove("deactive");
    cancelButton.classList.remove("deactive");
  };

  const rejectAboutChanges = () => {
    const newAboutFieldContainer = document.querySelector(".new-about-field-container");
    newAboutFieldContainer.classList.add("hide");
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <>
      <Header />
      <div className="settings-container">
        <div className="profile-picture-container">
          <span className="profile-picture-label">Profile Picture:</span>
          {profilePicture && <img className="profile-picture-settings" src={profilePicture} alt="Profile Picture" />}
          <button className="edit-button" onClick={editProfilePicture}><img className="edit-icon" src={editIcon} alt="Edit Icon" /></button>
        </div>
        <div className="user-name-container">
          <span className="user-name-label">Username:</span>
          <span className="user-name-settings">{userName}</span>
          <button className="edit-button" onClick={editUserName}><img className="edit-icon" src={editIcon} alt="Edit Icon" /></button>
        </div>
        <div className="about-container">
          <span className="about-label">About:</span>
          {about === "" ? <i className="about-settings">Tell us about yourself</i> : <i className="about-settings">{about}</i>}
          <button className="edit-button" onClick={editAbout}><img className="edit-icon" src={editIcon} alt="Edit Icon" /></button>
        </div>
        <div className="save-and-cancel-buttons-container">
          <button className="save deactive" onClick={saveChanges}>Save</button>
          <button className="cancel deactive" onClick={cancelChanges}>Cancel</button>
        </div>
        <div className="new-username-input-container hide">
          <input className="new-username-input" autoComplete="off" onChange={(e) => setNewUserName(e.target.value)} name="username" type="text" value={newUserName} placeholder='Enter new username' />
          <button className={newUserName != "" ? `apply-button` : `apply-button deactivate`} onClick={applyUserNameChanges}><img className='apply-icon' src={circleCheckIcon} alt="Save" /></button>
          <button className="reject-button" onClick={rejectUserNameChanges}><img className='reject-icon' src={circleXMarkIcon} alt="Cancel" /></button>
        </div>
        <div className="new-about-field-container hide">
          <textarea className="new-about-field" onChange={(e) => setNewAbout(e.target.value)} value={newAbout} name="about" id="about" placeholder="Tell us about yourself"></textarea>
          <button className={newAbout != "" ? `apply-button` : `apply-button deactivate`} onClick={applyAboutChanges}><img className='apply-icon' src={circleCheckIcon} alt="Save" /></button>
          <button className="reject-button" onClick={rejectAboutChanges}><img className='reject-icon' src={circleXMarkIcon} alt="Cancel" /></button>
        </div>
      </div>
      <Footer />
    </>
  );
};
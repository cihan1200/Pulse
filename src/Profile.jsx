import Header from './Header';
import Footer from './Footer';
import { useState, useEffect } from "react";
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';
import editIcon from './assets/edit-icon.svg';
import circleCheckIcon from './assets/circle-check-icon.svg';
import circleXMarkIcon from './assets/circle-xmark-icon.svg';
import { editProfilePicture, editUserName, editAbout, cancelChanges, saveChanges, rejectUserNameChanges, applyUserNameChanges, applyAboutChanges, rejectAboutChanges } from '../functions';

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
  }, []);

  useEffect(() => {
    if (userId != null) {
      axios.get(`https://pulse-0o0k.onrender.com/users/${userId}`)
        .then(response => {
          setUserName(response.data.username);
          setNewUserName(response.data.username);
          setProfilePicture(response.data.profilePicture);
          setAbout(response.data.about);
          setNewAbout(response.data.about);
          setLoading(false);
        })
        .catch(error => {
          console.error("Error fetching user data:", error);
        });
    }
  }, [userId, trigger]);

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
          {profilePicture && <img className="profile-picture-settings" src={profilePicture} alt="Profile" />}
          <button className="edit-button" onClick={() => editProfilePicture(setProfilePicture, setProfilePictureFile)}><img className="edit-icon" src={editIcon} alt="Edit Icon" /></button>
        </div>
        <div className="user-name-container">
          <span className="user-name-label">Username:</span>
          <span className="user-name-settings">{userName}</span>
          <button className="edit-button" onClick={editUserName}><img className="edit-icon" src={editIcon} alt="Edit Icon" /></button>
        </div>
        <div className="about-container">
          <span className="about-label">About:</span>{about === "" ? (<i className="about-settings">Tell us about yourself</i>) : (<i className="about-settings">{about}</i>)}
          <button className="edit-button" onClick={editAbout}><img className="edit-icon" src={editIcon} alt="Edit Icon" /></button>
        </div>
        <div className="save-and-cancel-buttons-container">
          <button className="save deactive" onClick={() => saveChanges({ userId, newUserName, newAbout, profilePictureFile, setLoading, setTrigger })}>Save</button>
          <button className="cancel deactive" onClick={() => cancelChanges(setLoading, setTrigger)}>Cancel</button>
        </div>
        <div className="new-username-input-container hide">
          <input className="new-username-input" autoComplete="off" onChange={(e) => setNewUserName(e.target.value)} name="username" type="text" value={newUserName} placeholder="Enter new username" />
          <button className={newUserName !== "" ? "apply-button" : "apply-button deactivate"} onClick={() => applyUserNameChanges(setUserName)} > <img className="apply-icon" src={circleCheckIcon} alt="Save" /> </button>
          <button className="reject-button" onClick={rejectUserNameChanges}><img className="reject-icon" src={circleXMarkIcon} alt="Cancel" /></button>
        </div>
        <div className="new-about-field-container hide">
          <textarea className="new-about-field" onChange={(e) => setNewAbout(e.target.value)} value={newAbout} name="about" placeholder="Tell us about yourself" />
          <button className={newAbout !== "" ? "apply-button" : "apply-button deactivate"} onClick={() => applyAboutChanges(setAbout)} ><img className="apply-icon" src={circleCheckIcon} alt="Save" /></button>
          <button className="reject-button" onClick={rejectAboutChanges}><img className="reject-icon" src={circleXMarkIcon} alt="Cancel" /></button>
        </div>
      </div>
      <Footer />
    </>
  );
}

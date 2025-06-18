import Header from './Header';
import Footer from './Footer';
import { useState, useEffect } from "react";
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';
import editIcon from './assets/edit-icon.svg';

export default function Profile() {
  const [userId, setUserId] = useState(null);
  const [userName, setUserName] = useState("");
  const [profilePicture, setProfilePicture] = useState("");
  const [about, setAbout] = useState("");
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
          setProfilePicture(response.data.profilePicture);
          setAbout(response.data.about);
          setLoading(false);
        })
        .catch(error => {
          console.error("Error fetching user data:", error);
        });
    }
  }, [userId, profilePicture, about, userName]);

  const editProfilePicture = () => {
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = "image/*";
    fileInput.onchange = async (event) => {
      const file = event.target.files[0];
      if (file) {
        const formData = new FormData();
        formData.append("profilePicture", file);
        try {
          await axios.put(`https://pulse-0o0k.onrender.com/users/${userId}/profile-picture`, formData);
          setProfilePicture(URL.createObjectURL(file));
        } catch (error) {
          console.error("Error updating profile picture:", error);
        }
      }
    };
    fileInput.click();
  };

  const editUserName = () => {
    // Logic to handle username editing
  };

  const editAbout = () => {
    // Logic to handle about section editing
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
          {about === "" ? <i className="about-settings">Tell us about yourself</i> : <span className="about-settings">{about}</span>}
          <button className="edit-button" onClick={editAbout}><img className="edit-icon" src={editIcon} alt="Edit Icon" /></button>
        </div>
        <div className="save-and-cancel-buttons-container">
          <button className="save">Save</button>
          <button className="cancel">Cancel</button>
        </div>
      </div>
      <Footer />
    </>
  );
}
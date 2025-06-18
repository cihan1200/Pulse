import Header from './Header';
import Footer from './Footer';
import { useState, useEffect } from "react";
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';

export default function Profile() {
  const [userId, setUserId] = useState(null);

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
          console.log("User data:", response.data);
        })
        .catch(error => {
          console.error("Error fetching user data:", error);
        });
    }
  }, [userId]);

  return (
    <>
      <Header />
      <div className="profile-picture-container">
        <h1>Profile</h1>
        <p>This is the profile page.</p>
      </div>
      <Footer />
    </>
  );
}
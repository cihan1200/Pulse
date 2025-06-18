import { useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";

export default function SignUp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPaswwordError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    localStorage.removeItem("authToken");
    let isValid = true;
    if (!email) {
      setEmailError("Email is required.");
      isValid = false;
    }
    else if (email.length > 50) {
      setEmailError("Invalid email.");
    }
    else if (!email.includes("@")) {
      setEmailError(`Please include an '@' in the email address. '${email}' is missing an '@'.`);
      isValid = false;
    } else if (email.split("@")[1]?.trim() === "") {
      setEmailError(`Please enter a part following '@'. '${email}' is incomplete.`);
      isValid = false;
    } else {
      setEmailError("");
    }
    if (!password) {
      setPaswwordError("Password is required.");
      isValid = false;
    } else if (password.length < 6) {
      setPaswwordError("Password must be at least 6 characters long.");
      isValid = false;
    }
    else {
      setPaswwordError("");
    }
    if (!isValid) return;
    try {
      const response = await axios.post('/signup', { email, password });
      if (response.status === 201) {
        localStorage.setItem("authToken", response.data.token);
        navigate('/home');
      }
    } catch (err) {
      if (err.response?.status === 400) {
        setEmailError(err.response.data.message);
      } else {
        console.error("An error occurred. Please try again later.");
      }
      console.error("Signup error:", err);
    }
  };

  const handleGuestLogin = async (e) => {
    e.preventDefault();
    const num = Math.floor(Math.random() * 1000000);
    localStorage.removeItem("authToken");
    try {
      const response = await axios.post('/signup', { email: `guest${num}@example.com`, password: "guestpassword" });
      if (response.status === 201) {
        localStorage.setItem("authToken", response.data.token);
        navigate('/home');
      }
    } catch (err) {
      if (err.response?.status === 400) {
        setEmailError(err.response.data.message);
      } else {
        console.error("An error occurred. Please try again later.");
      }
      console.error("Signup error:", err);
    }
    navigate('/home');
  };

  return (
    <>
      <div className="container">
        <form className="form" onSubmit={handleSubmit}>
          <h2 className="header-text">Sign Up</h2>
          <input className={`${emailError && "no-bottom-margin"} input`} placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          {emailError && <p className="warning-text">{emailError}</p>}
          <input className={`${passwordError && "no-bottom-margin"} input`} type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
          {passwordError && <p className="warning-text">{passwordError}</p>}
          <button className="signup-button" type="submit">Sign Up</button>
          <div className="divider">OR</div>
          <button className="login-button" type="button" onClick={() => { navigate("/login"); }}>Login</button>
          <button className="guest-login-button" type="button" onClick={handleGuestLogin}>Browse as guest</button>
        </form>
      </div>
    </>
  );
}
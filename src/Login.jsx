import { useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPaswwordError] = useState("");
  const [loginError, setLoginError] = useState("");
  const navigate = useNavigate();

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    setEmailError("");
    setLoginError("");
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    setPaswwordError("");
    setLoginError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let isValid = true;
    if (!email) {
      setEmailError("Email is required.");
      isValid = false;
    }
    if (!password) {
      setPaswwordError("Password is required.");
      isValid = false;
    }
    if (!isValid) return;
    try {
      const response = await axios.post('/api-login', { email, password });
      if (response.status === 201) {
        localStorage.setItem("authToken", response.data.token);
        navigate('/home');
      }
    } catch (err) {
      if (err.response?.status === 400) {
        setLoginError(err.response.data.message);
      } else {
        console.error("An error occurred. Please try again later.");
      }
      console.error("Signup error:", err);
    }
  };

  return (
    <>
      <div className="container">
        <form className="form">
          <h2 className="header-text">Login</h2>
          <input className={`${emailError && "no-bottom-margin"} input`} placeholder="Email" value={email} onChange={handleEmailChange} />
          {emailError && <p className="warning-text">{emailError}</p>}
          <input className={`${(passwordError || loginError) && "no-bottom-margin"} input`} type="password" placeholder="Password" value={password} onChange={handlePasswordChange} />
          {passwordError && <p className="warning-text">{passwordError}</p>}
          {loginError && <p className="warning-text">{loginError}</p>}
          <button className="signup-button" type="submit" onClick={handleSubmit}>Login</button>
          <div className="divider">OR</div>
          <button className="google-button" type="button" onClick={() => { navigate("/"); }}>Sign Up</button>
        </form>
      </div>
    </>
  );
}
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import Header from "./Header";
import "./SignUp.css";

export default function SignUp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (event) => {

  };

  const handleGoogleSignIn = () => {

  };

  const handleLogin = () => {

  };

  const handleGuestLogin = () => {

  };

  return (
    <>
      <div className="container">
        <form className="form" onSubmit={handleSubmit}>
          <h2 className="header-text">Sign Up</h2>
          <input className="input" type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <input className="input" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <button className="signup-button" type="submit">Sign Up</button>
          <div className="divider">OR</div>
          <button className="google-button" type="button" onClick={handleGoogleSignIn}>Continue with Google</button>
          <button className="login-button" type="button" onClick={handleLogin}>Login</button>
          <button className="login-button" type="button" onClick={handleGuestLogin}>Browse as guest</button>
        </form>
      </div>
    </>
  );
}
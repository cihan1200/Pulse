import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();

  return (
    <>
      <div className="container">
        <form className="form">
          <h2 className="header-text">Login</h2>
          <input className="input" placeholder="Email" />
          <input className="input" type="password" placeholder="Password" />
          <button className="signup-button" type="submit">Login</button>
          <div className="divider">OR</div>
          <button className="google-button" type="button" onClick={() => { navigate("/"); }}>Sign Up</button>
        </form>
      </div>
    </>
  );
}
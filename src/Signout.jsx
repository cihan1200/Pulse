import { useNavigate } from "react-router-dom";

export default function Signout() {
  const navigate = useNavigate();
  const handleSignout = () => {
    localStorage.removeItem("authToken");
    navigate("/");
  };

  return (
    <div className="signout-container">
      <div className="signout-card">
        <h1>Sign Out</h1>
        <p>Are you sure you want to sign out?</p>
        <div className="signout-buttons-container">
          <button onClick={handleSignout}>Yes, sign out</button>
          <button onClick={() => navigate("/home")}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

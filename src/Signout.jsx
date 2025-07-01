export default function Signout() {
  const handleSignout = () => {
    localStorage.removeItem("authToken");
    window.location.href = "/";
  };

  return (
    <div>
      <h1>Sign Out</h1>
      <p>Are you sure you want to sign out?</p>
      <button onClick={handleSignout}>Yes, sign out</button>
    </div>
  );
}

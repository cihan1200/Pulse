import pulseLogo from "./assets/pulse-logo.svg";
import plusIcon from "./assets/plus-icon.svg";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

export default function Header() {
  const [isDarkTheme, setIsDarkTheme] = useState(() => {
    return localStorage.getItem("theme") === "dark";
  });
  const navigate = useNavigate();
  const checkboxRef = useRef(null);

  useEffect(() => {
    const body = document.body;
    if (isDarkTheme) {
      body.style.color = "#ececec";
      body.style.backgroundColor = "#212121";
    } else {
      body.style.color = "#212121";
      body.style.backgroundColor = "#ececec";
    }

    if (checkboxRef.current) {
      checkboxRef.current.checked = isDarkTheme;
    }
  }, [isDarkTheme]);

  const toggleMenu = () => {
    const menu = document.getElementById("menu");
    menu.classList.toggle("hidden");
  };

  const toggleTheme = () => {
    setIsDarkTheme((prevTheme) => {
      const newTheme = !prevTheme;
      localStorage.setItem("theme", newTheme ? "dark" : "light");
      return newTheme;
    });
  };

  return (
    <>
      <header className="header">
        <button className="brand" onClick={() => { navigate("/home"); }}>
          <img className="brand-logo" src={pulseLogo} alt="vite logo" />
          <span>Pulse</span>
        </button>
        <input className="search-bar" type="text" />
        <div className="header-buttons">
          <button className="create-button" onClick={() => { navigate("/create"); }}><img className="plus-icon" src={plusIcon} alt="plus icon" />Create</button>
          <button className="menu-button" aria-label="Toggle menu" onClick={toggleMenu}>☰</button>
        </div>
      </header>
      <div className="menu-wrapper">
        <nav className="menu hidden" id="menu">
          <button className="links-button" onClick={() => { navigate("/home"); }}>Home</button>
          <button className="links-button" onClick={() => { navigate("/profile"); }}>Profile</button>
          <button className="links-button" onClick={() => { navigate("/signout"); }}>Sign Out</button>
          <label className="switch">
            <input type="checkbox" onChange={toggleTheme} ref={checkboxRef} />
            <span className="slider round">🌙☀️</span>
          </label>
        </nav>
      </div>
    </>
  );
}

import "./Header.css";
import pulseLogo from "./assets/pulse-logo.svg";
import { useState } from "react";

export default function Header() {
  const [isDarkTheme, setIsDarkTheme] = useState(false);

  const toggleMenu = () => {
    const menu = document.getElementById("menu");
    menu.classList.toggle("hidden");
  };

  const toggleTheme = () => {
    const body = document.body;
    if (isDarkTheme) {
      body.style.color = "#212121";
      body.style.backgroundColor = "#ececec";
    } else {
      body.style.color = "#ececec";
      body.style.backgroundColor = "#212121";
    }
    setIsDarkTheme(!isDarkTheme);
  };

  return (
    <>
      <header className="header">
        <a className="brand" href="/home">
          <img className="brand-logo" src={pulseLogo} alt="vite logo" />
          <span>Pulse</span>
        </a>
        <input className="search-bar" type="text" />
        <button className="menu-button" aria-label="Toggle menu" onClick={toggleMenu}>☰</button>
      </header>
      <div className="menu-wrapper">
        <nav className="menu hidden" id="menu">
          <a href="/home">Home</a>
          <a href="/about">About</a>
          <a href="/services">Profile</a>
          <a href="/contact">Contact</a>
          <label className="switch">
            <input type="checkbox" onClick={toggleTheme} />
            <span className="slider round">🌙☀️</span>
          </label>
        </nav>
      </div>
    </>
  );
}

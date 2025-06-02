import "./Footer.css";
import pulseLogo from "./assets/pulse-logo.svg";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <img className="pulse-logo" src={pulseLogo} alt="pulse logo" />
      <p className="footer-text">© {currentYear} Pulse</p>
    </footer>
  );
}
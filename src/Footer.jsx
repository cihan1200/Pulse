import "./Footer.css";
import pulseLogo from "./assets/pulse-logo.svg";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <p className="footer-text"><img className="pulse-logo" src={pulseLogo} alt="pulse logo" />Pulse</p>
      <p className="footer-date">&copy; {currentYear}</p>
    </footer>
  );
}
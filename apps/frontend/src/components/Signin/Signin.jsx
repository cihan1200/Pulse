import { useEffect, useState } from "react";
import { X, Eye, EyeOff } from "lucide-react";
import { useGoogleLogin } from "@react-oauth/google";
import api from "@/api/axios";
import styles from "./Signin.module.css";

export default function Signin({ onClose, onSignup }) {
  const [closing, setClosing] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    document.body.style.overflow = "hidden";
    const esc = (e) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", esc);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", esc);
    };
  }, []);

  const handleClose = () => {
    setClosing(true);
    setTimeout(onClose, 200);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("All fields are required");
      return;
    }

    try {
      setLoading(true);
      const res = await api.post("/auth/signin", { email, password });
      handleAuthSuccess(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Signin failed");
      setLoading(false);
    }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        setLoading(true);
        const res = await api.post("/auth/google", {
          googleToken: tokenResponse.access_token,
        });
        handleAuthSuccess(res.data);
      } catch (err) {
        console.error(err);
        setError("Google authentication failed");
        setLoading(false);
      }
    },
    onError: () => {
      setError("Google Login Failed");
      setLoading(false);
    },
  });

  const handleAuthSuccess = (data) => {
    const { token, user } = data;
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("auth-loading", "true");
    window.location.reload();
  };

  return (
    <div
      className={`${styles["overlay"]} ${closing ? styles["fade-out"] : ""}`}
      onClick={handleClose}
    >
      <div
        className={`${styles["modal"]} ${closing ? styles["scale-out"] : ""}`}
        onClick={(e) => e.stopPropagation()}
      >
        <button className={styles["close"]} onClick={handleClose}>
          <X size="1.2em" />
        </button>

        <h2 className={styles["title"]}>Sign in</h2>

        <form className={styles["form"]} onSubmit={handleSubmit} noValidate>
          {error && <span className={styles["error"]}>{error}</span>}

          <input
            type="text"
            placeholder="Email"
            className={styles["input"]}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <div className={styles["password-wrapper"]}>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              className={styles["input"]}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              className={styles["eye-btn"]}
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <button type="submit" className={styles["submit"]} disabled={loading}>
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <div className={styles["divider"]}>
          <span>OR</span>
        </div>

        <button
          className={styles["google-btn"]}
          onClick={() => googleLogin()}
          type="button"
        >
          Continue with Google
        </button>

        <p className={styles["signup-text"]}>
          Don’t have an account?
          <button
            type="button"
            className={styles["signup-btn"]}
            onClick={onSignup}
          >
            Sign up
          </button>
        </p>
      </div>
    </div>
  );
}
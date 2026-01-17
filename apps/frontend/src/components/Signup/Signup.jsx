import { useEffect, useState } from "react";
import { X, Eye, EyeOff } from "lucide-react";
import { useGoogleLogin } from "@react-oauth/google"; // 1. Import Hook
import api from "@/api/axios";
import styles from "./Signup.module.css";

export default function Signup({ onClose, onSignin }) {
  const [closing, setClosing] = useState(false);
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    document.body.style.overflow = "hidden";
    const onEsc = (e) => e.key === "Escape" && close();
    window.addEventListener("keydown", onEsc);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onEsc);
    };
  }, []);

  const close = () => {
    setClosing(true);
    setTimeout(onClose, 180);
  };

  // --- 2. Shared Success Handler ---
  const handleAuthSuccess = (data) => {
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    localStorage.setItem("auth-loading", "true");
    window.location.reload();
  };

  // --- 3. Google Login Hook ---
  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        setLoading(true);
        setError("");
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

  const submit = async (e) => {
    e.preventDefault();
    setError("");

    // ... (Your existing validation logic remains exactly the same) ...
    if (!form.username) return setError("Username is required");
    if (form.username.length < 8) return setError("Username must be at least 8 characters");
    if (form.username.length > 20) return setError("Username cannot exceed 20 characters");
    if (!form.email || !form.password) return setError("All fields are required");
    if (!form.email.includes("@") || !form.email.includes(".") || form.email.length > 254) return setError("Enter a valid email");
    if (form.password.length < 8) return setError("Password must be at least 8 characters");
    if (form.password.length > 50) return setError("Password cannot exceed 50 characters");

    try {
      setLoading(true);
      const { data } = await api.post("/auth/signup", form);
      handleAuthSuccess(data);
    } catch (err) {
      setError(err.response?.data?.message || "Signup failed");
      setLoading(false);
    }
  };

  return (
    <div
      className={`${styles["overlay"]} ${closing ? styles["fade"] : ""}`}
      onClick={close}
    >
      <div
        className={`${styles["modal"]} ${closing ? styles["scale"] : ""}`}
        onClick={(e) => e.stopPropagation()}
      >
        <button className={styles["close"]} onClick={close}>
          <X size="1.1em" />
        </button>

        <h2 className={styles["title"]}>Create your account</h2>

        <form className={styles["form"]} onSubmit={submit} noValidate>
          {error && <span className={styles["error"]}>{error}</span>}

          <input
            className={styles["input"]}
            placeholder="Username (8-20 chars)"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            maxLength={20}
          />

          <input
            className={styles["input"]}
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />

          <div className={styles["password-wrapper"]}>
            <input
              type={showPassword ? "text" : "password"}
              className={styles["input"]}
              placeholder="Password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              maxLength={50}
            />
            <button
              type="button"
              className={styles["eye-btn"]}
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <button className={styles["submit"]} disabled={loading}>
            {loading ? "Creating..." : "Sign up"}
          </button>
        </form>

        <div className={styles["divider"]}>
          <span>OR</span>
        </div>

        {/* 4. Updated Google Button */}
        <button
          className={styles["google-btn"]}
          onClick={() => googleLogin()}
          type="button"
        >
          Continue with Google
        </button>

        <p className={styles["signin-text"]}>
          Already have an account?
          <button
            className={styles["signin-btn"]}
            onClick={onSignin}>
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
}
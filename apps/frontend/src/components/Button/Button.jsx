import styles from "./Button.module.css";

export default function Button({ children, variant = "primary", onClick, type = "button", disabled = false }) {
  return (
    <button
      className={disabled ? `${styles.disabled} ${styles.btn} ${styles[variant]}` : `${styles.btn} ${styles[variant]}`}
      onClick={onClick}
      type={type}
    >
      {children}
    </button>
  );
}
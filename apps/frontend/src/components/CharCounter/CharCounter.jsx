import styles from "./CharCounter.module.css";

export default function CharCounter({ count, limit }) {
  return (
    <span className={styles["char-counter"]}>
      {count}/{limit}
    </span>
  );
}
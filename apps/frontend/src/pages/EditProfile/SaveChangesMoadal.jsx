import styles from "./SaveChangesModal.module.css";
import { X } from "lucide-react";
import CharCounter from "@/components/CharCounter";
import Button from "@/components/Button";
import { useState, useEffect } from "react";

export default function SaveChangesModal({ field, initialValue, onClose, onSave }) {
  const [value, setValue] = useState(initialValue || "");
  const [isClosing, setIsClosing] = useState(false);

  // 1. Handle Scroll Locking
  useEffect(() => {
    // Disable scrolling on mount
    document.body.style.overflow = 'hidden';

    // Re-enable scrolling on unmount (cleanup)
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  // 2. Update local state if prop changes
  useEffect(() => {
    setValue(initialValue || "");
  }, [initialValue]);

  const FIELD_DATA = {
    username: { limit: 30, info: "Change your username", type: "text" },
    email: { limit: 254, info: "Change your email address", type: "email" },
    bio: { limit: 200, info: "Tell other people about yourself", type: "text" },
    password: { limit: 64, info: "Change your password", type: "password" }
  };

  const triggerClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 200);
  };

  const handleSave = () => {
    onSave(field, value);
    triggerClose();
  };

  const currentFieldData = FIELD_DATA[field] || FIELD_DATA.username;

  return (
    <div
      className={`${styles.overlay} ${isClosing ? styles.closing : ''}`}
      onClick={triggerClose}
    >
      <div
        className={`${styles["modal-card"]} ${isClosing ? styles.closing : ''}`}
        onClick={(e) => e.stopPropagation()}
      >

        <div className={styles["first-row"]}>
          <span className={styles["title"]}>
            {field === 'bio' ? 'About description' : field}
          </span>
          <div className={styles["close-button"]} onClick={triggerClose}>
            <X size={20} />
          </div>
        </div>

        <div className={styles["second-row"]}>
          <span className={styles["info"]}>{currentFieldData.info}</span>

          <div className={styles.input}>
            {field === "bio" ? (
              <textarea
                placeholder="About (optional)"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                maxLength={currentFieldData.limit}
              />
            ) : (
              <input
                type={currentFieldData.type}
                placeholder={`New ${field}`}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                maxLength={currentFieldData.limit}
              />
            )}

            <CharCounter count={value.length} limit={currentFieldData.limit} />
          </div>
        </div>

        <div className={styles["third-row"]}>
          <Button onClick={triggerClose} variant="secondary">Cancel</Button>
          <Button onClick={handleSave}>Save</Button>
        </div>

      </div>
    </div>
  );
}
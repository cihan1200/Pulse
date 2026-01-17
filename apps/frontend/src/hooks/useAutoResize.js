import { useEffect } from "react";

/**
 * Automatically resizes a textarea based on its content.
 * @param {React.RefObject} ref - The ref to the textarea element
 * @param {string} value - The text value to watch for changes
 */
export const useAutoResize = (ref, value) => {
  useEffect(() => {
    if (ref.current) {
      ref.current.style.height = "auto";
      ref.current.style.height = `${ref.current.scrollHeight}px`;
    }
  }, [ref, value]);
};
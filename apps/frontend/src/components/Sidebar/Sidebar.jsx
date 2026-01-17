import styles from "./Sidebar.module.css";
import { Home, TrendingUp, Telescope } from "lucide-react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const currentSort = searchParams.get("sort");

  // Helper to check active state
  const isActive = (path, sort) => {
    if (sort) return currentSort === sort;
    // Ensure we match the exact path and have no sort param (unless it's the explore page which doesn't use sort)
    return location.pathname === path && !currentSort;
  };

  return (
    <aside className={styles["sidebar"]}>
      <nav className={styles["sidebar-nav"]}>

        {/* Home */}
        <div
          onClick={() => navigate("/")}
          className={`${styles["navItem"]} ${isActive("/", null) ? styles["active"] : ""}`}
        >
          <Home size="1.2em" /> Home
        </div>

        {/* Popular */}
        <div
          onClick={() => navigate("/?sort=popular")}
          className={`${styles["navItem"]} ${isActive("/", "popular") ? styles["active"] : ""}`}
        >
          <TrendingUp size="1.2em" /> Popular
        </div>

        {/* Explore */}
        <div
          onClick={() => navigate("/explore")}
          className={`${styles["navItem"]} ${isActive("/explore", null) ? styles["active"] : ""}`}
        >
          <Telescope size="1.2em" /> Explore
        </div>

      </nav>
    </aside>
  );
}
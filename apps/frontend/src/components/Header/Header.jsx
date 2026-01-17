import styles from "./Header.module.css";
import {
  Search,
  Plus,
  Menu,
  User,
  Settings,
  LogOut,
  Moon,
  Check,
  Image as ImageIcon,
  FileText,
  Video,
  X,
  Home,
  TrendingUp,
  Telescope
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import Button from "@/components/Button";
import Signin from "@/components/Signin";
import Signup from "@/components/Signup";
import { getImageUrl } from "@/utils/imageHelper";
import api from "@/api/axios";
import { safeGetJSON } from "@/utils/safeStorage";

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();

  const [showSignin, setShowSignin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const [user, setUser] = useState(null);
  const [panelVisible, setPanelVisible] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Search State
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchContainerRef = useRef(null);
  const mobileSearchRef = useRef(null);

  const openTimer = useRef(null);
  const closeTimer = useRef(null);
  const avatarUrl = user?.profilePicture
    ? getImageUrl(user.profilePicture)
    : "https://api.dicebear.com/9.x/shapes/svg?seed=guest";

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [mobileMenuOpen]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchTerm.trim()) {
        try {
          const { data } = await api.get(`/posts?search=${searchTerm}&limit=6`);
          setSearchResults(data);
          setShowDropdown(true);
        } catch (error) {
          console.error("Search failed", error);
        }
      } else {
        setSearchResults([]);
        setShowDropdown(false);
      }
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      const clickedMain =
        searchContainerRef.current &&
        searchContainerRef.current.contains(event.target);
      const clickedMobile =
        mobileSearchRef.current &&
        mobileSearchRef.current.contains(event.target);

      if (!clickedMain && !clickedMobile) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getPostIcon = (type) => {
    if (type === "image") return <ImageIcon size={16} />;
    if (type === "video") return <Video size={16} />;
    return <FileText size={16} />;
  };

  const handleResultClick = (postId) => {
    navigate(`/post/${postId}`);
    setShowDropdown(false);
    setSearchTerm("");
    setMobileMenuOpen(false);
  };

  const handleMobileNav = (path) => {
    navigate(path);
    setMobileMenuOpen(false);
  };

  useEffect(() => {
    const loadingFlag = localStorage.getItem("auth-loading");
    if (loadingFlag) {
      setAuthLoading(true);
      localStorage.removeItem("auth-loading");
      window.location.reload();
      return;
    }
    if (storedUser) setUser(safeGetJSON(storedUser, null));
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = (e) => {
    e.stopPropagation();
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  const handleMouseEnter = () => {
    clearTimeout(closeTimer.current);
    openTimer.current = setTimeout(() => setPanelVisible(true), 120);
  };

  const handleMouseLeave = () => {
    clearTimeout(openTimer.current);
    closeTimer.current = setTimeout(() => setPanelVisible(false), 180);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.reload();
  };

  if (authLoading) {
    return (
      <div className={styles["auth-loading"]}>
        <div className={styles["spinner"]} />
      </div>
    );
  }

  // --- LOGIC FIX HERE ---
  // Ensure "Home" is only active if pathname is "/" AND there is no sort query
  const isHomeActive = location.pathname === "/" && !location.search.includes("sort=popular");
  const isPopularActive = location.search.includes("sort=popular");
  const isExploreActive = location.pathname === "/explore";

  return (
    <>
      <header className={styles["header"]}>
        <div
          className={styles["navigation-menu-button"]}
          onClick={() => setMobileMenuOpen(true)}
        >
          <Menu size={24} />
        </div>

        <a href="/" className={styles["brand"]}>
          pulse
        </a>

        {/* Desktop Searchbar */}
        <div className={styles["searchbar"]} ref={searchContainerRef}>
          <Search size={18} className={styles["searchbar-icon"]} />
          <input
            type="text"
            placeholder="Find anything"
            className={styles["searchbar-input"]}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => {
              if (searchTerm) setShowDropdown(true);
            }}
          />
          {showDropdown && searchTerm && (
            <div className={styles["search-dropdown"]}>
              {searchResults.length > 0 ? (
                searchResults.map((post) => (
                  <div
                    key={post._id}
                    className={styles["search-result-item"]}
                    onClick={() => handleResultClick(post._id)}
                  >
                    <div className={styles["result-icon"]}>
                      {getPostIcon(post.postType)}
                    </div>
                    <div className={styles["result-info"]}>
                      <span className={styles["result-title"]}>
                        {post.postTitle}
                      </span>
                      <span className={styles["result-author"]}>
                        by {post.postedBy?.username}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className={styles["no-results"]}>
                  No results found for "{searchTerm}"
                </div>
              )}
            </div>
          )}
        </div>

        <div className={styles["actions"]}>
          <div
            className={styles["create-post"]}
            onClick={() => navigate("/create_post")}
          >
            <Plus size="1.4em" />
            <span>Create</span>
          </div>
          {!user && (
            <Button onClick={() => setShowSignin(true)}>Signin</Button>
          )}
          {user && (
            <div
              className={styles["user-hover-area"]}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              {user.profilePicture ? (
                <img
                  src={avatarUrl}
                  alt="Profile"
                  className={styles["header-profile-picture"]}
                />
              ) : (
                <User className={styles["user-icon"]} />
              )}
              <div
                className={`${styles["user-panel"]} ${panelVisible ? styles["open"] : styles["closed"]
                  }`}
              >
                <div className={styles["user-section"]}>
                  <div className={styles["panel-user-info"]}>
                    <img
                      src={avatarUrl}
                      alt="User Avatar"
                      className={styles["panel-avatar"]}
                    />
                    <span className={styles["user-email"]}>
                      {user.email.length > 50
                        ? `${user.email.slice(0, 50)}...`
                        : user.email}
                    </span>
                  </div>
                </div>
                <div className={styles["divider"]}></div>
                <div className={styles["menu-section"]}>
                  <div
                    className={styles["menu-item"]}
                    onClick={() => {
                      setPanelVisible(false);
                      navigate(`/profile/${user.id}`);
                    }}
                  >
                    <User size={18} />
                    <span>View Profile</span>
                  </div>
                  <div className={styles["menu-item"]} onClick={toggleTheme}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.8rem" }}>
                      <Moon size={18} />
                      <span>Dark Mode</span>
                    </div>
                    <div
                      className={`${styles["toggle"]} ${theme === "dark" ? styles["toggle-active"] : ""
                        }`}
                    >
                      <div className={styles["toggle-handle"]}>
                        {theme === "dark" && (
                          <Check size={14} strokeWidth={3} color="#6366f1" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <div className={styles["divider"]}></div>
                <div className={styles["menu-section"]}>
                  <div className={styles["menu-item"]}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.8rem" }}>
                      <Settings size={18} />
                      <span>Settings</span>
                    </div>
                  </div>
                  <div
                    className={`${styles["menu-item"]} ${styles["danger"]}`}
                    onClick={handleLogout}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "0.8rem" }}>
                      <LogOut size={18} />
                      <span>Log Out</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* --- MOBILE MENU OVERLAY --- */}
      <div
        className={`${styles["mobile-menu-overlay"]} ${mobileMenuOpen ? styles["open"] : ""
          }`}
        onClick={() => setMobileMenuOpen(false)}
      >
        <div
          className={styles["mobile-menu-content"]}
          onClick={(e) => e.stopPropagation()}
        >
          <div className={styles["mobile-header"]}>
            <span className={styles["brand"]}>pulse</span>
            <button
              className={styles["close-btn"]}
              onClick={() => setMobileMenuOpen(false)}
            >
              <X size={20} />
            </button>
          </div>

          <div
            className={styles["mobile-search-container"]}
            ref={mobileSearchRef}
          >
            <Search size={18} className={styles["searchbar-icon"]} />
            <input
              type="text"
              placeholder="Find anything"
              className={styles["searchbar-input"]}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onFocus={() => {
                if (searchTerm) setShowDropdown(true);
              }}
            />
            {/* Reusing the search dropdown for mobile */}
            {showDropdown && searchTerm && (
              <div className={styles["search-dropdown"]}>
                {searchResults.length > 0 ? (
                  searchResults.map((post) => (
                    <div
                      key={post._id}
                      className={styles["search-result-item"]}
                      onClick={() => handleResultClick(post._id)}
                    >
                      <div className={styles["result-icon"]}>
                        {getPostIcon(post.postType)}
                      </div>
                      <div className={styles["result-info"]}>
                        <span className={styles["result-title"]}>
                          {post.postTitle}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className={styles["no-results"]}>No results found</div>
                )}
              </div>
            )}
          </div>

          <nav className={styles["mobile-nav"]}>
            <div
              className={`${styles["mobile-nav-item"]} ${isHomeActive ? styles["active"] : ""
                }`}
              onClick={() => handleMobileNav("/")}
            >
              <Home size={20} />
              <span>Home</span>
            </div>
            <div
              className={`${styles["mobile-nav-item"]} ${isPopularActive ? styles["active"] : ""
                }`}
              onClick={() => handleMobileNav("/?sort=popular")}
            >
              <TrendingUp size={20} />
              <span>Popular</span>
            </div>
            <div
              className={`${styles["mobile-nav-item"]} ${isExploreActive ? styles["active"] : ""
                }`}
              onClick={() => handleMobileNav("/explore")}
            >
              <Telescope size={20} />
              <span>Explore</span>
            </div>
          </nav>
        </div>
      </div>

      {showSignin && (
        <Signin
          onClose={() => setShowSignin(false)}
          onSignup={() => {
            setShowSignin(false);
            setShowSignup(true);
          }}
        />
      )}
      {showSignup && (
        <Signup
          onClose={() => setShowSignup(false)}
          onSignin={() => {
            setShowSignup(false);
            setShowSignin(true);
          }}
        />
      )}
    </>
  );
}
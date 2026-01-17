import { useEffect, useState, useMemo, Fragment } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Calendar, MapPin, Heart, MessageCircle, Grid, Pen } from "lucide-react";
import { getImageUrl } from "@/utils/imageHelper";
import styles from "./Profile.module.css";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import Post from "@/components/Post";
import api from "@/api/axios";
import RightSidebar from "@/components/RightSidebar";

export default function Profile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [profileUser, setProfileUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [userComments, setUserComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("posts");

  // NEW: Follow State for Profile Page
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);

  const currentUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user"));
    } catch {
      return null;
    }
  }, []);

  const isOwnProfile = currentUser?.id === id;

  const formatPostContent = (postsData) => {
    return postsData.map((post) => ({
      ...post,
      postContent:
        post.postType === "text"
          ? post.postContent
          : post.postContent.map(getImageUrl),
    }));
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const userRes = await api.get(`/users/${id}`);
        const user = userRes.data;
        setProfileUser(user);

        // Initialize follow state (check if array contains current ID)
        if (currentUser) {
          const followers = user.followers || [];
          setIsFollowing(followers.includes(currentUser.id));
          setFollowerCount(followers.length);
        } else {
          setFollowerCount(user.followers ? user.followers.length : 0);
        }

        const postsRes = await api.get(`/posts?userId=${id}`);
        setPosts(formatPostContent(postsRes.data));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      setPosts([]);
      setUserComments([]);
      setActiveTab("posts");
      fetchData();
    }
  }, [id, currentUser]);

  // NEW: Handle Follow on Profile Page
  const handleFollow = async () => {
    if (!currentUser) return; // Add login prompt logic if needed

    // Optimistic Update
    if (isFollowing) {
      setIsFollowing(false);
      setFollowerCount(prev => Math.max(0, prev - 1));
    } else {
      setIsFollowing(true);
      setFollowerCount(prev => prev + 1);
    }

    try {
      await api.put(`/users/${id}/follow`);
    } catch (err) {
      console.error(err);
      // Revert on error
      setIsFollowing(!isFollowing);
      setFollowerCount(isFollowing ? followerCount + 1 : followerCount - 1);
    }
  };

  useEffect(() => {
    const fetchComments = async () => {
      if (activeTab === "comments" && userComments.length === 0) {
        try {
          const res = await api.get(`/posts/comments/${id}`);
          setUserComments(res.data);
        } catch (err) {
          console.error(err);
        }
      }
    };

    fetchComments();
  }, [activeTab, id, userComments.length]);

  const renderTabContent = () => {
    if (activeTab === "comments") {
      if (userComments.length === 0) {
        return <div className={styles["empty-message"]}>No comments yet.</div>;
      }
      return (
        <div className={styles["feed-list"]}>
          {userComments.map((comment, index) => (
            <div
              key={`${comment._id}-${index}`}
              className={styles["comment-card"]}
              onClick={() => navigate(`/post/${comment.postId}`)}
            >
              <div className={styles["comment-meta"]}>
                <MessageCircle size={16} className={styles["comment-icon"]} />
                <span>Commented on <strong>{comment.postTitle}</strong></span>
                <span className={styles["comment-date"]}>
                  • {new Date(comment.createdAt).toLocaleDateString()}
                </span>
              </div>
              <p className={styles["comment-text"]}>{comment.text}</p>
            </div>
          ))}
        </div>
      );
    }

    if (activeTab === "likes") {
      const likedPosts = posts.filter(post => post.likes.length > 0);
      if (likedPosts.length === 0) {
        return <div className={styles["empty-message"]}>No liked posts yet.</div>;
      }
      return (
        <div className={styles["feed-list"]}>
          {likedPosts.map((post, index) => (
            <Fragment key={post._id}>
              <Post {...post} />
              {index < likedPosts.length - 1 && <div className={styles["divider"]} />}
            </Fragment>
          ))}
        </div>
      );
    }

    if (posts.length === 0) {
      return <div className={styles["empty-message"]}>No posts yet.</div>;
    }

    return (
      <div className={styles["feed-list"]}>
        {posts.map((post, index) => (
          <Fragment key={post._id}>
            <Post {...post} />
            {index < posts.length - 1 && <div className={styles["divider"]} />}
          </Fragment>
        ))}
      </div>
    );
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className={styles["spinner-container"]}>
          <div className={styles["spinner"]}></div>
        </div>
      );
    }

    if (!profileUser) return <p className={styles["empty-message"]}>User not found.</p>;

    return (
      <div className={styles["container"]}>
        <div className={styles["profile-header"]}>
          <div className={styles["banner"]}>
            {profileUser.bannerPicture &&
              <img
                src={getImageUrl(profileUser.bannerPicture)}
                alt="banner image"
              />
            }
          </div>

          <div className={styles["profile-info-container"]}>
            <div className={styles["avatar-wrapper"]}>
              <img
                src={getImageUrl(profileUser.profilePicture)}
                alt="Profile"
                className={styles["avatar"]}
              />
            </div>

            {/* Edit/Follow Button */}
            <button
              className={styles["edit-profile-btn"]}
              onClick={() => isOwnProfile ? navigate("/edit-profile") : handleFollow()}
              style={(!isOwnProfile && isFollowing) ? { backgroundColor: "#d1d5db", color: "#374151" } : {}}
            >
              {isOwnProfile ? (
                <>
                  <Pen size="1em" />
                  Edit Profile
                </>
              ) : (
                isFollowing ? "Unfollow" : "Follow"
              )}
            </button>
          </div>

          <div className={styles["bio-section"]}>
            <div>
              <h1 className={styles["fullname"]}>{profileUser.username}</h1>
              <span className={styles["username"]}>{profileUser.email}</span>
            </div>

            <p className={styles["bio"]}>
              {profileUser.bio || "No bio available."}
            </p>

            <div className={styles["meta-info"]}>
              <div className={styles["meta-item"]}>
                <Calendar size={16} />
                <span>Joined {new Date(profileUser.createdAt).toLocaleDateString()}</span>
              </div>
              <div className={styles["meta-item"]}>
                <MapPin size={16} />
                <span>Earth</span>
              </div>
            </div>

            <div className={styles["stats-row"]}>
              <span className={styles["stat"]}>
                <span className={styles["stat-value"]}>{followerCount}</span>
                Followers
              </span>
              <span className={styles["stat"]}>
                {/* Following count would be profileUser.following.length if populated */}
                <span className={styles["stat-value"]}>{profileUser.following?.length || 0}</span>
                Following
              </span>
              <span className={styles["stat"]}>
                <span className={styles["stat-value"]}>{posts.length}</span>
                Posts
              </span>
            </div>
          </div>

          <div className={styles["tabs"]}>
            <button
              className={`${styles["tab"]} ${activeTab === "posts" ? styles["active-tab"] : ""}`}
              onClick={() => setActiveTab("posts")}
            >
              <Grid size={18} />
              <span>Posts</span>
            </button>
            <button
              className={`${styles["tab"]} ${activeTab === "comments" ? styles["active-tab"] : ""}`}
              onClick={() => setActiveTab("comments")}
            >
              <MessageCircle size={18} />
              <span>Comments</span>
            </button>
            <button
              className={`${styles["tab"]} ${activeTab === "likes" ? styles["active-tab"] : ""}`}
              onClick={() => setActiveTab("likes")}
            >
              <Heart size={18} />
              <span>Likes</span>
            </button>
          </div>
        </div>

        <div className={styles["feed-content"]}>
          {renderTabContent()}
        </div>
      </div>
    );
  };

  return (
    <>
      <Header />
      <Sidebar />
      <RightSidebar />
      {renderContent()}
    </>
  );
}
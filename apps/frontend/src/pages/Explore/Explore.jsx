import { useState, useEffect, Fragment } from "react";
import {
  Cpu,
  Gamepad2,
  Music,
  Palette,
  FlaskConical,
  Trophy,
  Globe,
  Coffee,
  ArrowLeft
} from "lucide-react";
import api from "@/api/axios";
import { formatDistanceToNow } from "date-fns";
import styles from "./Explore.module.css";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import Post from "@/components/Post";
import RightSidebar from "@/components/RightSidebar";

const CATEGORIES = [
  {
    name: "General",
    icon: <Globe size={24} />,
    desc: "Everything and anything. The melting pot of discussions."
  },
  {
    name: "Technology",
    icon: <Cpu size={24} />,
    desc: "Gadgets, coding, AI, and the future of tech."
  },
  {
    name: "Lifestyle",
    icon: <Coffee size={24} />,
    desc: "Travel, food, health, and daily living advice."
  },
  {
    name: "Gaming",
    icon: <Gamepad2 size={24} />,
    desc: "Esports, reviews, walkthroughs, and memes."
  },
  {
    name: "Art",
    icon: <Palette size={24} />,
    desc: "Digital art, sketches, photography, and creativity."
  },
  {
    name: "Music",
    icon: <Music size={24} />,
    desc: "New releases, classics, theory, and instruments."
  },
  {
    name: "Science",
    icon: <FlaskConical size={24} />,
    desc: "Physics, biology, space, and discoveries."
  },
  {
    name: "Sports",
    icon: <Trophy size={24} />,
    desc: "Scores, highlights, discussions, and fandoms."
  }
];

export default function Explore() {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!selectedCategory) return;

    const fetchCategoryPosts = async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/posts?category=${selectedCategory}`);

        const formattedPosts = data.map((post) => ({
          ...post,
          postContent:
            post.postType === "text"
              ? post.postContent
              : post.postContent.map((path) =>
                path.startsWith("http") ? path : `http://localhost:5000${path}`
              ),
          date: formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })
        }));

        setPosts(formattedPosts);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryPosts();
  }, [selectedCategory]);

  const handleBack = () => {
    setSelectedCategory(null);
    setPosts([]);
  };

  return (
    <>
      <Header />
      <Sidebar />
      <RightSidebar />
      <div className={styles["container"]}>

        {!selectedCategory ? (
          <>
            <div className={styles["header"]}>
              <h1 className={styles["title"]}>Explore Communities</h1>
              <span className={styles["subtitle"]}>Browse categories to find your interests</span>
            </div>

            <div className={styles["grid"]}>
              {CATEGORIES.map((cat) => (
                <div
                  key={cat.name}
                  className={styles["card"]}
                  onClick={() => setSelectedCategory(cat.name)}
                >
                  <div className={styles["card-header"]}>
                    <div className={styles["icon-wrapper"]}>
                      {cat.icon}
                    </div>
                  </div>
                  <h3 className={styles["card-title"]}>{cat.name}</h3>
                  <p className={styles["card-description"]}>{cat.desc}</p>
                  <button className={styles["view-btn"]}>View Posts</button>
                </div>
              ))}
            </div>
          </>
        ) : (
          <>
            <div className={styles["feed-header"]}>
              <button onClick={handleBack} className={styles["back-btn"]}>
                <ArrowLeft size={20} />
              </button>
              <h1 className={styles["category-title"]}>{selectedCategory}</h1>
            </div>

            {loading ? (
              <div className={styles["spinner-container"]}>
                <div className={styles["spinner"]} />
              </div>
            ) : (
              <div>
                {posts.length === 0 ? (
                  <p className={styles["empty-message"]}>
                    No posts found in <strong>{selectedCategory}</strong> yet.
                  </p>
                ) : (
                  posts.map((item, index) => (
                    <Fragment key={item._id}>
                      <Post {...item} />
                      {index < posts.length - 1 && <div className={styles["divider"]} />}
                    </Fragment>
                  ))
                )}
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
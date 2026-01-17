import { Routes, Route } from "react-router-dom";
import Home from "@/pages/Home";
import CreatePost from "@/pages/CreatePost";
import Profile from "@/pages/Profile";
import PostDetails from "@/pages/PostDetails";
import EditProfile from "@/pages/EditProfile";
import Explore from "@/pages/Explore";

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/create_post" element={<CreatePost />} />
        <Route path="/profile/:id" element={<Profile />} />
        <Route path="/post/:id" element={<PostDetails />} />
        <Route path="/edit-profile" element={<EditProfile />} />
        <Route path="/explore" element={<Explore />} />
        <Route path="*" element={<div>Page Not Found</div>} />
      </Routes>
    </>
  );
}
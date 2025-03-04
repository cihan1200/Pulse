import Header from "./Header";
import Post from "./Post";
import { jwtDecode } from "jwt-decode";

export default function Home() {
  const token = localStorage.getItem("authToken");
  if (token) {
    const decodedToken = jwtDecode(token);
    console.log(decodedToken);
  }

  return (
    <>
      <Header />
      <Post />
      <Post />
      <Post />
      <Post />
      <Post />
    </>
  );
}
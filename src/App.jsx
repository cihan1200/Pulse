import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Home from "./Home";
import SignUp from "./SignUp";
import PrivateRoute from "./PrivateRoute";
import Login from "./Login";
import Create from "./Create";
import Comments from "./Comments";
import Profile from "./Profile";
import Signout from "./Signout";

export default function App() {
  const router = createBrowserRouter([{
    path: "/home",
    element: (
      <PrivateRoute>
        <Home />
      </PrivateRoute>
    )
  },
  {
    path: "/create",
    element: (
      <PrivateRoute>
        <Create />
      </PrivateRoute>
    )
  },
  {
    path: "/",
    element: <SignUp />
  },
  {
    path: "/login",
    element: <Login />
  },
  {
    path: "/comments",
    element: (
      <PrivateRoute>
        <Comments />
      </PrivateRoute>
    )
  },
  {
    path: "/profile",
    element: (
      <PrivateRoute>
        <Profile />
      </PrivateRoute>
    )
  },
  {
    path: "/signout",
    element: (
      <PrivateRoute>
        <Signout />
      </PrivateRoute>
    )
  }
  ]);

  return (
    <>
      <RouterProvider router={router} />
    </>
  );
}

import "./App.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Home from "./Home";
import SignUp from "./SignUp";
import PrivateRoute from "./PrivateRoute";
import Login from "./Login";
import Create from "./Create";
import Comments from "./Comments";
import Test from "./test";

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
    path: "/test",
    element: (
      <PrivateRoute>
        <Test />
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

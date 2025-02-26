import "./App.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Home from "./Home";
import SignUp from "./SignUp";
import PrivateRoute from "./PrivateRoute";
import Login from "./Login";

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
    path: "/",
    element: <SignUp />
  },
  {
    path: "/login",
    element: <Login />
  }
  ]);

  return (
    <>
      <RouterProvider router={router} />
    </>
  );
}

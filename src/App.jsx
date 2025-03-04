import "./App.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Home from "./Home";
import SignUp from "./SignUp";
import PrivateRoute from "./PrivateRoute";
import Login from "./Login";
import Create from "./Create";

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
  }
  ]);

  return (
    <>
      <RouterProvider router={router} />
    </>
  );
}

import "./App.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Home from "./Home";
import SignUp from "./SignUp";

export default function App() {

  const router = createBrowserRouter([{
    path: "/home",
    element: <Home />
  },
  {
    path: "/",
    element: <SignUp />
  }
  ]);

  return (
    <>
      <RouterProvider router={router} />
    </>
  );
}

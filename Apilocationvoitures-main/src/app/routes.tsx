import { createBrowserRouter } from "react-router";
import { Layout } from "./components/Layout";
import { Home } from "./pages/Home";
import { SearchCars } from "./pages/SearchCars";
import { CarDetails } from "./pages/CarDetails";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";
import { ForgotPassword } from "./pages/ForgotPassword";
import { RenterDashboard } from "./pages/RenterDashboard";
import { OwnerDashboard } from "./pages/OwnerDashboard";
import { AdminDashboard } from "./pages/AdminDashboard";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: Home },
      { path: "cars", Component: SearchCars },
      { path: "cars/:id", Component: CarDetails },
      { path: "dashboard/renter", Component: RenterDashboard },
      { path: "dashboard/owner", Component: OwnerDashboard },
      { path: "dashboard/admin", Component: AdminDashboard },
    ],
  },
  {
    path: "/login",
    Component: Login,
  },
  {
    path: "/register",
    Component: Register,
  },
  {
    path: "/forgot-password",
    Component: ForgotPassword,
  }
]);

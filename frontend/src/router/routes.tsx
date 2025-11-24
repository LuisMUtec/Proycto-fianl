import { createBrowserRouter } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import App from "@/App";
import { HomePage } from "@/pages/HomePage";
import { MenuPage } from "@/pages/MenuPage";
import { CartPage } from "@/pages/CartPage";
import { CheckoutPage } from "@/pages/CheckoutPage";
import { AuthPage } from "@/pages/AuthPage";
import { LoginPage } from "@/pages/LoginPage";
import { RegisterPage } from "@/pages/RegisterPage";
import { OrderTrackingPage } from "@/pages/OrderTrackingPage";
import { DashboardPage } from "@/pages/DashboardPage";
import { NotFoundPage } from "../pages/NotFoundPage";

/**
 * Rutas principales para el sistema de restaurante
 * Roles soportados: USER (cliente), COOK (chef), DISPATCHER (delivery), ADMIN
 */
const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "",
        element: <HomePage />,
      },
      {
        path: "menu",
        element: <MenuPage onNavigate={() => {}} />,
      },
      {
        path: "cart",
        element: <CartPage onNavigate={() => {}} />,
      },
      {
        path: "auth",
        element: <AuthPage onNavigate={() => {}} />,
      },
      {
        path: "auth/login",
        element: <LoginPage />,
      },
      {
        path: "auth/register",
        element: <RegisterPage />,
      },
      {
        path: "",
        element: <ProtectedRoute />,
        children: [
          {
            path: "checkout",
            element: <CheckoutPage onNavigate={() => {}} />,
          },
          {
            path: "tracking",
            element: <OrderTrackingPage />,
          },
          {
            path: "dashboard",
            element: <DashboardPage />,
          },
          
        ],
      },
      {
        path: "*",
        element: <NotFoundPage />,
      },
    ],
  },
]);

export default router;
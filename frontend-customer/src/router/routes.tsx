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
import { NotFoundPage } from "../pages/NotFoundPage";

/**
 * Rutas para la aplicación de clientes
 * Incluye: home, menu, carrito, checkout, tracking de pedidos
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
            path: "orders",
            element: <OrderTrackingPage />,
          },
          {
            path: "tracking",
            element: <OrderTrackingPage />,
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
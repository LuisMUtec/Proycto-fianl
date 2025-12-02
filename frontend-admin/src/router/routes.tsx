import { createBrowserRouter } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import App from "@/App";
import { AuthPage } from "@/pages/AuthPage";
import { LoginPage } from "@/pages/LoginPage";
import { DashboardPage } from "@/pages/DashboardPage";
import { NotFoundPage } from "../pages/NotFoundPage";

/**
 * Rutas para la aplicación administrativa/staff
 * Roles: COOK (chef), DISPATCHER (delivery), ADMIN
 */
const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "",
        element: <ProtectedRoute />,
        children: [
          {
            path: "",
            element: <DashboardPage />,
          },
          {
            path: "dashboard",
            element: <DashboardPage />,
          },
        ],
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
        path: "*",
        element: <NotFoundPage />,
      },
    ],
  },
]);

export default router;
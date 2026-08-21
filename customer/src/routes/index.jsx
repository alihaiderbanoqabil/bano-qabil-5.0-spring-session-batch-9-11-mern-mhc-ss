import CustomerLayout from "../layouts/CustomerLayout";
import AuthLayout from "../layouts/AuthLayout";
import RequireAuth from "../components/RequireAuth";
import GuestOnly from "../components/GuestOnly";

import Home from "../pages/Home";
import Products from "../pages/Products";
import ProductDetail from "../pages/ProductDetail";
import Cart from "../pages/Cart";
import Checkout from "../pages/Checkout";
import Orders from "../pages/Orders";
import OrderDetail from "../pages/OrderDetail";
import Profile from "../pages/Profile";
import Login from "../pages/Login";
import Register from "../pages/Register";
import VerifyEmail from "../pages/VerifyEmail";
import ForgotPassword from "../pages/ForgotPassword";
import ResetPassword from "../pages/ResetPassword";
import NotFound from "../pages/NotFound";

/**
 * Poora routing yahan ek jagah — App.jsx sirf isay `useRoutes()` ko de deta hai.
 *
 * Nesting ka matlab:
 *   CustomerLayout   -> top navigation wale saare pages
 *     RequireAuth    -> jin ke liye login zaroori hai (cart ke baad ka safar)
 *   AuthLayout       -> login/register/password wale pages
 *     GuestOnly      -> logged-in user ko yahan se home bhej dete hain
 */
export const routes = [
  {
    element: <CustomerLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: "products", element: <Products /> },
      { path: "products/:id", element: <ProductDetail /> },
      { path: "cart", element: <Cart /> },

      // Login zaroori — checkout, orders, profile
      {
        element: <RequireAuth />,
        children: [
          { path: "checkout", element: <Checkout /> },
          { path: "orders", element: <Orders /> },
          { path: "orders/:id", element: <OrderDetail /> },
          { path: "profile", element: <Profile /> },
        ],
      },
    ],
  },
  {
    element: <AuthLayout />,
    children: [
      // Email verification link par logged-in user bhi aa sakta hai, is liye
      // ye GuestOnly ke bahar hai
      { path: "verify-email", element: <VerifyEmail /> },
      {
        element: <GuestOnly />,
        children: [
          { path: "login", element: <Login /> },
          { path: "register", element: <Register /> },
          { path: "forgot-password", element: <ForgotPassword /> },
          { path: "reset-password", element: <ResetPassword /> },
        ],
      },
    ],
  },
  { path: "*", element: <NotFound /> },
];

export default routes;

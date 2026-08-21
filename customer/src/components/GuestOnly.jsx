import { Navigate, Outlet } from "react-router-dom";
import { useGetMeQuery } from "../store/api/authApi";
import Spinner from "./Spinner";

// Login/Register jaise pages — pehle se logged-in user ko yahan aane ka
// koi faida nahi, home bhej dete hain.
export default function GuestOnly() {
  const { data: user, isLoading } = useGetMeQuery();

  if (isLoading) return <Spinner label="Loading..." />;
  if (user) return <Navigate to="/" replace />;

  return <Outlet />;
}

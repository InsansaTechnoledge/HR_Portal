import { Navigate, Outlet } from "react-router-dom";
import { useContext } from "react";
import { userContext } from "../Context/userContext";
import Loader from "../Components/Loader/Loader";
import { useLocation } from "react-router-dom";

const ProtectedRoute = () => {
  const { user, loading } = useContext(userContext);
  const location = useLocation();

  if (loading) {
    return <Loader />;
  }
  return user ? <Outlet /> : <Navigate to="/" replace state={{ from: location }} />;
};

export default ProtectedRoute;

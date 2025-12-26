import { useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { userContext } from "../Context/userContext";
import Loader from "../Components/Loader/Loader";

const ProtectedRoute = ({ children }) => {
  const location = useLocation();
  const { user, loading } = useContext(userContext);

  if (loading) {
    return <Loader />;
  }

  return user ? (
    children
  ) : (
    <Navigate to="/" replace state={{ from: location }} />
  );
};

export default ProtectedRoute;

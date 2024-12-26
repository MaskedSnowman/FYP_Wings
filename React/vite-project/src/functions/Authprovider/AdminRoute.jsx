import { useContext } from "react";
import AuthContext from "./authprovider";
import { Navigate } from "react-router-dom";

const AdminRoute = ({ children }) => {
  const { user } = useContext(AuthContext);

  // Check if user exists and is_admin is true
  if (!user || !user.is_admin) {
    console.log("User is not authenticated as admin");
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default AdminRoute;

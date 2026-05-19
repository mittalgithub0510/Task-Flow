import { Navigate, Outlet } from 'react-router-dom';
import useAuth from './useAuth';
import LoadingSpinner from './LoadingSpinner';

const RoleBasedRoute = ({ allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) return <LoadingSpinner text="Authenticating..." />;

  return user && allowedRoles.includes(user.role) ? <Outlet /> : <Navigate to="/unauthorized" replace />;
};

export default RoleBasedRoute;

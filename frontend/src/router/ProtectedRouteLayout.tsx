import { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../auth/AuthContext';
import Layout from '../components/Layout';

export default function ProtectedRouteLayout() {
  const { user, isLoading } = useContext(AuthContext);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // This is now correct: We pass the <Outlet /> as a child to <Layout />
  return (
    <Layout>
      <Outlet />
    </Layout>
  );
}
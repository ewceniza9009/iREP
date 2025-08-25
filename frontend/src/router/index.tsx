import { Routes, Route } from 'react-router-dom';
import LoginPage from '../pages/Login';
import DashboardPage from '../pages/Dashboard';
import PropertiesPage from '../pages/Properties';
import NotFoundPage from '../pages/NotFound';
import ProtectedRouteLayout from './ProtectedRouteLayout'; // Import the new layout

export function AppRouter() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<LoginPage />} />

      {/* Wrap all protected routes in the new layout component */}
      <Route element={<ProtectedRouteLayout />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/properties" element={<PropertiesPage />} />
        <Route
          path="/projects"
          element={
            <div className="p-8">
              <h1 className="text-3xl font-bold">Projects</h1>
              <p className="mt-4">Projects management page coming soon.</p>
            </div>
          }
        />
      </Route>

      {/* Fallback route */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
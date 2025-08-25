import { Routes, Route } from 'react-router-dom';
import LoginPage from '../pages/Login';
import DashboardPage from '../pages/Dashboard';
import PropertiesPage from '../pages/Properties';
import NotFoundPage from '../pages/NotFound';
import PrivateRoute from './PrivateRoute';
import Layout from '../components/Layout'; // Import the Layout

export function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          <PrivateRoute>
            <Layout>
              <DashboardPage />
            </Layout>
          </PrivateRoute>
        }
      />
      <Route
        path="/properties"
        element={
          <PrivateRoute>
            <Layout>
              <PropertiesPage />
            </Layout>
          </PrivateRoute>
        }
      />
      {/* Add a placeholder for the Projects route */}
      <Route
        path="/projects"
        element={
          <PrivateRoute>
            <Layout>
              {/* This can be a placeholder component for now */}
              <div className="p-8">
                  <h1 className="text-3xl font-bold">Projects</h1>
                  <p className="mt-4">Projects management page coming soon.</p>
              </div>
            </Layout>
          </PrivateRoute>
        }
      />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
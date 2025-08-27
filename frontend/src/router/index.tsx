// frontend/src/router/index.tsx

import { Routes, Route } from 'react-router-dom';
import LoginPage from '../pages/Login';
import DashboardPage from '../pages/Dashboard';
import PropertiesPage from '../pages/Properties';
import ProjectsPage from '../pages/Projects'; // 👈 FIX: Import the real ProjectsPage
import NotFoundPage from '../pages/NotFound';
import ProtectedRouteLayout from './ProtectedRouteLayout';

export function AppRouter() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<LoginPage />} />

      {/* Wrap all protected routes in the new layout component */}
      <Route element={<ProtectedRouteLayout />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/properties" element={<PropertiesPage />} />
        
        {/* 👇 FIX: Use the ProjectsPage component instead of the placeholder */}
        <Route path="/projects" element={<ProjectsPage />} /> 
      </Route>

      {/* Fallback route */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
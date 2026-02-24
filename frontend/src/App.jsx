// frontend/src/App.jsx
import { Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './components/auth/ProtectedRoute';
import AdminLayout from './layouts/AdminLayout';
import UserLayout from './layouts/UserLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import DevicesPage from './pages/admin/DevicesPage';
import UsersPage from './pages/admin/UsersPage';
import Login from './pages/Login';
import NotFound from './pages/NotFound';
import DeviceDetailsPage from './pages/user/DeviceDetailsPage';
import UserDashboard from './pages/user/UserDashboard';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      {/* Admin Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="users" element={<UsersPage />} />
        <Route path="devices" element={<DevicesPage />} />
      </Route>

      {/* User Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute allowedRoles={['user', 'admin']}>
            <UserLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<UserDashboard />} />
        <Route path="device/:MAC" element={<DeviceDetailsPage />} />
      </Route>

      {/* Default redirect */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;

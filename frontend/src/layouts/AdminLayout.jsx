// frontend/src/layouts/AdminLayout.jsx
import { Outlet } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Sidebar from '../components/common/Sidebar';

export default function AdminLayout() {
  return (
    <div className="min-h-screen bg-base-200">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <Outlet /> {/* Nested routes like AdminDashboard or UsersPage render here */}
        </main>
      </div>
    </div>
  );
}

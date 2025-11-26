// frontend/src/layouts/UserLayout.jsx
import { Outlet } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Sidebar from '../components/common/Sidebar';

export default function UserLayout() {
  return (
    <div className="min-h-screen bg-base-200">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          <Outlet /> {/* Renders nested routes like UserDashboard */}
        </main>
      </div>
    </div>
  );
}

// frontend/src/layouts/AppLayout.jsx
// Shared layout for both Admin and User views.
// Lifts mobile sidebar state here so Navbar and Sidebar
// can stay decoupled while sharing a single toggle.
import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import Sidebar from '../components/common/Sidebar';

export default function AppLayout() {
    const [isMobileOpen, setIsMobileOpen] = useState(false);

    const toggleMobileSidebar = () => setIsMobileOpen((prev) => !prev);
    const closeMobileSidebar = () => setIsMobileOpen(false);

    return (
        // h-screen + overflow-hidden prevents double scrollbars.
        // The main content column owns its own overflow-y-auto scroll.
        <div className="flex h-screen overflow-hidden bg-base-100">
            <Sidebar
                isMobileOpen={isMobileOpen}
                onClose={closeMobileSidebar}
            />

            {/* Right column: Navbar at top, scrollable content below */}
            <div className="flex flex-col flex-1 min-w-0">
                <Navbar onMenuToggle={toggleMobileSidebar} isMobileOpen={isMobileOpen} />

                <main
                    id="main-content"
                    className="flex-1 overflow-y-auto p-5 sm:p-6 lg:p-8"
                    tabIndex={-1}
                >
                    <Outlet />
                </main>
            </div>
        </div>
    );
}


import { atom } from 'nanostores';

// Sidebar open/close state
export const isSidebarOpen = atom(true);

// Active route for highlighting
export const activeRoute = atom('/admin');

// Helper to toggle sidebar
export function toggleSidebar() {
    isSidebarOpen.set(!isSidebarOpen.get());
}

// Helper to set active route
export function setActiveRoute(route: string) {
    activeRoute.set(route);
}

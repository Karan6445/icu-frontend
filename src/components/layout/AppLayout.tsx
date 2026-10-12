import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { ContextBar } from './ContextBar';
import { RightDrawer } from './RightDrawer';
import { GlobalOmniSearch } from '../search/GlobalOmniSearch';
import { MobileSidebar } from './MobileSidebar';
import { Breadcrumbs } from '../common/Breadcrumbs';
import { DevApiDebugPanel } from '../common/DevApiDebugPanel';
import { useAppDispatch, useAppSelector } from '../../store/hooks';

import { fetchCurrentUserThunk } from '../../store/slices/authSlice';

export const AppLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user, loading } = useAppSelector(state => state.auth);

  // Authenticate user session on mount/refresh using /auth/me
  useEffect(() => {
    const token = localStorage.getItem('accessToken') || localStorage.getItem('icu_auth_token');
    if (token && !user) {
      dispatch(fetchCurrentUserThunk());
    }
  }, [dispatch, user]);

  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    return localStorage.getItem('icu_sidebar_collapsed') === 'true';
  });

  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState<boolean>(false);
  const [isRightDrawerOpen, setIsRightDrawerOpen] = useState<boolean>(false);
  const [drawerTab, setDrawerTab] = useState<'patient' | 'alerts' | 'tasks'>('patient');
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);

  // Global Ctrl+K listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleToggleSidebar = () => {
    setIsCollapsed(prev => {
      const next = !prev;
      localStorage.setItem('icu_sidebar_collapsed', String(next));
      return next;
    });
  };

  const handleToggleMobileDrawer = () => {
    setIsMobileDrawerOpen(prev => !prev);
  };

  const handleToggleRightDrawer = (tab?: 'patient' | 'alerts' | 'tasks') => {
    if (tab) setDrawerTab(tab);
    setIsRightDrawerOpen(prev => !prev);
  };

  // Close mobile drawer automatically on screen resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMobileDrawerOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans antialiased selection:bg-teal-900 selection:text-white transition-colors duration-200 overflow-hidden">
      {/* 1. TOP BAR */}
      <Navbar
        isSidebarCollapsed={isCollapsed}
        onToggleSidebar={handleToggleSidebar}
        isMobileDrawerOpen={isMobileDrawerOpen}
        onToggleMobileDrawer={handleToggleMobileDrawer}
        onOpenSearch={() => setIsSearchOpen(true)}
      />

      {/* 2. CONTEXT BAR (Hospital > ICU > Patient > Encounter > Bed) */}
      <ContextBar
        onToggleDrawer={handleToggleRightDrawer}
        isDrawerOpen={isRightDrawerOpen}
      />

      {/* 3. MAIN BODY SHELL */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left Menu Sidebar */}
        <div className="hidden lg:block shrink-0 h-full">
          <Sidebar
            isCollapsed={isCollapsed}
            onToggleCollapse={handleToggleSidebar}
          />
        </div>

        {/* Mobile Off-Canvas Sidebar */}
        <MobileSidebar
          isOpen={isMobileDrawerOpen}
          onClose={() => setIsMobileDrawerOpen(false)}
        />

        {/* Main Viewport Content Area */}
        <main className="flex-1 min-w-0 overflow-y-auto p-3 sm:p-5 lg:p-6 flex flex-col custom-scrollbar relative">
          <Breadcrumbs />
          <div className="flex-1">
            <Outlet />
          </div>
        </main>

        {/* 4. RIGHT DRAWER (Patient / Alert / Task quick details) */}
        <RightDrawer
          isOpen={isRightDrawerOpen}
          onClose={() => setIsRightDrawerOpen(false)}
          defaultTab={drawerTab}
        />

        {/* 5. SEARCH SPOTLIGHT MODAL (Patient | MRN | EncounterID | BedID | DeviceID | TransferID) */}
        <GlobalOmniSearch
          isOpen={isSearchOpen}
          onClose={() => setIsSearchOpen(false)}
        />
        {/* Dev-Only API Inspector Panel */}
        <DevApiDebugPanel />
      </div>
    </div>
  );
};

export default AppLayout;

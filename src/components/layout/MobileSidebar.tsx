import React from 'react';
import { Sidebar } from './Sidebar';

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileSidebar: React.FC<MobileSidebarProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="lg:hidden fixed inset-0 z-50 flex">
      {/* Backdrop overlay */}
      <div
        className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={onClose}
      />

      {/* Off-canvas drawer content */}
      <div className="relative z-50 flex-1 max-w-xs w-full bg-white animate-in slide-in-from-left duration-200 shadow-2xl">
        <Sidebar
          isCollapsed={false}
          onToggleCollapse={() => {}}
          isMobileDrawer={true}
          onCloseMobileDrawer={onClose}
        />
      </div>
    </div>
  );
};

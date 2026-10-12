import React from 'react';
import { Outlet } from 'react-router-dom';

export const AuthLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-900 font-sans selection:bg-teal-500 selection:text-white">
      <Outlet />
    </div>
  );
};

export default AuthLayout;

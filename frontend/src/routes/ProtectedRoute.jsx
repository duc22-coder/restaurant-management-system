import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ allowedRoles }) => {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-300">
        <div className="flex items-center gap-3">
          <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
          <span>Đang kiểm tra quyền truy cập...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    // Nếu role không khớp, điều hướng về đúng Dashboard được phép
    return user?.role === 'ADMIN' ? <Navigate to="/admin/dashboard" replace /> : <Navigate to="/staff/dashboard" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;

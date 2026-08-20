import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import ProtectedRoute from './routes/ProtectedRoute';
import LoginPage from './pages/auth/LoginPage';
import StaffDashboard from './pages/staff/StaffDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import CustomerMenuPage from './pages/customer/CustomerMenuPage';
import AdminCategoriesPage from './pages/admin/AdminCategoriesPage';
import AdminMenuPage from './pages/admin/AdminMenuPage';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Customer Menu Route */}
            <Route path="/menu" element={<CustomerMenuPage />} />

            {/* Public Authentication Route */}
            <Route path="/login" element={<LoginPage />} />

            {/* Protected Routes for STAFF and ADMIN */}
            <Route element={<ProtectedRoute allowedRoles={['STAFF', 'ADMIN']} />}>
              <Route path="/staff/dashboard" element={<StaffDashboard />} />
            </Route>

            {/* Protected Routes ONLY for ADMIN */}
            <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/categories" element={<AdminCategoriesPage />} />
              <Route path="/admin/menu" element={<AdminMenuPage />} />
            </Route>

            {/* Fallback Route */}
            <Route path="*" element={<Navigate to="/menu?tableId=1" replace />} />
          </Routes>
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;

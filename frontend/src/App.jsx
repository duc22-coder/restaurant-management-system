import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import ProtectedRoute from './routes/ProtectedRoute';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/customer/RegisterPage';
import StaffDashboard from './pages/staff/StaffDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import CustomerMenuPage from './pages/customer/CustomerMenuPage';
import CustomerAccountPage from './pages/customer/CustomerAccountPage';
import AdminCategoriesPage from './pages/admin/AdminCategoriesPage';
import AdminMenuPage from './pages/admin/AdminMenuPage';
import AdminTablesPage from './pages/admin/AdminTablesPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminOrdersPage from './pages/admin/AdminOrdersPage';
import AdminVouchersPage from './pages/admin/AdminVouchersPage';
import AdminInventoryPage from './pages/admin/AdminInventoryPage';
import AdminPurchasesPage from './pages/admin/AdminPurchasesPage';
import AdminRecipesPage from './pages/admin/AdminRecipesPage';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Customer Menu Routes - Không bắt buộc quét QR, vào thẳng web xem toàn bộ món */}
            <Route path="/" element={<CustomerMenuPage />} />
            <Route path="/menu" element={<CustomerMenuPage />} />

            {/* Public Authentication Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Protected Route ONLY for CUSTOMER (tài khoản, địa chỉ, lịch sử đơn hàng) */}
            <Route element={<ProtectedRoute allowedRoles={['CUSTOMER']} />}>
              <Route path="/account" element={<CustomerAccountPage />} />
            </Route>

            {/* Protected Routes for STAFF and ADMIN */}
            <Route element={<ProtectedRoute allowedRoles={['STAFF', 'ADMIN']} />}>
              <Route path="/staff/dashboard" element={<StaffDashboard />} />
            </Route>

            {/* Protected Routes ONLY for ADMIN */}
            <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/categories" element={<AdminCategoriesPage />} />
              <Route path="/admin/menu" element={<AdminMenuPage />} />
              <Route path="/admin/inventory" element={<AdminInventoryPage />} />
              <Route path="/admin/purchases" element={<AdminPurchasesPage />} />
              <Route path="/admin/recipes" element={<AdminRecipesPage />} />
              <Route path="/admin/tables" element={<AdminTablesPage />} />
              <Route path="/admin/users" element={<AdminUsersPage />} />
              <Route path="/admin/orders" element={<AdminOrdersPage />} />
              <Route path="/admin/vouchers" element={<AdminVouchersPage />} />
            </Route>

            {/* Fallback Route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;

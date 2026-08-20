import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LogOut, ShieldCheck, DollarSign, ShoppingCart, Users, UtensilsCrossed, Layers } from 'lucide-react';

function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Navbar */}
      <header className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-bold text-slate-100 text-lg">Admin Dashboard</h1>
            <p className="text-xs text-slate-400">Quản lý hệ thống: <span className="text-purple-400 font-semibold">{user?.fullName || user?.username}</span></p>
          </div>
        </div>

        <button
          onClick={logout}
          className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-2 transition"
        >
          <LogOut className="w-4 h-4 text-red-400" />
          Đăng Xuất
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-6 space-y-6">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h2 className="text-xl font-bold text-white mb-2">Chào mừng Quản Lý Nhà Hàng! 👑</h2>
          <p className="text-slate-400 text-sm">
            Xác thực JWT nâng cao thành công. Bạn có toàn quyền truy cập với vai trò <span className="text-purple-400 font-semibold">ADMIN</span>.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <button
            onClick={() => navigate('/admin/categories')}
            className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 flex items-center gap-4 text-left transition active:scale-95 group"
          >
            <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 group-hover:scale-110 transition">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-400">Quản Lý Danh Mục</p>
              <p className="text-sm font-bold text-slate-200 mt-1">4 Danh Mục</p>
            </div>
          </button>

          <button
            onClick={() => navigate('/admin/menu')}
            className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 flex items-center gap-4 text-left transition active:scale-95 group"
          >
            <div className="p-3 rounded-xl bg-orange-500/10 text-orange-400 group-hover:scale-110 transition">
              <UtensilsCrossed className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-400">Quản Lý Thực Đơn</p>
              <p className="text-sm font-bold text-slate-200 mt-1">12 Món Ăn</p>
            </div>
          </button>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex items-center gap-4 opacity-75">
            <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-400">Quản Lý Nhân Viên</p>
              <p className="text-sm font-bold text-slate-200 mt-1">Sắp có</p>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex items-center gap-4 opacity-75">
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-400">Báo Cáo Doanh Thu</p>
              <p className="text-sm font-bold text-slate-200 mt-1">Phase 8</p>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}

export default AdminDashboard;

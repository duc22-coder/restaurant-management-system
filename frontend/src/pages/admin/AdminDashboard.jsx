import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axiosClient from '../../api/axiosClient';
import {
  LogOut,
  ShieldCheck,
  DollarSign,
  ShoppingCart,
  Users,
  UtensilsCrossed,
  Layers,
  TrendingUp,
  Award,
  CreditCard,
  QrCode,
  RefreshCw,
  ChefHat,
  ArrowUpRight,
  CheckCircle2,
  LayoutGrid,
  ClipboardList,
  Ticket
} from 'lucide-react';

function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
    const interval = setInterval(() => {
      if (!document.hidden) fetchStats();
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  const fetchStats = async () => {
    try {
      const data = await axiosClient.get('/admin/analytics/dashboard');
      setStats(data);
    } catch (err) {
      console.error("Lỗi lấy dữ liệu thống kê Admin Dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatVND = (price) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price || 0);

  const calculatePercentage = (amount) => {
    if (!stats || !stats.totalRevenue || stats.totalRevenue === 0) return 0;
    return Math.round((amount / stats.totalRevenue) * 100);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Top Navbar */}
      <header className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 sticky top-0 z-30 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-slate-100 text-lg flex items-center gap-2">
              Admin Executive Analytics
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </h1>
            <p className="text-xs text-slate-400">
              Quản trị viên: <span className="text-purple-400 font-bold">{user?.fullName || user?.username}</span> • Thống Kê Realtime
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchStats}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
            title="Làm mới thống kê"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={logout}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold flex items-center gap-2 transition"
          >
            <LogOut className="w-4 h-4 text-red-400" />
            <span>Đăng Xuất</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* Quick Navigation Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <button
            onClick={() => navigate('/admin/categories')}
            className="bg-slate-900 border border-slate-800 hover:border-amber-500/50 rounded-2xl p-4 flex items-center justify-between text-left transition active:scale-95 group shadow-lg"
          >
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 group-hover:scale-110 transition">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-semibold">Quản Lý Danh Mục</p>
                <p className="text-sm font-extrabold text-white mt-0.5">Category Management</p>
              </div>
            </div>
            <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 transition" />
          </button>

          <button
            onClick={() => navigate('/admin/menu')}
            className="bg-slate-900 border border-slate-800 hover:border-orange-500/50 rounded-2xl p-4 flex items-center justify-between text-left transition active:scale-95 group shadow-lg"
          >
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-orange-500/10 text-orange-400 group-hover:scale-110 transition">
                <UtensilsCrossed className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-semibold">Quản Lý Thực Đơn</p>
                <p className="text-sm font-extrabold text-white mt-0.5">Menu Item Management</p>
              </div>
            </div>
            <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-orange-400 transition" />
          </button>

          <button
            onClick={() => navigate('/staff/dashboard')}
            className="bg-slate-900 border border-slate-800 hover:border-blue-500/50 rounded-2xl p-4 flex items-center justify-between text-left transition active:scale-95 group shadow-lg"
          >
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400 group-hover:scale-110 transition">
                <ChefHat className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-semibold">Giao Diện Nhân Viên</p>
                <p className="text-sm font-extrabold text-white mt-0.5">Staff & Kitchen KDS</p>
              </div>
            </div>
            <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-blue-400 transition" />
          </button>

          <button
            onClick={() => navigate('/admin/tables')}
            className="bg-slate-900 border border-slate-800 hover:border-teal-500/50 rounded-2xl p-4 flex items-center justify-between text-left transition active:scale-95 group shadow-lg"
          >
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-teal-500/10 text-teal-400 group-hover:scale-110 transition">
                <LayoutGrid className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-semibold">Quản Lý Bàn</p>
                <p className="text-sm font-extrabold text-white mt-0.5">Tables & Zones</p>
              </div>
            </div>
            <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-teal-400 transition" />
          </button>

          <button
            onClick={() => navigate('/admin/users')}
            className="bg-slate-900 border border-slate-800 hover:border-purple-500/50 rounded-2xl p-4 flex items-center justify-between text-left transition active:scale-95 group shadow-lg"
          >
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400 group-hover:scale-110 transition">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-semibold">Quản Lý Người Dùng</p>
                <p className="text-sm font-extrabold text-white mt-0.5">Staff & Accounts</p>
              </div>
            </div>
            <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-purple-400 transition" />
          </button>

          <button
            onClick={() => navigate('/admin/orders')}
            className="bg-slate-900 border border-slate-800 hover:border-pink-500/50 rounded-2xl p-4 flex items-center justify-between text-left transition active:scale-95 group shadow-lg"
          >
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-pink-500/10 text-pink-400 group-hover:scale-110 transition">
                <ClipboardList className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-semibold">Giám Sát Đơn Hàng</p>
                <p className="text-sm font-extrabold text-white mt-0.5">Order Monitoring</p>
              </div>
            </div>
            <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-pink-400 transition" />
          </button>

          <button
            onClick={() => navigate('/admin/vouchers')}
            className="bg-slate-900 border border-slate-800 hover:border-emerald-500/50 rounded-2xl p-4 flex items-center justify-between text-left transition active:scale-95 group shadow-lg"
          >
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 group-hover:scale-110 transition">
                <Ticket className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-400 font-semibold">Quản Lý Voucher</p>
                <p className="text-sm font-extrabold text-white mt-0.5">Discount Codes</p>
              </div>
            </div>
            <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 transition" />
          </button>
        </div>

        {/* Executive KPI Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Revenue Card */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-emerald-500/30 rounded-3xl p-6 shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition">
              <DollarSign className="w-20 h-20 text-emerald-400" />
            </div>
            <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-400 w-fit mb-4">
              <TrendingUp className="w-6 h-6" />
            </div>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">TỔNG DOANH THU THỰC TẾ</p>
            <h3 className="text-2xl font-black text-emerald-400 mt-1">
              {formatVND(stats?.totalRevenue)}
            </h3>
            <p className="text-[11px] text-emerald-500/90 flex items-center gap-1 mt-2 font-semibold">
              <CheckCircle2 className="w-3 h-3" /> Đã xác nhận thanh toán
            </p>
          </div>

          {/* Total Orders Card */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-blue-500/30 rounded-3xl p-6 shadow-xl relative overflow-hidden group">
            <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-400 w-fit mb-4">
              <ShoppingCart className="w-6 h-6" />
            </div>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">TỔNG SỐ ĐƠN HÀNG</p>
            <h3 className="text-2xl font-black text-blue-400 mt-1">
              {stats?.totalOrders || 0} Đơn Hàng
            </h3>
            <p className="text-[11px] text-blue-400/90 mt-2 font-semibold">
              Đơn hoàn tất: <span className="font-bold text-white">{stats?.completedOrders || 0}</span>
            </p>
          </div>

          {/* Success Rate Card */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-purple-500/30 rounded-3xl p-6 shadow-xl relative overflow-hidden group">
            <div className="p-3 rounded-2xl bg-purple-500/10 text-purple-400 w-fit mb-4">
              <Award className="w-6 h-6" />
            </div>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">TỶ LỆ HOÀN THÀNH</p>
            <h3 className="text-2xl font-black text-purple-400 mt-1">
              {stats?.successRate || 100}%
            </h3>
            <p className="text-[11px] text-purple-400/90 mt-2 font-semibold">
              Chỉ số phục vụ nhà bếp tối ưu
            </p>
          </div>

          {/* Active Tables Card */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-amber-500/30 rounded-3xl p-6 shadow-xl relative overflow-hidden group">
            <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-400 w-fit mb-4">
              <Users className="w-6 h-6" />
            </div>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">BÀN ĐANG CÓ KHÁCH</p>
            <h3 className="text-2xl font-black text-amber-400 mt-1">
              {stats?.activeTablesCount || 0} / 8 Bàn
            </h3>
            <p className="text-[11px] text-amber-400/90 mt-2 font-semibold">
              Công suất phục vụ hiện tại
            </p>
          </div>
        </div>

        {/* Charts & Top Selling Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Top Selling Items (2 Cols) */}
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-orange-500/10 text-orange-400">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">Top Món Ăn Bán Chạy Nhất</h3>
                  <p className="text-xs text-slate-400">Bảng xếp hạng món ăn được yêu thích nhất theo số lượng order</p>
                </div>
              </div>
            </div>

            {(!stats?.topSellingItems || stats.topSellingItems.length === 0) ? (
              <p className="text-xs text-slate-500 italic text-center py-8">Chưa có dữ liệu thống kê món ăn bán chạy</p>
            ) : (
              <div className="space-y-4">
                {stats.topSellingItems.map((item, index) => {
                  const maxSold = stats.topSellingItems[0].quantitySold || 1;
                  const percent = Math.round((item.quantitySold / maxSold) * 100);

                  return (
                    <div key={item.menuItemId} className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className={`w-6 h-6 rounded-lg text-xs font-black flex items-center justify-center ${
                            index === 0 ? 'bg-amber-500 text-slate-950' : index === 1 ? 'bg-slate-300 text-slate-950' : 'bg-orange-800 text-slate-200'
                          }`}>
                            #{index + 1}
                          </span>
                          <img src={item.menuItemImage} alt={item.menuItemName} className="w-10 h-10 rounded-xl object-cover bg-slate-800" />
                          <div>
                            <p className="font-bold text-white text-xs">{item.menuItemName}</p>
                            <p className="text-[10px] text-slate-400">{item.categoryName}</p>
                          </div>
                        </div>

                        <div className="text-right">
                          <p className="font-black text-amber-400 text-xs">{item.quantitySold} Phần</p>
                          <p className="text-[11px] font-bold text-emerald-400">{formatVND(item.revenueGenerated)}</p>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-orange-500 to-amber-400 rounded-full transition-all duration-500"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Payment Method Breakdown (1 Col) */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
            <div className="flex items-center gap-2.5 border-b border-slate-800 pb-4">
              <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">Cơ Cấu Thanh Toán</h3>
                <p className="text-xs text-slate-400">Doanh thu theo kênh</p>
              </div>
            </div>

            <div className="space-y-4">
              {/* Cash */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="flex items-center gap-2 text-emerald-400">
                    <DollarSign className="w-4 h-4" /> Tiền Mặt (Cash)
                  </span>
                  <span className="text-white">{formatVND(stats?.revenueByPaymentMethod?.CASH)}</span>
                </div>
                <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                    style={{ width: `${calculatePercentage(stats?.revenueByPaymentMethod?.CASH)}%` }}
                  />
                </div>
              </div>

              {/* Bank Transfer */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="flex items-center gap-2 text-blue-400">
                    <QrCode className="w-4 h-4" /> Chuyển Khoản QR
                  </span>
                  <span className="text-white">{formatVND(stats?.revenueByPaymentMethod?.BANK_TRANSFER)}</span>
                </div>
                <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full transition-all duration-500"
                    style={{ width: `${calculatePercentage(stats?.revenueByPaymentMethod?.BANK_TRANSFER)}%` }}
                  />
                </div>
              </div>

              {/* VNPay */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="flex items-center gap-2 text-purple-400">
                    <CreditCard className="w-4 h-4" /> Ví VNPay
                  </span>
                  <span className="text-white">{formatVND(stats?.revenueByPaymentMethod?.VNPAY)}</span>
                </div>
                <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-purple-500 rounded-full transition-all duration-500"
                    style={{ width: `${calculatePercentage(stats?.revenueByPaymentMethod?.VNPAY)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default AdminDashboard;

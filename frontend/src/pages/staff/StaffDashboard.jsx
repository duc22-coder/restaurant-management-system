import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import axiosClient from '../../api/axiosClient';
import {
  LogOut,
  UserCheck,
  LayoutGrid,
  Utensils,
  Clock,
  CheckCircle2,
  AlertCircle,
  ChefHat,
  RefreshCw,
  MessageSquare,
  ChevronRight,
  Flame,
  Check,
  CreditCard,
  Printer,
  DollarSign,
  QrCode,
  Receipt,
  X
} from 'lucide-react';

function StaffDashboard() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('kds'); // 'kds', 'tables', 'payments'
  const [orders, setOrders] = useState([]);
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('ALL');

  // Payment Receipt Modal state
  const [selectedOrderForPayment, setSelectedOrderForPayment] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [processingPayment, setProcessingPayment] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const [ordersData, tablesData] = await Promise.all([
        axiosClient.get('/staff/orders'),
        axiosClient.get('/staff/tables'),
      ]);
      setOrders(ordersData);
      setTables(tablesData);
    } catch (err) {
      console.error("Lỗi cập nhật dữ liệu Staff Dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await axiosClient.patch(`/staff/orders/${orderId}/status?status=${newStatus}`);
      fetchData();
    } catch (err) {
      alert("Lỗi đổi trạng thái đơn hàng: " + (err.response?.data?.message || err.message));
    }
  };

  const handleUpdateItemStatus = async (orderItemId, newStatus) => {
    try {
      await axiosClient.patch(`/staff/orders/items/${orderItemId}/status?status=${newStatus}`);
      fetchData();
    } catch (err) {
      alert("Lỗi đổi trạng thái món ăn: " + (err.response?.data?.message || err.message));
    }
  };

  const handleUpdateTableStatus = async (tableId, newStatus) => {
    try {
      await axiosClient.patch(`/staff/tables/${tableId}/status?status=${newStatus}`);
      fetchData();
    } catch (err) {
      alert("Lỗi đổi trạng thái bàn: " + (err.response?.data?.message || err.message));
    }
  };

  const handleOpenPaymentModal = (order) => {
    setSelectedOrderForPayment(order);
    setPaymentMethod('CASH');
    setShowReceiptModal(true);
  };

  const handleConfirmPayment = async () => {
    if (!selectedOrderForPayment) return;
    setProcessingPayment(true);
    try {
      await axiosClient.post('/staff/payment/process', {
        orderId: selectedOrderForPayment.id,
        paymentMethod: paymentMethod,
      });

      alert(`Thanh toán thành công Đơn ${selectedOrderForPayment.orderCode}! Bàn B${String(selectedOrderForPayment.tableId).padStart(2, '0')} đã được tự động giải phóng.`);
      setShowReceiptModal(false);
      setSelectedOrderForPayment(null);
      fetchData();
    } catch (err) {
      alert("Lỗi xử lý thanh toán: " + (err.response?.data?.message || err.message));
    } finally {
      setProcessingPayment(false);
    }
  };

  const formatVND = (price) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

  const formatTimeAgo = (dateString) => {
    if (!dateString) return '';
    const diffMin = Math.floor((new Date() - new Date(dateString)) / 60000);
    if (diffMin < 1) return 'Vừa đặt xong';
    return `${diffMin} phút trước`;
  };

  const filteredOrders = orders.filter((order) => {
    if (filterStatus === 'ALL') return true;
    return order.status === filterStatus;
  });

  const payingTablesCount = tables.filter((t) => t.status === 'PAYING').length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Top Navbar */}
      <header className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 sticky top-0 z-30 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <ChefHat className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-slate-100 text-lg flex items-center gap-2">
              Staff & Kitchen Display System
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </h1>
            <p className="text-xs text-slate-400">
              Nhân viên: <span className="text-blue-400 font-bold">{user?.fullName || user?.username}</span> • Quản Lý Đơn & Thanh Toán
            </p>
          </div>
        </div>

        {/* Tab Selection & Actions */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-between">
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-1 flex gap-1">
            <button
              onClick={() => setActiveTab('kds')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
                activeTab === 'kds'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              🔥 Bếp KDS ({orders.length})
            </button>
            <button
              onClick={() => setActiveTab('tables')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
                activeTab === 'tables'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              🍽️ Sơ Đồ Bàn ({tables.length})
            </button>
            <button
              onClick={() => setActiveTab('payments')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === 'payments'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-purple-400 hover:text-purple-300'
              }`}
            >
              💳 Thanh Toán {payingTablesCount > 0 && <span className="px-1.5 py-0.5 rounded-full bg-red-500 text-white text-[10px] animate-bounce">{payingTablesCount}</span>}
            </button>
          </div>

          <button
            onClick={fetchData}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
            title="Làm mới dữ liệu"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={logout}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-2 transition"
          >
            <LogOut className="w-4 h-4 text-red-400" />
            <span>Đăng Xuất</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* TAB 1: KITCHEN DISPLAY SYSTEM (KDS) */}
        {activeTab === 'kds' && (
          <div className="space-y-6">
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              {['ALL', 'PENDING', 'PROCESSING'].map((statusKey) => (
                <button
                  key={statusKey}
                  onClick={() => setFilterStatus(statusKey)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                    filterStatus === statusKey
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {statusKey === 'ALL' && `Tất Cả Đơn (${orders.length})`}
                  {statusKey === 'PENDING' && `⏳ Chờ Chế Biến (${orders.filter(o => o.status === 'PENDING').length})`}
                  {statusKey === 'PROCESSING' && `🔥 Đang Nấu (${orders.filter(o => o.status === 'PROCESSING').length})`}
                </button>
              ))}
            </div>

            {filteredOrders.length === 0 ? (
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center text-slate-500 space-y-3">
                <ChefHat className="w-12 h-12 mx-auto text-slate-600" />
                <p className="font-bold text-sm text-slate-400">Không có đơn hàng nào cần xử lý!</p>
                <p className="text-xs">Hiện tại nhà bếp đã phục vụ hết tất cả món ăn.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredOrders.map((order) => (
                  <div
                    key={order.id}
                    className={`bg-slate-900 border rounded-3xl overflow-hidden shadow-xl flex flex-col justify-between transition duration-200 ${
                      order.status === 'PENDING'
                        ? 'border-amber-500/40 shadow-amber-500/5'
                        : 'border-blue-500/40 shadow-blue-500/5'
                    }`}
                  >
                    <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className="w-10 h-10 rounded-xl bg-orange-600/20 text-orange-400 border border-orange-500/30 font-black text-sm flex items-center justify-center">
                          B{String(order.tableId).padStart(2, '0')}
                        </span>
                        <div>
                          <p className="font-mono font-bold text-amber-400 text-xs">{order.orderCode}</p>
                          <p className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                            <Clock className="w-3 h-3 text-slate-500" />
                            {formatTimeAgo(order.createdAt)}
                          </p>
                        </div>
                      </div>

                      <span
                        className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          order.status === 'PENDING'
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30 animate-pulse'
                            : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                        }`}
                      >
                        {order.status === 'PENDING' ? '⏳ ĐỜI CHẾ BIẾN' : '🔥 ĐANG NẤU'}
                      </span>
                    </div>

                    {order.customerNote && (
                      <div className="mx-4 mt-3 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-start gap-2">
                        <MessageSquare className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
                        <span className="font-medium">Ghi chú: {order.customerNote}</span>
                      </div>
                    )}

                    <div className="p-4 space-y-3 flex-1 overflow-y-auto max-h-80">
                      {order.items.map((item) => (
                        <div
                          key={item.id}
                          className="bg-slate-950 p-3 rounded-2xl border border-slate-800 flex items-center justify-between gap-3"
                        >
                          <div className="flex items-center gap-3">
                            <img
                              src={item.menuItemImage}
                              alt={item.menuItemName}
                              className="w-12 h-12 rounded-xl object-cover bg-slate-800 shrink-0"
                            />
                            <div>
                              <p className="font-bold text-slate-200 text-xs">
                                <span className="text-orange-400 font-black mr-1">{item.quantity}x</span>
                                {item.menuItemName}
                              </p>
                              {item.note && (
                                <p className="text-[10px] text-amber-400/90 italic mt-0.5">
                                  📝 {item.note}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="shrink-0 flex flex-col items-end gap-1">
                            {item.status === 'PENDING' && (
                              <button
                                onClick={() => handleUpdateItemStatus(item.id, 'PREPARING')}
                                className="px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] font-bold flex items-center gap-1 transition"
                              >
                                <Flame className="w-3 h-3" />
                                <span>Nhận Nấu</span>
                              </button>
                            )}

                            {item.status === 'PREPARING' && (
                              <button
                                onClick={() => handleUpdateItemStatus(item.id, 'READY')}
                                className="px-2.5 py-1 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 text-[10px] font-bold flex items-center gap-1 transition"
                              >
                                <CheckCircle2 className="w-3 h-3" />
                                <span>Nấu Xong</span>
                              </button>
                            )}

                            {item.status === 'READY' && (
                              <button
                                onClick={() => handleUpdateItemStatus(item.id, 'SERVED')}
                                className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold flex items-center gap-1 transition"
                              >
                                <Check className="w-3 h-3" />
                                <span>Bê Ra Bàn</span>
                              </button>
                            )}

                            {item.status === 'SERVED' && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold text-slate-500 bg-slate-900 border border-slate-800">
                                🍽️ Đã Phục Vụ
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between gap-3">
                      <div>
                        <p className="text-[10px] text-slate-400">Tổng tiền:</p>
                        <p className="text-sm font-black text-orange-400">{formatVND(order.totalAmount)}</p>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleOpenPaymentModal(order)}
                          className="px-3 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-600/20 flex items-center gap-1 transition"
                        >
                          <CreditCard className="w-3.5 h-3.5" />
                          <span>Tính Tiền</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: TABLE STATUS MATRIX */}
        {activeTab === 'tables' && (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-white text-base">Sơ Đồ 8 Bàn Ăn Thực Tế</h3>
                <p className="text-xs text-slate-400">Theo dõi trạng thái phục vụ và đặt bàn realtime</p>
              </div>

              <div className="flex items-center gap-4 text-xs font-bold">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-emerald-500" />
                  <span className="text-slate-300">Bàn Trống</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-amber-500" />
                  <span className="text-slate-300">Đang Có Khách</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-purple-500 animate-ping" />
                  <span className="text-purple-400 font-bold">Yêu Cầu Thanh Toán</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {tables.map((table) => (
                <div
                  key={table.id}
                  className={`bg-slate-900 border rounded-3xl p-5 shadow-xl flex flex-col justify-between space-y-4 transition ${
                    table.status === 'AVAILABLE'
                      ? 'border-emerald-500/30 hover:border-emerald-500/60'
                      : table.status === 'OCCUPIED'
                      ? 'border-amber-500/30 hover:border-amber-500/60'
                      : 'border-purple-500/50 hover:border-purple-500/80 shadow-purple-500/10'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-3 h-3 rounded-full ${
                          table.status === 'AVAILABLE'
                            ? 'bg-emerald-400'
                            : table.status === 'OCCUPIED'
                            ? 'bg-amber-400'
                            : 'bg-purple-400 animate-pulse'
                        }`}
                      />
                      <h4 className="font-extrabold text-white text-lg">{table.tableNumber}</h4>
                    </div>

                    <span className="text-xs text-slate-400 font-semibold">{table.capacity} Khách</span>
                  </div>

                  <div>
                    {table.activeOrderCode ? (
                      <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 space-y-1">
                        <p className="text-[10px] text-slate-400">Đơn hàng hiện tại:</p>
                        <p className="font-mono font-bold text-amber-400 text-xs">{table.activeOrderCode}</p>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500 italic">Bàn đang trống sẵn sàng đón khách</p>
                    )}
                  </div>

                  <div className="pt-2 border-t border-slate-800 grid grid-cols-3 gap-1 text-[10px] font-bold">
                    <button
                      onClick={() => handleUpdateTableStatus(table.id, 'AVAILABLE')}
                      className={`py-1.5 rounded-lg border transition ${
                        table.status === 'AVAILABLE'
                          ? 'bg-emerald-500 text-white border-emerald-400'
                          : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                      }`}
                    >
                      Trống
                    </button>
                    <button
                      onClick={() => handleUpdateTableStatus(table.id, 'OCCUPIED')}
                      className={`py-1.5 rounded-lg border transition ${
                        table.status === 'OCCUPIED'
                          ? 'bg-amber-500 text-white border-amber-400'
                          : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                      }`}
                    >
                      Có Khách
                    </button>
                    <button
                      onClick={() => handleUpdateTableStatus(table.id, 'PAYING')}
                      className={`py-1.5 rounded-lg border transition ${
                        table.status === 'PAYING'
                          ? 'bg-purple-500 text-white border-purple-400'
                          : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
                      }`}
                    >
                      Tính Tiền
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: PAYMENT & INVOICE MANAGEMENT */}
        {activeTab === 'payments' && (
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-white text-base">Quản Lý Thanh Toán & Xuất Hóa Đơn</h3>
                <p className="text-xs text-slate-400">Thu tiền khách hàng, chọn phương thức và tự động giải phóng bàn</p>
              </div>

              <div className="px-3 py-1.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-300 font-bold text-xs">
                {payingTablesCount} Bàn đang yêu cầu thanh toán
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {orders.map((order) => (
                <div key={order.id} className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-3">
                      <span className="w-10 h-10 rounded-xl bg-purple-600/20 text-purple-400 border border-purple-500/30 font-black text-sm flex items-center justify-center">
                        B{String(order.tableId).padStart(2, '0')}
                      </span>
                      <div>
                        <h4 className="font-bold text-white text-sm">Bàn {order.tableNumber}</h4>
                        <p className="font-mono text-xs text-amber-400">{order.orderCode}</p>
                      </div>
                    </div>

                    <span className="font-black text-orange-400 text-base">{formatVND(order.totalAmount)}</span>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-300">
                    <p className="font-bold text-slate-400">Chi tiết món ăn:</p>
                    {order.items.map((item) => (
                      <div key={item.id} className="flex justify-between text-slate-300">
                        <span>{item.quantity}x {item.menuItemName}</span>
                        <span className="font-bold text-slate-200">{formatVND(item.subtotal)}</span>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => handleOpenPaymentModal(order)}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-purple-600/25 flex items-center justify-center gap-2 transition active:scale-95"
                  >
                    <Receipt className="w-4 h-4" />
                    <span>Xuất Hóa Đơn & Thanh Toán</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* PAYMENT & INVOICE RECEIPT MODAL */}
      {showReceiptModal && selectedOrderForPayment && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-purple-400" />
                <h3 className="font-bold text-white text-base">Xác Nhận Thanh Toán & Hóa Đơn</h3>
              </div>
              <button onClick={() => setShowReceiptModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Printable Invoice Preview Box */}
            <div className="bg-white text-slate-950 rounded-2xl p-5 shadow-inner space-y-3 font-mono text-xs">
              <div className="text-center border-b border-slate-300 pb-3 space-y-0.5">
                <h2 className="font-black text-sm uppercase tracking-wider text-slate-900">NHÀ HÀNG ABC</h2>
                <p className="text-[10px] text-slate-600">ĐC: 123 Nguyễn Huệ, TP. Quy Nhơn</p>
                <p className="text-[10px] text-slate-600">Hotline: 1900 6868</p>
                <p className="font-bold text-[11px] text-slate-900 pt-1">--- HÓA ĐƠN BÁN HÀNG ---</p>
              </div>

              <div className="flex justify-between text-[11px] text-slate-700">
                <span>Số Bàn: <strong>Bàn {selectedOrderForPayment.tableNumber}</strong></span>
                <span>Mã: <strong>{selectedOrderForPayment.orderCode}</strong></span>
              </div>
              <p className="text-[10px] text-slate-500">Thời gian: {new Date().toLocaleString('vi-VN')}</p>

              {/* Items Breakdown */}
              <div className="border-t border-b border-slate-300 py-2 space-y-1">
                {selectedOrderForPayment.items.map((item) => (
                  <div key={item.id} className="flex justify-between text-[11px]">
                    <span className="flex-1 line-clamp-1">{item.quantity}x {item.menuItemName}</span>
                    <span className="font-bold ml-2">{formatVND(item.subtotal)}</span>
                  </div>
                ))}
              </div>

              <div className="flex justify-between font-black text-sm pt-1 text-slate-900">
                <span>TỔNG CỘNG:</span>
                <span className="text-orange-600">{formatVND(selectedOrderForPayment.totalAmount)}</span>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-300">Chọn Phương Thức Thanh Toán:</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('CASH')}
                  className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition ${
                    paymentMethod === 'CASH'
                      ? 'bg-emerald-600/20 border-emerald-500 text-emerald-400 shadow'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <DollarSign className="w-4 h-4" />
                  <span>Tiền Mặt</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('BANK_TRANSFER')}
                  className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition ${
                    paymentMethod === 'BANK_TRANSFER'
                      ? 'bg-blue-600/20 border-blue-500 text-blue-400 shadow'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <QrCode className="w-4 h-4" />
                  <span>Chuyển Khoản</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('VNPAY')}
                  className={`py-2.5 px-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition ${
                    paymentMethod === 'VNPAY'
                      ? 'bg-purple-600/20 border-purple-500 text-purple-400 shadow'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Ví VNPay</span>
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center gap-1.5"
              >
                <Printer className="w-4 h-4" />
                <span>In Hóa Đơn</span>
              </button>

              <button
                type="button"
                onClick={handleConfirmPayment}
                disabled={processingPayment}
                className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 active:scale-95 transition"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{processingPayment ? 'Đang Xử Lý...' : 'XÁC NHẬN ĐÃ THU TIỀN'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default StaffDashboard;

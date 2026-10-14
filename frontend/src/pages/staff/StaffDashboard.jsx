import React, { useState, useEffect } from 'react';
import { useNotifications } from '../../context/NotificationContext';
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
  X,
  Calendar,
  CalendarCheck,
  Phone,
  Users,
  Plus,
  Filter,
  Minus
} from 'lucide-react';

function StaffDashboard() {
  const { notify, confirmDialog } = useNotifications();
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
  const [bankQr, setBankQr] = useState(null);
  const [loadingQr, setLoadingQr] = useState(false);
  const [voucherCodeInput, setVoucherCodeInput] = useState('');
  const [appliedVoucher, setAppliedVoucher] = useState(null);
  const [voucherError, setVoucherError] = useState('');
  const [checkingVoucher, setCheckingVoucher] = useState(false);

  // Reservation Management state
  const [reservations, setReservations] = useState([]);
  const [resFilterDate, setResFilterDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [resFilterSlot, setResFilterSlot] = useState('');
  const [resFilterStatus, setResFilterStatus] = useState('');
  const [slotAvailability, setSlotAvailability] = useState([]);
  const [updatingResId, setUpdatingResId] = useState(null);
  const [tableViewDate, setTableViewDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [tableViewSlot, setTableViewSlot] = useState('');
  const [tableSlotAvailability, setTableSlotAvailability] = useState([]);

  // Modal tạo đặt bàn mới (Staff)
  const [showCreateResModal, setShowCreateResModal] = useState(false);
  const [newResForm, setNewResForm] = useState({
    tableId: '',
    customerName: '',
    customerPhone: '',
    guestCount: 2,
    reservationDate: new Date().toISOString().split('T')[0],
    timeSlot: '11:00 - 12:30',
    note: '',
  });
  const [creatingRes, setCreatingRes] = useState(false);
  const [staffOrderReservation, setStaffOrderReservation] = useState(null);
  const [staffMenuItems, setStaffMenuItems] = useState([]);
  const [staffCart, setStaffCart] = useState([]);
  const [staffOrderNote, setStaffOrderNote] = useState('');
  const [creatingStaffOrder, setCreatingStaffOrder] = useState(false);

  useEffect(() => {
    fetchData();
    // Tạm dừng polling khi tab bị ẩn (thu nhỏ / chuyển tab khác) để tiết kiệm request
    const interval = setInterval(() => {
      if (!document.hidden) fetchData();
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchReservations = async () => {
    try {
      const params = {};
      if (resFilterDate) params.date = resFilterDate;
      if (resFilterSlot) params.timeSlot = resFilterSlot;
      if (resFilterStatus) params.status = resFilterStatus;

      const [resList, slotsData] = await Promise.all([
        axiosClient.get('/staff/reservations', { params }),
        axiosClient.get('/staff/reservations/availability', { params: { date: resFilterDate } }),
      ]);
      setReservations(resList || []);
      setSlotAvailability(slotsData || []);
    } catch (err) {
      console.error('Lỗi tải danh sách đặt bàn:', err);
    }
  };

  useEffect(() => {
    if (activeTab === 'reservations') {
      fetchReservations();
    }
  }, [resFilterDate, resFilterSlot, resFilterStatus, activeTab]);

  useEffect(() => {
    if (activeTab !== 'tables') return;
    axiosClient.get('/staff/reservations/availability', { params: { date: tableViewDate } })
      .then((data) => {
        const slots = data || [];
        setTableSlotAvailability(slots);
        if (slots.length > 0 && !slots.some((slot) => slot.timeSlot === tableViewSlot)) {
          setTableViewSlot(slots[0].timeSlot);
        }
      })
      .catch((err) => console.error('Lỗi tải lịch đặt bàn:', err));
  }, [activeTab, tableViewDate]);

  const fetchData = async () => {
    try {
      const [ordersData, tablesData] = await Promise.all([
        axiosClient.get('/staff/orders'),
        axiosClient.get('/staff/tables'),
      ]);
      setOrders(ordersData);
      setTables(tablesData);
      fetchReservations();
    } catch (err) {
      console.error("Lỗi cập nhật dữ liệu Staff Dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateReservationStatus = async (resId, newStatus) => {
    setUpdatingResId(resId);
    try {
      await axiosClient.put(`/staff/reservations/${resId}/status?status=${newStatus}`);
      fetchReservations();
      // Bàn có thể đã chuyển sang OCCUPIED (khi ARRIVED) hoặc AVAILABLE (khi COMPLETED)
      const tablesData = await axiosClient.get('/staff/tables');
      setTables(tablesData);
    } catch (err) {
      notify("Lỗi đổi trạng thái đặt bàn: " + (err.response?.data?.message || err.message));
    } finally {
      setUpdatingResId(null);
    }
  };

  const handleCreateReservationSubmit = async (e) => {
    e.preventDefault();
    if (!newResForm.customerName.trim() || !newResForm.customerPhone.trim()) {
      notify("Vui lòng điền họ tên và số điện thoại khách!");
      return;
    }
    setCreatingRes(true);
    try {
      const payload = {
        tableId: newResForm.tableId ? Number(newResForm.tableId) : null,
        customerName: newResForm.customerName.trim(),
        customerPhone: newResForm.customerPhone.trim(),
        guestCount: Number(newResForm.guestCount),
        reservationDate: newResForm.reservationDate,
        timeSlot: newResForm.timeSlot,
        note: newResForm.note.trim(),
      };
      await axiosClient.post('/staff/reservations', payload);
      setShowCreateResModal(false);
      setNewResForm({
        tableId: '',
        customerName: '',
        customerPhone: '',
        guestCount: 2,
        reservationDate: new Date().toISOString().split('T')[0],
        timeSlot: '11:00 - 12:30',
        note: '',
      });
      fetchReservations();
      notify("Tạo lượt đặt bàn thành công!");
    } catch (err) {
      notify("Lỗi tạo đặt bàn: " + (err.response?.data?.message || err.message));
    } finally {
      setCreatingRes(false);
    }
  };

  const handleOpenStaffOrder = async (reservation) => {
    try {
      const menu = await axiosClient.get('/customer/menu');
      setStaffMenuItems(menu || []);
      setStaffCart([]);
      setStaffOrderNote('');
      setStaffOrderReservation(reservation);
    } catch (err) {
      notify('Không tải được thực đơn: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleAddStaffOrderItem = (menuItemId, change) => {
    setStaffCart((cart) => {
      const current = cart.find((item) => item.menuItemId === menuItemId);
      if (!current && change > 0) return [...cart, { menuItemId, quantity: 1, note: null }];
      if (!current) return cart;
      const quantity = current.quantity + change;
      return quantity < 1
        ? cart.filter((item) => item.menuItemId !== menuItemId)
        : cart.map((item) => item.menuItemId === menuItemId ? { ...item, quantity } : item);
    });
  };

  const handleCreateStaffOrder = async (e) => {
    e.preventDefault();
    if (!staffOrderReservation || staffCart.length === 0) {
      notify('Chọn ít nhất một món để tạo đơn!');
      return;
    }
    setCreatingStaffOrder(true);
    try {
      await axiosClient.post('/staff/orders', {
        orderType: 'DINE_IN',
        tableId: staffOrderReservation.tableId,
        contactPhone: staffOrderReservation.customerPhone,
        customerNote: staffOrderNote.trim() || null,
        items: staffCart,
      });
      setStaffOrderReservation(null);
      await fetchData();
      notify('Đã tạo đơn cho bàn ' + staffOrderReservation.tableNumber + '!');
    } catch (err) {
      notify('Lỗi tạo đơn: ' + (err.response?.data?.message || err.message));
    } finally {
      setCreatingStaffOrder(false);
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await axiosClient.patch(`/staff/orders/${orderId}/status?status=${newStatus}`);
      fetchData();
    } catch (err) {
      notify("Lỗi đổi trạng thái đơn hàng: " + (err.response?.data?.message || err.message));
    }
  };

  const handleUpdateItemStatus = async (orderItemId, newStatus) => {
    try {
      await axiosClient.patch(`/staff/orders/items/${orderItemId}/status?status=${newStatus}`);
      fetchData();
    } catch (err) {
      notify("Lỗi đổi trạng thái món ăn: " + (err.response?.data?.message || err.message));
    }
  };

  const handleUpdateTableStatus = async (tableId, newStatus) => {
    try {
      await axiosClient.patch(`/staff/tables/${tableId}/status?status=${newStatus}`);
      fetchData();
    } catch (err) {
      notify("Lỗi đổi trạng thái bàn: " + (err.response?.data?.message || err.message));
    }
  };

  const handleOpenPaymentModal = (order) => {
    setSelectedOrderForPayment(order);
    setPaymentMethod('CASH');
    setBankQr(null);
    setVoucherCodeInput('');
    setAppliedVoucher(null);
    setVoucherError('');
    setShowReceiptModal(true);
  };

  const handleCheckVoucher = async () => {
    if (!voucherCodeInput.trim()) return;
    setCheckingVoucher(true);
    setVoucherError('');
    try {
      const data = await axiosClient.get('/staff/payment/validate-voucher', {
        params: { code: voucherCodeInput.trim(), orderAmount: selectedOrderForPayment.totalAmount },
      });
      setAppliedVoucher(data);
      if (paymentMethod === 'BANK_TRANSFER' && selectedOrderForPayment) {
        handleFetchBankQr(selectedOrderForPayment.id, data.code);
      }
    } catch (err) {
      setAppliedVoucher(null);
      setVoucherError(err.response?.data?.message || 'Mã voucher không hợp lệ!');
    } finally {
      setCheckingVoucher(false);
    }
  };

  const handleFetchBankQr = async (orderId, voucherCode = null) => {
    setLoadingQr(true);
    setBankQr(null);
    try {
      const data = await axiosClient.get(`/staff/payment/qr/${orderId}`, {
        params: voucherCode ? { voucherCode } : {},
      });
      setBankQr(data);
    } catch (err) {
      notify('Lỗi tạo mã QR: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoadingQr(false);
    }
  };

  const handleConfirmPayment = async () => {
    if (!selectedOrderForPayment) return;
    setProcessingPayment(true);
    try {
      await axiosClient.post('/staff/payment/process', {
        orderId: selectedOrderForPayment.id,
        paymentMethod: paymentMethod,
        voucherCode: appliedVoucher ? appliedVoucher.code : null,
      });

      notify(`Thanh toán thành công Đơn ${selectedOrderForPayment.orderCode}!` + (selectedOrderForPayment.orderType === 'DINE_IN' ? ` Bàn B${String(selectedOrderForPayment.tableId).padStart(2, '0')} đã được tự động giải phóng.` : ''));
      setShowReceiptModal(false);
      setSelectedOrderForPayment(null);
      fetchData();
    } catch (err) {
      notify("Lỗi xử lý thanh toán: " + (err.response?.data?.message || err.message));
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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
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
            <button
              onClick={() => setActiveTab('reservations')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                activeTab === 'reservations'
                  ? 'bg-orange-600 text-white shadow-md shadow-orange-600/30'
                  : 'text-orange-400 hover:text-orange-300'
              }`}
            >
              📅 Đặt Bàn ({reservations.length})
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
                        <span className={`w-10 h-10 rounded-xl border font-black text-[10px] flex items-center justify-center text-center leading-tight ${
                          order.orderType === 'DINE_IN'
                            ? 'bg-orange-600/20 text-orange-400 border-orange-500/30'
                            : order.orderType === 'DELIVERY'
                            ? 'bg-pink-600/20 text-pink-400 border-pink-500/30'
                            : 'bg-cyan-600/20 text-cyan-400 border-cyan-500/30'
                        }`}>
                          {order.orderType === 'DINE_IN' ? `B${String(order.tableId).padStart(2, '0')}` : order.orderType === 'DELIVERY' ? 'GIAO' : 'LẤY'}
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

                    {order.orderType !== 'DINE_IN' && (
                      <div className="mx-4 mt-3 p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs space-y-0.5">
                        <p className="font-bold">{order.orderType === 'DELIVERY' ? '🛵 Giao Tận Nơi' : '🥡 Khách Đến Lấy'}</p>
                        {order.deliveryAddress && <p>Địa chỉ: {order.deliveryAddress}</p>}
                        {order.contactPhone && <p>SĐT: {order.contactPhone}</p>}
                      </div>
                    )}

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

              <div className="w-full flex flex-wrap items-end gap-3 border-t border-slate-800 pt-4">
                <div>
                  <label className="block text-[10px] text-slate-400 mb-1">Ngày cần xem</label>
                  <input
                    type="date"
                    value={tableViewDate}
                    onChange={(e) => setTableViewDate(e.target.value)}
                    className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 mb-1">Khung giờ khách muốn đặt</label>
                  <select
                    value={tableViewSlot}
                    onChange={(e) => setTableViewSlot(e.target.value)}
                    className="bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-orange-500"
                  >
                    {tableSlotAvailability.map((slot) => (
                      <option key={slot.timeSlot} value={slot.timeSlot}>{slot.timeSlot}</option>
                    ))}
                  </select>
                </div>
                <p className="text-[11px] text-slate-400 pb-2">Sơ đồ vẫn hiển thị trạng thái phục vụ hiện tại; thông tin đặt trước áp dụng cho ngày và khung giờ đã chọn.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {tables.map((table) => (
                (() => {
                  const slotTable = tableSlotAvailability
                    .find((slot) => slot.timeSlot === tableViewSlot)
                    ?.tables?.find((item) => String(item.tableId) === String(table.id));
                  return (
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

                  <div className={`rounded-xl border p-2.5 ${slotTable?.reservationId ? 'bg-orange-500/10 border-orange-500/30' : 'bg-slate-950 border-slate-800'}`}>
                    <p className="text-[10px] font-bold text-slate-300">
                      {tableViewSlot || 'Khung giờ'} · {slotTable?.reservationId ? 'ĐÃ CÓ KHÁCH ĐẶT' : 'CHƯA CÓ ĐẶT BÀN'}
                    </p>
                    {slotTable?.bookedBy && <p className="text-[10px] text-orange-300 mt-1">{slotTable.bookedBy}</p>}
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
                  );
                })()
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
                      <span className={`w-10 h-10 rounded-xl border font-black text-[10px] flex items-center justify-center text-center leading-tight ${
                        order.orderType === 'DINE_IN'
                          ? 'bg-purple-600/20 text-purple-400 border-purple-500/30'
                          : order.orderType === 'DELIVERY'
                          ? 'bg-pink-600/20 text-pink-400 border-pink-500/30'
                          : 'bg-cyan-600/20 text-cyan-400 border-cyan-500/30'
                      }`}>
                        {order.orderType === 'DINE_IN' ? `B${String(order.tableId).padStart(2, '0')}` : order.orderType === 'DELIVERY' ? 'GIAO' : 'LẤY'}
                      </span>
                      <div>
                        <h4 className="font-bold text-white text-sm">
                          {order.orderType === 'DINE_IN' ? `Bàn ${order.tableNumber}` : order.orderType === 'DELIVERY' ? 'Giao Tận Nơi' : 'Khách Đến Lấy'}
                        </h4>
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

        {/* TAB 4: RESERVATION MANAGEMENT (THEO KHUNG GIỜ) */}
        {activeTab === 'reservations' && (
          <div className="space-y-6">
            {/* Top Bar with Filter & Create Button */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-white text-base flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-orange-400" />
                  Quản Lý Đặt Bàn Theo Khung Giờ
                </h3>
                <p className="text-xs text-slate-400">Kiểm tra bàn trống theo khung giờ, duyệt đặt bàn và nhận khách đến</p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {/* Filter Date */}
                <input
                  type="date"
                  value={resFilterDate}
                  onChange={(e) => setResFilterDate(e.target.value)}
                  className="bg-slate-950 border border-slate-800 text-xs text-white rounded-xl px-3 py-2 outline-none focus:border-orange-500 font-bold"
                />

                {/* Filter Time Slot */}
                <select
                  value={resFilterSlot}
                  onChange={(e) => setResFilterSlot(e.target.value)}
                  className="bg-slate-950 border border-slate-800 text-xs text-white rounded-xl px-3 py-2 outline-none focus:border-orange-500"
                >
                  <option value="">Tất Cả Khung Giờ</option>
                  <option value="09:00 - 10:30">09:00 - 10:30 (Sáng)</option>
                  <option value="11:00 - 12:30">11:00 - 12:30 (Trưa 1)</option>
                  <option value="12:30 - 14:00">12:30 - 14:00 (Trưa 2)</option>
                  <option value="17:30 - 19:00">17:30 - 19:00 (Tối 1)</option>
                  <option value="19:00 - 20:30">19:00 - 20:30 (Tối 2)</option>
                  <option value="20:30 - 22:00">20:30 - 22:00 (Tối 3)</option>
                </select>

                {/* Filter Status */}
                <select
                  value={resFilterStatus}
                  onChange={(e) => setResFilterStatus(e.target.value)}
                  className="bg-slate-950 border border-slate-800 text-xs text-white rounded-xl px-3 py-2 outline-none focus:border-orange-500"
                >
                  <option value="">Tất Cả Trạng Thái</option>
                  <option value="PENDING">Chờ Xác Nhận</option>
                  <option value="CONFIRMED">Đã Xác Nhận</option>
                  <option value="ARRIVED">Khách Đã Đến</option>
                  <option value="COMPLETED">Đã Hoàn Tất</option>
                  <option value="CANCELLED">Đã Hủy</option>
                </select>

                <button
                  onClick={() => setShowCreateResModal(true)}
                  className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-orange-500/20 transition active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tạo Đặt Bàn</span>
                </button>
              </div>
            </div>

            {/* Quick Metrics Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
                <p className="text-xs text-slate-400 font-semibold">Tổng Lượt Đặt</p>
                <p className="text-2xl font-black text-white mt-1">{reservations.length}</p>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
                <p className="text-xs text-amber-400 font-semibold">Chờ Duyệt (PENDING)</p>
                <p className="text-2xl font-black text-amber-400 mt-1">
                  {reservations.filter((r) => r.status === 'PENDING').length}
                </p>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
                <p className="text-xs text-emerald-400 font-semibold">Đã Xác Nhận</p>
                <p className="text-2xl font-black text-emerald-400 mt-1">
                  {reservations.filter((r) => r.status === 'CONFIRMED').length}
                </p>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
                <p className="text-xs text-blue-400 font-semibold">Khách Đã Đến</p>
                <p className="text-2xl font-black text-blue-400 mt-1">
                  {reservations.filter((r) => r.status === 'ARRIVED').length}
                </p>
              </div>
            </div>

            {/* Time Slot Table Availability Overview */}
            {slotAvailability.length > 0 && (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
                <p className="text-xs font-bold text-slate-300 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-orange-400" />
                  Tình Trạng Bàn Theo Khung Giờ (Ngày {resFilterDate}):
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
                  {slotAvailability.map((s) => (
                    <div
                      key={s.timeSlot}
                      onClick={() => setResFilterSlot(resFilterSlot === s.timeSlot ? '' : s.timeSlot)}
                      className={`p-2.5 rounded-xl border text-center cursor-pointer transition ${
                        resFilterSlot === s.timeSlot
                          ? 'bg-orange-600/20 border-orange-500 text-white shadow-md'
                          : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <p className="text-[10px] text-slate-400">{s.label.split('(')[0]}</p>
                      <p className="font-extrabold text-xs text-white my-0.5">{s.timeSlot}</p>
                      <p className={`text-[10px] font-bold ${s.availableTablesCount > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {s.availableTablesCount > 0 ? `${s.availableTablesCount} bàn trống` : 'Hết bàn'}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Reservations Cards List */}
            {reservations.length === 0 ? (
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center text-slate-500 text-xs">
                Không tìm thấy lượt đặt bàn nào phù hợp với bộ lọc.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {reservations.map((res) => {
                  const statusInfo = {
                    PENDING: { text: 'Chờ Xác Nhận', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
                    CONFIRMED: { text: 'Đã Xác Nhận', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
                    ARRIVED: { text: 'Khách Đã Đến', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
                    COMPLETED: { text: 'Đã Hoàn Tất', color: 'bg-slate-800 text-slate-300 border-slate-700' },
                    CANCELLED: { text: 'Đã Hủy', color: 'bg-red-500/10 text-red-400 border-red-500/20' },
                  }[res.status] || { text: res.status, color: 'bg-slate-800 text-slate-400 border-slate-700' };

                  return (
                    <div key={res.id} className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-3.5 flex flex-col justify-between">
                      <div className="space-y-2.5">
                        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                          <span className="font-mono font-bold text-amber-400 text-xs">{res.reservationCode}</span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusInfo.color}`}>
                            {statusInfo.text}
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="w-8 h-8 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400 font-extrabold text-xs flex items-center justify-center">
                              {res.tableNumber || '?'}
                            </span>
                            <div>
                              <p className="text-white font-bold text-xs">
                                Bàn {res.tableNumber || 'Chưa gán bàn'} {res.tableCapacity ? `(${res.tableCapacity} chỗ)` : ''}
                              </p>
                              <p className="text-[10px] text-slate-400">{res.guestCount} Khách</p>
                            </div>
                          </div>

                          <div className="text-right">
                            <p className="font-bold text-xs text-white">{res.timeSlot}</p>
                            <p className="text-[10px] text-slate-400">{res.reservationDate}</p>
                          </div>
                        </div>

                        <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800/80 space-y-1 text-xs">
                          <p className="text-slate-300 font-bold truncate">Khách: {res.customerName}</p>
                          <p className="text-[11px] text-slate-400 flex items-center gap-1.5">
                            <Phone className="w-3 h-3 text-emerald-400" />
                            <a href={`tel:${res.customerPhone}`} className="text-blue-400 hover:underline">{res.customerPhone}</a>
                          </p>
                          {res.note && (
                            <p className="text-[10px] text-slate-400 italic pt-1 border-t border-slate-800">
                              "{res.note}"
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="pt-2 border-t border-slate-800 flex flex-wrap gap-1.5 text-xs">
                        {res.status === 'PENDING' && (
                          <>
                            <button
                              onClick={() => handleUpdateReservationStatus(res.id, 'CONFIRMED')}
                              disabled={updatingResId === res.id}
                              className="flex-1 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] transition"
                            >
                              ✓ Xác Nhận
                            </button>
                            <button
                              onClick={() => handleUpdateReservationStatus(res.id, 'CANCELLED')}
                              disabled={updatingResId === res.id}
                              className="px-3 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 font-bold text-[11px] transition"
                            >
                              Hủy
                            </button>
                          </>
                        )}

                        {res.status === 'CONFIRMED' && (
                          <>
                            <button
                              onClick={() => handleUpdateReservationStatus(res.id, 'ARRIVED')}
                              disabled={updatingResId === res.id}
                              className="flex-1 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-[11px] transition"
                              title="Khách đã đến nhận bàn (tự động chuyển bàn sang OCCUPIED)"
                            >
                              🍽️ Nhận Bàn (Check-in)
                            </button>
                            <button
                              onClick={() => handleUpdateReservationStatus(res.id, 'CANCELLED')}
                              disabled={updatingResId === res.id}
                              className="px-3 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 font-bold text-[11px] transition"
                            >
                              Hủy
                            </button>
                          </>
                        )}

                        {res.status === 'ARRIVED' && (
                          <>
                            <button
                              onClick={() => handleOpenStaffOrder(res)}
                              className="flex-1 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-[11px] transition"
                            >
                              + Tạo đơn món
                            </button>
                            <button
                              onClick={() => handleUpdateReservationStatus(res.id, 'COMPLETED')}
                              disabled={updatingResId === res.id}
                              className="flex-1 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 font-bold text-[11px] border border-slate-700 transition"
                            >
                              ✓ Hoàn Tất Dùng Bữa
                            </button>
                          </>
                        )}

                        {(res.status === 'COMPLETED' || res.status === 'CANCELLED') && (
                          <span className="w-full text-center text-[10px] text-slate-500 italic py-1">
                            Lượt đặt bàn đã kết thúc
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </main>

      {staffOrderReservation && (
        <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <form onSubmit={handleCreateStaffOrder} className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h2 className="text-white font-bold">Tạo đơn cho bàn {staffOrderReservation.tableNumber}</h2>
                <p className="text-xs text-slate-400">Đặt bàn {staffOrderReservation.reservationCode} · {staffOrderReservation.customerName}</p>
              </div>
              <button type="button" onClick={() => setStaffOrderReservation(null)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-5 overflow-y-auto space-y-4">
              <div className="grid sm:grid-cols-2 gap-2">
                {staffMenuItems.map((item) => {
                  const cartItem = staffCart.find((entry) => entry.menuItemId === item.id);
                  return (
                    <div key={item.id} className="bg-slate-950 border border-slate-800 rounded-xl p-3 flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-white truncate">{item.name}</p>
                        <p className="text-[11px] text-orange-300">{formatVND(item.price)}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {cartItem && <button type="button" onClick={() => handleAddStaffOrderItem(item.id, -1)} className="p-1 rounded bg-slate-800 text-white"><Minus className="w-3 h-3" /></button>}
                        {cartItem && <span className="text-white text-xs font-bold">{cartItem.quantity}</span>}
                        <button type="button" onClick={() => handleAddStaffOrderItem(item.id, 1)} className="p-1 rounded bg-orange-600 text-white"><Plus className="w-3 h-3" /></button>
                      </div>
                    </div>
                  );
                })}
              </div>
              <textarea value={staffOrderNote} onChange={(e) => setStaffOrderNote(e.target.value)} placeholder="Ghi chú cho bếp (không bắt buộc)" className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white" rows={2} />
            </div>
            <div className="p-5 border-t border-slate-800 flex justify-end gap-2">
              <button type="button" onClick={() => setStaffOrderReservation(null)} className="px-4 py-2 rounded-lg text-slate-300 bg-slate-800">Đóng</button>
              <button type="submit" disabled={creatingStaffOrder || staffCart.length === 0} className="px-4 py-2 rounded-lg text-white font-bold bg-orange-600 disabled:opacity-50">{creatingStaffOrder ? 'Đang tạo…' : 'Tạo đơn'}</button>
            </div>
          </form>
        </div>
      )}

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
                <span>
                  {selectedOrderForPayment.orderType === 'DINE_IN' && <>Số Bàn: <strong>Bàn {selectedOrderForPayment.tableNumber}</strong></>}
                  {selectedOrderForPayment.orderType === 'DELIVERY' && <>Giao đến: <strong>{selectedOrderForPayment.deliveryAddress}</strong></>}
                  {selectedOrderForPayment.orderType === 'PICKUP' && <>Hình thức: <strong>Đến Lấy</strong></>}
                </span>
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

              <div className="flex justify-between text-[11px] text-slate-700">
                <span>Tạm tính:</span>
                <span>{formatVND(selectedOrderForPayment.totalAmount)}</span>
              </div>
              {appliedVoucher && (
                <div className="flex justify-between text-[11px] font-bold text-emerald-700">
                  <span>Giảm giá ({appliedVoucher.code}):</span>
                  <span>-{formatVND(appliedVoucher.discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between font-black text-sm pt-1 text-slate-900 border-t border-slate-300">
                <span>KHÁCH CẦN TRẢ:</span>
                <span className="text-orange-600">{formatVND(selectedOrderForPayment.totalAmount - (appliedVoucher?.discountAmount || 0))}</span>
              </div>
            </div>

            {/* Voucher Input */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-300">Mã Giảm Giá (nếu có):</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={voucherCodeInput}
                  onChange={(e) => { setVoucherCodeInput(e.target.value.toUpperCase()); setAppliedVoucher(null); setBankQr(null); setVoucherError(''); }}
                  placeholder="Nhập mã voucher..."
                  className="flex-1 bg-slate-950 border border-slate-800 focus:border-orange-500 rounded-xl px-3 py-2 text-xs text-slate-200 placeholder-slate-600 outline-none uppercase"
                />
                <button
                  type="button"
                  onClick={handleCheckVoucher}
                  disabled={checkingVoucher || !voucherCodeInput.trim()}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold disabled:opacity-40"
                >
                  {checkingVoucher ? '...' : 'Kiểm Tra'}
                </button>
              </div>
              {voucherError && <p className="text-[11px] text-red-400">{voucherError}</p>}
              {appliedVoucher && (
                <div className="flex justify-between text-[11px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg px-3 py-2 font-bold">
                  <span>✓ Áp dụng "{appliedVoucher.code}"</span>
                  <span>-{formatVND(appliedVoucher.discountAmount)}</span>
                </div>
              )}
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
                  onClick={() => { setPaymentMethod('BANK_TRANSFER'); handleFetchBankQr(selectedOrderForPayment.id, appliedVoucher?.code); }}
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

            {/* Bank Transfer QR Code */}
            {paymentMethod === 'BANK_TRANSFER' && (
              <div className="bg-slate-950 border border-blue-500/20 rounded-2xl p-4 flex flex-col items-center gap-2">
                {loadingQr ? (
                  <p className="text-xs text-slate-400 py-6">Đang tạo mã QR...</p>
                ) : bankQr ? (
                  <>
                    <img src={bankQr.qrImageUrl} alt="VietQR" className="w-48 h-48 rounded-xl bg-white p-2" />
                    <p className="text-[11px] text-slate-400 text-center">
                      Đưa mã này cho khách quét bằng <strong className="text-blue-400">app ngân hàng bất kỳ</strong> để chuyển khoản
                    </p>
                    <p className="text-[10px] text-slate-500">Nội dung CK: <span className="font-mono text-amber-400">{bankQr.transferContent}</span></p>
                    <p className="text-[10px] text-amber-500/80 text-center pt-1">
                      ⚠️ Sau khi khách chuyển khoản, kiểm tra sao kê/thông báo ngân hàng rồi bấm "Xác Nhận Đã Thu Tiền" bên dưới.
                    </p>
                  </>
                ) : (
                  <p className="text-xs text-red-400 py-6">Không tạo được mã QR, vui lòng thử lại.</p>
                )}
              </div>
            )}

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

      {/* MODAL TẠO LƯỢT ĐẶT BÀN MỚI CHO STAFF */}
      {showCreateResModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-orange-600/20 text-orange-400 border border-orange-500/30 flex items-center justify-center">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">Tạo Lượt Đặt Bàn Cho Khách</h3>
                  <p className="text-xs text-slate-400">Dành cho khách gọi điện thoại hoặc đặt trực tiếp tại quầy</p>
                </div>
              </div>
              <button onClick={() => setShowCreateResModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateReservationSubmit} className="space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Ngày Đến (*):</label>
                  <input
                    type="date"
                    required
                    min={new Date().toISOString().split('T')[0]}
                    value={newResForm.reservationDate}
                    onChange={(e) => setNewResForm({ ...newResForm, reservationDate: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-orange-500 rounded-xl p-2.5 text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Khung Giờ (*):</label>
                  <select
                    value={newResForm.timeSlot}
                    onChange={(e) => setNewResForm({ ...newResForm, timeSlot: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-orange-500 rounded-xl p-2.5 text-white outline-none"
                  >
                    <option value="09:00 - 10:30">09:00 - 10:30 (Sáng)</option>
                    <option value="11:00 - 12:30">11:00 - 12:30 (Trưa 1)</option>
                    <option value="12:30 - 14:00">12:30 - 14:00 (Trưa 2)</option>
                    <option value="17:30 - 19:00">17:30 - 19:00 (Tối 1)</option>
                    <option value="19:00 - 20:30">19:00 - 20:30 (Tối 2)</option>
                    <option value="20:30 - 22:00">20:30 - 22:00 (Tối 3)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Chọn Bàn (Tùy chọn):</label>
                  <select
                    value={newResForm.tableId}
                    onChange={(e) => setNewResForm({ ...newResForm, tableId: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-orange-500 rounded-xl p-2.5 text-white outline-none"
                  >
                    <option value="">-- Quán tự sắp xếp bàn --</option>
                    {tables.map((t) => (
                      <option key={t.id} value={t.id}>
                        Bàn {t.tableNumber} ({t.capacity} chỗ)
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Số Lượng Khách (*):</label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    required
                    value={newResForm.guestCount}
                    onChange={(e) => setNewResForm({ ...newResForm, guestCount: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-orange-500 rounded-xl p-2.5 text-white outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Tên Khách Hàng (*):</label>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: Anh Tuấn..."
                    value={newResForm.customerName}
                    onChange={(e) => setNewResForm({ ...newResForm, customerName: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-orange-500 rounded-xl p-2.5 text-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Số Điện Thoại (*):</label>
                  <input
                    type="tel"
                    required
                    placeholder="Ví dụ: 0901234567..."
                    value={newResForm.customerPhone}
                    onChange={(e) => setNewResForm({ ...newResForm, customerPhone: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-orange-500 rounded-xl p-2.5 text-white outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Ghi Chú Yêu Cầu:</label>
                <input
                  type="text"
                  placeholder="Ví dụ: Cần chuẩn bị hoa sinh nhật, 1 ghế trẻ em..."
                  value={newResForm.note}
                  onChange={(e) => setNewResForm({ ...newResForm, note: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-orange-500 rounded-xl p-2.5 text-white outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateResModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  disabled={creatingRes}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-600 to-amber-500 text-white font-bold shadow-md shadow-orange-500/20 disabled:opacity-50"
                >
                  {creatingRes ? 'Đang tạo...' : 'Lưu Đặt Bàn'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default StaffDashboard;

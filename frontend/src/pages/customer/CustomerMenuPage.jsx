import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import {
  Utensils,
  Search,
  ShoppingBag,
  Plus,
  Minus,
  X,
  Check,
  Info,
  ChevronRight,
  MessageSquare,
  Clock,
  CheckCircle2,
  Receipt,
  User,
  MapPin,
  Flame,
  Sparkles,
  Truck,
  QrCode,
  SlidersHorizontal,
  ChevronDown
} from 'lucide-react';

function CustomerMenuPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const queryTableId = searchParams.get('tableId');

  const {
    tableId,
    setTableId,
    cartItems,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    submitOrder,
    submittingOrder,
    lastOrder,
    totalItemsCount,
    totalAmount,
  } = useCart();

  const [categories, setCategories] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Selected item modal
  const [selectedItem, setSelectedItem] = useState(null);
  const [itemQuantity, setItemQuantity] = useState(1);
  const [itemNote, setItemNote] = useState('');

  // Cart drawer modal & Customer order note
  const [showCartDrawer, setShowCartDrawer] = useState(false);
  const [customerNote, setCustomerNote] = useState('');

  // Hình thức đặt món: mặc định Ăn Tại Bàn nếu có tableId, ngược lại Ăn Tại Bàn hoặc Đến Lấy
  const [orderType, setOrderType] = useState(queryTableId || tableId ? 'DINE_IN' : 'DINE_IN');
  const [manualTableId, setManualTableId] = useState(tableId || '');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [availableTables, setAvailableTables] = useState([]);

  // Modal chọn/đổi bàn nhanh
  const [showTableModal, setShowTableModal] = useState(false);

  // Order status/success modal
  const [showOrderSuccessModal, setShowOrderSuccessModal] = useState(false);

  // Theo dõi đơn hàng & lịch sử đơn hàng thời gian thực
  const [tableOrders, setTableOrders] = useState([]);
  const [showTrackingModal, setShowTrackingModal] = useState(false);
  const [qrByOrderCode, setQrByOrderCode] = useState({});
  const [loadingQrCode, setLoadingQrCode] = useState(null);

  useEffect(() => {
    if (queryTableId) {
      setTableId(queryTableId);
      setManualTableId(queryTableId);
      setOrderType('DINE_IN');
    }
  }, [queryTableId, setTableId]);

  useEffect(() => {
    fetchCategories();
    fetchTables();
  }, []);

  // Debounce tìm kiếm 350ms
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchKeyword), 350);
    return () => clearTimeout(timer);
  }, [searchKeyword]);

  useEffect(() => {
    fetchMenuItems();
  }, [selectedCategoryId, debouncedSearch]);

  // Tải danh sách đơn hàng của bàn khi có tableId
  useEffect(() => {
    const activeTable = queryTableId || tableId;
    if (!activeTable) return;
    fetchTableOrders(activeTable);
    const interval = setInterval(() => {
      if (!document.hidden) fetchTableOrders(activeTable);
    }, 8000);
    return () => clearInterval(interval);
  }, [tableId, queryTableId]);

  // Tự điền địa chỉ/SĐT đã lưu từ hồ sơ nếu khách đã đăng nhập
  useEffect(() => {
    if (isAuthenticated && user?.role === 'CUSTOMER') {
      axiosClient
        .get('/customer/profile')
        .then((profile) => {
          if (profile.address) setDeliveryAddress(profile.address);
          if (profile.phone) setContactPhone(profile.phone);
        })
        .catch((err) => console.error('Lỗi tải hồ sơ:', err));
    }
  }, [isAuthenticated, user]);

  const fetchTables = async () => {
    try {
      const data = await axiosClient.get('/customer/tables');
      setAvailableTables(data);
    } catch (err) {
      console.error('Lỗi tải danh sách bàn:', err);
    }
  };

  const fetchCategories = async () => {
    try {
      const data = await axiosClient.get('/customer/categories');
      setCategories(data);
    } catch (err) {
      console.error('Lỗi tải danh mục:', err);
    }
  };

  const fetchMenuItems = async () => {
    setLoading(true);
    try {
      const params = {};
      if (selectedCategoryId) params.categoryId = selectedCategoryId;
      if (debouncedSearch) params.search = debouncedSearch;

      const data = await axiosClient.get('/customer/menu', { params });
      setMenuItems(data);
    } catch (err) {
      console.error('Lỗi tải thực đơn:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchTableOrders = async (tId = tableId) => {
    if (!tId) return;
    try {
      const data = await axiosClient.get(`/customer/orders/table/${tId}`);
      setTableOrders(data);
    } catch (err) {
      console.error('Lỗi tải danh sách đơn hàng của bàn:', err);
    }
  };

  const handleShowPaymentQr = async (orderCode) => {
    if (qrByOrderCode[orderCode]) {
      setQrByOrderCode((prev) => ({
        ...prev,
        [orderCode]: prev[orderCode]?.__hidden
          ? { ...prev[orderCode], __hidden: false }
          : { ...prev[orderCode], __hidden: true },
      }));
      return;
    }
    setLoadingQrCode(orderCode);
    try {
      const data = await axiosClient.get(`/customer/payment/qr/${orderCode}`);
      setQrByOrderCode((prev) => ({ ...prev, [orderCode]: data }));
    } catch (err) {
      alert('Lỗi tạo mã QR: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoadingQrCode(null);
    }
  };

  const formatVND = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const handleOpenDetailModal = (item) => {
    setSelectedItem(item);
    setItemQuantity(1);
    setItemNote('');
  };

  const handleConfirmAddToCart = () => {
    if (selectedItem) {
      addToCart(selectedItem, itemQuantity, itemNote);
      setSelectedItem(null);
    }
  };

  const handleQuickAddToCart = (e, item) => {
    e.stopPropagation();
    addToCart(item, 1);
  };

  const handleSelectTable = (selectedTId) => {
    setTableId(String(selectedTId));
    setManualTableId(String(selectedTId));
    setOrderType('DINE_IN');
    setShowTableModal(false);
    fetchTableOrders(selectedTId);
  };

  const handleCheckoutOrder = async () => {
    const activeTId = queryTableId || manualTableId || tableId;

    if (orderType === 'DINE_IN' && !activeTId) {
      alert('Vui lòng chọn số bàn trước khi đặt món ăn tại bàn!');
      setShowTableModal(true);
      return;
    }
    if (orderType === 'DELIVERY' && !deliveryAddress.trim()) {
      alert('Vui lòng nhập địa chỉ giao hàng!');
      return;
    }
    if (orderType !== 'DINE_IN' && !contactPhone.trim()) {
      alert('Vui lòng nhập số điện thoại liên hệ!');
      return;
    }

    try {
      await submitOrder({
        customerNote,
        orderType,
        overrideTableId: activeTId,
        deliveryAddress,
        contactPhone,
      });
      setShowCartDrawer(false);
      setCustomerNote('');
      setShowOrderSuccessModal(true);
      if (activeTId) fetchTableOrders(activeTId);
    } catch (err) {
      alert('Đặt món thất bại: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleRequestPayment = async () => {
    const activeTId = queryTableId || manualTableId || tableId;
    if (!activeTId) {
      alert('Vui lòng chọn bàn trước khi yêu cầu tính tiền!');
      setShowTableModal(true);
      return;
    }
    if (window.confirm(`Bạn muốn gửi yêu cầu tính tiền cho Bàn B${String(activeTId).padStart(2, '0')}?`)) {
      try {
        await axiosClient.post(`/customer/payment/request?tableId=${activeTId}`);
        alert(`Đã gửi yêu cầu thanh toán tới nhân viên phục vụ cho Bàn B${String(activeTId).padStart(2, '0')}!`);
      } catch (err) {
        alert('Lỗi gửi yêu cầu thanh toán: ' + (err.response?.data?.message || err.message));
      }
    }
  };

  const ORDER_STATUS_LABEL = {
    PENDING: { text: 'Đã Nhận', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
    PROCESSING: { text: 'Đang Chế Biến', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
    COMPLETED: { text: 'Đã Lên Món / Hoàn Tất', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
    PAID: { text: 'Đã Thanh Toán', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
    CANCELLED: { text: 'Đã Hủy', color: 'bg-red-500/10 text-red-400 border-red-500/20' },
  };

  const activeTableDisplay = queryTableId || manualTableId || tableId;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Top Navigation Bar (Full Desktop Width) */}
      <header className="sticky top-0 z-30 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Logo & Brand Name */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => { setSelectedCategoryId(null); setSearchKeyword(''); }}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center shadow-lg shadow-orange-500/20 shrink-0">
              <Utensils className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-white text-base sm:text-lg tracking-tight leading-tight">
                  NHÀ HÀNG ABC
                </h1>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Đang mở cửa
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden xs:block">Ẩm Thực Đặc Sắc & Chuẩn Vị</p>
            </div>
          </div>

          {/* Desktop Search Bar */}
          <div className="hidden md:flex flex-1 max-w-md mx-4">
            <div className="relative w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                placeholder="Tìm món ngon (phở, gỏi, chả giò, lẩu, đồ uống...)"
                className="w-full bg-slate-950 border border-slate-800 focus:border-orange-500 rounded-xl py-2 pl-10 pr-8 text-xs text-slate-200 outline-none transition shadow-inner placeholder-slate-500"
              />
              {searchKeyword && (
                <button
                  onClick={() => setSearchKeyword('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Actions & Utilities */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Dining Mode / Table Selector Button */}
            <button
              onClick={() => setShowTableModal(true)}
              className="px-3 py-1.5 sm:py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold flex items-center gap-1.5 transition shadow-sm"
              title="Chọn hoặc đổi bàn / hình thức nhận món"
            >
              <Utensils className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="text-amber-400">
                {activeTableDisplay ? `Bàn B${String(activeTableDisplay).padStart(2, '0')}` : 'Chọn Bàn'}
              </span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {/* Tính tiền button (hiển thị khi đã chọn bàn) */}
            {activeTableDisplay && (
              <button
                onClick={handleRequestPayment}
                className="hidden sm:flex px-3 py-1.5 sm:py-2 rounded-xl bg-purple-600/20 hover:bg-purple-600 text-purple-300 hover:text-white border border-purple-500/30 text-xs font-bold items-center gap-1.5 transition shadow-sm"
                title="Yêu cầu nhân viên tính tiền"
              >
                <Receipt className="w-3.5 h-3.5 text-purple-400" />
                <span>Tính Tiền</span>
              </button>
            )}

            {/* Theo dõi đơn hàng */}
            {tableOrders.length > 0 && (
              <button
                onClick={() => {
                  fetchTableOrders();
                  setShowTrackingModal(true);
                }}
                className="relative px-3 py-1.5 sm:py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold flex items-center gap-1.5 transition shadow-sm"
              >
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">Theo Dõi Đơn</span>
                <span className="px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px]">
                  {tableOrders.length}
                </span>
              </button>
            )}

            {/* User Account / Login */}
            <button
              onClick={() => navigate(isAuthenticated && user?.role === 'CUSTOMER' ? '/account' : '/login')}
              className="px-3 py-1.5 sm:py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold flex items-center gap-1.5 shadow-sm"
              title={isAuthenticated ? 'Tài khoản của tôi' : 'Đăng nhập / Đăng ký'}
            >
              <User className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">
                {isAuthenticated && user?.role === 'CUSTOMER' ? user.fullName?.split(' ').pop() : 'Đăng Nhập'}
              </span>
            </button>

            {/* Desktop Cart Button */}
            <button
              onClick={() => setShowCartDrawer(true)}
              className="relative px-3.5 py-1.5 sm:py-2 rounded-xl bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-orange-600/25 transition active:scale-95"
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden sm:inline">Giỏ Hàng</span>
              {totalItemsCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-red-600 text-white text-[10px] font-black flex items-center justify-center shadow">
                  {totalItemsCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Search Input Bar */}
        <div className="md:hidden px-4 pb-3">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              placeholder="🔍 Tìm món ăn ngon..."
              className="w-full bg-slate-950 border border-slate-800 focus:border-orange-500 rounded-xl py-2 pl-10 pr-8 text-xs text-slate-200 outline-none placeholder-slate-500"
            />
            {searchKeyword && (
              <button
                onClick={() => setSearchKeyword('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Container (Full Desktop Width) */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full flex-1 space-y-6">
        {/* Modern Web Hero Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-orange-950/40 via-slate-900 to-slate-900 border border-orange-500/20 p-6 sm:p-8 shadow-xl">
          <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-orange-600/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Khám Phá Toàn Bộ Thực Đơn Đặc Sắc</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight leading-tight">
              Thưởng Thức Hương Vị Ẩm Thực Tươi Ngon
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-2xl">
              Chào mừng bạn đến với Nhà Hàng ABC! Xem trực tiếp tất cả món ăn, chọn món tại bàn hoặc đặt mang về với quy trình phục vụ nhanh chóng và thanh toán tiện lợi.
            </p>

            {/* Highlights tags */}
            <div className="flex flex-wrap items-center gap-2 pt-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] text-slate-300">
                <Flame className="w-3 h-3 text-orange-400" />
                Chế biến nóng hổi
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] text-slate-300">
                <Truck className="w-3 h-3 text-blue-400" />
                Ăn tại bàn / Đến lấy / Giao hàng
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] text-slate-300">
                <QrCode className="w-3 h-3 text-emerald-400" />
                Thanh toán VietQR tiện lợi
              </span>
            </div>
          </div>
        </div>

        {/* Category Navigation Bar (Pill Tabs) */}
        <div className="sticky top-16 z-20 bg-slate-950/90 backdrop-blur-md py-3 -my-2 flex items-center gap-2 overflow-x-auto no-scrollbar border-b border-slate-800/60">
          <button
            onClick={() => setSelectedCategoryId(null)}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
              selectedCategoryId === null
                ? 'bg-gradient-to-r from-orange-600 to-amber-500 text-white shadow-md shadow-orange-600/25'
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
            }`}
          >
            <Utensils className="w-3.5 h-3.5" />
            <span>Tất Cả Món</span>
          </button>

          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategoryId(cat.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategoryId === cat.id
                  ? 'bg-gradient-to-r from-orange-600 to-amber-500 text-white shadow-md shadow-orange-600/25'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
              }`}
            >
              <span>{cat.name}</span>
              <span className="ml-1.5 px-1.5 py-0.2 rounded-full bg-black/20 text-[10px]">
                {cat.totalItems}
              </span>
            </button>
          ))}
        </div>

        {/* Menu Status and Item Count Info */}
        <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
          <div>
            Đang hiển thị{' '}
            <span className="font-bold text-white">{menuItems.length}</span> món ăn{' '}
            {selectedCategoryId && (
              <span>
                thuộc danh mục{' '}
                <span className="text-amber-400 font-semibold">
                  "{categories.find((c) => c.id === selectedCategoryId)?.name}"
                </span>
              </span>
            )}
            {debouncedSearch && (
              <span>
                khớp từ khóa <span className="text-orange-400 font-semibold">"{debouncedSearch}"</span>
              </span>
            )}
          </div>
          {(selectedCategoryId || debouncedSearch) && (
            <button
              onClick={() => {
                setSelectedCategoryId(null);
                setSearchKeyword('');
              }}
              className="text-orange-400 hover:underline text-xs"
            >
              Xóa bộ lọc
            </button>
          )}
        </div>

        {/* Menu Items Grid (Desktop Wide Grid: 4 columns on large screens) */}
        {loading ? (
          <div className="text-center py-20 text-slate-500 text-sm flex flex-col items-center gap-3">
            <div className="w-8 h-8 border-3 border-orange-500 border-t-transparent rounded-full animate-spin" />
            <span>Đang tải thực đơn thơm ngon...</span>
          </div>
        ) : menuItems.length === 0 ? (
          <div className="text-center py-16 text-slate-400 text-sm bg-slate-900/50 rounded-3xl border border-slate-800 p-8 space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-800 text-slate-500 flex items-center justify-center mx-auto">
              <Search className="w-6 h-6" />
            </div>
            <p className="font-semibold text-base text-white">Không tìm thấy món ăn nào phù hợp</p>
            <p className="text-xs text-slate-500">Hãy thử tìm với từ khóa khác hoặc chuyển sang danh mục món ăn khác.</p>
            <button
              onClick={() => {
                setSelectedCategoryId(null);
                setSearchKeyword('');
              }}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold"
            >
              Xem Toàn Bộ Thực Đơn
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {menuItems.map((item) => (
              <div
                key={item.id}
                onClick={() => handleOpenDetailModal(item)}
                className="bg-slate-900/90 border border-slate-800 hover:border-orange-500/50 rounded-2xl overflow-hidden flex flex-col group transition-all duration-300 hover:shadow-xl hover:shadow-orange-500/10 hover:-translate-y-1 cursor-pointer"
              >
                {/* Food Image Banner */}
                <div className="relative h-48 w-full overflow-hidden bg-slate-800 shrink-0">
                  <img
                    src={item.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600'}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  {/* Category badge */}
                  <div className="absolute top-2.5 left-2.5">
                    <span className="px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-[10px] font-bold text-amber-400 border border-amber-500/20 uppercase tracking-wider">
                      {item.categoryName}
                    </span>
                  </div>

                  {item.status === 'UNAVAILABLE' ? (
                    <div className="absolute inset-0 bg-black/75 backdrop-blur-[2px] flex items-center justify-center text-xs font-bold text-red-400">
                      TẠM HẾT MÓN
                    </div>
                  ) : (
                    <div className="absolute top-2.5 right-2.5">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 backdrop-blur-md text-[10px] font-bold text-emerald-400 border border-emerald-500/30">
                        Còn Món
                      </span>
                    </div>
                  )}
                </div>

                {/* Food Card Content */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <h3 className="font-bold text-white text-base group-hover:text-orange-400 transition-colors line-clamp-1">
                      {item.name}
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-2 mt-1.5 leading-relaxed min-h-[32px]">
                      {item.description || 'Hương vị thơm ngon đặc trưng chuẩn phong vị nhà hàng.'}
                    </p>
                  </div>

                  {/* Price & Action Row */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                    <div>
                      <span className="text-[10px] text-slate-500 block uppercase font-medium">Giá bán</span>
                      <span className="font-black text-orange-400 text-base">{formatVND(item.price)}</span>
                    </div>

                    {item.status === 'AVAILABLE' && (
                      <button
                        onClick={(e) => handleQuickAddToCart(e, item)}
                        className="px-3 py-1.5 rounded-xl bg-orange-600/20 hover:bg-orange-600 text-orange-400 hover:text-white border border-orange-500/30 font-bold text-xs flex items-center gap-1.5 transition active:scale-95 shadow"
                        title="Thêm nhanh vào giỏ hàng"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Thêm</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Floating Bottom Cart Bar (For mobile or quick access) */}
      {totalItemsCount > 0 && (
        <div className="fixed bottom-4 left-0 right-0 z-40 px-4 pointer-events-none">
          <div className="max-w-xl mx-auto bg-slate-900/95 border border-orange-500/40 rounded-2xl p-3 shadow-2xl backdrop-blur-lg flex items-center justify-between pointer-events-auto">
            <div className="flex items-center gap-3">
              <div className="relative p-2.5 rounded-xl bg-gradient-to-r from-orange-600 to-amber-500 text-white shadow-lg">
                <ShoppingBag className="w-5 h-5" />
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-black flex items-center justify-center shadow">
                  {totalItemsCount}
                </span>
              </div>

              <div>
                <p className="text-[10px] text-slate-400 font-medium">
                  {activeTableDisplay ? `Bàn B${String(activeTableDisplay).padStart(2, '0')}` : 'Đơn Hàng Của Bạn'}
                </p>
                <p className="text-sm sm:text-base font-black text-orange-400">{formatVND(totalAmount)}</p>
              </div>
            </div>

            <button
              onClick={() => setShowCartDrawer(true)}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-orange-600/25 transition active:scale-95"
            >
              <span>Xem Giỏ Hàng</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Slide-Over Cart Drawer (Modern Desktop & Mobile Off-canvas) */}
      {showCartDrawer && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex justify-end">
          <div className="bg-slate-900 border-l border-slate-800 w-full max-w-lg h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
            {/* Drawer Header */}
            <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-orange-500/10 text-orange-500 border border-orange-500/20 flex items-center justify-center">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">Giỏ Hàng Của Bạn</h3>
                  <p className="text-[11px] text-slate-400">
                    {totalItemsCount > 0 ? `${totalItemsCount} món đã chọn` : 'Chưa có món nào'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {cartItems.length > 0 && (
                  <button
                    onClick={clearCart}
                    className="text-xs text-slate-400 hover:text-red-400 px-2 py-1 transition"
                  >
                    Xóa tất cả
                  </button>
                )}
                <button
                  onClick={() => setShowCartDrawer(false)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Cart Items List */}
            <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
              {cartItems.length === 0 ? (
                <div className="text-center py-16 text-slate-500 space-y-3">
                  <div className="w-16 h-16 rounded-full bg-slate-800 text-slate-600 flex items-center justify-center mx-auto">
                    <ShoppingBag className="w-8 h-8" />
                  </div>
                  <p className="text-sm font-semibold text-slate-300">Giỏ hàng của bạn đang trống</p>
                  <p className="text-xs text-slate-500 max-w-xs mx-auto">
                    Hãy bấm nút "+ Thêm" trên các món ăn để thêm vào giỏ hàng nhé!
                  </p>
                </div>
              ) : (
                <>
                  {/* List of items */}
                  <div className="space-y-3">
                    {cartItems.map(({ menuItem, quantity, note }) => (
                      <div
                        key={menuItem.id}
                        className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 flex items-center gap-3.5"
                      >
                        <img
                          src={menuItem.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200'}
                          alt={menuItem.name}
                          className="w-16 h-16 rounded-xl object-cover bg-slate-800 shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-white text-xs sm:text-sm truncate">{menuItem.name}</h4>
                          <p className="text-orange-400 font-extrabold text-xs mt-0.5">{formatVND(menuItem.price)}</p>
                          {note && (
                            <p className="text-[10px] text-amber-400/90 mt-1 italic line-clamp-1">📝 {note}</p>
                          )}
                        </div>

                        {/* Quantity controls */}
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => updateQuantity(menuItem.id, quantity - 1)}
                            className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center text-xs transition"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="font-bold text-xs text-white w-4 text-center">{quantity}</span>
                          <button
                            onClick={() => updateQuantity(menuItem.id, quantity + 1)}
                            className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center text-xs transition"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => removeFromCart(menuItem.id)}
                            className="w-7 h-7 rounded-lg hover:bg-red-500/20 text-slate-500 hover:text-red-400 flex items-center justify-center text-xs transition ml-1"
                            title="Xóa món này"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Order Type & Details Form */}
                  <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3 mt-4">
                    <label className="block text-xs font-bold text-slate-300">Hình Thức Nhận Món:</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { v: 'DINE_IN', l: 'Ăn Tại Bàn', icon: Utensils },
                        { v: 'PICKUP', l: 'Đến Lấy', icon: ShoppingBag },
                        { v: 'DELIVERY', l: 'Giao Tận Nơi', icon: Truck },
                      ].map((opt) => {
                        const Icon = opt.icon;
                        const isSelected = orderType === opt.v;
                        return (
                          <button
                            key={opt.v}
                            type="button"
                            onClick={() => setOrderType(opt.v)}
                            className={`py-2 px-2 rounded-xl text-xs font-bold border flex flex-col items-center gap-1 transition ${
                              isSelected
                                ? 'bg-orange-600 border-orange-500 text-white shadow-md shadow-orange-600/20'
                                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                            }`}
                          >
                            <Icon className="w-3.5 h-3.5" />
                            <span>{opt.l}</span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Table selection dropdown if DINE_IN */}
                    {orderType === 'DINE_IN' && (
                      <div className="pt-2">
                        <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                          Vị trí bàn của bạn:
                        </label>
                        <select
                          value={manualTableId}
                          onChange={(e) => {
                            setManualTableId(e.target.value);
                            setTableId(e.target.value);
                          }}
                          className="w-full bg-slate-900 border border-slate-800 focus:border-orange-500 rounded-xl p-2.5 text-xs text-white outline-none"
                        >
                          <option value="">-- Bấm để chọn bàn --</option>
                          {availableTables.map((t) => (
                            <option key={t.id} value={t.id}>
                              Bàn {t.tableNumber} ({t.capacity} chỗ) - {t.status === 'AVAILABLE' ? 'Trống' : 'Đang phục vụ'}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    {/* Phone for PICKUP / DELIVERY */}
                    {orderType !== 'DINE_IN' && (
                      <div className="pt-1">
                        <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                          Số điện thoại nhận hàng:
                        </label>
                        <input
                          type="tel"
                          value={contactPhone}
                          onChange={(e) => setContactPhone(e.target.value)}
                          placeholder="Ví dụ: 0901234567..."
                          className="w-full bg-slate-900 border border-slate-800 focus:border-orange-500 rounded-xl p-2.5 text-xs text-white placeholder-slate-600 outline-none"
                        />
                      </div>
                    )}

                    {/* Address for DELIVERY */}
                    {orderType === 'DELIVERY' && (
                      <div className="pt-1">
                        <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                          Địa chỉ giao hàng chi tiết:
                        </label>
                        <input
                          type="text"
                          value={deliveryAddress}
                          onChange={(e) => setDeliveryAddress(e.target.value)}
                          placeholder="Số nhà, tên đường, phường/xã..."
                          className="w-full bg-slate-900 border border-slate-800 focus:border-orange-500 rounded-xl p-2.5 text-xs text-white placeholder-slate-600 outline-none"
                        />
                      </div>
                    )}

                    {/* Customer overall order note */}
                    <div className="pt-1">
                      <label className="block text-[11px] font-semibold text-slate-400 mb-1 flex items-center gap-1">
                        <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
                        <span>Ghi chú cho nhà bếp:</span>
                      </label>
                      <textarea
                        rows="2"
                        value={customerNote}
                        onChange={(e) => setCustomerNote(e.target.value)}
                        placeholder="Ví dụ: Mang món cùng lúc, cho thêm nước chấm..."
                        className="w-full bg-slate-900 border border-slate-800 focus:border-orange-500 rounded-xl p-2.5 text-xs text-white outline-none resize-none"
                      />
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Drawer Footer & Checkout */}
            {cartItems.length > 0 && (
              <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-950 space-y-3">
                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center justify-between text-slate-400">
                    <span>Số lượng món:</span>
                    <span className="text-white font-bold">{totalItemsCount}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm pt-1 border-t border-slate-800/80">
                    <span className="text-slate-300 font-semibold">Tổng Tiền Thanh Toán:</span>
                    <span className="font-black text-orange-400 text-lg">{formatVND(totalAmount)}</span>
                  </div>
                </div>

                <button
                  onClick={handleCheckoutOrder}
                  disabled={submittingOrder}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-orange-600/25 active:scale-95 transition disabled:opacity-50"
                >
                  {submittingOrder ? (
                    <span>Đang Gửi Đơn Tới Nhà Bếp...</span>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>
                        XÁC NHẬN ĐẶT MÓN
                        {orderType === 'DINE_IN' && activeTableDisplay ? ` (BÀN B${String(activeTableDisplay).padStart(2, '0')})` : ''}
                      </span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Quick Table Switcher Modal */}
      {showTableModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center">
                  <Utensils className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">Chọn Bàn Hoặc Hình Thức Đặt Món</h3>
                  <p className="text-xs text-slate-400">Bạn đang ngồi bàn nào hoặc muốn đặt mang về?</p>
                </div>
              </div>
              <button
                onClick={() => setShowTableModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Dining Mode Tabs */}
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setOrderType('DINE_IN')}
                className={`py-2 rounded-xl text-xs font-bold border transition ${
                  orderType === 'DINE_IN'
                    ? 'bg-orange-600 border-orange-500 text-white'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                Ăn Tại Bàn
              </button>
              <button
                onClick={() => {
                  setOrderType('PICKUP');
                  setTableId('');
                  setManualTableId('');
                  setShowTableModal(false);
                }}
                className={`py-2 rounded-xl text-xs font-bold border transition ${
                  orderType === 'PICKUP'
                    ? 'bg-orange-600 border-orange-500 text-white'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                Đến Lấy (Mang Về)
              </button>
              <button
                onClick={() => {
                  setOrderType('DELIVERY');
                  setTableId('');
                  setManualTableId('');
                  setShowTableModal(false);
                }}
                className={`py-2 rounded-xl text-xs font-bold border transition ${
                  orderType === 'DELIVERY'
                    ? 'bg-orange-600 border-orange-500 text-white'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                Giao Tận Nơi
              </button>
            </div>

            {/* Available Tables Grid */}
            {orderType === 'DINE_IN' && (
              <div className="space-y-3">
                <p className="text-xs font-semibold text-slate-300">Danh sách các bàn tại nhà hàng:</p>
                <div className="grid grid-cols-4 gap-3 max-h-64 overflow-y-auto pr-1">
                  {availableTables.map((t) => {
                    const isCurrent = String(t.id) === String(activeTableDisplay);
                    return (
                      <button
                        key={t.id}
                        onClick={() => handleSelectTable(t.id)}
                        className={`p-3 rounded-2xl border text-center transition flex flex-col items-center justify-center gap-1 ${
                          isCurrent
                            ? 'bg-orange-600 border-orange-500 text-white shadow-lg shadow-orange-600/30 ring-2 ring-orange-400/50'
                            : 'bg-slate-950 border-slate-800 text-slate-200 hover:border-slate-700 hover:bg-slate-800'
                        }`}
                      >
                        <span className="font-black text-sm">{t.tableNumber}</span>
                        <span className="text-[10px] opacity-75">{t.capacity} chỗ</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowTableModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Item Detail Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            {/* Image Preview */}
            <div className="relative h-60 bg-slate-800 shrink-0">
              <img
                src={selectedItem.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800'}
                alt={selectedItem.name}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => setSelectedItem(null)}
                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="absolute bottom-3 left-4">
                <span className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-xs font-bold text-amber-400 border border-amber-500/30">
                  {selectedItem.categoryName}
                </span>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1">
              <div>
                <h3 className="text-xl font-bold text-white">{selectedItem.name}</h3>
                <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                  {selectedItem.description || 'Món ăn đặc sắc của nhà hàng, thơm ngon trọn vị.'}
                </p>
                <p className="text-xl font-black text-orange-400 mt-3">{formatVND(selectedItem.price)}</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                  <MessageSquare className="w-4 h-4 text-amber-400" />
                  <span>Ghi chú riêng cho món này (nếu có):</span>
                </label>
                <input
                  type="text"
                  value={itemNote}
                  onChange={(e) => setItemNote(e.target.value)}
                  placeholder="Ví dụ: Ít đường, cay vừa, nhiều đá, không hành..."
                  className="w-full bg-slate-950 border border-slate-800 focus:border-orange-500 rounded-xl px-3.5 py-2.5 text-xs text-white outline-none"
                />
              </div>

              {/* Quantity Stepper */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                <span className="text-xs font-bold text-slate-300">Chọn số lượng:</span>
                <div className="flex items-center gap-3 bg-slate-950 border border-slate-800 rounded-xl p-1">
                  <button
                    onClick={() => setItemQuantity(Math.max(1, itemQuantity - 1))}
                    className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center transition"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-8 text-center font-bold text-sm text-white">{itemQuantity}</span>
                  <button
                    onClick={() => setItemQuantity(itemQuantity + 1)}
                    className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center transition"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <button
                onClick={handleConfirmAddToCart}
                className="w-full bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-orange-600/25 flex items-center justify-center gap-2 transition active:scale-95"
              >
                <Plus className="w-5 h-5" />
                <span>Thêm Vào Giỏ Hàng • {formatVND(selectedItem.price * itemQuantity)}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Order Success Modal */}
      {showOrderSuccessModal && lastOrder && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div>
              <h3 className="font-bold text-white text-lg">ĐẶT MÓN THÀNH CÔNG!</h3>
              <p className="text-xs text-slate-400 mt-1">Đơn hàng của bạn đã được chuyển thẳng tới Nhà Bếp</p>
            </div>

            {/* Order Summary Box */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 text-left space-y-2 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <span className="text-slate-400">Mã Đơn Hàng:</span>
                <span className="font-black text-amber-400 font-mono">{lastOrder.orderCode}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Hình Thức:</span>
                <span className="font-bold text-white">
                  {lastOrder.orderType === 'DINE_IN'
                    ? `Ăn Tại Bàn ${lastOrder.tableNumber ? `(Bàn ${lastOrder.tableNumber})` : ''}`
                    : lastOrder.orderType === 'DELIVERY'
                    ? 'Giao Tận Nơi'
                    : 'Đến Lấy'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Trạng Thái:</span>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-bold">
                  ⏳ ĐÃ GỬI NHÀ BẾP ({lastOrder.status})
                </span>
              </div>

              {/* Items List */}
              <div className="pt-2 space-y-1.5 border-t border-slate-800">
                <p className="font-bold text-slate-300">Danh sách món ăn:</p>
                {lastOrder.items &&
                  lastOrder.items.map((item) => (
                    <div key={item.id} className="flex justify-between text-slate-300 text-[11px]">
                      <span>
                        {item.quantity}x {item.menuItemName}
                      </span>
                      <span className="font-bold text-orange-400">{formatVND(item.subtotal)}</span>
                    </div>
                  ))}
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-800 font-bold text-sm">
                <span className="text-slate-200">Tổng Tiền:</span>
                <span className="text-orange-400 font-black text-base">{formatVND(lastOrder.totalAmount)}</span>
              </div>
            </div>

            <button
              onClick={() => setShowOrderSuccessModal(false)}
              className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition"
            >
              Tiếp Tục Xem Menu / Đặt Thêm Món
            </button>
          </div>
        </div>
      )}

      {/* Real-Time Tracking & Payment Modal */}
      {showTrackingModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
              <div>
                <h3 className="font-bold text-white text-base flex items-center gap-2">
                  <Clock className="w-5 h-5 text-amber-400" />
                  Theo Dõi Đơn Hàng Tại Bàn
                </h3>
                <p className="text-[11px] text-slate-400 mt-0.5">Tự động cập nhật mỗi 8 giây</p>
              </div>
              <button
                onClick={() => setShowTrackingModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto space-y-3 flex-1 pr-1">
              {tableOrders.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-8">Chưa có đơn hàng nào cho bàn này.</p>
              ) : (
                tableOrders.map((order) => {
                  const statusInfo =
                    ORDER_STATUS_LABEL[order.status] || {
                      text: order.status,
                      color: 'bg-slate-800 text-slate-400 border-slate-700',
                    };
                  return (
                    <div key={order.id} className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-2.5 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-amber-400">{order.orderCode}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusInfo.color}`}>
                          {statusInfo.text}
                        </span>
                      </div>
                      <div className="space-y-1">
                        {order.items &&
                          order.items.map((item) => (
                            <div key={item.id} className="flex justify-between text-slate-300">
                              <span>
                                {item.quantity}x {item.menuItemName}
                              </span>
                              <span className="text-slate-400">{formatVND(item.subtotal)}</span>
                            </div>
                          ))}
                      </div>
                      <div className="flex justify-between pt-2 border-t border-slate-800 font-bold">
                        <span className="text-slate-300">Tổng:</span>
                        <span className="text-orange-400 font-extrabold">{formatVND(order.totalAmount)}</span>
                      </div>

                      {order.status !== 'COMPLETED' && order.status !== 'PAID' && order.status !== 'CANCELLED' && (
                        <>
                          <button
                            onClick={() => handleShowPaymentQr(order.orderCode)}
                            disabled={loadingQrCode === order.orderCode}
                            className="w-full py-2 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-blue-300 text-xs font-bold flex items-center justify-center gap-1.5 transition"
                          >
                            {loadingQrCode === order.orderCode ? 'Đang tạo mã...' : '💳 Thanh Toán Online (VietQR Chuyển Khoản)'}
                          </button>

                          {qrByOrderCode[order.orderCode] && !qrByOrderCode[order.orderCode].__hidden && (
                            <div className="flex flex-col items-center gap-2 pt-2 bg-slate-900 p-3 rounded-xl border border-slate-800">
                              <img
                                src={qrByOrderCode[order.orderCode].qrImageUrl}
                                alt="VietQR"
                                className="w-44 h-44 rounded-xl bg-white p-2"
                              />
                              <p className="text-[11px] text-slate-400 text-center">
                                Quét mã QR bằng App Ngân Hàng bất kỳ để chuyển khoản
                              </p>
                              <p className="text-xs text-slate-300">
                                Nội dung CK: <span className="font-mono text-amber-400 font-bold">{qrByOrderCode[order.orderCode].transferContent}</span>
                              </p>
                              <p className="text-[10px] text-amber-500/90 text-center">
                                ⚠️ Nhân viên phục vụ sẽ xác nhận ngay sau khi ngân hàng nhận tiền.
                              </p>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default CustomerMenuPage;

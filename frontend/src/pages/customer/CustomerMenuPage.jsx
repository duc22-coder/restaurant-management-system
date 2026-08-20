import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import { useCart } from '../../context/CartContext';
import { Utensils, Search, ShoppingBag, Plus, Minus, X, Check, Info, ChevronRight, MessageSquare, Clock, CheckCircle2, Receipt } from 'lucide-react';

function CustomerMenuPage() {
  const [searchParams] = useSearchParams();
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
  const [loading, setLoading] = useState(true);

  // Selected item modal
  const [selectedItem, setSelectedItem] = useState(null);
  const [itemQuantity, setItemQuantity] = useState(1);
  const [itemNote, setItemNote] = useState('');

  // Cart drawer modal & Customer order note
  const [showCartDrawer, setShowCartDrawer] = useState(false);
  const [customerNote, setCustomerNote] = useState('');

  // Order status/success modal
  const [showOrderSuccessModal, setShowOrderSuccessModal] = useState(false);

  useEffect(() => {
    if (queryTableId) {
      setTableId(queryTableId);
    }
  }, [queryTableId, setTableId]);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchMenuItems();
  }, [selectedCategoryId, searchKeyword]);

  const fetchCategories = async () => {
    try {
      const data = await axiosClient.get('/customer/categories');
      setCategories(data);
    } catch (err) {
      console.error("Lỗi tải danh mục:", err);
    }
  };

  const fetchMenuItems = async () => {
    setLoading(true);
    try {
      const params = {};
      if (selectedCategoryId) params.categoryId = selectedCategoryId;
      if (searchKeyword) params.search = searchKeyword;

      const data = await axiosClient.get('/customer/menu', { params });
      setMenuItems(data);
    } catch (err) {
      console.error("Lỗi tải thực đơn:", err);
    } finally {
      setLoading(false);
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

  const handleCheckoutOrder = async () => {
    try {
      await submitOrder(customerNote);
      setShowCartDrawer(false);
      setCustomerNote('');
      setShowOrderSuccessModal(true);
    } catch (err) {
      alert("Đặt món thất bại: " + (err.response?.data?.message || err.message));
    }
  };

  const handleRequestPayment = async () => {
    if (!tableId) {
      alert("Không tìm thấy thông tin bàn!");
      return;
    }
    if (window.confirm(`Bạn muốn gửi yêu cầu thanh toán cho Bàn B${String(tableId).padStart(2, '0')}?`)) {
      try {
        await axiosClient.post(`/customer/payment/request?tableId=${tableId}`);
        alert(`Đã gửi yêu cầu thanh toán tới nhân viên phục vụ cho Bàn B${String(tableId).padStart(2, '0')}!`);
      } catch (err) {
        alert("Lỗi gửi yêu cầu thanh toán: " + (err.response?.data?.message || err.message));
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col pb-24 font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Mobile Top Header */}
      <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 py-3 shadow-md">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center shadow-lg shadow-orange-500/20">
              <Utensils className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-slate-100 text-base leading-tight">NHÀ HÀNG ABC</h1>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs text-amber-400 font-bold">
                  {tableId ? `Bàn B${String(tableId).padStart(2, '0')}` : 'Khách Hàng Quy Nhơn'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRequestPayment}
              className="px-2.5 py-1.5 rounded-xl bg-purple-600/20 hover:bg-purple-600 text-purple-300 hover:text-white border border-purple-500/30 text-xs font-bold flex items-center gap-1 transition shadow"
              title="Tính tiền"
            >
              <Receipt className="w-3.5 h-3.5 text-purple-400" />
              <span>Tính Tiền</span>
            </button>

            {lastOrder && (
              <button
                onClick={() => setShowOrderSuccessModal(true)}
                className="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold flex items-center gap-1 shadow"
              >
                <span>Đơn Đã Đặt</span>
              </button>
            )}
          </div>
        </div>
      </header>


      {/* Main Content Area */}
      <main className="max-w-md mx-auto w-full px-4 pt-4 space-y-4 flex-1">
        {/* Search Input Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            placeholder="🔍 Tìm món ăn ngon..."
            className="w-full bg-slate-900 border border-slate-800 focus:border-orange-500 rounded-2xl py-3 pl-10 pr-4 text-xs text-slate-200 outline-none transition shadow-inner placeholder-slate-500"
          />
          {searchKeyword && (
            <button
              onClick={() => setSearchKeyword('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 text-xs"
            >
              ✕
            </button>
          )}
        </div>

        {/* Category Horizontal Scroll Bar */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          <button
            onClick={() => setSelectedCategoryId(null)}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              selectedCategoryId === null
                ? 'bg-gradient-to-r from-orange-600 to-amber-500 text-white shadow-md shadow-orange-600/20'
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            Tất Cả Món
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategoryId(cat.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategoryId === cat.id
                  ? 'bg-gradient-to-r from-orange-600 to-amber-500 text-white shadow-md shadow-orange-600/20'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {cat.name} ({cat.totalItems})
            </button>
          ))}
        </div>

        {/* Menu Items Grid */}
        {loading ? (
          <div className="text-center py-12 text-slate-500 text-xs flex flex-col items-center gap-2">
            <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
            <span>Đang tải thực đơn thơm ngon...</span>
          </div>
        ) : menuItems.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-xs bg-slate-900/50 rounded-2xl border border-slate-800">
            Không tìm thấy món ăn nào phù hợp.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {menuItems.map((item) => (
              <div
                key={item.id}
                onClick={() => handleOpenDetailModal(item)}
                className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-3 flex gap-3 cursor-pointer transition active:scale-[0.99] group shadow-md"
              >
                <div className="relative w-24 h-24 rounded-xl overflow-hidden bg-slate-800 shrink-0">
                  <img
                    src={item.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400'}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                  {item.status === 'UNAVAILABLE' && (
                    <div className="absolute inset-0 bg-black/70 backdrop-blur-[2px] flex items-center justify-center text-[10px] font-bold text-red-400">
                      TẠM HẾT MÓN
                    </div>
                  )}
                </div>

                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-semibold text-amber-500 uppercase tracking-wider">
                        {item.categoryName}
                      </span>
                    </div>
                    <h3 className="font-bold text-slate-100 text-sm line-clamp-1 mt-0.5">{item.name}</h3>
                    <p className="text-[11px] text-slate-400 line-clamp-2 mt-1 leading-snug">{item.description}</p>
                  </div>

                  <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-800/60">
                    <span className="font-extrabold text-orange-400 text-sm">{formatVND(item.price)}</span>

                    {item.status === 'AVAILABLE' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          addToCart(item, 1);
                        }}
                        className="w-8 h-8 rounded-xl bg-orange-600/20 hover:bg-orange-600 text-orange-400 hover:text-white border border-orange-500/30 flex items-center justify-center transition active:scale-95 shadow"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Floating Bottom Cart Bar */}
      {totalItemsCount > 0 && (
        <div className="fixed bottom-4 left-0 right-0 z-40 px-4">
          <div className="max-w-md mx-auto bg-gradient-to-r from-slate-900 to-slate-950 border border-orange-500/30 rounded-2xl p-3 shadow-2xl backdrop-blur-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative p-2.5 rounded-xl bg-gradient-to-r from-orange-600 to-amber-500 text-white shadow-lg">
                <ShoppingBag className="w-5 h-5" />
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-black flex items-center justify-center shadow">
                  {totalItemsCount}
                </span>
              </div>

              <div>
                <p className="text-[10px] text-slate-400 font-medium">Tổng tiền giỏ hàng</p>
                <p className="text-sm font-black text-orange-400">{formatVND(totalAmount)}</p>
              </div>
            </div>

            <button
              onClick={() => setShowCartDrawer(true)}
              className="px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-orange-600/20 transition active:scale-95"
            >
              <span>Xem Giỏ Hàng</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Item Detail Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-3xl max-w-md w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="relative h-48 bg-slate-800 shrink-0">
              <img src={selectedItem.image} alt={selectedItem.name} className="w-full h-full object-cover" />
              <button
                onClick={() => setSelectedItem(null)}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 space-y-4 overflow-y-auto flex-1">
              <div>
                <span className="text-[10px] font-bold text-amber-500 uppercase">{selectedItem.categoryName}</span>
                <h3 className="text-lg font-bold text-white mt-0.5">{selectedItem.name}</h3>
                <p className="text-xs text-slate-400 mt-1">{selectedItem.description}</p>
                <p className="text-base font-black text-orange-400 mt-2">{formatVND(selectedItem.price)}</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1">
                  <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
                  <span>Ghi chú riêng cho món này:</span>
                </label>
                <input
                  type="text"
                  value={itemNote}
                  onChange={(e) => setItemNote(e.target.value)}
                  placeholder="Ví dụ: Ít đường, không cay, nhiều đá..."
                  className="w-full bg-slate-950 border border-slate-800 focus:border-orange-500 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-xs font-bold text-slate-300">Số lượng:</span>
                <div className="flex items-center gap-3 bg-slate-950 border border-slate-800 rounded-xl p-1">
                  <button
                    onClick={() => setItemQuantity(Math.max(1, itemQuantity - 1))}
                    className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-6 text-center font-bold text-sm text-white">{itemQuantity}</span>
                  <button
                    onClick={() => setItemQuantity(itemQuantity + 1)}
                    className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center justify-center"
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

      {/* Cart Drawer Modal */}
      {showCartDrawer && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-3xl max-w-md w-full max-h-[85vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-orange-500" />
                <h3 className="font-bold text-white text-base">Giỏ Hàng Của Bạn</h3>
              </div>
              <button
                onClick={() => setShowCartDrawer(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cart Items List */}
            <div className="p-4 overflow-y-auto space-y-3 flex-1">
              {cartItems.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-xs">
                  Giỏ hàng của bạn đang trống. Hãy chọn món ăn thơm ngon nhé!
                </div>
              ) : (
                <>
                  {cartItems.map(({ menuItem, quantity, note }) => (
                    <div key={menuItem.id} className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center gap-3">
                      <img src={menuItem.image} alt={menuItem.name} className="w-14 h-14 rounded-lg object-cover bg-slate-800" />
                      <div className="flex-1">
                        <h4 className="font-bold text-slate-200 text-xs">{menuItem.name}</h4>
                        <p className="text-orange-400 font-extrabold text-xs mt-0.5">{formatVND(menuItem.price)}</p>
                        {note && <p className="text-[10px] text-amber-400/80 mt-1 italic">📝 {note}</p>}
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(menuItem.id, quantity - 1)}
                          className="w-6 h-6 rounded bg-slate-800 text-slate-300 flex items-center justify-center text-xs"
                        >
                          -
                        </button>
                        <span className="font-bold text-xs text-white">{quantity}</span>
                        <button
                          onClick={() => updateQuantity(menuItem.id, quantity + 1)}
                          className="w-6 h-6 rounded bg-slate-800 text-slate-300 flex items-center justify-center text-xs"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  ))}

                  {/* Customer Order Note */}
                  <div className="pt-2">
                    <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1">
                      <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
                      <span>Ghi chú chung cho toàn đơn hàng:</span>
                    </label>
                    <textarea
                      rows="2"
                      value={customerNote}
                      onChange={(e) => setCustomerNote(e.target.value)}
                      placeholder="Ghi chú tổng thể (ví dụ: Mang đồ ăn cùng lúc, đũa dùng 1 lần)..."
                      className="w-full bg-slate-950 border border-slate-800 focus:border-orange-500 rounded-xl p-2.5 text-xs text-slate-200 outline-none"
                    />
                  </div>
                </>
              )}
            </div>

            {/* Drawer Footer */}
            {cartItems.length > 0 && (
              <div className="p-4 border-t border-slate-800 bg-slate-950 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-400 font-medium">Tổng tiền:</span>
                  <span className="font-black text-orange-400 text-lg">{formatVND(totalAmount)}</span>
                </div>

                <button
                  onClick={handleCheckoutOrder}
                  disabled={submittingOrder}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-orange-600/25 active:scale-95 transition"
                >
                  {submittingOrder ? (
                    <span>Đang Gửi Đơn Hàng...</span>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>XÁC NHẬN ĐẶT MÓN (BÀN B{String(tableId).padStart(2, '0')})</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Order Success / Status Modal */}
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
                <span className="text-slate-400">Vị Trí Bàn:</span>
                <span className="font-bold text-white">Bàn {lastOrder.tableNumber}</span>
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
                {lastOrder.items && lastOrder.items.map((item) => (
                  <div key={item.id} className="flex justify-between text-slate-300 text-[11px]">
                    <span>{item.quantity}x {item.menuItemName}</span>
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
              className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs"
            >
              Tiếp Tục Xem Menu / Đặt Thêm Món
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default CustomerMenuPage;

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import { ClipboardList, ArrowLeft, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';

const STATUS_TABS = [
  { v: '', l: 'Tất Cả' },
  { v: 'PENDING', l: 'Đã Nhận' },
  { v: 'PROCESSING', l: 'Đang Chế Biến' },
  { v: 'COMPLETED', l: 'Hoàn Tất' },
  { v: 'PAID', l: 'Đã Thanh Toán' },
  { v: 'CANCELLED', l: 'Đã Hủy' },
];

const STATUS_LABEL = {
  PENDING: { text: 'Đã Nhận', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  PROCESSING: { text: 'Đang Chế Biến', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  COMPLETED: { text: 'Hoàn Tất', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  PAID: { text: 'Đã Thanh Toán', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  CANCELLED: { text: 'Đã Hủy', color: 'bg-red-500/10 text-red-400 border-red-500/20' },
};

const formatVND = (value) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value || 0);

function AdminOrdersPage() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = statusFilter ? { status: statusFilter } : {};
      const data = await axiosClient.get('/admin/orders', { params });
      setOrders(data);
    } catch (err) {
      console.error('Lỗi tải danh sách đơn hàng:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    if (!window.confirm(`Xác nhận đổi trạng thái đơn hàng sang "${STATUS_LABEL[newStatus]?.text || newStatus}"?`)) return;
    try {
      await axiosClient.patch(`/admin/orders/${orderId}/status`, null, { params: { status: newStatus } });
      fetchOrders();
    } catch (err) {
      alert('Lỗi cập nhật trạng thái: ' + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/admin/dashboard')}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-white flex items-center gap-2">
                <ClipboardList className="w-6 h-6 text-orange-500" />
                Giám Sát Đơn Hàng
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">Toàn bộ lịch sử & đơn hàng đang chạy trên hệ thống</p>
            </div>
          </div>

          <button
            onClick={fetchOrders}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center gap-2 transition"
          >
            <RefreshCw className="w-4 h-4" />
            Làm Mới
          </button>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 flex-wrap">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.v}
              onClick={() => setStatusFilter(tab.v)}
              className={`px-4 py-2 rounded-xl text-xs font-bold border transition ${
                statusFilter === tab.v
                  ? 'bg-orange-600 border-orange-600 text-white'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.l}
            </button>
          ))}
        </div>

        {/* Order List */}
        {loading ? (
          <div className="p-12 text-center text-slate-500 text-xs bg-slate-900 border border-slate-800 rounded-2xl">Đang tải danh sách đơn hàng...</div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs bg-slate-900 border border-slate-800 rounded-2xl">Không có đơn hàng nào.</div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => {
              const statusInfo = STATUS_LABEL[order.status] || { text: order.status, color: 'bg-slate-800 text-slate-400 border-slate-700' };
              const isExpanded = expandedId === order.id;
              return (
                <div key={order.id} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : order.id)}
                    className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-800/40 transition"
                  >
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="font-mono font-bold text-amber-400 text-xs">{order.orderCode}</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {order.orderType === 'DINE_IN' && `Bàn ${order.tableNumber}`}
                          {order.orderType === 'PICKUP' && `Đến Lấy • ${order.contactPhone || '—'}`}
                          {order.orderType === 'DELIVERY' && `Giao: ${order.deliveryAddress || '—'} • ${order.contactPhone || '—'}`}
                          {' '}• {new Date(order.createdAt).toLocaleString('vi-VN')}
                          {order.customerId && <span className="ml-1.5 text-blue-400">• Khách có tài khoản</span>}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold border ${statusInfo.color}`}>
                        {statusInfo.text}
                      </span>
                      <span className="font-bold text-white text-sm">{formatVND(order.totalAmount)}</span>
                      {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="px-4 pb-4 border-t border-slate-800 pt-3 space-y-3 text-xs">
                      <div className="space-y-1.5">
                        {order.items && order.items.map((item) => (
                          <div key={item.id} className="flex justify-between text-slate-300">
                            <span>{item.quantity}x {item.menuItemName} {item.note && <span className="text-slate-500 italic">({item.note})</span>}</span>
                            <span className="text-slate-400">{formatVND(item.subtotal)}</span>
                          </div>
                        ))}
                      </div>

                      {order.customerNote && (
                        <p className="text-slate-500 italic">Ghi chú: {order.customerNote}</p>
                      )}

                      {/* Admin can intervene on order status when something goes wrong */}
                      <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-800">
                        <span className="text-[10px] text-slate-500 self-center mr-1">Can thiệp trạng thái:</span>
                        {['PENDING', 'PROCESSING', 'COMPLETED', 'CANCELLED'].map((s) => (
                          <button
                            key={s}
                            disabled={order.status === s}
                            onClick={() => handleUpdateStatus(order.id, s)}
                            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed text-slate-300 text-[10px] font-bold"
                          >
                            {STATUS_LABEL[s].text}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminOrdersPage;

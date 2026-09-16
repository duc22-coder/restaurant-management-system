import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axiosClient from '../../api/axiosClient';
import {
  ArrowLeft, User, Mail, Phone, MapPin, Save, LogOut,
  History, CheckCircle2, AlertCircle, Loader2,
} from 'lucide-react';

const ORDER_STATUS_LABEL = {
  PENDING: { text: 'Đã Nhận', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  PROCESSING: { text: 'Đang Chế Biến', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  COMPLETED: { text: 'Đã Lên Bàn / Hoàn Tất', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  PAID: { text: 'Đã Thanh Toán', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  CANCELLED: { text: 'Đã Hủy', color: 'bg-red-500/10 text-red-400 border-red-500/20' },
};

const formatVND = (value) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value || 0);

function CustomerAccountPage() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({ fullName: '', email: '', phone: '', address: '' });
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null); // { type: 'success' | 'error', text }

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [profileData, orderData] = await Promise.all([
        axiosClient.get('/customer/profile'),
        axiosClient.get('/customer/orders/my'),
      ]);
      setProfile(profileData);
      setForm({
        fullName: profileData.fullName || '',
        email: profileData.email || '',
        phone: profileData.phone || '',
        address: profileData.address || '',
      });
      setOrders(orderData);
    } catch (err) {
      console.error('Lỗi tải thông tin tài khoản:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const updated = await axiosClient.put('/customer/profile', form);
      setProfile(updated);
      setMessage({ type: 'success', text: 'Cập nhật hồ sơ thành công!' });
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Cập nhật thất bại, vui lòng thử lại!' });
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/menu');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 pb-16">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-slate-950/90 backdrop-blur border-b border-slate-800 px-4 py-3 flex items-center justify-between">
        <button onClick={() => navigate('/menu')} className="flex items-center gap-2 text-slate-300 hover:text-white text-sm">
          <ArrowLeft className="w-4 h-4" />
          Quay lại Menu
        </button>
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 text-xs font-bold text-red-400 hover:text-red-300 bg-red-500/10 border border-red-500/20 px-3 py-1.5 rounded-xl"
        >
          <LogOut className="w-3.5 h-3.5" />
          Đăng Xuất
        </button>
      </div>

      <div className="max-w-lg mx-auto p-4 space-y-6">
        {/* Profile card */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-white">{profile?.fullName}</h2>
              <p className="text-xs text-slate-500">@{profile?.username}</p>
            </div>
          </div>

          {message && (
            <div className={`mb-4 p-3 rounded-xl text-xs flex items-start gap-2 border ${
              message.type === 'success'
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                : 'bg-red-500/10 border-red-500/20 text-red-400'
            }`}>
              {message.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" /> : <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />}
              <span>{message.text}</span>
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Họ Và Tên</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={form.fullName}
                  onChange={handleChange('fullName')}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-orange-500 rounded-xl py-2.5 pl-9 pr-3 text-sm text-slate-200 outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Email</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={form.email}
                  onChange={handleChange('email')}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-orange-500 rounded-xl py-2.5 pl-9 pr-3 text-sm text-slate-200 outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Số Điện Thoại</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  value={form.phone}
                  onChange={handleChange('phone')}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-orange-500 rounded-xl py-2.5 pl-9 pr-3 text-sm text-slate-200 outline-none"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Địa Chỉ Giao Hàng</label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={form.address}
                  onChange={handleChange('address')}
                  placeholder="Chưa có địa chỉ đã lưu"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-orange-500 rounded-xl py-2.5 pl-9 pr-3 text-sm text-slate-200 placeholder-slate-600 outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full bg-gradient-to-r from-orange-600 to-amber-500 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span>Lưu Thay Đổi</span>
            </button>
          </form>
        </div>

        {/* Order history */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
          <h3 className="font-bold text-white flex items-center gap-2 mb-4">
            <History className="w-5 h-5 text-amber-400" />
            Lịch Sử Đơn Hàng
          </h3>

          {orders.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-6">Bạn chưa có đơn hàng nào.</p>
          ) : (
            <div className="space-y-3">
              {orders.map((order) => {
                const statusInfo = ORDER_STATUS_LABEL[order.status] || { text: order.status, color: 'bg-slate-800 text-slate-400 border-slate-700' };
                return (
                  <div key={order.id} className="bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-amber-400">{order.orderCode}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusInfo.color}`}>
                        {statusInfo.text}
                      </span>
                    </div>
                    <p className="text-slate-500">Bàn {order.tableNumber} • {new Date(order.createdAt).toLocaleString('vi-VN')}</p>
                    <div className="flex justify-between pt-2 border-t border-slate-800 font-bold">
                      <span className="text-slate-300">Tổng:</span>
                      <span className="text-orange-400">{formatVND(order.totalAmount)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CustomerAccountPage;

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import { Ticket, Plus, Edit2, Trash2, X, ArrowLeft } from 'lucide-react';

const emptyForm = {
  code: '', description: '', discountType: 'PERCENTAGE', discountValue: '',
  maxDiscountAmount: '', minOrderAmount: '', startDate: '', endDate: '', usageLimit: '', active: true,
};

const formatVND = (value) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value || 0);

function AdminVouchersPage() {
  const navigate = useNavigate();
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingVoucher, setEditingVoucher] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchVouchers();
  }, []);

  const fetchVouchers = async () => {
    setLoading(true);
    try {
      const data = await axiosClient.get('/admin/vouchers');
      setVouchers(data);
    } catch (err) {
      console.error('Lỗi tải danh sách voucher:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (voucher = null) => {
    if (voucher) {
      setEditingVoucher(voucher);
      setForm({
        code: voucher.code,
        description: voucher.description || '',
        discountType: voucher.discountType,
        discountValue: voucher.discountValue,
        maxDiscountAmount: voucher.maxDiscountAmount || '',
        minOrderAmount: voucher.minOrderAmount || '',
        startDate: voucher.startDate ? voucher.startDate.slice(0, 16) : '',
        endDate: voucher.endDate ? voucher.endDate.slice(0, 16) : '',
        usageLimit: voucher.usageLimit || '',
        active: voucher.active,
      });
    } else {
      setEditingVoucher(null);
      setForm(emptyForm);
    }
    setShowModal(true);
  };

  const handleChange = (field) => (e) => {
    const value = field === 'active' ? e.target.value === 'true' : e.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        discountValue: Number(form.discountValue),
        maxDiscountAmount: form.maxDiscountAmount ? Number(form.maxDiscountAmount) : null,
        minOrderAmount: form.minOrderAmount ? Number(form.minOrderAmount) : 0,
        usageLimit: form.usageLimit ? Number(form.usageLimit) : null,
        startDate: form.startDate || null,
        endDate: form.endDate || null,
      };
      if (editingVoucher) {
        await axiosClient.put(`/admin/vouchers/${editingVoucher.id}`, payload);
      } else {
        await axiosClient.post('/admin/vouchers', payload);
      }
      setShowModal(false);
      fetchVouchers();
    } catch (err) {
      alert('Lỗi lưu voucher: ' + (err.response?.data?.message || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, code) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa voucher "${code}"?`)) {
      try {
        await axiosClient.delete(`/admin/vouchers/${id}`);
        fetchVouchers();
      } catch (err) {
        alert('Lỗi xóa voucher: ' + (err.response?.data?.message || err.message));
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/admin/dashboard')} className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-white flex items-center gap-2">
                <Ticket className="w-6 h-6 text-orange-500" />
                Quản Lý Voucher
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">Mã giảm giá theo điều kiện: hạn dùng, đơn tối thiểu, số lượt dùng</p>
            </div>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-orange-600 to-amber-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-orange-500/20 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            Thêm Voucher
          </button>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-slate-500 text-xs">Đang tải...</div>
          ) : vouchers.length === 0 ? (
            <div className="p-12 text-center text-slate-500 text-xs">Chưa có voucher nào.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 uppercase font-semibold border-b border-slate-800">
                  <tr>
                    <th className="px-5 py-3">Mã</th>
                    <th className="px-5 py-3">Giảm Giá</th>
                    <th className="px-5 py-3">Điều Kiện</th>
                    <th className="px-5 py-3 text-center">Đã Dùng</th>
                    <th className="px-5 py-3 text-center">Trạng Thái</th>
                    <th className="px-5 py-3 text-right">Thao Tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {vouchers.map((v) => (
                    <tr key={v.id} className="hover:bg-slate-800/50">
                      <td className="px-5 py-3">
                        <p className="font-mono font-bold text-amber-400">{v.code}</p>
                        <p className="text-slate-500">{v.description}</p>
                      </td>
                      <td className="px-5 py-3 text-slate-300">
                        {v.discountType === 'PERCENTAGE' ? `${v.discountValue}%` : formatVND(v.discountValue)}
                        {v.maxDiscountAmount && <p className="text-slate-500">Tối đa {formatVND(v.maxDiscountAmount)}</p>}
                      </td>
                      <td className="px-5 py-3 text-slate-400">
                        {v.minOrderAmount > 0 && <p>Đơn tối thiểu {formatVND(v.minOrderAmount)}</p>}
                        {v.endDate && <p>HSD: {new Date(v.endDate).toLocaleDateString('vi-VN')}</p>}
                      </td>
                      <td className="px-5 py-3 text-center">{v.usedCount}{v.usageLimit ? `/${v.usageLimit}` : ''}</td>
                      <td className="px-5 py-3 text-center">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold border ${
                          v.active ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-slate-800 text-slate-500 border-slate-700'
                        }`}>
                          {v.active ? 'Hoạt Động' : 'Tắt'}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right space-x-2 whitespace-nowrap">
                        <button onClick={() => handleOpenModal(v)} className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-blue-400"><Edit2 className="w-4 h-4" /></button>
                        <button onClick={() => handleDelete(v.id, v.code)} className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-red-400"><Trash2 className="w-4 h-4" /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-white text-base">{editingVoucher ? 'Chỉnh Sửa Voucher' : 'Thêm Voucher Mới'}</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Mã Voucher *</label>
                <input type="text" required value={form.code} onChange={handleChange('code')} placeholder="VD: SALE20"
                  className="w-full bg-slate-950 border border-slate-800 focus:border-orange-500 rounded-xl px-3 py-2.5 text-slate-200 outline-none uppercase" />
              </div>
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Mô Tả</label>
                <input type="text" value={form.description} onChange={handleChange('description')}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-orange-500 rounded-xl px-3 py-2.5 text-slate-200 outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Loại Giảm Giá *</label>
                  <select value={form.discountType} onChange={handleChange('discountType')}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-orange-500 rounded-xl px-3 py-2.5 text-slate-200 outline-none">
                    <option value="PERCENTAGE">Theo % </option>
                    <option value="FIXED_AMOUNT">Số tiền cố định</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Giá Trị Giảm *</label>
                  <input type="number" required min="0.01" step="0.01" value={form.discountValue} onChange={handleChange('discountValue')}
                    placeholder={form.discountType === 'PERCENTAGE' ? '% (VD: 10)' : 'VND (VD: 20000)'}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-orange-500 rounded-xl px-3 py-2.5 text-slate-200 outline-none" />
                </div>
              </div>
              {form.discountType === 'PERCENTAGE' && (
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Giảm Tối Đa (VND, để trống = không giới hạn)</label>
                  <input type="number" min="0" value={form.maxDiscountAmount} onChange={handleChange('maxDiscountAmount')}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-orange-500 rounded-xl px-3 py-2.5 text-slate-200 outline-none" />
                </div>
              )}
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Đơn Tối Thiểu (VND)</label>
                <input type="number" min="0" value={form.minOrderAmount} onChange={handleChange('minOrderAmount')}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-orange-500 rounded-xl px-3 py-2.5 text-slate-200 outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Bắt Đầu</label>
                  <input type="datetime-local" value={form.startDate} onChange={handleChange('startDate')}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-orange-500 rounded-xl px-2 py-2.5 text-slate-200 outline-none" />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Hết Hạn</label>
                  <input type="datetime-local" value={form.endDate} onChange={handleChange('endDate')}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-orange-500 rounded-xl px-2 py-2.5 text-slate-200 outline-none" />
                </div>
              </div>
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Giới Hạn Lượt Dùng (để trống = không giới hạn)</label>
                <input type="number" min="1" value={form.usageLimit} onChange={handleChange('usageLimit')}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-orange-500 rounded-xl px-3 py-2.5 text-slate-200 outline-none" />
              </div>
              {editingVoucher && (
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Trạng Thái</label>
                  <select value={String(form.active)} onChange={handleChange('active')}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-orange-500 rounded-xl px-3 py-2.5 text-slate-200 outline-none">
                    <option value="true">Hoạt Động</option>
                    <option value="false">Tắt</option>
                  </select>
                </div>
              )}
              <div className="pt-3 flex gap-3">
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold">Hủy Bỏ</button>
                <button type="submit" disabled={submitting} className="flex-1 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold shadow-lg shadow-orange-600/25">
                  {submitting ? 'Đang Lưu...' : 'Lưu Voucher'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminVouchersPage;

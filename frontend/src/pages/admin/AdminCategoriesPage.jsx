import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import { Layers, Plus, Edit2, Trash2, X, Check, ArrowLeft, Image as ImageIcon } from 'lucide-react';

function AdminCategoriesPage() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form modal state
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [status, setStatus] = useState('ACTIVE');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const data = await axiosClient.get('/admin/categories');
      setCategories(data);
    } catch (err) {
      console.error("Lỗi tải danh mục:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (category = null) => {
    if (category) {
      setEditingCategory(category);
      setName(category.name);
      setDescription(category.description || '');
      setImage(category.image || '');
      setStatus(category.status);
    } else {
      setEditingCategory(null);
      setName('');
      setDescription('');
      setImage('');
      setStatus('ACTIVE');
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = { name, description, image, status };
      if (editingCategory) {
        await axiosClient.put(`/admin/categories/${editingCategory.id}`, payload);
      } else {
        await axiosClient.post('/admin/categories', payload);
      }
      setShowModal(false);
      fetchCategories();
    } catch (err) {
      alert("Lỗi lưu danh mục: " + (err.response?.data?.message || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, catName) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa danh mục "${catName}"?`)) {
      try {
        await axiosClient.delete(`/admin/categories/${id}`);
        fetchCategories();
      } catch (err) {
        alert("Lỗi xóa danh mục: " + (err.response?.data?.message || err.message));
      }
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
                <Layers className="w-6 h-6 text-orange-500" />
                Quản Lý Danh Mục Món Ăn
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">Thêm, sửa, xóa các danh mục món trong hệ thống</p>
            </div>
          </div>

          <button
            onClick={() => handleOpenModal()}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-orange-500/20 transition active:scale-95"
          >
            <Plus className="w-4 h-4" />
            Thêm Danh Mục Mới
          </button>
        </div>

        {/* Table List */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          {loading ? (
            <div className="p-12 text-center text-slate-500 text-xs">Đang tải danh mục...</div>
          ) : categories.length === 0 ? (
            <div className="p-12 text-center text-slate-500 text-xs">Chưa có danh mục nào. Hãy thêm danh mục mới!</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                  <tr>
                    <th className="px-6 py-4">Danh Mục</th>
                    <th className="px-6 py-4">Mô Tả</th>
                    <th className="px-6 py-4 text-center">Số Món</th>
                    <th className="px-6 py-4 text-center">Trạng Thái</th>
                    <th className="px-6 py-4 text-right">Thao Tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {categories.map((cat) => (
                    <tr key={cat.id} className="hover:bg-slate-800/50 transition">
                      <td className="px-6 py-4 font-bold text-white flex items-center gap-3">
                        <img
                          src={cat.image || 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=100'}
                          alt={cat.name}
                          className="w-10 h-10 rounded-xl object-cover bg-slate-800 shrink-0"
                        />
                        <span>{cat.name}</span>
                      </td>
                      <td className="px-6 py-4 max-w-xs truncate text-slate-400">{cat.description || '—'}</td>
                      <td className="px-6 py-4 text-center font-bold text-amber-400">{cat.totalItems} món</td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                          cat.status === 'ACTIVE'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-slate-800 text-slate-500 border border-slate-700'
                        }`}>
                          {cat.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <button
                          onClick={() => handleOpenModal(cat)}
                          className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-blue-400 transition"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(cat.id, cat.name)}
                          className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-red-400 transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal Form */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-white text-base">
                {editingCategory ? 'Chỉnh Sửa Danh Mục' : 'Thêm Danh Mục Mới'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Tên Danh Mục *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nhập tên danh mục (vd: Khai Vị)..."
                  className="w-full bg-slate-950 border border-slate-800 focus:border-orange-500 rounded-xl px-3.5 py-2.5 text-slate-200 outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Mô Tả</label>
                <textarea
                  rows="3"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Mô tả danh mục..."
                  className="w-full bg-slate-950 border border-slate-800 focus:border-orange-500 rounded-xl px-3.5 py-2.5 text-slate-200 outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">URL Hình Ảnh</label>
                <input
                  type="text"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full bg-slate-950 border border-slate-800 focus:border-orange-500 rounded-xl px-3.5 py-2.5 text-slate-200 outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Trạng Thái</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-orange-500 rounded-xl px-3 py-2.5 text-slate-200 outline-none"
                >
                  <option value="ACTIVE">ACTIVE (Đang hoạt động)</option>
                  <option value="INACTIVE">INACTIVE (Ẩn)</option>
                </select>
              </div>

              <div className="pt-3 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold shadow-lg shadow-orange-600/25"
                >
                  {submitting ? 'Đang Lưu...' : 'Lưu Danh Mục'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminCategoriesPage;

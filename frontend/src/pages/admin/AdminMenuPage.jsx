import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import { UtensilsCrossed, Plus, Edit2, Trash2, X, Check, ArrowLeft, Search, ToggleLeft, ToggleRight } from 'lucide-react';

function AdminMenuPage() {
  const navigate = useNavigate();
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterCategoryId, setFilterCategoryId] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');

  // Modal Form State
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState('');
  const [status, setStatus] = useState('AVAILABLE');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchCategories();
    fetchMenuItems();
  }, []);

  const fetchCategories = async () => {
    try {
      const data = await axiosClient.get('/admin/categories');
      setCategories(data);
    } catch (err) {
      console.error("Lỗi tải danh mục:", err);
    }
  };

  const fetchMenuItems = async () => {
    setLoading(true);
    try {
      const data = await axiosClient.get('/admin/menu');
      setMenuItems(data);
    } catch (err) {
      console.error("Lỗi tải thực đơn:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setName(item.name);
      setCategoryId(item.categoryId);
      setPrice(item.price);
      setDescription(item.description || '');
      setImage(item.image || '');
      setStatus(item.status);
    } else {
      setEditingItem(null);
      setName('');
      setCategoryId(categories.length > 0 ? categories[0].id : '');
      setPrice('');
      setDescription('');
      setImage('');
      setStatus('AVAILABLE');
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        name,
        categoryId: Number(categoryId),
        price: Number(price),
        description,
        image,
        status,
      };

      if (editingItem) {
        await axiosClient.put(`/admin/menu/${editingItem.id}`, payload);
      } else {
        await axiosClient.post('/admin/menu', payload);
      }
      setShowModal(false);
      fetchMenuItems();
    } catch (err) {
      alert("Lỗi lưu món ăn: " + (err.response?.data?.message || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      await axiosClient.patch(`/admin/menu/${id}/toggle-status`);
      fetchMenuItems();
    } catch (err) {
      alert("Lỗi đổi trạng thái món ăn: " + (err.response?.data?.message || err.message));
    }
  };

  const handleDelete = async (id, itemName) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa món ăn "${itemName}"?`)) {
      try {
        await axiosClient.delete(`/admin/menu/${id}`);
        fetchMenuItems();
      } catch (err) {
        alert("Lỗi xóa món ăn: " + (err.response?.data?.message || err.message));
      }
    }
  };

  const formatVND = (p) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p);

  const filteredItems = menuItems.filter((item) => {
    const matchCategory = filterCategoryId ? item.categoryId === Number(filterCategoryId) : true;
    const matchSearch = searchKeyword
      ? item.name.toLowerCase().includes(searchKeyword.toLowerCase()) ||
        (item.description && item.description.toLowerCase().includes(searchKeyword.toLowerCase()))
      : true;
    return matchCategory && matchSearch;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
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
                <UtensilsCrossed className="w-6 h-6 text-orange-500" />
                Quản Lý Thực Đơn (Menu Items)
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">Quản lý các món ăn, giá tiền, hình ảnh và bật/tắt bán</p>
            </div>
          </div>

          <button
            onClick={() => handleOpenModal()}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-orange-500/20 transition active:scale-95"
          >
            <Plus className="w-4 h-4" />
            Thêm Món Ăn Mới
          </button>
        </div>

        {/* Filter & Search Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative md:col-span-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              placeholder="🔍 Tìm kiếm tên món ăn..."
              className="w-full bg-slate-900 border border-slate-800 focus:border-orange-500 rounded-xl py-2.5 pl-10 pr-4 text-xs text-slate-200 outline-none"
            />
          </div>

          <div>
            <select
              value={filterCategoryId}
              onChange={(e) => setFilterCategoryId(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 focus:border-orange-500 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 outline-none"
            >
              <option value="">Tất cả danh mục ({categories.length})</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Table List */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          {loading ? (
            <div className="p-12 text-center text-slate-500 text-xs">Đang tải thực đơn...</div>
          ) : filteredItems.length === 0 ? (
            <div className="p-12 text-center text-slate-500 text-xs">Không tìm thấy món ăn nào.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                  <tr>
                    <th className="px-6 py-4">Món Ăn</th>
                    <th className="px-6 py-4">Danh Mục</th>
                    <th className="px-6 py-4">Giá Bán</th>
                    <th className="px-6 py-4 text-center">Trạng Thái Bán</th>
                    <th className="px-6 py-4 text-right">Thao Tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {filteredItems.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-800/50 transition">
                      <td className="px-6 py-4 font-bold text-white flex items-center gap-3">
                        <img
                          src={item.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100'}
                          alt={item.name}
                          className="w-12 h-12 rounded-xl object-cover bg-slate-800 shrink-0"
                        />
                        <div>
                          <p className="font-bold text-slate-100">{item.name}</p>
                          <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">{item.description}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-semibold text-slate-300">{item.categoryName}</td>
                      <td className="px-6 py-4 font-black text-orange-400">{formatVND(item.price)}</td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => handleToggleStatus(item.id)}
                          className={`px-3 py-1 rounded-full text-[10px] font-extrabold flex items-center gap-1 mx-auto transition ${
                            item.status === 'AVAILABLE'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20'
                              : 'bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20'
                          }`}
                        >
                          {item.status === 'AVAILABLE' ? <ToggleRight className="w-4 h-4 text-emerald-400" /> : <ToggleLeft className="w-4 h-4 text-red-400" />}
                          <span>{item.status === 'AVAILABLE' ? 'ĐANG BÁN' : 'HẾT HÀNG'}</span>
                        </button>
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <button
                          onClick={() => handleOpenModal(item)}
                          className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-blue-400 transition"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id, item.name)}
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
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-white text-base">
                {editingItem ? 'Chỉnh Sửa Món Ăn' : 'Thêm Món Ăn Mới'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Tên Món Ăn *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Tên món (vd: Phở Bò)..."
                    className="w-full bg-slate-950 border border-slate-800 focus:border-orange-500 rounded-xl px-3.5 py-2.5 text-slate-200 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Danh Mục *</label>
                  <select
                    required
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-orange-500 rounded-xl px-3.5 py-2.5 text-slate-200 outline-none"
                  >
                    <option value="">-- Chọn Danh Mục --</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Giá Bán (VNĐ) *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="1000"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="Ví dụ: 65000"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-orange-500 rounded-xl px-3.5 py-2.5 text-slate-200 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Trạng Thái</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-orange-500 rounded-xl px-3.5 py-2.5 text-slate-200 outline-none"
                  >
                    <option value="AVAILABLE">AVAILABLE (Đang bán)</option>
                    <option value="UNAVAILABLE">UNAVAILABLE (Tạm hết hàng)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Mô Tả Món Ăn</label>
                <textarea
                  rows="3"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Thành phần, hương vị đặc trưng..."
                  className="w-full bg-slate-950 border border-slate-800 focus:border-orange-500 rounded-xl px-3.5 py-2.5 text-slate-200 outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">URL Hình Ảnh Món Ăn</label>
                <input
                  type="text"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full bg-slate-950 border border-slate-800 focus:border-orange-500 rounded-xl px-3.5 py-2.5 text-slate-200 outline-none"
                />
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
                  {submitting ? 'Đang Lưu...' : 'Lưu Món Ăn'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminMenuPage;

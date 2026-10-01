import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import {
  Boxes,
  Plus,
  Edit2,
  Trash2,
  X,
  Check,
  ArrowLeft,
  Search,
  AlertTriangle,
  Package,
  TrendingDown,
  Layers,
  ArrowUpDown,
  RefreshCw
} from 'lucide-react';

function AdminInventoryPage() {
  const navigate = useNavigate();
  const [details, setDetails] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterMode, setFilterMode] = useState('ALL'); // 'ALL' | 'LOW' | 'OUT'

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [menuItemId, setMenuItemId] = useState('');
  const [sku, setSku] = useState('');
  const [variantName, setVariantName] = useState('');
  const [unit, setUnit] = useState('');
  const [stockQuantity, setStockQuantity] = useState(0);
  const [minStockAlert, setMinStockAlert] = useState(5);
  const [costPrice, setCostPrice] = useState(0);
  const [sellingPrice, setSellingPrice] = useState(0);
  const [status, setStatus] = useState('ACTIVE');
  const [submitting, setSubmitting] = useState(false);

  // Quick adjust stock modal
  const [quickStockItem, setQuickStockItem] = useState(null);
  const [stockDelta, setStockDelta] = useState(0);

  useEffect(() => {
    fetchInventory();
    fetchMenuItems();
  }, []);

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const data = await axiosClient.get('/admin/inventory');
      setDetails(data);
    } catch (err) {
      console.error("Lỗi tải danh sách SPCT kho:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMenuItems = async () => {
    try {
      const data = await axiosClient.get('/admin/menu');
      setMenuItems(data);
    } catch (err) {
      console.error("Lỗi tải danh mục món:", err);
    }
  };

  const handleOpenModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setMenuItemId(item.menuItemId || '');
      setSku(item.sku || '');
      setVariantName(item.variantName || '');
      setUnit(item.unit || '');
      setStockQuantity(item.stockQuantity || 0);
      setMinStockAlert(item.minStockAlert || 5);
      setCostPrice(item.costPrice || 0);
      setSellingPrice(item.sellingPrice || 0);
      setStatus(item.status || 'ACTIVE');
    } else {
      setEditingItem(null);
      setMenuItemId(menuItems[0]?.id || '');
      setSku('SPCT-' + Math.floor(1000 + Math.random() * 9000));
      setVariantName('Tiêu chuẩn');
      setUnit('Kg');
      setStockQuantity(10);
      setMinStockAlert(5);
      setCostPrice(0);
      setSellingPrice(0);
      setStatus('ACTIVE');
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        menuItemId: Number(menuItemId),
        sku,
        variantName,
        unit,
        stockQuantity: Number(stockQuantity),
        minStockAlert: Number(minStockAlert),
        costPrice: Number(costPrice),
        sellingPrice: Number(sellingPrice),
        status
      };

      if (editingItem) {
        await axiosClient.put(`/admin/inventory/${editingItem.id}`, payload);
      } else {
        await axiosClient.post('/admin/inventory', payload);
      }

      setShowModal(false);
      fetchInventory();
    } catch (err) {
      alert("Lỗi lưu SPCT: " + (err.response?.data?.message || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa mặt hàng SPCT này khỏi kho?")) return;
    try {
      await axiosClient.delete(`/admin/inventory/${id}`);
      fetchInventory();
    } catch (err) {
      alert("Lỗi khi xóa SPCT: " + (err.response?.data?.message || err.message));
    }
  };

  const handleQuickStockUpdate = async () => {
    if (!quickStockItem || stockDelta === 0) return;
    try {
      await axiosClient.patch(`/admin/inventory/${quickStockItem.id}/stock`, {
        change: Number(stockDelta)
      });
      setQuickStockItem(null);
      setStockDelta(0);
      fetchInventory();
    } catch (err) {
      alert("Lỗi cập nhật tồn kho: " + (err.response?.data?.message || err.message));
    }
  };

  const formatVND = (price) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price || 0);

  // Lọc dữ liệu
  const filteredDetails = details.filter(item => {
    const matchesSearch =
      item.sku?.toLowerCase().includes(search.toLowerCase()) ||
      item.variantName?.toLowerCase().includes(search.toLowerCase()) ||
      item.menuItemName?.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;

    if (filterMode === 'LOW') {
      return item.isLowStock && item.stockQuantity > 0;
    }
    if (filterMode === 'OUT') {
      return item.stockQuantity <= 0;
    }
    return true;
  });

  const totalItems = details.length;
  const lowStockCount = details.filter(d => d.isLowStock && d.stockQuantity > 0).length;
  const outOfStockCount = details.filter(d => d.stockQuantity <= 0).length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Top Header */}
      <header className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 sticky top-0 z-30 shadow-lg">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/admin/dashboard')}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
            title="Quay lại Dashboard"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-500 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <Boxes className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-slate-100 text-lg flex items-center gap-2">
              Quản Lý Kho & SPCT
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                Sản Phẩm Chi Tiết
              </span>
            </h1>
            <p className="text-xs text-slate-400">
              Quản lý quy cách chi tiết, đơn vị tính, số lượng tồn kho và định mức cảnh báo
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={fetchInventory}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
            title="Tải lại"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={() => handleOpenModal()}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-cyan-500/20 transition active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Thêm SPCT Mới</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* KPI Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div
            onClick={() => setFilterMode('ALL')}
            className={`cursor-pointer rounded-2xl p-4 border transition ${
              filterMode === 'ALL'
                ? 'bg-slate-900 border-cyan-500/50 shadow-lg shadow-cyan-500/10'
                : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400">Tổng Mặt Hàng SPCT</span>
              <Package className="w-4 h-4 text-cyan-400" />
            </div>
            <p className="text-2xl font-black text-white mt-2">{totalItems}</p>
            <p className="text-xs text-slate-500 mt-1">Bao gồm món ăn và nguyên vật liệu</p>
          </div>

          <div
            onClick={() => setFilterMode('LOW')}
            className={`cursor-pointer rounded-2xl p-4 border transition ${
              filterMode === 'LOW'
                ? 'bg-amber-950/40 border-amber-500/60 shadow-lg shadow-amber-500/10'
                : 'bg-slate-900/60 border-slate-800 hover:border-amber-500/40'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-amber-400">Cảnh Báo Sắp Hết Hàng</span>
              <AlertTriangle className="w-4 h-4 text-amber-400" />
            </div>
            <p className="text-2xl font-black text-amber-300 mt-2">{lowStockCount}</p>
            <p className="text-xs text-amber-400/70 mt-1">Tồn kho nhỏ hơn mức tối thiểu</p>
          </div>

          <div
            onClick={() => setFilterMode('OUT')}
            className={`cursor-pointer rounded-2xl p-4 border transition ${
              filterMode === 'OUT'
                ? 'bg-red-950/40 border-red-500/60 shadow-lg shadow-red-500/10'
                : 'bg-slate-900/60 border-slate-800 hover:border-red-500/40'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-red-400">Đã Hết Hàng (Tồn = 0)</span>
              <TrendingDown className="w-4 h-4 text-red-400" />
            </div>
            <p className="text-2xl font-black text-red-400 mt-2">{outOfStockCount}</p>
            <p className="text-xs text-red-400/70 mt-1">Cần lập phiếu nhập kho gấp</p>
          </div>
        </div>

        {/* Toolbar & Filters */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm theo SKU, tên sản phẩm, biến thể..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilterMode('ALL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                filterMode === 'ALL' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              Tất cả ({totalItems})
            </button>
            <button
              onClick={() => setFilterMode('LOW')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                filterMode === 'LOW' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              Sắp hết ({lowStockCount})
            </button>
            <button
              onClick={() => setFilterMode('OUT')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                filterMode === 'OUT' ? 'bg-red-500/20 text-red-300 border border-red-500/40' : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              Hết hàng ({outOfStockCount})
            </button>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/70 border-b border-slate-800 text-slate-400 uppercase font-semibold">
                <tr>
                  <th className="py-3.5 px-4">Mã SKU</th>
                  <th className="py-3.5 px-4">Mặt Hàng (SP)</th>
                  <th className="py-3.5 px-4">Quy Cách (SPCT)</th>
                  <th className="py-3.5 px-4 text-center">Đơn Vị</th>
                  <th className="py-3.5 px-4 text-right">Tồn Kho</th>
                  <th className="py-3.5 px-4 text-right">Định Mức Tối Thiểu</th>
                  <th className="py-3.5 px-4 text-right">Giá Vốn</th>
                  <th className="py-3.5 px-4 text-center">Trạng Thái</th>
                  <th className="py-3.5 px-4 text-center">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {loading ? (
                  <tr>
                    <td colSpan="9" className="py-12 text-center text-slate-500">
                      Đang tải danh sách kho...
                    </td>
                  </tr>
                ) : filteredDetails.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="py-12 text-center text-slate-500">
                      Không tìm thấy mặt hàng SPCT nào phù hợp.
                    </td>
                  </tr>
                ) : (
                  filteredDetails.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-3.5 px-4 font-mono font-bold text-cyan-400">
                        {item.sku}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-100">
                        {item.menuItemName}
                      </td>
                      <td className="py-3.5 px-4 text-slate-300">
                        <span className="px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700 text-slate-200">
                          {item.variantName}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center text-slate-400">
                        {item.unit}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-extrabold text-sm">
                        <span
                          className={`px-2 py-0.5 rounded-lg ${
                            item.stockQuantity <= 0
                              ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                              : item.isLowStock
                              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                              : 'bg-emerald-500/10 text-emerald-400'
                          }`}
                        >
                          {item.stockQuantity} {item.unit}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono text-slate-400">
                        {item.minStockAlert} {item.unit}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono text-slate-300">
                        {formatVND(item.costPrice)}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            item.status === 'ACTIVE'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-red-500/10 text-red-400 border border-red-500/20'
                          }`}
                        >
                          {item.status === 'ACTIVE' ? 'Sẵn sàng' : 'Hết hàng'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => {
                              setQuickStockItem(item);
                              setStockDelta(0);
                            }}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-cyan-500/20 text-slate-400 hover:text-cyan-400 transition"
                            title="Điều chỉnh tồn kho nhanh"
                          >
                            <ArrowUpDown className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleOpenModal(item)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-amber-400 transition"
                            title="Chỉnh sửa SPCT"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition"
                            title="Xóa SPCT"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Modal Thêm / Sửa SPCT */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-base text-slate-100 flex items-center gap-2">
                <Boxes className="w-5 h-5 text-cyan-400" />
                {editingItem ? 'Chỉnh Sửa Sản Phẩm Chi Tiết (SPCT)' : 'Thêm Mới Sản Phẩm Chi Tiết (SPCT)'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Mặt Hàng Gốc (SP) *</label>
                  <select
                    value={menuItemId}
                    onChange={(e) => setMenuItemId(e.target.value)}
                    required
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-cyan-500"
                  >
                    {menuItems.map(m => (
                      <option key={m.id} value={m.id}>
                        {m.name} ({formatVND(m.price)})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Mã SKU / Barcode *</label>
                  <input
                    type="text"
                    required
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    placeholder="Ví dụ: SPCT-BEEF-KG"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-mono focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Tên Quy Cách / Biến Thể *</label>
                  <input
                    type="text"
                    required
                    value={variantName}
                    onChange={(e) => setVariantName(e.target.value)}
                    placeholder="Ví dụ: Tiêu chuẩn, Size L, Hộp 800g"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Đơn Vị Tính (Unit) *</label>
                  <input
                    type="text"
                    required
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    placeholder="Kg, Gram, Bát, Đĩa, Lon, Hộp..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Số Lượng Tồn Kho</label>
                  <input
                    type="number"
                    step="any"
                    value={stockQuantity}
                    onChange={(e) => setStockQuantity(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-mono focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Định Mức Cảnh Báo Tồn Tối Thiểu</label>
                  <input
                    type="number"
                    step="any"
                    value={minStockAlert}
                    onChange={(e) => setMinStockAlert(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-mono focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Giá Vốn / Giá Nhập (VNĐ)</label>
                  <input
                    type="number"
                    value={costPrice}
                    onChange={(e) => setCostPrice(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-mono focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Giá Bán Lẻ (VNĐ)</label>
                  <input
                    type="number"
                    value={sellingPrice}
                    onChange={(e) => setSellingPrice(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-mono focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Trạng Thái Hoạt Động</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-cyan-500"
                >
                  <option value="ACTIVE">Sẵn Sàng (ACTIVE)</option>
                  <option value="OUT_OF_STOCK">Hết Hàng (OUT_OF_STOCK)</option>
                  <option value="INACTIVE">Tạm Ngưng (INACTIVE)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold transition"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold transition shadow-lg shadow-cyan-500/20"
                >
                  {submitting ? 'Đang lưu...' : (editingItem ? 'Cập Nhật' : 'Thêm Mới')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Quick Adjust Stock */}
      {quickStockItem && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4 text-xs">
            <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
              <ArrowUpDown className="w-4 h-4 text-cyan-400" />
              Điều Chỉnh Tồn Kho Nhanh
            </h3>
            <p className="text-slate-400">
              Mặt hàng: <span className="font-bold text-white">{quickStockItem.menuItemName}</span> ({quickStockItem.variantName})
            </p>
            <p className="text-slate-400">
              Tồn kho hiện tại: <span className="font-bold font-mono text-cyan-300">{quickStockItem.stockQuantity} {quickStockItem.unit}</span>
            </p>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">
                Số lượng thay đổi (+ thêm, - bớt)
              </label>
              <input
                type="number"
                step="any"
                value={stockDelta}
                onChange={(e) => setStockDelta(e.target.value)}
                placeholder="Ví dụ: +10 hoặc -5"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-mono text-sm focus:outline-none focus:border-cyan-500"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Tồn kho sau điều chỉnh:{' '}
                <span className="font-bold text-white font-mono">
                  {Math.max(0, (quickStockItem.stockQuantity || 0) + Number(stockDelta || 0))} {quickStockItem.unit}
                </span>
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setQuickStockItem(null)}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleQuickStockUpdate}
                className="px-4 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-white font-bold"
              >
                Xác Nhận
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminInventoryPage;

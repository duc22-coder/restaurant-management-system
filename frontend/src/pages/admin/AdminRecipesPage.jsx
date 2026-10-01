import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import {
  UtensilsCrossed,
  Plus,
  Trash2,
  Edit2,
  ArrowLeft,
  Search,
  BookOpen,
  Boxes,
  CheckCircle2,
  AlertCircle,
  X,
  RefreshCw,
  Scale
} from 'lucide-react';

function AdminRecipesPage() {
  const navigate = useNavigate();
  const [menuItems, setMenuItems] = useState([]);
  const [inventoryDetails, setInventoryDetails] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [recipes, setRecipes] = useState([]);
  const [loadingItems, setLoadingItems] = useState(true);
  const [loadingRecipes, setLoadingRecipes] = useState(false);
  const [search, setSearch] = useState('');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState(null);
  const [ingredientDetailId, setIngredientDetailId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [unit, setUnit] = useState('Kg');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoadingItems(true);
    try {
      const [itemsData, invData] = await Promise.all([
        axiosClient.get('/admin/menu'),
        axiosClient.get('/admin/inventory')
      ]);
      setMenuItems(itemsData);
      setInventoryDetails(invData);
      if (itemsData.length > 0) {
        setSelectedProduct(itemsData[0]);
        fetchRecipesForProduct(itemsData[0].id);
      }
    } catch (err) {
      console.error("Lỗi tải dữ liệu món và kho:", err);
    } finally {
      setLoadingItems(false);
    }
  };

  const fetchRecipesForProduct = async (productId) => {
    setLoadingRecipes(true);
    try {
      const data = await axiosClient.get(`/admin/recipes/by-product/${productId}`);
      setRecipes(data);
    } catch (err) {
      console.error("Lỗi tải định lượng món:", err);
    } finally {
      setLoadingRecipes(false);
    }
  };

  const handleSelectProduct = (product) => {
    setSelectedProduct(product);
    fetchRecipesForProduct(product.id);
  };

  const handleOpenModal = (recipe = null) => {
    if (recipe) {
      setEditingRecipe(recipe);
      setIngredientDetailId(recipe.ingredientDetailId || '');
      setQuantity(recipe.quantity || 1);
      setUnit(recipe.unit || 'Kg');
      setNote(recipe.note || '');
    } else {
      setEditingRecipe(null);
      const defaultInv = inventoryDetails[0];
      setIngredientDetailId(defaultInv?.id || '');
      setQuantity(0.1);
      setUnit(defaultInv?.unit || 'Kg');
      setNote('');
    }
    setShowModal(true);
  };

  const handleIngredientChange = (detailId) => {
    setIngredientDetailId(detailId);
    const selected = inventoryDetails.find(d => d.id === Number(detailId));
    if (selected && selected.unit) {
      setUnit(selected.unit);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedProduct || !ingredientDetailId) return;

    setSubmitting(true);
    try {
      const payload = {
        productId: selectedProduct.id,
        ingredientDetailId: Number(ingredientDetailId),
        quantity: Number(quantity),
        unit,
        note
      };

      if (editingRecipe) {
        await axiosClient.put(`/admin/recipes/${editingRecipe.id}`, payload);
      } else {
        await axiosClient.post('/admin/recipes', payload);
      }

      setShowModal(false);
      fetchRecipesForProduct(selectedProduct.id);
    } catch (err) {
      alert("Lỗi lưu định lượng TPSP: " + (err.response?.data?.message || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa thành phần nguyên liệu này khỏi công thức?")) return;
    try {
      await axiosClient.delete(`/admin/recipes/${id}`);
      fetchRecipesForProduct(selectedProduct.id);
    } catch (err) {
      alert("Lỗi xóa định lượng: " + (err.response?.data?.message || err.message));
    }
  };

  const filteredMenuItems = menuItems.filter(item =>
    item.name?.toLowerCase().includes(search.toLowerCase()) ||
    item.categoryName?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Header */}
      <header className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 sticky top-0 z-30 shadow-lg">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/admin/dashboard')}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
            title="Quay lại Dashboard"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
            <Scale className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-slate-100 text-lg flex items-center gap-2">
              Định Lượng & Công Thức Món
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                TPSP (Thành Phần Sản Phẩm)
              </span>
            </h1>
            <p className="text-xs text-slate-400">
              Cấu hình nguyên liệu cần tiêu hao khi chế biến món ăn và trừ kho tự động khi bán
            </p>
          </div>
        </div>

        <button
          onClick={() => selectedProduct && fetchRecipesForProduct(selectedProduct.id)}
          className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
          title="Tải lại"
        >
          <RefreshCw className={`w-4 h-4 ${loadingRecipes ? 'animate-spin' : ''}`} />
        </button>
      </header>

      {/* Main Content (2-Column Master-Detail Layout) */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left Column: Menu Items List */}
        <div className="md:col-span-4 bg-slate-900 border border-slate-800 rounded-3xl p-4 flex flex-col space-y-4 h-[calc(100vh-140px)]">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h2 className="font-bold text-sm text-slate-200 flex items-center gap-2">
              <UtensilsCrossed className="w-4 h-4 text-purple-400" />
              Chọn Món Ăn (SP)
            </h2>
            <span className="text-xs text-slate-500 font-mono">
              {filteredMenuItems.length} món
            </span>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm món ăn..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-purple-500"
            />
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {loadingItems ? (
              <p className="text-xs text-slate-500 text-center py-8">Đang tải danh sách món...</p>
            ) : filteredMenuItems.map((item) => {
              const isSelected = selectedProduct?.id === item.id;
              return (
                <div
                  key={item.id}
                  onClick={() => handleSelectProduct(item)}
                  className={`p-3 rounded-2xl cursor-pointer border transition flex items-center gap-3 ${
                    isSelected
                      ? 'bg-purple-950/40 border-purple-500/60 shadow-lg shadow-purple-500/10'
                      : 'bg-slate-950/40 border-slate-800/80 hover:bg-slate-800/50 hover:border-slate-700'
                  }`}
                >
                  <img
                    src={item.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=100'}
                    alt={item.name}
                    className="w-11 h-11 rounded-xl object-cover border border-slate-800"
                  />
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-bold truncate ${isSelected ? 'text-purple-300' : 'text-slate-200'}`}>
                      {item.name}
                    </p>
                    <p className="text-[11px] text-slate-500 truncate mt-0.5">
                      {item.categoryName} • {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Recipe Details (TPSP) */}
        <div className="md:col-span-8 bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col space-y-6">
          {selectedProduct ? (
            <>
              {/* Product Header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                <div className="flex items-center gap-4">
                  <img
                    src={selectedProduct.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200'}
                    alt={selectedProduct.name}
                    className="w-14 h-14 rounded-2xl object-cover border border-slate-700 shadow-md"
                  />
                  <div>
                    <h3 className="font-extrabold text-base text-slate-100 flex items-center gap-2">
                      {selectedProduct.name}
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-semibold border border-purple-500/30">
                        {recipes.length} thành phần
                      </span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Danh mục: {selectedProduct.categoryName} • Giá bán: {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(selectedProduct.price)}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handleOpenModal()}
                  className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-400 hover:to-pink-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-purple-500/20 transition active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  <span>Thêm Thành Phần Định Lượng</span>
                </button>
              </div>

              {/* Recipe Ingredients Table */}
              <div className="flex-1 space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-400 font-semibold">
                  <span>CÔNG THỨC TIÊU HAO CHO 1 SUẤT MÓN ĂN:</span>
                  <span className="text-slate-500">Tự động trừ kho khi đơn chuyển sang chế biến/hoàn thành</span>
                </div>

                <div className="border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-950 text-slate-400 uppercase font-semibold">
                      <tr>
                        <th className="py-3 px-4">Mã SKU</th>
                        <th className="py-3 px-4">Nguyên Liệu / Kho (SPCT)</th>
                        <th className="py-3 px-4 text-right">Định Lượng (TPSP)</th>
                        <th className="py-3 px-4 text-center">Đơn Vị</th>
                        <th className="py-3 px-4 text-right">Tồn Kho Hiện Tại</th>
                        <th className="py-3 px-4">Ghi Chú Chế Biến</th>
                        <th className="py-3 px-4 text-center">Thao Tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 text-slate-300">
                      {loadingRecipes ? (
                        <tr>
                          <td colSpan="7" className="py-12 text-center text-slate-500">
                            Đang tải công thức định lượng...
                          </td>
                        </tr>
                      ) : recipes.length === 0 ? (
                        <tr>
                          <td colSpan="7" className="py-12 text-center text-slate-500">
                            Món này chưa được thiết lập công thức định lượng (TPSP).
                            <br />
                            <button
                              onClick={() => handleOpenModal()}
                              className="mt-2 text-purple-400 font-bold hover:underline inline-flex items-center gap-1"
                            >
                              <Plus className="w-3.5 h-3.5" /> Thêm nguyên liệu ngay
                            </button>
                          </td>
                        </tr>
                      ) : (
                        recipes.map((rc) => {
                          const isLow = rc.currentStock < rc.quantity * 5;
                          return (
                            <tr key={rc.id} className="hover:bg-slate-800/40 transition">
                              <td className="py-3 px-4 font-mono font-bold text-cyan-400">
                                {rc.ingredientSku}
                              </td>
                              <td className="py-3 px-4 font-bold text-slate-100">
                                {rc.ingredientName}
                              </td>
                              <td className="py-3 px-4 text-right font-mono font-extrabold text-sm text-purple-400">
                                {rc.quantity}
                              </td>
                              <td className="py-3 px-4 text-center font-semibold text-slate-300">
                                {rc.unit}
                              </td>
                              <td className="py-3 px-4 text-right font-mono font-bold">
                                <span className={isLow ? 'text-amber-400' : 'text-emerald-400'}>
                                  {rc.currentStock} {rc.unit}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-slate-400 max-w-xs truncate">
                                {rc.note || '—'}
                              </td>
                              <td className="py-3 px-4 text-center">
                                <div className="flex items-center justify-center gap-2">
                                  <button
                                    onClick={() => handleOpenModal(rc)}
                                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-amber-400 transition"
                                    title="Sửa định lượng"
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handleDelete(rc.id)}
                                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition"
                                    title="Xóa nguyên liệu"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : (
            <div className="py-20 text-center text-slate-500">
              Vui lòng chọn một món ăn từ danh sách bên trái để cấu hình định lượng.
            </div>
          )}
        </div>
      </main>

      {/* Modal Thêm / Sửa TPSP */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-sm text-slate-100 flex items-center gap-2">
                <Scale className="w-4 h-4 text-purple-400" />
                {editingRecipe ? 'Sửa Định Lượng Món (TPSP)' : 'Thêm Nguyên Liệu Vào Món (TPSP)'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Món Ăn Chính (SP)</label>
                <input
                  type="text"
                  disabled
                  value={selectedProduct?.name || ''}
                  className="w-full bg-slate-950/60 border border-slate-800 rounded-xl px-3 py-2 text-slate-400 font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Nguyên Liệu Kho (SPCT) *</label>
                <select
                  value={ingredientDetailId}
                  onChange={(e) => handleIngredientChange(e.target.value)}
                  required
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-purple-500"
                >
                  {inventoryDetails.map(d => (
                    <option key={d.id} value={d.id}>
                      [{d.sku}] {d.menuItemName} - {d.variantName} (Còn: {d.stockQuantity} {d.unit})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Số Lượng Tiêu Hao *</label>
                  <input
                    type="number"
                    step="any"
                    min="0.001"
                    required
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    placeholder="0.1, 0.2, 1..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-mono text-sm focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Đơn Vị Tính *</label>
                  <input
                    type="text"
                    required
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    placeholder="Kg, Gram, Hộp, Lon..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Ghi Chú Chế Biến / Lưu Ý</label>
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Ví dụ: Cắt hạt lựu, luộc sơ, 2 lát đào..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-400 hover:to-pink-500 text-white font-bold shadow-lg shadow-purple-500/20"
                >
                  {submitting ? 'Đang lưu...' : (editingRecipe ? 'Cập Nhật' : 'Lưu Định Lượng')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminRecipesPage;

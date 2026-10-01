import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import {
  Truck,
  Plus,
  Eye,
  CheckCircle,
  XCircle,
  ArrowLeft,
  Search,
  Calendar,
  DollarSign,
  User,
  Building,
  RefreshCw,
  Trash2,
  PackagePlus,
  X,
  FileText
} from 'lucide-react';

function AdminPurchasesPage() {
  const navigate = useNavigate();
  const [purchases, setPurchases] = useState([]);
  const [inventoryItems, setInventoryItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // View Details Modal
  const [selectedPurchase, setSelectedPurchase] = useState(null);

  // Create Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [supplierName, setSupplierName] = useState('');
  const [supplierPhone, setSupplierPhone] = useState('');
  const [supplierAddress, setSupplierAddress] = useState('');
  const [note, setNote] = useState('');
  const [items, setItems] = useState([
    { productDetailId: '', quantity: 1, unitPrice: 0 }
  ]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchPurchases();
    fetchInventoryItems();
  }, []);

  const fetchPurchases = async () => {
    setLoading(true);
    try {
      const data = await axiosClient.get('/admin/purchases');
      setPurchases(data);
    } catch (err) {
      console.error("Lỗi tải phiếu nhập kho:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchInventoryItems = async () => {
    try {
      const data = await axiosClient.get('/admin/inventory');
      setInventoryItems(data);
    } catch (err) {
      console.error("Lỗi tải SPCT kho:", err);
    }
  };

  const handleOpenCreateModal = () => {
    setSupplierName('');
    setSupplierPhone('');
    setSupplierAddress('');
    setNote('');
    setItems([
      {
        productDetailId: inventoryItems[0]?.id || '',
        quantity: 10,
        unitPrice: inventoryItems[0]?.costPrice || 0
      }
    ]);
    setShowCreateModal(true);
  };

  const handleAddItemRow = () => {
    setItems([
      ...items,
      {
        productDetailId: inventoryItems[0]?.id || '',
        quantity: 10,
        unitPrice: inventoryItems[0]?.costPrice || 0
      }
    ]);
  };

  const handleRemoveItemRow = (index) => {
    if (items.length <= 1) {
      alert("Phiếu nhập phải có ít nhất 1 mặt hàng!");
      return;
    }
    setItems(items.filter((_, i) => i !== index));
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;

    // Nếu chọn SPCT khác -> cập nhật unitPrice mặc định theo giá vốn cũ
    if (field === 'productDetailId') {
      const selected = inventoryItems.find(it => it.id === Number(value));
      if (selected && selected.costPrice) {
        newItems[index].unitPrice = selected.costPrice;
      }
    }

    setItems(newItems);
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => {
      const q = Number(item.quantity) || 0;
      const p = Number(item.unitPrice) || 0;
      return sum + (q * p);
    }, 0);
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (items.some(it => !it.productDetailId || it.quantity <= 0)) {
      alert("Vui lòng kiểm tra lại mặt hàng và số lượng nhập!");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        supplierName,
        supplierPhone,
        supplierAddress,
        note,
        items: items.map(it => ({
          productDetailId: Number(it.productDetailId),
          quantity: Number(it.quantity),
          unitPrice: Number(it.unitPrice),
          note: ''
        }))
      };

      await axiosClient.post('/admin/purchases', payload);
      setShowCreateModal(false);
      fetchPurchases();
    } catch (err) {
      alert("Lỗi tạo phiếu nhập: " + (err.response?.data?.message || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  const handleComplete = async (id) => {
    if (!window.confirm("Xác nhận HOÀN TẤT NHẬP KHO? Toàn bộ số lượng trong phiếu sẽ tự động được cộng vào tồn kho các mặt hàng SPCT!")) return;
    try {
      await axiosClient.post(`/admin/purchases/${id}/complete`);
      fetchPurchases();
      fetchInventoryItems();
      if (selectedPurchase && selectedPurchase.id === id) {
        const updated = await axiosClient.get(`/admin/purchases/${id}`);
        setSelectedPurchase(updated);
      }
    } catch (err) {
      alert("Lỗi duyệt nhập kho: " + (err.response?.data?.message || err.message));
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm("Bạn có chắc muốn hủy phiếu nhập kho này?")) return;
    try {
      await axiosClient.post(`/admin/purchases/${id}/cancel`);
      fetchPurchases();
      if (selectedPurchase && selectedPurchase.id === id) {
        const updated = await axiosClient.get(`/admin/purchases/${id}`);
        setSelectedPurchase(updated);
      }
    } catch (err) {
      alert("Lỗi hủy phiếu: " + (err.response?.data?.message || err.message));
    }
  };

  const formatVND = (price) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price || 0);

  const filteredPurchases = purchases.filter(p => {
    const matchSearch =
      p.code?.toLowerCase().includes(search.toLowerCase()) ||
      p.supplierName?.toLowerCase().includes(search.toLowerCase()) ||
      p.creatorName?.toLowerCase().includes(search.toLowerCase());

    const matchStatus = !statusFilter || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

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
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Truck className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-slate-100 text-lg flex items-center gap-2">
              Quản Lý Nhập Hàng & Kho
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                ĐNP & CT ĐN
              </span>
            </h1>
            <p className="text-xs text-slate-400">
              Quản lý phiếu nhập kho từ nhà cung cấp và tự động tăng tồn kho SPCT
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={fetchPurchases}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
            title="Tải lại"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={handleOpenCreateModal}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition active:scale-95"
          >
            <PackagePlus className="w-4 h-4" />
            <span>Tạo Phiếu Nhập Kho Mới</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* Filters */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm theo mã phiếu, nhà cung cấp, người lập..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setStatusFilter('')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                statusFilter === '' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              Tất cả ({purchases.length})
            </button>
            <button
              onClick={() => setStatusFilter('PENDING')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                statusFilter === 'PENDING' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              Chờ duyệt
            </button>
            <button
              onClick={() => setStatusFilter('COMPLETED')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                statusFilter === 'COMPLETED' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              Đã nhập kho
            </button>
            <button
              onClick={() => setStatusFilter('CANCELLED')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                statusFilter === 'CANCELLED' ? 'bg-red-500/20 text-red-300 border border-red-500/40' : 'bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              Đã hủy
            </button>
          </div>
        </div>

        {/* Purchases Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/70 border-b border-slate-800 text-slate-400 uppercase font-semibold">
                <tr>
                  <th className="py-3.5 px-4">Mã Phiếu (ĐNP)</th>
                  <th className="py-3.5 px-4">Nhà Cung Cấp</th>
                  <th className="py-3.5 px-4">Người Lập (TK)</th>
                  <th className="py-3.5 px-4">Ngày Nhập</th>
                  <th className="py-3.5 px-4 text-center">Số Mặt Hàng</th>
                  <th className="py-3.5 px-4 text-right">Tổng Tiền</th>
                  <th className="py-3.5 px-4 text-center">Trạng Thái</th>
                  <th className="py-3.5 px-4 text-center">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {loading ? (
                  <tr>
                    <td colSpan="8" className="py-12 text-center text-slate-500">
                      Đang tải danh sách phiếu nhập kho...
                    </td>
                  </tr>
                ) : filteredPurchases.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="py-12 text-center text-slate-500">
                      Không có phiếu nhập kho nào.
                    </td>
                  </tr>
                ) : (
                  filteredPurchases.map((po) => (
                    <tr key={po.id} className="hover:bg-slate-800/40 transition">
                      <td className="py-3.5 px-4 font-mono font-bold text-emerald-400">
                        {po.code}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-100">
                        {po.supplierName}
                        {po.supplierPhone && (
                          <span className="block text-[11px] text-slate-400 font-normal">
                            SĐT: {po.supplierPhone}
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-slate-300">
                        <span className="flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-slate-500" />
                          {po.creatorName || 'Admin'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-400 font-mono">
                        {po.createdAt ? new Date(po.createdAt).toLocaleString('vi-VN') : 'N/A'}
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono">
                        <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-200">
                          {po.items ? po.items.length : 0} mục
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-emerald-400 text-sm">
                        {formatVND(po.totalAmount)}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            po.status === 'COMPLETED'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : po.status === 'PENDING'
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                              : 'bg-red-500/10 text-red-400 border border-red-500/20'
                          }`}
                        >
                          {po.status === 'COMPLETED' ? 'Đã Nhập Kho' : po.status === 'PENDING' ? 'Chờ Duyệt' : 'Đã Hủy'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => setSelectedPurchase(po)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
                            title="Xem chi tiết đơn nhập (CT ĐN)"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {po.status === 'PENDING' && (
                            <>
                              <button
                                onClick={() => handleComplete(po.id)}
                                className="p-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500 text-emerald-300 hover:text-white transition"
                                title="Duyệt nhập kho (cộng tồn kho ngay)"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleCancel(po.id)}
                                className="p-1.5 rounded-lg bg-red-500/20 hover:bg-red-500 text-red-300 hover:text-white transition"
                                title="Hủy phiếu"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            </>
                          )}
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

      {/* Modal Xem Chi Tiết Phiếu Nhập (CT ĐN) */}
      {selectedPurchase && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-base text-slate-100 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-emerald-400" />
                  Chi Tiết Phiếu Nhập Kho: {selectedPurchase.code}
                </h3>
                <p className="text-slate-400 text-xs mt-0.5">
                  Nhà cung cấp: <span className="text-white font-bold">{selectedPurchase.supplierName}</span>
                </p>
              </div>
              <button
                onClick={() => setSelectedPurchase(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950/60 p-3 rounded-2xl border border-slate-800">
              <div>
                <span className="text-slate-500 text-[10px] uppercase font-bold">Người lập</span>
                <p className="font-semibold text-slate-200">{selectedPurchase.creatorName || 'Admin'}</p>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] uppercase font-bold">Ngày tạo</span>
                <p className="font-mono text-slate-200">
                  {selectedPurchase.createdAt ? new Date(selectedPurchase.createdAt).toLocaleDateString('vi-VN') : 'N/A'}
                </p>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] uppercase font-bold">Trạng thái</span>
                <p className="font-bold text-emerald-400">{selectedPurchase.status}</p>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] uppercase font-bold">Tổng tiền</span>
                <p className="font-mono font-extrabold text-emerald-400 text-sm">{formatVND(selectedPurchase.totalAmount)}</p>
              </div>
            </div>

            {selectedPurchase.note && (
              <p className="text-slate-400 bg-slate-950/40 p-2.5 rounded-xl border border-slate-800/80">
                Ghi chú: {selectedPurchase.note}
              </p>
            )}

            {/* Danh sách CT ĐN */}
            <div className="space-y-2">
              <h4 className="font-bold text-slate-300">Danh Sách Mặt Hàng Chi Tiết (CT ĐN):</h4>
              <div className="border border-slate-800 rounded-xl overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 text-slate-400 uppercase font-semibold">
                    <tr>
                      <th className="py-2.5 px-3">Mã SKU</th>
                      <th className="py-2.5 px-3">Tên Mặt Hàng SPCT</th>
                      <th className="py-2.5 px-3 text-right">Số Lượng</th>
                      <th className="py-2.5 px-3 text-right">Đơn Giá Nhập</th>
                      <th className="py-2.5 px-3 text-right">Thành Tiền</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-300">
                    {selectedPurchase.items?.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-800/30">
                        <td className="py-2.5 px-3 font-mono text-cyan-400">{item.productDetailSku}</td>
                        <td className="py-2.5 px-3 font-medium text-slate-100">{item.productDetailName}</td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-white">
                          {item.quantity} {item.unit}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono">{formatVND(item.unitPrice)}</td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-400">
                          {formatVND(item.totalPrice)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setSelectedPurchase(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold"
              >
                Đóng
              </button>

              {selectedPurchase.status === 'PENDING' && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCancel(selectedPurchase.id)}
                    className="px-4 py-2 rounded-xl bg-red-500/20 hover:bg-red-500 text-red-300 hover:text-white font-bold transition"
                  >
                    Hủy Phiếu
                  </button>
                  <button
                    onClick={() => handleComplete(selectedPurchase.id)}
                    className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold transition shadow-lg shadow-emerald-500/20"
                  >
                    Xác Nhận & Cộng Tồn Kho
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal Tạo Phiếu Nhập Mới */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-3xl w-full p-6 shadow-2xl space-y-4 text-xs max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-base text-slate-100 flex items-center gap-2">
                <PackagePlus className="w-5 h-5 text-emerald-400" />
                Lập Phiếu Nhập Kho Mới (ĐNP)
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Nhà Cung Cấp *</label>
                  <input
                    type="text"
                    required
                    value={supplierName}
                    onChange={(e) => setSupplierName(e.target.value)}
                    placeholder="Tên công ty / Nông trại..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Số Điện Thoại</label>
                  <input
                    type="text"
                    value={supplierPhone}
                    onChange={(e) => setSupplierPhone(e.target.value)}
                    placeholder="0901234567"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Địa Chỉ NCC</label>
                  <input
                    type="text"
                    value={supplierAddress}
                    onChange={(e) => setSupplierAddress(e.target.value)}
                    placeholder="Địa chỉ nhà cung cấp..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Ghi Chú Đơn Nhập</label>
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Ghi chú đợt nhập, phương thức giao nhận..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              {/* Danh sách CT ĐN */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-200">
                    Danh Sách Hàng Nhập (Chi Tiết Đơn Nhập - CT ĐN):
                  </h4>
                  <button
                    type="button"
                    onClick={handleAddItemRow}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-400 font-bold flex items-center gap-1.5 transition"
                  >
                    <Plus className="w-3.5 h-3.5" /> Thêm Mặt Hàng
                  </button>
                </div>

                <div className="space-y-2">
                  {items.map((row, idx) => {
                    const selectedDetail = inventoryItems.find(d => d.id === Number(row.productDetailId));
                    const lineTotal = (Number(row.quantity) || 0) * (Number(row.unitPrice) || 0);

                    return (
                      <div
                        key={idx}
                        className="grid grid-cols-12 gap-2 bg-slate-950/80 p-3 rounded-2xl border border-slate-800 items-center"
                      >
                        <div className="col-span-12 sm:col-span-5">
                          <label className="block text-[11px] text-slate-400 font-semibold mb-1">
                            Mặt Hàng SPCT *
                          </label>
                          <select
                            value={row.productDetailId}
                            onChange={(e) => handleItemChange(idx, 'productDetailId', e.target.value)}
                            required
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-slate-100 text-xs focus:outline-none focus:border-emerald-500"
                          >
                            {inventoryItems.map(d => (
                              <option key={d.id} value={d.id}>
                                [{d.sku}] {d.menuItemName} - {d.variantName} ({d.unit})
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="col-span-6 sm:col-span-2">
                          <label className="block text-[11px] text-slate-400 font-semibold mb-1">
                            Số Lượng ({selectedDetail?.unit || 'Đơn vị'})
                          </label>
                          <input
                            type="number"
                            step="any"
                            min="0.1"
                            required
                            value={row.quantity}
                            onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-slate-100 font-mono text-xs focus:outline-none focus:border-emerald-500"
                          />
                        </div>

                        <div className="col-span-6 sm:col-span-2">
                          <label className="block text-[11px] text-slate-400 font-semibold mb-1">
                            Đơn Giá Nhập (VNĐ)
                          </label>
                          <input
                            type="number"
                            min="0"
                            required
                            value={row.unitPrice}
                            onChange={(e) => handleItemChange(idx, 'unitPrice', e.target.value)}
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-2.5 py-1.5 text-slate-100 font-mono text-xs focus:outline-none focus:border-emerald-500"
                          />
                        </div>

                        <div className="col-span-10 sm:col-span-2 text-right">
                          <span className="block text-[11px] text-slate-500 font-semibold mb-1">Thành Tiền</span>
                          <span className="font-mono font-bold text-emerald-400 text-xs">
                            {formatVND(lineTotal)}
                          </span>
                        </div>

                        <div className="col-span-2 sm:col-span-1 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveItemRow(idx)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition mt-4"
                            title="Xóa dòng"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Total Summary */}
              <div className="flex items-center justify-between bg-slate-950 p-4 rounded-2xl border border-slate-800">
                <span className="font-bold text-slate-300 text-sm">Tổng Giá Trị Phiếu Nhập:</span>
                <span className="font-mono font-black text-emerald-400 text-lg">
                  {formatVND(calculateTotal())}
                </span>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold shadow-lg shadow-emerald-500/20"
                >
                  {submitting ? 'Đang tạo phiếu...' : 'Lưu Phiếu Nhập'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminPurchasesPage;

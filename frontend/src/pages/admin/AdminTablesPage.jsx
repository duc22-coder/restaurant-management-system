import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import { LayoutGrid, Plus, Edit2, Trash2, X, ArrowLeft, QrCode, Users } from 'lucide-react';

const STATUS_LABEL = {
  AVAILABLE: { text: 'Trống', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  OCCUPIED: { text: 'Đang Có Khách', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  PAYING: { text: 'Chờ Thanh Toán', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
};

function AdminTablesPage() {
  const navigate = useNavigate();
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [editingTable, setEditingTable] = useState(null);
  const [tableNumber, setTableNumber] = useState('');
  const [capacity, setCapacity] = useState(4);
  const [status, setStatus] = useState('AVAILABLE');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchTables();
  }, []);

  const fetchTables = async () => {
    setLoading(true);
    try {
      const data = await axiosClient.get('/admin/tables');
      setTables(data);
    } catch (err) {
      console.error('Lỗi tải danh sách bàn:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (table = null) => {
    if (table) {
      setEditingTable(table);
      setTableNumber(table.tableNumber);
      setCapacity(table.capacity || 4);
      setStatus(table.status);
    } else {
      setEditingTable(null);
      setTableNumber('');
      setCapacity(4);
      setStatus('AVAILABLE');
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = { tableNumber, capacity: Number(capacity), status };
      if (editingTable) {
        await axiosClient.put(`/admin/tables/${editingTable.id}`, payload);
      } else {
        await axiosClient.post('/admin/tables', payload);
      }
      setShowModal(false);
      fetchTables();
    } catch (err) {
      alert('Lỗi lưu thông tin bàn: ' + (err.response?.data?.message || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, number) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa bàn "${number}"?`)) {
      try {
        await axiosClient.delete(`/admin/tables/${id}`);
        fetchTables();
      } catch (err) {
        alert('Lỗi xóa bàn: ' + (err.response?.data?.message || err.message));
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
                <LayoutGrid className="w-6 h-6 text-orange-500" />
                Quản Lý Bàn & Khu Vực
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">Thiết lập sơ đồ bàn, sức chứa và mã QR gọi món</p>
            </div>
          </div>

          <button
            onClick={() => handleOpenModal()}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-orange-500/20 transition active:scale-95"
          >
            <Plus className="w-4 h-4" />
            Thêm Bàn Mới
          </button>
        </div>

        {/* Grid List */}
        {loading ? (
          <div className="p-12 text-center text-slate-500 text-xs bg-slate-900 border border-slate-800 rounded-2xl">Đang tải danh sách bàn...</div>
        ) : tables.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs bg-slate-900 border border-slate-800 rounded-2xl">Chưa có bàn nào. Hãy thêm bàn mới!</div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {tables.map((table) => {
              const statusInfo = STATUS_LABEL[table.status] || { text: table.status, color: 'bg-slate-800 text-slate-400 border-slate-700' };
              return (
                <div key={table.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-lg font-extrabold text-white">Bàn {table.tableNumber}</p>
                      <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <Users className="w-3.5 h-3.5" /> {table.capacity || '—'} chỗ ngồi
                      </p>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border shrink-0 ${statusInfo.color}`}>
                      {statusInfo.text}
                    </span>
                  </div>

                  {table.qrCode && (
                    <p className="text-[10px] text-slate-500 flex items-center gap-1.5 truncate">
                      <QrCode className="w-3.5 h-3.5 shrink-0" /> {table.qrCode}
                    </p>
                  )}

                  <div className="flex gap-2 pt-2 border-t border-slate-800">
                    <button
                      onClick={() => handleOpenModal(table)}
                      className="flex-1 p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-blue-400 transition flex items-center justify-center"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(table.id, table.tableNumber)}
                      className="flex-1 p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-red-400 transition flex items-center justify-center"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal Form */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-white text-base">
                {editingTable ? 'Chỉnh Sửa Bàn' : 'Thêm Bàn Mới'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Số Bàn *</label>
                <input
                  type="text"
                  required
                  value={tableNumber}
                  onChange={(e) => setTableNumber(e.target.value)}
                  placeholder="Ví dụ: 01, A1, VIP-1..."
                  className="w-full bg-slate-950 border border-slate-800 focus:border-orange-500 rounded-xl px-3.5 py-2.5 text-slate-200 outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Sức Chứa (số người)</label>
                <input
                  type="number"
                  min="1"
                  value={capacity}
                  onChange={(e) => setCapacity(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-orange-500 rounded-xl px-3.5 py-2.5 text-slate-200 outline-none"
                />
              </div>

              {editingTable && (
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Trạng Thái</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-orange-500 rounded-xl px-3 py-2.5 text-slate-200 outline-none"
                  >
                    <option value="AVAILABLE">Trống</option>
                    <option value="OCCUPIED">Đang Có Khách</option>
                    <option value="PAYING">Chờ Thanh Toán</option>
                  </select>
                </div>
              )}

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
                  {submitting ? 'Đang Lưu...' : 'Lưu Bàn'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminTablesPage;

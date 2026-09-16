import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import { Users, Plus, Edit2, Trash2, X, ArrowLeft, Lock, Unlock, ShieldCheck, UserCheck, User as UserIcon } from 'lucide-react';

const ROLE_LABEL = {
  ADMIN: { text: 'Admin', color: 'bg-purple-500/10 text-purple-400 border-purple-500/20', icon: ShieldCheck },
  STAFF: { text: 'Staff', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20', icon: UserCheck },
  CUSTOMER: { text: 'Customer', color: 'bg-slate-800 text-slate-400 border-slate-700', icon: UserIcon },
};

function AdminUsersPage() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [roleFilter, setRoleFilter] = useState('');
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form, setForm] = useState({ username: '', password: '', fullName: '', email: '', phone: '', role: 'STAFF' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = roleFilter ? { role: roleFilter } : {};
      const data = await axiosClient.get('/admin/users', { params });
      setUsers(data);
    } catch (err) {
      console.error('Lỗi tải danh sách người dùng:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (user = null) => {
    if (user) {
      setEditingUser(user);
      setForm({ username: user.username, password: '', fullName: user.fullName, email: user.email || '', phone: user.phone || '', role: user.role });
    } else {
      setEditingUser(null);
      setForm({ username: '', password: '', fullName: '', email: '', phone: '', role: 'STAFF' });
    }
    setShowModal(true);
  };

  const handleChange = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingUser) {
        await axiosClient.put(`/admin/users/${editingUser.id}`, form);
      } else {
        await axiosClient.post('/admin/users', form);
      }
      setShowModal(false);
      fetchUsers();
    } catch (err) {
      alert('Lỗi lưu tài khoản: ' + (err.response?.data?.message || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (user) => {
    const action = user.status === 'ACTIVE' ? 'khóa' : 'mở khóa';
    if (window.confirm(`Bạn có chắc chắn muốn ${action} tài khoản "${user.username}"?`)) {
      try {
        await axiosClient.patch(`/admin/users/${user.id}/toggle-status`);
        fetchUsers();
      } catch (err) {
        alert('Lỗi: ' + (err.response?.data?.message || err.message));
      }
    }
  };

  const handleDelete = async (id, username) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa tài khoản "${username}"? Hành động này không thể hoàn tác.`)) {
      try {
        await axiosClient.delete(`/admin/users/${id}`);
        fetchUsers();
      } catch (err) {
        alert('Lỗi xóa tài khoản: ' + (err.response?.data?.message || err.message));
      }
    }
  };

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
                <Users className="w-6 h-6 text-orange-500" />
                Quản Lý Người Dùng
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">Tạo tài khoản nhân viên, phân quyền, khóa/mở khóa</p>
            </div>
          </div>

          <button
            onClick={() => handleOpenModal()}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-orange-500/20 transition active:scale-95"
          >
            <Plus className="w-4 h-4" />
            Thêm Tài Khoản
          </button>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2">
          {[{ v: '', l: 'Tất Cả' }, { v: 'ADMIN', l: 'Admin' }, { v: 'STAFF', l: 'Staff' }, { v: 'CUSTOMER', l: 'Customer' }].map((tab) => (
            <button
              key={tab.v}
              onClick={() => setRoleFilter(tab.v)}
              className={`px-4 py-2 rounded-xl text-xs font-bold border transition ${
                roleFilter === tab.v
                  ? 'bg-orange-600 border-orange-600 text-white'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.l}
            </button>
          ))}
        </div>

        {/* Table List */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          {loading ? (
            <div className="p-12 text-center text-slate-500 text-xs">Đang tải danh sách...</div>
          ) : users.length === 0 ? (
            <div className="p-12 text-center text-slate-500 text-xs">Không có tài khoản nào.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                  <tr>
                    <th className="px-6 py-4">Tài Khoản</th>
                    <th className="px-6 py-4">Liên Hệ</th>
                    <th className="px-6 py-4 text-center">Vai Trò</th>
                    <th className="px-6 py-4 text-center">Trạng Thái</th>
                    <th className="px-6 py-4 text-right">Thao Tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {users.map((u) => {
                    const roleInfo = ROLE_LABEL[u.role] || ROLE_LABEL.CUSTOMER;
                    const RoleIcon = roleInfo.icon;
                    return (
                      <tr key={u.id} className="hover:bg-slate-800/50 transition">
                        <td className="px-6 py-4">
                          <p className="font-bold text-white">{u.fullName}</p>
                          <p className="text-slate-500">@{u.username}</p>
                        </td>
                        <td className="px-6 py-4 text-slate-400">
                          <p>{u.email || '—'}</p>
                          <p>{u.phone || '—'}</p>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold border ${roleInfo.color}`}>
                            <RoleIcon className="w-3 h-3" /> {roleInfo.text}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold border ${
                            u.status === 'ACTIVE'
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                              : 'bg-red-500/10 text-red-400 border-red-500/20'
                          }`}>
                            {u.status === 'ACTIVE' ? 'Hoạt Động' : 'Đã Khóa'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right space-x-2 whitespace-nowrap">
                          <button
                            onClick={() => handleToggleStatus(u)}
                            className={`p-2 rounded-lg bg-slate-800 hover:bg-slate-700 transition ${u.status === 'ACTIVE' ? 'text-amber-400' : 'text-emerald-400'}`}
                            title={u.status === 'ACTIVE' ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}
                          >
                            {u.status === 'ACTIVE' ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                          </button>
                          <button
                            onClick={() => handleOpenModal(u)}
                            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-blue-400 transition"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(u.id, u.username)}
                            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-red-400 transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal Form */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-white text-base">
                {editingUser ? 'Chỉnh Sửa Tài Khoản' : 'Thêm Tài Khoản Mới'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Tên Đăng Nhập *</label>
                <input
                  type="text"
                  required
                  value={form.username}
                  onChange={handleChange('username')}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-orange-500 rounded-xl px-3.5 py-2.5 text-slate-200 outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Mật Khẩu {editingUser && <span className="text-slate-500 font-normal">(để trống nếu không đổi)</span>}
                </label>
                <input
                  type="password"
                  required={!editingUser}
                  value={form.password}
                  onChange={handleChange('password')}
                  placeholder={editingUser ? '••••••' : 'Ít nhất 6 ký tự'}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-orange-500 rounded-xl px-3.5 py-2.5 text-slate-200 placeholder-slate-600 outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Họ Và Tên *</label>
                <input
                  type="text"
                  required
                  value={form.fullName}
                  onChange={handleChange('fullName')}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-orange-500 rounded-xl px-3.5 py-2.5 text-slate-200 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Email</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={handleChange('email')}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-orange-500 rounded-xl px-3 py-2.5 text-slate-200 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Điện Thoại</label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={handleChange('phone')}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-orange-500 rounded-xl px-3 py-2.5 text-slate-200 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Vai Trò *</label>
                <select
                  value={form.role}
                  onChange={handleChange('role')}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-orange-500 rounded-xl px-3 py-2.5 text-slate-200 outline-none"
                >
                  <option value="STAFF">Staff (Bếp / Phục vụ / Thu ngân)</option>
                  <option value="ADMIN">Admin (Quản trị viên)</option>
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
                  {submitting ? 'Đang Lưu...' : 'Lưu Tài Khoản'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminUsersPage;

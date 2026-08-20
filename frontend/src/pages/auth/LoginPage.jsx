import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Utensils, Lock, User, LogIn, AlertCircle, ShieldCheck, UserCheck } from 'lucide-react';

function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const authData = await login(username, password);
      if (authData.role === 'ADMIN') {
        navigate('/admin/dashboard');
      } else {
        navigate('/staff/dashboard');
      }
    } catch (err) {
      console.error("Login failed:", err);
      setError(err.response?.data?.message || err.message || 'Tài khoản hoặc mật khẩu không chính xác!');
    } finally {
      setLoading(false);
    }
  };

  const fillCredentials = (user, pass) => {
    setUsername(user);
    setPassword(pass);
    setError('');
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container */}
      <div className="max-w-md w-full bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-2xl relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center shadow-lg shadow-orange-500/25 mx-auto mb-4">
            <Utensils className="w-9 h-9 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Đăng Nhập Hệ Thống</h1>
          <p className="text-slate-400 text-xs mt-1">Dành cho Nhân Viên (Staff) và Quản Lý (Admin)</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-start gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-2">Tên Đăng Nhập</label>
            <div className="relative">
              <User className="w-5 h-5 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Nhập username..."
                className="w-full bg-slate-950/80 border border-slate-800 focus:border-orange-500 rounded-xl py-3 pl-11 pr-4 text-sm text-slate-200 placeholder-slate-600 outline-none transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-2">Mật Khẩu</label>
            <div className="relative">
              <Lock className="w-5 h-5 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Nhập password..."
                className="w-full bg-slate-950/80 border border-slate-800 focus:border-orange-500 rounded-xl py-3 pl-11 pr-4 text-sm text-slate-200 placeholder-slate-600 outline-none transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-orange-600/25 flex items-center justify-center gap-2 transition active:scale-[0.98] disabled:opacity-50 mt-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <LogIn className="w-5 h-5" />
                <span>Đăng Nhập</span>
              </>
            )}
          </button>
        </form>

        {/* Quick Fill Test Accounts */}
        <div className="mt-8 pt-6 border-t border-slate-800/80">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider text-center mb-3">
            Tài Khoản Mẫu (Đồ Án)
          </p>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => fillCredentials('staff', 'staff123')}
              className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-left flex items-center gap-2.5 transition"
            >
              <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400">
                <UserCheck className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-200">Staff</p>
                <p className="text-[10px] text-slate-500">staff / staff123</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => fillCredentials('admin', 'admin123')}
              className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-left flex items-center gap-2.5 transition"
            >
              <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-200">Admin</p>
                <p className="text-[10px] text-slate-500">admin / admin123</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;

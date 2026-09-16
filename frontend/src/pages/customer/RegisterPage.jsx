import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Utensils, Lock, User, UserPlus, AlertCircle, Mail, Phone, MapPin } from 'lucide-react';

function RegisterPage() {
  const [form, setForm] = useState({
    username: '',
    password: '',
    fullName: '',
    email: '',
    phone: '',
    address: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(form);
      // Đăng ký thành công -> tự động đăng nhập -> vào thẳng trang thực đơn
      navigate('/menu');
    } catch (err) {
      console.error('Register failed:', err);
      setError(err.response?.data?.message || err.message || 'Đăng ký thất bại, vui lòng thử lại!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-md w-full bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-2xl relative z-10 my-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center shadow-lg shadow-orange-500/25 mx-auto mb-4">
            <Utensils className="w-9 h-9 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Đăng Ký Tài Khoản</h1>
          <p className="text-slate-400 text-xs mt-1">Dành cho Khách Hàng — lưu địa chỉ & theo dõi đơn hàng dễ dàng hơn</p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-start gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-2">Tên Đăng Nhập</label>
            <div className="relative">
              <User className="w-5 h-5 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                minLength={4}
                value={form.username}
                onChange={handleChange('username')}
                placeholder="Ít nhất 4 ký tự..."
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
                minLength={6}
                value={form.password}
                onChange={handleChange('password')}
                placeholder="Ít nhất 6 ký tự..."
                className="w-full bg-slate-950/80 border border-slate-800 focus:border-orange-500 rounded-xl py-3 pl-11 pr-4 text-sm text-slate-200 placeholder-slate-600 outline-none transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-2">Họ Và Tên</label>
            <div className="relative">
              <User className="w-5 h-5 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={form.fullName}
                onChange={handleChange('fullName')}
                placeholder="Nguyễn Văn A"
                className="w-full bg-slate-950/80 border border-slate-800 focus:border-orange-500 rounded-xl py-3 pl-11 pr-4 text-sm text-slate-200 placeholder-slate-600 outline-none transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-2">Email</label>
              <div className="relative">
                <Mail className="w-5 h-5 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={form.email}
                  onChange={handleChange('email')}
                  placeholder="email@..."
                  className="w-full bg-slate-950/80 border border-slate-800 focus:border-orange-500 rounded-xl py-3 pl-11 pr-3 text-sm text-slate-200 placeholder-slate-600 outline-none transition"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-2">Số Điện Thoại</label>
              <div className="relative">
                <Phone className="w-5 h-5 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  value={form.phone}
                  onChange={handleChange('phone')}
                  placeholder="09xxxxxxxx"
                  className="w-full bg-slate-950/80 border border-slate-800 focus:border-orange-500 rounded-xl py-3 pl-11 pr-3 text-sm text-slate-200 placeholder-slate-600 outline-none transition"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-2">Địa Chỉ Giao Hàng (tùy chọn)</label>
            <div className="relative">
              <MapPin className="w-5 h-5 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={form.address}
                onChange={handleChange('address')}
                placeholder="Số nhà, đường, phường/xã..."
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
                <UserPlus className="w-5 h-5" />
                <span>Đăng Ký</span>
              </>
            )}
          </button>
        </form>

        <p className="text-center text-xs text-slate-500 mt-5">
          Đã có tài khoản?{' '}
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="text-orange-400 hover:text-orange-300 font-bold underline underline-offset-2"
          >
            Đăng nhập
          </button>
        </p>
      </div>
    </div>
  );
}

export default RegisterPage;

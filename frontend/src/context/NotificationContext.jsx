import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { AlertCircle, CheckCircle2, Info, X } from 'lucide-react';

const NotificationContext = createContext(null);

const inferType = (message) => {
  const text = String(message).toLowerCase();
  if (text.includes('lỗi') || text.includes('thất bại') || text.includes('không thể')) return 'error';
  if (text.includes('thành công') || text.includes('đã hủy')) return 'success';
  if (text.includes('vui lòng') || text.includes('có chắc') || text.includes('xác nhận')
      || text.includes('phải có') || text.includes('kiểm tra lại')) return 'warning';
  return 'info';
};

const toastStyles = {
  success: { icon: CheckCircle2, shell: 'border-emerald-400/20 bg-[#15221b]', iconClass: 'text-emerald-300 bg-emerald-400/10', bar: 'bg-emerald-400' },
  error: { icon: AlertCircle, shell: 'border-rose-400/20 bg-[#281a1b]', iconClass: 'text-rose-300 bg-rose-400/10', bar: 'bg-rose-400' },
  warning: { icon: AlertCircle, shell: 'border-amber-300/20 bg-[#282218]', iconClass: 'text-amber-200 bg-amber-300/10', bar: 'bg-amber-300' },
  info: { icon: Info, shell: 'border-sky-300/20 bg-[#192229]', iconClass: 'text-sky-200 bg-sky-300/10', bar: 'bg-sky-300' },
};

export function NotificationProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const [dialog, setDialog] = useState(null);
  const resolver = useRef(null);
  const timers = useRef(new Map());

  const dismissToast = useCallback((id) => {
    const timer = timers.current.get(id);
    if (timer) clearTimeout(timer);
    timers.current.delete(id);
    setToasts((items) => items.filter((item) => item.id !== id));
  }, []);

  const notify = useCallback((message, type) => {
    const id = `${Date.now()}-${Math.random()}`;
    const toast = { id, message: String(message), type: type || inferType(message) };
    setToasts((items) => [...items.slice(-3), toast]);
    timers.current.set(id, setTimeout(() => dismissToast(id), 4600));
  }, [dismissToast]);

  const confirmDialog = useCallback((message, options = {}) => new Promise((resolve) => {
    resolver.current = resolve;
    const text = String(message).toLowerCase();
    const destructive = options.variant === 'danger' || /xóa|hủy|khóa/.test(text);
    setDialog({
      message,
      title: options.title || (destructive ? 'Xác nhận thao tác' : 'Bạn xác nhận nhé?'),
      confirmLabel: options.confirmLabel || (destructive ? 'Xác nhận' : 'Đồng ý'),
      cancelLabel: options.cancelLabel || 'Để sau',
      destructive,
    });
  }), []);

  const finishDialog = (accepted) => {
    resolver.current?.(accepted);
    resolver.current = null;
    setDialog(null);
  };

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  useEffect(() => {
    if (!dialog) return undefined;
    const onKeyDown = (event) => {
      if (event.key === 'Escape') finishDialog(false);
      if (event.key === 'Enter') finishDialog(true);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [dialog]);

  return (
    <NotificationContext.Provider value={{ notify, confirmDialog }}>
      {children}

      <div className="pointer-events-none fixed right-4 top-4 z-[100] flex w-[min(92vw,390px)] flex-col gap-3 sm:right-6 sm:top-6" aria-live="polite" aria-atomic="false">
        {toasts.map((toast) => {
          const style = toastStyles[toast.type] || toastStyles.info;
          const Icon = style.icon;
          return (
            <div key={toast.id} className={`pointer-events-auto relative overflow-hidden rounded-2xl border p-4 pr-11 text-slate-100 shadow-[0_18px_60px_rgba(0,0,0,0.45)] backdrop-blur-xl animate-in slide-in-from-top-3 fade-in duration-200 ${style.shell}`} role="status">
              <div className="flex items-start gap-3">
                <span className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${style.iconClass}`}><Icon className="h-5 w-5" /></span>
                <p className="pt-1.5 text-sm font-medium leading-5 text-slate-100">{toast.message}</p>
              </div>
              <button type="button" onClick={() => dismissToast(toast.id)} className="absolute right-3 top-3 rounded-lg p-1.5 text-slate-400 transition hover:bg-white/10 hover:text-white" aria-label="Đóng thông báo"><X className="h-4 w-4" /></button>
              <span className={`absolute bottom-0 left-0 h-0.5 w-full origin-left animate-[toast-progress_4.6s_linear_forwards] ${style.bar}`} />
            </div>
          );
        })}
      </div>

      {dialog && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/65 p-4 backdrop-blur-sm animate-in fade-in duration-150" onMouseDown={(event) => { if (event.target === event.currentTarget) finishDialog(false); }}>
          <section role="alertdialog" aria-modal="true" aria-labelledby="app-confirm-title" aria-describedby="app-confirm-message" className="w-full max-w-md overflow-hidden rounded-3xl border border-amber-200/15 bg-[#191a17] text-slate-100 shadow-[0_30px_100px_rgba(0,0,0,0.65)] animate-in zoom-in-95 slide-in-from-bottom-2 duration-200">
            <div className="h-1 bg-gradient-to-r from-orange-500 via-amber-300 to-orange-500" />
            <div className="p-6 sm:p-7">
              <div className="mb-5 flex items-start gap-4">
                <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border ${dialog.destructive ? 'border-rose-300/15 bg-rose-300/10 text-rose-200' : 'border-amber-200/15 bg-amber-200/10 text-amber-100'}`}>
                  <Info className="h-6 w-6" />
                </span>
                <div className="pt-0.5">
                  <h2 id="app-confirm-title" className="text-lg font-bold tracking-tight">{dialog.title}</h2>
                  <p id="app-confirm-message" className="mt-2 text-sm leading-6 text-slate-300">{dialog.message}</p>
                </div>
              </div>
              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <button type="button" onClick={() => finishDialog(false)} className="rounded-xl border border-slate-700 bg-slate-800/70 px-4 py-2.5 text-sm font-semibold text-slate-300 transition hover:border-slate-600 hover:bg-slate-800 hover:text-white">{dialog.cancelLabel}</button>
                <button type="button" autoFocus onClick={() => finishDialog(true)} className={`rounded-xl px-4 py-2.5 text-sm font-bold text-white shadow-lg transition active:scale-[0.98] ${dialog.destructive ? 'bg-rose-600 shadow-rose-950/30 hover:bg-rose-500' : 'bg-gradient-to-r from-orange-600 to-amber-500 shadow-orange-950/30 hover:from-orange-500 hover:to-amber-400'}`}>{dialog.confirmLabel}</button>
              </div>
            </div>
          </section>
        </div>
      )}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotifications must be used within NotificationProvider');
  return context;
}

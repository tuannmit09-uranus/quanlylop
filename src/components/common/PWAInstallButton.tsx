import React, { useState } from 'react';
import { Download, Check, Smartphone, Apple, X, Info } from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';

export const PWAInstallButton: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showModal, setShowModal] = useState(false);
  const [installing, setInstalling] = useState(false);

  // If already running inside standalone installed PWA, hide
  if (isInstalled) {
    return null;
  }

  const handleAction = async () => {
    if (isInstallable) {
      setInstalling(true);
      try {
        await install();
      } finally {
        setInstalling(false);
      }
    } else {
      setShowModal(true);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={handleAction}
        disabled={installing}
        className={`inline-flex items-center gap-1.5 font-semibold transition-all cursor-pointer ${
          compact
            ? 'px-2.5 py-1 text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg border border-blue-200'
            : 'px-3 py-1.5 text-xs bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl shadow-xs shadow-blue-500/20 active:scale-95'
        }`}
        title="Cài đặt ứng dụng EduTutor trên máy tính hoặc điện thoại"
      >
        <Download className="w-3.5 h-3.5" />
        <span>{installing ? 'Đang kích hoạt...' : 'Cài đặt App'}</span>
      </button>

      {/* Modal with instructions for devices where beforeinstallprompt is not automatically fired (e.g. iOS Safari) */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-200 space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
                  <Smartphone className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Cài đặt ứng dụng EduTutor</h3>
                  <p className="text-[11px] text-slate-500">Mở toàn màn hình, truy cập nhanh như App gốc</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-600">
              {isIOS ? (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                  <div className="flex items-center gap-1.5 font-bold text-slate-800">
                    <Apple className="w-4 h-4" />
                    <span>Dành cho iPhone / iPad (Safari)</span>
                  </div>
                  <ol className="list-decimal list-inside text-slate-600 space-y-1 pl-1 leading-relaxed">
                    <li>Mở trình duyệt <strong>Safari</strong> trên thiết bị.</li>
                    <li>Chạm vào nút <strong>Chia sẻ (Share)</strong> <span className="px-1 py-0.5 bg-slate-200 rounded font-mono text-[10px]">⎋</span> ở dưới cùng.</li>
                    <li>Cuộn xuống và chọn <strong>"Thêm vào MH chính" (Add to Home Screen)</strong>.</li>
                    <li>Nhấn <strong>Thêm (Add)</strong> để hoàn tất.</li>
                  </ol>
                </div>
              ) : (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                  <div className="flex items-center gap-1.5 font-bold text-slate-800">
                    <Smartphone className="w-4 h-4 text-blue-600" />
                    <span>Dành cho Chrome, Edge hoặc Android</span>
                  </div>
                  <ol className="list-decimal list-inside text-slate-600 space-y-1 pl-1 leading-relaxed">
                    <li>Nhấp vào biểu tượng <strong>Cài đặt</strong> trên thanh địa chỉ của trình duyệt (hoặc menu dấu 3 chấm ⋮).</li>
                    <li>Chọn <strong>"Cài đặt EduTutor Pro"</strong>.</li>
                    <li>Xác nhận để tạo biểu tượng ứng dụng riêng trên màn hình.</li>
                  </ol>
                </div>
              )}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl cursor-pointer"
              >
                Đã hiểu
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

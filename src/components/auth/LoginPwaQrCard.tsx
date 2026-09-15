import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import {
  Smartphone,
  Download,
  Share2,
  Check,
  Copy,
  Info,
  ChevronDown,
  ChevronUp,
  Apple,
  Sparkles,
  ShieldCheck,
  ExternalLink,
} from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';

export const LoginPwaQrCard: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [installing, setInstalling] = useState(false);

  // Get current app URL (clean origin + pathname)
  const appUrl = typeof window !== 'undefined' ? window.location.href.split('#')[0] : '';

  useEffect(() => {
    if (!appUrl) return;

    QRCode.toDataURL(appUrl, {
      margin: 1,
      width: 220,
      color: {
        dark: '#1e293b',
        light: '#ffffff',
      },
      errorCorrectionLevel: 'M',
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error('Error generating PWA QR Code:', err));
  }, [appUrl]);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(appUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      setCopied(false);
    }
  };

  const handleInstallClick = async () => {
    setInstalling(true);
    try {
      await install();
    } finally {
      setInstalling(false);
    }
  };

  return (
    <div className="mt-4 pt-4 border-t border-slate-200/80">
      {/* Divider Label */}
      <div className="flex items-center justify-center -mt-6 mb-3.5">
        <span className="px-3 py-0.5 bg-slate-100 text-slate-600 text-[11px] font-bold rounded-full uppercase tracking-wider border border-slate-200/80 shadow-2xs">
          Cài đặt App trên Điện thoại
        </span>
      </div>

      {/* Main Container */}
      <div className="bg-gradient-to-br from-slate-50 via-blue-50/40 to-indigo-50/30 border border-blue-100/80 rounded-2xl p-3.5 sm:p-4 text-slate-800 shadow-xs">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
          {/* QR Code Container */}
          <div className="shrink-0 flex flex-col items-center">
            <div className="p-2 bg-white rounded-xl border border-slate-200 shadow-sm relative group">
              {qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt="Mã QR tải ứng dụng EduTutor"
                  className="w-28 h-28 sm:w-32 sm:h-32 object-contain rounded-lg"
                />
              ) : (
                <div className="w-28 h-28 sm:w-32 sm:h-32 bg-slate-100 animate-pulse rounded-lg flex items-center justify-center text-xs text-slate-400">
                  Đang tải QR...
                </div>
              )}
              <div className="absolute inset-0 bg-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl pointer-events-none" />
            </div>
            <span className="text-[10px] font-semibold text-slate-500 mt-1.5 flex items-center gap-1">
              <Smartphone className="w-3 h-3 text-blue-600" />
              Quét bằng Camera
            </span>
          </div>

          {/* Info & Action Buttons */}
          <div className="flex-1 min-w-0 text-center sm:text-left space-y-2">
            <div className="flex items-center justify-center sm:justify-between gap-2 flex-wrap">
              <h4 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <span>Tải & Cài đặt Ứng dụng EduTutor</span>
                <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.2 rounded bg-blue-100 text-blue-700">
                  App
                </span>
              </h4>

              {isInstalled && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100/90 px-2 py-0.5 rounded-full">
                  <Check className="w-3 h-3" /> Đã cài đặt
                </span>
              )}
            </div>

            <p className="text-[11px] text-slate-600 leading-relaxed">
              Mở camera quét mã để cài đặt trực tiếp lên màn hình chính. Đăng nhập 1 lần, tự động nhận diện phân quyền <strong>Giáo viên</strong>, <strong>Phụ huynh</strong> hoặc <strong>Học sinh</strong>.
            </p>

            {/* Quick Benefits Tag */}
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5 pt-0.5">
              <span className="text-[10px] bg-white border border-slate-200 text-slate-700 px-2 py-0.5 rounded-md font-medium">
                ⚡ Khởi động tức thì
              </span>
              <span className="text-[10px] bg-white border border-slate-200 text-slate-700 px-2 py-0.5 rounded-md font-medium">
                📱 Toàn màn hình
              </span>
              <span className="text-[10px] bg-white border border-slate-200 text-slate-700 px-2 py-0.5 rounded-md font-medium">
                🔒 Tự động nhớ phiên
              </span>
            </div>

            {/* Action Bar */}
            <div className="flex items-center justify-center sm:justify-start gap-2 pt-1.5 flex-wrap">
              {isInstallable && (
                <button
                  type="button"
                  onClick={handleInstallClick}
                  disabled={installing}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-xs rounded-lg flex items-center gap-1.5 shadow-xs transition-all cursor-pointer disabled:opacity-50"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{installing ? 'Đang kích hoạt...' : 'Cài đặt ngay'}</span>
                </button>
              )}

              <button
                type="button"
                onClick={handleCopyLink}
                className="px-2.5 py-1.5 bg-white hover:bg-slate-100 active:scale-95 border border-slate-200 text-slate-700 font-semibold text-xs rounded-lg flex items-center gap-1.5 transition-all cursor-pointer"
                title="Sao chép đường dẫn cài đặt"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
                <span>{copied ? 'Đã sao chép' : 'Sao chép link'}</span>
              </button>

              <button
                type="button"
                onClick={() => setShowGuide(!showGuide)}
                className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200/80 font-semibold text-xs rounded-lg flex items-center gap-1 transition-all cursor-pointer"
              >
                <Info className="w-3.5 h-3.5" />
                <span>Hướng dẫn</span>
                {showGuide ? <ChevronUp className="w-3 h-3 ml-0.5" /> : <ChevronDown className="w-3 h-3 ml-0.5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Collapsible Step-by-Step Installation Guide */}
        {showGuide && (
          <div className="mt-3.5 pt-3 border-t border-blue-100 text-xs text-slate-700 space-y-2.5 animate-fadeIn">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* iOS Safari Guide */}
              <div className="p-2.5 bg-white rounded-xl border border-slate-200 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-slate-900 text-[11px]">
                  <Apple className="w-3.5 h-3.5 text-slate-800" />
                  <span>Thiết bị iPhone / iPad (Safari)</span>
                </div>
                <ol className="list-decimal list-inside text-[11px] text-slate-600 space-y-0.5 pl-0.5 leading-relaxed">
                  <li>Mở link bằng trình duyệt <strong>Safari</strong>.</li>
                  <li>Chạm vào nút <strong>Chia sẻ (Share)</strong> <span className="inline-block px-1 py-0.2 bg-slate-100 rounded text-[10px]">⎋</span> ở thanh điều hướng dưới.</li>
                  <li>Cuộn xuống và chọn <strong>"Thêm vào MH chính" (Add to Home Screen)</strong>.</li>
                  <li>Nhấn <strong>Thêm (Add)</strong> ở góc trên bên phải.</li>
                </ol>
              </div>

              {/* Android Chrome Guide */}
              <div className="p-2.5 bg-white rounded-xl border border-slate-200 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-slate-900 text-[11px]">
                  <Smartphone className="w-3.5 h-3.5 text-blue-600" />
                  <span>Thiết bị Android (Chrome / Cốc Cốc)</span>
                </div>
                <ol className="list-decimal list-inside text-[11px] text-slate-600 space-y-0.5 pl-0.5 leading-relaxed">
                  <li>Mở link bằng trình duyệt <strong>Google Chrome</strong>.</li>
                  <li>Chạm vào biểu tượng dấu <strong>3 chấm (⋮)</strong> ở góc trên bên phải.</li>
                  <li>Chọn <strong>"Cài đặt ứng dụng" (Install App)</strong> hoặc <strong>"Thêm vào Màn hình chính"</strong>.</li>
                  <li>Xác nhận <strong>Cài đặt</strong> để tải ứng dụng.</li>
                </ol>
              </div>
            </div>

            <div className="flex items-center gap-1.5 text-[10px] text-slate-500 bg-blue-50/60 px-2 py-1 rounded-lg">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span>
                Ứng dụng cài đặt trực tiếp, dung lượng siêu nhẹ (&lt; 2MB), không tiêu tốn bộ nhớ và luôn tự động cập nhật phiên bản mới nhất.
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

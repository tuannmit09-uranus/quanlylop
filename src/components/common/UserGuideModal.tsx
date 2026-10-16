import React, { useState } from 'react';
import {
  FileDown,
  Youtube,
  ExternalLink,
  X,
  BookOpen,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import { storage } from '../../lib/firebase';
import { ref as storageRef, getDownloadURL } from 'firebase/storage';

interface UserGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultSection?: number;
}

export const YOUTUBE_BANK_STATEMENT_GUIDE_URL = 'https://www.youtube.com/watch?v=lBMk39wyZzU';
export const DEFAULT_GUIDE_PDF_URL = '/HDSD_PM_diemdanh.pdf';
export const STORAGE_PDF_FILENAME = 'HDSD_PM_diemdanh.pdf';

export const UserGuideModal: React.FC<UserGuideModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [showVideoModal, setShowVideoModal] = useState<boolean>(false);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [downloadSuccess, setDownloadSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleDownloadPDF = async () => {
    setIsDownloading(true);
    setDownloadSuccess(false);

    try {
      let downloadUrl = '';

      // 1. Fetch signed download URL from Firebase Storage: gs://gen-lang-client-0853056811.firebasestorage.app/HDSD_PM_diemdanh.pdf
      try {
        const fileRef = storageRef(storage, STORAGE_PDF_FILENAME);
        downloadUrl = await getDownloadURL(fileRef);
      } catch (storageErr) {
        console.warn('Firebase Storage getDownloadURL notice (falling back to direct/local):', storageErr);
        downloadUrl = DEFAULT_GUIDE_PDF_URL;
      }

      // 2. Download as blob to guarantee exact filename "HDSD_PM_diemdanh.pdf"
      try {
        const res = await fetch(downloadUrl);
        if (res.ok) {
          const blob = await res.blob();
          const blobUrl = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = blobUrl;
          link.download = STORAGE_PDF_FILENAME;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(blobUrl);
          setDownloadSuccess(true);
          setTimeout(() => setDownloadSuccess(false), 3000);
          return;
        }
      } catch (blobErr) {
        console.warn('Blob fetch failed, falling back to direct anchor:', blobErr);
      }

      // 3. Fallback direct anchor click
      const link = document.createElement('a');
      link.href = downloadUrl || DEFAULT_GUIDE_PDF_URL;
      link.download = STORAGE_PDF_FILENAME;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    } catch (err) {
      console.error('Download execution error:', err);
      // Final resilient fallback
      window.open(DEFAULT_GUIDE_PDF_URL, '_blank');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl border border-slate-100 flex flex-col overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Top Header - Exact replica of user specification */}
        <div className="px-6 py-4 bg-linear-to-r from-blue-900 via-indigo-900 to-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 shrink-0">
              <BookOpen className="w-5 h-5 text-blue-300" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-black tracking-tight text-white">
                  Tài Liệu Hướng Dẫn Sử Dụng EduTutor Pro
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/30 text-blue-200 border border-blue-400/30">
                  v2.5.0-PRO
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                hướng dẫn vận hành chi tiết: Điểm danh, Học phí VietQR, Đối soát sao kê
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
              title="Đóng"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Action Bar / Main Body - Clean & Simple matching user's image */}
        <div className="px-6 py-5 sm:py-6 bg-white flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          {/* Download PDF button (Green) */}
          <button
            type="button"
            onClick={handleDownloadPDF}
            disabled={isDownloading}
            className="inline-flex items-center justify-center space-x-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full font-bold text-xs sm:text-sm transition-all shadow-xs shrink-0 cursor-pointer disabled:opacity-60 active:scale-98"
            title="Tải đúng file PDF HDSD_PM_diemdanh.pdf từ Firebase Storage"
          >
            {isDownloading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : downloadSuccess ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-200" />
            ) : (
              <FileDown className="w-4 h-4" />
            )}
            <span>
              {isDownloading
                ? 'Đang tải file PDF...'
                : downloadSuccess
                ? 'Đã tải thành công!'
                : 'Tải file PDF Hướng dẫn sử dụng'}
            </span>
          </button>

          {/* YouTube Video Guide Link (Red) */}
          <div className="flex items-center justify-end space-x-2 shrink-0">
            <button
              type="button"
              onClick={() => setShowVideoModal(true)}
              className="inline-flex items-center justify-center space-x-2 px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-full font-bold text-xs sm:text-sm transition-all shadow-xs cursor-pointer shrink-0 active:scale-98"
              title="Xem video hướng dẫn trích xuất sao kê ngân hàng trên YouTube"
            >
              <Youtube className="w-4 h-4" />
              <span>Video HD trích xuất sao kê</span>
            </button>
            <a
              href={YOUTUBE_BANK_STATEMENT_GUIDE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-slate-400 hover:text-red-600 rounded-full hover:bg-slate-100 transition-colors"
              title="Mở video YouTube trên tab mới"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>

      {/* Embedded YouTube Video Modal */}
      {showVideoModal && (
        <div className="fixed inset-0 z-60 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-slate-900 rounded-3xl max-w-3xl w-full p-4 border border-slate-800 shadow-2xl flex flex-col space-y-3">
            <div className="flex items-center justify-between text-white px-2">
              <div className="flex items-center space-x-2">
                <Youtube className="w-5 h-5 text-red-500" />
                <h4 className="font-bold text-sm">
                  Hướng Dẫn Trích Xuất Sao Kê Từ Tài Khoản Ngân Hàng
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setShowVideoModal(false)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black border border-slate-800">
              <iframe
                src="https://www.youtube.com/embed/lBMk39wyZzU?autoplay=1"
                title="Hướng dẫn trích xuất sao kê ngân hàng"
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>

            <div className="flex items-center justify-between px-2 pt-1 text-xs text-slate-400">
              <span>
                Link video:{' '}
                <a
                  href={YOUTUBE_BANK_STATEMENT_GUIDE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:underline"
                >
                  {YOUTUBE_BANK_STATEMENT_GUIDE_URL}
                </a>
              </span>
              <a
                href={YOUTUBE_BANK_STATEMENT_GUIDE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-1 text-red-400 hover:text-red-300 font-bold"
              >
                <span>Xem trên YouTube</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

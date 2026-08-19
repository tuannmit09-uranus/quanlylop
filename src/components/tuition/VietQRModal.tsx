import React, { useState } from 'react';
import { TuitionItem } from '../../types';
import { useApp } from '../../context/AppContext';
import { formatVND, getVietQRUrl, removeVietnameseAccents } from '../../utils/vietqr';
import {
  QrCode,
  Copy,
  Check,
  Download,
  Building,
  CreditCard,
  User,
  Hash,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

interface VietQRModalProps {
  tuition: TuitionItem;
  onClose: () => void;
}

export const VietQRModal: React.FC<VietQRModalProps> = ({ tuition, onClose }) => {
  const { paymentAccount, updateTuitionStatus } = useApp();
  const [copiedMemo, setCopiedMemo] = useState(false);
  const [copiedAcc, setCopiedAcc] = useState(false);

  const qrImageUrl = getVietQRUrl(
    paymentAccount.bankCode,
    paymentAccount.accountNumber,
    tuition.totalAmount,
    tuition.paymentReference,
    paymentAccount.accountName
  );

  const copyToClipboard = (text: string, type: 'memo' | 'acc') => {
    navigator.clipboard.writeText(text);
    if (type === 'memo') {
      setCopiedMemo(true);
      setTimeout(() => setCopiedMemo(false), 2000);
    } else {
      setCopiedAcc(true);
      setTimeout(() => setCopiedAcc(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 relative max-h-[92vh] overflow-y-auto">
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 font-bold text-sm transition-colors"
        >
          ✕
        </button>

        {/* Header with NAPAS & VietQR styling */}
        <div className="text-center pt-2 pb-4">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold mb-2 border border-blue-200/60">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Chuẩn Thanh Toán Quốc Gia VietQR</span>
          </div>
          <h3 className="text-xl font-bold text-slate-900">
            QR Nộp Học Phí Tháng {tuition.periodMonth}/{tuition.periodYear}
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Học sinh: <strong className="text-slate-800">{tuition.studentName}</strong> • {tuition.className}
          </p>
        </div>

        {/* QR Code Canvas Card */}
        <div className="bg-gradient-to-b from-slate-50 to-blue-50/40 p-4 rounded-2xl border border-slate-200/80 flex flex-col items-center">
          <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-200/60 w-56 h-56 flex items-center justify-center overflow-hidden">
            <img
              src={qrImageUrl}
              alt="VietQR Code"
              className="w-full h-full object-contain"
              onError={(e) => {
                // Fallback SVG QR if offline or image error
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          </div>

          <div className="mt-3 text-center">
            <span className="text-2xl font-black text-blue-700 tracking-tight">
              {formatVND(tuition.totalAmount)}
            </span>
            <p className="text-[11px] text-slate-500 mt-0.5">
              (Số buổi tính phí: {tuition.sessionCount} buổi × {formatVND(tuition.feePerSession)}/buổi)
            </p>
          </div>
        </div>

        {/* Bank & Transfer Details Card */}
        <div className="mt-4 space-y-2.5 text-xs text-slate-700">
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200/70">
            <div className="flex items-center space-x-2 text-slate-500">
              <Building className="w-4 h-4 text-blue-600" />
              <span>Ngân hàng</span>
            </div>
            <span className="font-semibold text-slate-900">
              {paymentAccount.bankName} ({paymentAccount.bankCode})
            </span>
          </div>

          <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200/70">
            <div className="flex items-center space-x-2 text-slate-500">
              <User className="w-4 h-4 text-blue-600" />
              <span>Chủ tài khoản</span>
            </div>
            <span className="font-semibold text-slate-900 uppercase">
              {paymentAccount.accountName}
            </span>
          </div>

          <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200/70">
            <div className="flex items-center space-x-2 text-slate-500">
              <CreditCard className="w-4 h-4 text-blue-600" />
              <span>Số tài khoản</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="font-mono font-bold text-slate-900 text-sm">
                {paymentAccount.accountNumber}
              </span>
              <button
                type="button"
                onClick={() => copyToClipboard(paymentAccount.accountNumber, 'acc')}
                className="p-1 text-slate-400 hover:text-blue-600 rounded transition-colors"
                title="Sao chép số tài khoản"
              >
                {copiedAcc ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Transfer Memo (Critical BR-010) */}
          <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200">
            <div className="flex items-center justify-between text-amber-900 mb-1">
              <div className="flex items-center space-x-1.5 font-semibold">
                <Hash className="w-4 h-4 text-amber-700" />
                <span>Nội dung chuyển khoản chuẩn</span>
              </div>
              <span className="text-[10px] font-bold text-amber-700 uppercase px-1.5 py-0.5 bg-amber-100 rounded">
                Bắt buộc để đối soát
              </span>
            </div>
            <div className="flex items-center justify-between mt-1 bg-white p-2 rounded-lg border border-amber-200">
              <span className="font-mono font-black text-amber-950 text-sm tracking-wider select-all">
                {tuition.paymentReference}
              </span>
              <button
                type="button"
                onClick={() => copyToClipboard(tuition.paymentReference, 'memo')}
                className="inline-flex items-center space-x-1 px-2 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-md text-[11px] font-semibold transition-colors"
              >
                {copiedMemo ? (
                  <>
                    <Check className="w-3 h-3" />
                    <span>Đã chép</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Sao chép</span>
                  </>
                )}
              </button>
            </div>
            <p className="text-[10px] text-amber-800 mt-1.5">
              * Quy tắc sinh mã: <code>[Mã trường]_K[2 số cuối năm sinh]_[Tên]_[Tháng]_[Năm]</code>
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="mt-5 space-y-2">
          {tuition.status !== 'paid' ? (
            <button
              type="button"
              onClick={() => {
                updateTuitionStatus(tuition.id, 'paid');
                onClose();
              }}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold text-xs transition-colors shadow-xs flex items-center justify-center space-x-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Mô phỏng: Đánh dấu đã nộp học phí</span>
            </button>
          ) : (
            <div className="w-full py-2.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl font-semibold text-xs text-center flex items-center justify-center space-x-1.5">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>Khoản học phí này đã được đối soát thành công</span>
            </div>
          )}

          <button
            type="button"
            onClick={onClose}
            className="w-full py-2 text-slate-600 hover:text-slate-900 rounded-xl font-medium text-xs transition-colors"
          >
            Đóng cửa sổ
          </button>
        </div>
      </div>
    </div>
  );
};

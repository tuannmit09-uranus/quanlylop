import React, { useState, useEffect, useRef } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import QRCode from 'qrcode';
import { TuitionItem, ClassRoom } from '../../types';
import { useApp } from '../../context/AppContext';
import { numberToVietnameseWords } from '../../utils/vietnameseNumberToWords';
import {
  X,
  Download,
  FileText,
  Users,
  Eye,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Settings,
  Sparkles,
} from 'lucide-react';

interface TuitionPdfExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedMonth: number;
  selectedYear: number;
  initialClassId?: string;
}

export const TuitionPdfExportModal: React.FC<TuitionPdfExportModalProps> = ({
  isOpen,
  onClose,
  selectedMonth,
  selectedYear,
  initialClassId,
}) => {
  const {
    classes,
    tuitionItems,
    calculateTuitionForMonth,
    paymentAccount,
    currentTenant,
  } = useApp();

  // Selected Class
  const [selectedClassId, setSelectedClassId] = useState<string>(() => {
    if (initialClassId && initialClassId !== 'ALL') return initialClassId;
    return classes[0]?.id || '';
  });

  // Customizable fields
  const [teacherHeader, setTeacherHeader] = useState<string>(() => {
    return currentTenant?.teacherName || 'Cô Nga Lý';
  });
  const [portalUrl, setPortalUrl] = useState<string>('https://aquanlylop.vercel.app/');

  // Preview index among students in the selected class
  const [previewIndex, setPreviewIndex] = useState<number>(0);

  // QR Code base64 cache
  const [qrCodeMap, setQrCodeMap] = useState<Record<string, string>>({});
  const [portalQrCode, setPortalQrCode] = useState<string>('');

  // Generation status
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportProgress, setExportProgress] = useState<{ current: number; total: number }>({
    current: 0,
    total: 0,
  });
  const [isCalculating, setIsCalculating] = useState<boolean>(false);

  // Hidden print container ref
  const printContainerRef = useRef<HTMLDivElement>(null);

  // Target class object
  const currentClass = classes.find((c) => c.id === selectedClassId);

  // Students in this class who have tuition items for the selected month/year
  const classTuitions = tuitionItems
    .filter(
      (t) =>
        t.classId === selectedClassId &&
        t.periodMonth === selectedMonth &&
        t.periodYear === selectedYear
    )
    .sort((a, b) => a.studentName.localeCompare(b.studentName, 'vi'));

  // Month string padded (e.g., "09")
  const monthStr = String(selectedMonth).padStart(2, '0');
  const targetFileName = `Thong_bao_thu_tien_thang_${monthStr}.pdf`;

  // Update initial class when opened
  useEffect(() => {
    if (initialClassId && initialClassId !== 'ALL') {
      setSelectedClassId(initialClassId);
    } else if (classes.length > 0 && !classes.some((c) => c.id === selectedClassId)) {
      setSelectedClassId(classes[0].id);
    }
  }, [initialClassId, classes]);

  // Adjust preview index when class tuitions change
  useEffect(() => {
    if (previewIndex >= classTuitions.length) {
      setPreviewIndex(0);
    }
  }, [classTuitions.length, previewIndex]);

  // Generate bottom portal QR code
  useEffect(() => {
    QRCode.toDataURL(portalUrl || 'https://aquanlylop.vercel.app/', {
      margin: 0,
      width: 150,
      errorCorrectionLevel: 'M',
    })
      .then((url) => setPortalQrCode(url))
      .catch((err) => console.error('Failed to generate portal QR', err));
  }, [portalUrl]);

  // Helper to get or generate VietQR base64
  const getVietQRBase64 = async (tuition: TuitionItem): Promise<string> => {
    const bank = paymentAccount.bankCode || 'VCB';
    const acc = paymentAccount.accountNumber || '0123456789';
    const encodedDesc = encodeURIComponent(tuition.paymentReference || '');
    const encodedName = encodeURIComponent(paymentAccount.accountName || '');
    const vietQrUrl = `https://img.vietqr.io/image/${bank}-${acc}-qr_only.png?amount=${tuition.totalAmount}&addInfo=${encodedDesc}&accountName=${encodedName}`;

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 3500);
      const res = await fetch(vietQrUrl, { signal: controller.signal });
      clearTimeout(timeout);
      if (!res.ok) throw new Error('VietQR fetch failed');
      const blob = await res.blob();
      return await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
      });
    } catch {
      // Offline fallback: generate clean QR code using qrcode
      const payload = `STK:${acc}|NGAN_HANG:${bank}|SO_TIEN:${tuition.totalAmount}|NOI_DUNG:${tuition.paymentReference}`;
      return await QRCode.toDataURL(payload, {
        margin: 1,
        width: 300,
        errorCorrectionLevel: 'M',
      });
    }
  };

  // Pre-fetch QR codes for visible tuitions
  useEffect(() => {
    if (!isOpen || classTuitions.length === 0) return;

    let isMounted = true;
    const loadVisibleQrs = async () => {
      const toFetch = classTuitions.filter((t) => !qrCodeMap[t.id]);
      for (const t of toFetch) {
        if (!isMounted) break;
        try {
          const base64 = await getVietQRBase64(t);
          if (isMounted) {
            setQrCodeMap((prev) => ({ ...prev, [t.id]: base64 }));
          }
        } catch (e) {
          console.error(e);
        }
      }
    };

    loadVisibleQrs();
    return () => {
      isMounted = false;
    };
  }, [isOpen, classTuitions, paymentAccount]);

  // Trigger recalculate if 0 items exist
  const handleCalculateForClass = () => {
    if (!selectedClassId) return;
    setIsCalculating(true);
    if (calculateTuitionForMonth) {
      calculateTuitionForMonth(selectedMonth, selectedYear, selectedClassId);
    }
    setTimeout(() => {
      setIsCalculating(false);
    }, 400);
  };

  // Handle PDF Export
  const handleExportPDF = async () => {
    if (classTuitions.length === 0) return;

    setIsExporting(true);
    setExportProgress({ current: 0, total: classTuitions.length });

    try {
      const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
        compress: true,
      });

      // Prepare print container elements
      const printContainer = printContainerRef.current;
      if (!printContainer) {
        throw new Error('Print container not found');
      }

      // Ensure all QR codes are loaded
      const qrMapCopy = { ...qrCodeMap };
      for (let i = 0; i < classTuitions.length; i++) {
        const item = classTuitions[i];
        if (!qrMapCopy[item.id]) {
          qrMapCopy[item.id] = await getVietQRBase64(item);
        }
      }
      setQrCodeMap(qrMapCopy);

      // Render each page sequentially
      const pageElements = printContainer.children;
      for (let i = 0; i < classTuitions.length; i++) {
        setExportProgress({ current: i + 1, total: classTuitions.length });

        const pageElement = pageElements[i] as HTMLElement;
        if (!pageElement) continue;

        // html2canvas capture with crisp scale
        const canvas = await html2canvas(pageElement, {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff',
          windowWidth: 1123,
          windowHeight: 794,
        });

        const imgData = canvas.toDataURL('image/jpeg', 0.95);

        if (i > 0) {
          doc.addPage([297, 210], 'landscape');
        }

        // A4 Landscape is 297mm x 210mm
        doc.addImage(imgData, 'JPEG', 0, 0, 297, 210, undefined, 'FAST');
      }

      // Save PDF with exact requested name: Thong_bao_thu_tien_thang_XX.pdf
      doc.save(targetFileName);
      onClose();
    } catch (error) {
      console.error('Lỗi khi tạo file PDF:', error);
      alert('Có lỗi xảy ra khi tạo file PDF. Vui lòng thử lại!');
    } finally {
      setIsExporting(false);
    }
  };

  if (!isOpen) return null;

  const currentPreviewTuition = classTuitions[previewIndex];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl border border-slate-200 flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold border border-rose-100">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <span>Xuất Thông Báo Thu Tiền (PDF)</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 font-semibold">
                  1 Học sinh = 1 Trang PDF
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                Tháng {selectedMonth}/{selectedYear} • Tên file: <strong className="text-slate-700">{targetFileName}</strong>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isExporting}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1 text-xs">
          {/* Settings & Class Selection Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
            <div>
              <label className="block font-bold text-slate-700 mb-1.5">
                Chọn lớp học cần xuất:
              </label>
              <select
                value={selectedClassId}
                onChange={(e) => {
                  setSelectedClassId(e.target.value);
                  setPreviewIndex(0);
                }}
                disabled={isExporting}
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
              >
                {classes.map((cls) => (
                  <option key={cls.id} value={cls.id}>
                    {cls.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1.5">
                Tiêu đề người phụ trách / Giáo viên:
              </label>
              <input
                type="text"
                value={teacherHeader}
                onChange={(e) => setTeacherHeader(e.target.value)}
                disabled={isExporting}
                placeholder="Ví dụ: Cô Nga Lý"
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:ring-2 focus:ring-rose-500 focus:outline-hidden font-medium"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1.5">
                Địa chỉ cổng thanh toán:
              </label>
              <input
                type="text"
                value={portalUrl}
                onChange={(e) => setPortalUrl(e.target.value)}
                disabled={isExporting}
                placeholder="https://aquanlylop.vercel.app/"
                className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 focus:ring-2 focus:ring-rose-500 focus:outline-hidden font-mono"
              />
            </div>
          </div>

          {/* Status info */}
          <div className="flex flex-wrap items-center justify-between gap-2 px-1">
            <div className="flex items-center space-x-2 text-slate-600">
              <Users className="w-4 h-4 text-blue-600" />
              <span>
                Tổng số học sinh trong lớp: <strong>{classTuitions.length}</strong> ({classTuitions.length} trang PDF)
              </span>
            </div>

            {classTuitions.length === 0 && (
              <button
                type="button"
                onClick={handleCalculateForClass}
                disabled={isCalculating}
                className="px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 rounded-xl font-bold flex items-center space-x-1.5 transition-colors cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isCalculating ? 'Đang tính...' : 'Tính học phí lớp này'}</span>
              </button>
            )}
          </div>

          {/* Live Preview of 1 Student Page */}
          {classTuitions.length > 0 ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-700 flex items-center space-x-1.5">
                  <Eye className="w-4 h-4 text-slate-500" />
                  <span>Bản xem trước mẫu học phí: Trang {previewIndex + 1}/{classTuitions.length}</span>
                </span>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setPreviewIndex((prev) => Math.max(0, prev - 1))}
                    disabled={previewIndex === 0 || isExporting}
                    className="p-1 rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-30 cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="font-mono text-xs text-slate-600">
                    {previewIndex + 1} / {classTuitions.length}
                  </span>
                  <button
                    type="button"
                    onClick={() => setPreviewIndex((prev) => Math.min(classTuitions.length - 1, prev + 1))}
                    disabled={previewIndex >= classTuitions.length - 1 || isExporting}
                    className="p-1 rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-30 cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Simulated Paper Sheet (A4 Landscape aspect ratio 1.414 : 1) */}
              <div className="bg-slate-200/70 p-4 sm:p-6 rounded-2xl flex justify-center items-center overflow-x-auto">
                <div
                  className="bg-white shadow-xl rounded-sm border border-slate-200 text-slate-900 select-none"
                  style={{
                    width: '640px',
                    minHeight: '450px',
                    padding: '30px 45px',
                    fontFamily: "'Times New Roman', Times, serif",
                  }}
                >
                  {/* Top Row: Teacher name left, VietQR right */}
                  <div className="flex justify-between items-start">
                    <div className="text-base font-bold text-slate-900 pt-1">
                      {teacherHeader || 'Cô Nga Lý'}
                    </div>

                    <div className="flex flex-col items-center">
                      <div className="w-24 h-24 bg-white p-1 border border-slate-200 flex items-center justify-center">
                        {qrCodeMap[currentPreviewTuition.id] ? (
                          <img
                            src={qrCodeMap[currentPreviewTuition.id]}
                            alt="VietQR"
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <div className="flex flex-col items-center justify-center text-[9px] text-slate-400">
                            <Loader2 className="w-4 h-4 animate-spin text-slate-400 mb-1" />
                            <span>Đang tạo QR</span>
                          </div>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-700 text-center mt-1 leading-tight max-w-[150px]">
                        Sử dụng ứng dụng ngân hàng quét mã QR để
                        <br />
                        thanh toán
                      </div>
                    </div>
                  </div>

                  {/* Title */}
                  <div className="text-center mt-1">
                    <h4 className="text-lg font-bold tracking-wide uppercase text-slate-900">
                      THÔNG BÁO THU TIỀN
                    </h4>
                    <p className="text-xs text-slate-700 mt-0.5">
                      Đợt thu: Tháng {monthStr}/{selectedYear}
                    </p>
                  </div>

                  {/* Details Body */}
                  <div className="mt-4 space-y-1 text-xs text-slate-900 leading-relaxed">
                    <div>
                      Họ tên học sinh: <strong className="font-bold">{currentPreviewTuition.studentName}</strong>
                    </div>
                    <div>
                      Lớp: {currentPreviewTuition.className || currentClass?.name}
                    </div>
                    <div>Nội dung thu:</div>
                    <div className="pl-6 space-y-0.5">
                      <div>
                        <strong>Số buổi học:</strong> {currentPreviewTuition.sessionCount} buổi
                      </div>
                      <div>
                        <strong>Số tiền phải nộp:</strong>{' '}
                        {currentPreviewTuition.totalAmount.toLocaleString('vi-VN')} đ
                      </div>
                      <div>
                        Viết bằng chữ:{' '}
                        {numberToVietnameseWords(currentPreviewTuition.totalAmount)}
                      </div>
                    </div>
                    <div className="pt-0.5">
                      Hình thức thu: Tiền mặt/ Chuyển khoản
                    </div>
                  </div>

                  {/* Bottom portal QR & instructions */}
                  <div className="mt-6 flex items-center space-x-3">
                    <div className="w-12 h-12 bg-white p-0.5 border border-slate-300 shrink-0">
                      {portalQrCode && (
                        <img src={portalQrCode} alt="Portal QR" className="w-full h-full object-contain" />
                      )}
                    </div>
                    <div className="text-[10px] text-slate-700 leading-tight">
                      <div>Sử dụng camera quét mã QR hoặc</div>
                      <div>
                        truy cập{' '}
                        <span className="text-blue-900 underline font-mono">
                          {portalUrl}
                        </span>{' '}
                        để thanh toán
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-300 space-y-3">
              <AlertCircle className="w-8 h-8 text-amber-500 mx-auto" />
              <div>
                <p className="font-bold text-slate-800 text-sm">
                  Chưa có dữ liệu học phí cho lớp này trong Tháng {selectedMonth}/{selectedYear}
                </p>
                <p className="text-slate-500 mt-1">
                  Nhấn nút "Tính học phí lớp này" bên trên để hệ thống tự động tổng hợp số buổi học và học phí.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-slate-500">
            {isExporting ? (
              <span className="flex items-center text-rose-600 font-bold">
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Đang tạo file PDF: {exportProgress.current} / {exportProgress.total} trang...
              </span>
            ) : (
              <span>
                File sẽ gồm <strong>{classTuitions.length} trang</strong> (mỗi em 1 trang).
              </span>
            )}
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={isExporting}
              className="px-4 py-2 text-slate-600 hover:text-slate-800 font-medium text-xs rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Đóng
            </button>

            <button
              type="button"
              onClick={handleExportPDF}
              disabled={classTuitions.length === 0 || isExporting}
              className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-md transition-colors cursor-pointer flex items-center space-x-2"
            >
              {isExporting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Đang tải xuống...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Tải file PDF ({targetFileName})</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Hidden Offscreen Render Container for all student pages */}
      <div
        ref={printContainerRef}
        style={{
          position: 'fixed',
          left: '-99999px',
          top: '-99999px',
          width: '1123px', // Standard 297mm in pixels at 96 DPI
          pointerEvents: 'none',
        }}
      >
        {classTuitions.map((t) => (
          <div
            key={t.id}
            style={{
              width: '1123px',
              height: '794px', // Standard 210mm in pixels at 96 DPI
              backgroundColor: '#ffffff',
              padding: '60px 80px',
              fontFamily: "'Times New Roman', Times, serif",
              color: '#000000',
              boxSizing: 'border-box',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              {/* Top Row: Teacher Name Left, Bank QR Right */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div
                  style={{
                    fontSize: '22px',
                    fontWeight: 'bold',
                    color: '#000000',
                    paddingTop: '6px',
                  }}
                >
                  {teacherHeader || 'Cô Nga Lý'}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <div
                    style={{
                      width: '150px',
                      height: '150px',
                      backgroundColor: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {qrCodeMap[t.id] && (
                      <img
                        src={qrCodeMap[t.id]}
                        alt="VietQR"
                        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                      />
                    )}
                  </div>
                  <div
                    style={{
                      fontSize: '13px',
                      color: '#000000',
                      textAlign: 'center',
                      marginTop: '8px',
                      lineHeight: '1.3',
                      maxWidth: '220px',
                    }}
                  >
                    Sử dụng ứng dụng ngân hàng quét mã QR để
                    <br />
                    thanh toán
                  </div>
                </div>
              </div>

              {/* Center Title */}
              <div style={{ textAlign: 'center', marginTop: '10px' }}>
                <h1
                  style={{
                    fontSize: '24px',
                    fontWeight: 'bold',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    margin: 0,
                    color: '#000000',
                  }}
                >
                  THÔNG BÁO THU TIỀN
                </h1>
                <div
                  style={{
                    fontSize: '16px',
                    color: '#000000',
                    marginTop: '6px',
                  }}
                >
                  Đợt thu: Tháng {monthStr}/{selectedYear}
                </div>
              </div>

              {/* Student Tuition Details */}
              <div
                style={{
                  marginTop: '36px',
                  fontSize: '18px',
                  lineHeight: '1.9',
                  color: '#000000',
                }}
              >
                <div>
                  Họ tên học sinh: <strong style={{ fontWeight: 'bold' }}>{t.studentName}</strong>
                </div>
                <div>
                  Lớp: {t.className || currentClass?.name}
                </div>
                <div>Nội dung thu:</div>
                <div style={{ paddingLeft: '32px' }}>
                  <div>
                    <strong style={{ fontWeight: 'bold' }}>Số buổi học:</strong> {t.sessionCount} buổi
                  </div>
                  <div>
                    <strong style={{ fontWeight: 'bold' }}>Số tiền phải nộp:</strong>{' '}
                    {t.totalAmount.toLocaleString('vi-VN')} đ
                  </div>
                  <div>
                    Viết bằng chữ: {numberToVietnameseWords(t.totalAmount)}
                  </div>
                </div>
                <div style={{ marginTop: '4px' }}>
                  Hình thức thu: Tiền mặt/ Chuyển khoản
                </div>
              </div>
            </div>

            {/* Bottom Left Portal QR Code */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                marginBottom: '10px',
              }}
            >
              <div
                style={{
                  width: '74px',
                  height: '74px',
                  backgroundColor: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {portalQrCode && (
                  <img
                    src={portalQrCode}
                    alt="Portal QR"
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                  />
                )}
              </div>
              <div
                style={{
                  fontSize: '14px',
                  lineHeight: '1.4',
                  color: '#000000',
                }}
              >
                <div>Sử dụng camera quét mã QR hoặc</div>
                <div>
                  truy cập <span style={{ textDecoration: 'none' }}>{portalUrl}</span> để thanh toán
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

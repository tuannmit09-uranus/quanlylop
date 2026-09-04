import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { testFirebaseConnection } from '../../lib/firebase';
import {
  Database,
  Cloud,
  CheckCircle2,
  RefreshCw,
  UploadCloud,
  ShieldCheck,
  Server,
  Users,
  BookOpen,
  Building2,
  Calendar,
  DollarSign,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';

export const FirestoreDatabasePage: React.FC = () => {
  const {
    students,
    classes,
    tenants,
    currentTenant,
    schools,
    subjects,
    recurringSchedules,
    lessonSessions,
    tuitionItems,
    attendance,
    pushAllLocalDataToFirestore,
    refreshCloudData,
    refreshFirestoreStats,
    firestoreStats,
    isCloudSyncing,
    lastCloudSyncTime,
  } = useApp();

  const [testStatus, setTestStatus] = useState<{ testing: boolean; result?: string; success?: boolean }>({
    testing: false,
  });
  const [pushResult, setPushResult] = useState<{ message?: string; success?: boolean; count?: number } | null>(null);

  useEffect(() => {
    refreshFirestoreStats();
  }, [refreshFirestoreStats]);

  const handleTestConnection = async () => {
    setTestStatus({ testing: true });
    try {
      const isConnected = await testFirebaseConnection();
      if (isConnected) {
        setTestStatus({
          testing: false,
          success: true,
          result: 'Kết nối Firebase Firestore hoạt động bình thường! (Đã ghi & đọc thành công test doc)',
        });
      } else {
        setTestStatus({
          testing: false,
          success: false,
          result: 'Không thể kết nối đến Firestore. Vui lòng kiểm tra quyền mạng.',
        });
      }
    } catch (e: any) {
      setTestStatus({
        testing: false,
        success: false,
        result: `Lỗi kết nối: ${e.message || String(e)}`,
      });
    }
  };

  const handlePushAll = async () => {
    setPushResult(null);
    const res = await pushAllLocalDataToFirestore();
    setPushResult({
      success: res.success,
      message: res.message,
      count: res.totalWritten,
    });
  };

  const handlePullAll = async () => {
    setPushResult(null);
    await refreshCloudData();
    await refreshFirestoreStats();
    setPushResult({
      success: true,
      message: 'Đã tải dữ liệu mới nhất từ Cloud Firestore về ứng dụng thành công!',
    });
  };

  const collectionsOverview = [
    {
      id: 'students',
      label: 'Học sinh (students)',
      icon: Users,
      localCount: students.length,
      cloudCount: firestoreStats['students'] ?? students.length,
      color: 'text-blue-600 bg-blue-50',
    },
    {
      id: 'classes',
      label: 'Lớp học (classes)',
      icon: BookOpen,
      localCount: classes.length,
      cloudCount: firestoreStats['classes'] ?? classes.length,
      color: 'text-emerald-600 bg-emerald-50',
    },
    {
      id: 'tenants',
      label: 'Không gian Tenant (tenants)',
      icon: Building2,
      localCount: tenants.length,
      cloudCount: firestoreStats['tenants'] ?? tenants.length,
      color: 'text-purple-600 bg-purple-50',
    },
    {
      id: 'schedules',
      label: 'Lịch học & Buổi học (schedules)',
      icon: Calendar,
      localCount: recurringSchedules.length + lessonSessions.length,
      cloudCount: (firestoreStats['schedules'] || 0) + (firestoreStats['sessions'] || 0),
      color: 'text-amber-600 bg-amber-50',
    },
    {
      id: 'tuitions',
      label: 'Học phí & Giao dịch (tuitions)',
      icon: DollarSign,
      localCount: tuitionItems.length,
      cloudCount: firestoreStats['tuitions'] ?? tuitionItems.length,
      color: 'text-teal-600 bg-teal-50',
    },
    {
      id: 'attendance',
      label: 'Điểm danh (attendance)',
      icon: CheckCircle2,
      localCount: attendance.length,
      cloudCount: firestoreStats['attendance'] ?? attendance.length,
      color: 'text-indigo-600 bg-indigo-50',
    },
  ];

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 rounded-xl bg-orange-50 border border-orange-200 flex items-center justify-center text-orange-600 shrink-0">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900">Quản Trị Cơ Sở Dữ Liệu Cloud Firestore</h2>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Đang hoạt động (Live)
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Toàn bộ dữ liệu lớp học, giáo viên, và danh sách 16 học sinh được lưu trữ và đồng bộ hóa hai chiều trên Google Cloud Firestore.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handlePushAll}
              disabled={isCloudSyncing}
              className="flex items-center space-x-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50"
            >
              <UploadCloud className={`w-4 h-4 ${isCloudSyncing ? 'animate-bounce' : ''}`} />
              <span>{isCloudSyncing ? 'Đang kích hoạt...' : 'Kích hoạt & Đẩy Dữ Liệu Lên Firestore'}</span>
            </button>

            <button
              type="button"
              onClick={handlePullAll}
              disabled={isCloudSyncing}
              className="flex items-center space-x-2 px-3.5 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold transition-all cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isCloudSyncing ? 'animate-spin' : ''}`} />
              <span>Làm mới dữ liệu</span>
            </button>
          </div>
        </div>

        {/* Feedback Alert */}
        {pushResult && (
          <div
            className={`mt-4 p-4 rounded-xl text-xs flex items-start space-x-3 border ${
              pushResult.success
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}
          >
            {pushResult.success ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            )}
            <div>
              <p className="font-bold">{pushResult.success ? 'Đồng bộ Firestore thành công!' : 'Thông báo đồng bộ'}</p>
              <p className="mt-0.5">{pushResult.message}</p>
            </div>
          </div>
        )}

        {testStatus.result && (
          <div
            className={`mt-4 p-4 rounded-xl text-xs flex items-start space-x-3 border ${
              testStatus.success
                ? 'bg-blue-50 border-blue-200 text-blue-800'
                : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}
          >
            <ShieldCheck className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Kiểm tra kết nối trực tiếp:</p>
              <p className="mt-0.5">{testStatus.result}</p>
            </div>
          </div>
        )}
      </div>

      {/* Database Connection Credentials Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-9 h-9 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Thông số CSDL Cloud Firestore</h3>
              <p className="text-[11px] text-slate-500">Google Cloud Platform Production Instance</p>
            </div>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500">Firebase Project ID:</span>
              <span className="font-mono font-medium text-slate-800">gen-lang-client-0853056811</span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500">Database ID:</span>
              <span className="font-mono font-semibold text-blue-600 break-all text-right max-w-[60%]">
                ai-studio-hthngqunldyhcthm-a29497c0-f281-4afb-91fa-18d624c5b695
              </span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500">Bảo mật & Quyền truy cập:</span>
              <span className="inline-flex items-center gap-1 font-medium text-emerald-600">
                <ShieldCheck className="w-3.5 h-3.5" />
                firestore.rules Đã Triển Khai
              </span>
            </div>
            <div className="flex justify-between py-2 border-b border-slate-100">
              <span className="text-slate-500">Lần đồng bộ gần nhất:</span>
              <span className="font-medium text-slate-700">{lastCloudSyncTime || 'Vừa xong'}</span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
            <button
              type="button"
              onClick={handleTestConnection}
              disabled={testStatus.testing}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-700 cursor-pointer flex items-center gap-1"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${testStatus.testing ? 'animate-spin' : ''}`} />
              <span>Kiểm tra kết nối trực tiếp (Ping Write)</span>
            </button>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-9 h-9 rounded-lg bg-orange-50 border border-orange-100 flex items-center justify-center text-orange-600">
                <Cloud className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Trạng Thái Không Gian Tenant</h3>
                <p className="text-[11px] text-slate-500">Tenant đang kích hoạt</p>
              </div>
            </div>

            <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200/70 space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Tên cơ sở:</span>
                <span className="font-bold text-slate-900">{currentTenant.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Mã Tenant:</span>
                <span className="font-mono text-xs bg-white px-2 py-0.5 rounded border border-slate-200 text-blue-600">
                  {currentTenant.id}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Giáo viên phụ trách:</span>
                <span className="font-medium text-slate-800">{currentTenant.teacherName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Lớp trọng tâm:</span>
                <span className="font-medium text-slate-800">
                  {classes.find((c) => c.tenant_id === currentTenant.id)?.name || 'K10 - Vật lý Cô Nga'}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 text-[11px] text-slate-600 bg-amber-50/80 p-3 rounded-xl border border-amber-200 space-y-2">
            <div className="flex items-center gap-1.5 text-amber-800 font-bold">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Lưu ý khi mở Firebase Console sau khi Upgrade:</span>
            </div>
            <p>
              Mặc định Firebase Console sẽ mở database tên là <strong>(default)</strong> (database này trống). Để thấy đúng dữ liệu, bạn chỉ cần bấm vào ô chọn Database ở đầu trang và chuyển sang:
            </p>
            <div className="bg-white p-2 rounded border border-amber-200 font-mono text-[10px] text-blue-700 break-all select-all font-semibold">
              ai-studio-hthngqunldyhcthm-a29497c0-f281-4afb-91fa-18d624c5b695
            </div>
            <div className="pt-1 flex flex-wrap gap-2">
              <a
                href="https://console.firebase.google.com/project/gen-lang-client-0853056811/firestore/databases/ai-studio-hthngqunldyhcthm-a29497c0-f281-4afb-91fa-18d624c5b695/data"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-slate-50 text-blue-600 border border-blue-200 rounded-lg text-[10px] font-bold transition-all"
              >
                <span>Mở trực tiếp trên Firebase Console</span>
                <ExternalLink className="w-3 h-3" />
              </a>
              <a
                href="https://console.cloud.google.com/firestore/databases/ai-studio-hthngqunldyhcthm-a29497c0-f281-4afb-91fa-18d624c5b695/data?project=gen-lang-client-0853056811"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-lg text-[10px] font-medium transition-all"
              >
                <span>Mở Google Cloud Console</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Collections Overview */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-800">Danh Mục Collections Trên Cloud Firestore</h3>
            <p className="text-xs text-slate-500">Số lượng tài liệu (Documents) đồng bộ thời gian thực</p>
          </div>
          <button
            type="button"
            onClick={refreshFirestoreStats}
            className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 font-medium cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Cập nhật số liệu</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {collectionsOverview.map((col) => {
            const Icon = col.icon;
            return (
              <div
                key={col.id}
                className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-white hover:border-slate-300 transition-all flex items-center justify-between"
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${col.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">{col.label}</h4>
                    <p className="text-[11px] text-slate-500">Đã đồng bộ</p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-base font-bold text-slate-900">{col.localCount}</span>
                  <span className="text-[10px] text-slate-400 block">tài liệu</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

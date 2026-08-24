import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { AuditLog, UserRole } from '../../types';
import {
  ShieldAlert,
  ShieldCheck,
  Search,
  Filter,
  Download,
  Calendar,
  Clock,
  User,
  Layers,
  FileSpreadsheet,
  RefreshCw,
  Lock,
  Unlock,
  CheckCheck,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  ArrowRight,
  Sparkles,
  ChevronDown,
  Info,
  Hash,
  Eye,
  Plus,
  X,
  FileText,
  Building2,
  UserCheck,
  Crown,
  ArrowUpDown,
  ArrowDown,
  ArrowUp,
} from 'lucide-react';

// Robust helper to parse various date-time formats to epoch ms for exact sorting
export const parseLogTimestamp = (ts?: string, logId?: string): number => {
  if (!ts) {
    if (logId) {
      const matchId = logId.match(/(\d{10,13})/);
      if (matchId) return parseInt(matchId[1], 10);
    }
    return 0;
  }

  const str = ts.trim();

  // Try direct standard parse
  const direct = Date.parse(str);
  if (!isNaN(direct)) return direct;

  // Format: "YYYY-MM-DD HH:mm:ss" or "YYYY-MM-DD"
  const isoLike = str.match(/^(\d{4})[-\/](\d{1,2})[-\/](\d{1,2})(?:[ T]+(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?)?/);
  if (isoLike) {
    const y = parseInt(isoLike[1], 10);
    const m = parseInt(isoLike[2], 10) - 1;
    const d = parseInt(isoLike[3], 10);
    const hh = isoLike[4] ? parseInt(isoLike[4], 10) : 0;
    const mm = isoLike[5] ? parseInt(isoLike[5], 10) : 0;
    const ss = isoLike[6] ? parseInt(isoLike[6], 10) : 0;
    return new Date(y, m, d, hh, mm, ss).getTime();
  }

  // Format: "DD/MM/YYYY, HH:mm:ss" or "DD/MM/YYYY HH:mm:ss"
  const viDateFirst = str.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})(?:[,\s]+(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?)?/);
  if (viDateFirst) {
    const d = parseInt(viDateFirst[1], 10);
    const m = parseInt(viDateFirst[2], 10) - 1;
    const y = parseInt(viDateFirst[3], 10);
    const hh = viDateFirst[4] ? parseInt(viDateFirst[4], 10) : 0;
    const mm = viDateFirst[5] ? parseInt(viDateFirst[5], 10) : 0;
    const ss = viDateFirst[6] ? parseInt(viDateFirst[6], 10) : 0;
    return new Date(y, m, d, hh, mm, ss).getTime();
  }

  // Format: "HH:mm:ss DD/MM/YYYY" or "HH:mm:ss, DD/MM/YYYY"
  const viTimeFirst = str.match(/^(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?[,\s]+(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);
  if (viTimeFirst) {
    const hh = parseInt(viTimeFirst[1], 10);
    const mm = parseInt(viTimeFirst[2], 10);
    const ss = viTimeFirst[3] ? parseInt(viTimeFirst[3], 10) : 0;
    const d = parseInt(viTimeFirst[4], 10);
    const m = parseInt(viTimeFirst[5], 10) - 1;
    const y = parseInt(viTimeFirst[6], 10);
    return new Date(y, m, d, hh, mm, ss).getTime();
  }

  // Fallback check if logId has numeric timestamp
  if (logId) {
    const matchId = logId.match(/(\d{10,13})/);
    if (matchId) return parseInt(matchId[1], 10);
  }

  return 0;
};

export const AuditLogPage: React.FC = () => {
  const { auditLogs, currentTenant, currentRole, currentUser, tenants } = useApp();

  const isAdmin = currentUser?.role === 'admin' || currentRole === 'admin';

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTenantId, setSelectedTenantId] = useState<string>('ALL');
  const [selectedAction, setSelectedAction] = useState<string>('ALL');
  const [selectedEntityType, setSelectedEntityType] = useState<string>('ALL');
  const [selectedRole, setSelectedRole] = useState<string>('ALL');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [activeLogDetail, setActiveLogDetail] = useState<AuditLog | null>(null);

  // Map tenant ID to display name
  const getTenantInfo = (tenantId: string) => {
    const t = tenants.find((item) => item.id === tenantId);
    if (t) {
      return { name: t.name, teacher: t.teacherName };
    }
    return { name: tenantId, teacher: 'Không xác định' };
  };

  // Filter and Sort logs (Newest first by default)
  const filteredLogs = useMemo(() => {
    const filtered = auditLogs.filter((log) => {
      // Tenant filter (For Admin)
      const matchesTenant =
        selectedTenantId === 'ALL' || log.tenant_id === selectedTenantId;

      // Search term
      const matchesSearch =
        searchTerm === '' ||
        log.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.actorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.entityId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.entityType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.tenant_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (log.oldValue && log.oldValue.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (log.newValue && log.newValue.toLowerCase().includes(searchTerm.toLowerCase()));

      // Action
      const matchesAction = selectedAction === 'ALL' || log.action === selectedAction;

      // Entity
      const matchesEntity =
        selectedEntityType === 'ALL' || log.entityType === selectedEntityType;

      // Role
      const matchesRole = selectedRole === 'ALL' || log.actorRole === selectedRole;

      return matchesTenant && matchesSearch && matchesAction && matchesEntity && matchesRole;
    });

    // Sort by timestamp: Newest first (desc) or Oldest first (asc)
    return filtered.sort((a, b) => {
      const timeA = parseLogTimestamp(a.timestamp, a.id);
      const timeB = parseLogTimestamp(b.timestamp, b.id);
      return sortOrder === 'desc' ? timeB - timeA : timeA - timeB;
    });
  }, [auditLogs, selectedTenantId, searchTerm, selectedAction, selectedEntityType, selectedRole, sortOrder]);

  // Statistics
  const totalEvents = auditLogs.length;
  const tenantEvents = auditLogs.filter((l) => l.entityType === 'tenant' || l.action === 'create').length;
  const tuitionLocks = auditLogs.filter((l) => l.action === 'lock_tuition' || l.action === 'unlock_tuition').length;
  const reconciliationEvents = auditLogs.filter(
    (l) => l.action === 'reconcile_match' || l.action === 'manual_reconcile'
  ).length;
  const sessionChanges = auditLogs.filter(
    (l) => l.action === 'reschedule_session' || l.action === 'cancel_session'
  ).length;

  // Export CSV
  const handleExportCSV = () => {
    const headers =
      'ID,Mã Tenant,Tên Tenant,Thời gian,Người thực hiện,Vai trò,Hành động,Đối tượng,Mã đối tượng,Mô tả,Giá trị cũ,Giá trị mới\n';
    const rows = filteredLogs
      .map((l) => {
        const tInfo = getTenantInfo(l.tenant_id);
        return `"${l.id}","${l.tenant_id}","${tInfo.name.replace(/"/g, '""')}","${l.timestamp}","${l.actorName}","${l.actorRole}","${l.action}","${l.entityType}","${l.entityId}","${l.description.replace(/"/g, '""')}","${(l.oldValue || '').replace(/"/g, '""')}","${(l.newValue || '').replace(/"/g, '""')}"`;
      })
      .join('\n');
    const blob = new Blob(['\uFEFF' + headers + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Nhat_Ky_Audit_Log_${isAdmin ? 'Full_System' : currentTenant.id}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  // Helper function for action badge
  const renderActionBadge = (action: AuditLog['action'], entityType?: string) => {
    if (entityType === 'tenant' && action === 'create') {
      return (
        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-purple-50 text-purple-700 font-bold text-[11px] border border-purple-200">
          <Building2 className="w-3 h-3" />
          <span>Tạo Tenant mới</span>
        </span>
      );
    }

    switch (action) {
      case 'lock_tuition':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 font-bold text-[11px] border border-indigo-200">
            <Lock className="w-3 h-3" />
            <span>Chốt học phí</span>
          </span>
        );
      case 'unlock_tuition':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 font-bold text-[11px] border border-amber-200">
            <Unlock className="w-3 h-3" />
            <span>Mở khóa học phí</span>
          </span>
        );
      case 'reconcile_match':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[11px] border border-emerald-200">
            <CheckCheck className="w-3 h-3" />
            <span>Tự động đối soát</span>
          </span>
        );
      case 'manual_reconcile':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 font-bold text-[11px] border border-blue-200">
            <CheckCircle2 className="w-3 h-3" />
            <span>Khớp thủ công</span>
          </span>
        );
      case 'reschedule_session':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 font-bold text-[11px] border border-amber-200">
            <Clock className="w-3 h-3" />
            <span>Đổi lịch / Dạy bù</span>
          </span>
        );
      case 'cancel_session':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 font-bold text-[11px] border border-rose-200">
            <AlertCircle className="w-3 h-3" />
            <span>Hủy buổi học</span>
          </span>
        );
      case 'create':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[11px] border border-emerald-200">
            <Plus className="w-3 h-3" />
            <span>Tạo mới</span>
          </span>
        );
      case 'update':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 font-bold text-[11px] border border-blue-200">
            <RefreshCw className="w-3 h-3" />
            <span>Cập nhật</span>
          </span>
        );
      case 'delete':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 font-bold text-[11px] border border-rose-200">
            <AlertCircle className="w-3 h-3" />
            <span>Xóa</span>
          </span>
        );
      case 'activate_account':
      case 'issue_account':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-teal-50 text-teal-700 font-bold text-[11px] border border-teal-200">
            <UserCheck className="w-3 h-3" />
            <span>Kích hoạt tài khoản</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 font-bold text-[11px]">
            <span>{action}</span>
          </span>
        );
    }
  };

  // Helper for role badge
  const renderRoleBadge = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return (
          <span className="px-2 py-0.5 rounded-md bg-purple-100 text-purple-800 text-[10px] font-bold inline-flex items-center space-x-1">
            <Crown className="w-2.5 h-2.5 text-purple-700" />
            <span>Admin</span>
          </span>
        );
      case 'teacher':
        return (
          <span className="px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 text-[10px] font-bold">
            Giáo viên
          </span>
        );
      case 'parent':
        return (
          <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold">
            Phụ huynh
          </span>
        );
      case 'student':
        return (
          <span className="px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-800 text-[10px] font-bold">
            Học sinh
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-bold">
            Hệ thống
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold border border-indigo-200">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Nhật Ký Kiểm Toán & RLS Multi-Tenant</span>
            </div>
            {isAdmin ? (
              <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 text-xs font-bold border border-purple-200">
                <Crown className="w-3 h-3 text-purple-700" />
                <span>Quyền Admin: Xem Full Tất Cả Logs Toàn Hệ Thống ({tenants.length} Tenants)</span>
              </span>
            ) : (
              <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200">
                <Building2 className="w-3 h-3 text-slate-500" />
                <span>Tenant: {currentTenant.name}</span>
              </span>
            )}
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
            Nhật Ký Hoạt Động (Audit Logs)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {isAdmin
              ? 'Quyền Quản Trị Viên: Giám sát toàn vẹn tất cả sự kiện khởi tạo tenant giáo viên, chốt học phí, khớp sao kê VietQR và phân quyền người dùng trên toàn hệ thống.'
              : 'Lưu vết tự động toàn bộ thao tác chốt học phí, đối soát ngân hàng, đổi lịch học và điểm danh bảo đảm tính minh bạch & toàn vẹn dữ liệu.'}
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {/* Sort order toggle button */}
          <button
            type="button"
            onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
            title="Đổi chiều sắp xếp thời gian"
            className="inline-flex items-center space-x-2 px-3.5 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-colors shadow-2xs cursor-pointer"
          >
            {sortOrder === 'desc' ? (
              <>
                <ArrowDown className="w-4 h-4 text-blue-600" />
                <span>Mới nhất trước</span>
              </>
            ) : (
              <>
                <ArrowUp className="w-4 h-4 text-amber-600" />
                <span>Cũ nhất trước</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleExportCSV}
            className="inline-flex items-center space-x-2 px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-colors shadow-2xs cursor-pointer"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Xuất Nhật Ký (CSV)</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Tổng sự kiện ghi nhận</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-black text-slate-900">{totalEvents}</div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              {isAdmin ? `Toàn bộ ${tenants.length} Tenant hệ thống` : 'Tất cả hành động của Tenant'}
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">
              {isAdmin ? 'Quản trị Tenant & Tạo mới' : 'Chốt / Mở học phí'}
            </span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
              {isAdmin ? <Building2 className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-black text-purple-600">
              {isAdmin ? tenantEvents : tuitionLocks}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              {isAdmin ? 'Đăng ký & Cập nhật Tenant' : 'Bảo toàn số liệu kỳ học'}
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Khớp sao kê VietQR</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <CheckCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-black text-emerald-600">{reconciliationEvents}</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Tự động & Khớp thủ công</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Đổi lịch & Dạy bù</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-black text-amber-600">{sessionChanges}</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Cập nhật buổi học thực tế</div>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
        <div className={`grid grid-cols-1 sm:grid-cols-2 ${isAdmin ? 'lg:grid-cols-5' : 'lg:grid-cols-4'} gap-3`}>
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm kiếm mô tả, người thao tác, ID..."
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-hidden bg-slate-50/60"
            />
          </div>

          {/* Tenant Selector (Admin Only) */}
          {isAdmin && (
            <div>
              <select
                value={selectedTenantId}
                onChange={(e) => setSelectedTenantId(e.target.value)}
                className="w-full py-2 px-3 text-xs border border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 outline-hidden bg-purple-50/40 text-purple-900 font-semibold"
              >
                <option value="ALL">🌐 Tất cả Tenant ({tenants.length})</option>
                {tenants.map((t) => (
                  <option key={t.id} value={t.id}>
                    🏢 {t.name} ({t.teacherName})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Action Filter */}
          <div>
            <select
              value={selectedAction}
              onChange={(e) => setSelectedAction(e.target.value)}
              className="w-full py-2 px-3 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-hidden bg-slate-50/60 font-medium"
            >
              <option value="ALL">Tất cả hành động ({auditLogs.length})</option>
              <option value="create">Tạo mới (create / tenant / data)</option>
              <option value="update">Cập nhật dữ liệu (update)</option>
              <option value="delete">Xóa dữ liệu (delete)</option>
              <option value="lock_tuition">Chốt học phí (lock_tuition)</option>
              <option value="unlock_tuition">Mở khóa học phí (unlock_tuition)</option>
              <option value="reconcile_match">Tự động đối soát (reconcile_match)</option>
              <option value="manual_reconcile">Khớp thủ công (manual_reconcile)</option>
              <option value="reschedule_session">Đổi lịch / Dạy bù (reschedule_session)</option>
              <option value="cancel_session">Hủy buổi học (cancel_session)</option>
              <option value="activate_account">Kích hoạt tài khoản (activate_account)</option>
            </select>
          </div>

          {/* Entity Filter */}
          <div>
            <select
              value={selectedEntityType}
              onChange={(e) => setSelectedEntityType(e.target.value)}
              className="w-full py-2 px-3 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-hidden bg-slate-50/60 font-medium"
            >
              <option value="ALL">Tất cả đối tượng</option>
              <option value="tenant">Không gian Tenant (tenant)</option>
              <option value="tuition_period">Bảng học phí kỳ (tuition_period)</option>
              <option value="tuition_calculation">Tính toán học phí</option>
              <option value="bank_transaction">Giao dịch ngân hàng</option>
              <option value="lesson_session">Buổi học thực tế</option>
              <option value="attendance">Điểm danh</option>
              <option value="student_evaluation">Nhận xét & Điểm số</option>
              <option value="homework">Bài tập về nhà</option>
              <option value="homework_submission">Chấm bài tập</option>
              <option value="student">Hồ sơ học sinh</option>
              <option value="user_account">Tài khoản & Phân quyền</option>
            </select>
          </div>

          {/* Role Filter */}
          <div>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="w-full py-2 px-3 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-hidden bg-slate-50/60 font-medium"
            >
              <option value="ALL">Tất cả vai trò</option>
              <option value="admin">Quản Trị Viên (Admin)</option>
              <option value="teacher">Giáo viên (Teacher)</option>
              <option value="parent">Phụ huynh (Parent)</option>
              <option value="student">Học sinh (Student)</option>
            </select>
          </div>
        </div>

        {/* Active Filters Summary */}
        {(selectedTenantId !== 'ALL' || selectedAction !== 'ALL' || selectedEntityType !== 'ALL' || selectedRole !== 'ALL' || searchTerm !== '') && (
          <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100 text-slate-500">
            <span>
              Đang hiển thị <strong>{filteredLogs.length}</strong> / {auditLogs.length} bản ghi
              {selectedTenantId !== 'ALL' && ` • Tenant: ${getTenantInfo(selectedTenantId).name}`}
            </span>
            <button
              type="button"
              onClick={() => {
                setSelectedTenantId('ALL');
                setSelectedAction('ALL');
                setSelectedEntityType('ALL');
                setSelectedRole('ALL');
                setSearchTerm('');
              }}
              className="text-blue-600 hover:text-blue-800 font-semibold cursor-pointer"
            >
              Đặt lại bộ lọc
            </button>
          </div>
        )}
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">
                  <button
                    type="button"
                    onClick={() => setSortOrder((prev) => (prev === 'desc' ? 'asc' : 'desc'))}
                    className="inline-flex items-center space-x-1.5 hover:text-blue-600 font-bold uppercase tracking-wider cursor-pointer group transition-colors"
                    title={`Đang sắp xếp: ${sortOrder === 'desc' ? 'Mới nhất lên đầu' : 'Cũ nhất lên đầu'}. Nhấp để đổi`}
                  >
                    <span>Thời gian</span>
                    {sortOrder === 'desc' ? (
                      <span className="inline-flex items-center text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded text-[10px] lowercase font-semibold">
                        <ArrowDown className="w-3 h-3 mr-0.5" /> mới nhất
                      </span>
                    ) : (
                      <span className="inline-flex items-center text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded text-[10px] lowercase font-semibold">
                        <ArrowUp className="w-3 h-3 mr-0.5" /> cũ nhất
                      </span>
                    )}
                  </button>
                </th>
                {isAdmin && <th className="py-3 px-4">Tenant / Không Gian</th>}
                <th className="py-3 px-4">Người thao tác</th>
                <th className="py-3 px-4">Hành động</th>
                <th className="py-3 px-4">Đối tượng</th>
                <th className="py-3 px-4">Mô tả chi tiết</th>
                <th className="py-3 px-4">Thay đổi dữ liệu</th>
                <th className="py-3 px-4 text-center">Chi tiết</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={isAdmin ? 8 : 7} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <ShieldCheck className="w-8 h-8 text-slate-300" />
                      <p className="text-sm font-semibold text-slate-600">
                        Không tìm thấy nhật ký phù hợp với bộ lọc
                      </p>
                      <p className="text-xs text-slate-400">
                        Thử điều chỉnh từ khóa tìm kiếm hoặc chọn "Tất cả hành động".
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => {
                  const tInfo = getTenantInfo(log.tenant_id);
                  const isTenantEntity = log.entityType === 'tenant';

                  return (
                    <tr
                      key={log.id}
                      onClick={() => setActiveLogDetail(log)}
                      className={`hover:bg-blue-50/40 transition-colors cursor-pointer group ${
                        isTenantEntity ? 'bg-purple-50/20' : ''
                      }`}
                    >
                      {/* Timestamp */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-slate-500 text-[11px] font-mono">
                        <div className="flex items-center space-x-1.5">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>{log.timestamp}</span>
                        </div>
                      </td>

                      {/* Tenant Column (Admin Only) */}
                      {isAdmin && (
                        <td className="py-3.5 px-4 whitespace-nowrap">
                          <div className="flex items-center space-x-1.5">
                            <Building2 className={`w-3.5 h-3.5 ${isTenantEntity ? 'text-purple-600' : 'text-slate-400'}`} />
                            <div>
                              <div className="font-bold text-slate-900 text-xs truncate max-w-[150px]" title={tInfo.name}>
                                {tInfo.name}
                              </div>
                              <div className="text-[10px] text-slate-400 font-mono truncate max-w-[120px]">
                                {log.tenant_id}
                              </div>
                            </div>
                          </div>
                        </td>
                      )}

                      {/* Actor */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <div className="font-bold text-slate-900 text-xs">
                            {log.actorName}
                          </div>
                          {renderRoleBadge(log.actorRole)}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          ID: {log.actorId}
                        </div>
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {renderActionBadge(log.action, log.entityType)}
                      </td>

                      {/* Entity */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded-lg font-mono text-[10px] font-bold border ${
                          isTenantEntity
                            ? 'bg-purple-50 text-purple-700 border-purple-200'
                            : 'bg-slate-100 text-slate-700 border-slate-200'
                        }`}>
                          {log.entityType}
                        </span>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5 truncate max-w-[120px]">
                          {log.entityId}
                        </div>
                      </td>

                      {/* Description */}
                      <td className="py-3.5 px-4 text-slate-800 font-semibold max-w-sm">
                        <p className={`leading-snug ${isTenantEntity ? 'text-purple-950 font-bold' : ''}`}>
                          {log.description}
                        </p>
                      </td>

                      {/* Data Diff */}
                      <td className="py-3.5 px-4">
                        {log.oldValue || log.newValue ? (
                          <div className="text-[11px] space-y-1">
                            {log.oldValue && (
                              <div className="text-red-700 bg-red-50/70 px-2 py-0.5 rounded-md font-mono line-through text-[10px] truncate max-w-[180px]">
                                {log.oldValue}
                              </div>
                            )}
                            {log.newValue && (
                              <div className="text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md font-mono text-[10px] font-bold truncate max-w-[180px]">
                                {log.newValue}
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400 text-[10px] italic">Không có diff</span>
                        )}
                      </td>

                      {/* Verification / Detail */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold group-hover:bg-blue-600 group-hover:text-white transition-colors">
                          <Eye className="w-3 h-3" />
                          <span>Chi tiết</span>
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Info */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>
              {isAdmin
                ? 'Toàn bộ sự kiện kiểm toán hệ thống được ghi nhận bất biến (Append-Only) phục vụ quản trị và kiểm tra đối soát chéo.'
                : 'Nhật ký được bảo vệ chống sửa đổi (Append-Only Audit Log) cho mục đích thanh tra & đối soát kế toán.'}
            </span>
          </div>
          <div>
            Tổng số: <strong>{filteredLogs.length}</strong> / {auditLogs.length} bản ghi
          </div>
        </div>
      </div>

      {/* Log Detail Modal */}
      {activeLogDetail && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    Chi Tiết Bản Ghi Kiểm Toán #{activeLogDetail.id}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Thời gian: {activeLogDetail.timestamp}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActiveLogDetail(null)}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
                <div>
                  <span className="text-slate-400 block text-[11px]">Tenant / Không gian:</span>
                  <span className="font-bold text-slate-900">
                    {getTenantInfo(activeLogDetail.tenant_id).name}
                  </span>{' '}
                  <span className="text-slate-500 font-mono">({activeLogDetail.tenant_id})</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Người thực hiện:</span>
                  <span className="font-bold text-slate-900">{activeLogDetail.actorName}</span>{' '}
                  <span className="text-slate-500 font-mono">({activeLogDetail.actorId})</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Vai trò & Quyền:</span>
                  {renderRoleBadge(activeLogDetail.actorRole)}
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Hành động:</span>
                  {renderActionBadge(activeLogDetail.action, activeLogDetail.entityType)}
                </div>
                <div className="col-span-2">
                  <span className="text-slate-400 block text-[11px]">Đối tượng tác động:</span>
                  <span className="font-mono font-bold text-blue-700">{activeLogDetail.entityType}</span> • ID: <span className="font-mono">{activeLogDetail.entityId}</span>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Nội dung thay đổi:</label>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium leading-relaxed">
                  {activeLogDetail.description}
                </div>
              </div>

              {(activeLogDetail.oldValue || activeLogDetail.newValue) && (
                <div>
                  <label className="font-bold text-slate-700 block mb-1">So sánh dữ liệu (Diff):</label>
                  <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
                    <div className="p-3 bg-red-50/70 border border-red-200 rounded-xl text-red-900">
                      <div className="text-[10px] uppercase font-bold text-red-600 mb-1">Dữ liệu cũ:</div>
                      {activeLogDetail.oldValue || '(Trống)'}
                    </div>
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900">
                      <div className="text-[10px] uppercase font-bold text-emerald-600 mb-1">Dữ liệu mới:</div>
                      {activeLogDetail.newValue || '(Trống)'}
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="font-bold text-slate-700 block mb-1">Dữ liệu định dạng JSON gốc:</label>
                <pre className="p-3 bg-slate-900 text-slate-200 font-mono text-[10px] rounded-xl overflow-x-auto max-h-48">
                  {JSON.stringify(activeLogDetail, null, 2)}
                </pre>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setActiveLogDetail(null)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Đóng chi tiết
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


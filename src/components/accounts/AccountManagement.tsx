import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AccountStatus, Student, Parent, AccountInvitation } from '../../types';
import {
  Users,
  GraduationCap,
  Sparkles,
  KeyRound,
  ShieldCheck,
  ShieldAlert,
  Search,
  Filter,
  Copy,
  Check,
  Send,
  RefreshCw,
  Trash2,
  Lock,
  Unlock,
  Layers,
  Phone,
  Mail,
  UserCheck,
  UserPlus,
  AlertCircle,
  ExternalLink,
  QrCode,
  Star,
  CheckCircle2,
  Clock,
  ChevronRight,
  Eye,
} from 'lucide-react';
import { BulkAccountInviteModal } from './BulkAccountInviteModal';
import { LinkParentModal } from './LinkParentModal';
import { StudentProfileDrawer } from '../students/StudentProfileDrawer';

export const AccountManagement: React.FC = () => {
  const {
    students,
    parents,
    parentStudents,
    accountInvitations,
    classes,
    issueStudentInvitation,
    issueParentInvitation,
    resendInvitation,
    revokeInvitation,
    toggleUserLock,
    getStudentParents,
    getParentStudents,
    getStudentInvitation,
    getParentInvitation,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'all' | 'students' | 'parents' | 'invitations' | 'relations'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClassId, setSelectedClassId] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Modals state
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [selectedStudentForParentModal, setSelectedStudentForParentModal] = useState<Student | null>(null);
  const [inspectStudent, setInspectStudent] = useState<Student | null>(null);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleCopyActivationLink = (token: string, name?: string) => {
    const url = `${window.location.origin}${window.location.pathname}?activate_token=${token}`;
    navigator.clipboard.writeText(url);
    setCopiedToken(token);
    showToast(`Đã sao chép link kích hoạt của ${name || 'tài khoản'}!`);
    setTimeout(() => setCopiedToken(null), 2500);
  };

  // KPIs
  const activeStudentAccounts = students.filter((s) => s.accountStatus === 'active').length;
  const invitedStudentAccounts = students.filter((s) => s.accountStatus === 'invited').length;
  const uninvitedStudentAccounts = students.filter((s) => !s.accountStatus || s.accountStatus === 'uninvited').length;
  const lockedStudentAccounts = students.filter((s) => s.accountStatus === 'locked').length;

  const activeParentAccounts = parents.filter((p) => p.accountStatus === 'active').length;
  const invitedParentAccounts = parents.filter((p) => p.accountStatus === 'invited').length;
  const uninvitedParentAccounts = parents.filter((p) => !p.accountStatus || p.accountStatus === 'uninvited').length;
  const lockedParentAccounts = parents.filter((p) => p.accountStatus === 'locked').length;

  const pendingInvitations = accountInvitations.filter((inv) => {
    const isNotExpired = new Date(inv.expires_at).getTime() > Date.now();
    return inv.status === 'pending' && isNotExpired;
  });

  const expiredInvitations = accountInvitations.filter((inv) => {
    const isExpired = new Date(inv.expires_at).getTime() <= Date.now();
    return inv.status === 'expired' || (inv.status === 'pending' && isExpired);
  });

  // Filtered Students
  const filteredStudents = students.filter((s) => {
    if (selectedClassId !== 'all' && !s.enrolledClassIds.includes(selectedClassId)) {
      return false;
    }
    if (selectedStatus !== 'all') {
      const status = s.accountStatus || 'uninvited';
      if (status !== selectedStatus) return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = s.fullName.toLowerCase().includes(q);
      const matchCode = s.schoolCode.toLowerCase().includes(q);
      const matchPhone = s.phone.toLowerCase().includes(q);
      const matchParent = s.parentName.toLowerCase().includes(q);
      if (!matchName && !matchCode && !matchPhone && !matchParent) return false;
    }
    return true;
  });

  // Filtered Parents
  const filteredParents = parents.filter((p) => {
    if (selectedStatus !== 'all') {
      const status = p.accountStatus || 'uninvited';
      if (status !== selectedStatus) return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = p.fullName.toLowerCase().includes(q);
      const matchPhone = p.phone.toLowerCase().includes(q);
      const matchEmail = (p.email || '').toLowerCase().includes(q);
      if (!matchName && !matchPhone && !matchEmail) return false;
    }
    return true;
  });

  const getRelationshipLabel = (rel: string) => {
    switch (rel) {
      case 'father':
        return 'Bố / Ba';
      case 'mother':
        return 'Mẹ';
      case 'guardian':
        return 'Người giám hộ';
      default:
        return 'Người thân';
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-150">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-xl border border-slate-700 flex items-center space-x-2.5 text-xs font-bold animate-in slide-in-from-bottom-5">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Banner & Header */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-indigo-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-semibold text-blue-100">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
              <span>Multi-Tenant RLS & Bảo mật mật khẩu giáo viên</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Quản lý & Cấp tài khoản Phụ huynh / Học sinh
            </h1>
            <p className="text-sm text-blue-100/90 leading-relaxed">
              Giáo viên chủ động cấp quyền truy cập qua lời mời kích hoạt bảo mật (thời hạn 7 ngày). Phụ huynh và học sinh tự đặt mật khẩu riêng, tuyệt đối không cho phép đăng ký tự do.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setShowBulkModal(true)}
              className="px-5 py-3.5 bg-white hover:bg-blue-50 text-blue-900 rounded-2xl font-bold text-xs transition-all shadow-lg hover:shadow-xl flex items-center space-x-2 active:scale-98"
            >
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span>Cấp tài khoản hàng loạt cho HS</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Học sinh */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Tài khoản Học sinh
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <GraduationCap className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-black text-slate-900">
              {activeStudentAccounts}
            </span>
            <span className="text-xs text-slate-400 font-semibold">
              / {students.length} học sinh
            </span>
          </div>
          <div className="flex items-center gap-2 pt-1 border-t border-slate-100 text-[11px]">
            <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md">
              {activeStudentAccounts} kích hoạt
            </span>
            <span className="text-sky-700 font-bold bg-sky-50 px-2 py-0.5 rounded-md">
              {invitedStudentAccounts} chờ kích hoạt
            </span>
            {lockedStudentAccounts > 0 && (
              <span className="text-rose-700 font-bold bg-rose-50 px-2 py-0.5 rounded-md">
                {lockedStudentAccounts} khóa
              </span>
            )}
          </div>
        </div>

        {/* Card 2: Phụ huynh */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Tài khoản Phụ huynh
            </span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-black text-slate-900">
              {activeParentAccounts}
            </span>
            <span className="text-xs text-slate-400 font-semibold">
              / {parents.length} phụ huynh
            </span>
          </div>
          <div className="flex items-center gap-2 pt-1 border-t border-slate-100 text-[11px]">
            <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md">
              {activeParentAccounts} kích hoạt
            </span>
            <span className="text-sky-700 font-bold bg-sky-50 px-2 py-0.5 rounded-md">
              {invitedParentAccounts} chờ kích hoạt
            </span>
            {lockedParentAccounts > 0 && (
              <span className="text-rose-700 font-bold bg-rose-50 px-2 py-0.5 rounded-md">
                {lockedParentAccounts} khóa
              </span>
            )}
          </div>
        </div>

        {/* Card 3: Lời mời đang hiệu lực */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Lời mời đang hiệu lực
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-black text-emerald-600">
              {pendingInvitations.length}
            </span>
            <span className="text-xs text-slate-400 font-semibold">
              đang chờ kích hoạt
            </span>
          </div>
          <p className="text-[11px] text-slate-500 pt-1 border-t border-slate-100 truncate">
            Hiệu lực 7 ngày kể từ khi tạo
          </p>
        </div>

        {/* Card 4: Lời mời hết hạn */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Hết hạn / Cần gửi lại
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <RefreshCw className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-black text-amber-600">
              {expiredInvitations.length}
            </span>
            <span className="text-xs text-slate-400 font-semibold">
              lời mời quá hạn
            </span>
          </div>
          <p className="text-[11px] text-slate-500 pt-1 border-t border-slate-100 truncate">
            Bấm "Gửi lại" để gia hạn thêm 7 ngày
          </p>
        </div>
      </div>

      {/* Main Container */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Navigation Tabs */}
        <div className="border-b border-slate-200 bg-slate-50/50 p-2 sm:p-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-1 bg-slate-200/70 p-1 rounded-2xl text-xs font-bold">
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={`px-3.5 py-2 rounded-xl transition-all ${
                activeTab === 'all'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Tất cả tài khoản ({students.length + parents.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('students')}
              className={`px-3.5 py-2 rounded-xl transition-all flex items-center space-x-1.5 ${
                activeTab === 'students'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Học sinh ({students.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('parents')}
              className={`px-3.5 py-2 rounded-xl transition-all flex items-center space-x-1.5 ${
                activeTab === 'parents'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Phụ huynh ({parents.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('invitations')}
              className={`px-3.5 py-2 rounded-xl transition-all flex items-center space-x-1.5 ${
                activeTab === 'invitations'
                  ? 'bg-white text-emerald-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Lời mời chờ ({pendingInvitations.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('relations')}
              className={`px-3.5 py-2 rounded-xl transition-all flex items-center space-x-1.5 ${
                activeTab === 'relations'
                  ? 'bg-white text-purple-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Quan hệ PH - HS ({parentStudents.length})</span>
            </button>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="p-4 sm:p-5 border-b border-slate-100 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm theo họ tên, SĐT, mã học sinh..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium text-slate-900 placeholder-slate-400 focus:bg-white focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {activeTab !== 'parents' && (
              <div className="flex items-center space-x-1.5">
                <span className="text-xs font-semibold text-slate-500">Lớp:</span>
                <select
                  value={selectedClassId}
                  onChange={(e) => setSelectedClassId(e.target.value)}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Tất cả lớp học</option>
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex items-center space-x-1.5">
              <span className="text-xs font-semibold text-slate-500">Trạng thái:</span>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="active">Đã kích hoạt</option>
                <option value="invited">Đã gửi lời mời</option>
                <option value="uninvited">Chưa cấp tài khoản</option>
                <option value="locked">Đang bị khóa</option>
              </select>
            </div>
          </div>
        </div>

        {/* TAB: ALL OR STUDENTS */}
        {(activeTab === 'all' || activeTab === 'students') && (
          <div className="p-4 sm:p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center space-x-2">
                <GraduationCap className="w-4 h-4 text-blue-600" />
                <span>Danh sách Tài khoản Học sinh ({filteredStudents.length})</span>
              </h3>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                    <th className="py-3 px-4">Học sinh & Trường</th>
                    <th className="py-3 px-4">Thông tin liên hệ</th>
                    <th className="py-3 px-4">Phụ huynh liên kết</th>
                    <th className="py-3 px-4">Trạng thái tài khoản</th>
                    <th className="py-3 px-4">Lời mời / Token</th>
                    <th className="py-3 px-4 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {filteredStudents.map((student) => {
                    const status = student.accountStatus || 'uninvited';
                    const invitation = getStudentInvitation(student.id);
                    const linkedParents = getStudentParents(student.id);
                    const isCopied = invitation && copiedToken === invitation.token;

                    return (
                      <tr key={student.id} className="hover:bg-blue-50/30 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0">
                              {student.fullName.charAt(0)}
                            </div>
                            <div>
                              <div className="flex items-center space-x-1.5">
                                <span className="font-bold text-slate-900 text-sm">
                                  {student.fullName}
                                </span>
                                <span className="px-1.5 py-0.2 rounded-md text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                                  {student.schoolCode}
                                </span>
                              </div>
                              <span className="text-[11px] text-slate-500 block">
                                {student.schoolName} • {student.schoolGrade}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="space-y-0.5">
                            <div className="flex items-center space-x-1 text-slate-700">
                              <Phone className="w-3 h-3 text-slate-400" />
                              <span>{student.phone || 'Chưa có'}</span>
                            </div>
                            {student.email && (
                              <div className="flex items-center space-x-1 text-slate-500 text-[11px]">
                                <Mail className="w-3 h-3 text-slate-400" />
                                <span>{student.email}</span>
                              </div>
                            )}
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="space-y-1">
                            {linkedParents.map((lp) => (
                              <div
                                key={lp.parent.id}
                                className="flex items-center space-x-1.5 text-xs bg-slate-50 px-2 py-1 rounded-lg border border-slate-200/80"
                              >
                                <span className="font-bold text-slate-800">
                                  {lp.parent.fullName}
                                </span>
                                <span className="text-[10px] text-slate-500">
                                  ({getRelationshipLabel(lp.relationship)})
                                </span>
                                {lp.is_primary && (
                                  <Star className="w-3 h-3 text-amber-500 fill-amber-500 shrink-0" />
                                )}
                              </div>
                            ))}
                            <button
                              type="button"
                              onClick={() => setSelectedStudentForParentModal(student)}
                              className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center space-x-1"
                            >
                              <UserPlus className="w-3 h-3" />
                              <span>+ Thêm PH</span>
                            </button>
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          {status === 'active' ? (
                            <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Đã kích hoạt</span>
                            </span>
                          ) : status === 'invited' ? (
                            <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold bg-sky-100 text-sky-800 border border-sky-200">
                              <Clock className="w-3 h-3" />
                              <span>Đã gửi lời mời</span>
                            </span>
                          ) : status === 'locked' ? (
                            <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">
                              <Lock className="w-3 h-3" />
                              <span>Đã bị khóa</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                              <span>Chưa cấp</span>
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-4">
                          {invitation ? (
                            <div className="space-y-1">
                              <div className="flex items-center space-x-1">
                                <span className="font-mono text-[11px] font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                                  {invitation.token}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleCopyActivationLink(invitation.token, student.fullName)}
                                  className="p-1 text-slate-400 hover:text-blue-600 transition-colors"
                                  title="Sao chép liên kết kích hoạt"
                                >
                                  {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                                </button>
                              </div>
                              <span className="text-[10px] text-slate-500 block">
                                Hết hạn: {new Date(invitation.expires_at).toLocaleDateString('vi-VN')}
                              </span>
                            </div>
                          ) : (
                            <span className="text-[11px] text-slate-400">---</span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end space-x-1.5">
                            {status === 'uninvited' && (
                              <button
                                type="button"
                                onClick={() => {
                                  const inv = issueStudentInvitation(student.id);
                                  if (inv.token) {
                                    handleCopyActivationLink(inv.token, student.fullName);
                                  }
                                }}
                                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all flex items-center space-x-1 shadow-xs"
                              >
                                <Send className="w-3 h-3" />
                                <span>Cấp tài khoản</span>
                              </button>
                            )}

                            {status === 'invited' && invitation && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleCopyActivationLink(invitation.token, student.fullName)}
                                  className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center space-x-1"
                                >
                                  <Copy className="w-3 h-3" />
                                  <span>Sao chép link</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const res = resendInvitation(invitation.id);
                                    if (res.token) {
                                      handleCopyActivationLink(res.token, student.fullName);
                                    }
                                    showToast(`Đã gia hạn lời mời thêm 7 ngày cho ${student.fullName}`);
                                  }}
                                  className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors"
                                  title="Gửi lại / Gia hạn 7 ngày"
                                >
                                  <RefreshCw className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (confirm(`Bạn có chắc chắn muốn thu hồi lời mời của học sinh ${student.fullName}?`)) {
                                      revokeInvitation(invitation.id);
                                      showToast(`Đã thu hồi lời mời của ${student.fullName}`);
                                    }
                                  }}
                                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                  title="Thu hồi lời mời"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </>
                            )}

                            {status === 'active' && student.user_id && (
                              <button
                                type="button"
                                onClick={() => {
                                  toggleUserLock(student.user_id!);
                                  showToast(`Đã khóa tài khoản của ${student.fullName}`);
                                }}
                                className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold transition-all flex items-center space-x-1 border border-rose-200"
                              >
                                <Lock className="w-3 h-3" />
                                <span>Khóa</span>
                              </button>
                            )}

                            {status === 'locked' && student.user_id && (
                              <button
                                type="button"
                                onClick={() => {
                                  toggleUserLock(student.user_id!);
                                  showToast(`Đã mở khóa tài khoản cho ${student.fullName}`);
                                }}
                                className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl text-xs font-bold transition-all flex items-center space-x-1 border border-emerald-200"
                              >
                                <Unlock className="w-3 h-3" />
                                <span>Mở khóa</span>
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => setInspectStudent(student)}
                              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                              title="Xem chi tiết học sinh"
                            >
                              <ChevronRight className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {filteredStudents.length === 0 && (
                <div className="py-12 text-center text-xs text-slate-400">
                  Không tìm thấy học sinh nào phù hợp với bộ lọc hiện tại.
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB: PARENTS */}
        {(activeTab === 'all' || activeTab === 'parents') && (
          <div className="p-4 sm:p-6 space-y-4 border-t border-slate-200 bg-slate-50/30">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center space-x-2">
                <Users className="w-4 h-4 text-indigo-600" />
                <span>Danh sách Tài khoản Phụ huynh ({filteredParents.length})</span>
              </h3>
            </div>

            <div className="overflow-x-auto bg-white rounded-2xl border border-slate-200">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                    <th className="py-3 px-4">Họ và tên Phụ huynh</th>
                    <th className="py-3 px-4">Số điện thoại & Email</th>
                    <th className="py-3 px-4">Học sinh liên kết (Con cái)</th>
                    <th className="py-3 px-4">Trạng thái tài khoản</th>
                    <th className="py-3 px-4">Lời mời / Token</th>
                    <th className="py-3 px-4 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {filteredParents.map((parent) => {
                    const status = parent.accountStatus || 'uninvited';
                    const invitation = getParentInvitation(parent.id);
                    const linkedStudents = getParentStudents(parent.id);
                    const isCopied = invitation && copiedToken === invitation.token;

                    return (
                      <tr key={parent.id} className="hover:bg-indigo-50/30 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center shrink-0">
                              {parent.fullName.charAt(0)}
                            </div>
                            <div>
                              <span className="font-bold text-slate-900 text-sm block">
                                {parent.fullName}
                              </span>
                              <span className="text-[11px] text-slate-400">
                                Mã: {parent.id}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="space-y-0.5">
                            <div className="flex items-center space-x-1 text-slate-700 font-semibold">
                              <Phone className="w-3 h-3 text-slate-400" />
                              <span>{parent.phone}</span>
                            </div>
                            {parent.email && (
                              <div className="flex items-center space-x-1 text-slate-500 text-[11px]">
                                <Mail className="w-3 h-3 text-slate-400" />
                                <span>{parent.email}</span>
                              </div>
                            )}
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="flex flex-wrap gap-1.5">
                            {linkedStudents.map((ls) => (
                              <span
                                key={ls.student.id}
                                className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 text-xs font-semibold border border-slate-200"
                              >
                                <span>{ls.student.fullName}</span>
                                <span className="text-[10px] text-slate-500">
                                  ({getRelationshipLabel(ls.relationship)})
                                </span>
                                {ls.is_primary && (
                                  <Star className="w-3 h-3 text-amber-500 fill-amber-500 shrink-0" />
                                )}
                              </span>
                            ))}
                            {linkedStudents.length === 0 && (
                              <span className="text-xs text-slate-400">Chưa liên kết</span>
                            )}
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          {status === 'active' ? (
                            <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Đã kích hoạt</span>
                            </span>
                          ) : status === 'invited' ? (
                            <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold bg-sky-100 text-sky-800 border border-sky-200">
                              <Clock className="w-3 h-3" />
                              <span>Đã gửi lời mời</span>
                            </span>
                          ) : status === 'locked' ? (
                            <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">
                              <Lock className="w-3 h-3" />
                              <span>Đã bị khóa</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                              <span>Chưa cấp</span>
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-4">
                          {invitation ? (
                            <div className="space-y-1">
                              <div className="flex items-center space-x-1">
                                <span className="font-mono text-[11px] font-bold text-indigo-900 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                                  {invitation.token}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleCopyActivationLink(invitation.token, parent.fullName)}
                                  className="p-1 text-slate-400 hover:text-indigo-600 transition-colors"
                                  title="Sao chép liên kết kích hoạt"
                                >
                                  {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                                </button>
                              </div>
                              <span className="text-[10px] text-slate-500 block">
                                Hết hạn: {new Date(invitation.expires_at).toLocaleDateString('vi-VN')}
                              </span>
                            </div>
                          ) : (
                            <span className="text-[11px] text-slate-400">---</span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end space-x-1.5">
                            {status === 'uninvited' && (
                              <button
                                type="button"
                                onClick={() => {
                                  const inv = issueParentInvitation(parent.id, linkedStudents[0]?.student.id);
                                  if (inv.token) {
                                    handleCopyActivationLink(inv.token, parent.fullName);
                                  }
                                }}
                                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all flex items-center space-x-1 shadow-xs"
                              >
                                <Send className="w-3 h-3" />
                                <span>Cấp tài khoản</span>
                              </button>
                            )}

                            {status === 'invited' && invitation && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => handleCopyActivationLink(invitation.token, parent.fullName)}
                                  className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center space-x-1"
                                >
                                  <Copy className="w-3 h-3" />
                                  <span>Sao chép</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const res = resendInvitation(invitation.id);
                                    if (res.token) {
                                      handleCopyActivationLink(res.token, parent.fullName);
                                    }
                                    showToast(`Đã gia hạn lời mời thêm 7 ngày cho ${parent.fullName}`);
                                  }}
                                  className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors"
                                  title="Gửi lại / Gia hạn 7 ngày"
                                >
                                  <RefreshCw className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (confirm(`Bạn có chắc muốn thu hồi lời mời của phụ huynh ${parent.fullName}?`)) {
                                      revokeInvitation(invitation.id);
                                      showToast(`Đã thu hồi lời mời của ${parent.fullName}`);
                                    }
                                  }}
                                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                  title="Thu hồi lời mời"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </>
                            )}

                            {status === 'active' && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const inv = issueParentInvitation(parent.id, linkedStudents[0]?.student.id);
                                    if (inv.token) {
                                      handleCopyActivationLink(inv.token, parent.fullName);
                                    }
                                  }}
                                  className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-semibold transition-all flex items-center space-x-1"
                                  title="Cấp lại link mới / Đặt lại mật khẩu"
                                >
                                  <RefreshCw className="w-3 h-3" />
                                  <span>Cấp lại link</span>
                                </button>

                                {parent.user_id && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      toggleUserLock(parent.user_id!);
                                      showToast(`Đã khóa tài khoản phụ huynh ${parent.fullName}`);
                                    }}
                                    className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold transition-all flex items-center space-x-1 border border-rose-200"
                                  >
                                    <Lock className="w-3 h-3" />
                                    <span>Khóa</span>
                                  </button>
                                )}
                              </>
                            )}

                            {status === 'locked' && parent.user_id && (
                              <button
                                type="button"
                                onClick={() => {
                                  toggleUserLock(parent.user_id!);
                                  showToast(`Đã mở khóa tài khoản phụ huynh ${parent.fullName}`);
                                }}
                                className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl text-xs font-bold transition-all flex items-center space-x-1 border border-emerald-200"
                              >
                                <Unlock className="w-3 h-3" />
                                <span>Mở khóa</span>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {filteredParents.length === 0 && (
                <div className="py-12 text-center text-xs text-slate-400">
                  Chưa có dữ liệu phụ huynh nào phù hợp.
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB: INVITATIONS */}
        {activeTab === 'invitations' && (
          <div className="p-4 sm:p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center space-x-2">
                <KeyRound className="w-4 h-4 text-emerald-600" />
                <span>Danh sách Lời mời kích hoạt tài khoản ({accountInvitations.length})</span>
              </h3>
            </div>

            <div className="overflow-x-auto bg-white rounded-2xl border border-slate-200">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                    <th className="py-3 px-4">Người nhận</th>
                    <th className="py-3 px-4">Loại tài khoản</th>
                    <th className="py-3 px-4">Mã Token kích hoạt</th>
                    <th className="py-3 px-4">Thời gian tạo</th>
                    <th className="py-3 px-4">Hạn dùng</th>
                    <th className="py-3 px-4">Trạng thái</th>
                    <th className="py-3 px-4 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {accountInvitations.map((inv) => {
                    const isPending = inv.status === 'pending';
                    const isExpired = new Date(inv.expires_at).getTime() <= Date.now();
                    const isCopied = copiedToken === inv.token;

                    return (
                      <tr key={inv.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3.5 px-4 font-bold text-slate-900">
                          {inv.recipient_name}
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                            inv.invitation_type === 'student' ? 'bg-blue-100 text-blue-800' : 'bg-indigo-100 text-indigo-800'
                          }`}>
                            {inv.invitation_type === 'student' ? 'Học sinh' : 'Phụ huynh'}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold text-blue-800">
                          {inv.token}
                        </td>
                        <td className="py-3.5 px-4 text-slate-500">
                          {new Date(inv.created_at).toLocaleDateString('vi-VN')}
                        </td>
                        <td className="py-3.5 px-4 text-slate-600">
                          {new Date(inv.expires_at).toLocaleDateString('vi-VN')}
                        </td>
                        <td className="py-3.5 px-4">
                          {inv.status === 'accepted' ? (
                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                              Đã kích hoạt
                            </span>
                          ) : inv.status === 'revoked' ? (
                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800">
                              Đã thu hồi
                            </span>
                          ) : isExpired ? (
                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800">
                              Quá hạn
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-sky-100 text-sky-800">
                              Đang chờ
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end space-x-1.5">
                            {isPending && !isExpired && (
                              <button
                                type="button"
                                onClick={() => handleCopyActivationLink(inv.token, inv.recipient_name)}
                                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold flex items-center space-x-1"
                              >
                                {isCopied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                                <span>Sao chép link</span>
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => {
                                resendInvitation(inv.id);
                                showToast(`Đã gia hạn lời mời thêm 7 ngày cho ${inv.recipient_name}`);
                              }}
                              className="p-1.5 text-slate-500 hover:text-blue-600 rounded-lg hover:bg-slate-100"
                              title="Gia hạn 7 ngày"
                            >
                              <RefreshCw className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB: RELATIONS */}
        {activeTab === 'relations' && (
          <div className="p-4 sm:p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center space-x-2">
                <Layers className="w-4 h-4 text-purple-600" />
                <span>Bảng liên kết Phụ huynh - Học sinh (1 Phụ huynh có thể có nhiều Con)</span>
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {parents.map((parent) => {
                const linkedStudents = getParentStudents(parent.id);
                return (
                  <div key={parent.id} className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2.5">
                        <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 font-bold flex items-center justify-center text-xs">
                          {parent.fullName.charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-900 text-sm">{parent.fullName}</h4>
                          <span className="text-xs text-slate-500">{parent.phone}</span>
                        </div>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-100 text-purple-800">
                        {linkedStudents.length} con
                      </span>
                    </div>

                    <div className="space-y-1.5 pt-2 border-t border-slate-200/70">
                      {linkedStudents.map((ls) => (
                        <div
                          key={ls.student.id}
                          className="flex items-center justify-between p-2 rounded-xl bg-white border border-slate-200/80 text-xs"
                        >
                          <div className="flex items-center space-x-2">
                            <GraduationCap className="w-3.5 h-3.5 text-blue-600" />
                            <span className="font-bold text-slate-800">{ls.student.fullName}</span>
                            <span className="text-[10px] text-slate-500">({ls.student.schoolCode})</span>
                          </div>
                          <div className="flex items-center space-x-1.5">
                            <span className="text-[11px] text-slate-600 font-semibold">
                              {getRelationshipLabel(ls.relationship)}
                            </span>
                            {ls.is_primary && (
                              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {showBulkModal && (
        <BulkAccountInviteModal
          onClose={() => setShowBulkModal(false)}
          onSuccess={() => {
            showToast('Đã phát hành lời mời kích hoạt hàng loạt thành công!');
          }}
        />
      )}

      {selectedStudentForParentModal && (
        <LinkParentModal
          student={selectedStudentForParentModal}
          onClose={() => setSelectedStudentForParentModal(null)}
          onSuccess={() => {
            showToast('Đã liên kết phụ huynh thành công!');
          }}
        />
      )}

      {inspectStudent && (
        <StudentProfileDrawer
          student={inspectStudent}
          onClose={() => setInspectStudent(null)}
        />
      )}
    </div>
  );
};

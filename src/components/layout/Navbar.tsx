import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';
import { NavTabId } from './Sidebar';
import { AuthModal } from '../auth/AuthModal';
import { auth } from '../../lib/firebase';
import { signOut } from 'firebase/auth';
import {
  GraduationCap,
  Bell,
  User,
  Users,
  RotateCcw,
  Building,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ExternalLink,
  ChevronDown,
  Mail,
  Check,
  Settings,
  Edit3,
  LogIn,
  UserPlus,
  LogOut,
  Key,
} from 'lucide-react';

interface NavbarProps {
  onNavigate?: (tab: NavTabId) => void;
  onOpenNotifications?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onNavigate, onOpenNotifications }) => {
  const {
    currentTenant,
    tenants,
    switchTenant,
    currentRole,
    switchRole,
    students,
    activeStudentId,
    setActiveStudentId,
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    resetToDemoData,
    currentUser,
    setCurrentUser,
  } = useApp();

  const isAdmin = currentUser?.role === 'admin' || currentRole === 'admin';
  const isStudent = currentRole === 'student' || currentUser?.role === 'student';
  const isParent = currentRole === 'parent' || currentUser?.role === 'parent';

  const [showTenantMenu, setShowTenantMenu] = useState(false);
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [showNotificationsDropdown, setShowNotificationsDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  // Auth modal state
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'register'>('login');

  // Filter notifications relevant to current user/role
  const relevantNotifications = notifications.filter((n) => {
    if (isStudent) {
      // Only notifications for this student
      if (n.recipientRole === 'student') {
        return !n.recipientId || n.recipientId === activeStudentId;
      }
      return false;
    }
    if (isParent) {
      if (n.recipientRole === 'parent') {
        return !n.recipientId || n.recipientId === activeStudentId;
      }
      return false;
    }
    // Teacher / Admin: see teacher & system notifications
    return n.recipientRole === 'teacher' || !n.recipientRole;
  });

  const unreadCount = relevantNotifications.filter((n) => !n.isRead).length;

  const currentStudent = students.find((s) => s.id === activeStudentId) || students[0];

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Tenant Name */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm font-bold text-lg">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-base font-bold text-slate-900 tracking-tight">
                  EduTutor
                </span>
                {isAdmin ? (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                    👑 Quản Trị Viên (Admin)
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                    SaaS Multi-Tenant
                  </span>
                )}
              </div>
              <div className="relative">
                {isAdmin ? (
                  /* Admin can choose and view any Tenant */
                  <>
                    <button
                      type="button"
                      onClick={() => setShowTenantMenu(!showTenantMenu)}
                      className="flex items-center text-xs text-slate-700 hover:text-blue-600 font-semibold transition-colors cursor-pointer"
                      title="Quản trị viên: Nhấn để chuyển xem dữ liệu của từng Tenant"
                    >
                      <span className="truncate max-w-[200px] sm:max-w-[280px]">
                        {currentTenant.name}
                      </span>
                      <ChevronDown className="w-3.5 h-3.5 ml-1 text-slate-400" />
                    </button>

                    {showTenantMenu && (
                      <>
                        <div
                          className="fixed inset-0 z-40"
                          onClick={() => setShowTenantMenu(false)}
                        />
                        <div className="absolute left-0 mt-2 w-72 bg-white rounded-xl shadow-lg border border-slate-200 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
                          <div className="px-3 py-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                            <span>Chọn Tenant để xem</span>
                            <span className="text-[10px] text-purple-700 bg-purple-100 font-bold px-1.5 py-0.5 rounded">Admin Only</span>
                          </div>
                          {tenants.map((t) => (
                            <button
                              key={t.id}
                              type="button"
                              onClick={() => {
                                switchTenant(t.id);
                                setShowTenantMenu(false);
                              }}
                              className={`w-full text-left px-3 py-2 text-sm flex items-start space-x-2 hover:bg-slate-50 transition-colors ${
                                t.id === currentTenant.id
                                  ? 'bg-blue-50/70 text-blue-700 font-medium'
                                  : 'text-slate-700'
                              }`}
                            >
                              <Building className="w-4 h-4 mt-0.5 shrink-0 text-slate-400" />
                              <div>
                                <p className="leading-snug text-xs font-semibold">{t.name}</p>
                                <p className="text-[11px] text-slate-500 font-normal">
                                  {t.teacherName} • {t.schoolSubject}
                                </p>
                              </div>
                            </button>
                          ))}

                          <div className="p-2 border-t border-slate-100 bg-slate-50/70 rounded-b-xl">
                            <button
                              type="button"
                              onClick={() => {
                                setShowTenantMenu(false);
                                onNavigate?.('tenant-settings');
                              }}
                              className="w-full py-2 px-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center justify-center space-x-1.5 transition-colors shadow-xs cursor-pointer"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                              <span>Quản lý hồ sơ Tenants</span>
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </>
                ) : (
                  /* Teacher / Parent / Student: Only see their own fixed Tenant */
                  <div className="flex items-center text-xs text-slate-700 font-medium">
                    <span className="truncate max-w-[200px] sm:max-w-[280px] font-semibold text-slate-800">
                      {currentTenant.name}
                    </span>
                    <span className="ml-1.5 px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 text-[10px] font-normal border border-slate-200">
                      {currentTenant.teacherName}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Center / Right controls */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Quick Role Switcher Pill: Only show role buttons according to user role. For Student, show only Student; for Parent, show only Parent */}
            {isStudent ? (
              <div className="bg-slate-100 p-1 rounded-xl flex items-center border border-slate-200/80">
                <span className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white text-indigo-700 shadow-xs flex items-center space-x-1">
                  <span>🎒 Học sinh</span>
                </span>
              </div>
            ) : isParent ? (
              <div className="bg-slate-100 p-1 rounded-xl flex items-center border border-slate-200/80">
                <span className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white text-emerald-700 shadow-xs flex items-center space-x-1">
                  <span>👨‍👩‍👧 Phụ huynh</span>
                </span>
              </div>
            ) : (
              <div className="bg-slate-100 p-1 rounded-xl flex items-center border border-slate-200/80">
                {isAdmin && (
                  <button
                    type="button"
                    onClick={() => switchRole('admin')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      currentRole === 'admin'
                        ? 'bg-purple-700 text-white shadow-xs font-bold'
                        : 'text-purple-700 hover:text-purple-900 font-semibold'
                    }`}
                  >
                    👑 Admin
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => switchRole('teacher')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    currentRole === 'teacher'
                      ? 'bg-white text-blue-700 shadow-xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  👨‍🏫 Giáo viên
                </button>
                <button
                  type="button"
                  onClick={() => switchRole('parent')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    currentRole === 'parent'
                      ? 'bg-white text-emerald-700 shadow-xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  👨‍👩‍👧 Phụ huynh
                </button>
                <button
                  type="button"
                  onClick={() => switchRole('student')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    currentRole === 'student'
                      ? 'bg-white text-indigo-700 shadow-xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  🎒 Học sinh
                </button>
              </div>
            )}

            {/* Student perspective badge/selector: Lock to current student when student or parent role */}
            {isStudent ? (
              <div className="bg-indigo-50 border border-indigo-200 text-indigo-900 text-xs rounded-lg px-2.5 py-1.5 font-semibold flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                <span>HS: {currentStudent.fullName} ({currentStudent.schoolGrade || currentStudent.schoolCode})</span>
              </div>
            ) : isParent ? (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs rounded-lg px-2.5 py-1.5 font-semibold flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                <span>PH em: {currentStudent.fullName} ({currentStudent.schoolCode})</span>
              </div>
            ) : null}

            {/* Notification Bell */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  if (onOpenNotifications) {
                    onOpenNotifications();
                  } else {
                    setShowNotificationsDropdown(!showNotificationsDropdown);
                  }
                }}
                className="relative p-2 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors focus:outline-hidden"
                title="Thông báo hệ thống"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotificationsDropdown && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowNotificationsDropdown(false)}
                  />
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200 py-3 z-50 animate-in fade-in zoom-in-95 duration-100 max-h-[460px] overflow-y-auto">
                    <div className="px-4 pb-2 border-b border-slate-100 flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-xs text-slate-900">Thông báo hệ thống</span>
                        {unreadCount > 0 && (
                          <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-[10px] font-bold">
                            {unreadCount} mới
                          </span>
                        )}
                      </div>
                      {unreadCount > 0 && (
                        <button
                          type="button"
                          onClick={() => markAllNotificationsAsRead()}
                          className="text-[11px] font-semibold text-blue-600 hover:text-blue-700"
                        >
                          Đánh dấu tất cả đã đọc
                        </button>
                      )}
                    </div>

                    <div className="divide-y divide-slate-100">
                      {relevantNotifications.length === 0 ? (
                        <div className="p-6 text-center text-xs text-slate-400">
                          Chưa có thông báo nào
                        </div>
                      ) : (
                        relevantNotifications.map((notif) => (
                          <div
                            key={notif.id}
                            onClick={() => {
                              markNotificationAsRead(notif.id);
                              if (notif.type.startsWith('tuition') && onNavigate) {
                                onNavigate('tuition');
                                setShowNotificationsDropdown(false);
                              } else if (notif.type.startsWith('homework') && onNavigate) {
                                onNavigate('homework');
                                setShowNotificationsDropdown(false);
                              }
                            }}
                            className={`p-3.5 hover:bg-slate-50 cursor-pointer transition-colors text-xs flex items-start space-x-3 ${
                              !notif.isRead ? 'bg-blue-50/40' : ''
                            }`}
                          >
                            <div className="w-2 h-2 rounded-full bg-blue-600 mt-1.5 shrink-0" style={{ opacity: notif.isRead ? 0 : 1 }} />
                            <div className="space-y-0.5 flex-1">
                              <p className="font-bold text-slate-900 leading-snug">{notif.title}</p>
                              <p className="text-slate-600 text-[11px] leading-relaxed">{notif.content}</p>
                              <span className="text-[10px] text-slate-400 block pt-1">{notif.created_at}</span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Account Profile / Login Button */}
            <div className="relative">
              {currentUser ? (() => {
                const isStaleAn = currentUser.name === 'Thầy Nguyễn Văn An' || currentUser.email === 'teacher.an@edututor.vn';
                const effectiveName = isStaleAn
                  ? 'Thầy Nguyễn Văn Tuấn'
                  : currentUser.role === 'teacher' && currentUser.tenant_id === currentTenant.id
                  ? currentTenant.teacherName || currentUser.name
                  : currentUser.name;
                const effectiveEmail = isStaleAn ? 'thaytuan.math@edututor.vn' : currentUser.email;

                return (
                <div>
                  <button
                    type="button"
                    onClick={() => setShowUserDropdown(!showUserDropdown)}
                    className="flex items-center space-x-2 p-1.5 pl-2.5 bg-blue-50/80 hover:bg-blue-100/80 border border-blue-200 text-blue-900 rounded-xl transition-all cursor-pointer"
                  >
                    <div className="w-6 h-6 rounded-lg bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                      {currentUser.role === 'admin' ? '👑' : (effectiveName ? effectiveName.charAt(0).toUpperCase() : 'GV')}
                    </div>
                    <div className="text-left hidden md:block">
                      <p className="text-xs font-bold leading-tight truncate max-w-[120px]">{effectiveName}</p>
                      <p className="text-[10px] text-blue-700 font-medium leading-none">
                        {currentUser.role === 'admin' || currentRole === 'admin' ? '👑 Admin' : currentRole === 'teacher' ? 'Giáo viên' : currentRole === 'parent' ? 'Phụ huynh' : 'Học sinh'}
                      </p>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-blue-600" />
                  </button>

                  {showUserDropdown && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setShowUserDropdown(false)} />
                      <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                        <div className="px-4 py-2 border-b border-slate-100">
                          <p className="font-bold text-xs text-slate-900 flex items-center space-x-1.5">
                            <span>{effectiveName}</span>
                            {currentUser.role === 'admin' && <span className="text-[10px] bg-purple-100 text-purple-700 px-1.5 py-0.2 rounded font-bold">Admin</span>}
                          </p>
                          <p className="text-[11px] text-slate-500 truncate">{effectiveEmail}</p>
                          <span className="inline-block mt-1 px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-[10px] font-bold">
                            {currentUser.role === 'admin' ? '👑 Quyền: Quản trị viên (Toàn quyền)' : currentRole === 'teacher' ? 'Quyền: Giáo viên' : currentRole === 'parent' ? 'Quyền: Phụ huynh' : 'Quyền: Học sinh'}
                          </span>
                        </div>

                        {/* For Student or Parent role: ONLY show Logout action */}
                        {!isStudent && !isParent && (
                          <div className="py-1">
                            <button
                              type="button"
                              onClick={() => {
                                setShowUserDropdown(false);
                                setAuthModalTab('register');
                                setShowAuthModal(true);
                              }}
                              className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 flex items-center space-x-2"
                            >
                              <UserPlus className="w-3.5 h-3.5 text-blue-600" />
                              <span>Đăng ký trung tâm / giáo viên mới</span>
                            </button>
                          </div>
                        )}

                        <div className="pt-1 border-t border-slate-100">
                          <button
                            type="button"
                            onClick={async () => {
                              setShowUserDropdown(false);
                              try {
                                await signOut(auth);
                              } catch (e) {
                                console.warn('Signout error:', e);
                              }
                              setCurrentUser(null);
                            }}
                            className="w-full text-left px-4 py-2 text-xs text-red-600 hover:bg-red-50 flex items-center space-x-2 font-bold"
                          >
                            <LogOut className="w-3.5 h-3.5" />
                            <span>Đăng xuất khỏi hệ thống</span>
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
                );
              })() : (
                <button
                  type="button"
                  onClick={() => {
                    setAuthModalTab('login');
                    setShowAuthModal(true);
                  }}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-colors shadow-xs cursor-pointer"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Đăng nhập</span>
                </button>
              )}
            </div>

            {/* Help & Documentation Guide - Hidden for Student and Parent */}
            {!isStudent && !isParent && (
              <button
                type="button"
                onClick={() => setShowHelpModal(true)}
                className="p-2 rounded-xl text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                title="Tài liệu & Hướng dẫn nghiệp vụ"
              >
                <HelpCircle className="w-5 h-5" />
              </button>
            )}

            {/* Reset Demo Data Button - Hidden for Student and Parent */}
            {!isStudent && !isParent && (
              <button
                type="button"
                onClick={resetToDemoData}
                className="hidden sm:inline-flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 transition-colors border border-slate-200"
                title="Khôi phục toàn bộ dữ liệu mẫu"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Dữ liệu mẫu</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        defaultTab={authModalTab}
      />

      {/* Help Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                  📖
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    Quy trình Nghiệp vụ Cốt lõi
                  </h3>
                  <p className="text-xs text-slate-500">
                    Theo tài liệu BRD, SRS và System Design
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowHelpModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg text-sm"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-4 text-sm text-slate-600">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3.5">
                <h4 className="font-semibold text-blue-900 flex items-center">
                  <CheckCircle2 className="w-4 h-4 mr-1.5 text-blue-600" />
                  Quy tắc 1: Lịch học cố định ≠ Buổi học tính phí
                </h4>
                <p className="text-xs text-blue-800 mt-1 leading-relaxed">
                  Lịch cố định chỉ là cấu hình tuần. Buổi học thực tế sinh ra có thể Hủy (không tính phí), Đổi lịch, hoặc Học bù. Học phí cuối tháng tính theo các buổi được xác nhận <strong>fee_eligible</strong>.
                </p>
              </div>

              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5">
                <h4 className="font-semibold text-emerald-900 flex items-center">
                  <CheckCircle2 className="w-4 h-4 mr-1.5 text-emerald-600" />
                  Quy tắc 2: Cú pháp mã VietQR chuyển khoản
                </h4>
                <p className="text-xs text-emerald-800 mt-1 font-mono">
                  [Mã trường]_K[2 số cuối năm sinh]_[Tên học sinh]_T[Tháng]_[Năm]
                </p>
                <p className="text-xs text-emerald-700 mt-1">
                  Ví dụ: <strong>PBC_K10_Tuan_T7_2026</strong> (Trường THPT Phan Bội Châu, sinh năm 2010, em Tuấn, học phí tháng 7/2026).
                </p>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5">
                <h4 className="font-semibold text-amber-900 flex items-center">
                  <CheckCircle2 className="w-4 h-4 mr-1.5 text-amber-600" />
                  Quy tắc 3: Đối soát tự động (Dual-Match Algorithm)
                </h4>
                <p className="text-xs text-amber-800 mt-1 leading-relaxed">
                  Đối soát sao kê ngân hàng kiểm tra đồng thời: <strong>Số tiền khớp 100%</strong> VÀ <strong>Nội dung giao dịch chứa mã học phí</strong>. Nếu lệch số tiền, hệ thống gắn cờ Lệch số tiền (Discrepancy) để giáo viên xử lý.
                </p>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowHelpModal(false)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-xl font-medium text-sm hover:bg-blue-700 transition-colors shadow-xs"
                >
                  Đã hiểu & Bắt đầu
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

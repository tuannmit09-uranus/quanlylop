import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { Tenant } from '../../types';
import { auth, saveDocumentToFirestore, uploadFileToFirebaseStorage } from '../../lib/firebase';
import {
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from 'firebase/auth';
import {
  Building,
  User,
  Phone,
  Mail,
  BookOpen,
  Save,
  Sparkles,
  Layers,
  Plus,
  Trash2,
  Edit3,
  CheckCircle2,
  ShieldCheck,
  CreditCard,
  Calendar,
  Image as ImageIcon,
  Check,
  AlertCircle,
  ExternalLink,
  Upload,
  Camera,
  X,
  Lock,
  KeyRound,
  Eye,
  EyeOff,
  Shield,
  RefreshCw,
  AlertTriangle,
} from 'lucide-react';

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
];

interface TenantSettingsPageProps {
  onNavigateToPayment?: () => void;
}

export const TenantSettingsPage: React.FC<TenantSettingsPageProps> = ({ onNavigateToPayment }) => {
  const {
    currentTenant,
    tenants,
    switchTenant,
    updateTenant,
    addTenant,
    deleteTenant,
    currentUser,
    setCurrentUser,
    currentRole,
  } = useApp();

  const isAdmin = currentUser?.role === 'admin' || currentRole === 'admin';

  // Selected Tenant to edit (default to current active tenant, teacher only edits their own)
  const [editingTenantId, setEditingTenantId] = useState<string>(currentTenant.id);

  // Form State
  const [name, setName] = useState(currentTenant.name);
  const [teacherName, setTeacherName] = useState(currentTenant.teacherName);
  const [phone, setPhone] = useState(currentTenant.phone || '');
  const [email, setEmail] = useState(currentTenant.email || '');
  const [schoolSubject, setSchoolSubject] = useState(currentTenant.schoolSubject || '');
  const [avatar, setAvatar] = useState(currentTenant.avatar || '');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // File Upload State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState('');

  // Password Management State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Modal / New Tenant State
  const [showAddModal, setShowAddModal] = useState(false);
  const [tenantToDelete, setTenantToDelete] = useState<Tenant | null>(null);
  const [deleteFeedback, setDeleteFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [newTenantData, setNewTenantData] = useState({
    name: '',
    teacherName: '',
    phone: '',
    email: '',
    schoolSubject: 'Toán học',
    avatar: PRESET_AVATARS[0],
  });

  // If not admin, always force editingTenantId to currentTenant.id
  useEffect(() => {
    if (!isAdmin) {
      setEditingTenantId(currentTenant.id);
    }
  }, [isAdmin, currentTenant.id]);

  // Sync state when editingTenantId or currentTenant changes
  useEffect(() => {
    const target = tenants.find((t) => t.id === editingTenantId) || currentTenant;
    setName(target.name);
    setTeacherName(target.teacherName);
    setPhone(target.phone || '');
    setEmail(target.email || '');
    setSchoolSubject(target.schoolSubject || '');
    setAvatar(target.avatar || '');
  }, [editingTenantId, currentTenant, tenants]);

  // Process and optimize uploaded image file
  const processImageFile = async (file: File) => {
    setUploadError('');

    if (!file.type.startsWith('image/')) {
      setUploadError('Vui lòng chọn tệp định dạng hình ảnh (PNG, JPG, JPEG, WebP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Dung lượng ảnh vượt quá 5MB. Vui lòng chọn ảnh nhỏ hơn.');
      return;
    }

    try {
      const storageUrl = await uploadFileToFirebaseStorage(file, 'avatars');
      if (storageUrl) {
        setAvatar(storageUrl);
        return;
      }
    } catch (err) {
      console.warn('Storage upload note, fallback to optimized data url:', err);
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (!result) return;

      // Optimize image dimensions using canvas if large
      const img = new Image();
      img.onload = () => {
        const maxWidth = 500;
        const maxHeight = 500;
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.85);
          setAvatar(compressedDataUrl);
        } else {
          setAvatar(result);
        }
      };
      img.onerror = () => {
        setAvatar(result);
      };
      img.src = result;
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processImageFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processImageFile(e.dataTransfer.files[0]);
    }
  };

  const handleSaveTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !teacherName.trim()) {
      alert('Vui lòng điền đầy đủ Tên không gian và Họ tên Giáo viên!');
      return;
    }

    const targetId = isAdmin ? editingTenantId : currentTenant.id;
    const payload = {
      name: name.trim(),
      teacherName: teacherName.trim(),
      phone: phone.trim(),
      email: email.trim(),
      schoolSubject: schoolSubject.trim(),
      avatar: avatar.trim(),
    };

    updateTenant(payload, targetId);

    try {
      await saveDocumentToFirestore('tenants', targetId, payload);
      console.log(`Saved tenant ${targetId} avatar & profile directly to Firestore`);
    } catch (err) {
      console.warn('Firestore direct save note:', err);
    }

    if (currentUser && (targetId === currentTenant.id || isAdmin)) {
      setCurrentUser({
        ...currentUser,
        avatar: avatar.trim() || undefined,
      });
    }

    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3500);
  };

  // Password update handler
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (!newPassword) {
      setPasswordError('Vui lòng nhập mật khẩu mới.');
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError('Mật khẩu mới phải có ít nhất 6 ký tự.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('Mật khẩu nhập lại không khớp với mật khẩu mới.');
      return;
    }

    const userEmail = (currentUser?.email || activeEditingTenant.email || '').toLowerCase().trim();
    let storedCreds: Record<string, string> = {};
    try {
      storedCreds = JSON.parse(localStorage.getItem('edututor_custom_credentials') || '{}');
    } catch {
      storedCreds = {};
    }
    const expectedCurrentPass = storedCreds[userEmail] || '123456';

    if (currentPassword && currentPassword !== expectedCurrentPass) {
      setPasswordError('Mật khẩu hiện tại không chính xác. Vui lòng kiểm tra lại.');
      return;
    }

    setPasswordLoading(true);

    try {
      const user = auth.currentUser;
      if (user && user.email) {
        // If current password provided, re-authenticate first to prevent session expiration error
        if (currentPassword) {
          try {
            const credential = EmailAuthProvider.credential(user.email, currentPassword);
            await reauthenticateWithCredential(user, credential);
          } catch (reauthErr: any) {
            console.warn('Reauth warning:', reauthErr);
          }
        }
        await updatePassword(user, newPassword);
      }

      // Persist to local credentials map for teacher
      if (userEmail) {
        storedCreds[userEmail] = newPassword;
        localStorage.setItem('edututor_custom_credentials', JSON.stringify(storedCreds));
      }

      // Record successful change
      setPasswordSuccess('Đã cập nhật mật khẩu đăng nhập thành công! Vui lòng ghi nhớ mật khẩu mới.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordSuccess(''), 5000);
    } catch (err: any) {
      console.warn('Password update issue:', err);
      if (err.code === 'auth/requires-recent-login') {
        setPasswordError('Phiên đăng nhập đã quá hạn. Vui lòng đăng xuất và đăng nhập lại trước khi đổi mật khẩu.');
      } else {
        // Persist to local credentials map
        if (userEmail) {
          storedCreds[userEmail] = newPassword;
          localStorage.setItem('edututor_custom_credentials', JSON.stringify(storedCreds));
        }
        setPasswordSuccess('Đã cập nhật mật khẩu đăng nhập tài khoản hệ thống thành công!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => setPasswordSuccess(''), 5000);
      }
    } finally {
      setPasswordLoading(false);
    }
  };

  // Password strength calculation
  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return { score: 0, label: '', color: 'bg-slate-200' };
    let score = 0;
    if (pwd.length >= 6) score++;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;

    if (score <= 2) return { score: 1, label: 'Yếu', color: 'bg-rose-500' };
    if (score <= 3) return { score: 2, label: 'Trung bình', color: 'bg-amber-500' };
    return { score: 3, label: 'Mạnh & An toàn', color: 'bg-emerald-500' };
  };

  const pwdStrength = getPasswordStrength(newPassword);

  const handleCreateTenant = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) {
      alert('Chỉ tài khoản Quản trị viên (Admin) mới có quyền tạo Tenant mới!');
      return;
    }

    if (!newTenantData.name.trim() || !newTenantData.teacherName.trim()) {
      alert('Vui lòng nhập tên lớp/trung tâm và họ tên giáo viên!');
      return;
    }

    const created = addTenant({
      name: newTenantData.name.trim(),
      teacherName: newTenantData.teacherName.trim(),
      phone: newTenantData.phone.trim(),
      email: newTenantData.email.trim(),
      schoolSubject: newTenantData.schoolSubject.trim(),
      avatar: newTenantData.avatar,
    });

    setShowAddModal(false);
    setEditingTenantId(created.id);
    switchTenant(created.id);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3500);

    // Reset new tenant modal form
    setNewTenantData({
      name: '',
      teacherName: '',
      phone: '',
      email: '',
      schoolSubject: 'Toán học',
      avatar: PRESET_AVATARS[0],
    });
  };

  const handleDeleteTenant = (tenant: Tenant) => {
    if (!isAdmin) {
      setDeleteFeedback({
        type: 'error',
        message: 'Chỉ tài khoản Quản trị viên (Admin) mới có quyền xóa Tenant!',
      });
      return;
    }

    if (tenants.length <= 1) {
      setDeleteFeedback({
        type: 'error',
        message: 'Hệ thống yêu cầu tối thiểu 1 không gian Tenant đang hoạt động. Không thể xóa!',
      });
      return;
    }

    setTenantToDelete(tenant);
  };

  const confirmDeleteTenant = () => {
    if (!tenantToDelete) return;

    const targetTenant = tenantToDelete;
    const targetId = targetTenant.id;
    const targetName = targetTenant.name;

    deleteTenant(targetId);

    if (editingTenantId === targetId) {
      const remaining = tenants.filter((t) => t.id !== targetId);
      if (remaining.length > 0) {
        setEditingTenantId(remaining[0].id);
      }
    }

    setTenantToDelete(null);
    setDeleteFeedback({
      type: 'success',
      message: `Đã xóa thành công không gian Tenant "${targetName}" và toàn bộ dữ liệu liên quan!`,
    });
    setTimeout(() => {
      setDeleteFeedback(null);
    }, 4500);
  };

  const activeEditingTenant = tenants.find((t) => t.id === editingTenantId) || currentTenant;
  const isEditingCurrentActive = editingTenantId === currentTenant.id;

  // For teachers: only display their own single tenant in the directory
  const displayedTenants = isAdmin ? tenants : tenants.filter((t) => t.id === currentTenant.id);

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold mb-1.5 border border-blue-200">
            <Building className="w-3.5 h-3.5" />
            <span>Hồ sơ & Phân quyền Multi-Tenant</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Hồ Sơ Tenant & Giáo Viên {isAdmin ? '(Quản Trị Viên)' : ''}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {isAdmin
              ? 'Quản trị viên có toàn quyền Khởi tạo Tenant mới, Xóa Tenant và chuyển đổi giữa các không gian giáo viên.'
              : 'Giáo viên cập nhật thông tin thương hiệu, môn học, tải ảnh đại diện và đổi mật khẩu đăng nhập an toàn.'}
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {isAdmin ? (
            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Tạo Tenant Mới (Admin)</span>
            </button>
          ) : (
            <div className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-600 text-xs font-medium border border-slate-200">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
              <span>Không gian bảo mật giáo viên</span>
            </div>
          )}
        </div>
      </div>

      {/* Success Notification Alert */}
      {saveSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center justify-between animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center space-x-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <p className="font-bold">Đã lưu thông tin Tenant & Ảnh đại diện thành công!</p>
              <p className="text-emerald-700 text-[11px]">
                Toàn bộ dữ liệu thương hiệu, ảnh đại diện và báo cáo đã được cập nhật đồng bộ.
              </p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 font-mono font-bold text-[10px]">
            Đã đồng bộ
          </span>
        </div>
      )}

      {/* Delete Feedback Alert */}
      {deleteFeedback && (
        <div
          className={`p-4 rounded-2xl border text-xs flex items-center justify-between animate-in fade-in slide-in-from-top-2 duration-200 ${
            deleteFeedback.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-rose-50 border-rose-200 text-rose-900'
          }`}
        >
          <div className="flex items-center space-x-2.5">
            {deleteFeedback.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            )}
            <div>
              <p className="font-bold">{deleteFeedback.message}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setDeleteFeedback(null)}
            className="p-1 rounded-lg hover:bg-black/5 text-slate-500 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Tenant Form & Security (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Main Tenant Profile Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-2xs space-y-6">
            {/* Form Top Banner */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center space-x-3.5">
                <div className="relative group">
                  <div className="w-14 h-14 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-xs overflow-hidden border border-blue-200">
                    {avatar ? (
                      <img
                        src={avatar}
                        alt={teacherName}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <User className="w-7 h-7" />
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center shadow-md border-2 border-white cursor-pointer transition-transform group-hover:scale-110"
                    title="Tải ảnh mới từ máy tính"
                  >
                    <Camera className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="font-bold text-slate-900 text-base">
                      {name || 'Chưa đặt tên không gian'}
                    </h3>
                    {isEditingCurrentActive ? (
                      <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 font-bold text-[10px]">
                        Đang làm việc
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-bold text-[10px]">
                        Khác
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Mã Tenant ID: <span className="font-mono text-blue-600 font-semibold">{activeEditingTenant.id}</span>
                  </p>
                </div>
              </div>

              {!isEditingCurrentActive && (
                <button
                  type="button"
                  onClick={() => switchTenant(activeEditingTenant.id)}
                  className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-xs font-bold transition-colors border border-blue-200"
                >
                  Chuyển sang Tenant này
                </button>
              )}
            </div>

            <form onSubmit={handleSaveTenant} className="space-y-5 text-xs">
              {/* Tenant Name */}
              <div>
                <label className="font-bold text-slate-700 block mb-1.5 flex items-center justify-between">
                  <span>Tên Không Gian / Thương Hiệu Lớp Học (Tenant Name): *</span>
                  <span className="text-[11px] text-slate-400 font-normal">Hiển thị ở Navbar & Báo cáo</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Building className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="VD: CLB Toán Thầy Tuấn - Luyện Thi Chuyên & ĐH"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-semibold focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-hidden text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Teacher Name */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1.5 flex items-center space-x-1">
                    <User className="w-3.5 h-3.5 text-slate-500" />
                    <span>Họ và Tên Giáo Viên Phụ Trách: *</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={teacherName}
                    onChange={(e) => setTeacherName(e.target.value)}
                    placeholder="VD: Thầy Nguyễn Văn Tuấn"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-semibold focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-hidden text-xs"
                  />
                </div>

                {/* Subject */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1.5 flex items-center space-x-1">
                    <BookOpen className="w-3.5 h-3.5 text-slate-500" />
                    <span>Môn Học & Khối Lớp Giảng Dạy:</span>
                  </label>
                  <input
                    type="text"
                    value={schoolSubject}
                    onChange={(e) => setSchoolSubject(e.target.value)}
                    placeholder="VD: Toán học THCS & THPT"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-semibold focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-hidden text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Phone */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1.5 flex items-center space-x-1">
                    <Phone className="w-3.5 h-3.5 text-slate-500" />
                    <span>Số Điện Thoại Hotline Liên Hệ:</span>
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="VD: 0988 888 999"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-semibold focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-hidden text-xs"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1.5 flex items-center space-x-1">
                    <Mail className="w-3.5 h-3.5 text-slate-500" />
                    <span>Email Liên Hệ / Nhận Thông Báo:</span>
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="VD: thaytuan.math@edututor.vn"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-semibold focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-hidden text-xs"
                  />
                </div>
              </div>

              {/* Avatar Upload & Selector Section */}
              <div className="pt-2 space-y-3">
                <label className="font-bold text-slate-700 block flex items-center justify-between">
                  <div className="flex items-center space-x-1.5">
                    <Camera className="w-4 h-4 text-blue-600" />
                    <span>Ảnh Đại Diện Giáo Viên (Avatar):</span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-normal">Hỗ trợ PNG, JPG, JPEG, WebP</span>
                </label>

                {/* Drag & Drop Upload Zone */}
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-2xl p-4 transition-all text-center ${
                    isDragging
                      ? 'border-blue-500 bg-blue-50/70 scale-[0.99]'
                      : 'border-slate-300 bg-slate-50/70 hover:bg-slate-50 hover:border-blue-400'
                  }`}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/png, image/jpeg, image/jpg, image/webp"
                    className="hidden"
                  />

                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-white border border-slate-200 flex items-center justify-center overflow-hidden shrink-0 shadow-xs relative">
                      {avatar ? (
                        <img src={avatar} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-8 h-8 text-slate-400" />
                      )}
                    </div>

                    <div className="space-y-1.5 text-center sm:text-left">
                      <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs transition-colors shadow-xs cursor-pointer"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>Tải ảnh từ máy tính</span>
                        </button>

                        {avatar && (
                          <button
                            type="button"
                            onClick={() => setAvatar('')}
                            className="inline-flex items-center space-x-1 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl font-semibold text-xs transition-colors border border-rose-200 cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" />
                            <span>Xóa ảnh</span>
                          </button>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500">
                        Kéo thả file ảnh vào đây hoặc nhấn <strong>Tải ảnh từ máy tính</strong>
                      </p>
                    </div>
                  </div>

                  {uploadError && (
                    <div className="mt-2 text-rose-600 font-semibold text-[11px] flex items-center justify-center space-x-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>{uploadError}</span>
                    </div>
                  )}
                </div>

                {/* Preset Avatar Gallery */}
                <div>
                  <span className="text-[11px] text-slate-500 font-semibold block mb-2">
                    Hoặc chọn nhanh từ bộ sưu tập ảnh đại diện mẫu:
                  </span>
                  <div className="flex flex-wrap items-center gap-2.5">
                    {PRESET_AVATARS.map((url, idx) => {
                      const isSelected = avatar === url;
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setAvatar(url)}
                          className={`relative w-11 h-11 rounded-2xl overflow-hidden border-2 transition-all cursor-pointer ${
                            isSelected
                              ? 'border-blue-600 ring-2 ring-blue-400/50 scale-105 shadow-xs'
                              : 'border-slate-200 hover:border-slate-300 opacity-70 hover:opacity-100'
                          }`}
                        >
                          <img src={url} alt={`Avatar ${idx + 1}`} className="w-full h-full object-cover" />
                          {isSelected && (
                            <div className="absolute inset-0 bg-blue-600/40 flex items-center justify-center text-white">
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="relative">
                  <input
                    type="text"
                    value={avatar}
                    onChange={(e) => setAvatar(e.target.value)}
                    placeholder="Hoặc dán trực tiếp đường dẫn URL ảnh (https://...)"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 text-xs focus:bg-white focus:ring-2 focus:ring-blue-500 outline-hidden"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="text-[11px] text-slate-400 flex items-center space-x-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Khởi tạo ngày: {activeEditingTenant.created_at || '2026-01-10'}</span>
                </div>

                <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto justify-end">
                  {isAdmin && tenants.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleDeleteTenant(activeEditingTenant)}
                      className="px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition-colors flex items-center justify-center space-x-1.5 cursor-pointer"
                      title="Xóa vĩnh viễn Không gian Tenant này (Chỉ Admin)"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Xóa Không Gian Này</span>
                    </button>
                  )}

                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center justify-center space-x-2 cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>Lưu Thay Đổi Hồ Sơ & Avatar</span>
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Password Update Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-2xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">
                    Cập Nhật Mật Khẩu Đăng Nhập Hệ Thống
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    Bảo vệ an toàn tài khoản Giáo viên & dữ liệu quản lý lớp học.
                  </p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 font-semibold text-[10px]">
                Bảo mật 2 lớp
              </span>
            </div>

            {passwordSuccess && (
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center space-x-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-semibold">{passwordSuccess}</span>
              </div>
            )}

            {passwordError && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-center space-x-2 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span className="font-semibold">{passwordError}</span>
              </div>
            )}

            <form onSubmit={handleUpdatePassword} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                {/* Current Password */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Mật Khẩu Hiện Tại:
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? 'text' : 'password'}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-3 pr-8 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-semibold focus:bg-white focus:ring-2 focus:ring-amber-500 outline-hidden"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600"
                    >
                      {showCurrentPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Mật Khẩu Mới: *
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Tối thiểu 6 ký tự"
                      className="w-full pl-3 pr-8 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-semibold focus:bg-white focus:ring-2 focus:ring-amber-500 outline-hidden"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600"
                    >
                      {showNewPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Confirm New Password */}
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Xác Nhận Mật Khẩu Mới: *
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Nhập lại mật khẩu mới"
                      className="w-full pl-3 pr-8 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-semibold focus:bg-white focus:ring-2 focus:ring-amber-500 outline-hidden"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600"
                    >
                      {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Password strength meter */}
              {newPassword && (
                <div className="space-y-1 pt-1">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">Độ mạnh mật khẩu:</span>
                    <span className="font-bold text-slate-700">{pwdStrength.label}</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden flex gap-1">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        pwdStrength.score >= 1 ? pwdStrength.color : 'bg-transparent'
                      } w-1/3`}
                    />
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        pwdStrength.score >= 2 ? pwdStrength.color : 'bg-transparent'
                      } w-1/3`}
                    />
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        pwdStrength.score >= 3 ? pwdStrength.color : 'bg-transparent'
                      } w-1/3`}
                    />
                  </div>
                </div>
              )}

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={passwordLoading}
                  className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white rounded-xl font-bold text-xs transition-colors shadow-xs flex items-center space-x-2 cursor-pointer"
                >
                  {passwordLoading ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Đang cập nhật...</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-3.5 h-3.5" />
                      <span>Cập Nhật Mật Khẩu</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Associated Payment Account Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                  <CreditCard className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-xs sm:text-sm">
                    Tài Khoản Ngân Hàng Nhận Học Phí (VietQR) Của Tenant Này
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    Tài khoản được dùng để tự động tạo mã VietQR và khớp lệnh sao kê ngân hàng.
                  </p>
                </div>
              </div>

              {onNavigateToPayment && (
                <button
                  type="button"
                  onClick={onNavigateToPayment}
                  className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-bold transition-colors flex items-center space-x-1 border border-indigo-200"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Đổi tài khoản ngân hàng</span>
                </button>
              )}
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="space-y-1">
                <div className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
                  Ngân hàng thụ hưởng
                </div>
                <div className="font-bold text-slate-900 text-sm">
                  {activeEditingTenant.paymentAccount?.bankName || 'Vietcombank'} ({activeEditingTenant.paymentAccount?.bankCode || 'VCB'})
                </div>
                <div className="text-slate-600 font-mono">
                  Số tài khoản: <strong className="text-slate-900">{activeEditingTenant.paymentAccount?.accountNumber || '1018999988'}</strong>
                </div>
              </div>

              <div className="space-y-1 sm:text-right">
                <div className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
                  Chủ tài khoản
                </div>
                <div className="font-bold text-blue-700 uppercase font-mono text-sm">
                  {activeEditingTenant.paymentAccount?.accountName || activeEditingTenant.teacherName.toUpperCase()}
                </div>
                <div className="inline-flex items-center space-x-1 text-emerald-600 font-semibold text-[11px]">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Mặc định thanh toán</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Multi-Tenant Workspace Directory (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Workspaces List Card */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <Layers className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-900 text-xs sm:text-sm">
                  {isAdmin ? `Tất Cả Không Gian (${tenants.length})` : 'Không Gian Của Bạn'}
                </h3>
              </div>
              {isAdmin && (
                <button
                  type="button"
                  onClick={() => setShowAddModal(true)}
                  className="p-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 transition-colors cursor-pointer"
                  title="Tạo Tenant Mới (Admin)"
                >
                  <Plus className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="space-y-2.5 text-xs">
              {displayedTenants.map((t) => {
                const isCurrentActive = t.id === currentTenant.id;
                const isBeingEdited = t.id === editingTenantId;

                return (
                  <div
                    key={t.id}
                    className={`p-3.5 rounded-2xl border transition-all space-y-2.5 ${
                      isBeingEdited
                        ? 'bg-blue-50/80 border-blue-400 shadow-xs ring-1 ring-blue-300'
                        : 'bg-slate-50 border-slate-200/80 hover:bg-slate-100/80'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-0.5">
                        <div className="font-bold text-slate-900 text-xs flex items-center space-x-1.5">
                          <span className="leading-snug">{t.name}</span>
                        </div>
                        <p className="text-[11px] text-slate-500 font-normal">
                          {t.teacherName} • {t.schoolSubject}
                        </p>
                      </div>

                      <div className="flex items-center space-x-1 shrink-0">
                        {isCurrentActive && (
                          <span className="px-2 py-0.5 rounded-full bg-blue-600 text-white font-bold text-[9px]">
                            {isAdmin ? 'Đang chọn' : 'Đang sử dụng'}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                      <span className="font-mono text-slate-400 text-[10px]">
                        ID: {t.id}
                      </span>

                      <div className="flex items-center space-x-1.5">
                        {isAdmin ? (
                          <>
                            <button
                              type="button"
                              onClick={() => setEditingTenantId(t.id)}
                              className={`px-2 py-1 rounded-lg font-semibold text-[11px] transition-colors flex items-center space-x-1 ${
                                isBeingEdited
                                  ? 'bg-blue-600 text-white font-bold'
                                  : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
                              }`}
                            >
                              <Edit3 className="w-3 h-3" />
                              <span>{isBeingEdited ? 'Đang sửa' : 'Chọn sửa'}</span>
                            </button>

                            {!isCurrentActive && (
                              <button
                                type="button"
                                onClick={() => switchTenant(t.id)}
                                className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold rounded-lg text-[11px] transition-colors border border-emerald-200"
                                title="Chuyển không gian làm việc"
                              >
                                Kích hoạt
                              </button>
                            )}

                            {tenants.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleDeleteTenant(t)}
                                className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                                title="Xóa Tenant này (Chỉ Admin)"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </>
                        ) : (
                          <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                            Không gian cố định của giáo viên
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Architecture & RLS Security Card */}
          <div className="bg-gradient-to-br from-slate-900 to-indigo-950 rounded-3xl p-5 text-white shadow-md space-y-3 text-xs">
            <div className="flex items-center space-x-2 text-indigo-300">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span className="font-bold text-[11px] uppercase tracking-wider">
                Multi-Tenant Row-Level Security (RLS)
              </span>
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              Mỗi giáo viên (Tenant) sở hữu dữ liệu học sinh, điểm số, học phí và tài khoản VietQR hoàn toàn biệt lập, được gắn khóa định danh <code className="text-indigo-300 font-mono">tenant_id</code> an toàn tuyệt đối.
            </p>
            <div className="p-2.5 rounded-xl bg-white/10 text-white font-mono text-[10px] space-y-1">
              <div>Tenant hiện hành: <strong className="text-emerald-400">{currentTenant.id}</strong></div>
              <div>Giáo viên: <strong>{currentTenant.teacherName}</strong></div>
            </div>
          </div>
        </div>
      </div>

      {/* Add New Tenant Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    Khởi Tạo Không Gian Tenant Mới
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Dành cho Giáo viên mới hoặc Môn học mới độc lập.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTenant} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Tên Không Gian / Lớp Học: *
                </label>
                <input
                  type="text"
                  required
                  value={newTenantData.name}
                  onChange={(e) => setNewTenantData({ ...newTenantData, name: e.target.value })}
                  placeholder="VD: Lớp Hóa Học Thầy Đức - Luyện Thi Chuyên"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-semibold focus:bg-white focus:ring-2 focus:ring-blue-500 outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Họ Tên Giáo Viên: *
                  </label>
                  <input
                    type="text"
                    required
                    value={newTenantData.teacherName}
                    onChange={(e) => setNewTenantData({ ...newTenantData, teacherName: e.target.value })}
                    placeholder="VD: Thầy Hoàng Minh Đức"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-semibold focus:bg-white focus:ring-2 focus:ring-blue-500 outline-hidden"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Môn Giảng Dạy:
                  </label>
                  <input
                    type="text"
                    value={newTenantData.schoolSubject}
                    onChange={(e) => setNewTenantData({ ...newTenantData, schoolSubject: e.target.value })}
                    placeholder="VD: Hóa Học THPT"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-semibold focus:bg-white focus:ring-2 focus:ring-blue-500 outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Số Điện Thoại:
                  </label>
                  <input
                    type="text"
                    value={newTenantData.phone}
                    onChange={(e) => setNewTenantData({ ...newTenantData, phone: e.target.value })}
                    placeholder="0912 333 444"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-semibold focus:bg-white focus:ring-2 focus:ring-blue-500 outline-hidden"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Email:
                  </label>
                  <input
                    type="email"
                    value={newTenantData.email}
                    onChange={(e) => setNewTenantData({ ...newTenantData, email: e.target.value })}
                    placeholder="thayduc@edututor.vn"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 font-semibold focus:bg-white focus:ring-2 focus:ring-blue-500 outline-hidden"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition-colors"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-colors shadow-xs"
                >
                  Khởi Tạo Không Gian
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Tenant Confirmation Modal */}
      {tenantToDelete && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-150">
            <div className="p-5 bg-gradient-to-r from-rose-600 to-red-700 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center font-bold">
                  <AlertTriangle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">Xác Nhận Xóa Không Gian Tenant</h3>
                  <p className="text-[11px] text-red-100">Thao tác này chỉ dành cho Quản Trị Viên (Admin)</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setTenantToDelete(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 space-y-1.5">
                <p className="font-bold text-rose-800 text-xs flex items-center space-x-1.5">
                  <Trash2 className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>Bạn có chắc chắn muốn xóa không gian sau?</span>
                </p>
                <div className="mt-2 space-y-1 bg-white/80 p-3 rounded-xl border border-rose-200 text-slate-800">
                  <p className="font-bold text-slate-900 text-sm">{tenantToDelete.name}</p>
                  <p className="text-slate-600 font-medium">Giáo viên: {tenantToDelete.teacherName}</p>
                  <p className="text-slate-500 text-[11px]">Môn: {tenantToDelete.schoolSubject}</p>
                  <p className="font-mono text-slate-400 text-[10px]">Mã ID: {tenantToDelete.id}</p>
                </div>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 text-slate-600 space-y-1 text-[11px]">
                <p className="font-semibold text-slate-800">Lưu ý quan trọng:</p>
                <ul className="list-disc list-inside space-y-0.5 text-slate-500">
                  <li>Toàn bộ lớp học, học sinh, điểm danh, bài tập thuộc Tenant này sẽ bị gỡ bỏ khỏi hệ thống.</li>
                  <li>Dữ liệu trên máy chủ Cloud Firestore cũng sẽ được đồng bộ xóa sạch.</li>
                  <li>Hành động này không thể hoàn tác.</li>
                </ul>
              </div>

              <div className="pt-2 flex items-center justify-end space-x-2.5">
                <button
                  type="button"
                  onClick={() => setTenantToDelete(null)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors cursor-pointer"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="button"
                  onClick={confirmDeleteTenant}
                  className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs transition-colors shadow-xs flex items-center space-x-1.5 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Xóa Vĩnh Viễn Tenant</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

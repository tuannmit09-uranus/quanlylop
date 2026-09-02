import {
  Tenant,
  School,
  Subject,
  ClassRoom,
  Student,
  Parent,
  ParentStudent,
  AccountInvitation,
  RecurringSchedule,
  LessonSession,
  Lesson,
  AttendanceRecord,
  StudentEvaluation,
  Homework,
  HomeworkSubmission,
  CommentItem,
  TuitionItem,
  BankStatement,
  BankTransaction,
  NotificationItem,
  AuditLog,
} from '../types';

export const INITIAL_TENANTS: Tenant[] = [
  {
    id: 'tenant-tuan',
    name: 'CLB Toán Thầy Tuấn - Luyện Thi Chuyên & ĐH',
    teacherName: 'Thầy Nguyễn Văn Tuấn',
    phone: '0988 888 999',
    email: 'thaytuan.math@edututor.vn',
    schoolSubject: 'Toán học THCS & THPT',
    created_at: '2026-01-10',
    paymentAccount: {
      id: 'pay-acc-1',
      tenant_id: 'tenant-tuan',
      bankName: 'Vietcombank',
      bankCode: 'VCB',
      accountNumber: '1018999988',
      accountName: 'NGUYEN VAN TUAN',
      isDefault: true,
    },
  },
  {
    id: 'tenant-tonga',
    name: 'Lớp Học Toán Cô Tống Nga',
    teacherName: 'Cô Tống Nga',
    phone: '0912 345 678',
    email: 'tonga190984@gmail.com',
    schoolSubject: 'Toán học THCS & THPT',
    created_at: '2026-01-15',
    paymentAccount: {
      id: 'pay-acc-tonga',
      tenant_id: 'tenant-tonga',
      bankName: 'Vietcombank',
      bankCode: 'VCB',
      accountNumber: '9988776655',
      accountName: 'TONG NGA',
      isDefault: true,
    },
  },
];

export const INITIAL_SCHOOLS: School[] = [
  {
    id: 'sch-pbc',
    tenant_id: 'tenant-tuan',
    code: 'PBC',
    name: 'THPT Chuyên Phan Bội Châu',
    address: 'Số 119 Lê Hồng Phong, TP. Vinh',
    status: 'active',
    created_at: '2026-01-15',
  },
  {
    id: 'sch-mk',
    tenant_id: 'tenant-tuan',
    code: 'MK',
    name: 'THPT Nguyễn Thị Minh Khai',
    address: 'Quận 3, TP. Hồ Chí Minh',
    status: 'active',
    created_at: '2026-01-15',
  },
  {
    id: 'sch-cva',
    tenant_id: 'tenant-tuan',
    code: 'CVA',
    name: 'THPT Chu Văn An',
    address: 'Thụy Khuê, Tây Hồ, Hà Nội',
    status: 'active',
    created_at: '2026-01-15',
  },
  {
    id: 'sch-lqd',
    tenant_id: 'tenant-tuan',
    code: 'LQD',
    name: 'THPT Lê Quý Đôn',
    address: 'Quận 3, TP. Hồ Chí Minh',
    status: 'active',
    created_at: '2026-02-01',
  },
];

export const INITIAL_SUBJECTS: Subject[] = [
  {
    id: 'sub-toan',
    tenant_id: 'tenant-tuan',
    code: 'TOAN',
    name: 'Toán Học',
    color: '#2563eb', // Blue
    description: 'Đại số, Giải tích và Hình học không gian',
    status: 'active',
  },
  {
    id: 'sub-ly',
    tenant_id: 'tenant-tuan',
    code: 'LY',
    name: 'Vật Lý',
    color: '#7c3aed', // Purple
    description: 'Cơ học, Nhiệt học và Điện từ',
    status: 'active',
  },
  {
    id: 'sub-hoa',
    tenant_id: 'tenant-tuan',
    code: 'HOA',
    name: 'Hóa Học',
    color: '#ea580c', // Orange
    description: 'Hóa vô cơ và Hóa hữu cơ',
    status: 'active',
  },
];

export const INITIAL_CLASSES: ClassRoom[] = [];
export const INITIAL_STUDENTS: Student[] = [];
export const INITIAL_PARENTS: Parent[] = [];
export const INITIAL_PARENT_STUDENTS: ParentStudent[] = [];
export const INITIAL_ACCOUNT_INVITATIONS: AccountInvitation[] = [];
export const INITIAL_RECURRING_SCHEDULES: RecurringSchedule[] = [];
export const INITIAL_LESSON_SESSIONS: LessonSession[] = [];
export const INITIAL_LESSONS: Lesson[] = [];
export const INITIAL_ATTENDANCE: AttendanceRecord[] = [];
export const INITIAL_EVALUATIONS: StudentEvaluation[] = [];
export const INITIAL_HOMEWORK: Homework[] = [];
export const INITIAL_SUBMISSIONS: HomeworkSubmission[] = [];
export const INITIAL_COMMENTS: CommentItem[] = [];
export const INITIAL_TUITION_ITEMS: TuitionItem[] = [];

export const INITIAL_BANK_STATEMENT: BankStatement = {
  id: 'stmt-empty',
  tenant_id: 'tenant-tuan',
  fileName: 'Chưa có sao kê',
  month: new Date().getMonth() + 1,
  year: new Date().getFullYear(),
  totalTransactions: 0,
  totalCreditAmount: 0,
  status: 'imported',
  uploadedAt: new Date().toISOString(),
};

export const INITIAL_BANK_TRANSACTIONS: BankTransaction[] = [];
export const INITIAL_NOTIFICATIONS: NotificationItem[] = [];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'log-create-tenant-tuan',
    tenant_id: 'tenant-tuan',
    actorId: 'usr-tenant-tuan',
    actorName: 'Thầy Nguyễn Văn Tuấn',
    actorRole: 'teacher',
    action: 'create',
    entityType: 'tenant',
    entityId: 'tenant-tuan',
    description: 'Đăng ký & Khởi tạo Không Gian Dạy Thêm (Tenant): "CLB Toán Thầy Tuấn - Luyện Thi Chuyên & ĐH"',
    newValue: '{"name":"CLB Toán Thầy Tuấn - Luyện Thi Chuyên & ĐH","teacherName":"Thầy Nguyễn Văn Tuấn","subject":"Toán học THCS & THPT"}',
    timestamp: '2026-01-10 08:30:00',
  },
  {
    id: 'log-update-vcb-tuan',
    tenant_id: 'tenant-tuan',
    actorId: 'admin-system',
    actorName: 'Quản Trị Viên (Admin)',
    actorRole: 'admin',
    action: 'update',
    entityType: 'tenant',
    entityId: 'tenant-tuan',
    description: 'Xác thực & Cấu hình tài khoản VietQR ngân hàng thụ hưởng cho Tenant CLB Toán Thầy Tuấn',
    newValue: 'Vietcombank - 1018999988 (NGUYEN VAN TUAN)',
    timestamp: '2026-01-11 09:15:00',
  },
];

export const DEFAULT_CUSTOM_CREDENTIALS: Record<string, string> = {
  'tonga190984@gmail.com': '123456a@',
  'tuannmit09@gmail.com': '123456',
  'tuannmit09@uranustech.vn': '123456',
  'thaytuan.math@edututor.vn': '123456',
};

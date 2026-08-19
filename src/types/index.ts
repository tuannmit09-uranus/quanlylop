export type UserRole = 'admin' | 'teacher' | 'parent' | 'student';

export type AccountStatus = 'uninvited' | 'invited' | 'active' | 'locked';
export type InvitationStatus = 'pending' | 'sent' | 'accepted' | 'expired' | 'revoked';
export type InvitationType = 'student' | 'parent';
export type ParentRelationship = 'Bố' | 'Mẹ' | 'Người giám hộ' | string;

export interface Tenant {
  id: string;
  name: string;
  teacherName: string;
  phone: string;
  email: string;
  avatar?: string;
  schoolSubject: string;
  paymentAccount?: PaymentAccount;
  created_at: string;
}

export interface UserProfile {
  id: string;
  tenant_id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  avatar?: string;
  status?: 'active' | 'locked' | 'disabled';
  linkedStudentIds?: string[]; // For parent / student
  created_at?: string;
  last_login_at?: string;
}

export interface Parent {
  id: string;
  tenant_id: string;
  user_id?: string;
  fullName: string;
  phone: string;
  email?: string;
  accountStatus: AccountStatus;
  accountCreatedAt?: string;
  lastActivatedAt?: string;
  avatar?: string;
  created_at: string;
}

export interface ParentStudent {
  id: string;
  tenant_id: string;
  parent_id: string;
  student_id: string;
  relationship: ParentRelationship;
  is_primary: boolean;
  created_at: string;
  updated_at?: string;
}

export interface AccountInvitation {
  id: string;
  tenant_id: string;
  student_id: string;
  parent_id?: string;
  invitation_type: InvitationType;
  recipient_name: string;
  recipient_email?: string;
  recipient_phone?: string;
  token_hash: string;
  token: string;
  expires_at: string; // ISO String
  status: InvitationStatus;
  created_by: string;
  created_at: string;
  accepted_at?: string;
}

export interface PaymentAccount {
  id: string;
  tenant_id: string;
  bankName: string;
  bankCode: string; // e.g. 'VCB', 'MB', 'TCB', 'ICB', 'ACB', 'BIDV'
  accountNumber: string;
  accountName: string;
  isDefault: boolean;
}

export interface School {
  id: string;
  tenant_id: string;
  code: string; // e.g. 'PBC', 'MK', 'CVA', 'LQD'
  name: string; // e.g. 'THPT Phan Bội Châu'
  address?: string;
  status: 'active' | 'inactive';
  created_at: string;
}

export interface Subject {
  id: string;
  tenant_id: string;
  code: string;
  name: string;
  color: string;
  description?: string;
  status: 'active' | 'inactive';
}

export interface ClassRoom {
  id: string;
  tenant_id: string;
  name: string; // e.g. 'Toán 10A1 - Nâng Cao'
  subjectId: string;
  subjectName: string;
  gradeLevel?: string; // 'Khối lớp 10' | 'Khối lớp 11' | 'Khối lớp 12'
  feePerSession: number; // e.g. 100000 VNĐ
  description?: string;
  studentIds: string[];
  status: 'active' | 'inactive';
  room?: string;
  created_at: string;
}

export interface Student {
  id: string;
  tenant_id: string;
  user_id?: string; // Linked authenticated user ID
  fullName: string;
  dob: string; // YYYY-MM-DD
  birthYear: number; // e.g. 2010 -> K10
  phone: string;
  email?: string;
  schoolId: string;
  schoolCode: string;
  schoolName: string;
  schoolGrade: string; // e.g. '10A1'
  parentName: string;
  parentPhone: string;
  parentEmail?: string;
  enrolledClassIds: string[];
  status: 'active' | 'paused' | 'graduated';
  accountStatus?: AccountStatus;
  accountCreatedAt?: string;
  lastActivatedAt?: string;
  avatar?: string;
  notes?: string;
  joinedDate: string;
}

export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0=Sunday, 1=Monday...

export interface RecurringSchedule {
  id: string;
  tenant_id: string;
  classId: string;
  className: string;
  dayOfWeek: DayOfWeek; // 1 = Thứ 2, 2 = Thứ 3...
  startTime: string; // "18:00"
  endTime: string; // "20:00"
  startDate: string; // "2026-06-01"
  endDate?: string;
  status: 'active' | 'inactive';
}

export type SessionType = 'regular' | 'rescheduled' | 'make_up' | 'extra';
export type SessionStatus = 'scheduled' | 'completed' | 'cancelled';

export interface LessonSession {
  id: string;
  tenant_id: string;
  classId: string;
  className: string;
  date: string; // "YYYY-MM-DD"
  dayOfWeek: DayOfWeek;
  startTime: string; // "18:00"
  endTime: string; // "20:00"
  sessionType: SessionType;
  status: SessionStatus;
  feeEligible: boolean; // CRITICAL: BR-003, BR-004
  originalSessionId?: string; // If rescheduled / makeup
  replacementSessionId?: string;
  cancelReason?: string;
  extraSessionReason?: string;
  lessonId?: string;
  created_at: string;
}

export interface Lesson {
  id: string;
  tenant_id: string;
  title: string; // Tên bài học
  gradeLevel?: string; // 'Khối lớp 10' | 'Khối lớp 11' | 'Khối lớp 12'
  content: string; // Tóm tắt giáo án
  homeworkSummary?: string; // Bài tập
  classId?: string;
  className?: string;
  sessionId?: string;
  sessionDate?: string;
  date?: string;
  lessonNotes?: string;
  status?: string;
  attachments?: string[];
  created_at: string;
}

export type AttendanceStatus = 'present' | 'absent' | 'excused' | 'unexcused' | 'pending';

export interface AttendanceRecord {
  id: string;
  tenant_id: string;
  sessionId: string;
  classId: string;
  studentId: string;
  studentName: string;
  status: AttendanceStatus;
  note?: string;
  updated_at: string;
}

export interface StudentEvaluation {
  id: string;
  tenant_id: string;
  lessonId: string;
  sessionId?: string;
  studentId: string;
  studentName: string;
  classId?: string;
  remarks?: string; // Nhận xét của giáo viên
  classFeedback?: string;
  homeworkFeedback?: string;
  attitude?: string;
  classScore?: number; // 0 - 10
  homeworkScore?: number; // 0 - 10
  attendanceStatus?: AttendanceStatus;
  updated_at: string;
}

export type Evaluation = StudentEvaluation;

export interface Homework {
  id: string;
  tenant_id: string;
  classId: string;
  className: string;
  lessonId?: string;
  title: string;
  description: string;
  dueDate: string; // YYYY-MM-DD
  dueTime?: string;
  problemPhotos?: string[];
  totalPoints: number; // default 10
  status: 'assigned' | 'closed';
  created_at: string;
}

export interface HomeworkSubmission {
  id: string;
  tenant_id: string;
  homeworkId: string;
  studentId: string;
  studentName: string;
  submittedAt: string;
  submissionPhotos: string[];
  studentNotes?: string;
  status: 'submitted' | 'graded';
  grade?: number; // 0 - 10
  teacherFeedback?: string;
  gradedPhotos?: string[];
  gradedAt?: string;
}

export interface CommentItem {
  id: string;
  tenant_id: string;
  entityType: 'lesson_evaluation' | 'homework' | 'submission';
  entityId: string;
  authorId: string;
  authorName: string;
  authorRole: UserRole;
  authorAvatar?: string;
  content: string;
  created_at: string;
}

export type TuitionStatus = 'draft' | 'issued' | 'unpaid' | 'paid' | 'partial' | 'overpaid';

export interface TuitionItem {
  id: string;
  tenant_id: string;
  periodMonth: number; // e.g. 7
  periodYear: number; // e.g. 2026
  studentId: string;
  studentName: string;
  schoolCode: string;
  birthYear: number;
  classId: string;
  className: string;
  feePerSession: number;
  eligibleSessionIds: string[]; // List of session IDs counted for fee
  sessionCount: number; // Count of fee-eligible sessions
  totalAmount: number; // sessionCount * feePerSession
  adjustmentAmount?: number; // +/- adjustment
  adjustmentReason?: string;
  paidAmount: number;
  status: TuitionStatus;
  paymentReference: string; // Format: PBC_K10_Tuan_T7_2026
  lockedAt?: string;
  paidAt?: string;
  bankTransactionId?: string;
  qrUrl?: string;
  created_at: string;
  updated_at: string;
}

export interface BankStatement {
  id: string;
  tenant_id: string;
  fileName: string;
  month: number;
  year: number;
  uploadedAt: string;
  totalTransactions: number;
  totalCreditAmount: number;
  status: 'imported' | 'reconciled';
}

export interface BankTransaction {
  id: string;
  tenant_id: string;
  stt?: number;
  docNo?: string;
  statementId: string;
  statementMonth: number;
  statementYear: number;
  transactionDate: string; // YYYY-MM-DD or DD/MM/YYYY
  amount: number; // Số tiền giao dịch (ghi có)
  description: string; // Transfer memo / Nội dung giao dịch
  bankName?: string;
  accountNumber?: string;
  senderName?: string;
  matchedTuitionId?: string;
  matchedStudentName?: string;
  matchedPaymentReference?: string;
  reconciliationStatus: 'matched' | 'unmatched' | 'discrepancy' | 'manual_matched';
  reconciledAt?: string;
  notes?: string;
}

export interface NotificationItem {
  id: string;
  tenant_id: string;
  recipientRole: UserRole;
  recipientId?: string; // Optional user or student ID
  type: 'tuition_unpaid' | 'tuition_paid' | 'homework_assigned' | 'homework_graded' | 'lesson_added' | 'attendance_alert' | 'account_invitation' | 'general';
  title: string;
  content: string;
  linkUrl?: string;
  isRead: boolean;
  created_at: string;
}

export interface AuditLog {
  id: string;
  tenant_id: string;
  actorId: string;
  actorName: string;
  actorRole: UserRole;
  action:
    | 'create'
    | 'update'
    | 'delete'
    | 'lock_tuition'
    | 'unlock_tuition'
    | 'reconcile_match'
    | 'manual_reconcile'
    | 'reschedule_session'
    | 'cancel_session'
    | 'issue_account'
    | 'send_invitation'
    | 'invite_student'
    | 'invite_parent'
    | 'bulk_invite'
    | 'resend_invitation'
    | 'revoke_invitation'
    | 'lock_account'
    | 'unlock_account'
    | 'activate_account'
    | 'link_parent'
    | 'unlink_parent';
  entityType: string;
  entityId: string;
  description: string;
  oldValue?: string;
  newValue?: string;
  timestamp: string;
}

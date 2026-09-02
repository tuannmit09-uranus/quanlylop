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

export const INITIAL_TENANTS: Tenant[] = [];

export const INITIAL_SCHOOLS: School[] = [];

export const INITIAL_SUBJECTS: Subject[] = [];

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
  tenant_id: '',
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

export const INITIAL_AUDIT_LOGS: AuditLog[] = [];

export const DEFAULT_CUSTOM_CREDENTIALS: Record<string, string> = {
  'tuannmit09@gmail.com': '123456',
  'tuannmit09@uranustech.vn': '123456',
};


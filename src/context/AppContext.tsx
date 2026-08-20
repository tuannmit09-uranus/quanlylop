import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Tenant,
  UserRole,
  School,
  Subject,
  ClassRoom,
  Student,
  Parent,
  ParentStudent,
  AccountInvitation,
  AccountStatus,
  InvitationStatus,
  InvitationType,
  ParentRelationship,
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
  PaymentAccount,
  SessionType,
  SessionStatus,
  TuitionStatus,
} from '../types';
import {
  INITIAL_TENANTS,
  INITIAL_SCHOOLS,
  INITIAL_SUBJECTS,
  INITIAL_CLASSES,
  INITIAL_STUDENTS,
  INITIAL_PARENTS,
  INITIAL_PARENT_STUDENTS,
  INITIAL_ACCOUNT_INVITATIONS,
  INITIAL_RECURRING_SCHEDULES,
  INITIAL_LESSON_SESSIONS,
  INITIAL_LESSONS,
  INITIAL_ATTENDANCE,
  INITIAL_EVALUATIONS,
  INITIAL_HOMEWORK,
  INITIAL_SUBMISSIONS,
  INITIAL_COMMENTS,
  INITIAL_TUITION_ITEMS,
  INITIAL_BANK_STATEMENT,
  INITIAL_BANK_TRANSACTIONS,
  INITIAL_NOTIFICATIONS,
  INITIAL_AUDIT_LOGS,
} from '../data/initialData';
import { generatePaymentReference, removeVietnameseAccents } from '../utils/vietqr';
import { testFirebaseConnection } from '../lib/firebase';
import {
  seedCollectionIfEmpty,
  syncSaveToFirestore,
  syncDeleteFromFirestore,
} from '../lib/firestoreSync';
import confetti from 'canvas-confetti';

interface AppContextType {
  // Tenant & Role
  currentTenant: Tenant;
  tenants: Tenant[];
  switchTenant: (tenantId: string) => void;
  updateTenant: (tenant: Partial<Tenant>, targetTenantId?: string) => void;
  addTenant: (tenant: Omit<Tenant, 'id' | 'created_at'>) => Tenant;
  deleteTenant: (tenantId: string) => void;
  currentRole: UserRole;
  switchRole: (role: UserRole) => void;
  activeStudentId: string; // for parent/student role
  setActiveStudentId: (id: string) => void;
  currentUser: { id: string; name: string; email: string; role: UserRole; tenant_id: string; avatar?: string } | null;
  setCurrentUser: (user: { id: string; name: string; email: string; role: UserRole; tenant_id: string; avatar?: string } | null) => void;

  // Master Data
  schools: School[];
  addSchool: (school: Omit<School, 'id' | 'tenant_id' | 'created_at'>) => void;
  updateSchool: (id: string, school: Partial<School>) => void;
  deleteSchool: (id: string) => void;

  subjects: Subject[];
  addSubject: (subject: Omit<Subject, 'id' | 'tenant_id'>) => void;
  updateSubject: (id: string, subject: Partial<Subject>) => void;
  deleteSubject: (id: string) => void;

  classes: ClassRoom[];
  addClass: (cls: Omit<ClassRoom, 'id' | 'tenant_id' | 'created_at'>) => void;
  updateClass: (id: string, cls: Partial<ClassRoom>) => void;
  deleteClass: (id: string) => void;
  assignStudentToClass: (classId: string, studentId: string) => void;
  removeStudentFromClass: (classId: string, studentId: string) => void;

  // Students
  students: Student[];
  addStudent: (student: Omit<Student, 'id' | 'tenant_id' | 'joinedDate'>) => void;
  updateStudent: (id: string, student: Partial<Student>) => void;
  deleteStudent: (id: string) => void;

  // Parents & Relationships & Account Management
  parents: Parent[];
  parentStudents: ParentStudent[];
  accountInvitations: AccountInvitation[];
  addParent: (parent: Omit<Parent, 'id' | 'tenant_id' | 'created_at'>) => Parent;
  updateParent: (id: string, parent: Partial<Parent>) => void;
  deleteParent: (id: string) => void;
  linkParentToStudent: (parentId: string, studentId: string, relationship?: string, is_primary?: boolean) => void;
  unlinkParentStudent: (parentStudentId: string) => void;
  issueStudentInvitation: (studentId: string, email?: string, phone?: string) => { success: boolean; message: string; invitation?: AccountInvitation; activationLink?: string };
  issueParentInvitation: (studentId: string, parentData: { fullName: string; relationship: string; phone: string; email?: string; is_primary: boolean }) => { success: boolean; message: string; invitation?: AccountInvitation; activationLink?: string };
  resendInvitation: (invitationId: string) => { success: boolean; message: string; invitation?: AccountInvitation; activationLink?: string };
  revokeInvitation: (invitationId: string) => { success: boolean; message: string };
  toggleUserLock: (targetType: 'student' | 'parent', targetId: string, lock: boolean) => void;
  bulkIssueStudentInvitations: (studentIds: string[]) => { created: number; skipped: number; missingInfo: number; alreadyHasAccount: number; results: any[] };
  validateInvitationToken: (token: string) => { valid: boolean; error?: string; invitation?: AccountInvitation; student?: Student; parent?: Parent; tenant?: Tenant };
  activateAccountWithPassword: (token: string, password: string) => Promise<{ success: boolean; error?: string; user?: any }>;
  getStudentParents: (studentId: string) => Array<{ parent: Parent; link: ParentStudent }>;
  getParentStudents: (parentId: string) => Array<{ student: Student; link: ParentStudent }>;
  getStudentInvitation: (studentId: string) => AccountInvitation | undefined;
  getParentInvitation: (parentId: string) => AccountInvitation | undefined;

  // Schedules & Sessions
  recurringSchedules: RecurringSchedule[];
  addRecurringSchedule: (schedule: Omit<RecurringSchedule, 'id' | 'tenant_id'>) => void;
  updateRecurringSchedule: (id: string, schedule: Partial<RecurringSchedule>) => void;
  deleteRecurringSchedule: (id: string) => void;
  generateSessionsForMonth: (classId: string, month: number, year: number) => LessonSession[];

  lessonSessions: LessonSession[];
  addLessonSession: (session: Omit<LessonSession, 'id' | 'tenant_id' | 'created_at'>) => void;
  updateLessonSession: (id: string, session: Partial<LessonSession>) => void;
  cancelLessonSession: (id: string, reason: string, createMakeup?: boolean, makeupDate?: string) => void;
  rescheduleLessonSession: (id: string, newDate: string, reason: string) => void;
  toggleFeeEligibility: (id: string) => void;

  // Lessons & Attendance & Evaluations
  lessons: Lesson[];
  addLesson: (lesson: Omit<Lesson, 'id' | 'tenant_id' | 'created_at'>) => void;
  updateLesson: (id: string, lesson: Partial<Lesson>) => void;
  deleteLesson?: (id: string) => void;

  attendance: AttendanceRecord[];
  updateAttendance: (id: string, status: AttendanceRecord['status'], note?: string) => void;
  bulkMarkAttendance: (sessionId: string, classId: string, status: AttendanceRecord['status']) => void;

  evaluations: StudentEvaluation[];
  updateEvaluation: (id: string, evalData: Partial<StudentEvaluation>) => void;
  addEvaluation?: (evalData: Partial<StudentEvaluation> & { studentId: string; lessonId: string; classScore: number; classFeedback: string }) => void;
  markAttendance?: (sessionId: string, studentId: string, status: AttendanceRecord['status'], note?: string) => void;
  removeAttendance?: (sessionId: string, studentId: string) => void;
  clearSessionAttendance?: (sessionId: string) => void;
  markAllPresent?: (sessionId: string, classId: string) => void;

  // Homework & Submissions
  homeworks: Homework[];
  addHomework: (hw: Omit<Homework, 'id' | 'tenant_id' | 'created_at'>) => void;
  updateHomework: (id: string, hw: Partial<Homework>) => void;

  submissions: HomeworkSubmission[];
  submitHomework: (homeworkId: string, studentId: string, photos: string[], notes?: string) => void;
  gradeSubmission: (id: string, grade: number, feedback: string, gradedPhotos?: string[]) => void;
  gradeHomework?: (id: string, grade: number, feedback: string, gradedPhotos?: string[]) => void;

  // Comments
  comments: CommentItem[];
  addComment: (entityType: CommentItem['entityType'], entityId: string, content: string) => void;

  // Tuition & QR Payment
  tuitionItems: TuitionItem[];
  calculateMonthlyTuition: (month: number, year: number, classId?: string) => void;
  calculateTuitionForMonth?: (month?: number, year?: number, classId?: string) => void;
  lockMonthlyTuition: (month: number, year: number) => void;
  adjustTuitionSessions: (tuitionId: string, sessionIds: string[], reason?: string) => void;
  updateTuitionStatus: (id: string, status: TuitionStatus, paidAmount?: number) => void;

  // Bank Statements & Automated Reconciliation
  bankStatements: BankStatement[];
  bankTransactions: BankTransaction[];
  importBankStatement: (
    month: number,
    year: number,
    fileName: string,
    txns: Omit<BankTransaction, 'id' | 'tenant_id' | 'statementId' | 'statementMonth' | 'statementYear'>[],
    overwrite?: boolean
  ) => void;
  addBankTransaction?: (txn: Partial<BankTransaction> & { amount: number; description: string }) => void;
  deleteBankTransaction: (txnId: string) => void;
  clearBankTransactionsForMonth: (month: number, year: number) => void;
  runAutomatedReconciliation: (month?: number, year?: number) => { matchedCount: number; discrepancyCount: number };
  manualMatchTransaction: (txnId: string, tuitionId: string) => void;
  unlinkTransaction: (txnId: string) => void;

  // Payment Account
  paymentAccount: PaymentAccount;
  updatePaymentAccount: (account: Partial<PaymentAccount>) => void;

  // Notifications & Audit Logs
  notifications: NotificationItem[];
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  auditLogs: AuditLog[];

  // Quick Reset
  resetToDemoData: () => void;
  resetData?: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load from localStorage or Initial
  const [tenants, setTenants] = useState<Tenant[]>(() => {
    const saved = localStorage.getItem('edututor_tenants');
    if (saved) {
      try {
        const parsed: Tenant[] = JSON.parse(saved);
        const cleaned = parsed.filter((t) => t.id !== 'tenant-nga' && t.id !== 'tenant-mai');
        if (cleaned.length > 0) {
          const hasTuan = cleaned.some((t) => t.id === 'tenant-tuan');
          return hasTuan ? cleaned : [INITIAL_TENANTS[0], ...cleaned];
        }
      } catch {}
    }
    return INITIAL_TENANTS;
  });

  const [currentTenantId, setCurrentTenantId] = useState<string>(() => {
    const saved = localStorage.getItem('edututor_current_tenant_id');
    return (saved && saved !== 'tenant-nga' && saved !== 'tenant-mai') ? saved : 'tenant-tuan';
  });

  const [currentRole, setCurrentRole] = useState<UserRole>('teacher');
  const [activeStudentId, setActiveStudentId] = useState<string>(() => {
    const saved = localStorage.getItem('edututor_active_student_id');
    return saved || 'stu-1';
  });
  const [currentUser, setCurrentUser] = useState<{ id: string; name: string; email: string; role: UserRole; tenant_id: string; avatar?: string } | null>(() => {
    const saved = localStorage.getItem('edututor_current_user');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.name === 'Thầy Nguyễn Văn An' || parsed.email === 'teacher.an@edututor.vn') {
          parsed.name = 'Thầy Nguyễn Văn Tuấn';
          parsed.email = 'thaytuan.math@edututor.vn';
          parsed.tenant_id = 'tenant-tuan';
          localStorage.setItem('edututor_current_user', JSON.stringify(parsed));
        }
        return parsed;
      } catch {
        return null;
      }
    }
    return null;
  });

  const currentTenant = tenants.find((t) => t.id === currentTenantId) || tenants[0] || INITIAL_TENANTS[0];

  const normalizeTenantList = <T extends { tenant_id?: string }>(items: T[]): T[] => {
    return items.map((item) => {
      if (!item.tenant_id || item.tenant_id === 'tenant-nga' || item.tenant_id === 'tenant-mai') {
        return { ...item, tenant_id: 'tenant-tuan' };
      }
      return item;
    });
  };

  const [schools, setSchools] = useState<School[]>(() => {
    const saved = localStorage.getItem('edututor_schools');
    const list = saved ? JSON.parse(saved) : INITIAL_SCHOOLS;
    return normalizeTenantList(list);
  });

  const [subjects, setSubjects] = useState<Subject[]>(() => {
    const saved = localStorage.getItem('edututor_subjects');
    const list = saved ? JSON.parse(saved) : INITIAL_SUBJECTS;
    return normalizeTenantList(list);
  });

  const [classes, setClasses] = useState<ClassRoom[]>(() => {
    const saved = localStorage.getItem('edututor_classes');
    const list = saved ? JSON.parse(saved) : INITIAL_CLASSES;
    return normalizeTenantList(list);
  });

  const [students, setStudents] = useState<Student[]>(() => {
    const saved = localStorage.getItem('edututor_students');
    const list = saved ? JSON.parse(saved) : INITIAL_STUDENTS;
    return normalizeTenantList(list);
  });

  const [parents, setParents] = useState<Parent[]>(() => {
    const saved = localStorage.getItem('edututor_parents');
    const list = saved ? JSON.parse(saved) : INITIAL_PARENTS;
    return normalizeTenantList(list);
  });

  const [parentStudents, setParentStudents] = useState<ParentStudent[]>(() => {
    const saved = localStorage.getItem('edututor_parent_students');
    const list = saved ? JSON.parse(saved) : INITIAL_PARENT_STUDENTS;
    return normalizeTenantList(list);
  });

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('edututor_current_user', JSON.stringify(currentUser));
      if (currentUser.role === 'admin') {
        setCurrentRole('admin');
      } else if (currentUser.tenant_id && currentUser.role === 'teacher') {
        setCurrentTenantId(currentUser.tenant_id);
        localStorage.setItem('edututor_current_tenant_id', currentUser.tenant_id);
        setCurrentRole(currentUser.role);
      } else {
        setCurrentRole(currentUser.role);
      }

      // Automatically sync activeStudentId based on logged-in user
      if (currentUser.role === 'student') {
        const matched = students.find((s) =>
          s.user_id === currentUser.id ||
          s.id === currentUser.id ||
          `usr-stu-${s.id}` === currentUser.id ||
          (currentUser.email && s.email && s.email.toLowerCase() === currentUser.email.toLowerCase()) ||
          (currentUser.name && s.fullName.toLowerCase() === currentUser.name.toLowerCase()) ||
          (s.phone && currentUser.email && currentUser.email.includes(s.phone.replace(/\D/g, '')))
        );
        if (matched) {
          setActiveStudentId(matched.id);
          localStorage.setItem('edututor_active_student_id', matched.id);
        }
      } else if (currentUser.role === 'parent') {
        const matchedPar = parents.find((p) =>
          p.user_id === currentUser.id ||
          p.id === currentUser.id ||
          `usr-par-${p.id}` === currentUser.id ||
          (currentUser.email && p.email && p.email.toLowerCase() === currentUser.email.toLowerCase()) ||
          (currentUser.name && p.fullName.toLowerCase() === currentUser.name.toLowerCase()) ||
          (p.phone && currentUser.email && currentUser.email.includes(p.phone.replace(/\D/g, '')))
        );
        if (matchedPar) {
          const links = parentStudents.filter((ps) => ps.parent_id === matchedPar.id);
          if (links.length > 0) {
            const primary = links.find((l) => l.is_primary) || links[0];
            setActiveStudentId(primary.student_id);
            localStorage.setItem('edututor_active_student_id', primary.student_id);
          }
        }
      }
    } else {
      localStorage.removeItem('edututor_current_user');
    }
  }, [currentUser, students, parents, parentStudents]);

  const [accountInvitations, setAccountInvitations] = useState<AccountInvitation[]>(() => {
    const saved = localStorage.getItem('edututor_account_invitations');
    const list = saved ? JSON.parse(saved) : INITIAL_ACCOUNT_INVITATIONS;
    return normalizeTenantList(list);
  });

  const [recurringSchedules, setRecurringSchedules] = useState<RecurringSchedule[]>(() => {
    const saved = localStorage.getItem('edututor_schedules');
    const list = saved ? JSON.parse(saved) : INITIAL_RECURRING_SCHEDULES;
    return normalizeTenantList(list);
  });

  const [lessonSessions, setLessonSessions] = useState<LessonSession[]>(() => {
    const saved = localStorage.getItem('edututor_sessions');
    const list = saved ? JSON.parse(saved) : INITIAL_LESSON_SESSIONS;
    return normalizeTenantList(list);
  });

  const [lessons, setLessons] = useState<Lesson[]>(() => {
    const saved = localStorage.getItem('edututor_lessons');
    const list = saved ? JSON.parse(saved) : INITIAL_LESSONS;
    return normalizeTenantList(list);
  });

  const [attendance, setAttendance] = useState<AttendanceRecord[]>(() => {
    const saved = localStorage.getItem('edututor_attendance');
    const list = saved ? JSON.parse(saved) : INITIAL_ATTENDANCE;
    return normalizeTenantList(list);
  });

  const [evaluations, setEvaluations] = useState<StudentEvaluation[]>(() => {
    const saved = localStorage.getItem('edututor_evaluations');
    const list = saved ? JSON.parse(saved) : INITIAL_EVALUATIONS;
    return normalizeTenantList(list);
  });

  const [homeworks, setHomeworks] = useState<Homework[]>(() => {
    const saved = localStorage.getItem('edututor_homeworks');
    const list = saved ? JSON.parse(saved) : INITIAL_HOMEWORK;
    return normalizeTenantList(list);
  });

  const [submissions, setSubmissions] = useState<HomeworkSubmission[]>(() => {
    const saved = localStorage.getItem('edututor_submissions');
    const list = saved ? JSON.parse(saved) : INITIAL_SUBMISSIONS;
    return normalizeTenantList(list);
  });

  const [comments, setComments] = useState<CommentItem[]>(() => {
    const saved = localStorage.getItem('edututor_comments');
    const list = saved ? JSON.parse(saved) : INITIAL_COMMENTS;
    return normalizeTenantList(list);
  });

  const [tuitionItems, setTuitionItems] = useState<TuitionItem[]>(() => {
    const saved = localStorage.getItem('edututor_tuitions');
    const items: TuitionItem[] = saved ? JSON.parse(saved) : INITIAL_TUITION_ITEMS;
    const mapped = items.map((t) => {
      if (t.classId && !t.id.includes(t.classId)) {
        return { ...t, id: `tui-${t.studentId}-${t.classId}-${t.periodMonth}${t.periodYear}` };
      }
      return t;
    });
    return normalizeTenantList(mapped);
  });

  const [bankStatements, setBankStatements] = useState<BankStatement[]>(() => {
    const saved = localStorage.getItem('edututor_bank_statements');
    const list = saved ? JSON.parse(saved) : [INITIAL_BANK_STATEMENT];
    return normalizeTenantList(list);
  });

  const [bankTransactions, setBankTransactions] = useState<BankTransaction[]>(() => {
    const saved = localStorage.getItem('edututor_bank_transactions');
    const list = saved ? JSON.parse(saved) : INITIAL_BANK_TRANSACTIONS;
    return normalizeTenantList(list);
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const saved = localStorage.getItem('edututor_notifications');
    const list = saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
    return normalizeTenantList(list);
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem('edututor_audit_logs');
    const list = saved ? JSON.parse(saved) : INITIAL_AUDIT_LOGS;
    return normalizeTenantList(list);
  });

  // Initialize and Sync Firebase Cloud Firestore on mount
  useEffect(() => {
    testFirebaseConnection();

    async function initFirestoreData() {
      try {
        const [
          fTenants,
          fSchools,
          fSubjects,
          fClasses,
          fStudents,
          fParents,
          fParentStudents,
          fAccountInvitations,
          fSchedules,
          fSessions,
          fLessons,
          fAttendance,
          fEvaluations,
          fHomeworks,
          fSubmissions,
          fComments,
          fTuitions,
          fStatements,
          fTransactions,
          fNotifications,
          fAuditLogs,
        ] = await Promise.all([
          seedCollectionIfEmpty('tenants', INITIAL_TENANTS),
          seedCollectionIfEmpty('schools', INITIAL_SCHOOLS),
          seedCollectionIfEmpty('subjects', INITIAL_SUBJECTS),
          seedCollectionIfEmpty('classes', INITIAL_CLASSES),
          seedCollectionIfEmpty('students', INITIAL_STUDENTS),
          seedCollectionIfEmpty('parents', INITIAL_PARENTS),
          seedCollectionIfEmpty('parent_students', INITIAL_PARENT_STUDENTS),
          seedCollectionIfEmpty('account_invitations', INITIAL_ACCOUNT_INVITATIONS),
          seedCollectionIfEmpty('schedules', INITIAL_RECURRING_SCHEDULES),
          seedCollectionIfEmpty('sessions', INITIAL_LESSON_SESSIONS),
          seedCollectionIfEmpty('lessons', INITIAL_LESSONS),
          seedCollectionIfEmpty('attendance', INITIAL_ATTENDANCE),
          seedCollectionIfEmpty('evaluations', INITIAL_EVALUATIONS),
          seedCollectionIfEmpty('homeworks', INITIAL_HOMEWORK),
          seedCollectionIfEmpty('submissions', INITIAL_SUBMISSIONS),
          seedCollectionIfEmpty('comments', INITIAL_COMMENTS),
          seedCollectionIfEmpty('tuitions', INITIAL_TUITION_ITEMS),
          seedCollectionIfEmpty('bankStatements', [INITIAL_BANK_STATEMENT]),
          seedCollectionIfEmpty('bankTransactions', INITIAL_BANK_TRANSACTIONS),
          seedCollectionIfEmpty('notifications', INITIAL_NOTIFICATIONS),
          seedCollectionIfEmpty('auditLogs', INITIAL_AUDIT_LOGS),
        ]);

        if (fTenants?.length) {
          const cleanedTenants = fTenants.filter((t) => t.id !== 'tenant-nga' && t.id !== 'tenant-mai');
          if (cleanedTenants.length > 0) {
            setTenants(cleanedTenants);
          }
        }
        if (fSchools?.length) setSchools(normalizeTenantList(fSchools));
        if (fSubjects?.length) setSubjects(normalizeTenantList(fSubjects));
        if (fClasses?.length) setClasses(normalizeTenantList(fClasses));
        if (fStudents?.length) setStudents(normalizeTenantList(fStudents));
        if (fParents?.length) setParents(normalizeTenantList(fParents));
        if (fParentStudents?.length) setParentStudents(normalizeTenantList(fParentStudents));
        if (fAccountInvitations?.length) setAccountInvitations(normalizeTenantList(fAccountInvitations));
        if (fSchedules?.length) setRecurringSchedules(normalizeTenantList(fSchedules));
        if (fSessions?.length) setLessonSessions(normalizeTenantList(fSessions));
        if (fLessons?.length) setLessons(normalizeTenantList(fLessons));
        if (fAttendance?.length) setAttendance(normalizeTenantList(fAttendance));
        if (fEvaluations?.length) setEvaluations(normalizeTenantList(fEvaluations));
        if (fHomeworks?.length) setHomeworks(normalizeTenantList(fHomeworks));
        if (fSubmissions?.length) setSubmissions(normalizeTenantList(fSubmissions));
        if (fComments?.length) setComments(normalizeTenantList(fComments));
        if (fTuitions?.length) setTuitionItems(normalizeTenantList(fTuitions));
        if (fStatements?.length) setBankStatements(normalizeTenantList(fStatements));
        if (fTransactions?.length) setBankTransactions(normalizeTenantList(fTransactions));
        if (fNotifications?.length) setNotifications(normalizeTenantList(fNotifications));
        if (fAuditLogs?.length) setAuditLogs(normalizeTenantList(fAuditLogs));
        console.log('Firebase Cloud Firestore synchronisation active and verified.');
      } catch (err) {
        console.warn('Firebase initial sync note:', err);
      }
    }

    initFirestoreData();
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('edututor_tenants', JSON.stringify(tenants));
    localStorage.setItem('edututor_current_tenant_id', currentTenantId);
    localStorage.setItem('edututor_schools', JSON.stringify(schools));
    localStorage.setItem('edututor_subjects', JSON.stringify(subjects));
    localStorage.setItem('edututor_classes', JSON.stringify(classes));
    localStorage.setItem('edututor_students', JSON.stringify(students));
    localStorage.setItem('edututor_parents', JSON.stringify(parents));
    localStorage.setItem('edututor_parent_students', JSON.stringify(parentStudents));
    localStorage.setItem('edututor_account_invitations', JSON.stringify(accountInvitations));
    localStorage.setItem('edututor_schedules', JSON.stringify(recurringSchedules));
    localStorage.setItem('edututor_sessions', JSON.stringify(lessonSessions));
    localStorage.setItem('edututor_lessons', JSON.stringify(lessons));
    localStorage.setItem('edututor_attendance', JSON.stringify(attendance));
    localStorage.setItem('edututor_evaluations', JSON.stringify(evaluations));
    localStorage.setItem('edututor_homeworks', JSON.stringify(homeworks));
    localStorage.setItem('edututor_submissions', JSON.stringify(submissions));
    localStorage.setItem('edututor_comments', JSON.stringify(comments));
    localStorage.setItem('edututor_tuitions', JSON.stringify(tuitionItems));
    localStorage.setItem('edututor_bank_statements', JSON.stringify(bankStatements));
    localStorage.setItem('edututor_bank_transactions', JSON.stringify(bankTransactions));
    localStorage.setItem('edututor_notifications', JSON.stringify(notifications));
    localStorage.setItem('edututor_audit_logs', JSON.stringify(auditLogs));
  }, [
    tenants,
    currentTenantId,
    schools,
    subjects,
    classes,
    students,
    parents,
    parentStudents,
    accountInvitations,
    recurringSchedules,
    lessonSessions,
    lessons,
    attendance,
    evaluations,
    homeworks,
    submissions,
    comments,
    tuitionItems,
    bankStatements,
    bankTransactions,
    notifications,
    auditLogs,
  ]);

  // Automatically calculate tuition reactively when attendance, sessions, classes or students change
  useEffect(() => {
    // Find all distinct month-year periods from lessonSessions
    const periods = new Map<string, { month: number; year: number }>();
    lessonSessions.forEach((s) => {
      const parts = s.date.split('-');
      if (parts.length === 3) {
        const year = Number(parts[0]);
        const month = Number(parts[1]);
        const key = `${month}-${year}`;
        periods.set(key, { month, year });
      }
    });

    if (periods.size === 0) return;

    setTuitionItems((prev) => {
      let isChanged = false;
      const currentTuitions = [...prev];

      periods.forEach(({ month, year }) => {
        classes.forEach((cls) => {
          if (cls.status !== 'active') return;

          cls.studentIds.forEach((studentId) => {
            const student = students.find((s) => s.id === studentId);
            if (!student) return;

            // Find sessions of this class in this month/year with feeEligible === true where student is 'present'
            const studentPresentSessions = lessonSessions.filter((s) => {
              if (s.classId !== cls.id) return false;
              if (!s.feeEligible) return false;
              if (s.status === 'cancelled') return false; // Exclude cancelled sessions
              const [sYear, sMonth] = s.date.split('-').map(Number);
              if (sYear !== year || sMonth !== month) return false;

              const attRecord = attendance.find(
                (a) => a.sessionId === s.id && a.studentId === studentId
              );
              return attRecord?.status === 'present';
            });

            const studentSessionIds = studentPresentSessions.map((s) => s.id);
            const studentSessionCount = studentSessionIds.length;
            const totalAmount = studentSessionCount * cls.feePerSession;

            const paymentReference = generatePaymentReference(
              student.schoolCode,
              student.birthYear,
              student.fullName,
              month,
              year,
              student.id,
              students
            );

            const existingIdx = currentTuitions.findIndex(
              (t) =>
                t.periodMonth === month &&
                t.periodYear === year &&
                t.studentId === studentId &&
                t.classId === cls.id
            );

            if (existingIdx >= 0) {
              const existing = currentTuitions[existingIdx];
              const expectedId = `tui-${studentId}-${cls.id}-${month}${year}`;
              // Check if any change actually occurred
              const hasSessionIdsChanged = JSON.stringify(existing.eligibleSessionIds) !== JSON.stringify(studentSessionIds);
              if (
                existing.id !== expectedId ||
                existing.sessionCount !== studentSessionCount ||
                existing.totalAmount !== totalAmount ||
                existing.paymentReference !== paymentReference ||
                hasSessionIdsChanged
              ) {
                isChanged = true;
                currentTuitions[existingIdx] = {
                  ...existing,
                  id: expectedId,
                  eligibleSessionIds: studentSessionIds,
                  sessionCount: studentSessionCount,
                  totalAmount,
                  feePerSession: cls.feePerSession,
                  paymentReference,
                  updated_at: new Date().toISOString().split('T')[0],
                };
              }
            } else {
              // Create new tuition item
              isChanged = true;
              currentTuitions.push({
                id: `tui-${studentId}-${cls.id}-${month}${year}`,
                tenant_id: currentTenant.id,
                periodMonth: month,
                periodYear: year,
                studentId,
                studentName: student.fullName,
                schoolCode: student.schoolCode,
                birthYear: student.birthYear,
                classId: cls.id,
                className: cls.name,
                feePerSession: cls.feePerSession,
                eligibleSessionIds: studentSessionIds,
                sessionCount: studentSessionCount,
                totalAmount,
                paidAmount: 0,
                status: 'draft',
                paymentReference,
                created_at: new Date().toISOString().split('T')[0],
                updated_at: new Date().toISOString().split('T')[0],
              });
            }
          });
        });
      });

      if (isChanged) {
        return currentTuitions;
      }
      return prev;
    });
  }, [attendance, lessonSessions, classes, students, currentTenant.id]);

  const addAuditLog = (
    action: AuditLog['action'],
    entityType: string,
    entityId: string,
    description: string,
    oldValue?: string,
    newValue?: string
  ) => {
    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      tenant_id: currentTenant.id,
      actorId: currentRole === 'admin' ? (currentUser?.id || 'admin') : (currentRole === 'teacher' ? 'user-teacher' : activeStudentId),
      actorName: currentRole === 'admin' ? 'Quản Trị Viên (Admin)' : (currentRole === 'teacher' ? currentTenant.teacherName : 'Học sinh / Phụ huynh'),
      actorRole: currentRole,
      action,
      entityType,
      entityId,
      description,
      oldValue,
      newValue,
      timestamp: new Date().toLocaleString('vi-VN'),
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  const switchTenant = (tenantId: string) => {
    const isAdmin = currentUser?.role === 'admin' || currentRole === 'admin';
    if (!isAdmin && currentUser?.role === 'teacher' && currentUser.tenant_id && currentUser.tenant_id !== tenantId) {
      console.warn('Giáo viên chỉ có quyền truy cập Tenant của mình');
      return;
    }
    setCurrentTenantId(tenantId);
    localStorage.setItem('edututor_current_tenant_id', tenantId);
    addAuditLog('update', 'tenant', tenantId, `Chuyển sang tenant: ${tenantId}`);
  };

  const updateTenant = (data: Partial<Tenant>, targetTenantId?: string) => {
    const tid = targetTenantId || currentTenant.id;
    setTenants((prev) => {
      const updated = prev.map((t) => (t.id === tid ? { ...t, ...data } : t));
      const targetObj = updated.find((t) => t.id === tid);
      if (targetObj) {
        syncSaveToFirestore('tenants', tid, targetObj);
      }
      return updated;
    });
    addAuditLog('update', 'tenant', tid, `Cập nhật thông tin Tenant: ${data.name || data.teacherName || tid}`);
  };

  const addTenant = (data: Omit<Tenant, 'id' | 'created_at'>): Tenant => {
    const newId = `tenant-${Date.now()}`;
    const newTenant: Tenant = {
      ...data,
      id: newId,
      created_at: new Date().toISOString().split('T')[0],
      paymentAccount: data.paymentAccount || {
        id: `pay-${newId}`,
        tenant_id: newId,
        bankName: 'Vietcombank',
        bankCode: 'VCB',
        accountNumber: '1018999988',
        accountName: (data.teacherName || 'GIAO VIEN').toUpperCase(),
        isDefault: true,
      },
    };
    setTenants((prev) => [...prev, newTenant]);
    syncSaveToFirestore('tenants', newId, newTenant);
    addAuditLog('create', 'tenant', newId, `Khởi tạo Tenant mới: ${newTenant.name}`);
    return newTenant;
  };

  const deleteTenant = (tenantId: string): boolean => {
    if (tenants.length <= 1) {
      console.warn('Không thể xóa Tenant duy nhất trong hệ thống!');
      return false;
    }

    const remaining = tenants.filter((t) => t.id !== tenantId);
    setTenants(remaining);
    syncDeleteFromFirestore('tenants', tenantId);

    if (currentTenantId === tenantId && remaining.length > 0) {
      setCurrentTenantId(remaining[0].id);
      localStorage.setItem('edututor_current_tenant_id', remaining[0].id);
    }

    // Clean up dependent collections in state & firestore for this tenant
    setClasses((prev) => {
      prev.filter((item) => item.tenant_id === tenantId).forEach((item) => syncDeleteFromFirestore('classes', item.id));
      return prev.filter((item) => item.tenant_id !== tenantId);
    });
    setStudents((prev) => {
      prev.filter((item) => item.tenant_id === tenantId).forEach((item) => syncDeleteFromFirestore('students', item.id));
      return prev.filter((item) => item.tenant_id !== tenantId);
    });
    setSchools((prev) => {
      prev.filter((item) => item.tenant_id === tenantId).forEach((item) => syncDeleteFromFirestore('schools', item.id));
      return prev.filter((item) => item.tenant_id !== tenantId);
    });
    setSubjects((prev) => {
      prev.filter((item) => item.tenant_id === tenantId).forEach((item) => syncDeleteFromFirestore('subjects', item.id));
      return prev.filter((item) => item.tenant_id !== tenantId);
    });
    setParents((prev) => {
      prev.filter((item) => item.tenant_id === tenantId).forEach((item) => syncDeleteFromFirestore('parents', item.id));
      return prev.filter((item) => item.tenant_id !== tenantId);
    });
    setParentStudents((prev) => {
      prev.filter((item) => item.tenant_id === tenantId).forEach((item) => syncDeleteFromFirestore('parent_students', item.id));
      return prev.filter((item) => item.tenant_id !== tenantId);
    });
    setAccountInvitations((prev) => {
      prev.filter((item) => item.tenant_id === tenantId).forEach((item) => syncDeleteFromFirestore('account_invitations', item.id));
      return prev.filter((item) => item.tenant_id !== tenantId);
    });
    setRecurringSchedules((prev) => {
      prev.filter((item) => item.tenant_id === tenantId).forEach((item) => syncDeleteFromFirestore('schedules', item.id));
      return prev.filter((item) => item.tenant_id !== tenantId);
    });
    setLessonSessions((prev) => {
      prev.filter((item) => item.tenant_id === tenantId).forEach((item) => syncDeleteFromFirestore('sessions', item.id));
      return prev.filter((item) => item.tenant_id !== tenantId);
    });
    setLessons((prev) => {
      prev.filter((item) => item.tenant_id === tenantId).forEach((item) => syncDeleteFromFirestore('lessons', item.id));
      return prev.filter((item) => item.tenant_id !== tenantId);
    });
    setAttendance((prev) => {
      prev.filter((item) => item.tenant_id === tenantId).forEach((item) => syncDeleteFromFirestore('attendance', item.id));
      return prev.filter((item) => item.tenant_id !== tenantId);
    });
    setEvaluations((prev) => {
      prev.filter((item) => item.tenant_id === tenantId).forEach((item) => syncDeleteFromFirestore('evaluations', item.id));
      return prev.filter((item) => item.tenant_id !== tenantId);
    });
    setHomeworks((prev) => {
      prev.filter((item) => item.tenant_id === tenantId).forEach((item) => syncDeleteFromFirestore('homeworks', item.id));
      return prev.filter((item) => item.tenant_id !== tenantId);
    });
    setSubmissions((prev) => {
      prev.filter((item) => item.tenant_id === tenantId).forEach((item) => syncDeleteFromFirestore('submissions', item.id));
      return prev.filter((item) => item.tenant_id !== tenantId);
    });
    setComments((prev) => {
      prev.filter((item) => item.tenant_id === tenantId).forEach((item) => syncDeleteFromFirestore('comments', item.id));
      return prev.filter((item) => item.tenant_id !== tenantId);
    });
    setTuitionItems((prev) => {
      prev.filter((item) => item.tenant_id === tenantId).forEach((item) => syncDeleteFromFirestore('tuitions', item.id));
      return prev.filter((item) => item.tenant_id !== tenantId);
    });
    setBankStatements((prev) => {
      prev.filter((item) => item.tenant_id === tenantId).forEach((item) => syncDeleteFromFirestore('bankStatements', item.id));
      return prev.filter((item) => item.tenant_id !== tenantId);
    });
    setBankTransactions((prev) => {
      prev.filter((item) => item.tenant_id === tenantId).forEach((item) => syncDeleteFromFirestore('bankTransactions', item.id));
      return prev.filter((item) => item.tenant_id !== tenantId);
    });
    setNotifications((prev) => {
      prev.filter((item) => item.tenant_id === tenantId).forEach((item) => syncDeleteFromFirestore('notifications', item.id));
      return prev.filter((item) => item.tenant_id !== tenantId);
    });

    addAuditLog('delete', 'tenant', tenantId, `Xóa toàn bộ Không gian Tenant: ${tenantId}`);
    return true;
  };

  const switchRole = (role: UserRole) => {
    setCurrentRole(role);
  };

  // Payment Account
  const paymentAccount: PaymentAccount = currentTenant.paymentAccount || {
    id: `pay-${currentTenant.id}`,
    tenant_id: currentTenant.id,
    bankName: 'Vietcombank',
    bankCode: 'VCB',
    accountNumber: '1018999988',
    accountName: currentTenant.teacherName.toUpperCase(),
    isDefault: true,
  };

  const updatePaymentAccount = (acc: Partial<PaymentAccount>) => {
    const updated = { ...paymentAccount, ...acc };
    updateTenant({ paymentAccount: updated });
    addAuditLog('update', 'payment_account', updated.id, `Cập nhật tài khoản nhận tiền: ${updated.bankName} - ${updated.accountNumber}`);
  };

  // Schools
  const addSchool = (school: Omit<School, 'id' | 'tenant_id' | 'created_at'>) => {
    const newSchool: School = {
      ...school,
      id: `sch-${Date.now()}`,
      tenant_id: currentTenant.id,
      created_at: new Date().toISOString().split('T')[0],
    };
    setSchools((prev) => [...prev, newSchool]);
    syncSaveToFirestore('schools', newSchool.id, newSchool);
    addAuditLog('create', 'school', newSchool.id, `Thêm trường học: ${newSchool.name} (${newSchool.code})`);
  };

  const updateSchool = (id: string, data: Partial<School>) => {
    setSchools((prev) => {
      const updated = prev.map((s) => (s.id === id ? { ...s, ...data } : s));
      const target = updated.find((s) => s.id === id);
      if (target) syncSaveToFirestore('schools', id, target);
      return updated;
    });
    addAuditLog('update', 'school', id, `Cập nhật trường học ID ${id}`);
  };

  const deleteSchool = (id: string) => {
    setSchools((prev) => prev.filter((s) => s.id !== id));
    syncDeleteFromFirestore('schools', id);
    addAuditLog('delete', 'school', id, `Xóa trường học ID ${id}`);
  };

  // Subjects
  const addSubject = (subject: Omit<Subject, 'id' | 'tenant_id'>) => {
    const newSub: Subject = {
      ...subject,
      id: `sub-${Date.now()}`,
      tenant_id: currentTenant.id,
    };
    setSubjects((prev) => [...prev, newSub]);
    syncSaveToFirestore('subjects', newSub.id, newSub);
    addAuditLog('create', 'subject', newSub.id, `Thêm môn học: ${newSub.name}`);
  };

  const updateSubject = (id: string, data: Partial<Subject>) => {
    setSubjects((prev) => {
      const updated = prev.map((s) => (s.id === id ? { ...s, ...data } : s));
      const target = updated.find((s) => s.id === id);
      if (target) syncSaveToFirestore('subjects', id, target);
      return updated;
    });
    addAuditLog('update', 'subject', id, `Cập nhật môn học ID ${id}`);
  };

  const deleteSubject = (id: string) => {
    setSubjects((prev) => prev.filter((s) => s.id !== id));
    syncDeleteFromFirestore('subjects', id);
    addAuditLog('delete', 'subject', id, `Xóa môn học ID ${id}`);
  };

  // Classes
  const addClass = (cls: Omit<ClassRoom, 'id' | 'tenant_id' | 'created_at'>) => {
    const newClass: ClassRoom = {
      ...cls,
      id: `cls-${Date.now()}`,
      tenant_id: currentTenant.id,
      created_at: new Date().toISOString().split('T')[0],
    };
    setClasses((prev) => [...prev, newClass]);
    syncSaveToFirestore('classes', newClass.id, newClass);
    addAuditLog('create', 'class', newClass.id, `Tạo lớp học: ${newClass.name} (Đơn giá: ${newClass.feePerSession}đ/buổi)`);
  };

  const updateClass = (id: string, data: Partial<ClassRoom>) => {
    setClasses((prev) => {
      const updated = prev.map((c) => (c.id === id ? { ...c, ...data } : c));
      const target = updated.find((c) => c.id === id);
      if (target) syncSaveToFirestore('classes', id, target);
      return updated;
    });
    addAuditLog('update', 'class', id, `Cập nhật lớp học ID ${id}`);
  };

  const deleteClass = (id: string) => {
    setClasses((prev) => prev.filter((c) => c.id !== id));
    syncDeleteFromFirestore('classes', id);
    addAuditLog('delete', 'class', id, `Xóa lớp học ID ${id}`);
  };

  const assignStudentToClass = (classId: string, studentId: string) => {
    setClasses((prev) => {
      const updated = prev.map((c) =>
        c.id === classId && !c.studentIds.includes(studentId)
          ? { ...c, studentIds: [...c.studentIds, studentId] }
          : c
      );
      const target = updated.find((c) => c.id === classId);
      if (target) syncSaveToFirestore('classes', classId, target);
      return updated;
    });
    setStudents((prev) => {
      const updated = prev.map((s) =>
        s.id === studentId && !s.enrolledClassIds.includes(classId)
          ? { ...s, enrolledClassIds: [...s.enrolledClassIds, classId] }
          : s
      );
      const target = updated.find((s) => s.id === studentId);
      if (target) syncSaveToFirestore('students', studentId, target);
      return updated;
    });
    addAuditLog('update', 'class', classId, `Gán học sinh ${studentId} vào lớp ${classId}`);
  };

  const removeStudentFromClass = (classId: string, studentId: string) => {
    setClasses((prev) => {
      const updated = prev.map((c) =>
        c.id === classId ? { ...c, studentIds: c.studentIds.filter((id) => id !== studentId) } : c
      );
      const target = updated.find((c) => c.id === classId);
      if (target) syncSaveToFirestore('classes', classId, target);
      return updated;
    });
    setStudents((prev) => {
      const updated = prev.map((s) =>
        s.id === studentId ? { ...s, enrolledClassIds: s.enrolledClassIds.filter((id) => id !== classId) } : s
      );
      const target = updated.find((s) => s.id === studentId);
      if (target) syncSaveToFirestore('students', studentId, target);
      return updated;
    });
    addAuditLog('update', 'class', classId, `Rút học sinh ${studentId} khỏi lớp ${classId}`);
  };

  // Students
  const addStudent = (student: Omit<Student, 'id' | 'tenant_id' | 'joinedDate'>) => {
    const newStudent: Student = {
      ...student,
      id: `stu-${Date.now()}`,
      tenant_id: currentTenant.id,
      joinedDate: new Date().toISOString().split('T')[0],
    };
    setStudents((prev) => [...prev, newStudent]);
    syncSaveToFirestore('students', newStudent.id, newStudent);
    // Link with classes
    newStudent.enrolledClassIds.forEach((cId) => {
      setClasses((prev) => {
        const updated = prev.map((c) => (c.id === cId ? { ...c, studentIds: [...c.studentIds, newStudent.id] } : c));
        const target = updated.find((c) => c.id === cId);
        if (target) syncSaveToFirestore('classes', cId, target);
        return updated;
      });
    });
    addAuditLog('create', 'student', newStudent.id, `Thêm học sinh mới: ${newStudent.fullName} (${newStudent.schoolCode})`);
  };

  const updateStudent = (id: string, data: Partial<Student>) => {
    setStudents((prev) => {
      const updated = prev.map((s) => (s.id === id ? { ...s, ...data } : s));
      const target = updated.find((s) => s.id === id);
      if (target) syncSaveToFirestore('students', id, target);
      return updated;
    });
    addAuditLog('update', 'student', id, `Cập nhật thông tin học sinh ID ${id}`);
  };

  const deleteStudent = (id: string) => {
    setStudents((prev) => prev.filter((s) => s.id !== id));
    syncDeleteFromFirestore('students', id);
    // Also cleanup parent_students link for this student
    setParentStudents((prev) => prev.filter((ps) => ps.student_id !== id));
    setAccountInvitations((prev) => prev.filter((inv) => inv.student_id !== id));
    addAuditLog('delete', 'student', id, `Xóa học sinh ID ${id}`);
  };

  // Helper for Token Generation & Hashing
  const generateSecureToken = (type: 'student' | 'parent', targetId: string) => {
    const timestamp = Date.now().toString(36);
    const rand1 = Math.random().toString(36).substring(2, 8);
    const rand2 = Math.random().toString(36).substring(2, 8);
    return `tok-${type.substring(0, 3)}-${targetId}-${timestamp}-${rand1}${rand2}`;
  };

  const computeTokenHash = (token: string) => {
    let hash = 0;
    for (let i = 0; i < token.length; i++) {
      const char = token.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash |= 0;
    }
    return `hsh_${Math.abs(hash).toString(16)}_${token.length}`;
  };

  const getActivationLink = (token: string) => {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const path = typeof window !== 'undefined' ? window.location.pathname : '';
    return `${origin}${path}?activate_token=${token}`;
  };

  // Parents CRUD
  const addParent = (parentData: Omit<Parent, 'id' | 'tenant_id' | 'created_at'>): Parent => {
    const newParent: Parent = {
      ...parentData,
      id: `par-${Date.now()}`,
      tenant_id: currentTenant.id,
      accountStatus: parentData.accountStatus || 'uninvited',
      created_at: new Date().toISOString().split('T')[0],
    };
    setParents((prev) => [...prev, newParent]);
    syncSaveToFirestore('parents', newParent.id, newParent);
    addAuditLog('create', 'parent', newParent.id, `Thêm hồ sơ Phụ huynh mới: ${newParent.fullName} (${newParent.phone})`);
    return newParent;
  };

  const updateParent = (id: string, data: Partial<Parent>) => {
    setParents((prev) => {
      const updated = prev.map((p) => (p.id === id ? { ...p, ...data } : p));
      const target = updated.find((p) => p.id === id);
      if (target) syncSaveToFirestore('parents', id, target);
      return updated;
    });
    addAuditLog('update', 'parent', id, `Cập nhật thông tin Phụ huynh ID ${id}`);
  };

  const deleteParent = (id: string) => {
    setParents((prev) => prev.filter((p) => p.id !== id));
    syncDeleteFromFirestore('parents', id);
    setParentStudents((prev) => {
      const filtered = prev.filter((ps) => ps.parent_id !== id);
      prev.filter((ps) => ps.parent_id === id).forEach((ps) => syncDeleteFromFirestore('parent_students', ps.id));
      return filtered;
    });
    setAccountInvitations((prev) => {
      const filtered = prev.filter((inv) => inv.parent_id !== id);
      prev.filter((inv) => inv.parent_id === id).forEach((inv) => syncDeleteFromFirestore('account_invitations', inv.id));
      return filtered;
    });
    addAuditLog('delete', 'parent', id, `Xóa hồ sơ Phụ huynh ID ${id}`);
  };

  const linkParentToStudent = (
    parentId: string,
    studentId: string,
    relationship: string = 'Phụ huynh',
    is_primary: boolean = false
  ) => {
    const existing = parentStudents.find((ps) => ps.parent_id === parentId && ps.student_id === studentId);
    if (existing) {
      const updatedPS = { ...existing, relationship: relationship || existing.relationship, is_primary, updated_at: new Date().toISOString() };
      setParentStudents((prev) =>
        prev.map((ps) => (ps.id === existing.id ? updatedPS : ps))
      );
      syncSaveToFirestore('parent_students', existing.id, updatedPS);
    } else {
      const newPS: ParentStudent = {
        id: `ps-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        tenant_id: currentTenant.id,
        parent_id: parentId,
        student_id: studentId,
        relationship: relationship || 'Phụ huynh',
        is_primary,
        created_at: new Date().toISOString().split('T')[0],
      };
      setParentStudents((prev) => [...prev, newPS]);
      syncSaveToFirestore('parent_students', newPS.id, newPS);
    }

    if (is_primary) {
      // Unmark other primary links for this student
      setParentStudents((prev) =>
        prev.map((ps) => {
          if (ps.student_id === studentId && ps.parent_id !== parentId) {
            const unprimary = { ...ps, is_primary: false };
            syncSaveToFirestore('parent_students', ps.id, unprimary);
            return unprimary;
          }
          return ps;
        })
      );
      const parent = parents.find((p) => p.id === parentId);
      if (parent) {
        setStudents((prev) =>
          prev.map((s) => {
            if (s.id === studentId) {
              const updatedS = { ...s, parentName: parent.fullName, parentPhone: parent.phone, parentEmail: parent.email || s.parentEmail };
              syncSaveToFirestore('students', studentId, updatedS);
              return updatedS;
            }
            return s;
          })
        );
      }
    }
    addAuditLog('link_parent', 'student', studentId, `Liên kết Phụ huynh ${parentId} với học sinh ${studentId} (${relationship})`);
  };

  const unlinkParentStudent = (parentStudentId: string) => {
    setParentStudents((prev) => prev.filter((ps) => ps.id !== parentStudentId));
    syncDeleteFromFirestore('parent_students', parentStudentId);
    addAuditLog('unlink_parent', 'parent_student', parentStudentId, `Hủy liên kết Phụ huynh - Học sinh quan hệ ID ${parentStudentId}`);
  };

  const issueStudentInvitation = (studentId: string, email?: string, phone?: string) => {
    const student = students.find((s) => s.id === studentId);
    if (!student) {
      return { success: false, message: 'Không tìm thấy thông tin học sinh.' };
    }
    if (student.accountStatus === 'active') {
      return { success: false, message: 'Học sinh này đã kích hoạt tài khoản thành công.' };
    }

    const targetEmail = (email || student.email || '').trim();
    const targetPhone = (phone || student.phone || '').trim();

    if (!targetEmail && !targetPhone) {
      return { success: false, message: 'Học sinh cần có ít nhất Email hoặc Số điện thoại để gửi liên kết kích hoạt.' };
    }

    const token = generateSecureToken('student', studentId);
    const token_hash = computeTokenHash(token);
    const expires_at = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

    const newInv: AccountInvitation = {
      id: `inv-stu-${studentId}-${Date.now()}`,
      tenant_id: currentTenant.id,
      student_id: studentId,
      invitation_type: 'student',
      recipient_name: student.fullName,
      recipient_email: targetEmail,
      recipient_phone: targetPhone,
      token_hash,
      token,
      expires_at,
      status: 'sent',
      created_by: currentUser?.name || currentTenant.teacherName || 'Giáo viên',
      created_at: new Date().toISOString(),
    };

    setAccountInvitations((prev) => [newInv, ...prev.filter((inv) => !(inv.student_id === studentId && inv.invitation_type === 'student'))]);
    setStudents((prev) =>
      prev.map((s) =>
        s.id === studentId
          ? {
              ...s,
              accountStatus: 'invited',
              accountCreatedAt: new Date().toISOString().split('T')[0],
              email: targetEmail || s.email,
              phone: targetPhone || s.phone,
            }
          : s
      )
    );

    syncSaveToFirestore('account_invitations', newInv.id, newInv);
    syncSaveToFirestore('students', studentId, {
      ...student,
      accountStatus: 'invited',
      accountCreatedAt: new Date().toISOString().split('T')[0],
      email: targetEmail || student.email,
      phone: targetPhone || student.phone,
    });

    // Notification
    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      tenant_id: currentTenant.id,
      recipientRole: 'student',
      type: 'account_invitation',
      title: 'Lời mời kích hoạt tài khoản học sinh',
      content: `Thầy/Cô ${currentTenant.teacherName} đã gửi liên kết kích hoạt tài khoản Edututor cho bạn (${student.fullName}).`,
      isRead: false,
      created_at: new Date().toISOString().split('T')[0],
    };
    setNotifications((prev) => [newNotif, ...prev]);

    addAuditLog(
      'invite_student',
      'student',
      studentId,
      `Gửi lời mời kích hoạt tài khoản cho học sinh: ${student.fullName} (${targetEmail || targetPhone})`
    );

    return {
      success: true,
      message: `Đã phát hành liên kết kích hoạt tài khoản cho học sinh ${student.fullName}. Thời hạn 7 ngày.`,
      invitation: newInv,
      token,
      activationLink: getActivationLink(token),
    };
  };

  const issueParentInvitation = (
    param1: string,
    param2?: string | { fullName: string; relationship?: string; phone: string; email?: string; is_primary?: boolean }
  ) => {
    let parent: Parent | undefined;
    let studentId: string = '';
    let relationship: string = 'Phụ huynh';
    let isPrimary: boolean = false;

    // Case 1: param1 is an existing parentId
    const existingParent = parents.find((p) => p.id === param1);
    if (existingParent) {
      parent = existingParent;
      if (typeof param2 === 'string') {
        studentId = param2;
      } else {
        const ps = parentStudents.find((link) => link.parent_id === parent!.id);
        studentId = ps?.student_id || '';
      }
    } else {
      // Case 2: param1 is studentId, param2 is parentData object
      const student = students.find((s) => s.id === param1);
      if (!student) {
        return { success: false, message: 'Không tìm thấy thông tin Phụ huynh hoặc Học sinh.' };
      }
      studentId = student.id;

      const parentData = typeof param2 === 'object' && param2 !== null ? param2 : {
        fullName: student.parentName || 'Phụ huynh',
        phone: student.parentPhone || '',
        email: student.parentEmail || '',
        relationship: 'Phụ huynh',
        is_primary: true,
      };

      const cleanPhone = (parentData.phone || '').trim();
      const cleanEmail = (parentData.email || '').trim();
      const cleanName = (parentData.fullName || '').trim();

      if (!cleanName || (!cleanPhone && !cleanEmail)) {
        return { success: false, message: 'Vui lòng cung cấp đầy đủ Tên và Số điện thoại/Email phụ huynh.' };
      }

      relationship = parentData.relationship || 'Phụ huynh';
      isPrimary = !!parentData.is_primary;

      // Check if Parent already exists in this tenant by phone or email
      parent = parents.find(
        (p) =>
          (p.tenant_id === currentTenant.id || !p.tenant_id) &&
          ((cleanPhone && p.phone === cleanPhone) || (cleanEmail && p.email && p.email.toLowerCase() === cleanEmail.toLowerCase()))
      );

      if (!parent) {
        parent = {
          id: `par-${Date.now()}`,
          tenant_id: currentTenant.id,
          fullName: cleanName,
          phone: cleanPhone,
          email: cleanEmail,
          accountStatus: 'invited',
          accountCreatedAt: new Date().toISOString().split('T')[0],
          created_at: new Date().toISOString().split('T')[0],
        };
        setParents((prev) => [...prev, parent!]);
        syncSaveToFirestore('parents', parent.id, parent);
      } else {
        setParents((prev) =>
          prev.map((p) =>
            p.id === parent!.id
              ? { ...p, fullName: cleanName || p.fullName, email: cleanEmail || p.email, phone: cleanPhone || p.phone, accountStatus: 'invited' }
              : p
          )
        );
        syncSaveToFirestore('parents', parent.id, {
          ...parent,
          fullName: cleanName || parent.fullName,
          email: cleanEmail || parent.email,
          phone: cleanPhone || parent.phone,
          accountStatus: 'invited',
        });
      }

      // Link parent to student
      linkParentToStudent(parent.id, studentId, relationship, isPrimary);
    }

    if (!parent) {
      return { success: false, message: 'Không thể xác định thông tin Phụ huynh.' };
    }

    const token = generateSecureToken('parent', parent.id);
    const token_hash = computeTokenHash(token);
    const expires_at = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

    const newInv: AccountInvitation = {
      id: `inv-par-${parent.id}-${Date.now()}`,
      tenant_id: currentTenant.id,
      student_id: studentId,
      parent_id: parent.id,
      invitation_type: 'parent',
      recipient_name: parent.fullName,
      recipient_email: parent.email || '',
      recipient_phone: parent.phone || '',
      token_hash,
      token,
      expires_at,
      status: 'sent',
      created_by: currentUser?.name || currentTenant.teacherName || 'Giáo viên',
      created_at: new Date().toISOString(),
    };

    setAccountInvitations((prev) => [newInv, ...prev.filter((inv) => !(inv.parent_id === parent!.id && inv.invitation_type === 'parent'))]);
    setParents((prev) => prev.map((p) => (p.id === parent!.id ? { ...p, accountStatus: 'invited' } : p)));

    syncSaveToFirestore('account_invitations', newInv.id, newInv);
    syncSaveToFirestore('parents', parent.id, {
      ...parent,
      accountStatus: 'invited',
    });

    addAuditLog(
      'invite_parent',
      'parent',
      parent.id,
      `Phát hành liên kết kích hoạt tài khoản Phụ huynh: ${parent.fullName} (${parent.phone || parent.email})`
    );

    return {
      success: true,
      message: `Đã phát hành liên kết kích hoạt tài khoản cho Phụ huynh ${parent.fullName}. Thời hạn 7 ngày.`,
      invitation: newInv,
      token,
      activationLink: getActivationLink(token),
    };
  };

  const resendInvitation = (invitationId: string) => {
    const existing = accountInvitations.find((inv) => inv.id === invitationId);
    if (!existing) {
      return { success: false, message: 'Không tìm thấy lời mời này.' };
    }

    const targetId = existing.parent_id || existing.student_id;
    const freshToken = generateSecureToken(existing.invitation_type, targetId);
    const freshHash = computeTokenHash(freshToken);
    const expires_at = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

    const updatedInv: AccountInvitation = {
      ...existing,
      token: freshToken,
      token_hash: freshHash,
      expires_at,
      status: 'sent',
    };

    setAccountInvitations((prev) => prev.map((inv) => (inv.id === invitationId ? updatedInv : inv)));
    syncSaveToFirestore('account_invitations', invitationId, updatedInv);

    if (existing.invitation_type === 'parent' && existing.parent_id) {
      setParents((prev) => prev.map((p) => (p.id === existing.parent_id ? { ...p, accountStatus: 'invited' } : p)));
      const par = parents.find((p) => p.id === existing.parent_id);
      if (par) syncSaveToFirestore('parents', par.id, { ...par, accountStatus: 'invited' });
    } else if (existing.invitation_type === 'student') {
      setStudents((prev) => prev.map((s) => (s.id === existing.student_id ? { ...s, accountStatus: 'invited' } : s)));
      const stu = students.find((s) => s.id === existing.student_id);
      if (stu) syncSaveToFirestore('students', stu.id, { ...stu, accountStatus: 'invited' });
    }

    addAuditLog(
      'resend_invitation',
      'account_invitation',
      invitationId,
      `Gửi lại và gia hạn 7 ngày lời mời kích hoạt tài khoản cho ${existing.recipient_name} (${existing.recipient_email || existing.recipient_phone})`
    );

    return {
      success: true,
      message: `Đã tạo lại liên kết kích hoạt và gia hạn thêm 7 ngày cho ${existing.recipient_name}.`,
      invitation: updatedInv,
      token: freshToken,
      activationLink: getActivationLink(freshToken),
    };
  };

  const revokeInvitation = (invitationId: string) => {
    const existing = accountInvitations.find((inv) => inv.id === invitationId);
    if (!existing) {
      return { success: false, message: 'Không tìm thấy lời mời này.' };
    }

    setAccountInvitations((prev) =>
      prev.map((inv) => (inv.id === invitationId ? { ...inv, status: 'revoked' } : inv))
    );
    syncSaveToFirestore('account_invitations', invitationId, { ...existing, status: 'revoked' });

    if (existing.invitation_type === 'student') {
      setStudents((prev) =>
        prev.map((s) => (s.id === existing.student_id && s.accountStatus === 'invited' ? { ...s, accountStatus: 'uninvited' } : s))
      );
      const s = students.find((s) => s.id === existing.student_id);
      if (s) syncSaveToFirestore('students', s.id, { ...s, accountStatus: 'uninvited' });
    } else if (existing.invitation_type === 'parent' && existing.parent_id) {
      setParents((prev) =>
        prev.map((p) => (p.id === existing.parent_id && p.accountStatus === 'invited' ? { ...p, accountStatus: 'uninvited' } : p))
      );
      const p = parents.find((p) => p.id === existing.parent_id);
      if (p) syncSaveToFirestore('parents', p.id, { ...p, accountStatus: 'uninvited' });
    }

    addAuditLog(
      'revoke_invitation',
      'account_invitation',
      invitationId,
      `Thu hồi lời mời kích hoạt tài khoản của ${existing.recipient_name}`
    );

    return { success: true, message: 'Đã thu hồi lời mời kích hoạt tài khoản thành công.' };
  };

  const toggleUserLock = (targetType: 'student' | 'parent', targetId: string, lock: boolean) => {
    const nextStatus: AccountStatus = lock ? 'locked' : 'active';
    if (targetType === 'student') {
      setStudents((prev) => prev.map((s) => (s.id === targetId ? { ...s, accountStatus: nextStatus } : s)));
      syncSaveToFirestore('students', targetId, { accountStatus: nextStatus });
      addAuditLog(lock ? 'lock_account' : 'unlock_account', 'student', targetId, `${lock ? 'Khóa' : 'Mở khóa'} tài khoản học sinh ID ${targetId}`);
    } else {
      setParents((prev) => prev.map((p) => (p.id === targetId ? { ...p, accountStatus: nextStatus } : p)));
      syncSaveToFirestore('parents', targetId, { accountStatus: nextStatus });
      addAuditLog(lock ? 'lock_account' : 'unlock_account', 'parent', targetId, `${lock ? 'Khóa' : 'Mở khóa'} tài khoản Phụ huynh ID ${targetId}`);
    }
  };

  const updateStudentAccountStatus = (studentId: string, status: AccountStatus) => {
    setStudents((prev) => prev.map((s) => (s.id === studentId ? { ...s, accountStatus: status } : s)));
    syncSaveToFirestore('students', studentId, { accountStatus: status });
    addAuditLog(status === 'locked' ? 'lock_account' : 'unlock_account', 'student', studentId, `Cập nhật trạng thái tài khoản học sinh thành ${status}`);
  };

  const updateParentAccountStatus = (parentId: string, status: AccountStatus) => {
    setParents((prev) => prev.map((p) => (p.id === parentId ? { ...p, accountStatus: status } : p)));
    syncSaveToFirestore('parents', parentId, { accountStatus: status });
    addAuditLog(status === 'locked' ? 'lock_account' : 'unlock_account', 'parent', parentId, `Cập nhật trạng thái tài khoản phụ huynh thành ${status}`);
  };

  const unlinkParentFromStudent = (parentStudentId: string) => {
    unlinkParentStudent(parentStudentId);
  };

  const bulkIssueStudentInvitations = (studentIds: string[]) => {
    let created = 0;
    let missingInfo = 0;
    let alreadyHasAccount = 0;
    const results: any[] = [];

    studentIds.forEach((id) => {
      const stu = students.find((s) => s.id === id);
      if (!stu) return;
      if (stu.accountStatus === 'active') {
        alreadyHasAccount++;
        results.push({ id, name: stu.fullName, status: 'already_active' });
        return;
      }
      if (!stu.email && !stu.phone) {
        missingInfo++;
        results.push({ id, name: stu.fullName, status: 'missing_contact' });
        return;
      }
      const res = issueStudentInvitation(id);
      if (res.success) {
        created++;
        results.push({ id, name: stu.fullName, status: 'sent', link: res.activationLink });
      }
    });

    addAuditLog(
      'bulk_invite',
      'student',
      `bulk-${Date.now()}`,
      `Phát hành lời mời kích hoạt hàng loạt cho ${created} học sinh (${missingInfo} thiếu liên hệ, ${alreadyHasAccount} đã có tài khoản)`
    );

    return {
      created,
      skipped: studentIds.length - created,
      missingInfo,
      alreadyHasAccount,
      results,
    };
  };

  const validateInvitationToken = (token: string) => {
    if (!token || typeof token !== 'string') {
      return { valid: false, error: 'Mã kích hoạt không hợp lệ.' };
    }
    const cleanToken = token.trim();
    
    // 1. Direct search in accountInvitations
    let invitation = accountInvitations.find(
      (inv) => inv.token === cleanToken || inv.token_hash === cleanToken || inv.id === cleanToken
    );

    // 2. If not found in memory, parse structured token (e.g. tok-stu-stu-1-msuj0uze-tqmc5y7v6xri)
    if (!invitation) {
      const parts = cleanToken.split('-');
      if (parts[0] === 'tok' && parts.length >= 3) {
        const typePrefix = parts[1]; // 'stu' or 'par'
        const isStudentType = typePrefix === 'stu';
        const isParentType = typePrefix === 'par';

        if (isStudentType || isParentType) {
          let targetId = '';
          let timeCreatedMs = Date.now();

          if (parts.length >= 5) {
            // [tok, stu, stu, 1, timestamp, rand] -> targetId = 'stu-1'
            const timeBase36 = parts[parts.length - 2];
            const parsedTime = parseInt(timeBase36, 36);
            if (!isNaN(parsedTime) && parsedTime > 1600000000000) {
              timeCreatedMs = parsedTime;
            }
            targetId = parts.slice(2, parts.length - 2).join('-');
          } else {
            // Short/demo format, e.g. tok-stu-2-demo or tok-stu-1-act
            targetId = parts.slice(2, parts.length - 1).join('-') || `${typePrefix}-${parts[2]}`;
          }

          if (isStudentType) {
            const stu = students.find((s) => s.id === targetId || s.id === `stu-${targetId}`);
            if (stu) {
              const targetStudent = stu;
              invitation = {
                id: `inv-stu-${targetStudent.id}-${timeCreatedMs}`,
                tenant_id: targetStudent.tenant_id || currentTenant.id,
                student_id: targetStudent.id,
                invitation_type: 'student',
                recipient_name: targetStudent.fullName,
                recipient_email: targetStudent.email || targetStudent.parentEmail || `${targetStudent.id}@student.edututor.vn`,
                recipient_phone: targetStudent.phone || targetStudent.parentPhone || '',
                token_hash: computeTokenHash(cleanToken),
                token: cleanToken,
                expires_at: new Date(timeCreatedMs + 7 * 24 * 60 * 60 * 1000).toISOString(),
                status: targetStudent.accountStatus === 'active' ? 'accepted' : 'sent',
                created_by: currentTenant.teacherName || 'Giáo viên',
                created_at: new Date(timeCreatedMs).toISOString(),
              };
            }
          } else if (isParentType) {
            const par = parents.find((p) => p.id === targetId || p.id === `par-${targetId}`);
            if (par) {
              const targetParent = par;
              const linkedPs = parentStudents.find((ps) => ps.parent_id === targetParent.id);
              invitation = {
                id: `inv-par-${targetParent.id}-${timeCreatedMs}`,
                tenant_id: targetParent.tenant_id || currentTenant.id,
                student_id: linkedPs?.student_id || '',
                parent_id: targetParent.id,
                invitation_type: 'parent',
                recipient_name: targetParent.fullName,
                recipient_email: targetParent.email || `${targetParent.id}@parent.edututor.vn`,
                recipient_phone: targetParent.phone || '',
                token_hash: computeTokenHash(cleanToken),
                token: cleanToken,
                expires_at: new Date(timeCreatedMs + 7 * 24 * 60 * 60 * 1000).toISOString(),
                status: targetParent.accountStatus === 'active' ? 'accepted' : 'sent',
                created_by: currentTenant.teacherName || 'Giáo viên',
                created_at: new Date(timeCreatedMs).toISOString(),
              };
            }
          }
        }
      }
    }

    if (!invitation) {
      return { valid: false, error: 'Liên kết kích hoạt không tồn tại hoặc đã bị hủy bởi Giáo viên.' };
    }

    const student = students.find((s) => s.id === invitation!.student_id);
    const parent = invitation.parent_id ? parents.find((p) => p.id === invitation!.parent_id) : undefined;
    const tenant = tenants.find((t) => t.id === invitation.tenant_id) || currentTenant;

    // Check student/parent accountStatus
    if (invitation.invitation_type === 'student' && student) {
      if (student.accountStatus === 'locked') {
        return { valid: false, error: 'Tài khoản học sinh này đang bị tạm khóa. Vui lòng liên hệ Thầy/Cô để được mở khóa.', invitation, student, tenant };
      }
    }
    if (invitation.invitation_type === 'parent' && parent) {
      if (parent.accountStatus === 'locked') {
        return { valid: false, error: 'Tài khoản phụ huynh này đang bị tạm khóa. Vui lòng liên hệ Thầy/Cô để được mở khóa.', invitation, parent, tenant };
      }
    }

    if (invitation.status === 'accepted') {
      return { valid: false, error: 'Tài khoản này đã được kích hoạt thành công trước đó. Vui lòng đăng nhập.', invitation, student, parent, tenant };
    }
    if (invitation.status === 'revoked') {
      return { valid: false, error: 'Lời mời kích hoạt này đã bị Giáo viên thu hồi.', invitation, student, parent, tenant };
    }
    if (new Date(invitation.expires_at).getTime() < Date.now()) {
      return { valid: false, error: 'Liên kết kích hoạt đã hết hạn (quá hạn 7 ngày). Vui lòng liên hệ Giáo viên để nhận liên kết mới.', invitation, student, parent, tenant };
    }

    return {
      valid: true,
      invitation,
      student,
      parent,
      tenant,
    };
  };

  const activateAccountWithPassword = async (token: string, password: string): Promise<{ success: boolean; error?: string; user?: any }> => {
    const val = validateInvitationToken(token);
    if (!val.valid || !val.invitation) {
      return { success: false, error: val.error || 'Mã kích hoạt không hợp lệ.' };
    }

    // Password validation: min 8 characters, at least one letter, at least one digit
    if (!password || password.length < 8) {
      return { success: false, error: 'Mật khẩu phải có độ dài tối thiểu 8 ký tự.' };
    }
    if (!/[a-zA-Z]/.test(password)) {
      return { success: false, error: 'Mật khẩu phải chứa ít nhất một chữ cái.' };
    }
    if (!/[0-9]/.test(password)) {
      return { success: false, error: 'Mật khẩu phải chứa ít nhất một chữ số.' };
    }

    const inv = val.invitation;
    const nowIso = new Date().toISOString();
    const nowReadable = new Date().toLocaleString('vi-VN');

    // Mark invitation accepted in state & firestore
    const updatedInv = { ...inv, status: 'accepted' as const, accepted_at: nowIso };
    setAccountInvitations((prev) => {
      const exists = prev.some((item) => item.id === inv.id || item.token === inv.token);
      if (exists) {
        return prev.map((item) => (item.id === inv.id || item.token === inv.token ? updatedInv : item));
      }
      return [updatedInv, ...prev];
    });
    syncSaveToFirestore('account_invitations', inv.id, updatedInv);

    let createdUser: any = null;

    if (inv.invitation_type === 'student' && val.student) {
      const stu = val.student;
      const userId = `usr-stu-${stu.id}`;
      const updatedStudent: Student = {
        ...stu,
        user_id: userId,
        accountStatus: 'active',
        lastActivatedAt: nowReadable,
      };

      setStudents((prev) =>
        prev.map((s) => (s.id === stu.id ? updatedStudent : s))
      );
      syncSaveToFirestore('students', stu.id, updatedStudent);

      createdUser = {
        id: userId,
        name: stu.fullName,
        email: inv.recipient_email || stu.email || `${stu.phone || stu.id}@student.edututor.vn`,
        role: 'student' as UserRole,
        tenant_id: inv.tenant_id,
        avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${stu.fullName}`,
      };

      addAuditLog(
        'activate_account',
        'student',
        stu.id,
        `Học sinh ${stu.fullName} đã tự kích hoạt và thiết lập mật khẩu tài khoản thành công`
      );

      setActiveStudentId(stu.id);
      localStorage.setItem('edututor_active_student_id', stu.id);
    } else if (inv.invitation_type === 'parent' && (val.parent || inv.parent_id)) {
      const par = val.parent || parents.find((p) => p.id === inv.parent_id);
      if (par) {
        const userId = `usr-par-${par.id}`;
        const updatedParent: Parent = {
          ...par,
          user_id: userId,
          accountStatus: 'active',
          lastActivatedAt: nowReadable,
        };

        setParents((prev) =>
          prev.map((p) => (p.id === par.id ? updatedParent : p))
        );
        syncSaveToFirestore('parents', par.id, updatedParent);

        createdUser = {
          id: userId,
          name: par.fullName,
          email: inv.recipient_email || par.email || `${par.phone || par.id}@parent.edututor.vn`,
          role: 'parent' as UserRole,
          tenant_id: inv.tenant_id,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${par.fullName}`,
        };

        addAuditLog(
          'activate_account',
          'parent',
          par.id,
          `Phụ huynh ${par.fullName} đã tự kích hoạt và thiết lập mật khẩu tài khoản thành công`
        );

        const links = parentStudents.filter((ps) => ps.parent_id === par.id);
        if (links.length > 0) {
          const primary = links.find((l) => l.is_primary) || links[0];
          setActiveStudentId(primary.student_id);
          localStorage.setItem('edututor_active_student_id', primary.student_id);
        }
      }
    }

    // Persist credentials in edututor_custom_credentials for phone, email, and ID
    try {
      const storedCreds: Record<string, string> = JSON.parse(localStorage.getItem('edututor_custom_credentials') || '{}');
      if (inv.invitation_type === 'student' && val.student) {
        const s = val.student;
        if (s.phone) {
          storedCreds[s.phone.replace(/\D/g, '')] = password;
          storedCreds[s.phone.trim()] = password;
        }
        if (s.email) storedCreds[s.email.toLowerCase().trim()] = password;
        if (inv.recipient_email) storedCreds[inv.recipient_email.toLowerCase().trim()] = password;
        if (inv.recipient_phone) storedCreds[inv.recipient_phone.replace(/\D/g, '')] = password;
        if (s.schoolCode) storedCreds[s.schoolCode.toLowerCase().trim()] = password;
        storedCreds[s.id] = password;
        storedCreds[`usr-stu-${s.id}`] = password;
        if (createdUser?.email) storedCreds[createdUser.email.toLowerCase().trim()] = password;
      } else if (inv.invitation_type === 'parent' && (val.parent || inv.parent_id)) {
        const p = val.parent || parents.find((item) => item.id === inv.parent_id);
        if (p) {
          if (p.phone) {
            storedCreds[p.phone.replace(/\D/g, '')] = password;
            storedCreds[p.phone.trim()] = password;
          }
          if (p.email) storedCreds[p.email.toLowerCase().trim()] = password;
          if (inv.recipient_email) storedCreds[inv.recipient_email.toLowerCase().trim()] = password;
          if (inv.recipient_phone) storedCreds[inv.recipient_phone.replace(/\D/g, '')] = password;
          storedCreds[p.id] = password;
          storedCreds[`usr-par-${p.id}`] = password;
          if (createdUser?.email) storedCreds[createdUser.email.toLowerCase().trim()] = password;
        }
      }
      localStorage.setItem('edututor_custom_credentials', JSON.stringify(storedCreds));
    } catch (saveCredErr) {
      console.warn('Could not save activated credentials:', saveCredErr);
    }

    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });

    return {
      success: true,
      user: createdUser,
    };
  };

  const getStudentParents = (studentId: string) => {
    const links = parentStudents.filter((ps) => ps.student_id === studentId);
    return links.map((link) => {
      const parent = parents.find((p) => p.id === link.parent_id) || {
        id: link.parent_id,
        tenant_id: currentTenant.id,
        fullName: 'Phụ huynh chưa đăng ký',
        phone: '',
        accountStatus: 'uninvited' as AccountStatus,
        created_at: '',
      };
      return {
        parent,
        link,
        relationship: link.relationship,
        is_primary: link.is_primary,
        parentStudentId: link.id,
      };
    });
  };

  const getParentStudents = (parentId: string) => {
    const links = parentStudents.filter((ps) => ps.parent_id === parentId);
    return links.map((link) => {
      const student = students.find((s) => s.id === link.student_id);
      return { student: student!, link };
    }).filter((item) => !!item.student);
  };

  const getStudentInvitation = (studentId: string) => {
    return accountInvitations.find((inv) => inv.student_id === studentId && inv.invitation_type === 'student');
  };

  const getParentInvitation = (parentId: string) => {
    return accountInvitations.find((inv) => inv.parent_id === parentId && inv.invitation_type === 'parent');
  };

  // Schedules
  const addRecurringSchedule = (sched: Omit<RecurringSchedule, 'id' | 'tenant_id'>) => {
    const newSched: RecurringSchedule = {
      ...sched,
      id: `sched-${Date.now()}`,
      tenant_id: currentTenant.id,
    };
    setRecurringSchedules((prev) => [...prev, newSched]);
    syncSaveToFirestore('schedules', newSched.id, newSched);
    addAuditLog('create', 'recurring_schedule', newSched.id, `Tạo lịch học cố định: ${newSched.className} (Thứ ${newSched.dayOfWeek === 0 ? 'CN' : newSched.dayOfWeek + 1})`);
  };

  const updateRecurringSchedule = (id: string, data: Partial<RecurringSchedule>) => {
    setRecurringSchedules((prev) => {
      const updated = prev.map((s) => (s.id === id ? { ...s, ...data } : s));
      const target = updated.find((s) => s.id === id);
      if (target) syncSaveToFirestore('schedules', id, target);
      return updated;
    });
    addAuditLog('update', 'recurring_schedule', id, `Cập nhật lịch cố định ID ${id}`);
  };

  const deleteRecurringSchedule = (id: string) => {
    setRecurringSchedules((prev) => prev.filter((s) => s.id !== id));
    syncDeleteFromFirestore('schedules', id);
    addAuditLog('delete', 'recurring_schedule', id, `Xóa lịch cố định ID ${id}`);
  };

  // Auto-generate Sessions for Month
  const generateSessionsForMonth = (classId: string, month: number, year: number): LessonSession[] => {
    const cls = classes.find((c) => c.id === classId);
    if (!cls) return [];

    const classSchedules = recurringSchedules.filter(
      (s) => s.classId === classId && s.status === 'active'
    );
    if (classSchedules.length === 0) return [];

    const daysInMonth = new Date(year, month, 0).getDate();
    const newSessions: LessonSession[] = [];

    for (let day = 1; day <= daysInMonth; day++) {
      const dateObj = new Date(year, month - 1, day);
      const dayOfWeek = dateObj.getDay(); // 0 is Sunday, 1 is Monday...

      const matchedSched = classSchedules.find((s) => s.dayOfWeek === dayOfWeek);
      if (matchedSched) {
        const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        // Check if session already exists
        const exists = lessonSessions.some(
          (s) => s.classId === classId && s.date === dateStr
        );
        if (!exists) {
          const session: LessonSession = {
            id: `ses-${classId}-${dateStr.replace(/-/g, '')}`,
            tenant_id: currentTenant.id,
            classId,
            className: cls.name,
            date: dateStr,
            dayOfWeek: dayOfWeek as any,
            startTime: matchedSched.startTime,
            endTime: matchedSched.endTime,
            sessionType: 'regular',
            status: 'scheduled',
            feeEligible: true,
            created_at: new Date().toISOString().split('T')[0],
          };
          newSessions.push(session);
        }
      }
    }

    if (newSessions.length > 0) {
      setLessonSessions((prev) => [...prev, ...newSessions]);
      newSessions.forEach((ses) => syncSaveToFirestore('sessions', ses.id, ses));
      addAuditLog(
        'create',
        'lesson_sessions_batch',
        classId,
        `Tự động sinh ${newSessions.length} buổi học cho lớp ${cls.name} (Tháng ${month}/${year})`
      );
    }

    return newSessions;
  };

  // Lesson Sessions CRUD
  const addLessonSession = (session: Omit<LessonSession, 'id' | 'tenant_id' | 'created_at'>) => {
    const newSession: LessonSession = {
      ...session,
      id: `ses-${Date.now()}`,
      tenant_id: currentTenant.id,
      created_at: new Date().toISOString().split('T')[0],
    };
    setLessonSessions((prev) => [...prev, newSession]);
    syncSaveToFirestore('sessions', newSession.id, newSession);
    addAuditLog('create', 'lesson_session', newSession.id, `Tạo buổi học ${newSession.date} cho lớp ${newSession.className}`);
  };

  const updateLessonSession = (id: string, data: Partial<LessonSession>) => {
    setLessonSessions((prev) => {
      const updated = prev.map((s) => (s.id === id ? { ...s, ...data } : s));
      const target = updated.find((s) => s.id === id);
      if (target) syncSaveToFirestore('sessions', id, target);
      return updated;
    });
    addAuditLog('update', 'lesson_session', id, `Cập nhật buổi học ID ${id}`);
  };

  // BR-003, BR-005, BR-006: Cancel & Make-up logic
  const cancelLessonSession = (
    id: string,
    reason: string,
    createMakeup = false,
    makeupDate?: string
  ) => {
    const original = lessonSessions.find((s) => s.id === id);
    if (!original) return;

    let replacementId: string | undefined;

    if (createMakeup && makeupDate) {
      const makeupSession: LessonSession = {
        id: `ses-${original.classId}-${makeupDate.replace(/-/g, '')}-makeup`,
        tenant_id: currentTenant.id,
        classId: original.classId,
        className: original.className,
        date: makeupDate,
        dayOfWeek: new Date(makeupDate).getDay() as any,
        startTime: original.startTime,
        endTime: original.endTime,
        sessionType: 'make_up',
        status: 'scheduled',
        feeEligible: true, // BR-006: Học bù được tính phí thay thế
        originalSessionId: id,
        created_at: new Date().toISOString().split('T')[0],
      };
      replacementId = makeupSession.id;
      setLessonSessions((prev) => [...prev, makeupSession]);
      syncSaveToFirestore('sessions', makeupSession.id, makeupSession);
    }

    setLessonSessions((prev) => {
      const updated = prev.map((s) =>
        s.id === id
          ? {
              ...s,
              status: 'cancelled',
              feeEligible: false, // BR-003: Hủy buổi thì không tính phí
              cancelReason: reason,
              replacementSessionId: replacementId,
            }
          : s
      );
      const target = updated.find((s) => s.id === id);
      if (target) syncSaveToFirestore('sessions', id, target);
      return updated;
    });

    addAuditLog(
      'cancel_session',
      'lesson_session',
      id,
      `Hủy buổi học ngày ${original.date} (Lý do: ${reason})${createMakeup ? ` - Tạo học bù ngày ${makeupDate}` : ''}`,
      'status: scheduled, fee_eligible: true',
      'status: cancelled, fee_eligible: false'
    );
  };

  // Reschedule
  const rescheduleLessonSession = (id: string, newDate: string, reason: string) => {
    const original = lessonSessions.find((s) => s.id === id);
    if (!original) return;

    setLessonSessions((prev) => {
      const updated = prev.map((s) =>
        s.id === id
          ? {
              ...s,
              date: newDate,
              dayOfWeek: new Date(newDate).getDay() as any,
              sessionType: 'rescheduled',
              extraSessionReason: reason,
            }
          : s
      );
      const target = updated.find((s) => s.id === id);
      if (target) syncSaveToFirestore('sessions', id, target);
      return updated;
    });

    addAuditLog(
      'reschedule_session',
      'lesson_session',
      id,
      `Đổi lịch buổi học từ ${original.date} sang ${newDate} (Lý do: ${reason})`,
      `date: ${original.date}`,
      `date: ${newDate}`
    );
  };

  // Toggle Fee Eligibility
  const toggleFeeEligibility = (id: string) => {
    const session = lessonSessions.find((s) => s.id === id);
    if (!session) return;
    const newFeeEligible = !session.feeEligible;

    setLessonSessions((prev) => {
      const updated = prev.map((s) => (s.id === id ? { ...s, feeEligible: newFeeEligible } : s));
      const target = updated.find((s) => s.id === id);
      if (target) syncSaveToFirestore('sessions', id, target);
      return updated;
    });

    addAuditLog(
      'update',
      'lesson_session',
      id,
      `Chuyển trạng thái tính học phí của buổi ${session.date} thành: ${newFeeEligible ? 'Tính phí' : 'Không tính phí'}`,
      `fee_eligible: ${session.feeEligible}`,
      `fee_eligible: ${newFeeEligible}`
    );
  };

  // Lessons
  const addLesson = (lesson: Omit<Lesson, 'id' | 'tenant_id' | 'created_at'>) => {
    const newLesson: Lesson = {
      ...lesson,
      id: `les-${Date.now()}`,
      tenant_id: currentTenant.id,
      created_at: new Date().toISOString().split('T')[0],
    };
    setLessons((prev) => [newLesson, ...prev]);
    syncSaveToFirestore('lessons', newLesson.id, newLesson);
    // Link lesson with session
    setLessonSessions((prev) => {
      const updated = prev.map((s) => (s.id === lesson.sessionId ? { ...s, lessonId: newLesson.id } : s));
      const target = updated.find((s) => s.id === lesson.sessionId);
      if (target) syncSaveToFirestore('sessions', lesson.sessionId, target);
      return updated;
    });
    addAuditLog('create', 'lesson', newLesson.id, `Tạo bài học: ${newLesson.title} cho lớp ${newLesson.className}`);
  };

  const updateLesson = (id: string, data: Partial<Lesson>) => {
    setLessons((prev) => {
      const updated = prev.map((l) => (l.id === id ? { ...l, ...data } : l));
      const target = updated.find((l) => l.id === id);
      if (target) syncSaveToFirestore('lessons', id, target);
      return updated;
    });
    addAuditLog('update', 'lesson', id, `Cập nhật bài học ID ${id}`);
  };

  const deleteLesson = (id: string) => {
    const lesson = lessons.find((l) => l.id === id);
    setLessons((prev) => prev.filter((l) => l.id !== id));
    syncDeleteFromFirestore('lessons', id);
    addAuditLog('delete', 'lesson', id, `Xóa bài học: ${lesson?.title || id}`);
  };

  // Attendance
  const updateAttendance = (id: string, status: AttendanceRecord['status'], note?: string) => {
    setAttendance((prev) => {
      const updated = prev.map((a) =>
        a.id === id ? { ...a, status, note: note !== undefined ? note : a.note, updated_at: new Date().toISOString().split('T')[0] } : a
      );
      const target = updated.find((a) => a.id === id);
      if (target) syncSaveToFirestore('attendance', id, target);
      return updated;
    });
  };

  const markAttendance = (sessionId: string, studentId: string, status: AttendanceRecord['status'], note?: string) => {
    const student = students.find((s) => s.id === studentId);
    const session = lessonSessions.find((s) => s.id === sessionId);
    const nowStr = new Date().toISOString().split('T')[0];

    setAttendance((prev) => {
      const existingIndex = prev.findIndex((a) => a.sessionId === sessionId && a.studentId === studentId);
      if (existingIndex >= 0) {
        const updated = prev.map((a, idx) =>
          idx === existingIndex ? { ...a, status, note: note !== undefined ? note : a.note, updated_at: nowStr } : a
        );
        syncSaveToFirestore('attendance', updated[existingIndex].id, updated[existingIndex]);
        return updated;
      } else {
        const newRecord: AttendanceRecord = {
          id: `att-${sessionId}-${studentId}`,
          tenant_id: currentTenant.id,
          sessionId,
          classId: session?.classId || '',
          studentId,
          studentName: student?.fullName || '',
          status,
          note,
          updated_at: nowStr,
        };
        syncSaveToFirestore('attendance', newRecord.id, newRecord);
        return [...prev, newRecord];
      }
    });
  };

  const removeAttendance = (sessionId: string, studentId: string) => {
    const target = attendance.find((a) => a.sessionId === sessionId && a.studentId === studentId);
    if (target) {
      syncDeleteFromFirestore('attendance', target.id);
    }
    setAttendance((prev) => prev.filter((a) => !(a.sessionId === sessionId && a.studentId === studentId)));
    addAuditLog('delete', 'attendance', `${sessionId}-${studentId}`, `Hủy điểm danh học sinh`);
  };

  const clearSessionAttendance = (sessionId: string) => {
    attendance.filter((a) => a.sessionId === sessionId).forEach((a) => syncDeleteFromFirestore('attendance', a.id));
    setAttendance((prev) => prev.filter((a) => a.sessionId !== sessionId));
    addAuditLog('delete', 'attendance', sessionId, `Đặt lại trạng thái chưa điểm danh cho buổi học`);
  };

  const markAllPresent = (sessionId: string, classId: string) => {
    bulkMarkAttendance(sessionId, classId, 'present');
  };

  const bulkMarkAttendance = (
    sessionId: string,
    classId: string,
    status: AttendanceRecord['status']
  ) => {
    const cls = classes.find((c) => c.id === classId);
    if (!cls) return;

    const classStudents = students.filter((s) => cls.studentIds.includes(s.id));
    const nowStr = new Date().toISOString().split('T')[0];

    setAttendance((prev) => {
      const existing = prev.filter((a) => a.sessionId === sessionId);
      const updated = prev.map((a) => {
        if (a.sessionId === sessionId) {
          const rec = { ...a, status, updated_at: nowStr };
          syncSaveToFirestore('attendance', rec.id, rec);
          return rec;
        }
        return a;
      });

      // Add missing students
      classStudents.forEach((student) => {
        if (!existing.some((a) => a.studentId === student.id)) {
          const newRec: AttendanceRecord = {
            id: `att-${sessionId}-${student.id}`,
            tenant_id: currentTenant.id,
            sessionId,
            classId,
            studentId: student.id,
            studentName: student.fullName,
            status,
            updated_at: nowStr,
          };
          syncSaveToFirestore('attendance', newRec.id, newRec);
          updated.push(newRec);
        }
      });
      return updated;
    });

    addAuditLog('update', 'attendance', sessionId, `Điểm danh đồng loạt cho buổi học ${sessionId}: ${status}`);
  };

  // Evaluations
  const updateEvaluation = (id: string, data: Partial<StudentEvaluation>) => {
    setEvaluations((prev) => {
      const updated = prev.map((e) =>
        e.id === id ? { ...e, ...data, updated_at: new Date().toISOString().split('T')[0] } : e
      );
      const target = updated.find((e) => e.id === id);
      if (target) syncSaveToFirestore('evaluations', id, target);
      return updated;
    });
    addAuditLog('update', 'student_evaluation', id, `Cập nhật nhận xét & điểm số học sinh ID ${id}`);
  };

  const addEvaluation = (evalData: Partial<StudentEvaluation> & { studentId: string; lessonId: string; classScore: number; classFeedback: string }) => {
    const student = students.find((s) => s.id === evalData.studentId);
    const newEval: StudentEvaluation = {
      id: `eval-${Date.now()}-${evalData.studentId}`,
      tenant_id: currentTenant.id,
      studentId: evalData.studentId,
      studentName: student?.fullName || '',
      lessonId: evalData.lessonId,
      classScore: evalData.classScore,
      classFeedback: evalData.classFeedback,
      homeworkScore: evalData.homeworkScore,
      homeworkFeedback: evalData.homeworkFeedback,
      attitude: evalData.attitude || 'Tập trung và tích cực phát biểu xây dựng bài',
      updated_at: new Date().toISOString().split('T')[0],
    };
    setEvaluations((prev) => [newEval, ...prev.filter((e) => !(e.studentId === evalData.studentId && e.lessonId === evalData.lessonId))]);
    syncSaveToFirestore('evaluations', newEval.id, newEval);
  };

  // Homework
  const addHomework = (hw: Omit<Homework, 'id' | 'tenant_id' | 'created_at'>) => {
    const newHw: Homework = {
      ...hw,
      id: `hw-${Date.now()}`,
      tenant_id: currentTenant.id,
      created_at: new Date().toISOString().split('T')[0],
    };
    setHomeworks((prev) => [newHw, ...prev]);
    syncSaveToFirestore('homeworks', newHw.id, newHw);

    // Send notification to students
    const notif: NotificationItem = {
      id: `notif-${Date.now()}`,
      tenant_id: currentTenant.id,
      recipientRole: 'student',
      type: 'homework_assigned',
      title: `Bài tập về nhà mới: ${newHw.title}`,
      content: `Lớp ${newHw.className} - Hạn nộp: ${newHw.dueDate}`,
      linkUrl: '/homework',
      isRead: false,
      created_at: new Date().toLocaleString('vi-VN'),
    };
    setNotifications((prev) => [notif, ...prev]);

    addAuditLog('create', 'homework', newHw.id, `Giao bài tập về nhà: ${newHw.title}`);
  };

  const updateHomework = (id: string, data: Partial<Homework>) => {
    setHomeworks((prev) => {
      const updated = prev.map((h) => (h.id === id ? { ...h, ...data } : h));
      const target = updated.find((h) => h.id === id);
      if (target) syncSaveToFirestore('homeworks', id, target);
      return updated;
    });
    addAuditLog('update', 'homework', id, `Cập nhật bài tập ID ${id}`);
  };

  // Submissions
  const submitHomework = (
    homeworkId: string,
    studentId: string,
    photos: string[],
    notes?: string
  ) => {
    const student = students.find((s) => s.id === studentId);
    const hw = homeworks.find((h) => h.id === homeworkId);
    if (!student || !hw) return;

    const existingIndex = submissions.findIndex(
      (s) => s.homeworkId === homeworkId && s.studentId === studentId
    );

    const nowStr = new Date().toLocaleString('vi-VN');

    if (existingIndex >= 0) {
      const updatedSub = {
        ...submissions[existingIndex],
        submissionPhotos: photos.length > 0 ? photos : submissions[existingIndex].submissionPhotos,
        studentNotes: notes !== undefined ? notes : submissions[existingIndex].studentNotes,
        submittedAt: nowStr,
      };
      setSubmissions((prev) =>
        prev.map((s, idx) => (idx === existingIndex ? updatedSub : s))
      );
      syncSaveToFirestore('submissions', updatedSub.id, updatedSub);
    } else {
      const newSub: HomeworkSubmission = {
        id: `sub-${Date.now()}`,
        tenant_id: currentTenant.id,
        homeworkId,
        studentId,
        studentName: student.fullName,
        submittedAt: nowStr,
        submissionPhotos: photos,
        studentNotes: notes,
        status: 'submitted',
      };
      setSubmissions((prev) => [newSub, ...prev]);
      syncSaveToFirestore('submissions', newSub.id, newSub);
    }

    // Confetti effect for student submission
    try {
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } });
    } catch {}

    addAuditLog('create', 'homework_submission', homeworkId, `Học sinh ${student.fullName} nộp bài tập: ${hw.title}`);
  };

  const gradeSubmission = (
    id: string,
    grade: number,
    feedback: string,
    gradedPhotos?: string[]
  ) => {
    const sub = submissions.find((s) => s.id === id);
    if (!sub) return;

    const nowStr = new Date().toLocaleString('vi-VN');

    const updatedSub = {
      ...sub,
      grade,
      teacherFeedback: feedback,
      gradedPhotos: gradedPhotos || sub.gradedPhotos,
      status: 'graded' as const,
      gradedAt: nowStr,
    };

    setSubmissions((prev) =>
      prev.map((s) => (s.id === id ? updatedSub : s))
    );
    syncSaveToFirestore('submissions', id, updatedSub);

    // Send notification to student & parent
    const notif: NotificationItem = {
      id: `notif-${Date.now()}`,
      tenant_id: currentTenant.id,
      recipientRole: 'student',
      recipientId: sub.studentId,
      type: 'homework_graded',
      title: `Thầy đã chấm bài tập của bạn (${grade}/10)`,
      content: feedback,
      linkUrl: '/homework',
      isRead: false,
      created_at: nowStr,
    };
    setNotifications((prev) => [notif, ...prev]);

    addAuditLog('update', 'homework_grade', id, `Chấm điểm bài nộp của ${sub.studentName}: ${grade}/10`);
  };

  // Comments
  const addComment = (
    entityType: CommentItem['entityType'],
    entityId: string,
    content: string
  ) => {
    let authorName = currentTenant.teacherName;
    let authorId = 'teacher';
    if (currentRole === 'student') {
      const stu = students.find((s) => s.id === activeStudentId);
      authorName = stu ? stu.fullName : 'Học sinh';
      authorId = activeStudentId;
    } else if (currentRole === 'parent') {
      const stu = students.find((s) => s.id === activeStudentId);
      authorName = stu ? `Phụ huynh (${stu.parentName})` : 'Phụ huynh';
      authorId = `parent-${activeStudentId}`;
    }

    const newComment: CommentItem = {
      id: `com-${Date.now()}`,
      tenant_id: currentTenant.id,
      entityType,
      entityId,
      authorId,
      authorName,
      authorRole: currentRole,
      content,
      created_at: new Date().toLocaleString('vi-VN'),
    };
    setComments((prev) => [...prev, newComment]);
    syncSaveToFirestore('comments', newComment.id, newComment);
  };

  // Tuition Calculation & Lock
  const calculateMonthlyTuition = (month: number, year: number, classFilterId?: string) => {
    const targetClasses = classFilterId
      ? classes.filter((c) => c.id === classFilterId)
      : classes.filter((c) => c.status === 'active');

    const generatedItems: TuitionItem[] = [];

    targetClasses.forEach((cls) => {
      // For each student in this class
      cls.studentIds.forEach((studentId) => {
        const student = students.find((s) => s.id === studentId);
        if (!student) return;

        // Find sessions of this class in this month/year with feeEligible === true where student is marked 'present'
        const studentPresentSessions = lessonSessions.filter((s) => {
          if (s.classId !== cls.id) return false;
          if (!s.feeEligible) return false;
          if (s.status === 'cancelled') return false;
          const [sYear, sMonth] = s.date.split('-').map(Number);
          if (sYear !== year || sMonth !== month) return false;

          const attRecord = attendance.find(
            (a) => a.sessionId === s.id && a.studentId === studentId
          );
          return attRecord?.status === 'present';
        });

        const sessionIds = studentPresentSessions.map((s) => s.id);
        const sessionCount = sessionIds.length;
        const totalAmount = sessionCount * cls.feePerSession;

        // Payment Reference format: [Mã trường]_K[2 số cuối năm sinh]_[Tên học sinh]_T[Tháng]_[Năm] (Auto-disambiguates if duplicates exist)
        const paymentReference = generatePaymentReference(
          student.schoolCode,
          student.birthYear,
          student.fullName,
          month,
          year,
          student.id,
          students
        );

        // Check if existing
        const existing = tuitionItems.find(
          (t) =>
            t.periodMonth === month &&
            t.periodYear === year &&
            t.studentId === studentId &&
            t.classId === cls.id
        );

        if (existing) {
          generatedItems.push({
            ...existing,
            eligibleSessionIds: sessionIds,
            sessionCount,
            totalAmount,
            feePerSession: cls.feePerSession,
            paymentReference,
            updated_at: new Date().toISOString().split('T')[0],
          });
        } else {
          generatedItems.push({
            id: `tui-${studentId}-${cls.id}-${month}${year}`,
            tenant_id: currentTenant.id,
            periodMonth: month,
            periodYear: year,
            studentId,
            studentName: student.fullName,
            schoolCode: student.schoolCode,
            birthYear: student.birthYear,
            classId: cls.id,
            className: cls.name,
            feePerSession: cls.feePerSession,
            eligibleSessionIds: sessionIds,
            sessionCount,
            totalAmount,
            paidAmount: 0,
            status: 'draft',
            paymentReference,
            created_at: new Date().toISOString().split('T')[0],
            updated_at: new Date().toISOString().split('T')[0],
          });
        }
      });
    });

    setTuitionItems((prev) => {
      // Merge
      const remaining = prev.filter(
        (t) =>
          !(
            t.periodMonth === month &&
            t.periodYear === year &&
            targetClasses.some((c) => c.id === t.classId)
          )
      );
      return [...remaining, ...generatedItems];
    });

    generatedItems.forEach((item) => syncSaveToFirestore('tuitions', item.id, item));

    addAuditLog(
      'update',
      'tuition_calculation',
      `period-${month}-${year}`,
      `Tính toán bảng học phí Tháng ${month}/${year} cho ${generatedItems.length} khoản học phí`
    );
  };

  // Lock / Issue Tuition
  const lockMonthlyTuition = (month: number, year: number) => {
    const nowStr = new Date().toISOString().split('T')[0];
    setTuitionItems((prev) =>
      prev.map((t) => {
        if (t.periodMonth === month && t.periodYear === year && t.status === 'draft') {
          const lockedItem: TuitionItem = {
            ...t,
            status: 'unpaid',
            lockedAt: nowStr,
            updated_at: nowStr,
          };
          syncSaveToFirestore('tuitions', t.id, lockedItem);
          return lockedItem;
        }
        return t;
      })
    );

    // Notify parents
    const notif: NotificationItem = {
      id: `notif-${Date.now()}`,
      tenant_id: currentTenant.id,
      recipientRole: 'parent',
      type: 'tuition_unpaid',
      title: `Bảng kê học phí Tháng ${month}/${year} đã chốt`,
      content: `Vui lòng quét mã VietQR để hoàn tất học phí cho các cháu trước ngày 10 của tháng sau.`,
      linkUrl: '/tuition',
      isRead: false,
      created_at: new Date().toLocaleString('vi-VN'),
    };
    setNotifications((prev) => [notif, ...prev]);
    syncSaveToFirestore('notifications', notif.id, notif);

    addAuditLog(
      'lock_tuition',
      'tuition_period',
      `period-${month}-${year}`,
      `Chốt bảng kê học phí Tháng ${month}/${year} và phát hành mã VietQR thanh toán.`
    );
  };

  // Adjust Sessions in Tuition
  const adjustTuitionSessions = (
    tuitionId: string,
    sessionIds: string[],
    reason?: string
  ) => {
    setTuitionItems((prev) =>
      prev.map((t) => {
        if (t.id === tuitionId) {
          const sessionCount = sessionIds.length;
          const totalAmount = sessionCount * t.feePerSession;
          const updatedItem = {
            ...t,
            eligibleSessionIds: sessionIds,
            sessionCount,
            totalAmount,
            adjustmentReason: reason,
            updated_at: new Date().toISOString().split('T')[0],
          };
          syncSaveToFirestore('tuitions', tuitionId, updatedItem);
          return updatedItem;
        }
        return t;
      })
    );

    addAuditLog(
      'update',
      'tuition_item',
      tuitionId,
      `Điều chỉnh số buổi tính phí cho học phí ID ${tuitionId}: ${sessionIds.length} buổi (Lý do: ${reason || 'Không ghi'})`
    );
  };

  const updateTuitionStatus = (
    id: string,
    status: TuitionStatus,
    paidAmount?: number
  ) => {
    setTuitionItems((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const updatedItem: TuitionItem = {
            ...t,
            status,
            paidAmount: paidAmount !== undefined ? paidAmount : t.totalAmount,
            paidAt: status === 'paid' ? new Date().toLocaleString('vi-VN') : t.paidAt,
            updated_at: new Date().toISOString().split('T')[0],
          };
          syncSaveToFirestore('tuitions', id, updatedItem);
          return updatedItem;
        }
        return t;
      })
    );
  };

  // Bank Statements & Automated Reconciliation
  const importBankStatement = (
    month: number,
    year: number,
    fileName: string,
    txns: Omit<BankTransaction, 'id' | 'tenant_id' | 'statementId' | 'statementMonth' | 'statementYear'>[],
    overwrite: boolean = false
  ) => {
    const statementId = `stmt-${month}-${year}-${Date.now()}`;
    const totalCredit = txns.reduce((acc, cur) => acc + cur.amount, 0);

    const newStatement: BankStatement = {
      id: statementId,
      tenant_id: currentTenant.id,
      fileName,
      month,
      year,
      uploadedAt: new Date().toLocaleString('vi-VN'),
      totalTransactions: txns.length,
      totalCreditAmount: totalCredit,
      status: 'imported',
    };

    const newTransactions: BankTransaction[] = txns.map((t, idx) => ({
      ...t,
      id: `txn-${Date.now()}-${idx}`,
      tenant_id: currentTenant.id,
      statementId,
      statementMonth: month,
      statementYear: year,
      stt: t.stt || (idx + 1),
      reconciliationStatus: t.reconciliationStatus || 'unmatched',
    }));

    if (overwrite) {
      // Replace existing statements and transactions for this month/year
      setBankStatements((prev) => [
        newStatement,
        ...prev.filter((s) => !(s.month === month && s.year === year)),
      ]);
      setBankTransactions((prev) => [
        ...newTransactions,
        ...prev.filter((tx) => !(tx.statementMonth === month && tx.statementYear === year)),
      ]);
    } else {
      // Append
      setBankStatements((prev) => [newStatement, ...prev]);
      setBankTransactions((prev) => [...newTransactions, ...prev]);
    }

    syncSaveToFirestore('bankStatements', statementId, newStatement);
    newTransactions.forEach((tx) => syncSaveToFirestore('bankTransactions', tx.id, tx));

    addAuditLog(
      'create',
      'bank_statement',
      statementId,
      `Import sao kê ngân hàng Tháng ${month}/${year}: ${fileName} (${txns.length} giao dịch, Tổng: ${totalCredit.toLocaleString('vi-VN')} VNĐ)`
    );
  };

  const deleteBankTransaction = (txnId: string) => {
    const txn = bankTransactions.find((tx) => tx.id === txnId);
    if (!txn) return;

    if (txn.matchedTuitionId) {
      unlinkTransaction(txnId);
    }

    setBankTransactions((prev) => prev.filter((tx) => tx.id !== txnId));
    syncDeleteFromFirestore('bankTransactions', txnId);
    addAuditLog('delete', 'bank_transaction', txnId, `Xóa giao dịch sao kê ID ${txnId}`);
  };

  const clearBankTransactionsForMonth = (month: number, year: number) => {
    // Unlink any matched tuitions for this month
    const txnsInMonth = bankTransactions.filter(
      (tx) => tx.statementMonth === month && tx.statementYear === year
    );

    const matchedTuitionIds = txnsInMonth
      .filter((tx) => tx.matchedTuitionId)
      .map((tx) => tx.matchedTuitionId as string);

    if (matchedTuitionIds.length > 0) {
      setTuitionItems((prev) =>
        prev.map((t) => {
          if (matchedTuitionIds.includes(t.id)) {
            const updatedT = { ...t, status: 'unpaid' as const, paidAmount: 0, bankTransactionId: undefined, paidAt: undefined };
            syncSaveToFirestore('tuitions', t.id, updatedT);
            return updatedT;
          }
          return t;
        })
      );
    }

    txnsInMonth.forEach((tx) => syncDeleteFromFirestore('bankTransactions', tx.id));
    bankStatements.filter((s) => s.month === month && s.year === year).forEach((s) => syncDeleteFromFirestore('bankStatements', s.id));

    setBankTransactions((prev) =>
      prev.filter((tx) => !(tx.statementMonth === month && tx.statementYear === year))
    );
    setBankStatements((prev) =>
      prev.filter((s) => !(s.month === month && s.year === year))
    );

    addAuditLog(
      'delete',
      'bank_statement',
      `stmt-${month}-${year}`,
      `Xóa toàn bộ dữ liệu sao kê Tháng ${month}/${year}`
    );
  };

  // BR-011 / SRS: Automated Reconciliation dual match
  // 1. transaction.amount == tuition.amount
  // 2. transaction.description contains tuition.payment_reference OR student name/parent name
  const runAutomatedReconciliation = (month?: number, year?: number) => {
    let matchedCount = 0;
    let discrepancyCount = 0;

    const targetMonth = month || new Date().getMonth() + 1;
    const targetYear = year || new Date().getFullYear();

    const unassignedTxns = bankTransactions.filter(
      (tx) =>
        (tx.statementMonth === targetMonth && tx.statementYear === targetYear) ||
        (!tx.statementMonth && !month)
    );

    const updatedTuitions = [...tuitionItems];
    const updatedTxns = [...bankTransactions];

    unassignedTxns.forEach((txn) => {
      if (txn.reconciliationStatus === 'matched') return;

      const rawDesc = txn.description;
      const cleanDesc = rawDesc.toUpperCase();
      const unaccentedDesc = removeVietnameseAccents(rawDesc).toLowerCase();

      // Strategy 1: Find matching tuition by payment reference (e.g. PBC_K10_Tuan_T7_2026 or PBC_K10_Tuan)
      let matchedTuitionIndex = updatedTuitions.findIndex((tui) => {
        if (tui.periodMonth !== targetMonth || tui.periodYear !== targetYear) return false;
        const ref = tui.paymentReference.toUpperCase();
        if (cleanDesc.includes(ref)) return true;

        // Sub-check: without year/month suffix, e.g. "PBC_K10_TUAN"
        const refParts = ref.split('_T');
        if (refParts[0] && refParts[0].length >= 8 && cleanDesc.includes(refParts[0])) return true;

        return false;
      });

      // Strategy 2: Match by Student unaccented full name (e.g. "tran anh tuan" in memo)
      if (matchedTuitionIndex < 0) {
        matchedTuitionIndex = updatedTuitions.findIndex((tui) => {
          if (tui.periodMonth !== targetMonth || tui.periodYear !== targetYear) return false;
          const student = students.find((s) => s.id === tui.studentId);
          if (!student) return false;

          const unaccentedStudentName = removeVietnameseAccents(student.fullName).toLowerCase();
          if (unaccentedStudentName.length > 3 && unaccentedDesc.includes(unaccentedStudentName)) {
            return true;
          }
          return false;
        });
      }

      // Strategy 3: Match by Parent unaccented name (e.g. "le thi hong hanh" or "nguyen thi hoan")
      if (matchedTuitionIndex < 0) {
        matchedTuitionIndex = updatedTuitions.findIndex((tui) => {
          if (tui.periodMonth !== targetMonth || tui.periodYear !== targetYear) return false;
          const student = students.find((s) => s.id === tui.studentId);
          if (!student || !student.parentName) return false;

          const unaccentedParentName = removeVietnameseAccents(student.parentName).toLowerCase();
          if (unaccentedParentName.length > 4 && unaccentedDesc.includes(unaccentedParentName)) {
            return true;
          }
          return false;
        });
      }

      // Strategy 4: Match by Parent or Student phone number in memo (e.g. "0988123456" in memo)
      if (matchedTuitionIndex < 0) {
        matchedTuitionIndex = updatedTuitions.findIndex((tui) => {
          if (tui.periodMonth !== targetMonth || tui.periodYear !== targetYear) return false;
          const student = students.find((s) => s.id === tui.studentId);
          if (!student) return false;

          const parentDigits = (student.parentPhone || '').replace(/\D/g, '');
          const studentDigits = (student.phone || '').replace(/\D/g, '');

          if (parentDigits.length >= 9 && rawDesc.includes(parentDigits)) return true;
          if (studentDigits.length >= 9 && rawDesc.includes(studentDigits)) return true;

          return false;
        });
      }

      if (matchedTuitionIndex >= 0) {
        const tui = updatedTuitions[matchedTuitionIndex];
        const isAmountExact = txn.amount === tui.totalAmount;
        const txnIdx = updatedTxns.findIndex((tx) => tx.id === txn.id);

        if (isAmountExact) {
          // Exact Match (100% amount & identification)
          updatedTuitions[matchedTuitionIndex] = {
            ...tui,
            status: 'paid',
            paidAmount: txn.amount,
            bankTransactionId: txn.id,
            paidAt: txn.transactionDate,
          };
          if (txnIdx >= 0) {
            updatedTxns[txnIdx] = {
              ...updatedTxns[txnIdx],
              matchedTuitionId: tui.id,
              matchedStudentName: tui.studentName,
              matchedPaymentReference: tui.paymentReference,
              reconciliationStatus: 'matched',
              reconciledAt: new Date().toLocaleString('vi-VN'),
              notes: `Khớp chính xác ${txn.amount.toLocaleString('vi-VN')}đ với học sinh ${tui.studentName} (${tui.className})`,
            };
          }
          matchedCount++;
        } else {
          // Discrepancy (Amount mismatch)
          updatedTuitions[matchedTuitionIndex] = {
            ...tui,
            status: txn.amount < tui.totalAmount ? 'partial' : 'overpaid',
            paidAmount: txn.amount,
            bankTransactionId: txn.id,
            paidAt: txn.transactionDate,
          };
          if (txnIdx >= 0) {
            updatedTxns[txnIdx] = {
              ...updatedTxns[txnIdx],
              matchedTuitionId: tui.id,
              matchedStudentName: tui.studentName,
              matchedPaymentReference: tui.paymentReference,
              reconciliationStatus: 'discrepancy',
              reconciledAt: new Date().toLocaleString('vi-VN'),
              notes: `Nhận diện học sinh ${tui.studentName} nhưng số tiền chuyển ${txn.amount.toLocaleString('vi-VN')}đ lệch so với học phí ${tui.totalAmount.toLocaleString('vi-VN')}đ`,
            };
          }
          discrepancyCount++;
        }
      }
    });

    setTuitionItems(updatedTuitions);
    setBankTransactions(updatedTxns);

    updatedTuitions.forEach((t) => syncSaveToFirestore('tuitions', t.id, t));
    updatedTxns.forEach((tx) => syncSaveToFirestore('bankTransactions', tx.id, tx));

    if (matchedCount > 0) {
      try {
        confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
      } catch {}
    }

    addAuditLog(
      'reconcile_match',
      'tuition_reconciliation',
      `period-${targetMonth}-${targetYear}`,
      `Chạy đối soát tự động Tháng ${targetMonth}/${targetYear}: Khớp ${matchedCount} học phí, phát hiện ${discrepancyCount} lệch số tiền.`
    );

    return { matchedCount, discrepancyCount };
  };

  const manualMatchTransaction = (txnId: string, tuitionId: string) => {
    const tui = tuitionItems.find((t) => t.id === tuitionId);
    const txn = bankTransactions.find((tx) => tx.id === txnId);
    if (!tui || !txn) return;

    const updatedTui = {
      ...tui,
      status: txn.amount >= tui.totalAmount ? ('paid' as const) : ('partial' as const),
      paidAmount: txn.amount,
      bankTransactionId: txnId,
      paidAt: txn.transactionDate,
    };

    const updatedTxn = {
      ...txn,
      matchedTuitionId: tuitionId,
      matchedStudentName: tui.studentName,
      reconciliationStatus: 'manual_matched' as const,
      reconciledAt: new Date().toLocaleString('vi-VN'),
      notes: `Đối soát thủ công bởi giáo viên với học sinh ${tui.studentName}`,
    };

    setTuitionItems((prev) =>
      prev.map((t) => (t.id === tuitionId ? updatedTui : t))
    );

    setBankTransactions((prev) =>
      prev.map((tx) => (tx.id === txnId ? updatedTxn : tx))
    );

    syncSaveToFirestore('tuitions', tuitionId, updatedTui);
    syncSaveToFirestore('bankTransactions', txnId, updatedTxn);

    addAuditLog(
      'manual_reconcile',
      'bank_transaction',
      txnId,
      `Đối soát thủ công giao dịch ${txnId} (${txn.amount}đ) cho học phí ${tui.studentName}`
    );
  };

  const unlinkTransaction = (txnId: string) => {
    const txn = bankTransactions.find((tx) => tx.id === txnId);
    if (!txn || !txn.matchedTuitionId) return;

    const tuitionId = txn.matchedTuitionId;
    const tui = tuitionItems.find((t) => t.id === tuitionId);

    const updatedTui = tui ? {
      ...tui,
      status: 'unpaid' as const,
      paidAmount: 0,
      bankTransactionId: undefined,
      paidAt: undefined,
    } : undefined;

    const updatedTxn = {
      ...txn,
      matchedTuitionId: undefined,
      matchedStudentName: undefined,
      reconciliationStatus: 'unmatched' as const,
      reconciledAt: undefined,
      notes: 'Đã hủy liên kết đối soát',
    };

    setTuitionItems((prev) =>
      prev.map((t) => (t.id === tuitionId ? (updatedTui || t) : t))
    );

    setBankTransactions((prev) =>
      prev.map((tx) => (tx.id === txnId ? updatedTxn : tx))
    );

    if (updatedTui) syncSaveToFirestore('tuitions', tuitionId, updatedTui);
    syncSaveToFirestore('bankTransactions', txnId, updatedTxn);

    addAuditLog('update', 'bank_transaction', txnId, `Hủy đối soát giao dịch ${txnId}`);
  };

  // Notifications
  const markNotificationRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => {
        if (n.id === id) {
          const updated = { ...n, isRead: true };
          syncSaveToFirestore('notifications', id, updated);
          return updated;
        }
        return n;
      })
    );
  };

  const markAllNotificationsRead = () => {
    setNotifications((prev) =>
      prev.map((n) => {
        const updated = { ...n, isRead: true };
        syncSaveToFirestore('notifications', n.id, updated);
        return updated;
      })
    );
  };

  // Reset to Demo Data
  const resetToDemoData = () => {
    localStorage.clear();
    setTenants(INITIAL_TENANTS);
    setCurrentTenantId('tenant-tuan');
    setSchools(INITIAL_SCHOOLS);
    setSubjects(INITIAL_SUBJECTS);
    setClasses(INITIAL_CLASSES);
    setStudents(INITIAL_STUDENTS);
    setParents(INITIAL_PARENTS);
    setParentStudents(INITIAL_PARENT_STUDENTS);
    setAccountInvitations(INITIAL_ACCOUNT_INVITATIONS);
    setRecurringSchedules(INITIAL_RECURRING_SCHEDULES);
    setLessonSessions(INITIAL_LESSON_SESSIONS);
    setLessons(INITIAL_LESSONS);
    setAttendance(INITIAL_ATTENDANCE);
    setEvaluations(INITIAL_EVALUATIONS);
    setHomeworks(INITIAL_HOMEWORK);
    setSubmissions(INITIAL_SUBMISSIONS);
    setComments(INITIAL_COMMENTS);
    setTuitionItems(INITIAL_TUITION_ITEMS);
    setBankStatements([INITIAL_BANK_STATEMENT]);
    setBankTransactions(INITIAL_BANK_TRANSACTIONS);
    setNotifications(INITIAL_NOTIFICATIONS);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    alert('Đã đặt lại toàn bộ dữ liệu mẫu ban đầu thành công!');
  };

  const addBankTransaction = (txn: Partial<BankTransaction> & { amount: number; description: string }) => {
    const newTxn: BankTransaction = {
      id: `txn-${Date.now()}`,
      tenant_id: currentTenant.id,
      statementId: `stmt-manual-${Date.now()}`,
      bankName: txn.bankName || paymentAccount.bankName,
      accountNumber: txn.accountNumber || paymentAccount.accountNumber,
      transactionDate: txn.transactionDate || new Date().toISOString().replace('T', ' ').slice(0, 19),
      amount: txn.amount,
      description: txn.description,
      senderName: txn.senderName || 'NGUYỄN VĂN HÙNG',
      reconciliationStatus: 'unmatched',
      statementMonth: txn.statementMonth || 7,
      statementYear: txn.statementYear || 2026,
    };
    setBankTransactions((prev) => [newTxn, ...prev]);
    syncSaveToFirestore('bankTransactions', newTxn.id, newTxn);
    addAuditLog('create', 'bank_transaction', newTxn.id, `Giao dịch chuyển khoản mới: +${newTxn.amount.toLocaleString('vi-VN')}đ (${newTxn.description})`);
  };

  // Filtered collections for current tenant workspace
  const tenantSchools = schools.filter((s) => s.tenant_id === currentTenant.id);
  const tenantSubjects = subjects.filter((s) => s.tenant_id === currentTenant.id);
  const tenantClasses = classes.filter((c) => c.tenant_id === currentTenant.id);
  const tenantStudents = students.filter((s) => s.tenant_id === currentTenant.id);
  const tenantParents = parents.filter((p) => p.tenant_id === currentTenant.id);
  const tenantParentStudents = parentStudents.filter((ps) => ps.tenant_id === currentTenant.id);
  const tenantAccountInvitations = accountInvitations.filter((inv) => inv.tenant_id === currentTenant.id);
  const tenantRecurringSchedules = recurringSchedules.filter((rs) => rs.tenant_id === currentTenant.id);
  const tenantLessonSessions = lessonSessions.filter((ls) => ls.tenant_id === currentTenant.id);
  const tenantLessons = lessons.filter((l) => l.tenant_id === currentTenant.id);
  const tenantAttendance = attendance.filter((a) => a.tenant_id === currentTenant.id);
  const tenantEvaluations = evaluations.filter((e) => e.tenant_id === currentTenant.id);
  const tenantHomeworks = homeworks.filter((h) => h.tenant_id === currentTenant.id);
  const tenantSubmissions = submissions.filter((s) => s.tenant_id === currentTenant.id);
  const tenantComments = comments.filter((c) => c.tenant_id === currentTenant.id);
  const tenantTuitionItems = tuitionItems.filter((t) => t.tenant_id === currentTenant.id);
  const tenantBankStatements = bankStatements.filter((bs) => bs.tenant_id === currentTenant.id);
  const tenantBankTransactions = bankTransactions.filter((bt) => bt.tenant_id === currentTenant.id);
  const tenantNotifications = notifications.filter((n) => n.tenant_id === currentTenant.id || !n.tenant_id);
  const tenantAuditLogs = auditLogs.filter((al) => al.tenant_id === currentTenant.id);

  return (
    <AppContext.Provider
      value={{
        currentTenant,
        tenants,
        switchTenant,
        updateTenant,
        addTenant,
        deleteTenant,
        currentRole,
        switchRole,
        activeStudentId,
        setActiveStudentId,
        currentUser,
        setCurrentUser,
        schools: tenantSchools,
        addSchool,
        updateSchool,
        deleteSchool,
        subjects: tenantSubjects,
        addSubject,
        updateSubject,
        deleteSubject,
        classes: tenantClasses,
        addClass,
        updateClass,
        deleteClass,
        assignStudentToClass,
        removeStudentFromClass,
        students: tenantStudents,
        addStudent,
        updateStudent,
        deleteStudent,
        parents: tenantParents,
        parentStudents: tenantParentStudents,
        accountInvitations: tenantAccountInvitations,
        addParent,
        updateParent,
        deleteParent,
        linkParentToStudent,
        unlinkParentStudent,
        unlinkParentFromStudent,
        updateStudentAccountStatus,
        updateParentAccountStatus,
        issueStudentInvitation,
        issueParentInvitation,
        resendInvitation,
        revokeInvitation,
        toggleUserLock,
        bulkIssueStudentInvitations,
        validateInvitationToken,
        activateAccountWithPassword,
        getStudentParents,
        getParentStudents,
        getStudentInvitation,
        getParentInvitation,
        recurringSchedules: tenantRecurringSchedules,
        addRecurringSchedule,
        updateRecurringSchedule,
        deleteRecurringSchedule,
        generateSessionsForMonth,
        lessonSessions: tenantLessonSessions,
        addLessonSession,
        updateLessonSession,
        cancelLessonSession,
        rescheduleLessonSession,
        toggleFeeEligibility,
        lessons: tenantLessons,
        addLesson,
        updateLesson,
        deleteLesson,
        attendance: tenantAttendance,
        updateAttendance,
        markAttendance,
        removeAttendance,
        clearSessionAttendance,
        markAllPresent,
        bulkMarkAttendance,
        evaluations: tenantEvaluations,
        updateEvaluation,
        addEvaluation,
        homeworks: tenantHomeworks,
        addHomework,
        updateHomework,
        submissions: tenantSubmissions,
        submitHomework,
        gradeSubmission,
        gradeHomework: gradeSubmission,
        comments: tenantComments,
        addComment,
        tuitionItems: tenantTuitionItems,
        calculateMonthlyTuition,
        calculateTuitionForMonth: calculateMonthlyTuition,
        lockMonthlyTuition,
        adjustTuitionSessions,
        updateTuitionStatus,
        bankStatements: tenantBankStatements,
        bankTransactions: tenantBankTransactions,
        importBankStatement,
        addBankTransaction,
        deleteBankTransaction,
        clearBankTransactionsForMonth,
        runAutomatedReconciliation,
        manualMatchTransaction,
        unlinkTransaction,
        paymentAccount,
        updatePaymentAccount,
        notifications: tenantNotifications,
        markNotificationRead,
        markAllNotificationsRead,
        auditLogs: tenantAuditLogs,
        resetToDemoData,
        resetData: resetToDemoData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

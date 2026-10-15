import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import config from './firebase-applet-config.json' with { type: 'json' };

const app = initializeApp(config);
const db = getFirestore(app, config.firestoreDatabaseId);

async function check() {
  const tuitions = await getDocs(collection(db, 'tuitions'));
  const docs = tuitions.docs.map(d => ({ id: d.id, ...d.data() })).filter((t: any) => t.tenant_id === 'tenant-1788937761914' && t.periodMonth === 9 && t.periodYear === 2026 && (t.sessionCount || 0) > 0);
  
  const sessions = await getDocs(collection(db, 'sessions'));
  const sessionMap = new Map(sessions.docs.map(d => [d.id, d.data()]));

  const att = await getDocs(collection(db, 'attendance'));
  const attDocs = att.docs.map(d => d.data());

  for (const t of docs.slice(0, 6)) {
    console.log('Tuition:', t.studentName, t.className, 'sessionCount:', t.sessionCount);
    for (const sId of ((t as any).eligibleSessionIds || [])) {
      const sess = sessionMap.get(sId);
      console.log('   Session:', sId, sess ? 'Found: date=' + (sess as any).date + ', class=' + (sess as any).classId : 'NOT FOUND IN SESSIONS');
      const attRecord = attDocs.find((a: any) => a.sessionId === sId && a.studentId === t.studentId);
      console.log('   Attendance record:', attRecord ? 'status=' + (attRecord as any).status : 'NO ATTENDANCE RECORD');
    }
  }
}
check().then(() => process.exit(0)).catch(err => { console.error(err); process.exit(1); });

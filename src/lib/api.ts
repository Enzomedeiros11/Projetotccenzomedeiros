import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  collection, 
  query, 
  where, 
  addDoc, 
  serverTimestamp,
  orderBy,
  updateDoc
} from 'firebase/firestore';
import { auth, db } from './firebase';

export const api = {
  async register(data: any) {
    const { user: firebaseUser } = await createUserWithEmailAndPassword(auth, data.email, data.password);
    
    const userData = {
      uid: firebaseUser.uid,
      name: data.name,
      email: data.email,
      role: data.role,
      grade: data.grade,
      course: data.course,
      createdAt: serverTimestamp()
    };

    await setDoc(doc(db, 'users', firebaseUser.uid), userData);
    return userData;
  },

  async login(data: any) {
    const { user: firebaseUser } = await signInWithEmailAndPassword(auth, data.email, data.password);
    const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
    return userDoc.data();
  },

  async getMe(): Promise<any> {
    return new Promise((resolve, reject) => {
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        unsubscribe();
        if (user) {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          resolve(userDoc.data());
        } else {
          reject(new Error('Não autenticado'));
        }
      });
    });
  },

  async logout() {
    await signOut(auth);
  },

  async getClasses() {
    const user = await this.getMe();
    if (user.role === 'teacher') {
      const q = query(collection(db, 'classes'), where('teacherId', '==', user.uid));
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } else {
      const q = query(collection(db, 'enrollments'), where('studentId', '==', user.uid));
      const enrollmentsSnapshot = await getDocs(q);
      const classIds = enrollmentsSnapshot.docs.map(doc => doc.data().classId);
      
      if (classIds.length === 0) return [];
      
      // Firestore 'in' query limit is 10, but let's assume small number for now
      const classesSnapshot = await getDocs(query(collection(db, 'classes'), where('__name__', 'in', classIds)));
      return classesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }
  },

  async getClass(id: string) {
    const docRef = doc(db, 'classes', id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    }
    throw new Error('Turma não encontrada');
  },

  async createClass(data: { name: string; subject: string; grade: string }) {
    const user = await this.getMe();
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    const classData = {
      ...data,
      code,
      teacherId: user.uid,
      teacherName: user.name,
      createdAt: serverTimestamp()
    };
    const docRef = await addDoc(collection(db, 'classes'), classData);
    return { id: docRef.id, ...classData };
  },

  async joinClass(code: string) {
    const user = await this.getMe();
    const q = query(collection(db, 'classes'), where('code', '==', code.toUpperCase()));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) throw new Error('Turma não encontrada com este código');
    
    const classId = snapshot.docs[0].id;
    
    // Check if already enrolled
    const eq = query(collection(db, 'enrollments'), where('studentId', '==', user.uid), where('classId', '==', classId));
    const esnap = await getDocs(eq);
    if (!esnap.empty) throw new Error('Você já está matriculado nesta turma');

    await addDoc(collection(db, 'enrollments'), {
      studentId: user.uid,
      classId,
      enrolledAt: serverTimestamp()
    });
    
    return { message: 'Inscrito com sucesso' };
  },

  async getStudents(classId: string) {
    const q = query(collection(db, 'enrollments'), where('classId', '==', classId));
    const snapshot = await getDocs(q);
    const studentIds = snapshot.docs.map(doc => doc.data().studentId);
    
    if (studentIds.length === 0) return [];
    
    const studentsSnapshot = await getDocs(query(collection(db, 'users'), where('uid', 'in', studentIds)));
    return studentsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  async getAssignments(classId: string) {
    const q = query(collection(db, `classes/${classId}/assignments`), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  async createAssignment(classId: string, data: any) {
    const docRef = await addDoc(collection(db, `classes/${classId}/assignments`), {
      ...data,
      classId,
      createdAt: serverTimestamp()
    });
    return { id: docRef.id, ...data };
  },

  async getMaterials(classId: string) {
    const q = query(collection(db, `classes/${classId}/materials`), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  async createMaterial(classId: string, data: any) {
    const docRef = await addDoc(collection(db, `classes/${classId}/materials`), {
      ...data,
      classId,
      createdAt: serverTimestamp()
    });
    return { id: docRef.id, ...data };
  },

  async getSubmissions(assignmentId: string) {
    const q = query(collection(db, 'submissions'), where('assignmentId', '==', assignmentId), orderBy('submittedAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  async submitAssignment(assignmentId: string, data: any) {
    const user = await this.getMe();
    const submissionData = {
      ...data,
      assignmentId,
      studentId: user.uid,
      studentName: user.name,
      submittedAt: serverTimestamp(),
      grade: null,
      feedback: null
    };
    const docRef = await addDoc(collection(db, 'submissions'), submissionData);
    return { id: docRef.id, ...submissionData };
  },

  async gradeSubmission(submissionId: string, data: { grade: number; feedback: string }) {
    const docRef = doc(db, 'submissions', submissionId);
    await updateDoc(docRef, {
      grade: data.grade,
      feedback: data.feedback
    });
    return { id: submissionId, ...data };
  }
};

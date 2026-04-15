import express from 'express';
import Database from 'better-sqlite3';
import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const JWT_SECRET = 'educonnect-secret-key-123';
const PORT = 3000;

async function startServer() {
  const app = express();
  app.use(express.json());
  app.use(cookieParser());

  // Request Logging
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
  });

  // Database Setup
  const dbPath = path.join(__dirname, 'database.sqlite');
  console.log('Initializing database at:', dbPath);
  
  const db = new Database(dbPath);
  db.pragma('journal_mode = WAL');

  // Create Tables
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL,
      grade TEXT,
      course TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS classes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      teacher_id INTEGER NOT NULL,
      subject TEXT NOT NULL,
      grade TEXT NOT NULL,
      code TEXT UNIQUE NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (teacher_id) REFERENCES users (id)
    );

    CREATE TABLE IF NOT EXISTS enrollments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id INTEGER NOT NULL,
      class_id INTEGER NOT NULL,
      enrolled_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(student_id, class_id),
      FOREIGN KEY (student_id) REFERENCES users (id),
      FOREIGN KEY (class_id) REFERENCES classes (id)
    );

    CREATE TABLE IF NOT EXISTS assignments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      class_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      due_date DATETIME,
      points INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (class_id) REFERENCES classes (id)
    );

    CREATE TABLE IF NOT EXISTS submissions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      assignment_id INTEGER NOT NULL,
      student_id INTEGER NOT NULL,
      content TEXT,
      file_url TEXT,
      grade REAL,
      feedback TEXT,
      submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (assignment_id) REFERENCES assignments (id),
      FOREIGN KEY (student_id) REFERENCES users (id)
    );

    CREATE TABLE IF NOT EXISTS materials (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      class_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      file_url TEXT,
      type TEXT, -- 'link', 'file', 'video'
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (class_id) REFERENCES classes (id)
    );
  `);

  console.log('Database tables initialized.');

  // Auth Middleware
  const authenticateToken = (req: any, res: any, next: any) => {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ error: 'Sessão expirada. Por favor, faça login novamente.' });

    try {
      const user = jwt.verify(token, JWT_SECRET);
      req.user = user;
      next();
    } catch (err) {
      return res.status(403).json({ error: 'Sessão inválida.' });
    }
  };

  // API Routes
  app.get('/api/health', (req, res) => {
    try {
      db.prepare('SELECT 1').get();
      res.json({ status: 'ok', database: 'connected' });
    } catch (err: any) {
      res.status(500).json({ status: 'error', database: 'disconnected', error: err.message });
    }
  });

  app.post('/api/register', async (req, res) => {
    const { name, email, password, role, grade, course } = req.body;
    
    console.log('Registration attempt:', { name, email, role });

    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: 'Preencha todos os campos obrigatórios' });
    }

    try {
      console.log('Hashing password...');
      const hashedPassword = await bcryptjs.hash(password, 10);
      console.log('Password hashed successfully.');
      const stmt = db.prepare('INSERT INTO users (name, email, password, role, grade, course) VALUES (?, ?, ?, ?, ?, ?)');
      const info = stmt.run(name, email, hashedPassword, role, grade, course);
      
      console.log('User created with ID:', info.lastInsertRowid);

      const token = jwt.sign({ id: info.lastInsertRowid, email, role }, JWT_SECRET, { expiresIn: '7d' });
      res.cookie('token', token, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 });
      res.json({ id: info.lastInsertRowid, name, email, role, grade, course });
    } catch (err: any) {
      console.error('Detailed Register Error:', err);
      if (err.message && err.message.includes('UNIQUE constraint failed')) {
        return res.status(400).json({ error: 'Este e-mail já está em uso.' });
      }
      res.status(500).json({ error: `Erro ao criar conta: ${err.message || 'Erro desconhecido'}` });
    }
  });

  app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'E-mail e senha são obrigatórios' });
    }

    try {
      const user: any = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
      if (!user) return res.status(400).json({ error: 'E-mail não encontrado.' });

      const validPassword = await bcryptjs.compare(password, user.password);
      if (!validPassword) return res.status(400).json({ error: 'Senha incorreta.' });

      const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
      res.cookie('token', token, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 });
      res.json({ id: user.id, name: user.name, email: user.email, role: user.role, grade: user.grade, course: user.course });
    } catch (err: any) {
      console.error('Login Error:', err);
      res.status(500).json({ error: 'Erro ao realizar login.' });
    }
  });

  app.get('/api/me', authenticateToken, (req: any, res) => {
    try {
      const user = db.prepare('SELECT id, name, email, role, grade, course FROM users WHERE id = ?').get(req.user.id);
      if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });
      res.json(user);
    } catch (err: any) {
      res.status(500).json({ error: 'Erro ao buscar perfil' });
    }
  });

  app.get('/api/classes', authenticateToken, (req: any, res) => {
    try {
      let classes;
      if (req.user.role === 'teacher') {
        classes = db.prepare('SELECT c.*, u.name as teacher_name FROM classes c JOIN users u ON c.teacher_id = u.id WHERE c.teacher_id = ?').all(req.user.id);
      } else {
        classes = db.prepare(`
          SELECT c.*, u.name as teacher_name 
          FROM classes c 
          JOIN users u ON c.teacher_id = u.id 
          JOIN enrollments e ON c.id = e.class_id 
          WHERE e.student_id = ?
        `).all(req.user.id);
      }
      res.json(classes || []);
    } catch (err: any) {
      console.error('Classes Fetch Error:', err);
      res.status(500).json({ error: 'Erro ao buscar turmas no banco de dados' });
    }
  });

  app.get('/api/classes/:id', authenticateToken, (req: any, res) => {
    try {
      const classItem = db.prepare(`
        SELECT c.*, u.name as teacher_name 
        FROM classes c 
        JOIN users u ON c.teacher_id = u.id 
        WHERE c.id = ?
      `).get(req.params.id);

      if (!classItem) return res.status(404).json({ error: 'Turma não encontrada' });

      // Check if user is authorized to view this class
      const item = classItem as any;
      if (req.user.role === 'teacher') {
        if (item.teacher_id !== req.user.id) return res.status(403).json({ error: 'Não autorizado' });
      } else {
        const enrollment = db.prepare('SELECT 1 FROM enrollments WHERE student_id = ? AND class_id = ?').get(req.user.id, req.params.id);
        if (!enrollment) return res.status(403).json({ error: 'Você não está matriculado nesta turma' });
      }

      res.json(classItem);
    } catch (err: any) {
      res.status(500).json({ error: 'Erro ao buscar detalhes da turma' });
    }
  });

  app.get('/api/classes/:id/students', authenticateToken, (req: any, res) => {
    try {
      const students = db.prepare(`
        SELECT u.id, u.name, u.email, u.grade, u.course
        FROM users u
        JOIN enrollments e ON u.id = e.student_id
        WHERE e.class_id = ?
      `).all(req.params.id);
      res.json(students);
    } catch (err: any) {
      res.status(500).json({ error: 'Erro ao buscar alunos da turma' });
    }
  });

  app.post('/api/classes/join', authenticateToken, (req: any, res) => {
    if (req.user.role !== 'student') {
      return res.status(403).json({ error: 'Apenas alunos podem entrar em turmas' });
    }

    const { code } = req.body;
    if (!code) return res.status(400).json({ error: 'Código da turma é obrigatório' });

    try {
      const classItem: any = db.prepare('SELECT id FROM classes WHERE code = ?').get(code.toUpperCase());
      if (!classItem) return res.status(404).json({ error: 'Turma não encontrada com este código' });

      db.prepare('INSERT INTO enrollments (student_id, class_id) VALUES (?, ?)').run(req.user.id, classItem.id);
      res.json({ message: 'Você entrou na turma com sucesso!' });
    } catch (err: any) {
      if (err.message.includes('UNIQUE constraint failed')) {
        return res.status(400).json({ error: 'Você já está matriculado nesta turma' });
      }
      console.error('Join Class Error:', err);
      res.status(500).json({ error: 'Erro ao entrar na turma' });
    }
  });

  app.post('/api/classes', authenticateToken, (req: any, res) => {
    if (req.user.role !== 'teacher') {
      return res.status(403).json({ error: 'Apenas professores podem criar turmas' });
    }

    const { name, subject, grade } = req.body;
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();

    try {
      const stmt = db.prepare('INSERT INTO classes (name, teacher_id, subject, grade, code) VALUES (?, ?, ?, ?, ?)');
      const info = stmt.run(name, req.user.id, subject, grade, code);
      res.json({ id: info.lastInsertRowid, name, subject, grade, code });
    } catch (err: any) {
      console.error('Class Creation Error:', err);
      res.status(500).json({ error: 'Erro ao criar turma' });
    }
  });

  app.post('/api/logout', (req, res) => {
    res.clearCookie('token');
    res.json({ message: 'Logout realizado' });
  });

  // Assignments Routes
  app.get('/api/classes/:classId/assignments', authenticateToken, (req: any, res) => {
    try {
      const assignments = db.prepare('SELECT * FROM assignments WHERE class_id = ? ORDER BY created_at DESC').all(req.params.classId);
      res.json(assignments);
    } catch (err: any) {
      res.status(500).json({ error: 'Erro ao buscar atividades' });
    }
  });

  app.post('/api/classes/:classId/assignments', authenticateToken, (req: any, res) => {
    if (req.user.role !== 'teacher') return res.status(403).json({ error: 'Apenas professores' });
    const { title, description, due_date, points } = req.body;
    try {
      const stmt = db.prepare('INSERT INTO assignments (class_id, title, description, due_date, points) VALUES (?, ?, ?, ?, ?)');
      const info = stmt.run(req.params.classId, title, description, due_date, points);
      res.json({ id: info.lastInsertRowid, title, description, due_date, points });
    } catch (err: any) {
      res.status(500).json({ error: 'Erro ao criar atividade' });
    }
  });

  // Materials Routes
  app.get('/api/classes/:classId/materials', authenticateToken, (req: any, res) => {
    try {
      const materials = db.prepare('SELECT * FROM materials WHERE class_id = ? ORDER BY created_at DESC').all(req.params.classId);
      res.json(materials);
    } catch (err: any) {
      res.status(500).json({ error: 'Erro ao buscar materiais' });
    }
  });

  app.post('/api/classes/:classId/materials', authenticateToken, (req: any, res) => {
    if (req.user.role !== 'teacher') return res.status(403).json({ error: 'Apenas professores' });
    const { title, description, file_url, type } = req.body;
    try {
      const stmt = db.prepare('INSERT INTO materials (class_id, title, description, file_url, type) VALUES (?, ?, ?, ?, ?)');
      const info = stmt.run(req.params.classId, title, description, file_url, type);
      res.json({ id: info.lastInsertRowid, title, description, file_url, type });
    } catch (err: any) {
      res.status(500).json({ error: 'Erro ao adicionar material' });
    }
  });

  // Submissions Routes
  app.get('/api/assignments/:assignmentId/submissions', authenticateToken, (req: any, res) => {
    if (req.user.role !== 'teacher') return res.status(403).json({ error: 'Apenas professores' });
    try {
      const submissions = db.prepare(`
        SELECT s.*, u.name as student_name 
        FROM submissions s 
        JOIN users u ON s.student_id = u.id 
        WHERE s.assignment_id = ?
      `).all(req.params.assignmentId);
      res.json(submissions);
    } catch (err: any) {
      res.status(500).json({ error: 'Erro ao buscar entregas' });
    }
  });

  app.post('/api/assignments/:assignmentId/submit', authenticateToken, (req: any, res) => {
    if (req.user.role !== 'student') return res.status(403).json({ error: 'Apenas alunos' });
    const { content, file_url } = req.body;
    try {
      const stmt = db.prepare('INSERT INTO submissions (assignment_id, student_id, content, file_url) VALUES (?, ?, ?, ?)');
      const info = stmt.run(req.params.assignmentId, req.user.id, content, file_url);
      res.json({ id: info.lastInsertRowid, message: 'Atividade entregue com sucesso!' });
    } catch (err: any) {
      res.status(500).json({ error: 'Erro ao entregar atividade' });
    }
  });

  app.post('/api/submissions/:id/grade', authenticateToken, (req: any, res) => {
    if (req.user.role !== 'teacher') return res.status(403).json({ error: 'Apenas professores' });
    const { grade, feedback } = req.body;
    try {
      db.prepare('UPDATE submissions SET grade = ?, feedback = ? WHERE id = ?').run(grade, feedback, req.params.id);
      res.json({ message: 'Nota atribuída com sucesso!' });
    } catch (err: any) {
      res.status(500).json({ error: 'Erro ao atribuir nota' });
    }
  });

  // Global Error Handler
  app.use((err: any, req: any, res: any, next: any) => {
    console.error('Unhandled Error:', err);
    res.status(500).json({ error: 'Erro interno no servidor', details: err.message });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

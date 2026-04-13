import express from 'express';
import sqlite3 from 'sqlite3';
import bcrypt from 'bcryptjs';
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

  // Database Setup
  const db = new sqlite3.Database('./database.sqlite');

  db.serialize(() => {
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        role TEXT NOT NULL,
        grade TEXT,
        course TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS classes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        teacher_id INTEGER NOT NULL,
        subject TEXT NOT NULL,
        grade TEXT NOT NULL,
        code TEXT UNIQUE NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (teacher_id) REFERENCES users (id)
      )
    `);
  });

  // Auth Middleware
  const authenticateToken = (req: any, res: any, next: any) => {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ error: 'Sessão expirada. Por favor, faça login novamente.' });

    jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
      if (err) return res.status(403).json({ error: 'Sessão inválida.' });
      req.user = user;
      next();
    });
  };

  // API Routes
  app.post('/api/register', async (req, res) => {
    const { name, email, password, role, grade, course } = req.body;
    
    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: 'Preencha todos os campos obrigatórios' });
    }

    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      db.run(
        'INSERT INTO users (name, email, password, role, grade, course) VALUES (?, ?, ?, ?, ?, ?)',
        [name, email, hashedPassword, role, grade, course],
        function (err) {
          if (err) {
            console.error('Register Error:', err);
            if (err.message.includes('UNIQUE constraint failed')) {
              return res.status(400).json({ error: 'Este e-mail já está em uso.' });
            }
            return res.status(500).json({ error: 'Erro interno ao criar conta.' });
          }
          const token = jwt.sign({ id: this.lastID, email, role }, JWT_SECRET, { expiresIn: '7d' });
          res.cookie('token', token, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 });
          res.json({ id: this.lastID, name, email, role, grade, course });
        }
      );
    } catch (error) {
      res.status(500).json({ error: 'Erro ao processar senha.' });
    }
  });

  app.post('/api/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'E-mail e senha são obrigatórios' });
    }

    db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user: any) => {
      if (err) return res.status(500).json({ error: 'Erro no banco de dados' });
      if (!user) return res.status(400).json({ error: 'E-mail não encontrado.' });

      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) return res.status(400).json({ error: 'Senha incorreta.' });

      const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
      res.cookie('token', token, { httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 });
      res.json({ id: user.id, name: user.name, email: user.email, role: user.role, grade: user.grade, course: user.course });
    });
  });

  app.get('/api/me', authenticateToken, (req: any, res) => {
    db.get('SELECT id, name, email, role, grade, course FROM users WHERE id = ?', [req.user.id], (err, user) => {
      if (err) return res.status(500).json({ error: 'Erro ao buscar perfil' });
      if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });
      res.json(user);
    });
  });

  app.get('/api/classes', authenticateToken, (req: any, res) => {
    const query = req.user.role === 'teacher' 
      ? 'SELECT c.*, u.name as teacher_name FROM classes c JOIN users u ON c.teacher_id = u.id WHERE c.teacher_id = ?' 
      : 'SELECT c.*, u.name as teacher_name FROM classes c JOIN users u ON c.teacher_id = u.id';
    
    db.all(query, [req.user.id], (err, rows) => {
      if (err) {
        console.error('Classes Fetch Error:', err);
        return res.status(500).json({ error: 'Erro ao buscar turmas' });
      }
      res.json(rows);
    });
  });

  app.post('/api/classes', authenticateToken, (req: any, res) => {
    if (req.user.role !== 'teacher') {
      return res.status(403).json({ error: 'Apenas professores podem criar turmas' });
    }

    const { name, subject, grade } = req.body;
    const code = Math.random().toString(36).substring(2, 8).toUpperCase();

    db.run(
      'INSERT INTO classes (name, teacher_id, subject, grade, code) VALUES (?, ?, ?, ?, ?)',
      [name, req.user.id, subject, grade, code],
      function (err) {
        if (err) return res.status(500).json({ error: 'Erro ao criar turma' });
        res.json({ id: this.lastID, name, subject, grade, code });
      }
    );
  });

  app.post('/api/logout', (req, res) => {
    res.clearCookie('token');
    res.json({ message: 'Logout realizado' });
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

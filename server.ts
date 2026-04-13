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
  });

  // Auth Middleware
  const authenticateToken = (req: any, res: any, next: any) => {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ error: 'Não autorizado' });

    jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
      if (err) return res.status(403).json({ error: 'Token inválido' });
      req.user = user;
      next();
    });
  };

  // API Routes
  app.post('/api/register', async (req, res) => {
    const { name, email, password, role, grade, course } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    db.run(
      'INSERT INTO users (name, email, password, role, grade, course) VALUES (?, ?, ?, ?, ?, ?)',
      [name, email, hashedPassword, role, grade, course],
      function (err) {
        if (err) {
          if (err.message.includes('UNIQUE constraint failed')) {
            return res.status(400).json({ error: 'E-mail já cadastrado' });
          }
          return res.status(500).json({ error: 'Erro ao criar usuário' });
        }
        const token = jwt.sign({ id: this.lastID, email, role }, JWT_SECRET);
        res.cookie('token', token, { httpOnly: true });
        res.json({ id: this.lastID, name, email, role, grade, course });
      }
    );
  });

  app.post('/api/login', (req, res) => {
    const { email, password } = req.body;

    db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user: any) => {
      if (err || !user) return res.status(400).json({ error: 'Usuário não encontrado' });

      const validPassword = await bcrypt.compare(password, user.password);
      if (!validPassword) return res.status(400).json({ error: 'Senha incorreta' });

      const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET);
      res.cookie('token', token, { httpOnly: true });
      res.json({ id: user.id, name: user.name, email: user.email, role: user.role, grade: user.grade, course: user.course });
    });
  });

  app.get('/api/me', authenticateToken, (req: any, res) => {
    db.get('SELECT id, name, email, role, grade, course FROM users WHERE id = ?', [req.user.id], (err, user) => {
      if (err || !user) return res.status(404).json({ error: 'Usuário não encontrado' });
      res.json(user);
    });
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

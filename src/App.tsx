/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  BrowserRouter, 
  HashRouter, 
  Routes, 
  Route, 
  Navigate 
} from 'react-router-dom';

// Components
import Sitemap from './components/Sitemap';
import Login from './components/Login';
import Register from './components/Register';
import ForgotPassword from './components/ForgotPassword';

// Pages
import ProfessorDashboard from './pages/ProfessorDashboard';
import AlunoDashboard from './pages/AlunoDashboard';
import ClassDetail from './pages/ClassDetail';

/**
 * Utilitário de Detecção de Ambiente
 * Verifica se a execução ocorre em proxies de desenvolvimento em nuvem
 */
const checkPreviewEnvironment = (): boolean => {
  const indicators = [
    'googleusercontent',
    'webcontainer',
    'shim',
    '.goog',
    'scf.usercontent',
    'stackblitz',
    'codesandbox'
  ];
  
  const hostname = window.location.hostname;
  const href = window.location.href;

  return indicators.some(indicator => hostname.includes(indicator) || href.includes(indicator));
};

import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './lib/firebase';
import { api } from './lib/api';

export default function App() {
  const isPreview = checkPreviewEnvironment();
  const [user, setUser] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  
  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userData = await api.getMe();
          setUser(userData);
        } catch (err) {
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  const Router = isPreview ? HashRouter : BrowserRouter;

  return (
    <Router>
      <Routes>
        <Route 
          path="/" 
          element={
            user ? (
              user.role === 'teacher' ? <Navigate to="/professor" replace /> : <Navigate to="/aluno" replace />
            ) : <Login />
          } 
        />

        {/* Rotas Principais */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/professor" element={<ProfessorDashboard />} />
        <Route path="/aluno" element={<AlunoDashboard />} />
        <Route path="/turma/:id" element={<ClassDetail />} />
        <Route path="/sitemap" element={<Sitemap />} />

        {/* Catch-all: Redireciona rotas inexistentes para a home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

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
import Dashboard from './components/Dashboard';

/**
 * Landing Page Video Placeholder
 */
const LPVideo = () => (
  <div className="min-h-screen bg-[#0f172a] flex flex-col items-center justify-center p-6 text-white font-sans overflow-hidden relative">
    {/* Decorative background elements */}
    <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
      <div className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] bg-blue-600/20 blur-[120px] rounded-full"></div>
      <div className="absolute -bottom-[20%] -right-[10%] w-[60%] h-[60%] bg-indigo-600/20 blur-[120px] rounded-full"></div>
    </div>

    <div className="relative z-10 max-w-4xl w-full text-center space-y-8">
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm mb-4">
        <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
        <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-blue-400">TCC-BETA EDUCONNECT</span>
      </div>
      
      <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.1] bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent">
        Conectando Professores <br /> e Alunos ao Futuro
      </h1>
      
      <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
        Uma plataforma integrada para facilitar a gestão de turmas, atividades e o aprendizado colaborativo.
      </p>

      <div className="aspect-video w-full max-w-3xl mx-auto bg-slate-800/50 rounded-3xl border border-white/10 backdrop-blur-md flex items-center justify-center group cursor-pointer hover:border-blue-500/50 transition-all duration-500 shadow-2xl overflow-hidden">
        <img 
          src="https://picsum.photos/seed/abstract-tech-purple/1280/720" 
          alt="EduConnect Preview" 
          className="w-full h-full object-cover opacity-50 group-hover:scale-105 transition-transform duration-700"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center shadow-lg shadow-blue-600/40 group-hover:scale-110 transition-transform duration-300">
            <div className="w-0 h-0 border-t-[10px] border-t-transparent border-l-[18px] border-l-white border-b-[10px] border-b-transparent ml-1"></div>
          </div>
        </div>
      </div>

      <div className="pt-8 flex flex-wrap justify-center gap-4">
        <NavigateButton to="/register" primary>Começar Agora</NavigateButton>
        <NavigateButton to="/login">Entrar</NavigateButton>
      </div>
    </div>
  </div>
);

const NavigateButton = ({ to, children, primary }: { to: string, children: React.ReactNode, primary?: boolean }) => {
  const navigate = useNavigate();
  return (
    <button 
      onClick={() => navigate(to)}
      className={`px-8 py-4 font-bold rounded-2xl transition-all shadow-xl ${
        primary 
        ? 'bg-white text-slate-900 hover:bg-blue-50 shadow-white/5' 
        : 'bg-white/5 text-white border border-white/10 hover:bg-white/10 backdrop-blur-sm'
      }`}
    >
      {children}
    </button>
  );
};

import { useNavigate } from 'react-router-dom';

/**
 * Utilitário de Detecção de Ambiente
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

export default function App() {
  const isPreview = checkPreviewEnvironment();
  
  const Router = isPreview ? HashRouter : BrowserRouter;

  return (
    <Router>
      <Routes>
        <Route 
          path="/" 
          element={
            isPreview ? <Navigate to="/sitemap" replace /> : <LPVideo />
          } 
        />

        <Route path="/sitemap" element={<Sitemap />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/dashboard" element={<Dashboard />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

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

export default function App() {
  const isPreview = checkPreviewEnvironment();
  
  // Seleção Dinâmica do Roteador
  // HashRouter: Evita erros 404 em refresh em proxies de Cloud Dev
  // BrowserRouter: SEO, UTMs e Tracking Pixels para Produção
  const Router = isPreview ? HashRouter : BrowserRouter;

  return (
    <Router>
      <Routes>
        {/* Redirecionamento Inteligente na Raiz */}
        <Route 
          path="/" 
          element={
            isPreview ? <Navigate to="/sitemap" replace /> : <Login />
          } 
        />

        {/* Rotas Principais */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/professor" element={<ProfessorDashboard />} />
        <Route path="/aluno" element={<AlunoDashboard />} />
        <Route path="/sitemap" element={<Sitemap />} />

        {/* Catch-all: Redireciona rotas inexistentes para a home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

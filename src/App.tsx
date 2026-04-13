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
        <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-blue-400">Production Mode Active</span>
      </div>
      
      <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.1] bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent">
        Experience the Future of <br /> Digital Interaction
      </h1>
      
      <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
        Our high-performance architecture ensures seamless delivery across all platforms. 
        Optimized for SEO, UTM tracking, and lightning-fast load times.
      </p>

      <div className="aspect-video w-full max-w-3xl mx-auto bg-slate-800/50 rounded-3xl border border-white/10 backdrop-blur-md flex items-center justify-center group cursor-pointer hover:border-blue-500/50 transition-all duration-500 shadow-2xl">
        <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center shadow-lg shadow-blue-600/40 group-hover:scale-110 transition-transform duration-300">
          <div className="w-0 h-0 border-t-[10px] border-t-transparent border-l-[18px] border-l-white border-b-[10px] border-b-transparent ml-1"></div>
        </div>
      </div>

      <div className="pt-8 flex flex-wrap justify-center gap-4">
        <button className="px-8 py-4 bg-white text-slate-900 font-bold rounded-2xl hover:bg-blue-50 transition-colors shadow-xl shadow-white/5">
          Get Started Now
        </button>
        <button className="px-8 py-4 bg-white/5 text-white font-bold rounded-2xl border border-white/10 hover:bg-white/10 transition-colors backdrop-blur-sm">
          View Documentation
        </button>
      </div>
    </div>
  </div>
);

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
            isPreview ? <Navigate to="/sitemap" replace /> : <Navigate to="/lp-video" replace />
          } 
        />

        {/* Rotas da Aplicação */}
        <Route path="/sitemap" element={<Sitemap />} />
        <Route path="/lp-video" element={<LPVideo />} />

        {/* Catch-all: Redireciona rotas inexistentes para a home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

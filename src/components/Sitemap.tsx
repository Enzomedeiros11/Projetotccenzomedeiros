import React from 'react';
import { Link } from 'react-router-dom';
import { Map, ArrowRight, Monitor, GraduationCap, School } from 'lucide-react';

const Sitemap: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-6 font-sans relative overflow-hidden">
      {/* Decorative Gradients */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] bg-blue-600/10 blur-[120px] rounded-full"></div>
        <div className="absolute -bottom-[20%] -right-[10%] w-[60%] h-[60%] bg-purple-600/10 blur-[120px] rounded-full"></div>
      </div>

      <div className="relative z-10 max-w-2xl w-full bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-8 md:p-12 shadow-2xl">
        <div className="flex items-center gap-4 mb-10">
          <div className="p-4 bg-blue-600/20 rounded-2xl text-blue-500 border border-blue-500/30">
            <Map size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Mapa do Portal</h1>
            <p className="text-slate-400 text-sm">Ambiente de Desenvolvimento Detectado</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white/5 rounded-2xl p-6 border border-white/5">
            <div className="flex items-start gap-4">
              <div className="p-2 bg-slate-800 rounded-lg border border-white/10 text-slate-400">
                <Monitor size={18} />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-white mb-1">Por que estou vendo isso?</h2>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Em ambientes de nuvem, usamos o <code className="bg-white/10 px-1.5 rounded text-blue-400">HashRouter</code> para garantir que o portal funcione corretamente através dos proxies.
                </p>
              </div>
            </div>
          </div>

          <nav className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link 
              to="/professor" 
              className="group flex flex-col p-6 bg-white/5 border border-white/10 rounded-3xl hover:border-blue-500/50 hover:bg-blue-500/10 transition-all duration-300"
            >
              <div className="p-3 bg-blue-500/20 rounded-2xl text-blue-500 w-fit mb-4 group-hover:scale-110 transition-transform">
                <School size={24} />
              </div>
              <span className="text-lg font-bold text-white mb-1">Área do Professor</span>
              <span className="text-xs text-slate-500 mb-4">Gestão de turmas e notas</span>
              <div className="mt-auto flex items-center gap-2 text-blue-500 text-sm font-bold">
                Acessar <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            <Link 
              to="/aluno" 
              className="group flex flex-col p-6 bg-white/5 border border-white/10 rounded-3xl hover:border-purple-500/50 hover:bg-purple-500/10 transition-all duration-300"
            >
              <div className="p-3 bg-purple-500/20 rounded-2xl text-purple-500 w-fit mb-4 group-hover:scale-110 transition-transform">
                <GraduationCap size={24} />
              </div>
              <span className="text-lg font-bold text-white mb-1">Área do Aluno</span>
              <span className="text-xs text-slate-500 mb-4">Boletim e materiais</span>
              <div className="mt-auto flex items-center gap-2 text-purple-500 text-sm font-bold">
                Acessar <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          </nav>

          <Link 
            to="/login" 
            className="block text-center p-4 bg-white/5 border border-white/10 rounded-2xl text-slate-400 hover:text-white hover:bg-white/10 transition-all text-sm font-semibold"
          >
            Voltar para a Tela de Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Sitemap;

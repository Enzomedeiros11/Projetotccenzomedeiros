import React from 'react';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children, title, subtitle }) => {
  return (
    <div className="min-h-screen flex bg-[#0f172a] font-sans overflow-hidden">
      {/* Sidebar (Left Side) */}
      <div className="w-full lg:w-[450px] bg-[#111827] flex flex-col p-8 md:p-12 z-10 relative border-r border-white/5 shadow-2xl">
        <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full">
          <div className="mb-10">
            <h1 className="text-3xl font-bold text-white mb-3 tracking-tight">{title}</h1>
            <p className="text-slate-400 text-sm leading-relaxed">{subtitle}</p>
          </div>
          
          {children}
        </div>
        
        <div className="mt-auto pt-8 text-center lg:text-left">
          <p className="text-slate-600 text-[10px] uppercase tracking-[0.2em] font-bold">
            © 2026 EduConnect Portal Escolar
          </p>
        </div>
      </div>

      {/* Visual Section (Right Side) */}
      <div className="hidden lg:flex flex-1 relative items-center justify-center overflow-hidden bg-[#0a0f1e]">
        {/* Campus Image Background */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1541339907198-e08756ebafe3?q=80&w=2070&auto=format&fit=crop" 
            alt="Campus Universitário" 
            className="w-full h-full object-cover opacity-80"
            referrerPolicy="no-referrer"
          />
          {/* Vibrant Overlays */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/40 via-transparent to-slate-900/60"></div>
          <div className="absolute inset-0 bg-slate-900/10 backdrop-blur-[2px]"></div>
        </div>

        {/* Branding Overlay */}
        <div className="relative z-10 text-center p-12 max-w-lg">
          <div className="bg-slate-900/40 backdrop-blur-xl border border-white/10 p-10 rounded-[3rem] shadow-2xl">
            <h2 className="text-4xl font-bold text-white mb-4 leading-tight">Excelência em Educação Digital</h2>
            <p className="text-slate-200 text-lg">O portal oficial para conexão entre professores e alunos do futuro.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;

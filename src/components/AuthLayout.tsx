import React from 'react';
import { motion } from 'motion/react';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children, title, subtitle }) => {
  return (
    <div className="min-h-screen flex bg-[#020617] font-sans overflow-hidden selection:bg-blue-500/30">
      {/* Sidebar (Left Side) */}
      <motion.div 
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full lg:w-[480px] bg-[#020617] flex flex-col p-8 md:p-16 z-20 relative border-r border-white/5 shadow-[20px_0_50px_rgba(0,0,0,0.5)]"
      >
        <div className="mb-12 flex items-center gap-2">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20">
            <span className="text-white font-black text-xl">E</span>
          </div>
          <span className="text-white font-display font-bold text-xl tracking-tight">EduConnect</span>
        </div>

        <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full">
          <div className="mb-10">
            <motion.h1 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-4xl font-display font-bold text-white mb-3 tracking-tight"
            >
              {title}
            </motion.h1>
            <motion.p 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-slate-400 text-base leading-relaxed"
            >
              {subtitle}
            </motion.p>
          </div>
          
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
            {children}
          </motion.div>
        </div>
        
        <div className="mt-auto pt-12">
          <p className="text-slate-600 text-[10px] uppercase tracking-[0.3em] font-bold">
            © 2026 EduConnect • Excelência Digital
          </p>
        </div>
      </motion.div>

      {/* Visual Section (Right Side) */}
      <div className="hidden lg:flex flex-1 relative items-center justify-center overflow-hidden bg-[#020617]">
        {/* Campus Image Background */}
        <motion.div 
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.5 }}
          className="absolute inset-0 z-0"
        >
          <img 
            src="https://images.unsplash.com/photo-1523050853063-bd388f9f79b5?q=80&w=2070&auto=format&fit=crop" 
            alt="Campus Universitário" 
            className="w-full h-full object-cover opacity-40 grayscale-[0.2]"
            referrerPolicy="no-referrer"
          />
          {/* Vibrant Overlays */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-transparent to-slate-900/80"></div>
          <div className="absolute inset-0 bg-[#020617]/20 backdrop-blur-[1px]"></div>
        </div>

        {/* Floating Elements */}
        <motion.div 
          animate={{ 
            y: [0, -20, 0],
          }}
          transition={{ 
            duration: 6, 
            repeat: Infinity,
            ease: "easeInOut" 
          }}
          className="relative z-10 text-center p-12 max-w-xl"
        >
          <div className="bg-white/5 backdrop-blur-2xl border border-white/10 p-12 rounded-[3.5rem] shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50"></div>
            <h2 className="text-5xl font-display font-bold text-white mb-6 leading-tight tracking-tight">
              Transformando o <span className="text-blue-500">Futuro</span> da Educação
            </h2>
            <p className="text-slate-300 text-xl font-light leading-relaxed">
              Uma plataforma integrada para uma experiência acadêmica sem fronteiras.
            </p>
            
            <div className="mt-10 flex justify-center gap-8">
              <div className="text-center">
                <p className="text-3xl font-display font-bold text-white">15k+</p>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Alunos</p>
              </div>
              <div className="w-px h-10 bg-white/10"></div>
              <div className="text-center">
                <p className="text-3xl font-display font-bold text-white">500+</p>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Escolas</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Decorative Circles */}
        <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-blue-600/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] left-[-5%] w-96 h-96 bg-purple-600/10 rounded-full blur-[120px]"></div>
      </div>
    </div>
  );
};

export default AuthLayout;

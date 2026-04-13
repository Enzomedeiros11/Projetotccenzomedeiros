import React, { useEffect, useState } from 'react';
import { auth, db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { LogOut, BookOpen, Users, ClipboardList, Plus, Search } from 'lucide-react';

const Dashboard: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        const docRef = doc(db, 'users', currentUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProfile(docSnap.data());
        }
        setLoading(false);
      } else {
        navigate('/login');
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const isTeacher = profile?.role === 'teacher';

  return (
    <div className="min-h-screen bg-[#0f172a] text-white font-sans">
      {/* Sidebar / Header */}
      <header className="border-b border-white/10 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-blue-600 p-2 rounded-lg">
              <BookOpen size={20} />
            </div>
            <span className="font-bold text-xl tracking-tight">EduConnect</span>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-semibold">{profile?.name}</p>
              <p className="text-xs text-slate-400 capitalize">{profile?.role === 'teacher' ? 'Professor' : 'Aluno'}</p>
            </div>
            <button 
              onClick={handleLogout}
              className="p-2 hover:bg-white/10 rounded-lg text-slate-400 hover:text-white transition-all"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold">Olá, {profile?.name?.split(' ')[0]}!</h2>
            <p className="text-slate-400">Bem-vindo ao seu painel de controle.</p>
          </div>
          
          {isTeacher ? (
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-blue-600/20">
              <Plus size={20} />
              Nova Turma
            </button>
          ) : (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input 
                placeholder="Código da Turma"
                className="bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 focus:border-blue-500 outline-none transition-all w-full md:w-64"
              />
            </div>
          )}
        </div>

        {/* Stats / Quick Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-slate-900/50 border border-white/10 p-6 rounded-3xl hover:border-blue-500/50 transition-all group">
            <div className="bg-blue-500/10 text-blue-500 p-3 rounded-2xl w-fit mb-4 group-hover:scale-110 transition-transform">
              <Users size={24} />
            </div>
            <h3 className="text-lg font-semibold mb-1">{isTeacher ? 'Suas Turmas' : 'Turmas Inscritas'}</h3>
            <p className="text-slate-400 text-sm">Você tem 0 turmas ativas no momento.</p>
          </div>

          <div className="bg-slate-900/50 border border-white/10 p-6 rounded-3xl hover:border-purple-500/50 transition-all group">
            <div className="bg-purple-500/10 text-purple-500 p-3 rounded-2xl w-fit mb-4 group-hover:scale-110 transition-transform">
              <ClipboardList size={24} />
            </div>
            <h3 className="text-lg font-semibold mb-1">Atividades</h3>
            <p className="text-slate-400 text-sm">Nenhuma atividade pendente para hoje.</p>
          </div>

          <div className="bg-slate-900/50 border border-white/10 p-6 rounded-3xl hover:border-green-500/50 transition-all group">
            <div className="bg-green-500/10 text-green-500 p-3 rounded-2xl w-fit mb-4 group-hover:scale-110 transition-transform">
              <BookOpen size={24} />
            </div>
            <h3 className="text-lg font-semibold mb-1">Materiais</h3>
            <p className="text-slate-400 text-sm">Acesse a biblioteca de recursos.</p>
          </div>
        </div>

        {/* Empty State */}
        <div className="bg-slate-900/30 border border-dashed border-white/10 rounded-3xl p-12 text-center">
          <div className="bg-white/5 p-4 rounded-full w-fit mx-auto mb-4">
            <ClipboardList size={48} className="text-slate-600" />
          </div>
          <h3 className="text-xl font-bold mb-2">Tudo limpo por aqui!</h3>
          <p className="text-slate-400 max-w-sm mx-auto">
            {isTeacher 
              ? 'Comece criando sua primeira turma para gerenciar seus alunos e atividades.' 
              : 'Insira o código fornecido pelo seu professor para entrar em uma turma.'}
          </p>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;

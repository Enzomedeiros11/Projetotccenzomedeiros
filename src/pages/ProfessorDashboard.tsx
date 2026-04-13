import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Users, ClipboardList, Plus, BookOpen, GraduationCap } from 'lucide-react';
import { api } from '../lib/api';

const ProfessorDashboard: React.FC = () => {
  const [profile, setProfile] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const navigate = useNavigate();

  React.useEffect(() => {
    const fetchProfile = async () => {
      try {
        const user = await api.getMe();
        if (user.role !== 'teacher') {
          navigate('/aluno');
          return;
        }
        setProfile(user);
      } catch (err) {
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [navigate]);

  const handleLogout = async () => {
    await api.logout();
    navigate('/login');
  };

  if (loading) return <div className="min-h-screen bg-[#0f172a] flex items-center justify-center"><div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div></div>;

  return (
    <div className="min-h-screen bg-[#0f172a] text-white font-sans flex">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900/50 border-r border-white/10 p-6 flex flex-col">
        <div className="flex items-center gap-3 mb-10">
          <div className="bg-blue-600 p-2 rounded-lg">
            <GraduationCap size={24} />
          </div>
          <span className="font-bold text-xl tracking-tight">EduConnect</span>
        </div>

        <nav className="flex-1 space-y-2">
          <button className="w-full flex items-center gap-3 p-3 bg-blue-600 rounded-xl text-sm font-semibold">
            <Users size={18} /> Turmas
          </button>
          <button className="w-full flex items-center gap-3 p-3 hover:bg-white/5 rounded-xl text-sm font-semibold text-slate-400 hover:text-white transition-all">
            <ClipboardList size={18} /> Atividades
          </button>
          <button className="w-full flex items-center gap-3 p-3 hover:bg-white/5 rounded-xl text-sm font-semibold text-slate-400 hover:text-white transition-all">
            <BookOpen size={18} /> Materiais
          </button>
        </nav>

        <div className="pt-6 border-t border-white/10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-blue-500/20 border border-blue-500/50 flex items-center justify-center text-blue-500 font-bold">
              {profile?.name?.[0]}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-semibold truncate">{profile?.name}</p>
              <p className="text-xs text-slate-500">Professor</p>
            </div>
          </div>
          <button onClick={handleLogout} className="w-full flex items-center gap-3 p-3 hover:bg-red-500/10 rounded-xl text-sm font-semibold text-red-400 transition-all">
            <LogOut size={18} /> Sair
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        <header className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Painel do Professor</h1>
            <p className="text-slate-400 mt-1">{profile?.course} • {profile?.grade}</p>
          </div>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl flex items-center gap-2 font-bold transition-all shadow-lg shadow-blue-600/20">
            <Plus size={20} /> Criar Nova Turma
          </button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-slate-900/40 border border-white/10 p-8 rounded-[2rem] text-center border-dashed">
            <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users size={32} className="text-slate-600" />
            </div>
            <h3 className="text-xl font-bold mb-2">Nenhuma turma ainda</h3>
            <p className="text-slate-400 text-sm mb-6">Crie sua primeira turma para começar a gerenciar seus alunos.</p>
            <button className="text-blue-500 font-bold hover:underline">Saiba como funciona</button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProfessorDashboard;

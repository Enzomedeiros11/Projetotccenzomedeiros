import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, BookOpen, ClipboardList, Search, GraduationCap, Star } from 'lucide-react';
import { api } from '../lib/api';

const AlunoDashboard: React.FC = () => {
  const [profile, setProfile] = React.useState<any>(null);
  const [classes, setClasses] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [searchCode, setSearchCode] = React.useState('');
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      const user = await api.getMe();
      if (user.role !== 'student') {
        navigate('/professor');
        return;
      }
      setProfile(user);
      const classesData = await api.getMe().then(() => fetch('/api/classes').then(r => r.json()));
      setClasses(Array.isArray(classesData) ? classesData : []);
    } catch (err) {
      navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchData();
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
          <div className="bg-purple-600 p-2 rounded-lg">
            <GraduationCap size={24} />
          </div>
          <span className="font-bold text-xl tracking-tight">EduConnect</span>
        </div>

        <nav className="flex-1 space-y-2">
          <button className="w-full flex items-center gap-3 p-3 bg-purple-600 rounded-xl text-sm font-semibold">
            <BookOpen size={18} /> Minhas Turmas
          </button>
          <button className="w-full flex items-center gap-3 p-3 hover:bg-white/5 rounded-xl text-sm font-semibold text-slate-400 hover:text-white transition-all">
            <ClipboardList size={18} /> Atividades
          </button>
          <button className="w-full flex items-center gap-3 p-3 hover:bg-white/5 rounded-xl text-sm font-semibold text-slate-400 hover:text-white transition-all">
            <Star size={18} /> Notas e Boletim
          </button>
        </nav>

        <div className="pt-6 border-t border-white/10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-purple-500/20 border border-purple-500/50 flex items-center justify-center text-purple-500 font-bold">
              {profile?.name?.[0]}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-semibold truncate">{profile?.name}</p>
              <p className="text-xs text-slate-500">Aluno</p>
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
            <h1 className="text-3xl font-bold">Painel do Aluno</h1>
            <p className="text-slate-400 mt-1">Acompanhe suas aulas e desempenho</p>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input 
              value={searchCode}
              onChange={e => setSearchCode(e.target.value)}
              placeholder="Código da Turma"
              className="bg-white/5 border border-white/10 rounded-2xl py-3 pl-10 pr-4 focus:border-purple-500 outline-none transition-all w-64"
            />
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes.length > 0 ? (
            classes.map((c) => (
              <div key={c.id} className="bg-slate-900/40 border border-white/10 p-6 rounded-[2rem] hover:border-purple-500/50 transition-all group">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-purple-500/10 rounded-2xl text-purple-500">
                    <BookOpen size={24} />
                  </div>
                  <div className="flex items-center gap-1 text-[10px] font-bold bg-purple-500/10 px-2 py-1 rounded-full text-purple-400 uppercase tracking-widest">
                    <Star size={10} /> Ativo
                  </div>
                </div>
                <h3 className="text-xl font-bold mb-1">{c.name}</h3>
                <p className="text-slate-400 text-sm mb-4">{c.subject} • {c.grade}</p>
                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                  <span className="text-xs text-slate-500">Professor: {c.teacher_name || 'Docente'}</span>
                  <button className="text-purple-500 text-sm font-bold hover:underline">Entrar</button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full bg-slate-900/40 border border-white/10 p-12 rounded-[2rem] text-center border-dashed">
              <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen size={32} className="text-slate-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">Você não está em nenhuma turma</h3>
              <p className="text-slate-400 text-sm mb-6">Peça o código ao seu professor para entrar em uma turma.</p>
              <div className="flex justify-center gap-4">
                <button className="text-purple-500 font-bold hover:underline">Ver tutoriais</button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AlunoDashboard;

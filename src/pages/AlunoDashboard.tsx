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
      const classesData = await api.getClasses();
      setClasses(Array.isArray(classesData) ? classesData : []);
    } catch (err: any) {
      console.error('Fetch Error:', err);
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

  const handleJoinClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchCode.trim()) return;
    
    try {
      await api.joinClass(searchCode);
      setSearchCode('');
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Erro ao entrar na turma');
    }
  };

  if (loading) return <div className="min-h-screen bg-[#0f172a] flex items-center justify-center"><div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div></div>;

  return (
    <div className="min-h-screen bg-[#020617] text-white font-sans flex">
      {/* Sidebar */}
      <aside className="w-72 bg-[#020617] border-r border-white/5 p-8 flex flex-col z-20">
        <div className="flex items-center gap-3 mb-12">
          <div className="bg-purple-600 p-2.5 rounded-xl shadow-lg shadow-purple-600/20">
            <GraduationCap size={24} className="text-white" />
          </div>
          <span className="font-display font-bold text-2xl tracking-tight">EduConnect</span>
        </div>

        <nav className="flex-1 space-y-2">
          <button className="w-full flex items-center gap-3 p-4 bg-purple-600/10 text-purple-500 rounded-2xl text-sm font-bold border border-purple-500/20">
            <BookOpen size={20} /> Minhas Turmas
          </button>
          <button className="w-full flex items-center gap-3 p-4 hover:bg-white/5 rounded-2xl text-sm font-bold text-slate-400 hover:text-white transition-all">
            <ClipboardList size={20} /> Atividades
          </button>
          <button className="w-full flex items-center gap-3 p-4 hover:bg-white/5 rounded-2xl text-sm font-bold text-slate-400 hover:text-white transition-all">
            <Star size={20} /> Notas e Boletim
          </button>
        </nav>

        <div className="pt-8 border-t border-white/5">
          <div className="flex items-center gap-4 mb-6 p-2">
            <div className="w-12 h-12 rounded-2xl bg-purple-600/20 border border-purple-600/30 flex items-center justify-center text-purple-500 font-display font-bold text-xl">
              {profile?.name?.[0]}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold truncate text-white">{profile?.name}</p>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black">Aluno</p>
            </div>
          </div>
          <button onClick={handleLogout} className="w-full flex items-center gap-3 p-4 hover:bg-red-500/10 rounded-2xl text-sm font-bold text-red-400 transition-all">
            <LogOut size={20} /> Sair da Conta
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-12 overflow-y-auto bg-[#020617]">
        <header className="flex items-end justify-between mb-12">
          <div>
            <h1 className="text-5xl font-display font-bold tracking-tight mb-2">Painel do Aluno</h1>
            <p className="text-slate-400 text-lg font-light">Acompanhe suas aulas, materiais e desempenho acadêmico.</p>
          </div>
          <form onSubmit={handleJoinClass} className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-purple-500 transition-colors" size={20} />
            <input 
              value={searchCode}
              onChange={e => setSearchCode(e.target.value)}
              placeholder="Código da Turma"
              className="bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-6 focus:border-purple-500/50 focus:bg-purple-500/5 outline-none transition-all w-72 font-bold placeholder-slate-600"
            />
          </form>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {classes.length > 0 ? (
            classes.map((c) => (
              <div key={c.id} className="bg-white/[0.02] border border-white/5 p-8 rounded-[2.5rem] hover:border-purple-500/30 hover:bg-white/[0.04] transition-all group relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-600/5 blur-[60px] rounded-full"></div>
                <div className="flex justify-between items-start mb-6 relative z-10">
                  <div className="p-4 bg-purple-600/10 rounded-2xl text-purple-500">
                    <BookOpen size={28} />
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] font-black bg-purple-500/10 px-3 py-1.5 rounded-full text-purple-400 uppercase tracking-widest border border-purple-500/10">
                    <Star size={12} fill="currentColor" /> Ativo
                  </div>
                </div>
                <h3 className="text-2xl font-display font-bold mb-2 group-hover:text-purple-400 transition-colors">{c.name}</h3>
                <p className="text-slate-400 font-medium mb-8">{c.subject} • {c.grade}</p>
                <div className="flex items-center justify-between pt-6 border-t border-white/5 relative z-10">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-500 uppercase tracking-widest font-black mb-1">Professor</span>
                    <span className="text-sm font-bold text-slate-300">{c.teacherName || 'Docente'}</span>
                  </div>
                  <button 
                    onClick={() => navigate(`/turma/${c.id}`)}
                    className="bg-white/5 hover:bg-purple-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all border border-white/5 hover:border-purple-600 hover:shadow-lg hover:shadow-purple-600/20"
                  >
                    Entrar
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full bg-white/[0.02] border border-white/5 p-20 rounded-[3rem] text-center border-dashed">
              <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <BookOpen size={40} className="text-slate-600" />
              </div>
              <h3 className="text-2xl font-display font-bold mb-3">Você ainda não está em nenhuma turma</h3>
              <p className="text-slate-400 text-lg mb-8 max-w-md mx-auto">Insira o código fornecido pelo seu professor no campo acima para começar.</p>
              <div className="flex justify-center gap-4">
                <button className="text-purple-500 font-bold text-lg hover:text-purple-400 transition-colors">Ver tutoriais de acesso →</button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AlunoDashboard;

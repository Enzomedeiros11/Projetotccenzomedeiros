import React from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Users, ClipboardList, Plus, BookOpen, GraduationCap } from 'lucide-react';
import { api } from '../lib/api';

const ProfessorDashboard: React.FC = () => {
  const [profile, setProfile] = React.useState<any>(null);
  const [classes, setClasses] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [showModal, setShowModal] = React.useState(false);
  const [newClass, setNewClass] = React.useState({ name: '', subject: '', grade: '' });
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      const user = await api.getMe();
      if (user.role !== 'teacher') {
        navigate('/aluno');
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

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createClass(newClass);
      setShowModal(false);
      setNewClass({ name: '', subject: '', grade: '' });
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Erro ao criar turma');
    }
  };

  if (loading) return <div className="min-h-screen bg-[#0f172a] flex items-center justify-center"><div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div></div>;

  return (
    <div className="min-h-screen bg-[#020617] text-white font-sans flex">
      {/* Sidebar */}
      <aside className="w-72 bg-[#020617] border-r border-white/5 p-8 flex flex-col z-20">
        <div className="flex items-center gap-3 mb-12">
          <div className="bg-blue-600 p-2.5 rounded-xl shadow-lg shadow-blue-600/20">
            <GraduationCap size={24} className="text-white" />
          </div>
          <span className="font-display font-bold text-2xl tracking-tight">EduConnect</span>
        </div>

        <nav className="flex-1 space-y-2">
          <button className="w-full flex items-center gap-3 p-4 bg-blue-600/10 text-blue-500 rounded-2xl text-sm font-bold border border-blue-500/20">
            <Users size={20} /> Turmas
          </button>
          <button className="w-full flex items-center gap-3 p-4 hover:bg-white/5 rounded-2xl text-sm font-bold text-slate-400 hover:text-white transition-all">
            <ClipboardList size={20} /> Atividades
          </button>
          <button className="w-full flex items-center gap-3 p-4 hover:bg-white/5 rounded-2xl text-sm font-bold text-slate-400 hover:text-white transition-all">
            <BookOpen size={20} /> Materiais
          </button>
        </nav>

        <div className="pt-8 border-t border-white/5">
          <div className="flex items-center gap-4 mb-6 p-2">
            <div className="w-12 h-12 rounded-2xl bg-blue-600/20 border border-blue-600/30 flex items-center justify-center text-blue-500 font-display font-bold text-xl">
              {profile?.name?.[0]}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold truncate text-white">{profile?.name}</p>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black">Professor</p>
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
            <h1 className="text-5xl font-display font-bold tracking-tight mb-2">Painel do Professor</h1>
            <p className="text-slate-400 text-lg font-light">Gerencie suas turmas e acompanhe o progresso dos alunos.</p>
          </div>
          <button 
            onClick={() => setShowModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl flex items-center gap-3 font-bold transition-all shadow-2xl shadow-blue-600/30 active:scale-[0.98]"
          >
            <Plus size={22} /> Criar Nova Turma
          </button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {classes.length > 0 ? (
            classes.map((c) => (
              <div key={c.id} className="bg-white/[0.02] border border-white/5 p-8 rounded-[2.5rem] hover:border-blue-500/30 hover:bg-white/[0.04] transition-all group relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 blur-[60px] rounded-full"></div>
                <div className="flex justify-between items-start mb-6 relative z-10">
                  <div className="p-4 bg-blue-600/10 rounded-2xl text-blue-500">
                    <Users size={28} />
                  </div>
                  <span className="text-[10px] font-black bg-white/5 px-3 py-1.5 rounded-full text-slate-400 uppercase tracking-[0.2em] border border-white/5">
                    {c.code}
                  </span>
                </div>
                <h3 className="text-2xl font-display font-bold mb-2 group-hover:text-blue-400 transition-colors">{c.name}</h3>
                <p className="text-slate-400 font-medium mb-8">{c.subject} • {c.grade}</p>
                <div className="flex items-center justify-between pt-6 border-t border-white/5 relative z-10">
                  <div className="flex -space-x-3">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="w-10 h-10 rounded-xl bg-slate-800 border-2 border-[#020617] flex items-center justify-center text-[10px] text-slate-500 font-black">
                        ?
                      </div>
                    ))}
                  </div>
                  <button 
                    onClick={() => navigate(`/turma/${c.id}`)}
                    className="bg-white/5 hover:bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all border border-white/5 hover:border-blue-600 hover:shadow-lg hover:shadow-blue-600/20"
                  >
                    Gerenciar
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full bg-white/[0.02] border border-white/5 p-20 rounded-[3rem] text-center border-dashed">
              <div className="w-20 h-20 bg-white/5 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <Users size={40} className="text-slate-600" />
              </div>
              <h3 className="text-2xl font-display font-bold mb-3">Nenhuma turma encontrada</h3>
              <p className="text-slate-400 text-lg mb-8 max-w-md mx-auto">Crie sua primeira turma para começar a organizar seus materiais e atividades.</p>
              <button onClick={() => setShowModal(true)} className="text-blue-500 font-bold text-lg hover:text-blue-400 transition-colors">Começar agora →</button>
            </div>
          )}
        </div>
      </main>

      {/* Modal Criar Turma */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-900 border border-white/10 w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl">
            <h2 className="text-2xl font-bold mb-6">Nova Turma</h2>
            <form onSubmit={handleCreateClass} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase ml-1">Nome da Turma</label>
                <input 
                  required
                  value={newClass.name}
                  onChange={e => setNewClass({...newClass, name: e.target.value})}
                  placeholder="Ex: 3º Ano A - Manhã"
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 outline-none focus:border-blue-500 transition-all"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase ml-1">Matéria</label>
                <input 
                  required
                  value={newClass.subject}
                  onChange={e => setNewClass({...newClass, subject: e.target.value})}
                  placeholder="Ex: Matemática"
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 outline-none focus:border-blue-500 transition-all"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase ml-1">Ano Escolar</label>
                <select 
                  required
                  value={newClass.grade}
                  onChange={e => setNewClass({...newClass, grade: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 outline-none focus:border-blue-500 transition-all appearance-none"
                >
                  <option value="" className="bg-slate-900">Selecione</option>
                  <option value="1º Ano" className="bg-slate-900">1º Ano</option>
                  <option value="2º Ano" className="bg-slate-900">2º Ano</option>
                  <option value="3º Ano" className="bg-slate-900">3º Ano</option>
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button 
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-white/5 hover:bg-white/10 py-3 rounded-xl font-bold transition-all"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 py-3 rounded-xl font-bold transition-all shadow-lg shadow-blue-600/20"
                >
                  Criar Turma
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfessorDashboard;

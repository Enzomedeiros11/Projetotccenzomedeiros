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
            <p className="text-slate-400 mt-1">Gerencie suas turmas e atividades</p>
          </div>
          <button 
            onClick={() => setShowModal(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl flex items-center gap-2 font-bold transition-all shadow-lg shadow-blue-600/20"
          >
            <Plus size={20} /> Criar Nova Turma
          </button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes.length > 0 ? (
            classes.map((c) => (
              <div key={c.id} className="bg-slate-900/40 border border-white/10 p-6 rounded-[2rem] hover:border-blue-500/50 transition-all group">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-500">
                    <Users size={24} />
                  </div>
                  <span className="text-[10px] font-bold bg-white/5 px-2 py-1 rounded-full text-slate-400 uppercase tracking-widest">
                    {c.code}
                  </span>
                </div>
                <h3 className="text-xl font-bold mb-1">{c.name}</h3>
                <p className="text-slate-400 text-sm mb-4">{c.subject} • {c.grade}</p>
                <div className="flex items-center justify-between pt-4 border-t border-white/5">
                  <div className="flex -space-x-2">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="w-8 h-8 rounded-full bg-slate-800 border-2 border-[#0f172a] flex items-center justify-center text-[10px] text-slate-500">
                        ?
                      </div>
                    ))}
                  </div>
                  <button 
                    onClick={() => navigate(`/turma/${c.id}`)}
                    className="text-blue-500 text-sm font-bold hover:underline"
                  >
                    Ver Turma
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full bg-slate-900/40 border border-white/10 p-12 rounded-[2rem] text-center border-dashed">
              <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users size={32} className="text-slate-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">Nenhuma turma ainda</h3>
              <p className="text-slate-400 text-sm mb-6">Crie sua primeira turma para começar a gerenciar seus alunos.</p>
              <button onClick={() => setShowModal(true)} className="text-blue-500 font-bold hover:underline">Criar agora</button>
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

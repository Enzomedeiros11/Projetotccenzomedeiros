import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  Users, 
  ClipboardList, 
  BookOpen, 
  Plus, 
  FileText, 
  Link as LinkIcon, 
  Video, 
  Calendar,
  Send,
  MoreVertical,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { api } from '../lib/api';
import { motion, AnimatePresence } from 'motion/react';

const ClassDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'mural' | 'atividades' | 'pessoas'>('mural');
  const [classData, setClassData] = useState<any>(null);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [materials, setMaterials] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [showMaterialModal, setShowMaterialModal] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<any>(null);
  const [showSubmissionsModal, setShowSubmissionsModal] = useState(false);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  // Form states
  const [newAssignment, setNewAssignment] = useState({ title: '', description: '', due_date: '', points: 100 });
  const [newMaterial, setNewMaterial] = useState({ title: '', description: '', file_url: '', type: 'file' });
  const [submissionData, setSubmissionData] = useState({ content: '', file_url: '' });
  const [gradeData, setGradeData] = useState({ grade: 0, feedback: '' });
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);

  const fetchData = async () => {
    if (!id) return;
    try {
      const [user, classInfo, assignmentsData, materialsData, studentsData] = await Promise.all([
        api.getMe(),
        api.getClass(id),
        api.getAssignments(id),
        api.getMaterials(id),
        api.getStudents(id)
      ]);
      setProfile(user);
      setClassData(classInfo);
      setAssignments(assignmentsData);
      setMaterials(materialsData);
      setStudents(studentsData);
    } catch (err: any) {
      console.error('Fetch Error:', err);
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    try {
      await api.createAssignment(id, newAssignment);
      setShowAssignmentModal(false);
      setNewAssignment({ title: '', description: '', due_date: '', points: 100 });
      fetchData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleCreateMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    try {
      await api.createMaterial(id, newMaterial);
      setShowMaterialModal(false);
      setNewMaterial({ title: '', description: '', file_url: '', type: 'file' });
      fetchData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleAssignmentClick = async (assignment: any) => {
    setSelectedAssignment(assignment);
    if (isTeacher) {
      try {
        const data = await api.getSubmissions(assignment.id);
        setSubmissions(data);
        setShowSubmissionsModal(true);
      } catch (err: any) {
        alert(err.message);
      }
    } else {
      setShowSubmitModal(true);
    }
  };

  const handleSubmitAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssignment) return;
    try {
      await api.submitAssignment(selectedAssignment.id, submissionData);
      setShowSubmitModal(false);
      setSubmissionData({ content: '', file_url: '' });
      alert('Atividade entregue com sucesso!');
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleGradeSubmission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubmission) return;
    try {
      await api.gradeSubmission(selectedSubmission.id, gradeData);
      setSelectedSubmission(null);
      // Refresh submissions
      const data = await api.getSubmissions(selectedAssignment.id);
      setSubmissions(data);
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  const isTeacher = profile?.role === 'teacher';

  return (
    <div className="min-h-screen bg-[#020617] text-white font-sans">
      {/* Header */}
      <header className="bg-[#020617]/80 border-b border-white/5 sticky top-0 z-30 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-8">
          <div className="flex items-center justify-between h-24">
            <div className="flex items-center gap-6">
              <button 
                onClick={() => navigate(-1)}
                className="p-3 hover:bg-white/5 rounded-2xl transition-all text-slate-400 hover:text-white border border-transparent hover:border-white/5"
              >
                <ArrowLeft size={24} />
              </button>
              <div>
                <h1 className="text-2xl font-display font-bold tracking-tight">{classData?.name}</h1>
                <p className="text-sm text-slate-500 font-medium">{classData?.subject} • {classData?.grade}</p>
              </div>
            </div>

            <nav className="hidden lg:flex items-center gap-2 bg-white/5 p-1.5 rounded-[2rem] border border-white/5">
              {[
                { id: 'mural', label: 'Mural', icon: BookOpen },
                { id: 'atividades', label: 'Atividades', icon: ClipboardList },
                { id: 'pessoas', label: 'Pessoas', icon: Users },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-3 px-8 py-3 rounded-[1.5rem] text-sm font-bold transition-all relative ${
                    activeTab === tab.id 
                      ? 'text-white' 
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  {activeTab === tab.id && (
                    <motion.div 
                      layoutId="activeTabClass"
                      className="absolute inset-0 bg-blue-600 rounded-[1.5rem] shadow-lg shadow-blue-600/20"
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-3">
                    <tab.icon size={18} />
                    {tab.label}
                  </span>
                </button>
              ))}
            </nav>

            <div className="flex items-center gap-4">
              {isTeacher && (
                <div className="hidden sm:flex flex-col items-end mr-2">
                  <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-0.5">Código de Acesso</span>
                  <span className="text-sm font-mono font-bold text-blue-500">{classData?.code}</span>
                </div>
              )}
              <div className="w-12 h-12 rounded-2xl bg-blue-600/20 border border-blue-600/30 flex items-center justify-center text-blue-500 font-display font-bold text-xl">
                {profile?.name?.[0]}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">
          {activeTab === 'mural' && (
            <motion.div 
              key="mural"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-12"
            >
              {/* Class Banner */}
              <div className="relative h-64 rounded-[3.5rem] overflow-hidden group shadow-2xl">
                <img 
                  src="https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=2070&auto=format&fit=crop" 
                  alt="Class Banner"
                  className="w-full h-full object-cover opacity-50 group-hover:scale-105 transition-transform duration-1000"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-transparent"></div>
                <div className="absolute bottom-12 left-12">
                  <h2 className="text-6xl font-display font-bold tracking-tight mb-2">{classData?.name}</h2>
                  <div className="flex items-center gap-4">
                    <span className="text-blue-500 font-black uppercase tracking-[0.3em] text-sm">{classData?.subject}</span>
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-700"></div>
                    <span className="text-slate-400 font-bold uppercase tracking-[0.3em] text-sm">{classData?.grade}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
                {/* Sidebar Info */}
                <div className="lg:col-span-1 space-y-8">
                  <div className="bg-white/[0.02] border border-white/5 p-8 rounded-[2.5rem]">
                    <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.3em] mb-6">Próximas Atividades</h3>
                    <div className="space-y-6">
                      {assignments.slice(0, 3).map(a => (
                        <div key={a.id} className="flex gap-4 group cursor-pointer">
                          <div className="mt-1 text-blue-500 group-hover:scale-110 transition-transform"><Clock size={18} /></div>
                          <div>
                            <p className="text-sm font-bold line-clamp-1 group-hover:text-blue-400 transition-colors">{a.title}</p>
                            <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mt-1">
                              {a.dueDate ? new Date(a.dueDate).toLocaleDateString() : 'Sem data'}
                            </p>
                          </div>
                        </div>
                      ))}
                      {assignments.length === 0 && (
                        <p className="text-sm text-slate-600 italic">Nenhuma atividade pendente.</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Feed */}
                <div className="lg:col-span-3 space-y-8">
                  {isTeacher && (
                    <div className="bg-white/[0.02] border border-white/5 p-8 rounded-[2.5rem] flex items-center gap-6 group hover:bg-white/[0.04] transition-all cursor-pointer" onClick={() => setShowMaterialModal(true)}>
                      <div className="w-14 h-14 rounded-2xl bg-blue-600/10 flex items-center justify-center text-blue-500 group-hover:bg-blue-600 group-hover:text-white transition-all">
                        <Plus size={28} />
                      </div>
                      <div className="flex-1">
                        <p className="text-xl font-bold text-white">Compartilhe algo com a turma...</p>
                        <p className="text-slate-500 text-sm">Poste materiais, links ou avisos importantes.</p>
                      </div>
                    </div>
                  )}

                  {/* Materials List */}
                  <div className="space-y-8">
                    {materials.map((m) => (
                      <div key={m.id} className="bg-white/[0.02] border border-white/5 p-10 rounded-[3rem] hover:border-white/10 transition-all relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-48 h-48 bg-blue-600/[0.02] blur-[80px] rounded-full"></div>
                        <div className="flex items-start justify-between mb-8 relative z-10">
                          <div className="flex items-center gap-5">
                            <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-slate-400 border border-white/5">
                              <Users size={24} />
                            </div>
                            <div>
                              <p className="text-lg font-bold text-white">{classData?.teacher_name}</p>
                              <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mt-0.5">
                                {m.created_at ? new Date(m.created_at).toLocaleDateString() : 'Recentemente'}
                              </p>
                            </div>
                          </div>
                          <button className="text-slate-600 hover:text-white transition-colors"><MoreVertical size={24} /></button>
                        </div>
                        <p className="text-slate-300 text-lg mb-8 leading-relaxed relative z-10">{m.description}</p>
                        {m.file_url && (
                          <a 
                            href={m.file_url} 
                            target="_blank" 
                            rel="noreferrer"
                            className="flex items-center gap-6 p-6 bg-white/[0.03] border border-white/5 rounded-[2rem] hover:bg-white/[0.06] transition-all group relative z-10"
                          >
                            <div className="p-4 bg-blue-600/10 rounded-2xl text-blue-500 group-hover:bg-blue-600 group-hover:text-white transition-all">
                              {m.type === 'video' ? <Video size={24} /> : m.type === 'link' ? <LinkIcon size={24} /> : <FileText size={24} />}
                            </div>
                            <div className="flex-1">
                              <p className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors">{m.title}</p>
                              <p className="text-sm text-slate-500 uppercase tracking-widest font-bold mt-0.5">{m.type}</p>
                            </div>
                            <ExternalLink size={20} className="text-slate-600 group-hover:text-white transition-colors" />
                          </a>
                        )}
                      </div>
                    ))}
                  </div>

                  {materials.length === 0 && !isTeacher && (
                    <div className="text-center py-12 bg-slate-900/20 rounded-[2rem] border border-dashed border-white/10">
                      <BookOpen size={48} className="mx-auto text-slate-700 mb-4" />
                      <p className="text-slate-500 font-medium">O mural está vazio por enquanto.</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'atividades' && (
            <motion.div 
              key="atividades"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-4xl mx-auto space-y-10"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-4xl font-display font-bold tracking-tight">Atividades do Curso</h2>
                {isTeacher && (
                  <button 
                    onClick={() => setShowAssignmentModal(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-2xl flex items-center gap-3 font-bold transition-all shadow-lg shadow-blue-600/20"
                  >
                    <Plus size={20} /> Criar Atividade
                  </button>
                )}
              </div>

              <div className="space-y-6">
                {assignments.map((a) => (
                  <div 
                    key={a.id} 
                    onClick={() => handleAssignmentClick(a)}
                    className="bg-white/[0.02] border border-white/5 p-8 rounded-[2.5rem] hover:bg-white/[0.04] hover:border-white/10 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-8">
                      <div className="w-16 h-16 rounded-2xl bg-blue-600/10 flex items-center justify-center text-blue-500 group-hover:bg-blue-600 group-hover:text-white transition-all">
                        <ClipboardList size={28} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-xl font-bold group-hover:text-blue-400 transition-colors">{a.title}</h3>
                          <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest bg-white/5 px-3 py-1 rounded-full">{a.points} pontos</span>
                        </div>
                        <div className="flex items-center gap-6">
                          <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest flex items-center gap-2">
                            <Calendar size={14} className="text-slate-600" /> Postado em {new Date(a.created_at).toLocaleDateString()}
                          </p>
                          {a.due_date && (
                            <p className="text-[10px] text-red-400 uppercase font-black tracking-widest flex items-center gap-2">
                              <Clock size={14} /> Prazo: {new Date(a.due_date).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                      <ChevronRight size={24} className="text-slate-700 group-hover:text-white transition-colors" />
                    </div>
                  </div>
                ))}

                {assignments.length === 0 && (
                  <div className="text-center py-24 bg-white/[0.01] border border-white/5 border-dashed rounded-[3rem]">
                    <ClipboardList size={64} className="mx-auto text-slate-700 mb-6" />
                    <h3 className="text-2xl font-display font-bold mb-2">Nenhuma atividade</h3>
                    <p className="text-slate-500 text-lg">Tudo em dia por aqui! Aproveite o tempo livre.</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'pessoas' && (
            <motion.div 
              key="pessoas"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-4xl mx-auto space-y-12"
            >
              <section>
                <h2 className="text-blue-500 text-xs font-black uppercase tracking-[0.3em] border-b border-blue-500/20 pb-6 mb-8">Professor</h2>
                <div className="flex items-center gap-6 p-6 bg-white/[0.02] border border-white/5 rounded-[2rem]">
                  <div className="w-16 h-16 rounded-2xl bg-blue-600/20 border border-blue-600/30 flex items-center justify-center text-blue-500 font-display font-bold text-2xl">
                    {classData?.teacher_name?.[0] || 'P'}
                  </div>
                  <div>
                    <p className="text-xl font-bold text-white">{classData?.teacher_name || 'Professor Responsável'}</p>
                    <p className="text-xs text-slate-500 uppercase tracking-widest font-black mt-1">Docente Principal</p>
                  </div>
                </div>
              </section>

              <section>
                <div className="flex items-center justify-between border-b border-white/5 pb-6 mb-8">
                  <h2 className="text-white text-xs font-black uppercase tracking-[0.3em]">Alunos Matriculados</h2>
                  <span className="text-slate-500 text-sm font-bold">{students.length} alunos</span>
                </div>
                <div className="space-y-4">
                  {students.map((s) => (
                    <div key={s.id} className="flex items-center gap-6 p-6 hover:bg-white/[0.02] rounded-[2rem] transition-all group">
                      <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-slate-400 font-bold group-hover:bg-blue-600/10 group-hover:text-blue-500 transition-all">
                        {s.name?.[0]}
                      </div>
                      <p className="text-lg font-bold text-slate-300 group-hover:text-white transition-colors">{s.name}</p>
                    </div>
                  ))}
                  {students.length === 0 && (
                    <div className="text-center py-12 bg-white/[0.01] border border-white/5 border-dashed rounded-[2rem]">
                      <p className="text-slate-600 font-medium italic">Nenhum aluno matriculado nesta turma.</p>
                    </div>
                  )}
                </div>
              </section>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Assignment Modal */}
      {showAssignmentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#020617] border border-white/10 w-full max-w-lg rounded-[3rem] p-10 shadow-2xl relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-48 h-48 bg-blue-600/5 blur-[80px] rounded-full"></div>
            <h2 className="text-3xl font-display font-bold mb-8 relative z-10">Nova Atividade</h2>
            <form onSubmit={handleCreateAssignment} className="space-y-6 relative z-10">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Título da Atividade</label>
                <input 
                  required
                  value={newAssignment.title}
                  onChange={e => setNewAssignment({...newAssignment, title: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 outline-none focus:border-blue-500/50 focus:bg-blue-500/5 transition-all font-bold"
                  placeholder="Ex: Lista de Exercícios 01"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Instruções</label>
                <textarea 
                  rows={4}
                  value={newAssignment.description}
                  onChange={e => setNewAssignment({...newAssignment, description: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 outline-none focus:border-blue-500/50 focus:bg-blue-500/5 transition-all resize-none font-medium"
                  placeholder="Descreva o que os alunos devem fazer..."
                />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Data de Entrega</label>
                  <input 
                    type="date"
                    value={newAssignment.due_date}
                    onChange={e => setNewAssignment({...newAssignment, due_date: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 outline-none focus:border-blue-500/50 focus:bg-blue-500/5 transition-all font-bold"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Pontuação</label>
                  <input 
                    type="number"
                    value={newAssignment.points}
                    onChange={e => setNewAssignment({...newAssignment, points: parseInt(e.target.value)})}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 outline-none focus:border-blue-500/50 focus:bg-blue-500/5 transition-all font-bold"
                  />
                </div>
              </div>
              <div className="flex gap-4 pt-6">
                <button type="button" onClick={() => setShowAssignmentModal(false)} className="flex-1 bg-white/5 hover:bg-white/10 py-4 rounded-2xl font-bold transition-all border border-white/5">Cancelar</button>
                <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 py-4 rounded-2xl font-bold shadow-lg shadow-blue-600/20 transition-all">Criar Atividade</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Material Modal */}
      {showMaterialModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#020617] border border-white/10 w-full max-w-lg rounded-[3rem] p-10 shadow-2xl relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-48 h-48 bg-purple-600/5 blur-[80px] rounded-full"></div>
            <h2 className="text-3xl font-display font-bold mb-8 relative z-10">Postar Material</h2>
            <form onSubmit={handleCreateMaterial} className="space-y-6 relative z-10">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Título do Material</label>
                <input 
                  required
                  value={newMaterial.title}
                  onChange={e => setNewMaterial({...newMaterial, title: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 outline-none focus:border-purple-500/50 focus:bg-purple-500/5 transition-all font-bold"
                  placeholder="Ex: Slides da Aula 01"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Mensagem/Descrição</label>
                <textarea 
                  rows={3}
                  value={newMaterial.description}
                  onChange={e => setNewMaterial({...newMaterial, description: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 outline-none focus:border-purple-500/50 focus:bg-purple-500/5 transition-all resize-none font-medium"
                  placeholder="Explique o conteúdo do material..."
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Link ou URL do Arquivo</label>
                <input 
                  value={newMaterial.file_url}
                  onChange={e => setNewMaterial({...newMaterial, file_url: e.target.value})}
                  placeholder="https://drive.google.com/..."
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 outline-none focus:border-purple-500/50 focus:bg-purple-500/5 transition-all font-bold"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Tipo de Conteúdo</label>
                <select 
                  value={newMaterial.type}
                  onChange={e => setNewMaterial({...newMaterial, type: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 outline-none focus:border-purple-500/50 focus:bg-purple-500/5 transition-all font-bold appearance-none"
                >
                  <option value="file">Arquivo</option>
                  <option value="link">Link Externo</option>
                  <option value="video">Vídeo</option>
                </select>
              </div>
              <div className="flex gap-4 pt-6">
                <button type="button" onClick={() => setShowMaterialModal(false)} className="flex-1 bg-white/5 hover:bg-white/10 py-4 rounded-2xl font-bold transition-all border border-white/5">Cancelar</button>
                <button type="submit" className="flex-1 bg-purple-600 hover:bg-purple-700 py-4 rounded-2xl font-bold shadow-lg shadow-purple-600/20 transition-all">Postar Agora</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Submit Assignment Modal (Student) */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#020617] border border-white/10 w-full max-w-lg rounded-[3rem] p-10 shadow-2xl relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-48 h-48 bg-blue-600/5 blur-[80px] rounded-full"></div>
            <h2 className="text-3xl font-display font-bold mb-2 relative z-10">{selectedAssignment?.title}</h2>
            <p className="text-slate-400 text-sm mb-8 relative z-10">{selectedAssignment?.description}</p>
            <form onSubmit={handleSubmitAssignment} className="space-y-6 relative z-10">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Sua Resposta</label>
                <textarea 
                  rows={5}
                  required
                  value={submissionData.content}
                  onChange={e => setSubmissionData({...submissionData, content: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 outline-none focus:border-blue-500/50 focus:bg-blue-500/5 transition-all resize-none font-medium"
                  placeholder="Escreva sua resposta detalhada aqui..."
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Link do Arquivo ou Repositório</label>
                <input 
                  value={submissionData.file_url}
                  onChange={e => setSubmissionData({...submissionData, file_url: e.target.value})}
                  placeholder="https://github.com/... ou link do drive"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 outline-none focus:border-blue-500/50 focus:bg-blue-500/5 transition-all font-bold"
                />
              </div>
              <div className="flex gap-4 pt-6">
                <button type="button" onClick={() => setShowSubmitModal(false)} className="flex-1 bg-white/5 hover:bg-white/10 py-4 rounded-2xl font-bold transition-all border border-white/5">Cancelar</button>
                <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 py-4 rounded-2xl font-bold shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center gap-3">
                  <Send size={20} /> Entregar Atividade
                </button>
              </div>
            </form>
          </motion.div>
            {/* Submissions List Modal (Teacher) */}
      {showSubmissionsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#020617] border border-white/10 w-full max-w-3xl rounded-[3rem] p-10 shadow-2xl max-h-[85vh] flex flex-col relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 blur-[100px] rounded-full"></div>
            <div className="flex items-center justify-between mb-10 relative z-10">
              <div>
                <h2 className="text-3xl font-display font-bold tracking-tight">Entregas Recebidas</h2>
                <p className="text-blue-500 text-[10px] font-black uppercase tracking-[0.2em] mt-1">{selectedAssignment?.title}</p>
              </div>
              <button 
                onClick={() => setShowSubmissionsModal(false)} 
                className="p-3 hover:bg-white/5 rounded-2xl transition-all text-slate-500 hover:text-white border border-transparent hover:border-white/5"
              >
                <ArrowLeft size={24} className="rotate-90" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto pr-4 space-y-6 relative z-10 custom-scrollbar">
              {submissions.map((s) => (
                <div key={s.id} className="bg-white/[0.02] border border-white/5 p-8 rounded-[2rem] hover:bg-white/[0.04] transition-all">
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-blue-600/10 flex items-center justify-center text-blue-500 font-bold text-lg">
                        {s.student_name?.[0]}
                      </div>
                      <div>
                        <p className="font-bold text-white text-lg">{s.student_name}</p>
                        <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">
                          Entregue em {new Date(s.submitted_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    {s.grade !== null ? (
                      <div className="bg-green-500/10 text-green-500 px-4 py-2 rounded-xl border border-green-500/20 font-bold text-sm flex items-center gap-2">
                        <CheckCircle2 size={14} /> Nota: {s.grade}/{selectedAssignment?.points}
                      </div>
                    ) : (
                      <div className="bg-yellow-500/10 text-yellow-500 px-4 py-2 rounded-xl border border-yellow-500/20 font-bold text-sm">
                        Pendente
                      </div>
                    )}
                  </div>
                  
                  <div className="bg-white/5 p-6 rounded-2xl mb-6">
                    <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap italic">"{s.content}"</p>
                  </div>

                  {s.file_url && (
                    <a 
                      href={s.file_url} 
                      target="_blank" 
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 font-bold text-sm mb-6 transition-colors"
                    >
                      <FileText size={16} /> Ver arquivo anexo
                    </a>
                  )}

                  <div className="flex items-center gap-4 pt-6 border-t border-white/5">
                    {selectedSubmission?.id === s.id ? (
                      <motion.form 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        onSubmit={handleGradeSubmission} 
                        className="flex-1 flex items-center gap-4"
                      >
                        <input 
                          type="number"
                          required
                          value={gradeData.grade}
                          onChange={e => setGradeData({...gradeData, grade: parseFloat(e.target.value)})}
                          className="w-24 bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 outline-none focus:border-blue-500 transition-all font-bold"
                          placeholder="Nota"
                        />
                        <input 
                          value={gradeData.feedback}
                          onChange={e => setGradeData({...gradeData, feedback: e.target.value})}
                          className="flex-1 bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 outline-none focus:border-blue-500 transition-all"
                          placeholder="Feedback (opcional)"
                        />
                        <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-bold transition-all">Salvar</button>
                        <button type="button" onClick={() => setSelectedSubmission(null)} className="text-slate-500 hover:text-white font-bold text-sm">Cancelar</button>
                      </motion.form>
                    ) : (
                      <button 
                        onClick={() => {
                          setSelectedSubmission(s);
                          setGradeData({ grade: s.grade || 0, feedback: s.feedback || '' });
                        }}
                        className="bg-white/5 hover:bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold transition-all border border-white/5 hover:border-blue-600"
                      >
                        {s.grade !== null ? 'Alterar Nota' : 'Atribuir Nota'}
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {submissions.length === 0 && (
                <div className="text-center py-20 bg-white/[0.01] border border-white/5 border-dashed rounded-[2rem]">
                  <p className="text-slate-500 font-medium">Nenhuma entrega realizada ainda.</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default ClassDetail;

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
    <div className="min-h-screen bg-[#0f172a] text-white font-sans">
      {/* Header */}
      <header className="bg-slate-900/50 border-b border-white/10 sticky top-0 z-30 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => navigate(-1)}
                className="p-2 hover:bg-white/5 rounded-full transition-colors text-slate-400 hover:text-white"
              >
                <ArrowLeft size={24} />
              </button>
              <div>
                <h1 className="text-xl font-bold tracking-tight">{classData?.name}</h1>
                <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">{classData?.subject} • {classData?.grade}</p>
              </div>
            </div>

            <nav className="hidden md:flex items-center gap-1">
              {[
                { id: 'mural', label: 'Mural', icon: BookOpen },
                { id: 'atividades', label: 'Atividades', icon: ClipboardList },
                { id: 'pessoas', label: 'Pessoas', icon: Users },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-6 py-2 rounded-full text-sm font-bold transition-all ${
                    activeTab === tab.id 
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <tab.icon size={18} />
                  {tab.label}
                </button>
              ))}
            </nav>

            <div className="flex items-center gap-3">
              {isTeacher && (
                <div className="hidden sm:flex items-center gap-2 bg-white/5 px-4 py-2 rounded-2xl border border-white/10">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Código:</span>
                  <span className="text-sm font-mono font-bold text-blue-400">{classData?.code}</span>
                </div>
              )}
              <div className="w-10 h-10 rounded-full bg-blue-500/20 border border-blue-500/50 flex items-center justify-center text-blue-500 font-bold">
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
              className="space-y-6"
            >
              {/* Class Banner */}
              <div className="relative h-48 rounded-[2.5rem] overflow-hidden group">
                <img 
                  src="https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=2070&auto=format&fit=crop" 
                  alt="Class Banner"
                  className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-700"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent"></div>
                <div className="absolute bottom-8 left-8">
                  <h2 className="text-4xl font-black tracking-tight">{classData?.name}</h2>
                  <p className="text-blue-400 font-bold uppercase tracking-[0.2em] text-sm mt-1">{classData?.subject}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Sidebar Info */}
                <div className="lg:col-span-1 space-y-6">
                  <div className="bg-slate-900/40 border border-white/10 p-6 rounded-[2rem]">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Próximas Atividades</h3>
                    <div className="space-y-4">
                      {assignments.slice(0, 3).map(a => (
                        <div key={a.id} className="flex gap-3">
                          <div className="mt-1 text-blue-500"><Clock size={16} /></div>
                          <div>
                            <p className="text-sm font-bold line-clamp-1">{a.title}</p>
                            <p className="text-[10px] text-slate-500 uppercase font-bold mt-0.5">
                              {a.due_date ? new Date(a.due_date).toLocaleDateString() : 'Sem data'}
                            </p>
                          </div>
                        </div>
                      ))}
                      {assignments.length === 0 && (
                        <p className="text-xs text-slate-500 italic">Nenhuma atividade pendente.</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Feed */}
                <div className="lg:col-span-3 space-y-6">
                  {isTeacher && (
                    <div className="bg-slate-900/40 border border-white/10 p-6 rounded-[2rem] flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-500 font-bold">
                        {profile?.name?.[0]}
                      </div>
                      <button 
                        onClick={() => setShowMaterialModal(true)}
                        className="flex-1 text-left bg-white/5 hover:bg-white/10 border border-white/5 py-3 px-6 rounded-2xl text-slate-400 text-sm transition-all"
                      >
                        Compartilhe algo com a turma...
                      </button>
                    </div>
                  )}

                  {/* Materials List */}
                  {materials.map((m) => (
                    <div key={m.id} className="bg-slate-900/40 border border-white/10 p-6 rounded-[2rem] hover:border-white/20 transition-all">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400">
                            <Users size={20} />
                          </div>
                          <div>
                            <p className="text-sm font-bold">{classData?.teacher_name}</p>
                            <p className="text-[10px] text-slate-500 uppercase font-bold">{new Date(m.created_at).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <button className="text-slate-500 hover:text-white"><MoreVertical size={20} /></button>
                      </div>
                      <p className="text-slate-300 text-sm mb-4 leading-relaxed">{m.description}</p>
                      {m.file_url && (
                        <a 
                          href={m.file_url} 
                          target="_blank" 
                          rel="noreferrer"
                          className="flex items-center gap-4 p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all group"
                        >
                          <div className="p-3 bg-blue-500/10 rounded-xl text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-all">
                            {m.type === 'video' ? <Video size={20} /> : m.type === 'link' ? <LinkIcon size={20} /> : <FileText size={20} />}
                          </div>
                          <div className="flex-1 overflow-hidden">
                            <p className="text-sm font-bold truncate">{m.title}</p>
                            <p className="text-[10px] text-slate-500 uppercase font-bold">{m.type}</p>
                          </div>
                        </a>
                      )}
                    </div>
                  ))}

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
              className="max-w-3xl mx-auto space-y-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold">Atividades do Curso</h2>
                {isTeacher && (
                  <button 
                    onClick={() => setShowAssignmentModal(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full flex items-center gap-2 font-bold transition-all text-sm"
                  >
                    <Plus size={18} /> Criar Atividade
                  </button>
                )}
              </div>

              {assignments.map((a) => (
                <div 
                  key={a.id} 
                  onClick={() => handleAssignmentClick(a)}
                  className="bg-slate-900/40 border border-white/10 p-6 rounded-[2rem] hover:bg-slate-900/60 transition-all group cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-4 bg-blue-500/10 rounded-2xl text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-all">
                      <ClipboardList size={24} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-bold">{a.title}</h3>
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{a.points} pontos</span>
                      </div>
                      <div className="flex items-center gap-4 mt-1">
                        <p className="text-[10px] text-slate-500 uppercase font-bold flex items-center gap-1">
                          <Calendar size={12} /> Postado em {new Date(a.created_at).toLocaleDateString()}
                        </p>
                        {a.due_date && (
                          <p className="text-[10px] text-red-400 uppercase font-bold flex items-center gap-1">
                            <Clock size={12} /> Entrega: {new Date(a.due_date).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {assignments.length === 0 && (
                <div className="text-center py-20 bg-slate-900/20 rounded-[2rem] border border-dashed border-white/10">
                  <ClipboardList size={64} className="mx-auto text-slate-700 mb-4" />
                  <h3 className="text-xl font-bold mb-2">Nenhuma atividade</h3>
                  <p className="text-slate-500">Tudo em dia por aqui!</p>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'pessoas' && (
            <motion.div 
              key="pessoas"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-3xl mx-auto space-y-8"
            >
              <section>
                <h2 className="text-blue-500 text-2xl font-bold border-b border-blue-500/30 pb-4 mb-6">Professor</h2>
                <div className="flex items-center gap-4 px-4">
                  <div className="w-12 h-12 rounded-full bg-blue-500/20 border border-blue-500/50 flex items-center justify-center text-blue-500 font-bold text-xl">
                    {classData?.teacher_name?.[0]}
                  </div>
                  <span className="font-bold text-lg">{classData?.teacher_name}</span>
                </div>
              </section>

              <section>
                <div className="flex items-center justify-between border-b border-blue-500/30 pb-4 mb-6">
                  <h2 className="text-blue-500 text-2xl font-bold">Colegas de Turma</h2>
                  <span className="text-slate-500 text-sm font-bold uppercase tracking-widest">{students.length} alunos</span>
                </div>
                <div className="space-y-4">
                  {students.map((s) => (
                    <div key={s.id} className="flex items-center gap-4 px-4 py-2 hover:bg-white/5 rounded-2xl transition-all group">
                      <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-500 font-bold group-hover:bg-blue-500/20 group-hover:text-blue-500 transition-all">
                        {s.name?.[0]}
                      </div>
                      <span className="font-medium text-slate-300 group-hover:text-white transition-all">{s.name}</span>
                    </div>
                  ))}
                  {students.length === 0 && (
                    <p className="text-center py-8 text-slate-500 italic">Nenhum aluno matriculado ainda.</p>
                  )}
                </div>
              </section>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Assignment Modal */}
      {showAssignmentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-900 border border-white/10 w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl">
            <h2 className="text-2xl font-bold mb-6">Nova Atividade</h2>
            <form onSubmit={handleCreateAssignment} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase ml-1">Título</label>
                <input 
                  required
                  value={newAssignment.title}
                  onChange={e => setNewAssignment({...newAssignment, title: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 outline-none focus:border-blue-500 transition-all"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase ml-1">Instruções</label>
                <textarea 
                  rows={4}
                  value={newAssignment.description}
                  onChange={e => setNewAssignment({...newAssignment, description: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 outline-none focus:border-blue-500 transition-all resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase ml-1">Data de Entrega</label>
                  <input 
                    type="date"
                    value={newAssignment.due_date}
                    onChange={e => setNewAssignment({...newAssignment, due_date: e.target.value})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 outline-none focus:border-blue-500 transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase ml-1">Pontos</label>
                  <input 
                    type="number"
                    value={newAssignment.points}
                    onChange={e => setNewAssignment({...newAssignment, points: parseInt(e.target.value)})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 outline-none focus:border-blue-500 transition-all"
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowAssignmentModal(false)} className="flex-1 bg-white/5 hover:bg-white/10 py-3 rounded-xl font-bold">Cancelar</button>
                <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 py-3 rounded-xl font-bold shadow-lg shadow-blue-600/20">Criar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Material Modal */}
      {showMaterialModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-900 border border-white/10 w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl">
            <h2 className="text-2xl font-bold mb-6">Postar no Mural</h2>
            <form onSubmit={handleCreateMaterial} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase ml-1">Título do Material</label>
                <input 
                  required
                  value={newMaterial.title}
                  onChange={e => setNewMaterial({...newMaterial, title: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 outline-none focus:border-blue-500 transition-all"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase ml-1">Mensagem</label>
                <textarea 
                  rows={3}
                  value={newMaterial.description}
                  onChange={e => setNewMaterial({...newMaterial, description: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 outline-none focus:border-blue-500 transition-all resize-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase ml-1">Link/URL do Arquivo</label>
                <input 
                  value={newMaterial.file_url}
                  onChange={e => setNewMaterial({...newMaterial, file_url: e.target.value})}
                  placeholder="https://..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 outline-none focus:border-blue-500 transition-all"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase ml-1">Tipo</label>
                <select 
                  value={newMaterial.type}
                  onChange={e => setNewMaterial({...newMaterial, type: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 outline-none focus:border-blue-500 transition-all"
                >
                  <option value="file">Arquivo</option>
                  <option value="link">Link</option>
                  <option value="video">Vídeo</option>
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowMaterialModal(false)} className="flex-1 bg-white/5 hover:bg-white/10 py-3 rounded-xl font-bold">Cancelar</button>
                <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 py-3 rounded-xl font-bold shadow-lg shadow-blue-600/20">Postar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Submit Assignment Modal (Student) */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-900 border border-white/10 w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl">
            <h2 className="text-2xl font-bold mb-2">{selectedAssignment?.title}</h2>
            <p className="text-slate-400 text-sm mb-6">{selectedAssignment?.description}</p>
            <form onSubmit={handleSubmitAssignment} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase ml-1">Sua Resposta</label>
                <textarea 
                  rows={4}
                  required
                  value={submissionData.content}
                  onChange={e => setSubmissionData({...submissionData, content: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 outline-none focus:border-blue-500 transition-all resize-none"
                  placeholder="Escreva sua resposta aqui..."
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase ml-1">Link do Arquivo (Opcional)</label>
                <input 
                  value={submissionData.file_url}
                  onChange={e => setSubmissionData({...submissionData, file_url: e.target.value})}
                  placeholder="https://..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 outline-none focus:border-blue-500 transition-all"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setShowSubmitModal(false)} className="flex-1 bg-white/5 hover:bg-white/10 py-3 rounded-xl font-bold">Cancelar</button>
                <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 py-3 rounded-xl font-bold shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2">
                  <Send size={18} /> Entregar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Submissions List Modal (Teacher) */}
      {showSubmissionsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-900 border border-white/10 w-full max-w-2xl rounded-[2.5rem] p-8 shadow-2xl max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold">Entregas: {selectedAssignment?.title}</h2>
                <p className="text-slate-500 text-sm font-bold uppercase tracking-widest">{submissions.length} entregas recebidas</p>
              </div>
              <button onClick={() => setShowSubmissionsModal(false)} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                <ArrowLeft size={24} className="rotate-90" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 space-y-4">
              {submissions.map((s) => (
                <div key={s.id} className="bg-white/5 border border-white/5 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-500 font-bold">
                        {s.student_name?.[0]}
                      </div>
                      <div>
                        <p className="font-bold">{s.student_name}</p>
                        <p className="text-[10px] text-slate-500 uppercase font-bold">Entregue em {new Date(s.submitted_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                    {s.grade !== null ? (
                      <div className="flex items-center gap-2 text-green-400 font-bold bg-green-400/10 px-3 py-1 rounded-full text-xs">
                        <CheckCircle2 size={14} /> Nota: {s.grade}
                      </div>
                    ) : (
                      <button 
                        onClick={() => {
                          setSelectedSubmission(s);
                          setGradeData({ grade: s.grade || 0, feedback: s.feedback || '' });
                        }}
                        className="text-blue-500 text-xs font-bold hover:underline"
                      >
                        Atribuir Nota
                      </button>
                    )}
                  </div>
                  <p className="text-slate-300 text-sm mb-4 bg-black/20 p-4 rounded-xl italic">"{s.content}"</p>
                  {s.file_url && (
                    <a href={s.file_url} target="_blank" rel="noreferrer" className="text-blue-400 text-xs flex items-center gap-1 hover:underline">
                      <FileText size={14} /> Ver arquivo anexo
                    </a>
                  )}

                  {selectedSubmission?.id === s.id && (
                    <motion.form 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      onSubmit={handleGradeSubmission} 
                      className="mt-6 pt-6 border-t border-white/5 space-y-4"
                    >
                      <div className="grid grid-cols-4 gap-4">
                        <div className="col-span-1 space-y-1">
                          <label className="text-[10px] font-bold text-slate-500 uppercase">Nota</label>
                          <input 
                            type="number"
                            required
                            value={gradeData.grade}
                            onChange={e => setGradeData({...gradeData, grade: parseFloat(e.target.value)})}
                            className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 outline-none focus:border-blue-500"
                          />
                        </div>
                        <div className="col-span-3 space-y-1">
                          <label className="text-[10px] font-bold text-slate-500 uppercase">Feedback</label>
                          <input 
                            value={gradeData.feedback}
                            onChange={e => setGradeData({...gradeData, feedback: e.target.value})}
                            className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 outline-none focus:border-blue-500"
                            placeholder="Bom trabalho!"
                          />
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button type="button" onClick={() => setSelectedSubmission(null)} className="flex-1 bg-white/5 py-2 rounded-xl text-xs font-bold">Cancelar</button>
                        <button type="submit" className="flex-1 bg-blue-600 py-2 rounded-xl text-xs font-bold">Salvar Nota</button>
                      </div>
                    </motion.form>
                  )}
                </div>
              ))}

              {submissions.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-slate-500 italic">Nenhuma entrega realizada ainda.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClassDetail;

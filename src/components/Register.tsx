import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from './AuthLayout';
import { User, Mail, Lock, GraduationCap, School } from 'lucide-react';

const schema = z.object({
  name: z.string().min(2, 'Nome muito curto'),
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  role: z.enum(['teacher', 'student'], {
    message: 'Selecione se você é Professor ou Aluno',
  }),
  grade: z.string().min(1, 'Selecione o ano'),
  course: z.string().min(1, 'Selecione o curso'),
});

type FormData = z.infer<typeof schema>;

const Register: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setError(null);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      const user = userCredential.user;
      
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        name: data.name,
        email: data.email,
        role: data.role,
        grade: data.grade,
        course: data.course,
        createdAt: serverTimestamp(),
      });
      
      navigate('/dashboard');
    } catch (err: any) {
      if (err.code === 'auth/operation-not-allowed') {
        setError('O provedor de E-mail/Senha não está ativado no Firebase Console. Por favor, ative-o em Authentication > Sign-in method.');
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Criar Conta" subtitle="Junte-se à nossa comunidade educacional">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded-xl text-sm whitespace-pre-line">
            {error}
          </div>
        )}

        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider ml-1">Nome Completo</label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input
              {...register('name')}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
              placeholder="Seu nome"
            />
          </div>
          {errors.name && <p className="text-red-500 text-xs mt-1 ml-1">{errors.name.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider ml-1">Ano</label>
            <select
              {...register('grade')}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all appearance-none"
            >
              <option value="" className="bg-slate-900">Selecione</option>
              <option value="1º Ano" className="bg-slate-900">1º Ano</option>
              <option value="2º Ano" className="bg-slate-900">2º Ano</option>
              <option value="3º Ano" className="bg-slate-900">3º Ano</option>
            </select>
            {errors.grade && <p className="text-red-500 text-xs mt-1 ml-1">{errors.grade.message}</p>}
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider ml-1">Curso</label>
            <select
              {...register('course')}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white placeholder-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all appearance-none"
            >
              <option value="" className="bg-slate-900">Selecione</option>
              <option value="Informática" className="bg-slate-900">Informática</option>
              <option value="Administração" className="bg-slate-900">Administração</option>
              <option value="Análises Clínicas" className="bg-slate-900">Análises Clínicas</option>
              <option value="Jurídico" className="bg-slate-900">Jurídico</option>
              <option value="Agropecuária" className="bg-slate-900">Agropecuária</option>
              <option value="Nutrição" className="bg-slate-900">Nutrição</option>
            </select>
            {errors.course && <p className="text-red-500 text-xs mt-1 ml-1">{errors.course.message}</p>}
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider ml-1">E-mail</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input
              {...register('email')}
              type="email"
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
              placeholder="exemplo@email.com"
            />
          </div>
          {errors.email && <p className="text-red-500 text-xs mt-1 ml-1">{errors.email.message}</p>}
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider ml-1">Senha</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
            <input
              {...register('password')}
              type="password"
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white placeholder-slate-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
              placeholder="••••••••"
            />
          </div>
          {errors.password && <p className="text-red-500 text-xs mt-1 ml-1">{errors.password.message}</p>}
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider ml-1">Eu sou...</label>
          <div className="grid grid-cols-2 gap-3">
            <label className="relative cursor-pointer group">
              <input
                {...register('role')}
                type="radio"
                value="student"
                className="peer sr-only"
              />
              <div className="flex flex-col items-center gap-2 p-3 rounded-xl border border-white/10 bg-white/5 peer-checked:border-blue-500 peer-checked:bg-blue-500/10 transition-all group-hover:bg-white/10">
                <GraduationCap className="text-slate-400 peer-checked:text-blue-500" size={24} />
                <span className="text-sm text-slate-300">Aluno</span>
              </div>
            </label>
            <label className="relative cursor-pointer group">
              <input
                {...register('role')}
                type="radio"
                value="teacher"
                className="peer sr-only"
              />
              <div className="flex flex-col items-center gap-2 p-3 rounded-xl border border-white/10 bg-white/5 peer-checked:border-blue-500 peer-checked:bg-blue-500/10 transition-all group-hover:bg-white/10">
                <School className="text-slate-400 peer-checked:text-blue-500" size={24} />
                <span className="text-sm text-slate-300">Professor</span>
              </div>
            </label>
          </div>
          {errors.role && <p className="text-red-500 text-xs mt-1 ml-1">{errors.role.message}</p>}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-blue-600/20 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
        >
          {loading ? 'Criando conta...' : 'Cadastrar'}
        </button>

        <p className="text-center text-slate-400 text-sm mt-6">
          Já tem uma conta?{' '}
          <Link to="/login" className="text-blue-500 hover:underline font-semibold">
            Entrar
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
};

export default Register;

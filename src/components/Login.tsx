import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import AuthLayout from './AuthLayout';
import { Mail, Lock } from 'lucide-react';
import { api } from '../lib/api';

const schema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(1, 'Senha é obrigatória'),
});

type FormData = z.infer<typeof schema>;

const Login: React.FC = () => {
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
      const user = await api.login(data);
      if (user.role === 'teacher') {
        navigate('/professor');
      } else {
        navigate('/aluno');
      }
    } catch (err: any) {
      setError(err.message || 'E-mail ou senha incorretos');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Bem-vindo" subtitle="Acesse sua conta para continuar">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-500 p-3 rounded-xl text-sm whitespace-pre-line">
            {error}
          </div>
        )}

        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">E-mail Corporativo</label>
          <div className="relative group">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={18} />
            <input
              {...register('email')}
              type="email"
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-slate-600 focus:border-blue-500/50 focus:bg-blue-500/5 outline-none transition-all"
              placeholder="seu@email.com"
            />
          </div>
          {errors.email && <p className="text-red-400 text-xs mt-1 ml-1 font-medium">{errors.email.message}</p>}
        </div>

        <div className="space-y-1">
          <div className="flex justify-between items-center ml-1">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Senha de Acesso</label>
            <Link to="/forgot-password" size={18} className="text-xs text-blue-500 hover:text-blue-400 transition-colors font-bold">
              Esqueceu?
            </Link>
          </div>
          <div className="relative group">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={18} />
            <input
              {...register('password')}
              type="password"
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-slate-600 focus:border-blue-500/50 focus:bg-blue-500/5 outline-none transition-all"
              placeholder="••••••••"
            />
          </div>
          {errors.password && <p className="text-red-400 text-xs mt-1 ml-1 font-medium">{errors.password.message}</p>}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl transition-all shadow-xl shadow-blue-600/20 disabled:opacity-50 disabled:cursor-not-allowed mt-4 active:scale-[0.98]"
        >
          {loading ? (
            <div className="flex items-center justify-center gap-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              <span>Autenticando...</span>
            </div>
          ) : 'Entrar no Portal'}
        </button>

        <p className="text-center text-slate-400 text-sm mt-6">
          Não tem uma conta?{' '}
          <Link to="/register" className="text-blue-500 hover:underline font-semibold">
            Cadastre-se
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
};

export default Login;

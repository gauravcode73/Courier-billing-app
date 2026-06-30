import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Package, Lock, User, AlertCircle, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormInput = z.infer<typeof loginSchema>;

export const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormInput) => {
    setIsSubmitting(true);
    const toastId = toast.loading('Authenticating admin...');
    try {
      await login(data.username, data.password);
      toast.success('Access granted. Welcome to AmodXpress Console.', { id: toastId });
      navigate('/');
    } catch (err: any) {
      toast.error(err.message || 'Authentication failed. Please verify credentials.', { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4 py-12 relative overflow-hidden font-sans">
      {/* Background gradients for premium feel */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-primary-900/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-primary-800/10 blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-md"
      >
        {/* Branding block */}
        <div className="text-center mb-8 flex flex-col items-center">
          <div className="bg-primary-600 text-white p-3.5 rounded-2xl shadow-xl shadow-primary-500/20 mb-3.5">
            <Package size={32} className="animate-pulse" />
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">AMODXPRESS</h2>
          <p className="text-slate-400 text-xs mt-1">Courier Billing & Consignment Management Console</p>
        </div>

        {/* Card containing credentials entry */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl shadow-2xl backdrop-blur-xl p-8">
          <h3 className="text-lg font-bold text-slate-100 mb-6 text-center">Administrator Sign In</h3>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Username
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500 pointer-events-none">
                  <User size={16} />
                </span>
                <input
                  type="text"
                  placeholder="Enter administrator username"
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl pl-10 pr-3.5 py-3 text-sm focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 placeholder-slate-600 transition-colors"
                  {...register('username')}
                  disabled={isSubmitting}
                />
              </div>
              {errors.username && (
                <p className="text-xs text-red-500 flex items-center gap-1 mt-1.5 font-medium">
                  <AlertCircle size={12} />
                  {errors.username.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500 pointer-events-none">
                  <Lock size={16} />
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 rounded-xl pl-10 pr-10 py-3 text-sm focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 placeholder-slate-600 transition-colors"
                  {...register('password')}
                  disabled={isSubmitting}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300 focus:outline-none"
                  disabled={isSubmitting}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-red-500 flex items-center gap-1 mt-1.5 font-medium">
                  <AlertCircle size={12} />
                  {errors.password.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary w-full py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 mt-2 shadow-primary-500/10 hover:shadow-primary-500/20"
            >
              {isSubmitting ? 'Verifying Sessions...' : 'Access Dashboard'}
            </button>
          </form>
        </div>

        {/* Footer info banner */}
        <div className="text-center mt-8">
          <p className="text-slate-500 text-[10px]">
            &copy; 2026 AmodXpress. All rights reserved. Deployed for Delhi Kashmiri Gate Terminal.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

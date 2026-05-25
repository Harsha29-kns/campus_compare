import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { LogIn, ArrowRight } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await axios.post('/api/auth/login', { email, password });
      login(res.data.token, res.data.user);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed');
    }
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      const res = await axios.post('/api/auth/google', { credential: credentialResponse.credential });
      login(res.data.token, res.data.user);
      navigate('/dashboard');
    } catch (err: any) {
      setError('Google authentication failed');
    }
  };

  const handleGoogleError = () => {
    setError('Google authentication failed');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center relative animate-in fade-in duration-700">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg h-[500px] bg-indigo-500/20 dark:bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none -z-10"></div>
      
      <div className="w-full max-w-md bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl p-10 rounded-[2rem] border border-slate-200/50 dark:border-slate-800/50 shadow-2xl shadow-indigo-500/10 dark:shadow-none">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-indigo-500/30 transform -rotate-6">
            <LogIn className="w-8 h-8 text-white rotate-6" />
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Welcome Back</h2>
          <p className="text-slate-500 mt-2 font-medium">Log in to manage your saved colleges</p>
        </div>
        
        {error && <div className="bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 text-red-600 dark:text-red-400 p-3 rounded-xl mb-6 text-sm text-center font-medium animate-in fade-in slide-in-from-top-2">{error}</div>}

        <div className="flex justify-center mb-6">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            useOneTap
            shape="rectangular"
            theme="outline"
            text="continue_with"
            size="large"
          />
        </div>

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200 dark:border-slate-800"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white/80 dark:bg-slate-900/80 text-slate-400 font-medium">Or continue with email</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Email Address</label>
            <input 
              type="email" 
              required 
              placeholder="you@example.com"
              className="w-full px-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">Password</label>
            <input 
              type="password" 
              required 
              placeholder="••••••••"
              className="w-full px-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>
          <button type="submit" className="w-full group flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-4 rounded-xl transition-all shadow-xl shadow-indigo-600/20 hover:shadow-indigo-600/40 hover:-translate-y-0.5 mt-2">
            Sign In <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </form>
        
        <p className="mt-8 text-center text-slate-500 font-medium">
          Don't have an account? <Link to="/register" className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors">Register</Link>
        </p>
      </div>
    </div>
  );
}

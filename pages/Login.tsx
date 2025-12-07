import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Hexagon, Lock, Mail, ArrowRight, User as UserIcon, Loader2 } from 'lucide-react';
import { Role } from '../types';

const Login: React.FC = () => {
  const { login, signup } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>('user');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
        let success = false;
        if (isSignUp) {
            success = await signup(name, email, role);
            if (!success) setError("User with this email already exists.");
        } else {
            success = await login(email, role);
            if (!success) setError("Invalid credentials or user not found.");
        }
    } catch (err) {
        setError("An unexpected error occurred.");
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col">
        <div className="p-8 bg-slate-900 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full opacity-10">
                <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-500 rounded-full blur-3xl -mr-20 -mt-20"></div>
                <div className="absolute bottom-0 left-0 w-40 h-40 bg-teal-500 rounded-full blur-3xl -ml-20 -mb-20"></div>
            </div>
            <div className="relative z-10 flex flex-col items-center">
                <Hexagon className="text-indigo-500 fill-indigo-500 mb-4" size={48} />
                <h1 className="text-2xl font-bold text-white">{isSignUp ? 'Create Account' : 'Welcome Back'}</h1>
                <p className="text-slate-400 mt-2">{isSignUp ? 'Start managing your projects today' : 'Sign in to your Nexus Dashboard'}</p>
            </div>
        </div>

        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
                    {error}
                </div>
            )}

            {isSignUp && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                  <div className="relative">
                    <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                      placeholder="John Doe"
                      required={isSignUp}
                    />
                  </div>
                </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  placeholder="name@company.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {isSignUp && (
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
                    <label className="block text-sm font-medium text-slate-700 mb-3">I am a:</label>
                    <div className="flex gap-4">
                        <label className={`flex-1 cursor-pointer border rounded-lg p-3 text-center transition-all ${role === 'user' ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-slate-200 hover:border-slate-300'}`}>
                            <input type="radio" name="role" className="hidden" checked={role === 'user'} onChange={() => setRole('user')} />
                            <span className="text-sm font-semibold">Client</span>
                        </label>
                        <label className={`flex-1 cursor-pointer border rounded-lg p-3 text-center transition-all ${role === 'admin' ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-slate-200 hover:border-slate-300'}`}>
                            <input type="radio" name="role" className="hidden" checked={role === 'admin'} onChange={() => setRole('admin')} />
                            <span className="text-sm font-semibold">Admin</span>
                        </label>
                    </div>
                </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2 group disabled:opacity-70"
            >
              {isLoading ? (
                  <Loader2 className="animate-spin" size={20} />
              ) : (
                  <>
                      <span>{isSignUp ? 'Create Account' : 'Sign In'}</span>
                      <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
             <p className="text-sm text-slate-500">
                {isSignUp ? "Already have an account?" : "Don't have an account?"}
                <button 
                    onClick={() => {
                        setIsSignUp(!isSignUp);
                        setError('');
                    }} 
                    className="ml-2 text-indigo-600 font-semibold hover:underline"
                >
                    {isSignUp ? "Sign In" : "Sign Up"}
                </button>
             </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
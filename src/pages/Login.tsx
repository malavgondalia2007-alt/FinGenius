import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Mail, Lock, Sparkles } from 'lucide-react';
export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
      const from = (location.state as any)?.from?.pathname || '/dashboard';
      navigate(from, {
        replace: true
      });
    } catch (err: any) {
      setError(err.message);
    }
  };
  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 gradient-bg-animated opacity-95"></div>

      {/* Decorative Elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-royal-600/10 rounded-full blur-3xl animate-pulse"></div>
      <div
        className="absolute bottom-20 right-10 w-96 h-96 bg-midnight-600/10 rounded-full blur-3xl animate-pulse"
        style={{
          animationDelay: '1s'
        }}>
      </div>

      <div className="relative min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md animate-fade-in">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-royal-600 to-midnight-600 rounded-2xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity"></div>
              <div className="relative w-16 h-16 bg-gradient-to-br from-royal-600 to-midnight-600 rounded-2xl flex items-center justify-center text-white font-bold text-3xl shadow-royal">
                F
              </div>
            </div>
          </div>

          <h2 className="text-center text-4xl font-bold text-white mb-2">
            Welcome Back
          </h2>
          <p className="text-center text-lg text-white/80 mb-2">
            Sign in to continue your financial journey
          </p>
          <div className="flex items-center justify-center gap-2 text-white/60">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm">AI-Powered Financial Intelligence</span>
          </div>
        </div>

        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-md animate-fade-in-delay-1">
          <div className="glass rounded-3xl shadow-large px-8 py-10 border border-white/20">
            <form className="space-y-6" onSubmit={handleSubmit}>
              <Input
                label="Email address"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                icon={<Mail className="w-5 h-5" />}
                placeholder="your@email.com" />


              <Input
                label="Password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                icon={<Lock className="w-5 h-5" />}
                placeholder="••••••••" />


              {error &&
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg animate-fade-in">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              }

              <Button type="submit" variant="royal" fullWidth size="lg">
                Sign in
              </Button>
            </form>

            <div className="mt-8">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-300/50" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white/50 backdrop-blur-sm text-slate-600 font-medium rounded-full">
                    Demo Credentials
                  </span>
                </div>
              </div>

              <div className="mt-6 bg-gradient-to-br from-royal-50 to-midnight-50 rounded-xl p-4 border border-royal-200/50">
                <div className="text-center space-y-1">
                  <p className="text-sm font-semibold text-slate-700">
                    Quick Access
                  </p>
                  <p className="text-sm text-slate-600">📧 haed@example.com</p>
                  <p className="text-sm text-slate-600">🔑 password123</p>
                </div>
              </div>
            </div>

            <p className="mt-8 text-center text-sm text-slate-600">
              Don't have an account?{' '}
              <Link
                to="/signup"
                className="font-semibold text-royal-600 hover:text-royal-700 transition-colors">

                Create one now
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>);

}
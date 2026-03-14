import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Mail, Lock, Sparkles } from 'lucide-react';
// CSS for automatic color changing animation and swinging effect
const colorChangeStyles = `
  @keyframes colorCycle {
    0%, 100% { 
      --glow-color: rgba(255, 111, 97, 0.4);
      --bg-color: #FF6F61;
    }
    20% { 
      --glow-color: rgba(139, 195, 148, 0.4);
      --bg-color: #8BC394;
    }
    40% { 
      --glow-color: rgba(99, 102, 241, 0.4);
      --bg-color: #6366F1;
    }
    60% { 
      --glow-color: rgba(168, 85, 247, 0.4);
      --bg-color: #A855F7;
    }
    80% { 
      --glow-color: rgba(20, 184, 166, 0.4);
      --bg-color: #14B8A6;
    }
  }

  @keyframes bgColorCycle {
    0%, 100% { background-color: #fef2f2; }
    20% { background-color: #f0fdf4; }
    40% { background-color: #eef2ff; }
    60% { background-color: #faf5ff; }
    80% { background-color: #f0fdfa; }
  }

  @keyframes orbColorCycle1 {
    0%, 100% { background-color: rgba(255, 111, 97, 0.35); }
    25% { background-color: rgba(168, 85, 247, 0.35); }
    50% { background-color: rgba(99, 102, 241, 0.35); }
    75% { background-color: rgba(20, 184, 166, 0.35); }
  }

  @keyframes orbColorCycle2 {
    0%, 100% { background-color: rgba(139, 195, 148, 0.35); }
    25% { background-color: rgba(20, 184, 166, 0.35); }
    50% { background-color: rgba(168, 85, 247, 0.35); }
    75% { background-color: rgba(255, 111, 97, 0.35); }
  }

  @keyframes glowPulse {
    0%, 100% { 
      box-shadow: 0 0 40px var(--glow-color), 0 0 80px var(--glow-color);
      opacity: 0.8;
    }
    50% { 
      box-shadow: 0 0 60px var(--glow-color), 0 0 120px var(--glow-color);
      opacity: 1;
    }
  }

  @keyframes sparkleColor {
    0%, 100% { color: #FF6F61; }
    20% { color: #8BC394; }
    40% { color: #6366F1; }
    60% { color: #A855F7; }
    80% { color: #14B8A6; }
  }

  @keyframes swing {
    0%, 100% { 
      transform: rotate(-3deg) translateY(0);
    }
    25% { 
      transform: rotate(3deg) translateY(-8px);
    }
    50% { 
      transform: rotate(-2deg) translateY(0);
    }
    75% { 
      transform: rotate(2deg) translateY(-5px);
    }
  }

  @keyframes gentleFloat {
    0%, 100% { 
      transform: translateY(0) rotate(0deg);
    }
    33% { 
      transform: translateY(-12px) rotate(1.5deg);
    }
    66% { 
      transform: translateY(-6px) rotate(-1.5deg);
    }
  }

  @keyframes borderColorCycle {
    0%, 100% { border-color: rgba(255, 111, 97, 0.5); }
    20% { border-color: rgba(139, 195, 148, 0.5); }
    40% { border-color: rgba(99, 102, 241, 0.5); }
    60% { border-color: rgba(168, 85, 247, 0.5); }
    80% { border-color: rgba(20, 184, 166, 0.5); }
  }

  @keyframes shadowColorCycle {
    0%, 100% { 
      box-shadow: 0 25px 60px -12px rgba(255, 111, 97, 0.4),
                  0 0 0 2px rgba(255, 111, 97, 0.2);
    }
    20% { 
      box-shadow: 0 25px 60px -12px rgba(139, 195, 148, 0.4),
                  0 0 0 2px rgba(139, 195, 148, 0.2);
    }
    40% { 
      box-shadow: 0 25px 60px -12px rgba(99, 102, 241, 0.4),
                  0 0 0 2px rgba(99, 102, 241, 0.2);
    }
    60% { 
      box-shadow: 0 25px 60px -12px rgba(168, 85, 247, 0.4),
                  0 0 0 2px rgba(168, 85, 247, 0.2);
    }
    80% { 
      box-shadow: 0 25px 60px -12px rgba(20, 184, 166, 0.4),
                  0 0 0 2px rgba(20, 184, 166, 0.2);
    }
  }

  .color-cycle-bg {
    animation: bgColorCycle 8s ease-in-out infinite;
  }

  .color-cycle-logo {
    animation: colorCycle 8s ease-in-out infinite;
  }

  .color-cycle-glow {
    animation: colorCycle 8s ease-in-out infinite, glowPulse 3s ease-in-out infinite;
    background: var(--bg-color);
  }

  .color-cycle-orb1 {
    animation: orbColorCycle1 8s ease-in-out infinite;
  }

  .color-cycle-orb2 {
    animation: orbColorCycle2 10s ease-in-out infinite;
  }

  .color-cycle-sparkle {
    animation: sparkleColor 8s ease-in-out infinite;
  }

  .swing-card {
    animation: swing 5s ease-in-out infinite, 
               borderColorCycle 8s ease-in-out infinite,
               shadowColorCycle 8s ease-in-out infinite;
    transform-origin: top center;
    transition: transform 0.3s ease-out;
  }

  .swing-card-paused {
    animation: borderColorCycle 8s ease-in-out infinite,
               shadowColorCycle 8s ease-in-out infinite;
    transform: rotate(0deg) translateY(0);
    transform-origin: top center;
    transition: transform 0.3s ease-out;
  }

  .float-header {
    animation: gentleFloat 5s ease-in-out infinite;
  }

  .float-header-paused {
    animation: none;
    transform: translateY(0) rotate(0deg);
    transition: transform 0.3s ease-out;
  }
`;
export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isFormFocused, setIsFormFocused] = useState(false);
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
  const handleFormFocus = () => {
    setIsFormFocused(true);
  };
  const handleFormBlur = (e: React.FocusEvent) => {
    // Only set to false if focus is leaving the form entirely
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsFormFocused(false);
    }
  };
  return (
    <div className="min-h-screen relative overflow-hidden color-cycle-bg">
      {/* Inject color change styles */}
      <style
        dangerouslySetInnerHTML={{
          __html: colorChangeStyles
        }} />


      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 opacity-20">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #1a1a2e 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }} />

      </div>

      {/* Decorative Gradient Orbs with color cycling */}
      <div className="absolute top-10 left-5 w-80 h-80 rounded-full blur-3xl color-cycle-orb1" />
      <div className="absolute bottom-10 right-5 w-96 h-96 rounded-full blur-3xl color-cycle-orb2" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-3xl color-cycle-orb1 opacity-30" />

      <div className="relative min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        {/* Header with floating animation - pauses when form is focused */}
        <div
          className={`sm:mx-auto sm:w-full sm:max-w-md ${isFormFocused ? 'float-header-paused' : 'float-header'}`}>

          {/* Logo with color cycling glow */}
          <div className="flex justify-center mb-6">
            <div className="relative group color-cycle-logo">
              <div className="absolute -inset-3 rounded-2xl blur-xl color-cycle-glow" />
              <div className="relative w-16 h-16 bg-charcoal rounded-2xl flex items-center justify-center text-white font-serif text-3xl shadow-warm-lg transition-transform duration-300 group-hover:scale-110">
                F
              </div>
            </div>
          </div>

          <h2 className="text-center text-4xl font-serif text-charcoal mb-2">
            Welcome Back
          </h2>
          <p className="text-center text-lg text-charcoal-600 mb-2">
            Sign in to continue your financial journey
          </p>
          <div className="flex items-center justify-center gap-2 text-charcoal-500">
            <Sparkles className="w-5 h-5 color-cycle-sparkle" />
            <span className="text-sm font-medium">
              AI-Powered Financial Intelligence
            </span>
          </div>
        </div>

        {/* Login Card - swing stops when form is focused */}
        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-md">
          <div
            className={`bg-white/95 backdrop-blur-sm rounded-2xl px-8 py-10 border-2 ${isFormFocused ? 'swing-card-paused' : 'swing-card'}`}
            onFocus={handleFormFocus}
            onBlur={handleFormBlur}>

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
              <div className="bg-red-50 border-l-4 border-coral p-4 rounded-lg animate-fade-in">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              }

              <Button type="submit" variant="primary" fullWidth size="lg">
                Sign in
              </Button>
            </form>

            <div className="mt-8">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-charcoal-500 font-medium">
                    Demo Credentials
                  </span>
                </div>
              </div>

              <div className="mt-6 bg-gray-50 rounded-xl p-4 border border-gray-100">
                <div className="text-center space-y-1">
                  <p className="text-sm font-semibold text-charcoal">
                    Quick Access
                  </p>
                  <p className="text-sm text-charcoal-600">
                    📧 haed@example.com
                  </p>
                  <p className="text-sm text-charcoal-600">🔑 P@ssword123</p>
                </div>
              </div>
            </div>

            <p className="mt-8 text-center text-sm text-charcoal-500">
              Don't have an account?{' '}
              <Link
                to="/signup"
                className="font-semibold text-coral hover:text-coral-600 transition-colors">

                Create one now
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>);

}
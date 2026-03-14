import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../../contexts/AdminAuthContext';
import {
  Shield,
  Lock,
  AlertCircle,
  Mail,
  Sparkles,
  Check,
  X } from
'lucide-react';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import {
  validateAdminPassword,
  PasswordValidation } from
'../../utils/validation';
// CSS for automatic color changing animation and swinging effect
const colorChangeStyles = `
  @keyframes colorCycle {
    0%, 100% { 
      --glow-color: rgba(168, 85, 247, 0.4);
      --bg-color: #A855F7;
    }
    25% { 
      --glow-color: rgba(99, 102, 241, 0.4);
      --bg-color: #6366F1;
    }
    50% { 
      --glow-color: rgba(139, 195, 148, 0.4);
      --bg-color: #8BC394;
    }
    75% { 
      --glow-color: rgba(20, 184, 166, 0.4);
      --bg-color: #14B8A6;
    }
  }

  @keyframes bgColorCycle {
    0%, 100% { background-color: #faf5ff; }
    25% { background-color: #eef2ff; }
    50% { background-color: #f0fdf4; }
    75% { background-color: #f0fdfa; }
  }

  @keyframes orbColorCycle1 {
    0%, 100% { background-color: rgba(168, 85, 247, 0.35); }
    25% { background-color: rgba(99, 102, 241, 0.35); }
    50% { background-color: rgba(139, 195, 148, 0.35); }
    75% { background-color: rgba(20, 184, 166, 0.35); }
  }

  @keyframes orbColorCycle2 {
    0%, 100% { background-color: rgba(99, 102, 241, 0.35); }
    25% { background-color: rgba(20, 184, 166, 0.35); }
    50% { background-color: rgba(168, 85, 247, 0.35); }
    75% { background-color: rgba(139, 195, 148, 0.35); }
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
    0%, 100% { color: #A855F7; }
    25% { color: #6366F1; }
    50% { color: #8BC394; }
    75% { color: #14B8A6; }
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
    0%, 100% { border-color: rgba(168, 85, 247, 0.5); }
    25% { border-color: rgba(99, 102, 241, 0.5); }
    50% { border-color: rgba(139, 195, 148, 0.5); }
    75% { border-color: rgba(20, 184, 166, 0.5); }
  }

  @keyframes shadowColorCycle {
    0%, 100% { 
      box-shadow: 0 25px 60px -12px rgba(168, 85, 247, 0.4),
                  0 0 0 2px rgba(168, 85, 247, 0.2);
    }
    25% { 
      box-shadow: 0 25px 60px -12px rgba(99, 102, 241, 0.4),
                  0 0 0 2px rgba(99, 102, 241, 0.2);
    }
    50% { 
      box-shadow: 0 25px 60px -12px rgba(139, 195, 148, 0.4),
                  0 0 0 2px rgba(139, 195, 148, 0.2);
    }
    75% { 
      box-shadow: 0 25px 60px -12px rgba(20, 184, 166, 0.4),
                  0 0 0 2px rgba(20, 184, 166, 0.2);
    }
  }

  .admin-color-cycle-bg {
    animation: bgColorCycle 8s ease-in-out infinite;
  }

  .admin-color-cycle-logo {
    animation: colorCycle 8s ease-in-out infinite;
  }

  .admin-color-cycle-glow {
    animation: colorCycle 8s ease-in-out infinite, glowPulse 3s ease-in-out infinite;
    background: var(--bg-color);
  }

  .admin-color-cycle-orb1 {
    animation: orbColorCycle1 8s ease-in-out infinite;
  }

  .admin-color-cycle-orb2 {
    animation: orbColorCycle2 10s ease-in-out infinite;
  }

  .admin-color-cycle-sparkle {
    animation: sparkleColor 8s ease-in-out infinite;
  }

  .admin-swing-card {
    animation: swing 5s ease-in-out infinite, 
               borderColorCycle 8s ease-in-out infinite,
               shadowColorCycle 8s ease-in-out infinite;
    transform-origin: top center;
    transition: transform 0.3s ease-out;
  }

  .admin-swing-card-paused {
    animation: borderColorCycle 8s ease-in-out infinite,
               shadowColorCycle 8s ease-in-out infinite;
    transform: rotate(0deg) translateY(0);
    transform-origin: top center;
    transition: transform 0.3s ease-out;
  }

  .admin-float-header {
    animation: gentleFloat 5s ease-in-out infinite;
  }

  .admin-float-header-paused {
    animation: none;
    transform: translateY(0) rotate(0deg);
    transition: transform 0.3s ease-out;
  }
`;
export function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFormFocused, setIsFormFocused] = useState(false);
  const [passwordValidation, setPasswordValidation] =
  useState<PasswordValidation>({
    isValid: false,
    hasMinLength: false,
    hasMaxLength: true,
    hasUppercase: false,
    hasSpecialChar: false
  });
  const { adminLogin } = useAdminAuth();
  const navigate = useNavigate();
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    setPasswordValidation(validateAdminPassword(newPassword));
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    // Validate password before submission
    if (!passwordValidation.isValid) {
      setError('Please ensure your password meets all requirements.');
      return;
    }
    setIsSubmitting(true);
    try {
      const success = await adminLogin(email, password);
      if (success) {
        navigate('/admin');
      } else {
        setError(
          'Invalid admin credentials. Please check your email and password.'
        );
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleFormFocus = () => {
    setIsFormFocused(true);
  };
  const handleFormBlur = (e: React.FocusEvent) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsFormFocused(false);
    }
  };
  return (
    <div className="min-h-screen relative overflow-hidden admin-color-cycle-bg">
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
      <div className="absolute top-10 left-5 w-80 h-80 rounded-full blur-3xl admin-color-cycle-orb1" />
      <div className="absolute bottom-10 right-5 w-96 h-96 rounded-full blur-3xl admin-color-cycle-orb2" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-3xl admin-color-cycle-orb1 opacity-30" />

      <div className="relative min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        {/* Header with floating animation */}
        <div
          className={`sm:mx-auto sm:w-full sm:max-w-md ${isFormFocused ? 'admin-float-header-paused' : 'admin-float-header'}`}>

          {/* Logo with color cycling glow */}
          <div className="flex justify-center mb-6">
            <div className="relative group admin-color-cycle-logo">
              <div className="absolute -inset-3 rounded-2xl blur-xl admin-color-cycle-glow" />
              <div className="relative w-16 h-16 bg-gradient-to-br from-purple-600 to-purple-700 rounded-2xl flex items-center justify-center shadow-2xl transition-transform duration-300 group-hover:scale-110">
                <Shield className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>

          <h2 className="text-center text-4xl font-serif text-charcoal mb-2">
            Admin Portal
          </h2>
          <p className="text-center text-lg text-charcoal-600 mb-2">
            Secure access to the control center
          </p>
          <div className="flex items-center justify-center gap-2 text-charcoal-500">
            <Sparkles className="w-5 h-5 admin-color-cycle-sparkle" />
            <span className="text-sm font-medium">
              FinGenius Administration
            </span>
          </div>
        </div>

        {/* Login Card */}
        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-md">
          <div
            className={`bg-white/95 backdrop-blur-sm rounded-2xl px-8 py-10 border-2 ${isFormFocused ? 'admin-swing-card-paused' : 'admin-swing-card'}`}
            onFocus={handleFormFocus}
            onBlur={handleFormBlur}>

            <form className="space-y-6" onSubmit={handleSubmit}>
              <Input
                label="Admin Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@fingenius.com"
                icon={<Mail className="w-5 h-5" />}
                required
                autoFocus />


              <div className="space-y-3">
                <Input
                  label="Password"
                  type="password"
                  value={password}
                  onChange={handlePasswordChange}
                  placeholder="Enter admin password"
                  icon={<Lock className="w-5 h-5" />}
                  required
                  className={
                  password.length > 0 && !passwordValidation.isValid ?
                  'border-red-400 focus:border-red-500 focus:ring-red-200' :
                  ''
                  } />


                {/* Password Requirements Checklist - Always show when typing */}
                {password.length > 0 &&
                <div
                  className={`p-3 rounded-xl border space-y-2 ${passwordValidation.isValid ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'}`}>

                    <p
                    className={`text-xs font-semibold uppercase tracking-wider ${passwordValidation.isValid ? 'text-emerald-600' : 'text-red-600'}`}>

                      {passwordValidation.isValid ?
                    '✓ Password Valid' :
                    '✗ Password Requirements Not Met'}
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      <div
                      className={`flex items-center gap-2 text-sm ${passwordValidation.hasMinLength ? 'text-emerald-600' : 'text-red-500'}`}>

                        {passwordValidation.hasMinLength ?
                      <Check className="w-4 h-4" /> :

                      <X className="w-4 h-4" />
                      }
                        <span>Min 8 characters</span>
                      </div>
                      <div
                      className={`flex items-center gap-2 text-sm ${passwordValidation.hasMaxLength ? 'text-emerald-600' : 'text-red-500'}`}>

                        {passwordValidation.hasMaxLength ?
                      <Check className="w-4 h-4" /> :

                      <X className="w-4 h-4" />
                      }
                        <span>Max 16 characters</span>
                      </div>
                      <div
                      className={`flex items-center gap-2 text-sm ${passwordValidation.hasUppercase ? 'text-emerald-600' : 'text-red-500'}`}>

                        {passwordValidation.hasUppercase ?
                      <Check className="w-4 h-4" /> :

                      <X className="w-4 h-4" />
                      }
                        <span>1 uppercase letter</span>
                      </div>
                      <div
                      className={`flex items-center gap-2 text-sm ${passwordValidation.hasSpecialChar ? 'text-emerald-600' : 'text-red-500'}`}>

                        {passwordValidation.hasSpecialChar ?
                      <Check className="w-4 h-4" /> :

                      <X className="w-4 h-4" />
                      }
                        <span>1 special character</span>
                      </div>
                    </div>
                  </div>
                }
              </div>

              {error &&
              <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm animate-fade-in">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <p>{error}</p>
                </div>
              }

              <Button
                type="submit"
                variant="primary"
                fullWidth
                disabled={isSubmitting || !passwordValidation.isValid}
                className="bg-purple-600 hover:bg-purple-700 shadow-lg shadow-purple-600/30 hover:shadow-xl hover:shadow-purple-600/40 disabled:opacity-50 disabled:cursor-not-allowed">

                {isSubmitting ? 'Authenticating...' : 'Access Admin Panel'}
              </Button>
            </form>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-charcoal-500 text-sm mt-6">
          Internal use only • Authorized personnel
        </p>
      </div>
    </div>);

}
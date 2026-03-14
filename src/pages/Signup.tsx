import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Check, X } from 'lucide-react';
import { validateAdminPassword, PasswordValidation } from '../utils/validation';
export function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [passwordValidation, setPasswordValidation] =
  useState<PasswordValidation>({
    isValid: false,
    hasMinLength: false,
    hasMaxLength: true,
    hasUppercase: false,
    hasSpecialChar: false
  });
  const { signup } = useAuth();
  const navigate = useNavigate();
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    setPasswordValidation(validateAdminPassword(newPassword));
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    // Validate password strength
    if (!passwordValidation.isValid) {
      setError('Please ensure your password meets all requirements.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    try {
      await signup(name, email, password);
      navigate('/onboarding');
    } catch (err: any) {
      setError(err.message);
    }
  };
  return (
    <div className="min-h-screen bg-cream flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Subtle Background Pattern */}
      <div className="absolute inset-0 opacity-30">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #1a1a2e 1px, transparent 0)`,
            backgroundSize: '40px 40px'
          }}>
        </div>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="flex justify-center">
          <div className="w-12 h-12 bg-charcoal rounded-xl flex items-center justify-center text-white font-serif font-bold text-2xl shadow-warm-md">
            F
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-serif font-bold text-charcoal">
          Create your account
        </h2>
        <p className="mt-2 text-center text-sm text-charcoal-500">
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-medium text-coral hover:text-coral-600 transition-colors">

            Sign in
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-white py-8 px-4 shadow-warm-lg sm:rounded-2xl sm:px-10 border border-gray-100">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <Input
              label="Full Name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)} />


            <Input
              label="Email address"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)} />


            <div className="space-y-3">
              <Input
                label="Password"
                type="password"
                required
                value={password}
                onChange={handlePasswordChange} />


              {/* Password Requirements Checklist */}
              {password.length > 0 &&
              <div
                className={`p-3 rounded-xl border space-y-2 ${passwordValidation.isValid ? 'bg-emerald-50 border-emerald-200' : 'bg-red-50 border-red-200'}`}>

                  <p
                  className={`text-xs font-semibold uppercase tracking-wider ${passwordValidation.isValid ? 'text-emerald-600' : 'text-red-600'}`}>

                    {passwordValidation.isValid ?
                  '✓ Password Valid' :
                  '✗ Password Requirements'}
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

            <Input
              label="Confirm Password"
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)} />


            {error &&
            <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg border border-red-100">
                {error}
              </div>
            }

            <Button
              type="submit"
              variant="primary"
              fullWidth
              disabled={!passwordValidation.isValid}
              className="disabled:opacity-50 disabled:cursor-not-allowed">

              Create Account
            </Button>
          </form>
        </div>
      </div>
    </div>);

}
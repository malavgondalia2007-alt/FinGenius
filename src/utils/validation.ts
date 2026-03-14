export const validateEmail = (email: string): boolean => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const validatePassword = (password: string): boolean => {
  return password.length >= 6;
};

// Admin password validation with strict criteria
export interface PasswordValidation {
  isValid: boolean;
  hasMinLength: boolean;
  hasMaxLength: boolean;
  hasUppercase: boolean;
  hasSpecialChar: boolean;
}

export const validateAdminPassword = (password: string): PasswordValidation => {
  const hasMinLength = password.length >= 8;
  const hasMaxLength = password.length <= 16;
  const hasUppercase = /[A-Z]/.test(password);
  const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

  return {
    isValid: hasMinLength && hasMaxLength && hasUppercase && hasSpecialChar,
    hasMinLength,
    hasMaxLength,
    hasUppercase,
    hasSpecialChar
  };
};
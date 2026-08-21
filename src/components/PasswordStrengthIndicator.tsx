import React from 'react';

interface Props {
  password: string;
}

export const PasswordStrengthIndicator: React.FC<Props> = ({ password }) => {
  const getStrength = (pwd: string) => {
    if (!pwd) return { label: '', color: '', width: '0%' };
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;

    switch (score) {
      case 4: return { label: 'Strong', color: 'bg-green-500', width: '100%' };
      case 3: return { label: 'Medium', color: 'bg-yellow-500', width: '75%' };
      case 2: return { label: 'Weak', color: 'bg-red-500', width: '50%' };
      default: return { label: 'Very Weak', color: 'bg-red-600', width: '25%' };
    }
  };

  const strength = getStrength(password);

  return (
    <div className="mt-2 space-y-1">
      <div className="h-1.5 w-full bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
        <div 
          className={`h-full ${strength.color} transition-all duration-300`}
          style={{ width: strength.width }}
        />
      </div>
      {strength.label && (
        <p className={`text-xs font-bold ${strength.color.replace('bg-', 'text-')}`}>
          Strength: {strength.label}
        </p>
      )}
    </div>
  );
};

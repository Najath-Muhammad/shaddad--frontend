import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string | null;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  id,
  className = '',
  ...props
}) => {
  const inputId = id || label.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="w-full">
      <label
        htmlFor={inputId}
        className="block text-xs font-semibold uppercase tracking-wider text-neutral-600 mb-1.5"
      >
        {label}
      </label>
      <input
        id={inputId}
        className={`w-full px-3.5 py-2.5 text-sm bg-white border ${
          error ? 'border-red-500' : 'border-neutral-300'
        } rounded-lg text-neutral-900 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-colors ${className}`}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
};

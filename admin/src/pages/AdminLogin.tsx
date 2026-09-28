import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../hooks/useAdminAuth.js';
import { Input } from '../components/common/Input.js';
import { Button } from '../components/common/Button.js';
import { Shield, AlertCircle } from 'lucide-react';

export const AdminLogin: React.FC = () => {
  const navigate = useNavigate();
  const { login, isLoading, error } = useAdminAuth();

  const [identifier, setIdentifier] = useState('admin@shaddad.sa');
  const [password, setPassword] = useState('AdminPassword123');
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!identifier.trim()) {
      setFormError('Please enter admin email or phone number');
      return;
    }
    if (!password) {
      setFormError('Please enter admin password');
      return;
    }

    try {
      await login({ identifier, password });
      navigate('/dashboard');
    } catch {
      // error is handled by hook / displayed below
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-100 px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 sm:p-10 rounded-2xl border border-neutral-200 shadow-sm">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-black text-white mb-4">
            <Shield className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-extrabold text-neutral-900 tracking-tight">SHADDAD</h2>
          <p className="mt-1 text-xs uppercase tracking-widest font-semibold text-neutral-500">
            Administrative Access Portal
          </p>
        </div>

        {(error || formError) && (
          <div className="p-3.5 bg-neutral-50 border border-neutral-300 rounded-lg flex items-start gap-2.5 text-xs text-neutral-900">
            <AlertCircle className="w-4 h-4 text-neutral-700 shrink-0 mt-0.5" />
            <span>{error || formError}</span>
          </div>
        )}

        <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
          <Input
            label="Admin Email or Phone"
            type="text"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            placeholder="admin@shaddad.sa or +966500000000"
            required
            autoComplete="username"
          />

          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            autoComplete="current-password"
          />

          <Button
            type="submit"
            className="w-full py-3 text-sm font-semibold tracking-wide"
            isLoading={isLoading}
          >
            Sign In to Dashboard
          </Button>

          <p className="text-center text-[11px] text-neutral-400 mt-4">
            Saudi Arabia Logistics Marketplace • Production Platform
          </p>
        </form>
      </div>
    </div>
  );
};

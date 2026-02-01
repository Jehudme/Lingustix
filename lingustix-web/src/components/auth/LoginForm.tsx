'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/lib/stores';
import { getErrorMessage } from '@/lib/utils';
import { Button, Input, useToast } from '@/components/ui';
import { PenTool, LogIn } from 'lucide-react';

export function LoginForm() {
  const router = useRouter();
  // Extract fetchUser and isAuthenticated to handle initialization
  const { login, isLoading, clearError, fetchUser, isAuthenticated } = useAuthStore();
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    identifier: '',
    password: '',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // 1. Initialize Auth State on Mount
  useEffect(() => {
    // This checks for an existing token.
    // If none exists, it sets isLoading to false, allowing you to type.
    fetchUser();
  }, [fetchUser]);

  // 2. Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.identifier.trim()) {
      errors.identifier = 'Username or email is required';
    } else if (formData.identifier.length < 3) {
      errors.identifier = 'Must be at least 3 characters';
    }

    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    if (!validateForm()) return;

    try {
      await login(formData);
      showToast('success', 'Welcome back!');
      router.push('/dashboard');
    } catch (error) {
      const errorMessage = getErrorMessage(error, 'login');
      showToast('error', errorMessage);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  return (
      <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md mx-auto"
      >
        <div className="text-center mb-8">
          <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 mb-4"
          >
            <PenTool className="w-8 h-8 text-indigo-500" />
          </motion.div>
          <h1 className="text-2xl font-bold text-slate-100 mb-2">Welcome back</h1>
          <p className="text-slate-400">Sign in to continue to Lingustix</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
              label="Username or Email"
              name="identifier"
              type="text"
              placeholder="Enter your username or email"
              value={formData.identifier}
              onChange={handleChange}
              error={formErrors.identifier}
              autoComplete="username"
              // Only disable if we are actually loading (fetching user or submitting)
              disabled={isLoading}
          />

          <Input
              label="Password"
              name="password"
              type="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              error={formErrors.password}
              autoComplete="current-password"
              disabled={isLoading}
          />

          <Button
              type="submit"
              className="w-full"
              isLoading={isLoading}
              disabled={isLoading}
          >
            <LogIn className="w-4 h-4" />
            Sign In
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-400">
          Don&apos;t have an account?{' '}
          <Link
              href="/auth/register"
              className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
          >
            Create one
          </Link>
        </p>
      </motion.div>
  );
}
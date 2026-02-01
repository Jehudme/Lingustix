'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { AxiosError } from 'axios';
import { accountApi } from '@/lib/api';
import { Button, Input, useToast } from '@/components/ui';
import { PenTool, UserPlus } from 'lucide-react';
import type { ApiError } from '@/types';

export function RegisterForm() {
  const router = useRouter();
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const errors: Record<string, string> = {};

    if (!formData.username.trim()) {
      errors.username = 'Username is required';
    } else if (formData.username.length < 3 || formData.username.length > 50) {
      errors.username = 'Username must be 3-50 characters';
    }

    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email';
    }

    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    }

    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const getErrorMessage = (error: unknown): string => {
    if (error instanceof AxiosError) {
      const apiError = error.response?.data as ApiError | undefined;
      const status = error.response?.status;

      // Handle specific error messages from the API
      if (apiError?.message) {
        // Make conflict messages more user-friendly
        if (apiError.message.includes('Email already in use')) {
          return 'This email address is already registered. Please use a different email or sign in.';
        }
        if (apiError.message.includes('Username already in use')) {
          return 'This username is already taken. Please choose a different username.';
        }
        return apiError.message;
      }

      // Handle HTTP status codes with user-friendly messages
      switch (status) {
        case 400:
          return 'Invalid registration data. Please check your information.';
        case 409:
          return 'An account with this email or username already exists.';
        case 422:
          return 'Please check your information and try again.';
        case 429:
          return 'Too many registration attempts. Please try again later.';
        case 500:
        case 502:
        case 503:
          return 'Server is temporarily unavailable. Please try again later.';
        default:
          break;
      }

      // Handle network errors
      if (error.code === 'ERR_NETWORK' || error.message === 'Network Error') {
        return 'Unable to connect to the server. Please check your internet connection.';
      }

      if (error.code === 'ECONNABORTED') {
        return 'Request timed out. Please try again.';
      }
    }

    return 'Registration failed. Please try again.';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    try {
      await accountApi.create({
        username: formData.username,
        email: formData.email,
        password: formData.password,
      });
      showToast('success', 'Account created successfully! Please sign in.');
      router.push('/auth/login');
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      showToast('error', errorMessage);
    } finally {
      setIsLoading(false);
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
        <h1 className="text-2xl font-bold text-slate-100 mb-2">Create account</h1>
        <p className="text-slate-400">Start your writing journey with Lingustix</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Username"
          name="username"
          type="text"
          placeholder="Choose a username"
          value={formData.username}
          onChange={handleChange}
          error={formErrors.username}
          autoComplete="username"
          disabled={isLoading}
        />

        <Input
          label="Email"
          name="email"
          type="email"
          placeholder="Enter your email"
          value={formData.email}
          onChange={handleChange}
          error={formErrors.email}
          autoComplete="email"
          disabled={isLoading}
        />

        <Input
          label="Password"
          name="password"
          type="password"
          placeholder="Create a password"
          value={formData.password}
          onChange={handleChange}
          error={formErrors.password}
          autoComplete="new-password"
          disabled={isLoading}
        />

        <Input
          label="Confirm Password"
          name="confirmPassword"
          type="password"
          placeholder="Confirm your password"
          value={formData.confirmPassword}
          onChange={handleChange}
          error={formErrors.confirmPassword}
          autoComplete="new-password"
          disabled={isLoading}
        />

        <Button
          type="submit"
          className="w-full"
          isLoading={isLoading}
          disabled={isLoading}
        >
          <UserPlus className="w-4 h-4" />
          Create Account
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-400">
        Already have an account?{' '}
        <Link
          href="/auth/login"
          className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
        >
          Sign in
        </Link>
      </p>
    </motion.div>
  );
}

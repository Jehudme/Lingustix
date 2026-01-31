'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Lock, Trash2, Save, AlertTriangle } from 'lucide-react';
import { useAuthStore } from '@/lib/stores';
import { accountApi } from '@/lib/api';
import { Button, Input, Modal, useToast } from '@/components/ui';
import { useRouter } from 'next/navigation';

export function AccountSettings() {
  const router = useRouter();
  const { user, logout, fetchUser } = useAuthStore();
  const { showToast } = useToast();
  
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [activeSection, setActiveSection] = useState<'username' | 'email' | 'password' | null>(null);
  
  const [username, setUsername] = useState(user?.username || '');
  const [email, setEmail] = useState(user?.email || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleUpdateUsername = async (e: React.FormEvent) => {
    e.preventDefault();
    if (username.length < 3 || username.length > 50) {
      showToast('error', 'Username must be 3-50 characters');
      return;
    }

    setIsLoading(true);
    try {
      await accountApi.updateUsername({ username });
      await fetchUser();
      showToast('success', 'Username updated successfully');
      setActiveSection(null);
    } catch {
      showToast('error', 'Failed to update username');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showToast('error', 'Please enter a valid email');
      return;
    }

    setIsLoading(true);
    try {
      await accountApi.updateEmail({ email });
      await fetchUser();
      showToast('success', 'Email updated successfully');
      setActiveSection(null);
    } catch {
      showToast('error', 'Failed to update email');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      showToast('error', 'Password must be at least 8 characters');
      return;
    }
    if (password !== confirmPassword) {
      showToast('error', 'Passwords do not match');
      return;
    }

    setIsLoading(true);
    try {
      await accountApi.updatePassword({ password });
      showToast('success', 'Password updated successfully');
      setPassword('');
      setConfirmPassword('');
      setActiveSection(null);
    } catch {
      showToast('error', 'Failed to update password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsLoading(true);
    try {
      await accountApi.delete();
      await logout();
      router.push('/auth/login');
      showToast('success', 'Account deleted successfully');
    } catch {
      showToast('error', 'Failed to delete account');
    } finally {
      setIsLoading(false);
      setShowDeleteModal(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-100 mb-6">Account Settings</h1>

      <div className="space-y-4">
        {/* Username Section */}
        <SettingsCard
          icon={<User className="w-5 h-5" />}
          title="Username"
          value={user?.username}
          isEditing={activeSection === 'username'}
          onEdit={() => setActiveSection('username')}
          onCancel={() => {
            setActiveSection(null);
            setUsername(user?.username || '');
          }}
        >
          <form onSubmit={handleUpdateUsername} className="space-y-4">
            <Input
              label="New Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter new username"
              minLength={3}
              maxLength={50}
            />
            <div className="flex gap-2">
              <Button type="submit" size="sm" isLoading={isLoading}>
                <Save className="w-4 h-4" />
                Save
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setActiveSection(null);
                  setUsername(user?.username || '');
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        </SettingsCard>

        {/* Email Section */}
        <SettingsCard
          icon={<Mail className="w-5 h-5" />}
          title="Email"
          value={user?.email}
          isEditing={activeSection === 'email'}
          onEdit={() => setActiveSection('email')}
          onCancel={() => {
            setActiveSection(null);
            setEmail(user?.email || '');
          }}
        >
          <form onSubmit={handleUpdateEmail} className="space-y-4">
            <Input
              label="New Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter new email"
            />
            <div className="flex gap-2">
              <Button type="submit" size="sm" isLoading={isLoading}>
                <Save className="w-4 h-4" />
                Save
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setActiveSection(null);
                  setEmail(user?.email || '');
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        </SettingsCard>

        {/* Password Section */}
        <SettingsCard
          icon={<Lock className="w-5 h-5" />}
          title="Password"
          value="••••••••"
          isEditing={activeSection === 'password'}
          onEdit={() => setActiveSection('password')}
          onCancel={() => {
            setActiveSection(null);
            setPassword('');
            setConfirmPassword('');
          }}
        >
          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <Input
              label="New Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter new password"
              minLength={8}
            />
            <Input
              label="Confirm Password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              minLength={8}
            />
            <div className="flex gap-2">
              <Button type="submit" size="sm" isLoading={isLoading}>
                <Save className="w-4 h-4" />
                Save
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setActiveSection(null);
                  setPassword('');
                  setConfirmPassword('');
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        </SettingsCard>

        {/* Danger Zone */}
        <div className="mt-8 p-4 rounded-lg border border-red-500/30 bg-red-500/5">
          <h3 className="text-lg font-medium text-red-400 mb-2 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Danger Zone
          </h3>
          <p className="text-sm text-slate-400 mb-4">
            Once you delete your account, there is no going back. Please be certain.
          </p>
          <Button
            variant="danger"
            size="sm"
            onClick={() => setShowDeleteModal(true)}
          >
            <Trash2 className="w-4 h-4" />
            Delete Account
          </Button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Account"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-slate-300">
            Are you sure you want to delete your account? This action cannot be undone and all your compositions will be permanently deleted.
          </p>
          <div className="flex gap-2 justify-end">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDeleteModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={handleDeleteAccount}
              isLoading={isLoading}
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

interface SettingsCardProps {
  icon: React.ReactNode;
  title: string;
  value?: string;
  isEditing: boolean;
  onEdit: () => void;
  onCancel: () => void;
  children: React.ReactNode;
}

function SettingsCard({
  icon,
  title,
  value,
  isEditing,
  onEdit,
  children,
}: SettingsCardProps) {
  return (
    <motion.div
      layout
      className="p-4 rounded-lg border border-slate-800 bg-slate-900/50"
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-slate-800 text-slate-400">
            {icon}
          </div>
          <div>
            <h3 className="font-medium text-slate-200">{title}</h3>
            {!isEditing && (
              <p className="text-sm text-slate-500">{value}</p>
            )}
          </div>
        </div>
        {!isEditing && (
          <Button variant="ghost" size="sm" onClick={onEdit}>
            Edit
          </Button>
        )}
      </div>
      
      {isEditing && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="mt-4"
        >
          {children}
        </motion.div>
      )}
    </motion.div>
  );
}

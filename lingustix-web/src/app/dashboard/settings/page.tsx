import type { Metadata } from 'next';
import { AccountSettings } from '@/components/settings';

export const metadata: Metadata = {
  title: 'Settings - Lingustix',
  description: 'Manage your account settings',
};

export default function SettingsPage() {
  return <AccountSettings />;
}

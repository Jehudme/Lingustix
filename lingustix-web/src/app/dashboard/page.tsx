import type { Metadata } from 'next';
import { CompositionList } from '@/components/dashboard';

export const metadata: Metadata = {
  title: 'Dashboard - Lingustix',
  description: 'Manage your compositions',
};

export default function DashboardPage() {
  return <CompositionList />;
}

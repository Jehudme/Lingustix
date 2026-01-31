'use client';

import { AuthGuard } from '@/components/auth';
import { Sidebar } from '@/components/layout';
import { CommandPalette } from '@/components/search';
import { OnboardingModal } from '@/components/ui';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-slate-950">
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content */}
        <div className="lg:pl-64">
          {/* Top Bar with Search */}
          <header className="sticky top-0 z-30 flex items-center justify-between px-6 py-4 bg-slate-950/80 backdrop-blur-sm border-b border-slate-800 lg:top-0 pt-16 lg:pt-4">
            <div className="flex-1" />
            <CommandPalette />
          </header>

          {/* Page Content */}
          <main className="min-h-[calc(100vh-65px)]">
            {children}
          </main>
        </div>

        {/* Onboarding Modal */}
        <OnboardingModal />
      </div>
    </AuthGuard>
  );
}

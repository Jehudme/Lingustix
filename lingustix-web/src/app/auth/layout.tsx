import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Login - Lingustix',
  description: 'Sign in to your Lingustix account',
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
      {children}
    </div>
  );
}

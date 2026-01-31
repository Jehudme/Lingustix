'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  FileText,
  Search,
  Settings,
  LogOut,
  Menu,
  X,
  PenTool,
} from 'lucide-react';
import { useState } from 'react';
import { useAuthStore } from '@/lib/stores';
import { useRouter } from 'next/navigation';
import type { AccountResponse } from '@/types';

interface NavItem {
  href: string;
  label: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  { href: '/dashboard', label: 'Compositions', icon: <FileText className="w-5 h-5" /> },
  { href: '/dashboard/search', label: 'Search', icon: <Search className="w-5 h-5" /> },
  { href: '/dashboard/settings', label: 'Settings', icon: <Settings className="w-5 h-5" /> },
];

interface NavContentProps {
  pathname: string;
  user: AccountResponse | null;
  onLogout: () => void;
  onCloseMobile: () => void;
}

function isActiveRoute(pathname: string, href: string): boolean {
  if (href === '/dashboard') {
    return pathname === '/dashboard' || pathname.startsWith('/dashboard/compositions');
  }
  return pathname.startsWith(href);
}

function NavContent({ pathname, user, onLogout, onCloseMobile }: NavContentProps) {
  return (
    <>
      {/* Logo */}
      <Link href="/dashboard" className="flex items-center gap-2 px-4 py-6">
        <PenTool className="w-8 h-8 text-indigo-500" />
        <span className="text-xl font-bold text-slate-100">Lingustix</span>
      </Link>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={onCloseMobile}
                className={`
                  flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors duration-200
                  ${
                    isActiveRoute(pathname, item.href)
                      ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                  }
                `}
              >
                {item.icon}
                <span className="font-medium">{item.label}</span>
                {isActiveRoute(pathname, item.href) && (
                  <motion.div
                    layoutId="activeNav"
                    className="absolute left-0 w-1 h-6 bg-indigo-500 rounded-r"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* User Section */}
      <div className="px-2 py-4 border-t border-slate-800">
        {user && (
          <div className="px-4 py-2 mb-2">
            <p className="text-sm font-medium text-slate-200 truncate">{user.username}</p>
            <p className="text-xs text-slate-500 truncate">{user.email}</p>
          </div>
        )}
        <button
          onClick={onLogout}
          className="flex items-center gap-3 w-full px-4 py-2.5 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-colors duration-200"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout, user } = useAuthStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    router.push('/auth/login');
  };

  const handleCloseMobile = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 h-screen bg-slate-950 border-r border-slate-800 fixed left-0 top-0">
        <NavContent
          pathname={pathname}
          user={user}
          onLogout={handleLogout}
          onCloseMobile={handleCloseMobile}
        />
      </aside>

      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-slate-950 border-b border-slate-800 px-4 py-3">
        <div className="flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2">
            <PenTool className="w-6 h-6 text-indigo-500" />
            <span className="text-lg font-bold text-slate-100">Lingustix</span>
          </Link>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-lg hover:bg-slate-800 transition-colors"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6 text-slate-300" />
            ) : (
              <Menu className="w-6 h-6 text-slate-300" />
            )}
          </button>
        </div>
      </header>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, x: -300 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -300 }}
          className="lg:hidden fixed inset-0 z-30 bg-slate-950 pt-16"
        >
          <div className="flex flex-col h-full">
            <NavContent
              pathname={pathname}
              user={user}
              onLogout={handleLogout}
              onCloseMobile={handleCloseMobile}
            />
          </div>
        </motion.div>
      )}
    </>
  );
}

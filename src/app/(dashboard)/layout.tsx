'use client';

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
  Layers, 
  LayoutDashboard, 
  PlusSquare, 
  Settings, 
  LogOut, 
  User,
  Database,
  Search,
  CloudLightning,
  Loader2
} from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  
  const session = {
    user: { name: 'Administrator', email: 'admin@example.com' }
  };
  let status = 'authenticated' as string;

  // Route guarding
  React.useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-gray-500">
        <Loader2 className="h-8 w-8 animate-spin text-neutral-800" id="main-loading-spinner" />
        <p className="mt-3 text-sm font-medium">Re-indexing AppForge schema...</p>
      </div>
    );
  }

  if (status === 'unauthenticated' || !session) {
    return null;
  }

  const navItems = [
    { name: 'Console Hub', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Generate App', href: '/apps/new', icon: PlusSquare },
    { name: 'Systems Hub', href: '/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex" id="master-dashboard-wrapper">
      {/* Dynamic Left Navigation Rail */}
      <aside className="w-64 bg-neutral-900 text-white flex flex-col shrink-0" id="aside-sidebar-nav">
        {/* Sidebar Header */}
        <div className="p-6 border-b border-neutral-800 flex items-center gap-3">
          <Layers className="h-6 w-6 text-neutral-200" id="sidebar-logo-icon" />
          <span className="font-semibold tracking-tight text-white font-display">AppForge Console</span>
        </div>

        {/* Sidebar Links */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          <div className="px-3 text-[10px] font-bold text-neutral-500 tracking-wider uppercase mb-3">
            Management
          </div>
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150 ${
                  isActive 
                    ? 'bg-neutral-800 text-white font-medium shadow-sm' 
                    : 'text-neutral-400 hover:text-neutral-100 hover:bg-neutral-850'
                }`}
                id={`sidebar-link-${item.name.toLowerCase().replace(' ', '-')}`}
              >
                <Icon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-neutral-400'}`} id={`sidebar-icon-${item.name.toLowerCase().replace(' ', '-')}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Profile Card */}
        <div className="p-4 border-t border-neutral-800 bg-neutral-950/60 flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 bg-neutral-800 rounded-full flex items-center justify-center border border-neutral-700 text-neutral-200">
              <User className="h-4.5 w-4.5" id="user-avatar-icon" />
            </div>
            <div className="flex-1 overflow-hidden">
              <div className="text-xs font-semibold text-slate-200 truncate">{session.user?.name || 'Administrator'}</div>
              <div className="text-[10px] text-slate-500 font-mono truncate">{session.user?.email || 'admin@example.com'}</div>
            </div>
          </div>
          
          <button
            onClick={async () => {
              await fetch('/api/auth/logout', { method: 'POST' });
              router.push('/');
            }}
            className="w-full flex items-center justify-center gap-2 py-1.5 rounded-md hover:bg-neutral-800/80 text-xs text-red-400 hover:text-red-300 transition"
            id="sidebar-signout-btn"
          >
            <LogOut className="h-3.5 w-3.5" id="signout-btn-icon" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main content viewport */}
      <div className="flex-1 flex flex-col overflow-x-hidden">
        {/* Global top nav ribbon */}
        <header className="h-16 bg-white border-b border-gray-150 flex items-center justify-between px-8 shrink-0">
          <div className="flex items-center gap-2">
            <CloudLightning className="h-4 w-4 text-emerald-500 animate-pulse" id="status-cloud-lightning" />
            <span className="text-[11px] font-mono font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
              PLATFORM ONLINE (PWA)
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono text-slate-500">
            <span>Server Instance: <strong className="text-slate-800">Localhost</strong></span>
            <span>|</span>
            <span>Metadata: <strong className="text-slate-800">Operational</strong></span>
          </div>
        </header>

        {/* Dashboard page layout viewport */}
        <main className="flex-1 overflow-y-auto p-8 relative">
          {children}
        </main>
      </div>
    </div>
  );
}

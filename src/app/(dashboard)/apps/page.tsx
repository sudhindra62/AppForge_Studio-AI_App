import React from 'react';
import Link from 'next/link';
import { requireAuth } from '@/modules/auth/components/SessionGuard';
import { applicationRepository } from '@/database/repositories/application.repository';
import { ROUTES } from '@/shared/constants/routes';
import { Plus, AppWindow, ArrowRight, Layout, Cpu, RefreshCw, Calendar } from 'lucide-react';

export default async function AppsPage() {
  const session = await requireAuth();
  
  // Fetch all user apps
  const appsResult = await applicationRepository.findManyForUser(session.user.id);
  const apps = appsResult.data;

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white mb-2">
            Applications Registry
          </h1>
          <p className="text-slate-400 text-sm">
            Configure, deploy, and browse your dynamic business models.
          </p>
        </div>
        <Link 
          href={ROUTES.APPS.NEW}
          className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-slate-950 font-bold transition-all shadow-md hover:shadow-yellow-500/10 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>New Application</span>
        </Link>
      </div>

      {apps.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-20 text-center rounded-2xl bg-slate-900/10 border border-dashed border-slate-800 backdrop-blur-sm">
          <div className="w-16 h-16 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-center text-slate-400 mb-6 text-2xl shadow-inner">
            ⚡
          </div>
          <h3 className="text-xl font-bold text-white mb-2">No Applications Found</h3>
          <p className="text-slate-400 max-w-md text-sm leading-relaxed mb-8">
            You haven&apos;t defined any metadata-driven applications yet. Create one now to automatically generate databases, forms, and views.
          </p>
          <Link 
            href={ROUTES.APPS.NEW}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-slate-950 font-bold transition-all shadow-lg hover:shadow-yellow-500/5 active:scale-95"
          >
            <Plus className="w-5 h-5" />
            <span>Create First App</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {apps.map((app) => (
            <div 
              key={app.id}
              className="group flex flex-col justify-between p-6 rounded-2xl bg-slate-900/20 border border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/40 transition-all hover:shadow-xl relative overflow-hidden"
            >
              {app.coverColor && (
                <div 
                  className="absolute top-0 left-0 right-0 h-1.5 opacity-80" 
                  style={{ backgroundColor: app.coverColor }}
                />
              )}
              
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-slate-800/80 border border-slate-700 flex items-center justify-center text-2xl text-white shadow-inner">
                    {app.icon || '⚡'}
                  </div>
                  <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-slate-800 text-slate-300 border border-slate-700 uppercase tracking-widest">
                    v{app.version}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-white group-hover:text-yellow-500 transition-colors mb-2">
                  {app.name}
                </h3>
                
                <p className="text-slate-400 text-xs line-clamp-3 leading-relaxed mb-6">
                  {app.description || 'No description provided.'}
                </p>
              </div>

              <div className="space-y-4 border-t border-slate-800/50 pt-4">
                <div className="grid grid-cols-2 gap-2 text-xs text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <Layout className="w-3.5 h-3.5 text-slate-600" />
                    <span>{app._count?.entities || 0} Entities</span>
                  </div>
                  <div className="flex items-center gap-1.5 justify-end uppercase tracking-wider font-semibold text-[10px]">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span className="text-slate-400">{app.status.toLowerCase()}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-[10px] text-slate-600">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Updated {new Date(app.updatedAt).toLocaleDateString()}</span>
                </div>

                <Link 
                  href={ROUTES.APPS.DETAIL(app.id)}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-sm font-semibold text-yellow-500 border border-slate-800/80 hover:border-slate-700 transition-all active:scale-[0.98]"
                >
                  <span>Launch Engine</span>
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import { CreateEntityForm } from './CreateEntityForm';
import { 
  AppWindow, Database, Settings, Table, Plus, 
  ArrowLeft, Cpu, Activity, Clock, Sliders, Layout, ArrowRight
} from 'lucide-react';
import { ROUTES } from '@/shared/constants/routes';

interface AppOverviewProps {
  app: any;
  initialEntities: any[];
}

export function AppOverview({ app, initialEntities }: AppOverviewProps) {
  const [entities, setEntities] = useState<any[]>(initialEntities);
  const [showAddForm, setShowAddForm] = useState(false);

  const fetchUpdatedEntities = async () => {
    try {
      const res = await fetch(`/api/applications/${app.id}/entities`);
      const result = await res.json();
      if (res.ok && result.success) {
        setEntities(result.data);
      }
    } catch (err) {
      console.error('Error refreshing entities:', err);
    }
  };

  const handleCreateSuccess = () => {
    setShowAddForm(false);
    fetchUpdatedEntities();
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Back button */}
      <div>
        <Link 
          href="/apps"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-white transition-all group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
          <span>Back to Applications</span>
        </Link>
      </div>

      {/* Application Info Card */}
      <div className="relative p-8 rounded-3xl bg-slate-900/20 border border-slate-800 overflow-hidden">
        {app.coverColor && (
          <div 
            className="absolute top-0 left-0 right-0 h-1.5 opacity-80" 
            style={{ backgroundColor: app.coverColor }}
          />
        )}

        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="flex items-start gap-5">
            <div className="w-14 h-14 rounded-2xl bg-slate-800 flex items-center justify-center text-3xl border border-slate-700 shadow-xl shrink-0">
              {app.icon || '⚡'}
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-extrabold text-white">{app.name}</h1>
                <span className="text-xs px-2.5 py-0.5 rounded-full font-mono bg-slate-800 text-slate-300 border border-slate-700">
                  Version {app.version}
                </span>
              </div>
              <p className="text-sm text-slate-400 max-w-xl leading-relaxed">
                {app.description || 'No description provided for this application.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs px-3 py-1 bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20 rounded-full capitalize">
              {app.status.toLowerCase()}
            </span>
            <span className="text-xs px-3 py-1 bg-slate-800 text-slate-300 font-bold border border-slate-700 rounded-full">
              {app.visibility.toLowerCase()}
            </span>
          </div>
        </div>

        {/* Dashboard metadata items */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-6 border-t border-slate-800/50 text-xs">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-slate-500" />
            <div className="text-slate-400">
              <span className="font-extrabold text-white mr-1">{entities.length}</span>
              Models
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-500" />
            <div className="text-slate-400">
              Updated {new Date(app.updatedAt).toLocaleDateString()}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-slate-500" />
            <div className="text-slate-400">
              Slug: <span className="font-mono text-[10px] text-slate-300 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-850">{app.slug}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-slate-500" />
            <div className="text-slate-400">
              Schema Engines Active
            </div>
          </div>
        </div>
      </div>

      {/* Main Entities Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2">
            <Layout className="w-5 h-5 text-slate-500" />
            <h2 className="text-lg font-extrabold text-white">Database Entities (Data Models)</h2>
          </div>
          
          <button
            type="button"
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-1.5 px-4 py-2 hover:opacity-90 rounded-xl bg-yellow-500 text-slate-950 text-xs font-extrabold transition-all active:scale-95 shadow-md"
          >
            <Plus className="w-4 h-4 text-slate-950 font-bold" />
            <span>Generate Model</span>
          </button>
        </div>

        <AnimatePresence mode="wait">
          {showAddForm && (
            <CreateEntityForm 
              appId={app.id} 
              onSuccess={handleCreateSuccess}
              onCancel={() => setShowAddForm(false)}
            />
          )}
        </AnimatePresence>

        {entities.length === 0 ? (
          <div className="p-16 text-center rounded-2xl bg-slate-900/10 border border-dashed border-slate-800">
            <Database className="w-10 h-10 text-slate-600 mx-auto mb-4" />
            <h4 className="text-sm font-bold text-white mb-1">No Data Models Defined</h4>
            <p className="text-xs text-slate-400 max-w-xs mx-auto mb-6">
              You haven&apos;t added any tables or models to this application workspace yet.
            </p>
            <button
              onClick={() => setShowAddForm(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs text-yellow-500 font-semibold border border-slate-800 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Define First Model</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {entities.map((entity) => (
              <div 
                key={entity.id}
                className="group flex flex-col justify-between p-6 rounded-2xl bg-slate-900/10 border border-slate-800 hover:border-slate-700 hover:bg-slate-900/30 transition-all shadow-sm"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-slate-950 flex items-center justify-center text-slate-400 border border-slate-800 group-hover:border-slate-700 shadow-inner">
                      <Table className="w-5 h-5 text-yellow-500/70" />
                    </div>
                    <span className="text-[10px] uppercase font-mono tracking-wider text-slate-500 bg-slate-950 px-2 py-0.5 rounded border border-slate-850">
                      slug: {entity.slug}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white group-hover:text-yellow-500 transition-colors mb-2">
                    {entity.pluralName}
                  </h3>
                  
                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-4">
                    {entity.description || `No description for the ${entity.name.toLowerCase()} object.`}
                  </p>
                </div>

                <div className="flex items-center justify-between border-t border-slate-850 pt-4 mt-4">
                  <div className="flex items-center gap-4 text-xs text-slate-500">
                    <div>
                      <span className="font-bold text-white mr-1">{entity._count?.fields || 0}</span>
                      Fields
                    </div>
                    <div>
                      <span className="font-bold text-white mr-1">{entity.recordCount}</span>
                      Rows
                    </div>
                  </div>

                  <Link 
                    href={`/apps/${app.id}/${entity.slug}`}
                    className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-extrabold text-yellow-500 hover:text-yellow-400 transition-colors group-hover:underline"
                  >
                    <span>View Data</span>
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

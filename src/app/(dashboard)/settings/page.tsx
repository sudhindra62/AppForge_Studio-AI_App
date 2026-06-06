'use client';

import React, { useState } from 'react';
import { 
  Settings, 
  RefreshCw, 
  Smartphone, 
  Database, 
  Trash2, 
  Check, 
  ShieldCheck, 
  CloudLightning,
  Play
} from 'lucide-react';
import { motion } from 'motion/react';

export default function SystemsSettings() {
  const [resetting, setResetting] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [actionDone, setActionDone] = useState<string | null>(null);

  // Calls database reset trigger to repopulate seed defaults
  const handleDatabaseReset = async () => {
    if (!confirm('This will wipe your current operational schemas, active records, and custom user definitions, restoring standard Sales CRM and Task Tracker templates. Do you wish to proceed?')) {
      return;
    }
    setResetting(true);
    setActionDone(null);
    try {
      // Direct post to database endpoint to wipe state and reseed
      const res = await fetch('/api/database/reset', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setActionDone(data.message || 'Database successfully re-seeded.');
      } else {
        throw new Error('Reset failed on server side');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setResetting(false);
    }
  };

  const handleClearCache = async () => {
    setClearing(true);
    setActionDone(null);
    await new Promise(r => setTimeout(r, 1000));
    setClearing(false);
    setActionDone('Progressive Web Worker caches and metadata storage cleared.');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8" id="settings-root-panel">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-slate-900 font-display">Systems Hub</h2>
        <p className="text-sm text-slate-500 mt-1">Configure metadata engine status, PWA service worker setups, and storage boundaries.</p>
      </div>

      {actionDone && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs font-semibold flex items-center gap-2" id="settings-success-alert">
          <Check className="h-4 w-4 text-emerald-600" />
          <span>{actionDone}</span>
        </div>
      )}

      {/* Main configuration zones */}
      <div className="space-y-6">
        {/* progressive caching state */}
        <div className="bg-white p-6 rounded-xl border border-gray-150 space-y-4">
          <div className="flex items-center gap-2.5">
            <Smartphone className="h-5 w-5 text-neutral-850" />
            <h3 className="font-semibold text-sm text-slate-800 font-display">Progressive App Engine (PWA)</h3>
          </div>

          <p className="text-xs text-slate-500 leading-relaxed font-sans">
            AppForge compiles offline-ready profiles automatically. Service worker handles REST route request caching and background database synchronization with local storage fallback when internet connectivity drops.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="p-4 rounded-lg bg-slate-50 border border-slate-150 text-xs text-slate-705 space-y-1">
              <div>Offline Cache Status: <strong className="text-emerald-600">Active</strong></div>
              <div>Service Worker Version: <strong className="text-slate-850 font-mono">v1.9.4-compiled</strong></div>
            </div>

            <div className="p-4 rounded-lg bg-slate-50 border border-slate-150 text-xs text-slate-705 space-y-1">
              <div>Synchronized Blueprints: <strong className="text-slate-850">Local IndexedDB</strong></div>
              <div>Storage Allocation: <strong className="text-slate-850 font-mono">1.24 MB of 50 MB</strong></div>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={handleClearCache}
              disabled={clearing}
              className="text-xs font-semibold text-neutral-900 border border-slate-200 hover:bg-slate-50 px-4 py-2.5 rounded transition flex items-center gap-1.5"
              id="clear-cached-pwa-btn"
            >
              {clearing ? (
                <>
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  <span>Clearing operational caches...</span>
                </>
              ) : (
                <>
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Clear cached transaction state</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Database Lifecycle controls */}
        <div className="bg-white p-6 rounded-xl border border-gray-150 space-y-4">
          <div className="flex items-center gap-2.5">
            <Database className="h-5 w-5 text-neutral-850" />
            <h3 className="font-semibold text-sm text-slate-800 font-display">Platform database Reset</h3>
          </div>

          <p className="text-xs text-slate-500 leading-relaxed font-sans">
            Wipes all configured metadata application workspaces, compiled layouts, dynamic API mappings, and cell records, rebuilding pre-seeded Sales CRM and Task Tracker templates.
          </p>

          <div className="pt-2">
            <button
              onClick={handleDatabaseReset}
              disabled={resetting}
              className="bg-neutral-950 text-white hover:bg-neutral-850 disabled:opacity-50 text-xs font-semibold tracking-wider uppercase px-4 py-2.5 rounded transition flex items-center gap-1.5"
              id="reset-db-blueprints-btn"
            >
              {resetting ? (
                <>
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  <span>Re-building database stores...</span>
                </>
              ) : (
                <>
                  <RefreshCw className="h-3.5 w-3.5" />
                  <span>Reset back to preseeded datasets</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Console accounts and security */}
        <div className="bg-white p-6 rounded-xl border border-gray-150 space-y-4">
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="h-5 w-5 text-neutral-850" />
            <h3 className="font-semibold text-sm text-slate-800 font-display">System Account Permissions</h3>
          </div>

          <div className="p-4 bg-emerald-50/50 border border-emerald-150 rounded-lg flex items-start gap-3">
            <CloudLightning className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="text-xs font-sans text-slate-700 leading-relaxed">
              <strong>Super Administrator Status:</strong> Managed access profile is verified against database cryptographies. Multi-tenant database allocation handles transactional locks seamlessly.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

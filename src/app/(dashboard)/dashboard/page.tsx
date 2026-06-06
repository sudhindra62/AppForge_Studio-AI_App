'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import { 
  Plus, 
  Trash2, 
  Settings, 
  Box, 
  Server, 
  BookOpen, 
  Layout, 
  History, 
  Search, 
  AlertCircle,
  Briefcase,
  CheckSquare,
  Package,
  Layers,
  ArrowRight
} from 'lucide-react';

const iconMap: Record<string, any> = {
  Briefcase: Briefcase,
  CheckSquare: CheckSquare,
  Package: Package,
  Layers: Layers
};

export default function DashboardConsole() {
  const [apps, setApps] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<any>({ appsCount: 0, entitiesCount: 0, recordsCount: 0, logsCount: 0 });
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const loadData = async () => {
    try {
      const [appsRes, metricsRes, logsRes] = await Promise.all([
        fetch('/api/applications'),
        fetch('/api/metrics'),
        fetch('/api/audit-logs')
      ]);

      if (appsRes.ok) setApps(await appsRes.json());
      if (metricsRes.ok) setMetrics(await metricsRes.json());
      if (logsRes.ok) setLogs(await logsRes.json());
    } catch (e) {
      console.error('Error fetching dashboard console data', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDeleteApp = async (appId: string) => {
    if (!confirm('Are you absolutely sure you want to destroy this application? This will wipe the metadata schema and all associated entity records permanently.')) {
      return;
    }

    try {
      const res = await fetch(`/api/applications/${appId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        // Reload
        await loadData();
      }
    } catch (e) {
      console.error('Error deleting application', e);
    }
  };

  const filteredApps = apps.filter(app => 
    app.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    app.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8" id="console-hub-root">
      {/* Header and Quick Creation callouts */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-slate-905 font-display">Console Hub</h2>
          <p className="text-sm text-slate-500 mt-1">Monitor, configure, and alter your dynamically generated applications.</p>
        </div>

        <Link
          href="/apps/new"
          className="bg-neutral-950 text-white hover:bg-neutral-850 px-5 py-3 rounded-lg text-sm font-medium transition duration-150 flex items-center gap-2 shadow-sm"
          id="createNewApp-dash-btn"
        >
          <Plus className="h-4 w-4" id="btn-plus-icon" />
          <span>New App Studio</span>
        </Link>
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-slate-400">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-300 border-t-slate-800" />
          <span className="mt-4 text-xs font-mono">Syncing telemetry data...</span>
        </div>
      ) : (
        <>
          {/* KPI Statistics Section */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-xl border border-gray-150" id="metric-card-apps">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Apps</span>
                <Layout className="h-5 w-5 text-neutral-400" id="apps-metric-icon" />
              </div>
              <div className="mt-4 text-3xl font-semibold text-slate-900 tracking-tight">{metrics.appsCount}</div>
              <div className="text-[10px] text-slate-500 mt-1">Operational profiles compiled</div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-150" id="metric-card-entities">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Designed Tables</span>
                <Box className="h-5 w-5 text-neutral-400" id="entities-metric-icon" />
              </div>
              <div className="mt-4 text-3xl font-semibold text-slate-900 tracking-tight">{metrics.entitiesCount}</div>
              <div className="text-[10px] text-slate-500 mt-1">Entity models mapped to storage</div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-150" id="metric-card-records">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">App Records</span>
                <Server className="h-5 w-5 text-neutral-400" id="records-metric-icon" />
              </div>
              <div className="mt-4 text-3xl font-semibold text-slate-900 tracking-tight">{metrics.recordsCount}</div>
              <div className="text-[10px] text-slate-500 mt-1">Active transactional records</div>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-150" id="metric-card-logs">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Platform Events</span>
                <History className="h-5 w-5 text-neutral-400" id="logs-metric-icon" />
              </div>
              <div className="mt-4 text-3xl font-semibold text-slate-900 tracking-tight">{metrics.logsCount}</div>
              <div className="text-[10px] text-slate-500 mt-1">Secured auditing changes</div>
            </div>
          </div>

          {/* Apps grid search catalog */}
          <div className="space-y-4">
            <div className="flex justify-between items-center bg-white px-4 py-3 rounded-xl border border-gray-150">
              <div className="flex items-center gap-3 flex-1">
                <Search className="h-4 w-4 text-slate-400" id="applist-search-icon" />
                <input
                  id="dashboard-search-input"
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Quick search through compiled applications..."
                  className="bg-transparent border-none text-sm text-slate-800 outline-none w-full"
                />
              </div>
              <div className="text-xs text-slate-400 hidden md:block">
                Showing {filteredApps.length} of {apps.length} applications
              </div>
            </div>

            {filteredApps.length === 0 ? (
              <div className="p-12 text-center bg-white rounded-xl border border-gray-150 text-slate-400 space-y-2">
                <AlertCircle className="h-8 w-8 mx-auto text-slate-300" id="empty-alert-icon" />
                <p className="text-sm font-medium">No generated applications found matching your query.</p>
                <p className="text-xs text-slate-500">Create one manually or call the AI Wizard to bootstrap high-fidelity models.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="dashboard-apps-grid">
                {filteredApps.map((app) => {
                  const IconComponent = iconMap[app.icon] || Layers;
                  return (
                    <motion.div
                      key={app.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white rounded-xl border border-gray-150 shadow-sm hover:shadow-md transition-all duration-150 flex flex-col justify-between"
                      id={`app-card-${app.id}`}
                    >
                      <div className="p-6 space-y-4">
                        <div className="flex justify-between items-start">
                          <div className="h-10 w-10 bg-neutral-900 text-white rounded-lg flex items-center justify-center border border-neutral-800 shadow-inner">
                            <IconComponent className="h-5 w-5" id={`app-card-icon-${app.id}`} />
                          </div>
                          
                          <span className={`text-[10px] font-mono font-semibold uppercase px-2 py-0.5 rounded border ${
                            app.status === 'active' 
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                              : 'bg-amber-50 text-amber-700 border-amber-100'
                          }`}>
                            {app.status}
                          </span>
                        </div>

                        <div>
                          <h4 className="text-base font-semibold text-slate-850 tracking-tight font-display">{app.name}</h4>
                          <p className="text-xs text-slate-500 mt-2 leading-relaxed min-h-[36px] line-clamp-2">
                            {app.description}
                          </p>
                        </div>
                      </div>

                      <div className="bg-slate-50/80 px-6 py-4.5 rounded-b-xl border-t border-gray-150 flex items-center justify-between">
                        <Link
                          href={`/apps/${app.id}`}
                          className="text-xs font-semibold text-neutral-900 hover:text-neutral-700 transition flex items-center gap-1.5"
                          id={`manage-lnk-${app.id}`}
                        >
                          <span>Open Workspace</span>
                          <ArrowRight className="h-3 w-3" id={`arrow-icon-${app.id}`} />
                        </Link>

                        <button
                          onClick={() => handleDeleteApp(app.id)}
                          className="p-1 px-2 hover:bg-red-50 text-red-500 hover:text-red-600 rounded text-xs transition duration-150 flex items-center gap-1.5"
                          id={`destroy-btn-${app.id}`}
                          title="Destroy compilation blueprint"
                        >
                          <Trash2 className="h-3.5 w-3.5" id={`trash-icon-${app.id}`} />
                          <span>Destroy</span>
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Console Audit Logs Terminal */}
          <div className="bg-white rounded-xl border border-gray-150 overflow-hidden" id="audit-logs-terminal-card">
            <div className="px-6 py-5 border-b border-gray-150 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <History className="h-5 w-5 text-neutral-800" id="audit-log-header-icon" />
                <h3 className="font-semibold text-sm text-slate-850 font-display">System Audit logs</h3>
              </div>
              <div className="text-[10px] font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                Live Terminal Stream
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs font-mono" id="audit-logs-table">
                <thead>
                  <tr className="bg-slate-50/80 text-slate-400 border-b border-gray-150">
                    <th className="px-6 py-3 font-semibold text-[10px] uppercase">Timestamp</th>
                    <th className="px-6 py-3 font-semibold text-[10px] uppercase">Code event</th>
                    <th className="px-6 py-3 font-semibold text-[10px] uppercase">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {logs.slice(0, 10).map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/40 text-slate-700">
                      <td className="px-6 py-3 text-slate-400 whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleTimeString() || log.timestamp}
                      </td>
                      <td className="px-6 py-3 whitespace-nowrap">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold tracking-wider ${
                          log.action.includes('SYSTEM') 
                            ? 'bg-blue-50 text-blue-600 border border-blue-100'
                            : log.action.includes('RECORD')
                            ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                            : 'bg-purple-50 text-purple-600 border border-purple-100'
                        }`}>
                          {log.action}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-slate-800 max-w-md truncate" title={log.details}>
                        {log.details}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

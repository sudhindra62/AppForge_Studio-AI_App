'use client';

import React, { useState } from 'react';
import { CSVImportWizard } from '@/modules/csv-import/components/CSVImportWizard';
import { 
  FileSpreadsheet, AppWindow, Database, Loader2, ArrowRight
} from 'lucide-react';

interface CSVImportControlProps {
  apps: any[];
  entities: any[];
}

export function CSVImportControl({ apps, entities }: CSVImportControlProps) {
  const [selectedAppId, setSelectedAppId] = useState<string>('');
  const [selectedEntityId, setSelectedEntityId] = useState<string>('');
  const [startWizard, setStartWizard] = useState<boolean>(false);

  // Filter entities according to selected Application
  const filteredEntities = entities.filter((e) => e.appId === selectedAppId);

  // Load target elements
  const targetApp = apps.find((a) => a.id === selectedAppId);
  const targetEntity = entities.find((e) => e.id === selectedEntityId);

  // Map database entity to EngineEntity contract
  const engineEntitySpec = targetEntity ? {
    id: targetEntity.id,
    name: targetEntity.name,
    pluralName: targetEntity.name,
    slug: targetEntity.slug,
    displayField: targetEntity.displayField || 'name',
    fields: targetEntity.fields?.map((f: any) => ({
      id: f.id || f.name,
      name: f.name,
      label: f.name,
      type: f.type,
      isRequired: !!f.required,
      isReadOnly: false,
      isUnique: false,
    })) || [],
  } : null;

  if (startWizard && selectedAppId && engineEntitySpec) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between bg-slate-900/10 border border-slate-800 p-4 rounded-2xl">
          <div className="flex items-center gap-3 text-xs">
            <span className="font-bold text-slate-500 uppercase tracking-widest">Active Workspace:</span>
            <span className="text-white font-bold">{targetApp?.name}</span>
            <span className="text-slate-600">/</span>
            <span className="text-yellow-500 font-bold">{targetEntity?.name}</span>
          </div>
          <button
            onClick={() => setStartWizard(false)}
            className="text-xs px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition-all font-semibold"
          >
            Switch Object
          </button>
        </div>

        <CSVImportWizard 
          appId={selectedAppId} 
          entity={engineEntitySpec as any} 
          onSuccess={() => setStartWizard(false)}
          onClose={() => setStartWizard(false)} 
        />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto rounded-3xl bg-slate-900/30 border border-slate-800 p-8 backdrop-blur-md space-y-6 animate-fade-in">
      <div className="text-center max-w-md mx-auto space-y-2 mb-6">
        <div className="w-12 h-12 rounded-2xl bg-yellow-500/10 border border-yellow-500/20 text-yellow-500 flex items-center justify-center mx-auto shadow-inner text-xl">
          <FileSpreadsheet className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-extrabold text-white">Bulk CSV Importer Pipeline</h2>
        <p className="text-xs text-slate-400 leading-relaxed">
          Select a target application context and schema model below to unlock visual import mapping.
        </p>
      </div>

      <div className="space-y-5">
        {/* Choice 1: Application */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <AppWindow className="w-3.5 h-3.5 text-slate-500" />
            <span>Select Target Application</span>
          </label>
          <select
            value={selectedAppId}
            onChange={(e) => {
              setSelectedAppId(e.target.value);
              setSelectedEntityId('');
            }}
            className="w-full px-4 py-3 bg-slate-950 border border-slate-800 focus:border-slate-700 focus:outline-none rounded-xl text-white text-xs uppercase"
          >
            <option value="">-- Choose Workspace --</option>
            {apps.map((app) => (
              <option key={app.id} value={app.id}>
                {app.name} ({app.slug})
              </option>
            ))}
          </select>
        </div>

        {/* Choice 2: Entity */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Database className="w-3.5 h-3.5 text-slate-500" />
            <span>Select Data Model (Entity)</span>
          </label>
          <select
            value={selectedEntityId}
            onChange={(e) => setSelectedEntityId(e.target.value)}
            disabled={!selectedAppId}
            className="w-full px-4 py-3 bg-slate-950 border border-slate-800 focus:border-slate-700 focus:outline-none rounded-xl text-white text-xs uppercase disabled:opacity-30"
          >
            <option value="">-- Choose Target Object --</option>
            {filteredEntities.map((ent) => (
              <option key={ent.id} value={ent.id}>
                {ent.name} ({ent.slug})
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="pt-4 border-t border-slate-800/60 mt-6 flex justify-end">
        <button
          onClick={() => setStartWizard(true)}
          disabled={!selectedAppId || !selectedEntityId}
          className="px-6 py-3 bg-yellow-500 hover:bg-yellow-400 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 font-bold text-xs rounded-xl shadow-md transition-all active:scale-95 flex items-center gap-1.5"
        >
          <span>Launch Importer Wizard</span>
          <ArrowRight className="w-4 h-4 font-bold" />
        </button>
      </div>
    </div>
  );
}

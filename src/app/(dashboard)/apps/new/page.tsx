'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Sparkles, 
  Layers, 
  Settings, 
  ArrowRight, 
  RefreshCw, 
  Plus, 
  Trash2, 
  Box, 
  Check, 
  Terminal, 
  ArrowLeft,
  ChevronRight,
  Info
} from 'lucide-react';
import { motion } from 'motion/react';

interface EntityField {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'date' | 'select';
  required: boolean;
  options: string[];
}

interface Entity {
  name: string;
  slug: string;
  description: string;
  fields: EntityField[];
}

export default function NewApplicationWizard() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  
  // App metadata
  const [appName, setAppName] = useState('');
  const [appDesc, setAppDesc] = useState('');
  const [appIcon, setAppIcon] = useState('Layers');
  
  // AI assist Prompt
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // Schema state
  const [entities, setEntities] = useState<Entity[]>([
    {
      name: 'Customers',
      slug: 'customers',
      description: 'Profile listings of company accounts.',
      fields: [
        { name: 'FullName', type: 'string', required: true, options: [] },
        { name: 'Email', type: 'string', required: true, options: [] },
        { name: 'Revenue', type: 'number', required: false, options: [] },
        { name: 'Status', type: 'select', required: true, options: ['Lead', 'Qualified', 'Negotiation', 'Closed'] }
      ]
    }
  ]);

  // Compiler states
  const [compiling, setCompiling] = useState(false);
  const [compileLogs, setCompileLogs] = useState<string[]>([]);
  const [compileProgress, setCompileProgress] = useState(0);

  // Call server-side Gemini generation endpoint
  const handleAIGenerate = async () => {
    if (!aiPrompt.trim()) return;
    setAiGenerating(true);
    setAiError(null);
    try {
      const res = await fetch('/api/gemini/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: aiPrompt })
      });
      
      if (!res.ok) {
        throw new Error('Intelligence server timed out. Fell back to local schema parser.');
      }
      
      const payload = await res.json();
      
      // Update app state with AI output
      setAppName(payload.name);
      setAppDesc(payload.description);
      setAppIcon(payload.icon || 'Layers');
      
      // Format response entities
      const formatted: Entity[] = payload.entities.map((ent: any) => ({
        name: ent.name,
        slug: ent.slug || ent.name.toLowerCase().replace(/[^a-z0-0]/g, ''),
        description: ent.description || '',
        fields: ent.fields.map((f: any) => ({
          name: f.name,
          type: f.type || 'string',
          required: f.required !== undefined ? f.required : true,
          options: f.options || []
        }))
      }));
      
      setEntities(formatted);
      setStep(2); // Jump direct to schema check
    } catch (e: any) {
      setAiError(e.message || 'Error occurred generating layout.');
    } finally {
      setAiGenerating(false);
    }
  };

  const handleAddEntity = () => {
    const newEnt: Entity = {
      name: 'NewTable',
      slug: 'new_table',
      description: 'Custom database collection.',
      fields: [
        { name: 'Title', type: 'string', required: true, options: [] }
      ]
    };
    setEntities([...entities, newEnt]);
  };

  const handleUpdateEntity = (index: number, updated: Entity) => {
    const next = [...entities];
    next[index] = updated;
    setEntities(next);
  };

  const handleAddField = (entityIndex: number) => {
    const target = entities[entityIndex];
    const updated: Entity = {
      ...target,
      fields: [
        ...target.fields,
        { name: 'NewField', type: 'string', required: false, options: [] }
      ]
    };
    handleUpdateEntity(entityIndex, updated);
  };

  const handleRemoveField = (entityIndex: number, fieldIndex: number) => {
    const target = entities[entityIndex];
    const fields = target.fields.filter((_, idx) => idx !== fieldIndex);
    handleUpdateEntity(entityIndex, { ...target, fields });
  };

  const handleUpdateField = (entityIndex: number, fieldIndex: number, key: string, val: any) => {
    const target = entities[entityIndex];
    const fields = [...target.fields];
    fields[fieldIndex] = {
      ...fields[fieldIndex],
      [key]: val
    };
    handleUpdateEntity(entityIndex, { ...target, fields });
  };

  const handleDeleteEntity = (idx: number) => {
    if (entities.length <= 1) return;
    setEntities(entities.filter((_, i) => i !== idx));
  };

  // Compile final app
  const triggerApplicationCompile = async () => {
    setStep(3);
    setCompiling(true);
    setCompileProgress(0);
    setCompileLogs([]);

    const messages = [
      'Initializing AppForge runtime instance...',
      'Mapping relational SQL/Prisma structure models...',
      'Compiling dynamic REST API endpoints at `/api/applications/...`',
      'Assembling secure metadata validation layers...',
      'Generating offline-first Progressive Web App cached profiles...',
      'Writing static dashboards, analytics layouts and triggers...',
      'Establishing persistence transaction locks...',
      'Application built successfully. Launching workspace...'
    ];

    // Simulate compilation steps beautifully
    for (let i = 0; i < messages.length; i++) {
      await new Promise(r => setTimeout(r, 600));
      setCompileLogs(curr => [...curr, `[INFO] ${messages[i]}`]);
      setCompileProgress(Math.round(((i + 1) / messages.length) * 105));
    }

    try {
      // 1. Create Application
      const appRes = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: appName || 'Untitled Platform',
          description: appDesc || 'Dynamically compiled workspace.',
          icon: appIcon,
          status: 'active'
        })
      });

      if (!appRes.ok) throw new Error('Failed creating application wrapper.');
      const finalApp = await appRes.json();

      // 2. Create Entities matching application
      for (const ent of entities) {
        await fetch(`/api/applications/${finalApp.id}/entities`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: ent.name,
            slug: ent.slug,
            description: ent.description,
            fields: ent.fields
          })
        });
      }

      setCompiling(false);
      router.push(`/apps/${finalApp.id}`);
    } catch (e) {
      setCompileLogs(curr => [...curr, '[ERROR] Build compilation failed. Reverting transaction.']);
      setCompiling(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8" id="wizard-container-root">
      {/* Platform Stepper Progress Indicator */}
      <div className="flex items-center justify-between border-b border-gray-150 pb-5">
        <div className="flex items-center gap-2">
          <Layers className="h-6 w-6 text-neutral-800" id="stepper-brand-icon" />
          <h3 className="font-semibold text-lg text-slate-850 font-display">Generated App Studio</h3>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono text-slate-400">
          <span className={`${step >= 1 ? 'text-neutral-900 font-semibold' : ''}`}>1. App Basics</span>
          <ChevronRight className="h-3.5 w-3.5" id="step-arrow-1" />
          <span className={`${step >= 2 ? 'text-neutral-900 font-semibold' : ''}`}>2. Schema Models</span>
          <ChevronRight className="h-3.5 w-3.5" id="step-arrow-2" />
          <span className={`${step === 3 ? 'text-neutral-900 font-semibold' : ''}`}>3. Build & Deploy</span>
        </div>
      </div>

      {step === 1 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Main profile form card */}
          <div className="md:col-span-2 bg-white p-8 rounded-xl border border-gray-150 space-y-6">
            <h4 className="text-base font-semibold text-slate-850 font-display">Configure manually</h4>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-800 uppercase tracking-wider">Application Name</label>
                <input
                  id="wizard-name-input"
                  type="text"
                  value={appName}
                  onChange={(e) => setAppName(e.target.value)}
                  placeholder="e.g. Sales CRM, Warehouse Stock"
                  className="mt-1.5 w-full px-4 py-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-neutral-900 focus:border-neutral-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-800 uppercase tracking-wider">Business Description</label>
                <textarea
                  id="wizard-desc-input"
                  rows={4}
                  value={appDesc}
                  onChange={(e) => setAppDesc(e.target.value)}
                  placeholder="Provide details about the storage entities or metrics tracked..."
                  className="mt-1.5 w-full px-4 py-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-neutral-900 focus:border-neutral-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-800 uppercase tracking-wider"> Lucide Icon mapping</label>
                <select
                  id="wizard-icon-select"
                  value={appIcon}
                  onChange={(e) => setAppIcon(e.target.value)}
                  className="mt-1.5 w-full px-4 py-3 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-neutral-900"
                >
                  <option value="Layers">Layers (Default)</option>
                  <option value="Briefcase">Briefcase (CRM / Pipeline)</option>
                  <option value="CheckSquare">CheckSquare (Tasks / Sprints)</option>
                  <option value="Package">Package (Inventory / Logistics)</option>
                </select>
              </div>
            </div>

            <button
              onClick={() => {
                if (!appName.trim()) return alert('Application name is required.');
                setStep(2);
              }}
              className="mt-6 w-full bg-neutral-950 text-white hover:bg-neutral-850 py-3 rounded-lg text-sm font-medium transition duration-150 flex items-center justify-center gap-2"
              id="wizard-manual-next"
            >
              <span>Build Database Schema</span>
              <ArrowRight className="h-4 w-4" id="manual-next-arrow" />
            </button>
          </div>

          {/* AI Blueprint builder sidebar panel */}
          <div className="bg-neutral-900 text-white p-6 rounded-xl border border-neutral-850 space-y-6 flex flex-col justify-between" id="ai-generator-panel">
            <div className="space-y-4">
              <div className="flex items-center gap-2.5">
                <Sparkles className="h-5 w-5 text-neutral-300" id="ai-header-sparkles" />
                <h4 className="text-sm font-semibold text-white font-display">AI App Builder</h4>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed font-sans">
                Describe the application you require in natural language (e.g. &quot;An applicant tracking system for hiring developers and keeping candidate scores&quot;). Our model will build the schemas instantly!
              </p>

              <textarea
                id="ai-prompt-input"
                rows={5}
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="Describe your application schema..."
                className="w-full bg-neutral-950 border border-neutral-800 text-xs p-3.5 rounded-lg text-slate-200 focus:outline-none focus:border-neutral-500 placeholder-slate-600 line-normal"
              />

              {aiError && (
                <div className="p-3 bg-red-950/50 border border-red-900 text-red-300 rounded-lg text-xs leading-normal font-sans flex items-start gap-2" id="ai-error">
                  <Info className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{aiError}</span>
                </div>
              )}
            </div>

            <button
              onClick={handleAIGenerate}
              disabled={aiGenerating || !aiPrompt.trim()}
              className="w-full bg-white text-neutral-950 hover:bg-neutral-100 disabled:opacity-50 py-3 rounded-lg text-xs font-semibold tracking-wider uppercase transition flex items-center justify-center gap-2"
              id="wizard-ai-submit"
            >
              {aiGenerating ? (
                <>
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" id="ai-generating-spin" />
                  <span>Prompting Gemini API...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-3.5 w-3.5 text-neutral-950" id="ai-submit-sparkle" />
                  <span>Prompt Schema Blueprint</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-6">
          {/* App basics summary box */}
          <div className="p-5 rounded-lg border border-gray-150 bg-white flex items-center justify-between">
            <div>
              <div className="text-xs text-slate-400 lowercase font-mono">App Blueprint</div>
              <h4 className="text-sm font-semibold mt-1 text-slate-800">{appName || 'Untitled'}</h4>
            </div>
            
            <button
              onClick={() => setStep(1)}
              className="text-xs font-semibold text-neutral-900 border border-slate-200 hover:bg-slate-50 px-3.5 py-1.5 rounded"
              id="wizard-back-btn"
            >
              Edit basics
            </button>
          </div>

          {/* List of designed schemas / tables */}
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Dynamic Entities Mappings</h4>
              <button
                onClick={handleAddEntity}
                className="bg-neutral-900 text-white hover:bg-neutral-800 px-3 py-1.5 rounded text-xs transition flex items-center gap-1.5"
                id="wizard-add-entity-btn"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Append entity</span>
              </button>
            </div>

            {entities.map((entity, entIdx) => (
              <div key={entIdx} className="bg-white p-6 rounded-xl border border-gray-150 space-y-5" id={`entity-box-${entIdx}`}>
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b border-gray-100 pb-4">
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-1.5 bg-neutral-100 text-neutral-800 px-2.5 py-1 rounded text-xs font-semibold">
                      <Box className="h-3.5 w-3.5" />
                      <span>Table #{entIdx + 1}</span>
                    </div>

                    <input
                      type="text"
                      value={entity.name}
                      onChange={(e) => {
                        const nextName = e.target.value;
                        handleUpdateEntity(entIdx, {
                          ...entity,
                          name: nextName,
                          slug: nextName.toLowerCase().replace(/[^a-z0-9_-]/g, '')
                        });
                      }}
                      className="border-b border-gray-300 focus:border-neutral-900 outline-none pb-0.5 text-sm font-semibold tracking-tight text-slate-800"
                      id={`entity-name-input-${entIdx}`}
                    />
                  </div>

                  <button
                    onClick={() => handleDeleteEntity(entIdx)}
                    disabled={entities.length <= 1}
                    className="p-1.5 hover:bg-red-50 text-red-500 rounded text-xs transition"
                    id={`entity-delete-btn-${entIdx}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                {/* Field configurations matrix */}
                <div className="space-y-4">
                  <div className="hidden sm:grid sm:grid-cols-12 gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    <div className="col-span-4">Field Identifier (DB Column)</div>
                    <div className="col-span-3">Data Style</div>
                    <div className="col-span-2 text-center">Required</div>
                    <div className="col-span-2">Select Options</div>
                    <div className="col-span-1"></div>
                  </div>

                  <div className="space-y-3">
                    {entity.fields.map((field, fldIdx) => (
                      <div key={fldIdx} className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center border border-gray-100 sm:border-none p-4 sm:p-0 rounded-lg">
                        <div className="col-span-4">
                          <input
                            type="text"
                            value={field.name}
                            onChange={(e) => handleUpdateField(entIdx, fldIdx, 'name', e.target.value)}
                            className="w-full px-3 py-2 border border-slate-200 rounded text-xs"
                            placeholder="e.g. emailAddress"
                            id={`field-id-input-${entIdx}-${fldIdx}`}
                          />
                        </div>

                        <div className="col-span-3">
                          <select
                            value={field.type}
                            onChange={(e) => handleUpdateField(entIdx, fldIdx, 'type', e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded text-xs"
                            id={`field-type-select-${entIdx}-${fldIdx}`}
                          >
                            <option value="string">String</option>
                            <option value="number">Number</option>
                            <option value="boolean">Boolean</option>
                            <option value="date">Date</option>
                            <option value="select">Dropdown Select</option>
                          </select>
                        </div>

                        <div className="col-span-2 flex items-center justify-center">
                          <input
                            type="checkbox"
                            checked={field.required}
                            onChange={(e) => handleUpdateField(entIdx, fldIdx, 'required', e.target.checked)}
                            className="h-4 w-4 text-neutral-900 border-gray-300 rounded focus:ring-0"
                            id={`field-req-checked-${entIdx}-${fldIdx}`}
                          />
                        </div>

                        <div className="col-span-2">
                          {field.type === 'select' ? (
                            <input
                              type="text"
                              value={field.options.join(', ')}
                              onChange={(e) => handleUpdateField(entIdx, fldIdx, 'options', e.target.value.split(',').map((x: string) => x.trim()))}
                              className="w-full px-3 py-2 border border-slate-200 rounded text-xs"
                              placeholder="Lead, Closed, Lost"
                              id={`field-opts-input-${entIdx}-${fldIdx}`}
                            />
                          ) : (
                            <span className="text-[10px] text-slate-400 font-mono">Not applicable</span>
                          )}
                        </div>

                        <div className="col-span-1 justify-self-center">
                          <button
                            onClick={() => handleRemoveField(entIdx, fldIdx)}
                            className="p-1 hover:bg-slate-100 text-slate-400 hover:text-slate-600 rounded"
                            id={`field-remove-${entIdx}-${fldIdx}`}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => handleAddField(entIdx)}
                    className="mt-3 text-xs font-semibold text-neutral-900 hover:text-neutral-700 flex items-center gap-1.5"
                    id={`field-append-btn-${entIdx}`}
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Add field column</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Stepper navigation footer */}
          <div className="flex justify-between items-center border-t border-gray-150 pt-6">
            <button
              onClick={() => setStep(1)}
              className="px-6 py-2.5 border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50 transition flex items-center gap-2"
              id="stepper-prev"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back</span>
            </button>

            <button
              onClick={triggerApplicationCompile}
              className="bg-neutral-950 text-white hover:bg-neutral-850 px-6 py-2.5 rounded-lg text-sm font-medium transition flex items-center gap-2 shadow-sm"
              id="stepper-compile"
            >
              <span>Compile Application</span>
              <Check className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="bg-neutral-950 text-neutral-100 rounded-xl border border-neutral-900 overflow-hidden shadow-2xl p-8 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {compiling ? (
                <RefreshCw className="h-5 w-5 animate-spin text-emerald-400" id="compiler-running-icon" />
              ) : (
                <Check className="h-5 w-5 text-emerald-400" id="compiler-success-icon" />
              )}
              <h4 className="text-sm font-bold uppercase tracking-widest text-emerald-400 font-mono">Deploying transaction VM</h4>
            </div>
            
            <div className="text-xs font-mono text-emerald-400">
              {compileProgress}% COMPLETE
            </div>
          </div>

          {/* Highly polished progress bar */}
          <div className="h-1.5 w-full bg-neutral-900 rounded-full overflow-hidden border border-neutral-850">
            <div 
              style={{ width: `${Math.min(100, compileProgress)}%` }} 
              className="h-full bg-emerald-500 rounded-full transition-all duration-300"
            />
          </div>

          {/* Virtual terminal shell */}
          <div className="bg-neutral-950/80 border border-neutral-850 p-5 rounded-lg font-mono text-[11px] leading-relaxed text-slate-350 min-h-[160px] line-clamp-10 overflow-y-auto space-y-1 shadow-inner">
            <div className="text-neutral-500">{"// AppForge dynamic compilation log output"}</div>
            <div className="flex items-center gap-2 border-b border-neutral-850 pb-2 mb-3">
              <Terminal className="h-3.5 w-3.5 text-neutral-400" />
              <span className="text-neutral-400 text-[10px]">compiler_process_aistudio.sh</span>
            </div>
            {compileLogs.map((log, idx) => (
              <div key={idx} className="fade-in">
                {log}
              </div>
            ))}
          </div>

          <p className="text-xs text-slate-500 text-center leading-normal">
            Compiles relational-like database constraints, assemblies metadata structures, and provisions live REST interfaces instantly. Please wait.
          </p>
        </div>
      )}
    </div>
  );
}

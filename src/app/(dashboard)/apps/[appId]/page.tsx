'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Box, 
  Settings, 
  Database, 
  Code, 
  Upload, 
  Plus, 
  Trash2, 
  Terminal, 
  Copy, 
  Check, 
  HelpCircle, 
  Calendar,
  Layers,
  ArrowLeft,
  ChevronRight,
  TrendingUp,
  Cloud,
  FileSpreadsheet,
  FileDown,
  RefreshCw,
  Play
} from 'lucide-react';
import { motion } from 'motion/react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export default function WorkspaceConsole() {
  const router = useRouter();
  const { appId } = useParams();
  
  // App states
  const [app, setApp] = useState<any>(null);
  const [entities, setEntities] = useState<any[]>([]);
  const [selectedEntity, setSelectedEntity] = useState<any>(null);
  const [records, setRecords] = useState<any[]>([]);
  
  // Form input values matching dynamically chosen entity's column types
  const [formData, setFormData] = useState<Record<string, any>>({});
  
  // Tabs: 'records' | 'charts' | 'api'
  const [activeTab, setActiveTab] = useState<'records' | 'charts' | 'api'>('records');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [copiedLink, setCopiedLink] = useState<string | null>(null);

  // CSV Drag and drop references
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [csvStatus, setCsvStatus] = useState<string | null>(null);

  const [apiTesting, setApiTesting] = useState(false);
  const [apiTestOutput, setApiTestOutput] = useState<string | null>(null);

  const loadWorkspace = React.useCallback(async () => {
    try {
      // 1. Fetch application profile
      const appRes = await fetch(`/api/applications/${appId}`);
      if (!appRes.ok) {
        router.push('/dashboard');
        return;
      }
      const appData = await appRes.json();
      setApp(appData);

      // 2. Fetch all entity schemas
      const entitiesRes = await fetch(`/api/applications/${appId}/entities`);
      if (entitiesRes.ok) {
        const payload = await entitiesRes.json();
        const entitiesData = payload.data || payload;
        setEntities(entitiesData);
        if (entitiesData.length > 0) {
          setSelectedEntity(entitiesData[0]);
        }
      }
    } catch (e) {
      console.error('Error loading AppForge workspace blueprint', e);
    } finally {
      setLoading(false);
    }
  }, [appId, router]);

  useEffect(() => {
    loadWorkspace();
  }, [loadWorkspace]);

  // Fetch records whenever selected entity is adjusted
  useEffect(() => {
    if (!selectedEntity) return;

    const loadRecords = async () => {
      try {
        const res = await fetch(`/api/applications/${appId}/entities/${selectedEntity.slug}/records`);
        if (res.ok) {
          const recordsData = await res.json();
          setRecords(recordsData.data || recordsData);
        }
      } catch (e) {
        console.error('Error fetching records', e);
      }
    };
    
    loadRecords();
    
    // Clear dynamic inputs matching default field schemas
    const defaultData: Record<string, any> = {};
    selectedEntity.fields.forEach((field: any) => {
      if (field.type === 'boolean') {
        defaultData[field.name] = false;
      } else {
        defaultData[field.name] = '';
      }
    });
    setFormData(defaultData);
    setCsvStatus(null);
  }, [selectedEntity, appId]);

  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedLink(id);
    setTimeout(() => setCopiedLink(null), 2000);
  };

  // Dynamically record insert
  const handleInsertRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEntity) return;
    setSubmitting(true);

    try {
      const res = await fetch(`/api/applications/${appId}/entities/${selectedEntity.id}/records`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: formData })
      });

      if (res.ok) {
        const addedResponse = await res.json();
        const added = addedResponse.data || addedResponse;
        setRecords([added, ...records]);
        
        // Reset dynamic fields
        const resetDict: Record<string, any> = {};
        selectedEntity.fields.forEach((field: any) => {
          if (field.type === 'boolean') {
            resetDict[field.name] = false;
          } else {
            resetDict[field.name] = '';
          }
        });
        setFormData(resetDict);
      } else {
        const errPayload = await res.json();
        alert(errPayload.error || 'Validation mismatch.');
      }
    } catch (err) {
      console.error('Error submitting records', err);
    } finally {
      setSubmitting(false);
    }
  };

  // CSV Drag and Drop Parsers
  const handleCSVUpload = async (file: File) => {
    if (!selectedEntity) return;
    setCsvStatus('Parsing template rows...');
    
    try {
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());
      if (lines.length < 2) {
        setCsvStatus('Error: Template must contain a header and at least 1 record row.');
        return;
      }

      // Read standard headers
      const rawHeaders = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
      
      // Match file headers and entity fields
      const matchedFields = selectedEntity.fields.map((f: any) => f.name.toLowerCase());
      
      const parsedRows = lines.slice(1).map(line => {
        const columns = line.split(',').map(col => col.trim().replace(/^"|"$/g, ''));
        const dataObj: Record<string, any> = {};
        
        selectedEntity.fields.forEach((field: any) => {
          // Identify cell index matching design
          const idx = rawHeaders.findIndex(header => header.toLowerCase() === field.name.toLowerCase());
          if (idx !== -1 && columns[idx] !== undefined) {
            let val: any = columns[idx];
            if (field.type === 'number') val = Number(val) || 0;
            if (field.type === 'boolean') val = val.toLowerCase() === 'true' || val === '1';
            dataObj[field.name] = val;
          } else {
            dataObj[field.name] = field.type === 'boolean' ? false : '';
          }
        });
        return dataObj;
      });

      setCsvStatus(`Uploading ${parsedRows.length} parsed records onto dynamic store...`);
      
      let successCount = 0;
      for (const row of parsedRows) {
        const res = await fetch(`/api/applications/${appId}/entities/${selectedEntity.id}/records`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ data: row })
        });
        if (res.ok) successCount++;
      }

      setCsvStatus(`Successfully compiled & imported ${successCount} record rows!`);
      // Reload records live
      const reloadRes = await fetch(`/api/applications/${appId}/entities/${selectedEntity.slug}/records`);
      if (reloadRes.ok) {
        const payload = await reloadRes.json();
        setRecords(payload.data || payload);
      }
    } catch (e) {
      setCsvStatus('Error: Failed to safely parse uploaded CSV file.');
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleCSVUpload(e.dataTransfer.files[0]);
    }
  };

  const triggerCsvBrowse = () => {
    fileInputRef.current?.click();
  };

  // Sample CSV Downloader matching targeted fields layout
  const handleDownloadCsvTemplate = () => {
    if (!selectedEntity) return;
    const headerRow = selectedEntity.fields.map((f: any) => f.name).join(',');
    
    const sampleRow = selectedEntity.fields.map((f: any) => {
      if (f.type === 'number') return '150';
      if (f.type === 'boolean') return 'true';
      if (f.type === 'date') return '2026-05-30';
      if (f.type === 'select') return f.options[0] || 'Option';
      return 'Simple value';
    }).join(',');

    const csvContent = "data:text/csv;charset=utf-8," + [headerRow, sampleRow].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${selectedEntity.slug}_upload_template.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Compile Dynamic Data Visualizers
  const compileChartStats = () => {
    if (!selectedEntity || records.length === 0) return [];
    
    // Check if numeric metric exists
    const numericField = selectedEntity.fields.find((f: any) => f.type === 'number');
    const labelField = selectedEntity.fields.find((f: any) => f.type === 'string') || selectedEntity.fields[0];
    
    if (numericField) {
      return records.slice(0, 12).map(r => ({
        label: r.data[labelField.name] || 'N/A',
        value: Number(r.data[numericField.name]) || 0
      }));
    }

    // Fallback: Aggregate occurrences of select fields
    const selectField = selectedEntity.fields.find((f: any) => f.type === 'select');
    if (selectField) {
      const counts: Record<string, number> = {};
      records.forEach(r => {
        const val = r.data[selectField.name] || 'Other';
        counts[val] = (counts[val] || 0) + 1;
      });
      return Object.entries(counts).map(([label, value]) => ({ label, value }));
    }

    // Default to plain record indices
    return records.slice(0, 8).map((r, i) => ({
      label: `Record #${i+1}`,
      value: 1
    }));
  };

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-slate-400">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-slate-300 border-t-slate-800" />
        <span className="mt-4 text-xs font-mono">Opening AppForge runtime workspace...</span>
      </div>
    );
  }

  const chartData = compileChartStats();
  const primaryNumberField = selectedEntity?.fields.find((f: any) => f.type === 'number');

  return (
    <div className="space-y-8" id="application-workspace-root">
      {/* Workspace Header Panel */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-xl border border-gray-150">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="p-2 border border-slate-200 hover:bg-slate-50 text-slate-600 hover:text-slate-900 rounded-lg transition">
            <ArrowLeft className="h-4 w-4" id="backto-hub-icon" />
          </Link>
          <div>
            <h2 className="text-xl font-semibold tracking-tight text-slate-850 font-display">{app?.name}</h2>
            <p className="text-xs text-slate-500 mt-0.5 leading-relaxed font-sans">{app?.description}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono">
          <span className="px-2 py-1 bg-neutral-900 text-white rounded text-[10px] font-bold">LIVE API</span>
          <span className="text-slate-400">Environment: Sandbox</span>
        </div>
      </div>

      {/* Primary Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Entity Navigator Column */}
        <div className="space-y-4 lg:col-span-1">
          <div className="px-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Operational Databases
          </div>
          
          <nav className="space-y-1">
            {entities.map((ent) => {
              const isSelected = selectedEntity?.id === ent.id;
              return (
                <button
                  key={ent.id}
                  onClick={() => setSelectedEntity(ent)}
                  className={`w-full text-left px-4 py-3 rounded-lg text-xs transition duration-150 flex items-center justify-between ${
                    isSelected 
                      ? 'bg-neutral-900 text-white font-semibold' 
                      : 'bg-white hover:bg-slate-50 text-slate-700 border border-gray-150 shadow-sm'
                  }`}
                  id={`entity-selector-tab-${ent.slug}`}
                >
                  <div className="flex items-center gap-2">
                    <Database className={`h-3.5 w-3.5 ${isSelected ? 'text-white' : 'text-slate-400'}`} />
                    <span className="truncate">{ent.name}</span>
                  </div>
                  <ChevronRight className="h-3.5 w-3.5 opacity-60" />
                </button>
              );
            })}
          </nav>
        </div>

        {/* Dynamic Workspace Workspace */}
        <div className="lg:col-span-3 space-y-6">
          {/* Section view controllers */}
          <div className="flex border-b border-gray-200 pb-px gap-6 text-sm" id="view-tabs-row">
            <button
              onClick={() => setActiveTab('records')}
              className={`pb-3 font-semibold transition ${
                activeTab === 'records' ? 'border-b-2 border-neutral-900 text-neutral-900' : 'text-slate-400 hover:text-slate-600'
              }`}
              id="tab-records-btn"
            >
              Master Records ({records.length})
            </button>
            <button
              onClick={() => setActiveTab('charts')}
              className={`pb-3 font-semibold transition ${
                activeTab === 'charts' ? 'border-b-2 border-neutral-900 text-neutral-900' : 'text-slate-400 hover:text-slate-600'
              }`}
              id="tab-charts-btn"
            >
              Dynamic Visualizers
            </button>
            <button
              onClick={() => setActiveTab('api')}
              className={`pb-3 font-semibold transition ${
                activeTab === 'api' ? 'border-b-2 border-neutral-900 text-neutral-900' : 'text-slate-400 hover:text-slate-600'
              }`}
              id="tab-api-btn"
            >
              Developer API Access
            </button>
          </div>

          {activeTab === 'records' && (
            <div className="space-y-8 animate-fade-in">
              {/* Dynamic schema input form */}
              {selectedEntity && (
                <div className="bg-white p-6 rounded-xl border border-gray-150 space-y-4">
                  <div className="flex items-center gap-2">
                    <Plus className="h-4 w-4 text-neutral-800" />
                    <h3 className="font-semibold text-xs uppercase tracking-wider text-slate-800">Insert record into {selectedEntity.name}</h3>
                  </div>

                  <form onSubmit={handleInsertRecord} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedEntity.fields.map((field: any) => (
                      <div key={field.name} className="space-y-1.5">
                        <label className="block text-xs font-semibold text-neutral-700 tracking-wide">
                          {field.name} {field.required && <span className="text-red-500">*</span>}
                        </label>

                        {field.type === 'select' ? (
                          <select
                            value={formData[field.name] || ''}
                            onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                            required={field.required}
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-neutral-900"
                            id={`form-input-${field.name}`}
                          >
                            <option value="">Choose option</option>
                            {field.options?.map((opt: string) => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                        ) : field.type === 'boolean' ? (
                          <div className="flex items-center gap-2 py-2">
                            <input
                              type="checkbox"
                              checked={!!formData[field.name]}
                              onChange={(e) => setFormData({ ...formData, [field.name]: e.target.checked })}
                              className="h-4 w-4 text-neutral-900 border-gray-300 rounded focus:ring-0"
                              id={`form-input-${field.name}`}
                            />
                            <span className="text-xs text-slate-500">True / Enabled</span>
                          </div>
                        ) : (
                          <input
                            type={field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : 'text'}
                            value={formData[field.name] || ''}
                            onChange={(e) => setFormData({ ...formData, [field.name]: e.target.type === 'number' ? Number(e.target.value) || '' : e.target.value })}
                            required={field.required}
                            className="w-full px-3 py-2 border border-slate-200 rounded text-xs focus:outline-none focus:ring-1 focus:ring-neutral-900"
                            placeholder={field.type === 'number' ? '0' : `Enter ${field.name}`}
                            id={`form-input-${field.name}`}
                          />
                        )}
                      </div>
                    ))}

                    <div className="col-span-1 md:col-span-2 pt-2">
                      <button
                        type="submit"
                        disabled={submitting}
                        className="bg-neutral-950 text-white hover:bg-neutral-850 px-4 py-2.5 rounded text-xs font-semibold tracking-wider uppercase transition flex items-center gap-2"
                        id="form-submit-record-btn"
                      >
                        {submitting ? (
                          <>
                            <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                            <span>Inserting...</span>
                          </>
                        ) : (
                          <span>Insert Row</span>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Dynamic Database Table View */}
              <div className="bg-white rounded-xl border border-gray-150 overflow-hidden shadow-sm">
                <div className="px-6 py-4.5 bg-slate-50/80 border-b border-gray-150 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <Database className="h-4.5 w-4.5 text-neutral-850" />
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-800">Dynamic Storage Viewer</span>
                  </div>

                  {/* CSV Template and Import controls */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleDownloadCsvTemplate}
                      className="text-xs text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 px-3 py-1.5 rounded flex items-center gap-1.5 transition"
                      title="Download template columns for CSV bulk import"
                      id="download-csv-tpl-btn"
                    >
                      <FileDown className="h-3.5 w-3.5" />
                      <span>Download Template</span>
                    </button>
                  </div>
                </div>

                {/* CSV Importer Drop Zone */}
                <div 
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  onClick={triggerCsvBrowse}
                  className={`border-2 border-dashed m-6 p-6 rounded-lg text-center cursor-pointer transition ${
                    dragActive 
                      ? 'border-neutral-900 bg-neutral-50' 
                      : 'border-slate-200 hover:border-slate-400 bg-slate-50/30'
                  }`}
                  id="csv-drag-drop-zone"
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={(e) => e.target.files?.[0] && handleCSVUpload(e.target.files[0])}
                    className="hidden"
                    accept=".csv"
                  />
                  <Upload className="h-6 w-6 text-slate-400 mx-auto" />
                  <p className="mt-2 text-xs font-semibold text-slate-700">Drag & drop your CSV file here, or click to browse</p>
                  <p className="text-[10px] text-slate-400 mt-1">Make sure headers match the designed dynamic identifiers exactly</p>
                  {csvStatus && (
                    <div className="mt-3 text-xs font-semibold text-neutral-800 bg-neutral-100 py-1.5 px-3 rounded inline-block" id="csv-status-box">
                      {csvStatus}
                    </div>
                  )}
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 text-slate-500 border-b border-gray-100">
                        <th className="px-6 py-3 font-semibold uppercase tracking-wider">Record ID</th>
                        {selectedEntity?.fields.map((field: any) => (
                          <th key={field.name} className="px-6 py-3 font-semibold uppercase tracking-wider">
                            {field.name}
                          </th>
                        ))}
                        <th className="px-6 py-3 font-semibold uppercase tracking-wider text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {records.length === 0 ? (
                        <tr>
                          <td colSpan={(selectedEntity?.fields.length || 0) + 1} className="text-center py-10 text-slate-400 text-xs">
                            Empty dynamic store. Insert data using the form above grid or import bulk rows with CSV.
                          </td>
                        </tr>
                      ) : (
                        records.map((record) => (
                          <tr key={record.id} className="hover:bg-slate-50/30">
                            <td className="px-6 py-3 font-mono text-[10px] text-slate-400 whitespace-nowrap">
                              {record.id.slice(0, 8)}...
                            </td>
                            {selectedEntity.fields.map((field: any) => {
                              const val = record.data[field.name];
                              return (
                                <td key={field.name} className="px-6 py-3 whitespace-nowrap">
                                  {field.type === 'boolean' ? (
                                    <span className={`px-1.5 py-0.5 rounded text-[10px] uppercase font-bold text-slate-700 bg-slate-100`}>
                                      {val ? 'TRUE' : 'FALSE'}
                                    </span>
                                  ) : field.type === 'date' && val ? (
                                    <div className="flex items-center gap-1.5 text-slate-650">
                                      <Calendar className="h-3 w-3 text-slate-400" />
                                      <span>{new Date(val).toLocaleDateString()}</span>
                                    </div>
                                  ) : (
                                    <span className="text-slate-800 font-sans">{String(val !== undefined ? val : '')}</span>
                                  )}
                                </td>
                              );
                            })}
                            <td className="px-6 py-3 whitespace-nowrap text-right">
                              <button
                                onClick={async () => {
                                  // Simplistic quick-edit using prompt
                                  const field = selectedEntity.fields[0];
                                  if (!field) return;
                                  const newVal = prompt(`Edit first field (${field.name}):`, String(record.data[field.name] || ''));
                                  if (newVal === null) return;
                                  try {
                                    const res = await fetch(`/api/applications/${appId}/entities/${selectedEntity.id}/records/${record.id}`, {
                                      method: 'PUT',
                                      headers: { 'Content-Type': 'application/json' },
                                      body: JSON.stringify({ data: { ...record.data, [field.name]: newVal }})
                                    });
                                    if (res.ok) {
                                      const reloadRes = await fetch(`/api/applications/${appId}/entities/${selectedEntity.slug}/records`);
                                      if (reloadRes.ok) {
                                        const payload = await reloadRes.json();
                                        setRecords(payload.data || payload);
                                      }
                                    }
                                  } catch(e) {}
                                }}
                                className="p-1 text-yellow-500 hover:text-yellow-600 font-medium text-xs mr-2"
                              >
                                Edit
                              </button>
                              <button
                                onClick={async () => {
                                  if(!confirm('Delete this record?')) return;
                                  try {
                                    const res = await fetch(`/api/applications/${appId}/entities/${selectedEntity.id}/records/${record.id}`, {
                                      method: 'DELETE'
                                    });
                                    if (res.ok) {
                                      setRecords(records.filter(r => r.id !== record.id));
                                    }
                                  } catch(e) {}
                                }}
                                className="p-1 text-red-500 hover:text-red-600 font-medium text-xs"
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'charts' && (
            <div className="space-y-6 animate-fade-in" id="visualizers-workspace-panel">
              <div className="bg-white p-6 rounded-xl border border-gray-150">
                <div className="flex items-center gap-2 mb-6">
                  <TrendingUp className="h-5 w-5 text-neutral-800" />
                  <h3 className="font-semibold text-sm text-slate-850 font-display">Instant Relational Metrics</h3>
                </div>

                {chartData.length === 0 ? (
                  <div className="py-20 text-center text-slate-400 text-xs">
                    Please insert record rows containing numeric values or selectable options to compile a metrics graph.
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="h-72 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} />
                          <XAxis dataKey="label" fontSize={11} stroke="#888888" />
                          <YAxis fontSize={11} stroke="#888888" />
                          <Tooltip contentStyle={{ background: '#1c1c1c', border: 'none', borderRadius: '6px', color: '#fff', fontSize: '11px' }} />
                          <Bar dataKey="value" fill="#18181b" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="p-4 bg-slate-50 border border-slate-150 rounded-lg text-xs leading-normal font-sans">
                      <strong>Automatic Mappings:</strong> AppForge dynamically evaluated {selectedEntity.name} schema. 
                      {primaryNumberField ? (
                        <> Mapped the numeric column <strong>{primaryNumberField.name}</strong> as primary metric histogram.</>
                      ) : (
                        <> Found no explicit numeric metrics. Successfully generated comparative frequency distribution histogram of selectable values.</>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'api' && (
            <div className="space-y-6 animate-fade-in" id="api-workspace-panel">
              <div className="bg-neutral-950 text-slate-100 rounded-xl border border-neutral-900 p-6 space-y-6">
                <div>
                  <h3 className="text-base font-semibold text-emerald-400 font-mono flex items-center gap-2">
                    <Code className="h-4.5 w-4.5" />
                    <span>REST API Explorer</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    AppForge mounts real REST interfaces for every dynamic entity instantly. These endpoints accept and return fully formatted JSON objects matching your compiled metadata design.
                  </p>
                </div>

                {selectedEntity && (
                  <div className="space-y-5">
                    {/* GET/POST Endpoint definition */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-mono text-emerald-400 font-bold uppercase tracking-wider">Format: GET Records</span>
                        <button
                          onClick={() => handleCopyText(`curl -X GET "http://localhost:3000/api/applications/${appId}/entities/${selectedEntity.slug}/records"`, 'get-api')}
                          className="flex items-center gap-1.5 text-neutral-400 hover:text-white transition"
                        >
                          {copiedLink === 'get-api' ? (
                            <>
                              <Check className="h-3 w-3 text-emerald-400" />
                              <span className="text-[10px] text-emerald-400">Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="h-3 w-3" />
                              <span className="text-[10px]">Copy curl</span>
                            </>
                          )}
                        </button>
                      </div>

                      <div className="p-3.5 bg-neutral-900 border border-neutral-850 rounded-lg text-[11px] font-mono whitespace-nowrap overflow-x-auto text-slate-300">
                        <span className="text-emerald-400 font-bold mr-2">GET</span>
                        /api/applications/{appId}/entities/{selectedEntity.slug}/records
                      </div>

                      <div className="pt-2">
                        <button
                          onClick={async () => {
                            setApiTesting(true);
                            setApiTestOutput(null);
                            try {
                              const res = await fetch(`/api/applications/${appId}/entities/${selectedEntity.slug}/records`);
                              const data = await res.json();
                              setApiTestOutput(JSON.stringify(data, null, 2));
                            } catch (e: any) {
                              setApiTestOutput(e.message || 'Error executing request');
                            } finally {
                              setApiTesting(false);
                            }
                          }}
                          disabled={apiTesting}
                          className="bg-emerald-950 text-emerald-400 border border-emerald-900 hover:bg-emerald-900 px-3 py-1.5 rounded text-xs transition flex items-center gap-1.5"
                        >
                          {apiTesting ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5" />}
                          <span>Test GET Endpoint</span>
                        </button>
                        
                        {apiTestOutput && (
                          <div className="mt-3 p-4 bg-neutral-900 border border-neutral-850 rounded-lg text-[10px] font-mono text-emerald-300 leading-relaxed overflow-x-auto max-h-64 overflow-y-auto">
                            <pre>{apiTestOutput}</pre>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* POST Records definition */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-mono text-emerald-400 font-bold uppercase tracking-wider">Format: POST Insert Link</span>
                        <button
                          onClick={() => handleCopyText(`curl -X POST "http://localhost:3000/api/applications/${appId}/entities/${selectedEntity.id}/records" -H "Content-Type: application/json" -d '{"data": {}}'`, 'post-api')}
                          className="flex items-center gap-1.5 text-neutral-400 hover:text-white transition"
                        >
                          {copiedLink === 'post-api' ? (
                            <>
                              <Check className="h-3 w-3 text-emerald-400" />
                              <span className="text-[10px] text-emerald-400">Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="h-3 w-3" />
                              <span className="text-[10px]">Copy curl</span>
                            </>
                          )}
                        </button>
                      </div>

                      <div className="p-3.5 bg-neutral-900 border border-neutral-850 rounded-lg text-[11px] font-mono whitespace-nowrap overflow-x-auto text-slate-300">
                        <span className="text-blue-400 font-bold mr-2">POST</span>
                        /api/applications/{appId}/entities/{selectedEntity.id}/records
                      </div>
                    </div>

                    {/* Dynamic response template */}
                    <div className="space-y-3 pt-2">
                      <div className="text-xs font-mono font-bold uppercase text-slate-400">Expected Body Blueprint</div>
                      <div className="p-4 bg-neutral-900 border border-neutral-850 rounded-lg text-[10px] font-mono text-emerald-300 leading-relaxed overflow-x-auto">
                        <pre>{JSON.stringify({
                          data: selectedEntity.fields.reduce((acc: any, f: any) => {
                            acc[f.name] = f.type === 'number' ? 0 : f.type === 'boolean' ? false: f.type === 'date' ? '2026-05-30' : 'Value';
                            return acc;
                          }, {})
                        }, null, 2)}</pre>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

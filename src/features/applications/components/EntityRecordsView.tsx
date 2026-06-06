'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft, Plus, Table, Database, Calendar, Server, 
  Settings, X, Sparkles, AlertCircle, FilePlus
} from 'lucide-react';
import { DynamicTable } from '@/engines/rendering-engine/views/DynamicTable';
import { DynamicForm } from '@/engines/rendering-engine/views/DynamicForm';
import { ROUTES } from '@/shared/constants/routes';

interface EntityRecordsViewProps {
  app: any;
  entity: any;
  initialFields: any[];
  initialRecords: any[];
}

export function EntityRecordsView({ app, entity, initialFields, initialRecords }: EntityRecordsViewProps) {
  const [fields, setFields] = useState<any[]>(initialFields);
  const [records, setRecords] = useState<any[]>(initialRecords);
  const [error, setError] = useState<string | null>(null);

  // View state toggles
  const [showAddRecord, setShowAddRecord] = useState(false);
  const [editingRecord, setEditingRecord] = useState<any>(null);
  const [showAddField, setShowAddField] = useState(false);
  const [loading, setLoading] = useState(false);

  // New Field states
  const [fieldName, setFieldName] = useState('');
  const [fieldLabel, setFieldLabel] = useState('');
  const [fieldType, setFieldType] = useState('TEXT');
  const [fieldPlaceholder, setFieldPlaceholder] = useState('');
  const [fieldRequired, setFieldRequired] = useState(false);

  const fetchLatestSchemaAndRecords = async () => {
    try {
      const recordsRes = await fetch(`/api/applications/${app.id}/entities/${entity.id}/records`);
      const recordsResult = await recordsRes.json();
      if (recordsRes.ok && recordsResult.success) {
        setRecords(recordsResult.data);
      }

      const entityRes = await fetch(`/api/applications/${app.id}/entities`);
      const entityResult = await entityRes.json();
      if (entityRes.ok && entityResult.success) {
        // Find current entity fields
        const curr = entityResult.data.find((e: any) => e.id === entity.id);
        if (curr && curr.fields) {
          setFields(curr.fields);
        }
      }
    } catch (err) {
      console.error('Failed refreshing schema:', err);
    }
  };

  const handleAddField = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fieldName || !fieldLabel) {
      return setError('Programmatic Name and Label are required');
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/applications/${app.id}/entities/${entity.id}/fields`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: fieldName,
          label: fieldLabel,
          type: fieldType,
          isRequired: fieldRequired,
          placeholder: fieldPlaceholder,
        }),
      });

      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.error || 'Failed to inject field');
      }

      setFieldName('');
      setFieldLabel('');
      setFieldPlaceholder('');
      setFieldRequired(false);
      setShowAddField(false);

      await fetchLatestSchemaAndRecords();
    } catch (err: any) {
      setError(err?.message || 'Error occurred while creating field');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRecord = async (formData: any) => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/applications/${app.id}/entities/${entity.id}/records`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data: formData }),
      });

      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.error || 'Failed to insert row');
      }

      setShowAddRecord(false);
      await fetchLatestSchemaAndRecords();
    } catch (err: any) {
      setError(err?.message || 'Error occurred while inserting record');
    } finally {
      setLoading(false);
    }
  };

  const handleEditRecordSubmit = async (formData: any) => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/applications/${app.id}/entities/${entity.id}/records/${editingRecord.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data: formData }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Failed to update record');

      setEditingRecord(null);
      await fetchLatestSchemaAndRecords();
    } catch (err: any) {
      setError(err?.message || 'Error occurred while updating record');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRecord = async (record: any) => {
    if (!confirm('Are you sure you want to delete this record?')) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/applications/${app.id}/entities/${entity.id}/records/${record.id}`, {
        method: 'DELETE',
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || 'Failed to delete record');

      await fetchLatestSchemaAndRecords();
    } catch (err: any) {
      setError(err?.message || 'Error occurred while deleting record');
    } finally {
      setLoading(false);
    }
  };

  // Build compatibility structure for rendering engine
  const engineEntitySpec = {
    id: entity.id,
    name: entity.name,
    pluralName: entity.pluralName,
    slug: entity.slug,
    displayField: entity.displayField || 'name',
    fields: fields.map((f) => ({
      id: f.id,
      name: f.name,
      label: f.label,
      type: f.type,
      isRequired: !!f.isRequired,
      isReadOnly: !!f.isReadOnly,
      isUnique: !!f.isUnique,
      placeholder: f.placeholder,
      helpText: f.helpText,
      prefix: f.prefix,
      suffix: f.suffix,
      isHiddenInList: !!f.isHiddenInList,
      isHiddenInForm: !!f.isHiddenInForm,
      orderIndex: f.orderIndex,
      columnWidth: f.columnWidth,
    })),
  };

  // Feed flat record payloads into DynamicTable
  const flatRecordsList = records.map((r) => ({
    id: r.id,
    ...(r.data as Record<string, any>),
    createdAt: r.createdAt,
  }));

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Breadcrumb / Back Navigation */}
      <div>
        <Link 
          href={ROUTES.APPS.DETAIL(app.id)}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-white transition-all group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
          <span>Back to {app.name}</span>
        </Link>
      </div>

      {/* Database Entity Stats Header */}
      <div className="p-8 rounded-3xl bg-slate-900/20 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 flex items-center justify-center text-xl shrink-0 shadow-inner">
            <Table className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-extrabold text-white">{entity.pluralName}</h1>
              <span className="text-[10px] font-mono uppercase bg-slate-800 text-slate-400 border border-slate-700 px-2 py-0.5 rounded-full">
                EAV Engine
              </span>
            </div>
            <p className="text-xs text-slate-400 max-w-xl">
              {entity.description || `Manage and interact with ${entity.pluralName.toLowerCase()} schema structures directly.`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-semibold text-slate-400 border-l md:border-l border-slate-800/80 pl-0 md:pl-6">
          <div>
            <span className="text-lg font-extrabold text-white block">{fields.length}</span>
            <span>Columns</span>
          </div>
          <div>
            <span className="text-lg font-extrabold text-white block">{flatRecordsList.length}</span>
            <span>Rows</span>
          </div>
        </div>
      </div>

      {/* Inline controls Panel */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <h2 className="text-sm font-extrabold text-slate-400 uppercase tracking-widest flex items-center gap-2">
          <Database className="w-4 h-4" />
          <span>Schema Database Workspace</span>
        </h2>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              setShowAddField(!showAddField);
              setShowAddRecord(false);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 hover:bg-slate-850 rounded-xl bg-slate-900 border border-slate-800 text-yellow-500 hover:text-yellow-400 text-xs font-bold transition-all active:scale-95 shadow-sm"
          >
            <Settings className="w-4 h-4" />
            <span>Schema Design (+Field)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setShowAddRecord(!showAddRecord);
              setShowAddField(false);
            }}
            className="flex items-center gap-1.5 px-4 py-2 hover:opacity-90 rounded-xl bg-yellow-500 text-slate-950 text-xs font-extrabold transition-all active:scale-95 shadow-md"
          >
            <Plus className="w-4 h-4 font-bold text-slate-950" />
            <span>Add Row Record</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-950/40 text-red-400 border border-red-900/40 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Dropdown forms with animations */}
      <AnimatePresence mode="wait">
        {showAddField && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleAddField}
            className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-4 overflow-hidden"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-extrabold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-yellow-500" />
                <span>Inject Custom Field</span>
              </h3>
              <button 
                type="button" 
                onClick={() => setShowAddField(false)}
                className="text-slate-500 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Programmatic Name (camelCase)
                </label>
                <input
                  type="text"
                  value={fieldName}
                  onChange={(e) => setFieldName(e.target.value.replace(/[^a-zA-Z0-9]/g, ''))}
                  placeholder="e.g. skuNumber, stockValue"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Human Display Label
                </label>
                <input
                  type="text"
                  value={fieldLabel}
                  onChange={(e) => setFieldLabel(e.target.value)}
                  placeholder="e.g. SKU Number, Stock Value"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Field Data Type
                </label>
                <select
                  value={fieldType}
                  onChange={(e) => setFieldType(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs uppercase"
                >
                  <option value="TEXT">Short Text</option>
                  <option value="TEXTAREA">Long Paragraph</option>
                  <option value="NUMBER">Number</option>
                  <option value="CURRENCY">Currency ($)</option>
                  <option value="BOOLEAN">Boolean Toggle</option>
                  <option value="DATE">Simple Date</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Placeholder Text
                </label>
                <input
                  type="text"
                  value={fieldPlaceholder}
                  onChange={(e) => setFieldPlaceholder(e.target.value)}
                  placeholder="e.g. Enter a valid alphanumeric SKU..."
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs"
                />
              </div>

              <div className="flex items-center pt-5">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={fieldRequired}
                    onChange={(e) => setFieldRequired(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-800 bg-slate-950 text-yellow-500 focus:ring-yellow-500"
                  />
                  <span className="text-xs font-bold text-slate-300">Strictly Required Field?</span>
                </label>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2.5 bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-all active:scale-95 disabled:opacity-50"
              >
                {loading ? 'Compiling Schema...' : 'Inject Field Properties'}
              </button>
            </div>
          </motion.form>
        )}

        {showAddRecord && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-4 overflow-hidden"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-extrabold text-white uppercase tracking-wider flex items-center gap-1.5">
                <FilePlus className="w-4 h-4 text-yellow-500" />
                <span>Add Record Row</span>
              </h3>
              <button 
                type="button" 
                onClick={() => setShowAddRecord(false)}
                className="text-slate-500 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <DynamicForm 
              entity={engineEntitySpec as any} 
              onSubmit={handleCreateRecord}
              submitLabel={`Insert into ${entity.pluralName}`}
              isLoading={loading}
              className="bg-transparent"
            />
          </motion.div>
        )}

        {editingRecord && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-4 overflow-hidden"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-extrabold text-white uppercase tracking-wider flex items-center gap-1.5">
                <FilePlus className="w-4 h-4 text-yellow-500" />
                <span>Edit Record</span>
              </h3>
              <button 
                type="button" 
                onClick={() => setEditingRecord(null)}
                className="text-slate-500 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <DynamicForm 
              entity={engineEntitySpec as any} 
              initialData={editingRecord}
              onSubmit={handleEditRecordSubmit}
              submitLabel="Save Changes"
              isLoading={loading}
              className="bg-transparent"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Records Table View */}
      <div className="space-y-4">
        <DynamicTable 
          entity={engineEntitySpec as any} 
          data={flatRecordsList} 
          isLoading={false}
          className="border-slate-850"
          onEdit={(r) => { setEditingRecord(r); setShowAddRecord(false); setShowAddField(false); }}
          onDelete={handleDeleteRecord}
        />
      </div>
    </div>
  );
}

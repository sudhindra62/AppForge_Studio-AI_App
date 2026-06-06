'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { Plus, HelpCircle, X } from 'lucide-react';

interface CreateEntityFormProps {
  appId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function CreateEntityForm({ appId, onSuccess, onCancel }: CreateEntityFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [pluralName, setPluralName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('database');

  // Auto-fill plural and slug as name changes
  useEffect(() => {
    if (name) {
      // Simple pluralization guess
      const plural = name.endsWith('y') ? name.slice(0, -1) + 'ies' : name + 's';
      setPluralName(plural);

      const computedSlug = plural
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
      setSlug(computedSlug);
    } else {
      setPluralName('');
      setSlug('');
    }
  }, [name]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !pluralName || !slug) {
      return setError('Please fill in Name, Plural Name, and Slug.');
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/applications/${appId}/entities`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          pluralName,
          slug,
          description,
          icon,
        }),
      });

      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.error || 'Failed to construct model');
      }

      setName('');
      setPluralName('');
      setSlug('');
      setDescription('');
      
      if (onSuccess) onSuccess();
      router.refresh();
    } catch (err: any) {
      setError(err?.message || 'Failed to create entity.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.form 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit}
      className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-4"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-extrabold text-white flex items-center gap-1.5 uppercase tracking-wider">
          <Plus className="w-4 h-4 text-yellow-500" />
          <span>Add New Data Model</span>
        </h3>
        {onCancel && (
          <button 
            type="button" 
            onClick={onCancel}
            className="text-slate-500 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {error && (
        <div className="p-3 bg-red-950/50 border border-red-900/50 text-red-400 text-xs rounded-xl font-semibold">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
            Singular Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Lead, Ticket, Product"
            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 focus:border-slate-700 focus:outline-none rounded-xl text-white text-xs transition-all"
          />
        </div>

        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
            Plural Name
          </label>
          <input
            type="text"
            value={pluralName}
            onChange={(e) => setPluralName(e.target.value)}
            placeholder="e.g. Leads, Tickets, Products"
            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 focus:border-slate-700 focus:outline-none rounded-xl text-white text-xs transition-all"
          />
        </div>

        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
            Slug Path
          </label>
          <input
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value.toLowerCase())}
            placeholder="e.g. leads"
            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 focus:border-slate-700 focus:outline-none rounded-xl text-white font-mono text-xs transition-all"
          />
        </div>

        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
            Icon Label
          </label>
          <input
            type="text"
            value={icon}
            onChange={(e) => setIcon(e.target.value)}
            placeholder="e.g. database, users, package"
            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 focus:border-slate-700 focus:outline-none rounded-xl text-white text-xs transition-all"
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
            Model Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What does this model store in the metadata context?"
            rows={2}
            className="w-full px-3 py-2 bg-slate-950 border border-slate-800 focus:border-slate-700 focus:outline-none rounded-xl text-white text-xs transition-all resize-none"
          />
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white transition-all"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={loading}
          className="px-5 py-2.5 bg-yellow-500 hover:bg-yellow-400 disabled:opacity-50 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-md active:scale-95 flex items-center gap-1.5"
        >
          {loading ? 'Synthesizing Schema...' : 'Construct Model'}
        </button>
      </div>
    </motion.form>
  );
}

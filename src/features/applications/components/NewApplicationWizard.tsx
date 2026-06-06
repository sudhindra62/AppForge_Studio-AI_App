'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { ROUTES } from '@/shared/constants/routes';
import { 
  ArrowRight, ArrowLeft, Check, Sparkles, 
  ChevronRight, Laptop, Globe, Smartphone, Bell, Eye, EyeOff
} from 'lucide-react';

const COLORS = [
  { name: 'Amber Glow', hex: '#f59e0b' },
  { name: 'Emerald', hex: '#10b981' },
  { name: 'Indigo Light', hex: '#6366f1' },
  { name: 'Rose', hex: '#f43f5e' },
  { name: 'Violet', hex: '#8b5cf6' },
  { name: 'Cyan', hex: '#06b6d4' },
];

const ICONS = [
  { char: '📦', name: 'Inventory' },
  { char: '👥', name: 'CRM' },
  { char: '📈', name: 'Analytics' },
  { char: '🛍️', name: 'Storefront' },
  { char: '⚙️', name: 'Operations' },
  { char: '🏥', name: 'Health' },
  { char: '📚', name: 'Knowledge' },
  { char: '⚡', name: 'Utility' },
];

const MODULE_OPTIONS = [
  { id: 'CSV_IMPORT', name: 'CSV Importer', desc: 'Map, validate, and upload bulk data from sheets', icon: Laptop },
  { id: 'I18N', name: 'Multi-Language (i18n)', desc: 'Generate multilingual routing & dictionaries', icon: Globe },
  { id: 'PWA', name: 'PWA Support', desc: 'Enable home screen installs and service worker caching', icon: Smartphone },
  { id: 'NOTIFICATIONS', name: 'Push Notifications', desc: 'Trigger dynamic event alerts to active users', icon: Bell },
];

export function NewApplicationWizard() {
  const router = useRouter();
  const [step, setStep] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [coverColor, setCoverColor] = useState('#f59e0b');
  const [icon, setIcon] = useState('📦');
  const [enabledModules, setEnabledModules] = useState<string[]>(['CSV_IMPORT', 'NOTIFICATIONS']);

  // Auto-generate slug from name
  useEffect(() => {
    if (step === 1) {
      const draftSlug = name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '') // remove special chars
        .replace(/\s+/g, '-') // convert spaces to hyphens
        .replace(/-+/g, '-'); // collapse multiple hyphens
      setSlug(draftSlug);
    }
  }, [name, step]);

  const handleToggleModule = (moduleId: string) => {
    setEnabledModules((prev) =>
      prev.includes(moduleId)
        ? prev.filter((id) => id !== moduleId)
        : [...prev, moduleId]
    );
  };

  const handleNext = () => {
    if (step === 1) {
      if (!name) return setError('Application name is required');
      if (!slug || !/^[a-z0-9-]+$/.test(slug)) {
        return setError('Slug must be url-safe (lowercase, digits, hyphens)');
      }
    }
    setError(null);
    setStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setError(null);
    setStep((prev) => prev - 1);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(ROUTES.API.APPLICATIONS, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          slug,
          description,
          icon,
          coverColor,
          enabledModules,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to synthesize application');
      }

      router.push('/apps');
      router.refresh();
    } catch (err: any) {
      setError(err?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto rounded-3xl bg-slate-900/30 border border-slate-800 p-8 backdrop-blur-md relative overflow-hidden">
      {/* Glow highlight */}
      <div 
        className="absolute -top-10 -right-10 w-40 h-40 blur-3xl rounded-full opacity-10 transition-colors duration-500 pointer-events-none" 
        style={{ backgroundColor: coverColor }}
      />

      {/* Steps Progress */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2">
          {[1, 2, 3].map((s) => (
            <div 
              key={s}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                s === step 
                  ? 'w-8' 
                  : s < step 
                    ? 'w-4' 
                    : 'w-2'
              }`}
              style={{ backgroundColor: s <= step ? coverColor : '#334155' }}
            />
          ))}
        </div>
        <span className="text-xs font-mono text-slate-500">Step {step} of 3</span>
      </div>

      {error && (
        <motion.div 
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 rounded-xl bg-red-950/40 text-red-400 border border-red-900/50 text-xs font-semibold"
        >
          {error}
        </motion.div>
      )}

      {/* Wizard Steps */}
      <div className="min-h-[300px]">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-yellow-500" />
                  <span>Define Your Application</span>
                </h2>
                <p className="text-xs text-slate-400">
                  Begin by naming your metadata-driven application workspace. Slugs are used for URLs.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Application Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Sales CRM, Inventory Tracker"
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-slate-600 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    URL Slug
                  </label>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-0-]/, ''))}
                    placeholder="sales-crm"
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono text-xs focus:outline-none focus:border-slate-600 transition-colors"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">
                    Lowercase, numbers, and hyphens.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Workspace Description
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe what business objects this application will host..."
                    rows={3}
                    className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:outline-none focus:border-slate-600 transition-colors resize-none"
                  />
                </div>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-xl font-bold text-white mb-2">
                  Style & Identity
                </h2>
                <p className="text-xs text-slate-400">
                  Select a unique icon and theme decoration color for this workspace.
                </p>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                    Choose Icon
                  </label>
                  <div className="grid grid-cols-4 gap-3">
                    {ICONS.map((ic) => (
                      <button
                        key={ic.char}
                        type="button"
                        onClick={() => setIcon(ic.char)}
                        className={`p-4 rounded-xl text-2xl flex flex-col items-center gap-1 border transition-all ${
                          icon === ic.char 
                            ? 'bg-slate-800 border-slate-600 shadow-lg scale-105' 
                            : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <span>{ic.char}</span>
                        <span className="text-[9px] text-slate-500 font-medium">{ic.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                    Cover Theme Color
                  </label>
                  <div className="grid grid-cols-6 gap-3">
                    {COLORS.map((col) => (
                      <button
                        key={col.hex}
                        type="button"
                        onClick={() => setCoverColor(col.hex)}
                        className={`h-10 rounded-xl border flex items-center justify-center transition-all ${
                          coverColor === col.hex 
                            ? 'border-white scale-105 shadow-md' 
                            : 'border-transparent'
                        }`}
                        style={{ backgroundColor: col.hex }}
                        title={col.name}
                      >
                        {coverColor === col.hex && (
                          <Check className="w-4 h-4 text-white drop-shadow-md font-bold" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-xl font-bold text-white mb-2">
                  Enable Functional Modules
                </h2>
                <p className="text-xs text-slate-400">
                  Select key capabilities to weave into your application metadata schema directly.
                </p>
              </div>

              <div className="space-y-4">
                {MODULE_OPTIONS.map((m) => {
                  const IconComponent = m.icon;
                  const isEnabled = enabledModules.includes(m.id);
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => handleToggleModule(m.id)}
                      className={`w-full flex items-start gap-4 p-4 rounded-2xl border text-left transition-all ${
                        isEnabled
                          ? 'bg-slate-800/40'
                          : 'bg-slate-950 hover:bg-slate-900/40'
                      }`}
                      style={{ borderColor: isEnabled ? coverColor : '#1e293b' }}
                    >
                      <div 
                        className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 transition-colors`}
                        style={{ 
                          backgroundColor: isEnabled ? `${coverColor}15` : '#020617',
                          borderColor: isEnabled ? coverColor : '#1e293b',
                          color: isEnabled ? coverColor : '#475569'
                        }}
                      >
                        <IconComponent className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-bold text-white">{m.name}</h4>
                          {isEnabled && (
                            <span 
                              className="text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider text-slate-950"
                              style={{ backgroundColor: coverColor }}
                            >
                              active
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                          {m.desc}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Button controls */}
      <div className="flex items-center justify-between border-t border-slate-800/60 pt-6 mt-8">
        {step > 1 ? (
          <button
            type="button"
            onClick={handleBack}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-extrabold text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Go Back</span>
          </button>
        ) : (
          <div />
        )}

        {step < 3 ? (
          <button
            type="button"
            onClick={handleNext}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-extrabold text-slate-950 hover:opacity-90 transition-all ml-auto"
            style={{ backgroundColor: coverColor }}
          >
            <span>Continue</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading}
            className="flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-extrabold text-slate-950 hover:opacity-90 transition-all ml-auto disabled:opacity-50"
            style={{ backgroundColor: coverColor }}
          >
            {loading ? (
              <span>Synthesizing...</span>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Synthesize App</span>
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}

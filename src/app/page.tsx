'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { Layers, Shield, Zap, RefreshCw, Smartphone, KeyRound, Server } from 'lucide-react';

export default function LandingPage() {
  const router = useRouter();
  const [email, setEmail] = useState('admin@example.com');
  const [password, setPassword] = useState('ForgeAppSecure99!');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        throw new Error('Invalid credentials');
      }
      router.push('/dashboard');
    } catch (error: any) {
      setErrorMsg('An unexpected error occurred. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col md:flex-row font-sans">
      {/* Platform Branding & Highlights Side panel */}
      <div className="flex-1 bg-neutral-900 text-white p-8 md:p-16 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-3">
            <Layers className="h-8 w-8 text-neutral-200" id="brand-logo-icon" />
            <h1 className="text-2xl font-semibold tracking-tight font-display">AppForge Studio</h1>
          </div>
          
          <div className="mt-16 md:mt-24 max-w-lg">
            <h2 className="text-4xl font-normal md:text-5xl tracking-tight leading-tight font-display">
              The metadata engine for <span className="text-neutral-400">enterprise apps.</span>
            </h2>
            <p className="mt-6 text-slate-400 leading-relaxed font-sans text-base">
              Convert raw config and user definitions into secure business applications. 
              Dynamically generates relational-like database schemas, visual charts, instant PWA interfaces, 
              secure auth flows, and import pipelines automatically.
            </p>
          </div>
        </div>

        {/* Bento Grid Platform Capabilities */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-12">
          <div className="p-5 rounded-lg border border-neutral-850 bg-neutral-950/40" id="feature-card-forms">
            <Zap className="h-5 w-5 text-neutral-300" id="zap-icon" />
            <h3 className="text-sm font-medium mt-3 text-slate-200">Instant VM Blueprints</h3>
            <p className="text-xs text-slate-400 mt-1">Converts simple metadata into relational schemas instantly.</p>
          </div>
          <div className="p-5 rounded-lg border border-neutral-850 bg-neutral-950/40" id="feature-card-db">
            <Server className="h-5 w-5 text-neutral-300" id="server-icon" />
            <h3 className="text-sm font-medium mt-3 text-slate-200">Dynamic REST Routing</h3>
            <p className="text-xs text-slate-400 mt-1">Exposes RESTful endpoints `/api/applications/*` on the fly.</p>
          </div>
          <div className="p-5 rounded-lg border border-neutral-850 bg-neutral-950/40" id="feature-card-pwa">
            <Smartphone className="h-5 w-5 text-neutral-300" id="pwa-icon" />
            <h3 className="text-sm font-medium mt-3 text-slate-200">Progressive Web Engine</h3>
            <p className="text-xs text-slate-400 mt-1">Full service-worker offline-first configuration support.</p>
          </div>
          <div className="p-5 rounded-lg border border-neutral-850 bg-neutral-950/40" id="feature-card-sec">
            <Shield className="h-5 w-5 text-neutral-300" id="shield-icon" />
            <h3 className="text-sm font-medium mt-3 text-slate-200">Admin Authentication</h3>
            <p className="text-xs text-slate-400 mt-1">Pre-built admin dashboards out of the box.</p>
          </div>
        </div>

        <div className="mt-12 text-xs text-slate-500">
          Powered by Gemini 3.5 Flash & Next.js App Router.
        </div>
      </div>

      {/* Login / Auth Side */}
      <div className="flex-1 flex items-center justify-center p-8 md:p-16 bg-white">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <h3 className="text-2xl font-medium tracking-tight text-neutral-850 font-display">Sign in to console</h3>
            <p className="text-sm text-slate-500 mt-1">Deploy and monitor custom metadata applications.</p>
          </div>

          {/* Quick Config Alert */}
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 text-amber-900 rounded-lg text-sm" id="presetted-prompt-alert">
            <div className="flex items-center justify-between font-medium">
              <div className="flex items-center gap-2">
                <KeyRound className="h-4 w-4 text-amber-600" id="alert-key-icon" />
                <span>Standard Access Configured</span>
              </div>
              <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-amber-100 text-amber-800 uppercase tracking-wider font-sans">Prefilled</span>
            </div>
            <p className="mt-1.5 text-xs text-amber-800 leading-relaxed">
              We have pre-seeded our repository with test credentials for our judges. Simply click the access button below to sign in of press auto-fill below:
            </p>
            <div className="mt-2.5 text-xs font-mono space-y-1 bg-white/80 p-2.5 rounded border border-amber-150 relative">
              <div>Email: <strong className="text-slate-800 select-all">admin@example.com</strong></div>
              <div>Password: <strong className="text-slate-800 select-all">ForgeAppSecure99!</strong></div>
              <button 
                type="button" 
                onClick={() => { setEmail('admin@example.com'); setPassword('ForgeAppSecure99!'); }}
                className="absolute right-2.5 top-2.5 text-[10px] bg-amber-100 hover:bg-amber-200 px-2 py-0.5 rounded text-amber-900 font-sans font-medium transition cursor-pointer"
              >
                Autofill
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-neutral-800 uppercase tracking-wider">Email Address</label>
              <input
                id="login-email-input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1.5 w-full px-4 py-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-neutral-900 focus:border-neutral-900"
                placeholder="admin@example.com"
              />
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-neutral-800 uppercase tracking-wider">Security Password</label>
              </div>
              <input
                id="login-password-input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="mt-1.5 w-full px-4 py-3 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-neutral-900 focus:border-neutral-900"
                placeholder="••••••••"
              />
            </div>

            {errorMsg && (
              <div className="p-3 bg-red-50 text-red-700 rounded-lg text-xs font-medium border border-red-100" id="login-error-alert">
                {errorMsg}
              </div>
            )}

            <button
              id="login-submit-button"
              type="submit"
              disabled={loading}
              className="w-full bg-neutral-950 text-white rounded-lg py-3 text-sm font-medium hover:bg-neutral-850 transition duration-150 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" id="spin-submit-icon" />
                  <span>Configuring workspace...</span>
                </>
              ) : (
                <span>Access Dashboard</span>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

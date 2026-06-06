import React from 'react';
import Link from 'next/link';

export function RegisterForm() {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-white">Create an account</h1>
        <p className="text-sm text-slate-400 mt-2">Start building powerful applications</p>
      </div>

      <form className="space-y-4">
        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            Name
          </label>
          <input
            name="name"
            type="text"
            required
            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-yellow-500"
            placeholder="John Doe"
          />
        </div>

        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            Email address
          </label>
          <input
            name="email"
            type="email"
            required
            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-yellow-500"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            Password
          </label>
          <input
            name="password"
            type="password"
            required
            className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-yellow-500"
            placeholder="••••••••"
          />
        </div>

        <button
          type="button"
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-slate-900 bg-yellow-500 hover:bg-yellow-400 transition-colors cursor-not-allowed"
        >
          Sign up (Disabled in Demo)
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-slate-400">
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-yellow-500 hover:text-yellow-400">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

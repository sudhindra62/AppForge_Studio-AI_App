import React, { useState } from 'react';
import { Upload, X, Check, AlertCircle } from 'lucide-react';

interface CSVImportWizardProps {
  appId: string;
  entity: any;
  onSuccess: () => void;
  onClose: () => void;
}

export function CSVImportWizard({ appId, entity, onSuccess, onClose }: CSVImportWizardProps) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file first.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const text = await file.text();
      const lines = text.split('\n').map(l => l.trim()).filter(l => l);
      if (lines.length < 2) throw new Error('CSV must contain a header row and at least one data row');
      
      const headers = lines[0].split(',').map(h => h.trim());
      
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim());
        const data: Record<string, any> = {};
        headers.forEach((h, idx) => {
          data[h] = values[idx] || '';
        });
        
        const res = await fetch(`/api/applications/${appId}/entities/${entity.id}/records`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ data })
        });
        
        if (!res.ok) {
           const errRes = await res.json();
           console.warn('Import record failed', errRes);
           // Continuing could be optional
        }
      }

      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 rounded-2xl bg-slate-900 border border-slate-700 shadow-xl space-y-4 relative">
      <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white">
        <X className="w-5 h-5" />
      </button>

      <div>
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Upload className="w-4 h-4 text-emerald-400" />
          Import CSV to {entity.pluralName || entity.name}
        </h3>
        <p className="text-xs text-slate-400 mt-1">
          Upload a CSV file to bulk create records.
        </p>
      </div>

      {error && (
        <div className="p-3 bg-red-950/50 border border-red-900/50 rounded-xl text-red-400 flex items-start gap-2 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <div className="border-2 border-dashed border-slate-700 rounded-xl p-8 text-center hover:bg-slate-800/50 transition flex flex-col items-center gap-2 cursor-pointer relative">
        <input 
          type="file" 
          accept=".csv" 
          onChange={handleFileChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
        <Upload className="w-8 h-8 text-slate-500" />
        {file ? (
          <div className="text-emerald-400 text-xs font-bold flex items-center gap-1">
            <Check className="w-4 h-4" />
            {file.name}
          </div>
        ) : (
          <div>
            <div className="text-white text-sm font-bold">Click or drag CSV file hither</div>
            <div className="text-slate-500 text-xs font-medium">.csv maximum 5MB</div>
          </div>
        )}
      </div>

      <div className="flex justify-end pt-2 gap-2">
        <button
          onClick={onClose}
          className="px-4 py-2 hover:bg-slate-800 rounded-xl text-slate-300 text-xs font-bold"
        >
          Cancel
        </button>
        <button
          onClick={handleUpload}
          disabled={!file || loading}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-xl text-white text-xs font-bold shadow disabled:opacity-50 flex items-center gap-2"
        >
          {loading ? 'Uploading...' : 'Confirm Import'}
        </button>
      </div>
    </div>
  );
}

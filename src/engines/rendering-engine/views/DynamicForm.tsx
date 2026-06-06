import React, { useState } from 'react';

interface DynamicFormProps {
  entity: any;
  onSubmit: (data: any) => void;
  submitLabel?: string;
  isLoading?: boolean;
  className?: string;
  initialData?: Record<string, any>;
}

export function DynamicForm({ entity, onSubmit, submitLabel = 'Submit', isLoading, className, initialData }: DynamicFormProps) {
  // Fix initial hook to use initialData if provided. Also update when changed?
  // DynamicForm uses uncontrolled state with key remounting or useEffect.
  const [formData, setFormData] = useState<Record<string, any>>(initialData || {});

  // Update formData when initialData changes to properly reset the form when selecting a different record
  React.useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({});
    }
  }, [initialData]);

  const fields = entity.fields.filter((f: any) => !f.isHiddenInForm);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (name: string, value: any) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className={`space-y-4 ${className}`}>
      <div className="grid grid-cols-1 gap-4">
        {fields.map((field: any) => {
          return (
            <div key={field.id} className="space-y-1">
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                {field.label} {field.isRequired && <span className="text-red-500">*</span>}
              </label>
              {field.type === 'TEXTAREA' ? (
                <textarea
                  value={formData[field.name] || ''}
                  onChange={(e) => handleChange(field.name, e.target.value)}
                  placeholder={field.placeholder || ''}
                  required={field.isRequired}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs"
                  rows={3}
                />
              ) : field.type === 'BOOLEAN' ? (
                <input
                  type="checkbox"
                  checked={formData[field.name] || false}
                  onChange={(e) => handleChange(field.name, e.target.checked)}
                  className="w-4 h-4 rounded border-slate-800 bg-slate-950 text-yellow-500 focus:ring-yellow-500"
                />
              ) : field.type === 'NUMBER' || field.type === 'CURRENCY' ? (
                <input
                  type="number"
                  value={formData[field.name] || ''}
                  onChange={(e) => handleChange(field.name, e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder={field.placeholder || ''}
                  required={field.isRequired}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs"
                />
              ) : (
                <input
                  type={field.type === 'DATE' ? 'date' : 'text'}
                  value={formData[field.name] || ''}
                  onChange={(e) => handleChange(field.name, e.target.value)}
                  placeholder={field.placeholder || ''}
                  required={field.isRequired}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs"
                />
              )}
            </div>
          );
        })}
      </div>
      <div className="pt-2 flex justify-end">
        <button
          type="submit"
          disabled={isLoading}
          className="px-5 py-2.5 bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-all active:scale-95 disabled:opacity-50"
        >
          {isLoading ? 'Submitting...' : submitLabel}
        </button>
      </div>
    </form>
  );
}

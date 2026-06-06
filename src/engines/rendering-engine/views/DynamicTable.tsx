import React from 'react';

interface DynamicTableProps {
  entity: any;
  data: any[];
  isLoading?: boolean;
  className?: string;
  onEdit?: (record: any) => void;
  onDelete?: (record: any) => void;
}

export function DynamicTable({ entity, data, isLoading, className, onEdit, onDelete }: DynamicTableProps) {
  if (isLoading) {
    return <div className={`p-4 text-center text-slate-500 ${className}`}>Loading records...</div>;
  }

  if (!data || data.length === 0) {
    return <div className={`p-4 text-center text-slate-500 ${className}`}>No records found.</div>;
  }

  const cols = entity.fields.filter((f: any) => !f.isHiddenInList);

  return (
    <div className={`overflow-x-auto rounded-xl border border-slate-800 ${className}`}>
      <table className="w-full text-left text-sm text-slate-400">
        <thead className="text-xs text-slate-500 uppercase bg-slate-900/50">
          <tr>
            {cols.map((col: any) => (
              <th key={col.id} className="px-4 py-3 font-medium whitespace-nowrap">{col.label}</th>
            ))}
            <th className="px-4 py-3 font-medium whitespace-nowrap">Created At</th>
            {(onEdit || onDelete) && <th className="px-4 py-3 font-medium whitespace-nowrap text-right">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {data.map((row: any) => (
            <tr key={row.id} className="border-b border-slate-800/50 hover:bg-slate-900/30">
              {cols.map((col: any) => (
                <td key={col.id} className="px-4 py-3 whitespace-nowrap">
                  {row[col.name] !== undefined && row[col.name] !== null ? String(row[col.name]) : '-'}
                </td>
              ))}
              <td className="px-4 py-3 whitespace-nowrap">
                {row.createdAt ? new Date(row.createdAt).toLocaleDateString() : '-'}
              </td>
              {(onEdit || onDelete) && (
                <td className="px-4 py-3 whitespace-nowrap text-right">
                  {onEdit && (
                    <button onClick={() => onEdit(row)} className="text-yellow-500 hover:text-yellow-400 mr-3">Edit</button>
                  )}
                  {onDelete && (
                    <button onClick={() => onDelete(row)} className="text-red-500 hover:text-red-400">Delete</button>
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAppStore } from '../../stores/useAppStore';
import { ShieldCheck, Clock, User, Filter } from 'lucide-react';

export const AdminAuditLog: React.FC = () => {
  const { t } = useTranslation();
  const { activityLogs } = useAppStore();

  return (
    <div className="pb-24 pt-4 px-4 sm:px-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <span className="text-[10px] font-bold text-orange-600 uppercase tracking-wider">
          Compliance & Security Ledger
        </span>
        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
          Admin Audit & Activity Logs
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Immutable event stream of system operations, quotation creation, and workflow changes.
        </p>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="divide-y divide-slate-100 text-xs">
          {activityLogs.map((log) => (
            <div key={log.id} className="p-4 hover:bg-slate-50 transition-colors flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                    {log.action}
                  </span>
                  <span className="font-bold text-slate-900">{log.entityType} ({log.entityId})</span>
                </div>
                <p className="text-slate-600 leading-relaxed">{log.details}</p>
                <div className="text-[11px] text-slate-400">
                  Actor: <strong className="text-slate-700">{log.performedBy}</strong> • Role: <span className="uppercase font-semibold">{log.performedByRole}</span>
                </div>
              </div>

              <div className="text-[11px] text-slate-400 whitespace-nowrap text-end">
                {new Date(log.timestamp).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

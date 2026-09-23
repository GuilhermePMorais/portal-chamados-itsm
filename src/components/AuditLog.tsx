import React, { useState } from 'react';
import { 
  Download, 
  Search, 
  History, 
  ShieldCheck, 
  FileText, 
  User as UserIcon,
  Calendar,
  Filter
} from 'lucide-react';
import { AuditLogItem } from '../types';

interface AuditLogProps {
  logs: AuditLogItem[];
  onExportCsv: () => void;
}

export const AuditLog: React.FC<AuditLogProps> = ({ logs, onExportCsv }) => {
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('all');

  const filtered = logs.filter((l) => {
    if (actionFilter !== 'all' && l.action !== actionFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        l.description.toLowerCase().includes(q) ||
        l.userName.toLowerCase().includes(q) ||
        l.userEmail.toLowerCase().includes(q) ||
        l.entityType.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const getActionBadge = (action: AuditLogItem['action']) => {
    switch (action) {
      case 'Criação':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Atualização':
        return 'bg-slate-100 text-slate-800 border-slate-200';
      case 'Status Alterado':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Exclusão':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'Login':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Permissão':
        return 'bg-slate-800 text-emerald-400 border-slate-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  return (
    <div id="audit-log-view" className="space-y-4 pb-12">
      {/* Topo com Filtros e Exportação */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              id="search-audit-input"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar em registros de auditoria por usuário ou ação..."
              className="w-full min-h-[44px] pl-10 pr-4 rounded-xl border border-slate-300 text-xs sm:text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <select
            id="select-audit-action"
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="min-h-[44px] px-3 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 bg-white focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">Todas as Ações</option>
            <option value="Criação">Criação</option>
            <option value="Atualização">Atualização</option>
            <option value="Status Alterado">Status Alterado</option>
            <option value="Exclusão">Exclusão</option>
            <option value="Login">Login</option>
            <option value="Permissão">Permissão</option>
          </select>
        </div>

        <button
          id="btn-export-audit-csv"
          onClick={onExportCsv}
          className="min-h-[44px] px-4 rounded-xl bg-[#121820] hover:bg-[#1a2332] active:bg-[#0c1017] text-white font-bold text-xs flex items-center justify-center gap-2 border border-[#232d3b] hover:border-emerald-500/50 shadow-sm active:scale-95 touch-manipulation shrink-0 cursor-pointer"
        >
          <Download className="w-4 h-4 text-emerald-400" />
          <span>Baixar CSV de Auditoria</span>
        </button>
      </div>

      {/* Tabela de Logs */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-2 font-semibold text-slate-800">
            <History className="w-4 h-4 text-emerald-600" />
            <span>Trilha de Auditoria e Conformidade</span>
          </div>
          <span>Total: <strong>{filtered.length}</strong> registros</span>
        </div>

        {filtered.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {filtered.map((log) => (
              <div
                key={log.id}
                id={`audit-row-${log.id}`}
                className="p-3.5 sm:p-4 hover:bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4 transition-colors"
              >
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded border ${getActionBadge(
                        log.action
                      )}`}
                    >
                      {log.action}
                    </span>

                    <span className="text-[11px] font-bold text-slate-700">
                      {log.entityType}
                    </span>

                    <span className="text-xs text-slate-400 font-mono">
                      • {new Date(log.timestamp).toLocaleString('pt-BR')}
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm font-semibold text-slate-800 leading-snug">
                    {log.description}
                  </p>
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-500 sm:text-right shrink-0">
                  <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-bold text-xs shrink-0 sm:order-2">
                    {log.userName.charAt(0)}
                  </div>
                  <div className="sm:order-1">
                    <span className="font-bold text-slate-700 block leading-tight">{log.userName}</span>
                    <span className="text-[10px] text-slate-400 block leading-tight">{log.userEmail}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center text-slate-400">
            <FileText className="w-8 h-8 mx-auto mb-2 text-slate-300" />
            <p className="text-xs font-semibold text-slate-600">Nenhum evento registrado com os filtros aplicados</p>
          </div>
        )}
      </div>
    </div>
  );
};

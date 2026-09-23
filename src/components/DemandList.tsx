import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  Plus, 
  Download, 
  User as UserIcon, 
  Calendar, 
  Trash2, 
  Edit3, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Tag
} from 'lucide-react';
import { Demand, DemandStatus, DemandPriority, DemandCategory } from '../types';

interface DemandListProps {
  demands: Demand[];
  onOpenNewDemand: () => void;
  onSelectDemand: (demand: Demand) => void;
  onUpdateStatus: (demandId: string, newStatus: DemandStatus) => void;
  onDeleteDemand: (demandId: string) => void;
}

export const DemandList: React.FC<DemandListProps> = ({
  demands,
  onOpenNewDemand,
  onSelectDemand,
  onUpdateStatus,
  onDeleteDemand,
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const filtered = demands.filter((d) => {
    if (statusFilter !== 'all' && d.status !== statusFilter) return false;
    if (priorityFilter !== 'all' && d.priority !== priorityFilter) return false;
    if (categoryFilter !== 'all' && d.category !== categoryFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const match =
        d.title.toLowerCase().includes(q) ||
        d.code.toLowerCase().includes(q) ||
        d.requester.toLowerCase().includes(q) ||
        d.department.toLowerCase().includes(q) ||
        d.description.toLowerCase().includes(q) ||
        (d.assignedTo && d.assignedTo.toLowerCase().includes(q));
      if (!match) return false;
    }
    return true;
  });

  const handleExportCsv = () => {
    const headers = [
      'Código',
      'Título',
      'Status',
      'Prioridade',
      'Categoria',
      'Solicitante',
      'Departamento',
      'Responsável',
      'Prazo',
      'Data de Abertura'
    ];

    const rows = filtered.map(d => [
      d.code,
      `"${d.title.replace(/"/g, '""')}"`,
      d.status,
      d.priority,
      d.category,
      `"${d.requester.replace(/"/g, '""')}"`,
      `"${d.department.replace(/"/g, '""')}"`,
      `"${(d.assignedTo || 'Pendente').replace(/"/g, '""')}"`,
      d.dueDate,
      new Date(d.createdAt).toLocaleDateString('pt-BR')
    ]);

    const csv = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `demandas_alko_ti_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div id="demands-list-view" className="space-y-4 pb-12">
      {/* Barra de Ações & Filtros */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              id="search-demands-input"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por código, título, solicitante ou setor..."
              className="w-full min-h-[44px] pl-10 pr-4 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none transition-shadow"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              id="btn-export-demands-csv"
              onClick={handleExportCsv}
              className="min-h-[44px] px-3.5 rounded-xl border border-slate-300 hover:bg-slate-50 active:bg-slate-100 text-slate-700 font-semibold text-xs flex items-center gap-1.5 transition-colors active:scale-95 touch-manipulation"
            >
              <Download className="w-4 h-4 text-slate-500" />
              <span>Exportar CSV</span>
            </button>

            <button
              id="btn-list-new-demand"
              onClick={onOpenNewDemand}
              className="min-h-[44px] px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm active:scale-95 touch-manipulation cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Nova Demanda</span>
            </button>
          </div>
        </div>

        {/* Linha de Filtros Seletores */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 border-t border-slate-100">
          {/* Status */}
          <div>
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
              Status
            </label>
            <select
              id="select-filter-status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full min-h-[42px] px-3 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-emerald-500 bg-white"
            >
              <option value="all">Todos os Status</option>
              <option value="A Fazer">A Fazer</option>
              <option value="Em Andamento">Em Andamento</option>
              <option value="Aguardando Fornecedor">Aguardando Fornecedor</option>
              <option value="Em Testes">Em Testes</option>
              <option value="Concluído">Concluído</option>
            </select>
          </div>

          {/* Prioridade */}
          <div>
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
              Prioridade
            </label>
            <select
              id="select-filter-priority"
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full min-h-[42px] px-3 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="all">Todas as Prioridades</option>
              <option value="Crítica">Crítica</option>
              <option value="Alta">Alta</option>
              <option value="Média">Média</option>
              <option value="Baixa">Baixa</option>
            </select>
          </div>

          {/* Categoria */}
          <div>
            <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
              Categoria
            </label>
            <select
              id="select-filter-category"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full min-h-[42px] px-3 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="all">Todas as Categorias</option>
              <option value="Hardware">Hardware</option>
              <option value="Software">Software</option>
              <option value="Redes & Internet">Redes & Internet</option>
              <option value="Acessos & Contas">Acessos & Contas</option>
              <option value="Impressoras">Impressoras</option>
              <option value="Telefonia">Telefonia</option>
              <option value="ERP / SAP">ERP / SAP</option>
              <option value="Facilities & Infra">Facilities & Infra</option>
            </select>
          </div>
        </div>
      </div>

      {/* Lista de Chamados */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>Exibindo <strong>{filtered.length}</strong> de {demands.length} demandas</span>
          {(statusFilter !== 'all' || priorityFilter !== 'all' || categoryFilter !== 'all' || search) && (
            <button
              onClick={() => {
                setStatusFilter('all');
                setPriorityFilter('all');
                setCategoryFilter('all');
                setSearch('');
              }}
              className="text-blue-600 font-bold hover:underline"
            >
              Limpar Filtros
            </button>
          )}
        </div>

        {filtered.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {filtered.map((demand) => (
              <div
                key={demand.id}
                id={`demand-item-${demand.id}`}
                onClick={() => onSelectDemand(demand)}
                className="p-4 sm:p-5 hover:bg-slate-50/80 transition-all cursor-pointer flex flex-col lg:flex-row lg:items-center justify-between gap-4 active:bg-slate-100 touch-manipulation"
              >
                {/* Lado Esquerdo: Código, Título e Meta */}
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-black px-2 py-0.5 rounded bg-slate-900 text-white">
                      {demand.code}
                    </span>

                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                        demand.priority === 'Crítica'
                          ? 'bg-rose-100 text-rose-800'
                          : demand.priority === 'Alta'
                          ? 'bg-amber-100 text-amber-800'
                          : demand.priority === 'Média'
                          ? 'bg-slate-100 text-slate-800 border border-slate-200'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {demand.priority}
                    </span>

                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      {demand.category}
                    </span>

                    <span className="text-xs text-slate-500 font-medium">
                      {demand.department}
                    </span>
                  </div>

                  <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                    {demand.title}
                  </h3>

                  <p className="text-xs text-slate-500 line-clamp-1 leading-relaxed">
                    {demand.description}
                  </p>

                  <div className="flex items-center gap-4 text-xs text-slate-500 pt-1 flex-wrap">
                    <span className="flex items-center gap-1">
                      <UserIcon className="w-3.5 h-3.5 text-slate-400" />
                      Solicitante: <strong className="text-slate-700">{demand.requester}</strong>
                    </span>
                    <span className="flex items-center gap-1">
                      Técnico: <strong className="text-slate-700">{demand.assignedTo || 'Não atribuído'}</strong>
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      Prazo: <strong className="text-slate-700">{demand.dueDate.split('-').reverse().join('/')}</strong>
                    </span>
                  </div>
                </div>

                {/* Lado Direito: Alterador de Status e Botões de Ação */}
                <div 
                  className="flex items-center gap-2.5 shrink-0 self-start lg:self-center"
                  onClick={(e) => e.stopPropagation()}
                >
                  <select
                    id={`select-status-${demand.id}`}
                    value={demand.status}
                    onChange={(e) => onUpdateStatus(demand.id, e.target.value as DemandStatus)}
                    className="min-h-[42px] px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-800 bg-white hover:bg-slate-50 active:bg-slate-100 focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="A Fazer">A Fazer</option>
                    <option value="Em Andamento">Em Andamento</option>
                    <option value="Aguardando Fornecedor">Aguardando Fornecedor</option>
                    <option value="Em Testes">Em Testes</option>
                    <option value="Concluído">Concluído</option>
                  </select>

                  <button
                    id={`btn-open-modal-${demand.id}`}
                    onClick={() => onSelectDemand(demand)}
                    title="Editar e ver detalhes"
                    className="min-h-[42px] px-3 rounded-xl bg-slate-100 text-slate-800 hover:bg-slate-200 active:bg-slate-300 font-semibold text-xs flex items-center gap-1 active:scale-95 touch-manipulation border border-slate-200 cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-slate-600" />
                    <span>Detalhes</span>
                  </button>

                  <button
                    id={`btn-delete-${demand.id}`}
                    onClick={() => {
                      if (window.confirm(`Deseja excluir a demanda ${demand.code}?`)) {
                        onDeleteDemand(demand.id);
                      }
                    }}
                    title="Excluir demanda"
                    className="min-h-[42px] w-10 flex items-center justify-center rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 active:bg-rose-100 transition-colors active:scale-95 touch-manipulation"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center text-slate-500">
            <AlertCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="font-semibold text-slate-700">Nenhum chamado encontrado</p>
            <p className="text-xs text-slate-400 mt-0.5">Ajuste os filtros de busca ou crie uma nova demanda.</p>
          </div>
        )}
      </div>
    </div>
  );
};

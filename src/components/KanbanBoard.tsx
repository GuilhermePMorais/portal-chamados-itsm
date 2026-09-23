import React, { useState } from 'react';
import { 
  Plus, 
  ChevronLeft, 
  ChevronRight, 
  Clock, 
  MessageSquare, 
  Calendar, 
  User as UserIcon, 
  AlertCircle, 
  Sparkles,
  Layers,
  ArrowRightLeft,
  CheckCircle2
} from 'lucide-react';
import { Demand, DemandStatus } from '../types';

interface KanbanBoardProps {
  demands: Demand[];
  onOpenNewDemand: (defaultStatus?: DemandStatus) => void;
  onSelectDemand: (demand: Demand) => void;
  onUpdateStatus: (demandId: string, newStatus: DemandStatus) => void;
}

const COLUMNS: { id: DemandStatus; label: string; color: string; badgeColor: string; bgCol: string }[] = [
  { 
    id: 'A Fazer', 
    label: 'A Fazer', 
    color: 'border-slate-300', 
    badgeColor: 'bg-slate-200 text-slate-800',
    bgCol: 'bg-slate-50/80'
  },
  { 
    id: 'Em Andamento', 
    label: 'Em Andamento', 
    color: 'border-slate-400', 
    badgeColor: 'bg-slate-800 text-white',
    bgCol: 'bg-slate-50/50'
  },
  { 
    id: 'Aguardando Fornecedor', 
    label: 'Aguardando Fornecedor / Peça', 
    color: 'border-amber-400', 
    badgeColor: 'bg-amber-100 text-amber-800',
    bgCol: 'bg-amber-50/40'
  },
  { 
    id: 'Em Testes', 
    label: 'Em Testes / Homologação', 
    color: 'border-purple-400', 
    badgeColor: 'bg-purple-100 text-purple-800',
    bgCol: 'bg-purple-50/40'
  },
  { 
    id: 'Concluído', 
    label: 'Concluído', 
    color: 'border-emerald-400', 
    badgeColor: 'bg-emerald-100 text-emerald-800',
    bgCol: 'bg-emerald-50/40'
  },
];

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  demands,
  onOpenNewDemand,
  onSelectDemand,
  onUpdateStatus,
}) => {
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverCol, setDragOverCol] = useState<DemandStatus | null>(null);
  const [activeMobileCol, setActiveMobileCol] = useState<DemandStatus>('Em Andamento');

  // Filtros rápidos locais
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const getNextStatus = (current: DemandStatus): DemandStatus | null => {
    const order: DemandStatus[] = [
      'A Fazer',
      'Em Andamento',
      'Aguardando Fornecedor',
      'Em Testes',
      'Concluído'
    ];
    const idx = order.indexOf(current);
    if (idx !== -1 && idx < order.length - 1) {
      return order[idx + 1];
    }
    return null;
  };

  const getPrevStatus = (current: DemandStatus): DemandStatus | null => {
    const order: DemandStatus[] = [
      'A Fazer',
      'Em Andamento',
      'Aguardando Fornecedor',
      'Em Testes',
      'Concluído'
    ];
    const idx = order.indexOf(current);
    if (idx > 0) {
      return order[idx - 1];
    }
    return null;
  };

  // Drag and Drop handlers
  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('text/plain', id);
    setDraggedId(id);
  };

  const handleDragOver = (e: React.DragEvent, colId: DemandStatus) => {
    e.preventDefault();
    if (dragOverCol !== colId) {
      setDragOverCol(colId);
    }
  };

  const handleDrop = (e: React.DragEvent, targetCol: DemandStatus) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('text/plain') || draggedId;
    if (id) {
      onUpdateStatus(id, targetCol);
    }
    setDraggedId(null);
    setDragOverCol(null);
  };

  // Filter demands
  const filteredDemands = demands.filter((d) => {
    if (priorityFilter !== 'all' && d.priority !== priorityFilter) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const match =
        d.title.toLowerCase().includes(term) ||
        d.code.toLowerCase().includes(term) ||
        d.requester.toLowerCase().includes(term) ||
        d.department.toLowerCase().includes(term);
      if (!match) return false;
    }
    return true;
  });

  return (
    <div id="kanban-board-container" className="space-y-4 pb-12">
      {/* Barra Superior do Kanban: Filtros e Botão Novo */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Prioridade:
          </span>
          <div className="flex items-center gap-1.5 flex-wrap">
            {['all', 'Crítica', 'Alta', 'Média', 'Baixa'].map((p) => (
              <button
                key={p}
                id={`filter-priority-${p}`}
                onClick={() => setPriorityFilter(p)}
                className={`min-h-[38px] px-3 rounded-lg text-xs font-semibold transition-all touch-manipulation active:scale-95 ${
                  priorityFilter === p
                    ? 'bg-[#121820] text-emerald-400 font-bold border border-[#232d3b] shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {p === 'all' ? 'Todas' : p}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            id="kanban-quick-search"
            placeholder="Buscar por código, título ou setor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 sm:w-64 min-h-[42px] px-3.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
          />
          <button
            id="btn-kanban-new-demand"
            onClick={() => onOpenNewDemand()}
            className="min-h-[42px] px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm active:scale-95 touch-manipulation shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Nova Demanda</span>
            <span className="sm:hidden">Novo</span>
          </button>
        </div>
      </div>

      {/* Seletor de Colunas para Dispositivos Móveis (Tabs Touch Rápidas) */}
      <div className="flex lg:hidden overflow-x-auto no-scrollbar gap-2 pb-1">
        {COLUMNS.map((col) => {
          const count = filteredDemands.filter((d) => d.status === col.id).length;
          const isSelected = activeMobileCol === col.id;
          return (
            <button
              key={col.id}
              id={`tab-mobile-col-${col.id}`}
              onClick={() => setActiveMobileCol(col.id)}
              className={`min-h-[44px] px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-2 border transition-all touch-manipulation active:scale-95 ${
                isSelected
                  ? 'bg-[#121820] text-emerald-400 border-[#232d3b] shadow-md'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <span>{col.label}</span>
              <span
                className={`px-2 py-0.5 rounded-full text-[11px] ${
                  isSelected ? 'bg-white/25 text-white' : 'bg-slate-100 text-slate-800'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Grid de Colunas (Horizontal no Desktop, Visível pela Tab selecionada ou Carrossel) */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 items-start">
        {COLUMNS.map((col) => {
          const colDemands = filteredDemands.filter((d) => d.status === col.id);
          const isDragOver = dragOverCol === col.id;
          const isHiddenOnMobile = activeMobileCol !== col.id;

          return (
            <div
              key={col.id}
              id={`kanban-col-${col.id.replace(/\s+/g, '-').toLowerCase()}`}
              onDragOver={(e) => handleDragOver(e, col.id)}
              onDrop={(e) => handleDrop(e, col.id)}
              className={`flex flex-col rounded-2xl border transition-all duration-200 min-h-[480px] p-3.5 ${
                col.bgCol
              } ${isDragOver ? 'border-emerald-500 ring-2 ring-emerald-400/40 bg-emerald-50/50' : col.color} ${
                isHiddenOnMobile ? 'hidden lg:flex' : 'flex'
              }`}
            >
              {/* Cabeçalho da Coluna */}
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200/80">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-xs sm:text-sm text-slate-800 leading-snug">
                    {col.label}
                  </h3>
                  <span className={`text-xs font-extrabold px-2 py-0.5 rounded-full ${col.badgeColor}`}>
                    {colDemands.length}
                  </span>
                </div>

                <button
                  id={`btn-col-add-${col.id.replace(/\s+/g, '-').toLowerCase()}`}
                  onClick={() => onOpenNewDemand(col.id)}
                  title={`Adicionar demanda em "${col.label}"`}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-emerald-600 hover:bg-white active:bg-slate-200 transition-transform active:scale-95 touch-manipulation cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Lista de Cartões */}
              <div className="space-y-3 flex-1">
                {colDemands.length > 0 ? (
                  colDemands.map((demand) => {
                    const prevStatus = getPrevStatus(demand.status);
                    const nextStatus = getNextStatus(demand.status);

                    return (
                      <div
                        key={demand.id}
                        id={`kanban-card-${demand.id}`}
                        draggable
                        onDragStart={(e) => handleDragStart(e, demand.id)}
                        onClick={() => onSelectDemand(demand)}
                        className="group bg-white rounded-xl p-3.5 border border-slate-200 hover:border-emerald-400 hover:shadow-md transition-all cursor-pointer active:scale-[0.99] touch-manipulation relative select-none"
                      >
                        {/* Topo do Card: Código & Prioridade */}
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className="font-mono text-xs font-black px-2 py-0.5 rounded bg-slate-900 text-white">
                            {demand.code}
                          </span>

                          <span
                            className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                              demand.priority === 'Crítica'
                                ? 'bg-rose-100 text-rose-800 border border-rose-200'
                                : demand.priority === 'Alta'
                                ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                : demand.priority === 'Média'
                                ? 'bg-slate-100 text-slate-800 border border-slate-200'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {demand.priority}
                          </span>
                        </div>

                        {/* Título */}
                        <h4 className="font-bold text-slate-900 text-sm leading-snug line-clamp-2 mb-1.5 group-hover:text-emerald-700 transition-colors">
                          {demand.title}
                        </h4>

                        {/* Detalhes rápidos */}
                        <div className="space-y-1 mb-3 text-slate-500 text-xs">
                          <div className="flex items-center gap-1.5 text-slate-600 font-medium">
                            <span className="text-[11px] px-1.5 py-0.5 rounded bg-slate-100 font-semibold text-slate-700">
                              {demand.category}
                            </span>
                            <span className="truncate">• {demand.department}</span>
                          </div>

                          <div className="flex items-center justify-between pt-1 text-[11px]">
                            <span className="flex items-center gap-1 text-slate-500">
                              <UserIcon className="w-3.5 h-3.5 text-slate-400" />
                              <span className="truncate max-w-[110px]">{demand.assignedTo || 'Pendente'}</span>
                            </span>

                            <span className="flex items-center gap-1 text-slate-500 font-medium">
                              <Calendar className="w-3.5 h-3.5 text-slate-400" />
                              {demand.dueDate.split('-').reverse().slice(0, 2).join('/')}
                            </span>
                          </div>
                        </div>

                        {/* BARRAS DE AÇÃO TOUCH: Botões diretos para avançar e voltar */}
                        <div 
                          className="pt-2.5 border-t border-slate-100 flex items-center justify-between gap-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {prevStatus ? (
                            <button
                              id={`btn-prev-${demand.id}`}
                              onClick={() => onUpdateStatus(demand.id, prevStatus)}
                              title={`Voltar para ${prevStatus}`}
                              className="flex-1 flex items-center justify-center gap-1 min-h-[36px] px-2 rounded-lg bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 text-[11px] font-bold transition-all active:scale-95 touch-manipulation"
                            >
                              <ChevronLeft className="w-3.5 h-3.5" />
                              <span>Voltar</span>
                            </button>
                          ) : (
                            <div className="flex-1" />
                          )}

                          <button
                            id={`btn-details-${demand.id}`}
                            onClick={() => onSelectDemand(demand)}
                            title="Ver detalhes"
                            className="flex items-center justify-center min-h-[36px] px-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-800 text-[11px] font-bold transition-all active:scale-95 touch-manipulation border border-slate-200"
                          >
                            Abrir
                          </button>

                          {nextStatus ? (
                            <button
                              id={`btn-next-${demand.id}`}
                              onClick={() => onUpdateStatus(demand.id, nextStatus)}
                              title={`Avançar para ${nextStatus}`}
                              className="flex-1 flex items-center justify-center gap-1 min-h-[36px] px-2 rounded-lg bg-[#121820] hover:bg-[#1a2332] active:bg-[#0f141c] text-emerald-400 text-[11px] font-bold transition-all active:scale-95 touch-manipulation shadow-xs border border-[#232d3b]"
                            >
                              <span>Avançar</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          ) : (
                            <div className="flex-1 flex items-center justify-center min-h-[36px] text-emerald-600 font-bold text-[11px] gap-1 bg-emerald-50 rounded-lg">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Concluído
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="h-32 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-xl p-4 text-center">
                    <p className="text-xs font-medium text-slate-400">Nenhuma demanda aqui</p>
                    <button
                      onClick={() => onOpenNewDemand(col.id)}
                      className="mt-2 text-xs text-emerald-600 font-bold hover:underline touch-manipulation"
                    >
                      + Criar nesta etapa
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

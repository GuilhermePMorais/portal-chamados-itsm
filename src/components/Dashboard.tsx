import React from 'react';
import { 
  ClipboardList, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  TrendingUp, 
  Server, 
  ArrowRight, 
  Plus, 
  KanbanSquare, 
  StickyNote,
  Flame,
  Activity
} from 'lucide-react';
import { Demand, QuickNote, AuditLogItem, DemandCategory } from '../types';
import { COMPANY_CONFIG } from '../config/branding';

interface DashboardProps {
  demands: Demand[];
  notes: QuickNote[];
  auditLogs: AuditLogItem[];
  onOpenNewDemand: () => void;
  onNavigateToTab: (tab: 'kanban' | 'demands' | 'notes') => void;
  onSelectDemand: (demand: Demand) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  demands,
  notes,
  auditLogs,
  onOpenNewDemand,
  onNavigateToTab,
  onSelectDemand,
}) => {
  // Métricas
  const total = demands.length;
  const inProgress = demands.filter(d => d.status === 'Em Andamento').length;
  const completed = demands.filter(d => d.status === 'Concluído').length;
  const critical = demands.filter(d => d.priority === 'Crítica' && d.status !== 'Concluído').length;
  const waitingSupplier = demands.filter(d => d.status === 'Aguardando Fornecedor').length;
  const inTesting = demands.filter(d => d.status === 'Em Testes').length;
  const backlog = demands.filter(d => d.status === 'A Fazer').length;

  const slaPercentage = total > 0 ? Math.round((completed / total) * 100) : 100;
  
  // Média de tempo em horas
  const avgTimeHours = demands.length > 0 
    ? (demands.reduce((acc, curr) => acc + (curr.resolutionTimeHours || 4), 0) / demands.length).toFixed(1)
    : '3.5';

  // Categorias
  const categories: DemandCategory[] = [
    'Hardware',
    'Software',
    'Redes & Internet',
    'Acessos & Contas',
    'Impressoras',
    'Telefonia',
    'ERP / SAP',
    'Facilities & Infra'
  ];

  const categoryStats = categories.map(cat => ({
    name: cat,
    count: demands.filter(d => d.category === cat).length
  })).sort((a, b) => b.count - a.count);

  // Demandas Críticas / Urgentes
  const urgentDemands = demands
    .filter(d => (d.priority === 'Crítica' || d.priority === 'Alta') && d.status !== 'Concluído')
    .slice(0, 4);

  return (
    <div id="dashboard-view" className="space-y-6 pb-12">
      {/* Banner de Boas-Vindas e Ações Rápidas em Preto Fosco com Degradê */}
      <div className="bg-gradient-to-r from-[#0d1218] via-[#161d27] to-[#1e2736] rounded-2xl p-6 sm:p-7 text-white shadow-2xl border border-[#232d3b] flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        {/* Iluminação Atmosférica Suave de Fundo */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 -mb-10 w-60 h-60 bg-slate-700/20 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/80 text-emerald-400 text-xs font-semibold mb-3 border border-emerald-500/20 shadow-xs backdrop-blur-sm">
            <Server className="w-3.5 h-3.5 text-emerald-400" />
            <span>Centro de Operações • {COMPANY_CONFIG.companyName.replace(/-/g, ' ')}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Painel Geral de Atividades
          </h1>
          <p className="text-slate-300 text-sm mt-1.5 max-w-xl leading-relaxed font-normal">
            Monitoramento em tempo real de chamados técnicos, infraestrutura fabril, licenças de software e solicitações de usuários.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 relative z-10">
          <button
            id="btn-dash-new-demand"
            onClick={onOpenNewDemand}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 min-h-[44px] px-4 py-2.5 rounded-xl bg-white text-slate-900 hover:bg-slate-100 active:bg-slate-200 font-bold text-sm shadow-md transition-all active:scale-95 touch-manipulation cursor-pointer"
          >
            <Plus className="w-4 h-4 text-emerald-600" />
            <span>Novo Chamado</span>
          </button>

          <button
            id="btn-dash-go-kanban"
            onClick={() => onNavigateToTab('kanban')}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 min-h-[44px] px-4 py-2.5 rounded-xl bg-[#121820]/90 hover:bg-[#1a2332] active:bg-[#0f141c] text-white font-semibold text-sm border border-[#2e3b4e] hover:border-emerald-500/40 shadow-sm transition-all active:scale-95 touch-manipulation cursor-pointer"
          >
            <KanbanSquare className="w-4 h-4 text-emerald-400" />
            <span>Ver Kanban</span>
          </button>
        </div>
      </div>

      {/* Grid de KPIs principais */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* Total */}
        <div 
          onClick={() => onNavigateToTab('demands')}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:border-slate-400 transition-all cursor-pointer group active:scale-[0.98] touch-manipulation"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold text-slate-500">Total</span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-800 flex items-center justify-center group-hover:bg-[#121820] group-hover:text-emerald-400 transition-colors">
              <ClipboardList className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900">{total}</div>
          <div className="text-[11px] text-slate-500 mt-1">Todas as demandas</div>
        </div>

        {/* Em Andamento */}
        <div 
          onClick={() => onNavigateToTab('kanban')}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:border-amber-300 transition-all cursor-pointer group active:scale-[0.98] touch-manipulation"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold text-amber-600">Em Atendimento</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white transition-colors">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900">{inProgress}</div>
          <div className="text-[11px] text-slate-500 mt-1">Em execução agora</div>
        </div>

        {/* Críticos */}
        <div 
          onClick={() => onNavigateToTab('demands')}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:border-rose-300 transition-all cursor-pointer group active:scale-[0.98] touch-manipulation"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold text-rose-600">Críticos</span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center group-hover:bg-rose-600 group-hover:text-white transition-colors">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-rose-600">{critical}</div>
          <div className="text-[11px] text-slate-500 mt-1">Alta prioridade ativa</div>
        </div>

        {/* Concluídos */}
        <div 
          onClick={() => onNavigateToTab('demands')}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm hover:border-emerald-300 transition-all cursor-pointer group active:scale-[0.98] touch-manipulation"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold text-emerald-600">Concluídos</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-600">{completed}</div>
          <div className="text-[11px] text-slate-500 mt-1">Finalizados com êxito</div>
        </div>

        {/* SLA Cumprido */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold text-indigo-600">Taxa Resolução</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900">{slaPercentage}%</div>
          <div className="text-[11px] text-slate-500 mt-1">Demandas atendidas</div>
        </div>

        {/* Tempo Médio */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold text-slate-600">Tempo Médio</span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900">{avgTimeHours}h</div>
          <div className="text-[11px] text-slate-500 mt-1">Por chamado</div>
        </div>
      </div>

      {/* Grid Principal: Demandas Urgentes + Gráfico de Categorias */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chamados Críticos & Urgentes (2 Colunas) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                  Demandas que Exigem Atenção
                </h2>
                <p className="text-xs text-slate-500">
                  Chamados com prioridade Alta ou Crítica que impactam a operação fabril ou administrativa
                </p>
              </div>
              <button
                onClick={() => onNavigateToTab('demands')}
                className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 p-2 touch-manipulation active:scale-95"
              >
                Ver todas <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {urgentDemands.length > 0 ? (
              <div className="space-y-3">
                {urgentDemands.map((demand) => (
                  <div
                    key={demand.id}
                    onClick={() => onSelectDemand(demand)}
                    className="p-4 rounded-xl border border-slate-200 hover:border-emerald-300 bg-slate-50/50 hover:bg-slate-50 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 active:scale-[0.99] touch-manipulation"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-extrabold px-2 py-0.5 rounded bg-slate-800 text-white font-mono">
                          {demand.code}
                        </span>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                          demand.priority === 'Crítica'
                            ? 'bg-rose-100 text-rose-800 border border-rose-200'
                            : 'bg-amber-100 text-amber-800 border border-amber-200'
                        }`}>
                          {demand.priority}
                        </span>
                        <span className="text-xs text-slate-500 font-medium">
                          {demand.department}
                        </span>
                      </div>
                      <h3 className="text-sm font-semibold text-slate-900 line-clamp-1">
                        {demand.title}
                      </h3>
                      <p className="text-xs text-slate-500 line-clamp-1">
                        Solicitante: {demand.requester} • Responsável: {demand.assignedTo || 'Não atribuído'}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs px-2.5 py-1 rounded-full font-semibold bg-white border border-slate-200 text-slate-700">
                        {demand.status}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectDemand(demand);
                        }}
                        className="min-h-[40px] px-3 rounded-lg bg-slate-100 text-slate-800 font-semibold text-xs hover:bg-[#121820] hover:text-emerald-400 transition-colors active:scale-95 touch-manipulation border border-slate-200 cursor-pointer"
                      >
                        Abrir
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-slate-500 border border-dashed border-slate-200 rounded-xl">
                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                <p className="text-sm font-semibold text-slate-700">Tudo sob controle!</p>
                <p className="text-xs text-slate-500">Nenhuma demanda crítica pendente no momento.</p>
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Status operacional: <strong>Normal</strong></span>
            <button
              onClick={() => onNavigateToTab('kanban')}
              className="text-blue-600 font-semibold hover:underline"
            >
              Organizar no Kanban
            </button>
          </div>
        </div>

        {/* Distribuição por Categoria (1 Coluna) */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-1">
              Demandas por Categoria
            </h2>
            <p className="text-xs text-slate-500 mb-4">
              Volume de solicitações por tipo de tecnologia e infraestrutura
            </p>

            <div className="space-y-3">
              {categoryStats.map((item) => {
                const percentage = total > 0 ? Math.round((item.count / total) * 100) : 0;
                return (
                  <div key={item.name} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-700">{item.name}</span>
                      <span className="font-bold text-slate-900">{item.count} ({percentage}%)</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500">Total: {total} chamados</span>
            <button
              onClick={() => onNavigateToTab('demands')}
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 cursor-pointer"
            >
              Filtrar por Categoria
            </button>
          </div>
        </div>
      </div>

      {/* Seção Inferior: Status do Kanban + Lembretes Rápidos + Últimas Auditorias */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Distribuição no Kanban */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <KanbanSquare className="w-4 h-4 text-emerald-600" />
              Etapas do Quadro
            </h3>
            <button
              onClick={() => onNavigateToTab('kanban')}
              className="text-xs font-semibold text-emerald-700 hover:underline cursor-pointer"
            >
              Abrir Quadro
            </button>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 text-xs">
              <span className="font-medium text-slate-700">A Fazer (Backlog)</span>
              <span className="font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-800">{backlog}</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-100 text-xs">
              <span className="font-medium text-slate-800">Em Andamento</span>
              <span className="font-bold px-2 py-0.5 rounded-full bg-slate-900 text-emerald-400">{inProgress}</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-amber-50/70 text-xs">
              <span className="font-medium text-amber-900">Aguardando Fornecedor</span>
              <span className="font-bold px-2 py-0.5 rounded-full bg-amber-200 text-amber-900">{waitingSupplier}</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-purple-50/70 text-xs">
              <span className="font-medium text-purple-900">Em Testes</span>
              <span className="font-bold px-2 py-0.5 rounded-full bg-purple-200 text-purple-900">{inTesting}</span>
            </div>
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50/70 text-xs">
              <span className="font-medium text-emerald-900">Concluído</span>
              <span className="font-bold px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-900">{completed}</span>
            </div>
          </div>
        </div>

        {/* Lembretes Rápidos Ativos */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <StickyNote className="w-4 h-4 text-amber-500" />
              Notas Fixadas
            </h3>
            <button
              onClick={() => onNavigateToTab('notes')}
              className="text-xs font-semibold text-blue-600 hover:underline"
            >
              Ver Todas ({notes.length})
            </button>
          </div>
          <div className="space-y-2.5">
            {notes.slice(0, 3).map((note) => (
              <div 
                key={note.id}
                onClick={() => onNavigateToTab('notes')}
                className="p-3 rounded-xl border border-amber-200/80 bg-amber-50/50 hover:bg-amber-100/60 transition-colors cursor-pointer active:scale-98 touch-manipulation"
              >
                <div className="text-xs font-bold text-slate-900 line-clamp-1">{note.title}</div>
                <div className="text-[11px] text-slate-600 mt-1 line-clamp-2">{note.content}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Histórico Recente de Auditoria */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Activity className="w-4 h-4 text-slate-600" />
              Últimas Ações
            </h3>
            <span className="text-[11px] font-medium text-slate-400">Auditoria</span>
          </div>
          <div className="space-y-2.5">
            {auditLogs.slice(0, 3).map((log) => (
              <div key={log.id} className="text-xs p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex items-center justify-between font-semibold text-slate-800">
                  <span>{log.userName}</span>
                  <span className="text-[10px] text-slate-400 font-normal">
                    {new Date(log.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div className="text-slate-600 mt-0.5 line-clamp-1">{log.description}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

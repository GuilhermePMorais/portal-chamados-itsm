import React, { useState, useEffect } from 'react';
import { 
  X, 
  Save, 
  Send, 
  User as UserIcon, 
  Calendar, 
  Tag, 
  Building2, 
  MessageSquare, 
  FileText,
  Clock,
  ShieldAlert,
  Mail,
  Info
} from 'lucide-react';
import { 
  Demand, 
  DemandStatus, 
  DemandPriority, 
  DemandCategory, 
  User 
} from '../types';
import { COMPANY_CONFIG } from '../config/branding';

interface DemandModalProps {
  isOpen: boolean;
  demand: Demand | null;
  currentUser: User | null;
  teamMembers: User[];
  defaultStatus?: DemandStatus;
  onClose: () => void;
  onSave: (data: Partial<Demand>) => void;
  onAddComment: (demandId: string, text: string) => void;
}

export const DemandModal: React.FC<DemandModalProps> = ({
  isOpen,
  demand,
  currentUser,
  teamMembers,
  defaultStatus = 'A Fazer',
  onClose,
  onSave,
  onAddComment,
}) => {
  const isEditing = Boolean(demand);
  const isEmployee = currentUser?.role === 'Colaborador (Funcionário)';

  const [activeTab, setActiveTab] = useState<'info' | 'comments'>('info');

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [requester, setRequester] = useState('');
  const [requesterEmail, setRequesterEmail] = useState('');
  const [department, setDepartment] = useState('Produção & Fábrica');
  const [category, setCategory] = useState<DemandCategory>('Hardware');
  const [priority, setPriority] = useState<DemandPriority>('Média');
  const [status, setStatus] = useState<DemandStatus>(defaultStatus);
  const [assignedTo, setAssignedTo] = useState('Carlos Andrade');
  const [dueDate, setDueDate] = useState('');
  const [commentText, setCommentText] = useState('');

  useEffect(() => {
    if (demand) {
      setTitle(demand.title);
      setDescription(demand.description);
      setRequester(demand.requester);
      setRequesterEmail(demand.requesterEmail);
      setDepartment(demand.department);
      setCategory(demand.category);
      setPriority(demand.priority);
      setStatus(demand.status);
      setAssignedTo(demand.assignedTo || '');
      setDueDate(demand.dueDate);
    } else {
      setTitle('');
      setDescription('');
      setRequester(currentUser?.name || 'Colaborador');
      setRequesterEmail(currentUser?.email || `colaborador@${COMPANY_CONFIG.companyDomain}`);
      setDepartment(currentUser?.department || COMPANY_CONFIG.departments[0] || 'Geral');
      setCategory('Hardware');
      setPriority('Média');
      setStatus(defaultStatus);
      // Atribuir automaticamente: Se for TI, técnico Carlos Andrade; se for Facilities, Roberto Mendes / Edson Martins
      const defaultTech = teamMembers.find(m => m.role === 'Técnico' || m.role === 'Analista')?.name || 'Carlos Andrade';
      setAssignedTo(defaultTech);
      
      const d = new Date();
      d.setDate(d.getDate() + 3);
      setDueDate(d.toISOString().split('T')[0]);
    }
  }, [demand, isOpen, defaultStatus, currentUser, teamMembers]);

  // Atualização inteligente de responsável padrão ao trocar categoria se for novo chamado
  const handleCategoryChange = (newCategory: DemandCategory) => {
    setCategory(newCategory);
    if (!demand) {
      if (newCategory === 'Facilities & Infra') {
        const facilitiesLead = teamMembers.find(m => 
          m.role === 'Supervisor de Facilities' || m.role === 'Técnico de Manutenção / Facilities'
        )?.name || 'Roberto Mendes';
        setAssignedTo(facilitiesLead);
      } else {
        const itLead = teamMembers.find(m => 
          m.role === 'Técnico' || m.role === 'Analista'
        )?.name || 'Carlos Andrade';
        setAssignedTo(itLead);
      }
    }
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('Por favor, informe o título do chamado.');
      return;
    }

    onSave({
      id: demand?.id,
      title: title.trim(),
      description: description.trim(),
      requester: isEmployee && currentUser ? currentUser.name : (requester.trim() || 'Colaborador'),
      requesterEmail: isEmployee && currentUser ? currentUser.email : (requesterEmail.trim() || `colaborador@${COMPANY_CONFIG.companyDomain}`),
      department: isEmployee && currentUser?.department ? currentUser.department : department,
      category,
      priority,
      status: isEmployee && !demand ? 'A Fazer' : status,
      assignedTo: isEmployee && !demand ? (assignedTo || 'Carlos Andrade') : (assignedTo || undefined),
      dueDate,
    });
    onClose();
  };

  const handleSendComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !demand) return;
    onAddComment(demand.id, commentText.trim());
    setCommentText('');
  };

  return (
    <div 
      id="demand-modal-overlay"
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        id="demand-modal-card"
        onClick={(e) => e.stopPropagation()}
        className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]"
      >
        {/* Cabeçalho */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#121820] text-emerald-400 flex items-center justify-center border border-[#232d3b]">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                  {isEditing ? `Chamado #${demand?.code}` : (isEmployee ? 'Abrir Chamado Interno' : 'Nova Demanda de TI / Facilities')}
                </h3>
                {isEditing && (
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                    {demand?.status}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {isEditing
                  ? 'Visualização técnica e acompanhamento'
                  : (isEmployee 
                      ? 'Descreva sua necessidade. Supervisores e Admins serão avisados por e-mail.' 
                      : 'Registre a solicitação para triagem e acompanhamento')}
              </p>
            </div>
          </div>

          <button
            id="btn-close-demand-modal"
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200 active:scale-95 touch-manipulation"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Notificação informativa de envio de e-mail */}
        <div className="px-5 py-2.5 bg-slate-50/90 border-b border-slate-200/80 flex items-center gap-2 text-xs text-slate-700">
          <Mail className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            Notificação automática: Administradores e Supervisores recebem alerta por e-mail e push no sistema a cada alteração.
          </span>
        </div>

        {/* Abas internas (se estiver editando) */}
        {isEditing && (
          <div className="flex border-b border-slate-200 bg-white px-5 pt-2">
            <button
              onClick={() => setActiveTab('info')}
              className={`pb-3 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
                activeTab === 'info'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Dados do Chamado</span>
            </button>
            <button
              onClick={() => setActiveTab('comments')}
              className={`pb-3 px-3 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 ${
                activeTab === 'comments'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Histórico &amp; Interações ({demand?.comments?.length || 0})</span>
            </button>
          </div>
        )}

        {/* Conteúdo */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1">
          {activeTab === 'info' ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Título */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Título do Chamado *
                </label>
                <input
                  type="text"
                  required
                  id="input-demand-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Ex: Impressora da linha parou de imprimir"
                  className="w-full min-h-[44px] px-3.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-semibold focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  disabled={isEmployee && isEditing}
                />
              </div>

              {/* Categoria, Prioridade & Status */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Categoria
                  </label>
                  <select
                    id="input-demand-category"
                    value={category}
                    onChange={(e) => handleCategoryChange(e.target.value as DemandCategory)}
                    className="w-full min-h-[44px] px-3 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-blue-500 bg-white"
                    disabled={isEmployee && isEditing}
                  >
                    <option value="Hardware">Hardware &amp; Equipamentos (TI)</option>
                    <option value="Software">Software &amp; Sistemas (TI)</option>
                    <option value="Redes &amp; Internet">Redes &amp; Conectividade (TI)</option>
                    <option value="Acessos &amp; Contas">Acessos &amp; Contas / ID (TI)</option>
                    <option value="Impressoras">Impressoras &amp; Suprimentos (TI)</option>
                    <option value="Telefonia">Telefonia &amp; Ramais (TI)</option>
                    <option value="ERP / SAP">ERP / SAP &amp; Gestão (TI)</option>
                    <option value="Facilities &amp; Infra">Facilities &amp; Infraestrutura (Manutenção / OS)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Prioridade
                  </label>
                  <select
                    id="input-demand-priority"
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as DemandPriority)}
                    className="w-full min-h-[44px] px-3 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-blue-500 bg-white"
                    disabled={isEmployee && isEditing}
                  >
                    <option value="Baixa">Baixa</option>
                    <option value="Média">Média</option>
                    <option value="Alta">Alta</option>
                    <option value="Crítica">Crítica</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Status Atual
                  </label>
                  <select
                    id="input-demand-status"
                    value={status}
                    onChange={(e) => setStatus(e.target.value as DemandStatus)}
                    className="w-full min-h-[44px] px-3 rounded-xl border border-slate-300 text-xs font-bold text-blue-900 focus:ring-2 focus:ring-blue-500 bg-white disabled:bg-slate-100 disabled:text-slate-500"
                    disabled={isEmployee}
                  >
                    <option value="A Fazer">A Fazer</option>
                    <option value="Em Andamento">Em Andamento</option>
                    <option value="Aguardando Fornecedor">Aguardando Fornecedor</option>
                    <option value="Em Testes">Em Testes</option>
                    <option value="Concluído">Concluído</option>
                  </select>
                </div>
              </div>

              {/* Descrição */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Descrição Detalhada da Solicitação *
                </label>
                <textarea
                  id="input-demand-description"
                  rows={3}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detalhe o erro, equipamento ou necessidade do colaborador..."
                  className="w-full p-3 rounded-xl border border-slate-300 text-xs leading-relaxed focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  disabled={isEmployee && isEditing}
                />
              </div>

              {/* Grid: Solicitante e Departamento */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Solicitante
                  </label>
                  <input
                    type="text"
                    id="input-demand-requester"
                    value={requester}
                    onChange={(e) => setRequester(e.target.value)}
                    placeholder="Nome do colaborador"
                    disabled={isEmployee}
                    className="w-full min-h-[44px] px-3.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:bg-slate-100 disabled:text-slate-600"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Departamento / Setor
                  </label>
                  <select
                    id="input-demand-department"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    disabled={isEmployee}
                    className="w-full min-h-[44px] px-3 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-blue-500 bg-white disabled:bg-slate-100 disabled:text-slate-600"
                  >
                    <option value="Produção & Fábrica">Produção &amp; Fábrica</option>
                    <option value="Logística & Expedição">Logística &amp; Expedição</option>
                    <option value="Facilities & Infraestrutura">Facilities &amp; Infraestrutura</option>
                    <option value="TI & Governança">TI &amp; Governança</option>
                    <option value="Financeiro">Financeiro</option>
                    <option value="Recursos Humanos">Recursos Humanos</option>
                    <option value="Comercial & Vendas">Comercial &amp; Vendas</option>
                    <option value="Qualidade & Laboratório">Qualidade &amp; Laboratório</option>
                    <option value="Diretoria">Diretoria</option>
                  </select>
                </div>
              </div>

              {/* Grid: Técnico Responsável e Prazo (apenas visível/editável por gestores e técnicos) */}
              {!isEmployee && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Técnico Responsável
                    </label>
                    <select
                      id="input-demand-assigned"
                      value={assignedTo}
                      onChange={(e) => setAssignedTo(e.target.value)}
                      className="w-full min-h-[44px] px-3 rounded-xl border border-slate-300 text-xs font-medium focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                      <option value="">Não atribuído</option>
                      {teamMembers.map((m) => (
                        <option key={m.id} value={m.name}>
                          {m.name} ({m.role})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Data Limite / Prazo (SLA)
                    </label>
                    <input
                      type="date"
                      id="input-demand-duedate"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="w-full min-h-[44px] px-3.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {/* Rodapé de botões */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  id="btn-cancel-demand-modal"
                  onClick={onClose}
                  className="min-h-[44px] px-4 rounded-xl border border-slate-300 text-slate-700 font-semibold text-xs hover:bg-slate-50 active:bg-slate-100 transition-colors active:scale-95 touch-manipulation"
                >
                  Cancelar
                </button>
                {(!isEmployee || !isEditing) && (
                  <button
                    type="submit"
                    id="btn-save-demand-modal"
                    className="min-h-[44px] px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-emerald-600/20 active:scale-95 touch-manipulation cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>{isEditing ? 'Salvar Alterações' : 'Registrar Chamado'}</span>
                  </button>
                )}
              </div>
            </form>
          ) : (
            /* Aba de Comentários & Histórico com Notificação Automática */
            <div className="space-y-4">
              <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
                {demand?.comments && demand.comments.length > 0 ? (
                  demand.comments.map((c) => (
                    <div
                      key={c.id}
                      className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-800">{c.authorName}</span>
                          <span className="text-[10px] text-slate-500 px-1.5 py-0.5 rounded bg-slate-200/80">
                            {c.authorRole}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-400">
                          {new Date(c.createdAt).toLocaleString('pt-BR')}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                        {c.text}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-slate-400 text-xs">
                    Nenhuma interação ou comentário adicionado ainda.
                  </div>
                )}
              </div>

              {/* Formulário de novo comentário */}
              <form onSubmit={handleSendComment} className="pt-2 border-t border-slate-100 flex gap-2">
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Escreva uma resposta ou atualização sobre o chamado..."
                  className="flex-1 min-h-[44px] px-3.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={!commentText.trim()}
                  className="min-h-[44px] px-4 rounded-xl bg-[#121820] hover:bg-[#1a2332] active:bg-[#0f141c] disabled:opacity-50 text-white font-bold text-xs flex items-center gap-1.5 active:scale-95 touch-manipulation border border-[#232d3b] hover:border-emerald-500/50 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Enviar</span>
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

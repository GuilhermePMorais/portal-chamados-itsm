import React, { useState } from 'react';
import { 
  Bell, 
  Mail, 
  CheckCheck, 
  X, 
  ExternalLink, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  FileText,
  Volume2
} from 'lucide-react';
import { AppNotification, User } from '../types';
import { StorageService } from '../lib/storage';
import { playNotificationSound } from '../lib/sound';

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  notifications: AppNotification[];
  onNotificationsUpdated: () => void;
  onOpenDemandDetail?: (ticketCode: string) => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  notifications,
  onNotificationsUpdated,
  onOpenDemandDetail,
}) => {
  const [selectedEmailNotif, setSelectedEmailNotif] = useState<AppNotification | null>(null);

  if (!isOpen) return null;

  const handleMarkAsRead = (id: string) => {
    StorageService.markNotificationAsRead(id);
    onNotificationsUpdated();
  };

  const handleMarkAllAsRead = () => {
    StorageService.markAllNotificationsAsRead();
    onNotificationsUpdated();
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div 
      id="notifications-backdrop" 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div 
        id="notifications-modal"
        className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Cabeçalho da Central */}
        <div className="px-5 py-4 bg-slate-50/90 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#121820] text-emerald-400 flex items-center justify-center border border-[#232d3b]">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-800 flex items-center gap-2">
                Central de Alertas &amp; Notificações
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 text-xs font-semibold bg-rose-500 text-white rounded-full">
                    {unreadCount} novos
                  </span>
                )}
              </h2>
              <p className="text-xs text-slate-500">
                Disparos em tempo real no sistema e por e-mail para Administradores e Supervisores
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => playNotificationSound()}
              title="Testar sinal sonoro de alerta"
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-200 transition-all active:scale-95 cursor-pointer"
            >
              <Volume2 className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden sm:inline">Testar Som</span>
            </button>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-emerald-700 hover:bg-white rounded-lg border border-slate-200 transition-colors cursor-pointer"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Marcar lidos
              </button>
            )}
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200 flex items-center justify-center transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Lista de Notificações */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 divide-y divide-slate-100">
          {notifications.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-600 font-medium text-sm">Nenhuma notificação recente</p>
              <p className="text-xs text-slate-400 mt-1">
                Atualizações de chamados e disparos de e-mail corporativo aparecerão aqui.
              </p>
            </div>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif.id}
                className={`pt-3 first:pt-0 p-3 rounded-xl transition-colors ${
                  notif.read ? 'bg-white hover:bg-slate-50' : 'bg-slate-50 border border-emerald-300/60'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-slate-800 text-sm">
                        {notif.title}
                      </span>
                      {notif.emailSent && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          <Mail className="w-3 h-3 text-emerald-600" />
                          E-mail Enviado aos Gestores
                        </span>
                      )}
                      {!notif.read && (
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      )}
                    </div>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                      {notif.message}
                    </p>
                    <div className="flex items-center gap-4 text-[11px] text-slate-400 pt-1">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(notif.createdAt).toLocaleString('pt-BR')}
                      </span>
                      <span>Por: {notif.senderName}</span>
                    </div>
                  </div>

                  {/* Ações da notificação */}
                  <div className="flex items-center gap-2 shrink-0">
                    {notif.emailDetails && (
                      <button
                        onClick={() => setSelectedEmailNotif(notif)}
                        title="Visualizar cópia do e-mail corporativo disparado"
                        className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-200 cursor-pointer"
                      >
                        <Mail className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="hidden sm:inline">Ver E-mail</span>
                      </button>
                    )}
                    {!notif.read && (
                      <button
                        onClick={() => handleMarkAsRead(notif.id)}
                        title="Marcar como lida"
                        className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                      >
                        <CheckCheck className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Rodapé informativo */}
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Servidor de Notificações Ativo (Dispatcher Integrado)</span>
          </div>
          <span>Destinatários: Administradores &amp; Supervisores</span>
        </div>
      </div>

      {/* Modal Interno de Preview do E-mail Enviado */}
      {selectedEmailNotif && selectedEmailNotif.emailDetails && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[85vh]">
            <div className="px-5 py-4 bg-[#121820] text-white flex items-center justify-between border-b border-[#232d3b]">
              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm sm:text-base font-bold">Cópia do E-mail Corporativo Disparado</h3>
              </div>
              <button
                onClick={() => setSelectedEmailNotif(null)}
                className="w-8 h-8 rounded-lg text-white/70 hover:text-white hover:bg-white/10 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 text-xs sm:text-sm">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-1.5 font-mono text-xs">
                <div><strong className="text-slate-700">De:</strong> {selectedEmailNotif.emailDetails.from}</div>
                <div><strong className="text-slate-700">Para:</strong> {selectedEmailNotif.emailDetails.to.join(', ')}</div>
                <div><strong className="text-slate-700">Assunto:</strong> {selectedEmailNotif.emailDetails.subject}</div>
                <div><strong className="text-slate-700">Data de Envio:</strong> {new Date(selectedEmailNotif.emailDetails.sentAt).toLocaleString('pt-BR')}</div>
              </div>

              <div 
                className="border border-slate-200 rounded-xl p-4 bg-white"
                dangerouslySetInnerHTML={{ __html: selectedEmailNotif.emailDetails.bodyHtml }}
              />
            </div>

            <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setSelectedEmailNotif(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-semibold text-xs rounded-xl"
              >
                Fechar Visualização
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

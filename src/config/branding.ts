/**
 * =====================================================================
 * CONFIGURAÇÃO GLOBAL DE MARCA E PERSONALIZAÇÃO (WHITE-LABEL)
 * =====================================================================
 * Este é o perfil público e neutro (Open Source) para publicação no GitHub.
 *
 * DICA: Se você deseja ativar o perfil corporativo da Alko para uso interno,
 * basta descomentar a linha abaixo:
 * // export { ALKO_CONFIG as COMPANY_CONFIG } from './branding.alko';
 */

export interface CompanyConfig {
  /** Nome comercial da organização */
  companyName: string;
  /** Nome fantasia ou razão social completa */
  companyFullName: string;
  /** Título do sistema exibido no cabeçalho e aba do navegador */
  systemTitle: string;
  /** Subtítulo descritivo */
  systemSubtitle: string;
  /** Sigla para código de chamados (ex: ITSM-101, TIK-101) */
  ticketPrefix: string;
  /** Domínio de e-mail corporativo padrão */
  companyDomain: string;
  /** E-mail principal do Helpdesk / Suporte */
  supportEmail: string;
  /** E-mail do Administrador Mestre */
  adminEmail: string;
  /** Cor primária de destaque (Hexadecimal) */
  primaryColor: string;
  /** URL ou caminho de logo customizado */
  customLogoUrl?: string;
  /** URL ou caminho do favicon/ícone circular */
  customIconUrl?: string;
  /** Departamentos padrão para atendimento e triagem */
  departments: string[];
  /** Texto de rodapé de conformidade e direitos */
  copyrightNotice: string;
}

export const COMPANY_CONFIG: CompanyConfig = {
  companyName: 'Portal Chamados ITSM',
  companyFullName: 'Portal de Gestão de Chamados, TI e Facilities',
  systemTitle: 'Portal Chamados ITSM',
  systemSubtitle: 'Gestão Corporativa de TI & Facilities',
  ticketPrefix: 'ITSM',
  companyDomain: 'portal-itsm.local',
  supportEmail: 'suporte@portal-itsm.local',
  adminEmail: 'admin@itsm.local',
  primaryColor: '#10b981', // Verde suave fosco inspirado em plataformas corporativas ITSM
  customLogoUrl: '',
  customIconUrl: '',
  departments: [
    'Tecnologia da Informação',
    'Infraestrutura & Redes',
    'Sistemas & Aplicações',
    'Facilities & Manutenção Predial',
    'Recursos Humanos',
    'Financeiro & Controladoria',
    'Operações & Logística',
    'Comercial & Vendas'
  ],
  copyrightNotice: `© ${new Date().getFullYear()} Portal Chamados ITSM • Plataforma Corporativa de Atendimento, SLA e Governança.`
};

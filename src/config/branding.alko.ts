// src/config/branding.ts
export { ALKO_CONFIG as COMPANY_CONFIG } from './branding.alko';

/**
 * =====================================================================
 * PERFIL CORPORATIVO INTERNO: ALKO DO BRASIL
 * =====================================================================
 * Este arquivo guarda as configurações específicas da Alko do Brasil.
 * Para ativar este perfil no ambiente interno da sua empresa, basta
 * importar este arquivo em `src/config/branding.ts`.
 */
export const ALKO_CONFIG: CompanyConfig = {
  companyName: 'Alko do Brasil',
  companyFullName: 'Alko do Brasil Indústria e Comércio de Adesivos Ltda.',
  systemTitle: 'Alko Gestão de TI',
  systemSubtitle: 'Chamados, Demandas & Facilities',
  ticketPrefix: 'ALK',
  companyDomain: 'alko.com.br',
  supportEmail: 'ti@alko.com.br',
  adminEmail: 'admin@alko.com.br',
  primaryColor: '#005088',
  customLogoUrl: '',
  customIconUrl: '/alko-round-logo.svg',
  departments: [
    'TI & Governança',
    'Infraestrutura & Redes',
    'Sistemas & ERP',
    'Facilities & Manutenção Predial',
    'Recursos Humanos',
    'Financeiro & Controladoria',
    'Operações & Logística',
    'Comercial & Vendas'
  ],
  copyrightNotice: `© ${new Date().getFullYear()} Alko do Brasil Indústria e Comércio Ltda. • Portal de Gestão Corporativa`
};

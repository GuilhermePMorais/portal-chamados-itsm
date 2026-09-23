import { AzureAdConfig, User, UserRole } from '../types';
import { StorageService } from './storage';
import { COMPANY_CONFIG } from '../config/branding';

const AZURE_CONFIG_KEY = 'alko_it_azure_ad_config_v1';

export const DEFAULT_AZURE_CONFIG: AzureAdConfig = {
  enabled: true,
  tenantId: 'aa44c3d5-f802-46e8-88d4-67a26ed08123',
  clientId: 'c44932a0-2804-4639-8fd8-821560a07313',
  redirectUri: typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000',
  defaultRole: 'Colaborador (Funcionário)',
  autoProvisionUsers: true,
  roleMappings: [
    {
      id: 'map-1',
      azureIdentifier: 'admin@itsm.local',
      assignedRole: 'Administrador',
      description: 'E-mail do Administrador Mestre do Portal',
    },
    {
      id: 'map-ti-lead',
      azureIdentifier: 'lider.ti@itsm.local',
      assignedRole: 'Administrador',
      description: 'Liderança de TI & Governança Corporativa',
    },
    {
      id: 'map-facilities-sup',
      azureIdentifier: 'supervisor.facilities@itsm.local',
      assignedRole: 'Supervisor de Facilities',
      description: 'Supervisão de Facilities & Manutenção Predial',
    },
    {
      id: 'map-group-admins',
      azureIdentifier: 'Grupo_Diretoria_Executiva',
      assignedRole: 'Administrador',
      description: 'Diretoria e Gestão Executiva',
    },
    {
      id: 'map-analyst',
      azureIdentifier: 'analista.sistemas@itsm.local',
      assignedRole: 'Analista',
      description: 'Analista de Sistemas & Redes',
    },
    {
      id: 'map-tech',
      azureIdentifier: 'suporte.tecnico@itsm.local',
      assignedRole: 'Técnico',
      description: 'Suporte Técnico Operacional',
    },
    {
      id: 'map-group-facilities',
      azureIdentifier: 'Grupo_Facilities_Manutencao',
      assignedRole: 'Técnico de Manutenção / Facilities',
      description: 'Equipe de Campo de Facilities',
    },
    {
      id: 'map-colab-default',
      azureIdentifier: 'colaborador@itsm.local',
      assignedRole: 'Colaborador (Funcionário)',
      description: 'Colaborador Solicitante Padrão',
    }
  ],
};

export const AzureAdService = {
  getConfig(): AzureAdConfig {
    try {
      const stored = localStorage.getItem(AZURE_CONFIG_KEY);
      if (!stored) {
        localStorage.setItem(AZURE_CONFIG_KEY, JSON.stringify(DEFAULT_AZURE_CONFIG));
        return DEFAULT_AZURE_CONFIG;
      }
      return JSON.parse(stored);
    } catch {
      return DEFAULT_AZURE_CONFIG;
    }
  },

  saveConfig(config: AzureAdConfig): void {
    localStorage.setItem(AZURE_CONFIG_KEY, JSON.stringify(config));
  },

  /**
   * Determina o cargo do usuário no sistema com base nas regras de mapeamento do Azure AD
   */
  resolveRole(azureProfile: {
    mailOrUpn: string;
    groups?: string[];
  }, config: AzureAdConfig): UserRole {
    const userEmail = azureProfile.mailOrUpn.toLowerCase().trim();
    const userGroups = (azureProfile.groups || []).map((g) => g.toLowerCase().trim());

    // 1. Prioridade máxima: Mapeamento direto por e-mail ou UPN
    for (const mapping of config.roleMappings) {
      if (mapping.azureIdentifier.toLowerCase().trim() === userEmail) {
        return mapping.assignedRole;
      }
    }

    // 2. Mapeamento por Grupos de Segurança ou Distribuição do Azure AD
    for (const mapping of config.roleMappings) {
      const targetGroup = mapping.azureIdentifier.toLowerCase().trim();
      if (userGroups.includes(targetGroup)) {
        return mapping.assignedRole;
      }
    }

    // 3. Fallback: Cargo padrão configurado
    return config.defaultRole;
  },

  /**
   * Processa a autenticação, provisionando ou atualizando a conta do usuário
   */
  async processAzureLogin(azureProfile: {
    displayName: string;
    mailOrUpn: string;
    department?: string;
    photoBase64?: string;
    groups?: string[];
  }): Promise<User> {
    const config = this.getConfig();
    const email = azureProfile.mailOrUpn.toLowerCase().trim();

    const users = StorageService.getUsers();
    const existing = users.find((u) => u.email.toLowerCase() === email);

    const assignedRole = this.resolveRole(azureProfile, config);

    let finalUser: User;

    if (existing) {
      // Se o usuário já existe e for Administrador, preserva a permissão
      const finalRole = existing.role === 'Administrador' 
        ? existing.role 
        : (assignedRole || existing.role || config.defaultRole);

      // Atualiza os dados com as informações do Azure AD preservando o cargo configurado
      finalUser = StorageService.saveUser({
        id: existing.id,
        name: azureProfile.displayName || existing.name,
        email: azureProfile.mailOrUpn,
        role: finalRole,
        department: existing.department || azureProfile.department || COMPANY_CONFIG.departments[0] || 'Operações',
        avatarUrl: azureProfile.photoBase64 || existing.avatarUrl,
        active: true,
      });
    } else {
      // Provisionamento automático de novo usuário vindo do Azure AD
      finalUser = StorageService.saveUser({
        name: azureProfile.displayName || 'Colaborador Solicitante',
        email: azureProfile.mailOrUpn,
        role: assignedRole,
        department: azureProfile.department || COMPANY_CONFIG.departments[0] || 'Geral',
        avatarUrl: azureProfile.photoBase64 || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        active: true,
      });
    }

    StorageService.setCurrentUser(finalUser);
    StorageService.addAuditLog(
      'Login',
      `Login via Microsoft Entra ID (Azure AD): ${finalUser.name} com perfil "${finalUser.role}"`,
      'Autenticação',
      finalUser.id
    );

    return finalUser;
  },

  /**
   * Executa a autenticação real com a Microsoft Identity Platform (OAuth 2.0 / OpenID Connect)
   */
  async loginWithMicrosoft(): Promise<User> {
    const config = this.getConfig();
    const currentOrigin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
    const isLocalhost = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
    const isHttps = typeof window !== 'undefined' && window.location.protocol === 'https:';

    // Se as credenciais reais do Azure forem informadas pelo cliente
    const isConfigured = 
      config.clientId && 
      config.clientId !== 'generic-client-app-id-azure' && 
      config.tenantId && 
      config.tenantId !== 'generic-tenant-id-corporativo';

    // Se estiver em HTTPS ou localhost, pode usar o fluxo oficial do Azure AD
    if (isConfigured && (isHttps || isLocalhost)) {
      const redirectUri = isHttps ? currentOrigin : (config.redirectUri || 'http://localhost:3000');
      
      const authEndpoint = `https://login.microsoftonline.com/${encodeURIComponent(config.tenantId)}/oauth2/v2.0/authorize`;
      const scopes = encodeURIComponent('openid profile email User.Read');
      const authUrl = `${authEndpoint}?client_id=${encodeURIComponent(config.clientId)}&response_type=token&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scopes}&prompt=select_account`;
      
      window.location.href = authUrl;
      throw new Error('Redirecionando para autenticação corporativa Microsoft...');
    }

    // Modo de demonstração conectado com perfil genérico de exemplo
    return this.processAzureLogin({
      displayName: 'Colaborador Solicitante',
      mailOrUpn: `colaborador@${COMPANY_CONFIG.companyDomain}`,
      department: COMPANY_CONFIG.departments[0] || 'Operações',
      photoBase64: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      groups: ['Colaborador'],
    });
  },

  /**
   * Captura e processa o retorno da Microsoft Identity Platform (OAuth 2.0 / Microsoft Entra ID)
   */
  async handleRedirectPromise(): Promise<User | null> {
    if (typeof window === 'undefined') return null;

    const hash = window.location.hash;
    if (!hash || !hash.includes('access_token=')) {
      return null;
    }

    try {
      const hashParams = new URLSearchParams(hash.replace(/^#/, ''));
      const accessToken = hashParams.get('access_token');
      const error = hashParams.get('error');

      if (error) {
        console.error('Erro retornado pela Microsoft:', hashParams.get('error_description') || error);
        window.history.replaceState(null, '', window.location.pathname);
        return null;
      }

      if (!accessToken) {
        return null;
      }

      // 1. Obter perfil do usuário logado via Microsoft Graph API
      const profileRes = await fetch('https://graph.microsoft.com/v1.0/me', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: 'application/json',
        },
      });

      if (!profileRes.ok) {
        console.error('Falha ao obter perfil via Microsoft Graph API', await profileRes.text());
        return null;
      }

      const meData = await profileRes.json();
      const displayName = meData.displayName || meData.givenName || 'Colaborador Microsoft';
      const mailOrUpn = meData.mail || meData.userPrincipalName || `usuario@${COMPANY_CONFIG.companyDomain}`;
      const department = meData.department || meData.jobTitle || 'Tecnologia da Informação';

      // 2. Tentar baixar a foto de perfil oficial do Microsoft 365
      let photoBase64: string | undefined;
      try {
        const photoRes = await fetch('https://graph.microsoft.com/v1.0/me/photo/$value', {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (photoRes.ok) {
          const blob = await photoRes.blob();
          photoBase64 = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(blob);
          });
        }
      } catch {
        // Foto de perfil é opcional
      }

      // 3. Obter grupos de segurança do usuário para RBAC automático
      let groups: string[] = [];
      try {
        const groupsRes = await fetch('https://graph.microsoft.com/v1.0/me/memberOf', {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: 'application/json',
          },
        });
        if (groupsRes.ok) {
          const groupsData = await groupsRes.json();
          if (Array.isArray(groupsData.value)) {
            groups = groupsData.value.map((g: any) => g.displayName || g.id);
          }
        }
      } catch {
        // Grupos são opcionais
      }

      // 4. Limpa o fragmento do hash da URL do navegador
      window.history.replaceState(null, '', window.location.pathname + window.location.search);

      // 5. Processa login e provisionamento no sistema
      return await this.processAzureLogin({
        displayName,
        mailOrUpn,
        department,
        photoBase64,
        groups,
      });
    } catch (err) {
      console.error('Erro ao processar callback do Microsoft Entra ID:', err);
      return null;
    }
  },
};

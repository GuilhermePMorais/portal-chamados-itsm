import express from 'express';
import fs from 'fs';
import path from 'path';

const app = express();
const PORT = 3000;

// Garantir pasta de dados consistente (tanto em dev quanto em dist/server.cjs)
const dataDir = process.env.DATA_DIR || path.join(process.cwd(), 'data');
const DATA_FILE = path.join(dataDir, 'alko_database.json');

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Configurar cabeçalhos CORS para permitir conexões via Túnel Cloudflare e celular
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

app.use(express.json({ limit: '15mb' }));

// Helper de leitura/gravação segura
function readData(): Record<string, any> {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Erro ao ler alko_database.json:', err);
  }
  return {};
}

function writeData(data: Record<string, any>): void {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Erro ao salvar alko_database.json:', err);
  }
}

// Endpoint de Saúde para Manter o Servidor Ativo 24/7 (UptimeRobot, Ping, Health Check)
app.get(['/health', '/api/health'], (req, res) => {
  const isMaintenance = process.env.MAINTENANCE_MODE === 'true' || process.env.MAINTENANCE_MODE === '1';
  let fileMaint = false;
  try {
    const maintFile = path.join(dataDir, 'maintenance.json');
    if (fs.existsSync(maintFile)) {
      const data = JSON.parse(fs.readFileSync(maintFile, 'utf-8'));
      fileMaint = !!data.enabled;
    }
  } catch (e) {}

  res.status(200).json({
    status: isMaintenance || fileMaint ? 'maintenance' : 'ok',
    service: 'Portal Chamados ITSM',
    maintenance: isMaintenance || fileMaint,
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString()
  });
});

// Endpoint de Status de Manutenção e Informações para Usuários
app.get('/api/maintenance', (req, res) => {
  const isEnvMaint = process.env.MAINTENANCE_MODE === 'true' || process.env.MAINTENANCE_MODE === '1';
  let maintData: any = {
    enabled: isEnvMaint,
    message: process.env.MAINTENANCE_MESSAGE || 'Estamos realizando uma manutenção preventiva programada e atualizações de segurança no sistema.',
    estimatedReturn: process.env.MAINTENANCE_UNTIL || 'Em breve',
    contactEmail: process.env.MAINTENANCE_CONTACT || 'suporte@itsm.local',
    allowedRoles: ['Administrador']
  };

  try {
    const maintFile = path.join(dataDir, 'maintenance.json');
    if (fs.existsSync(maintFile)) {
      const fileData = JSON.parse(fs.readFileSync(maintFile, 'utf-8'));
      maintData = {
        ...maintData,
        ...fileData,
        enabled: isEnvMaint || !!fileData.enabled
      };
    }
  } catch (e) {
    console.error('Erro ao ler maintenance.json:', e);
  }

  res.json(maintData);
});

// Endpoint para alternar modo de manutenção via painel de administração
app.post('/api/maintenance', (req, res) => {
  const { enabled, message, estimatedReturn } = req.body;
  const maintFile = path.join(dataDir, 'maintenance.json');
  const payload = {
    enabled: !!enabled,
    message: message || 'Estamos realizando uma manutenção preventiva programada e atualizações de segurança no sistema.',
    estimatedReturn: estimatedReturn || 'Em breve',
    updatedAt: new Date().toISOString()
  };

  try {
    fs.writeFileSync(maintFile, JSON.stringify(payload, null, 2), 'utf-8');
    console.log(`[Manutenção] Modo de manutenção atualizado: enabled=${payload.enabled}`);
    res.json({ success: true, ...payload });
  } catch (err) {
    console.error('Erro ao salvar status de manutenção:', err);
    res.status(500).json({ error: 'Falha ao gravar status de manutenção' });
  }
});

// Status do servidor para verificação de conectividade
app.get('/api/status', (req, res) => {
  const db = readData();
  res.json({
    status: 'online',
    demandsCount: Array.isArray(db.alko_it_demands_v1) ? db.alko_it_demands_v1.length : 0,
    usersCount: Array.isArray(db.alko_it_users_v1) ? db.alko_it_users_v1.length : 0,
    lastModified: db.lastModified || null,
    serverTime: new Date().toISOString()
  });
});

// API para sincronização centralizada
app.get('/api/sync', (req, res) => {
  const db = readData();
  res.json({
    success: true,
    data: db,
    timestamp: new Date().toISOString()
  });
});

app.post('/api/sync', (req, res) => {
  const incoming = req.body;
  if (!incoming || typeof incoming !== 'object') {
    return res.status(400).json({ error: 'Payload inválido' });
  }

  const current = readData();
  const updated = {
    ...current,
    ...incoming,
    lastModified: new Date().toISOString()
  };

  writeData(updated);
  console.log(`[Sync] Atualização recebida do cliente: ${Object.keys(incoming).join(', ')}`);
  res.json({ success: true, timestamp: updated.lastModified });
});

// Inicialização com Vite middleware ou arquivos estáticos de produção
async function start() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        allowedHosts: true
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`=======================================================`);
    console.log(` Servidor Portal-Chamados-ITSM rodando em http://0.0.0.0:${PORT}`);
    console.log(` Banco de dados compartilhado: ${DATA_FILE}`);
    console.log(`=======================================================`);
  });
}

start();

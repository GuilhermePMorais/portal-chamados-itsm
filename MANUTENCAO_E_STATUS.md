# Guia de Modo de Manutenção e Sinalizador de Status em Tempo Real

Este documento ensina como monitorar o status do sistema e como ativar o **Modo de Manutenção Programada** em qualquer um dos dois ambientes (**Portal Chamados ITSM** público ou **Portal Alko** privado).

---

## 1. Como Funciona o Sinalizador de Status na Tela de Login

Na barra superior da tela de login, o sistema monitora ativamente a saúde da infraestrutura e exibe apenas o sinalizador relevante:

| Status Visual | Indicador | Condição Técnica | O que os Usuários Veem |
|---|---|---|---|
| 🟢 **Online** | `Sistema Online` | Servidor respondendo com código 200 via `/api/health` | Operação normal. Usuários digitam e-mail e senha normalmente. |
| 🟠 **Manutenção** | `Sistema em Manutenção` | `MAINTENANCE_MODE=true` ou ativado no painel admin | Banner âmbar com a justificativa, previsão de conclusão e aviso de que apenas administradores podem autenticar. |
| 🔴 **Offline** | `Servidor Indisponível` | Servidor inalcançável ou sem rede | Banner informativo de falha temporária de conexão orientando a aguardar. |

---

## 2. Como Ativar o Modo de Manutenção (3 Métodos Simples)

### Método 1: Pelo Painel de Administração da Própria Aplicação (Mais Rápido)
1. Faça login como **Administrador** (`admin@itsm.local` ou seu e-mail corporativo).
2. Clique no botão **"Políticas de Segurança"** no cabeçalho ou menu lateral.
3. Role até a **Seção 5: Modo de Manutenção Programada**.
4. Ative a chave de alternância (**Toggle switch**).
5. Preencha:
   - **Mensagem de Aviso:** Ex: *"Estamos realizando uma migração de banco de dados e atualização de segurança."*
   - **Previsão de Retorno:** Ex: *"Hoje às 18:30 (estimativa de 20 minutos)."*
6. Clique em **"Salvar Diretrizes"**.

> Imediatamente, a tela de login passa a exibir o sinalizador âmbar e a mensagem oficial para qualquer usuário que acessar. Quando terminar os trabalhos, basta desativar a chave e salvar novamente.

---

### Método 2: Diretamente no Render (Para Manutenções de Infraestrutura / Deploy)
Se você for realizar um deploy pesado ou reiniciar o serviço no Render:
1. Acesse o [dashboard.render.com](https://dashboard.render.com).
2. Selecione seu serviço (`portal-chamados-itsm` ou `alko-chamados`).
3. Vá na aba **Environment**.
4. Adicione as variáveis:
   - `MAINTENANCE_MODE`: `true`
   - `MAINTENANCE_MESSAGE`: `Atualização de infraestrutura em andamento.`
   - `MAINTENANCE_UNTIL`: `17:00`
5. Clique em **Save Changes**. O Render aplicará e o sistema avisará todos os usuários.
6. Quando finalizar, basta alterar `MAINTENANCE_MODE` para `false` (ou apagar a variável).

---

### Método 3: Via Linha de Comando / API cURL
Você pode disparar via terminal ou pipeline de CI/CD:

```bash
# Ativar manutenção:
curl -X POST https://seu-sistema.onrender.com/api/maintenance \
  -H "Content-Type: application/json" \
  -d '{"enabled": true, "message": "Manutenção preventiva em andamento.", "estimatedReturn": "30 minutos"}'

# Desativar manutenção (voltar a ficar Online):
curl -X POST https://seu-sistema.onrender.com/api/maintenance \
  -H "Content-Type: application/json" \
  -d '{"enabled": false}'
```

---

## 3. Aplicação nos Dois Sistemas

- **Sistema 1 (Alko Privado):** Use para avisar os funcionários dos setores antes de manutenções no servidor local ou no Render da empresa, evitando aberturas de chamados desnecessárias enquanto o sistema estiver recebendo patches.
- **Sistema 2 (Portal Chamados ITSM Público):** Mantém a transparência operacional no seu portfólio no GitHub/LinkedIn, demonstrando governança de alto nível (ITIL) com monitoramento contínuo.

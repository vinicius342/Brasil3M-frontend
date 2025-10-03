# 🚨 Problema de Autenticação MelhorEnvio - Como Resolver

## ❌ Erro Atual
- **Status:** HTTP 401 - Unauthorized 
- **Mensagem:** "Unauthenticated"
- **Causa:** Token não está sendo aceito pela API

## 🔧 Soluções (em ordem de prioridade)

### 1. 📝 Verificar Status da Aplicação no MelhorEnvio

**Acesse:** https://sandbox.melhorenvio.com.br/dashboard/applications

**Verifique:**
- [ ] Sua aplicação está **APROVADA** (não apenas criada)
- [ ] O status não está "Pendente" ou "Em análise"
- [ ] O token mostrado corresponde ao que você está usando

### 2. 🔑 Verificar o Token

**No seu arquivo `.env`:**
```bash
VITE_MELHOR_ENVIO_TOKEN=seu_token_aqui
VITE_MELHOR_ENVIO_SANDBOX=true
```

**Certifique-se:**
- [ ] O token está correto (sem espaços extras)
- [ ] É um token de **SANDBOX** (não produção)
- [ ] Tem o formato correto: `eyJ0eXAiOiJKV1QiLCJhbGciO...`

### 3. 🌐 Verificar Configuração da Aplicação

**No painel do MelhorEnvio, configure:**
- **Nome:** Brasil 3M
- **Descrição:** Sistema de e-commerce
- **Website:** `http://localhost:8081` (ou seu domínio)
- **Callback URL:** `http://localhost:8081/callback`
- **Ambiente:** Sandbox

### 4. 🔄 Recriar Token (se necessário)

Se nada funcionar:
1. Acesse o painel do MelhorEnvio
2. Vá em "Applications"
3. Delete a aplicação atual
4. Crie uma nova aplicação
5. Aguarde aprovação
6. Copie o novo token

### 5. 🧪 Testar Token

Depois de corrigir, teste em:
`http://localhost:8081/debug`

Clique em "Testar Conectividade API" para verificar se o token funciona.

## 📞 Suporte MelhorEnvio

Se o problema persistir:
- **Chat:** https://melhorenvio.com.br
- **Email:** suporte@melhorenvio.com.br
- **Documentação:** https://docs.melhorenvio.com.br

## 🔍 Próximos Passos

1. Verifique o status da aplicação no painel
2. Confirme que o token está correto no .env
3. Teste na página /debug
4. Se ainda não funcionar, recrie a aplicação

---

**💡 Dica:** O erro 401 é muito comum e geralmente é resolvido com a aprovação da aplicação no painel do MelhorEnvio.

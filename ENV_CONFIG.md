# 🔐 Configuração de Variáveis de Ambiente

## 📁 Estrutura de Arquivos

```
brasil3M-frontend/
├── .env                    ← Desenvolvimento (GIT: ❌ ignorado)
├── .env.production         ← Produção (GIT: ✅ commitado)
└── functions/              ← Sem .env próprio (usa da raiz)
```

## 🎯 Como Funciona

### Simplificado - Um único arquivo para cada ambiente

**Desenvolvimento (.env)**
- Frontend: variáveis com `VITE_`
- Backend: variáveis sem `VITE_`
- Ambos leem do **mesmo arquivo**
- **NÃO vai para o Git** (ignorado)

**Produção (.env.production)**
- Frontend: variáveis com `VITE_`
- Backend: variáveis sem `VITE_`
- Ambos leem do **mesmo arquivo**
- **VAI para o Git** (pode commitar credenciais de teste)

## 📝 Exemplo de Estrutura

```env
# Frontend (lido pelo Vite)
VITE_MERCADOPAGO_PUBLIC_KEY=...
VITE_MERCADOPAGO_ACCESS_TOKEN=...

# Backend (lido pelas Functions)
MERCADOPAGO_PUBLIC_KEY=...
MERCADOPAGO_ACCESS_TOKEN=...
```

## 🚀 Comandos Úteis

```bash
# Desenvolvimento (usa .env)
npm run dev
cd functions && npm run serve

# Produção (usa .env.production)
npm run build
firebase deploy
```

## ⚠️ Segurança

**Desenvolvimento:**
- ✅ `.env` no .gitignore - credenciais de teste seguras
- ✅ Todos tokens no mesmo arquivo - fácil de gerenciar

**Produção:**
- ⚠️ `.env.production` pode ir para o Git **SE** usar apenas credenciais de teste
- ❌ **NUNCA** commitar credenciais REAIS de produção
- ✅ Quando for produção real, criar `.env.production.local` (ignorado pelo Git)

## 📝 Checklist para Produção REAL

Quando for usar credenciais de produção de verdade:

1. [ ] Criar `.env.production.local` (não vai pro Git)
2. [ ] Copiar conteúdo de `.env.production`
3. [ ] Substituir todas credenciais por versões REAIS
4. [ ] Mudar `SANDBOX=true` para `SANDBOX=false`
5. [ ] Build: `npm run build` (usará `.env.production.local`)
6. [ ] Deploy: `firebase deploy`

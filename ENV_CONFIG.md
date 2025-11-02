# 🔐 Configuração de Variáveis de Ambiente - ATUALIZADO

## 📁 Nova Estrutura (Segurança Melhorada)

```
brasil3M-frontend/
├── .env                    ← Desenvolvimento Frontend (GIT: ❌ ignorado)
├── .env.production         ← Produção Frontend (GIT: ✅ pode commitar)
└── functions/
    ├── .env                ← Desenvolvimento Backend (GIT: ❌ ignorado)
    └── src/index.ts        ← Backend (usa Firebase Secrets em produção)
```

## 🔄 Mudanças Importantes

### ❌ REMOVIDO do Frontend (.env.production):
- `VITE_MERCADOPAGO_ACCESS_TOKEN` - **Movido para Backend**
- `VITE_MERCADOPAGO_SANDBOX` - Não mais necessário

### ✅ ADICIONADO no Backend (functions/.env):
- `MERCADOPAGO_ACCESS_TOKEN` - Token privado, agora seguro

### 🎯 Como Funciona Agora

#### Frontend (.env.production)
Contém apenas variáveis **públicas e seguras**:
```env
# Firebase (público por design)
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_PROJECT_ID=...

# MercadoPago (apenas Public Key)
VITE_MERCADOPAGO_PUBLIC_KEY=APP_USR-xxxxx

# Melhor Envio
VITE_MELHOR_ENVIO_CLIENT_ID=...
VITE_MELHOR_ENVIO_BASE_URL=...

# Informações da empresa
VITE_COMPANY_NAME="Brasil 3M"
```

#### Backend (functions/.env)
Contém credenciais **privadas e sensíveis**:
```env
# MercadoPago Access Token (PRIVADO)
MERCADOPAGO_ACCESS_TOKEN=APP_USR-xxxxx
```

## 🚀 Setup Completo

### 1️⃣ Desenvolvimento Local

**Frontend:**
```bash
# Criar .env na raiz
cp .env.example .env
# Editar com credenciais de TESTE
```

**Backend:**
```bash
# Criar .env em functions/
cd functions
echo "MERCADOPAGO_ACCESS_TOKEN=TEST-xxxxx" > .env
```

### 2️⃣ Produção

**Frontend:**
- Arquivo `.env.production` já configurado
- Pode ir para o Git (sem credenciais sensíveis)

**Backend:**
```bash
# Configurar credenciais no Firebase Secrets
firebase functions:secrets:set MERCADOPAGO_ACCESS_TOKEN
# Cole o token de PRODUÇÃO quando solicitado
```

## � Variáveis por Serviço

### Firebase (Frontend)
```env
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=brasil-3m-91243.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=brasil-3m-91243
VITE_FIREBASE_STORAGE_BUCKET=brasil-3m-91243.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=945185087634
VITE_FIREBASE_APP_ID=1:945185087634:web:32996170fc8b147cfb464b
VITE_FIREBASE_MEASUREMENT_ID=G-2S4G3N50GD
```

### MercadoPago
**Frontend (.env.production):**
```env
VITE_MERCADOPAGO_PUBLIC_KEY=APP_USR-xxxxx
```

**Backend (functions/.env):**
```env
MERCADOPAGO_ACCESS_TOKEN=APP_USR-xxxxx-xxxxxxx
```

### Melhor Envio (Frontend)
```env
VITE_MELHOR_ENVIO_SANDBOX=false
VITE_MELHOR_ENVIO_BASE_URL=https://melhorenvio.com.br
VITE_MELHOR_ENVIO_API_VERSION=v2
VITE_MELHOR_ENVIO_CLIENT_ID=seu_client_id
VITE_MELHOR_ENVIO_CLIENT_SECRET=seu_client_secret
VITE_MELHOR_ENVIO_REDIRECT_URI=https://brasil-3m-91243.web.app/melhor-envio/callback
VITE_MELHOR_ENVIO_TOKEN=seu_token
```

### Informações da Empresa (Frontend)
```env
VITE_COMPANY_NAME="Brasil 3M"
VITE_COMPANY_DOCUMENT="12345678000199"
VITE_COMPANY_PHONE="11999999999"
VITE_COMPANY_EMAIL="contato@brasil3m.com"
VITE_COMPANY_ZIPCODE="62870-000"
```

### URLs (Frontend)
```env
VITE_APP_URL=https://brasil-3m-91243.web.app
```

## 🔐 Segurança - O que Mudou

### Antes (❌ INSEGURO):
```env
# .env.production (visível no navegador!)
VITE_MERCADOPAGO_ACCESS_TOKEN=APP_USR-xxxxx  # ❌ EXPOSTO!
```

### Agora (✅ SEGURO):
```env
# .env.production (frontend)
VITE_MERCADOPAGO_PUBLIC_KEY=APP_USR-xxxxx  # ✅ Pode ser público

# functions/.env (backend - não vai para o navegador)
MERCADOPAGO_ACCESS_TOKEN=APP_USR-xxxxx  # ✅ SEGURO!
```

## 🚀 Comandos de Deploy

```bash
# 1. Build do frontend
npm run build

# 2. Build das functions
cd functions
npm run build
cd ..

# 3. Deploy completo
firebase deploy

# Ou deploy separado:
firebase deploy --only hosting  # Apenas frontend
firebase deploy --only functions  # Apenas backend
```

## 🐛 Troubleshooting

### "MercadoPago não autorizado"
1. ✅ Public Key está no `.env.production`?
2. ✅ Access Token está no `functions/.env` (dev) ou Firebase Secrets (prod)?
3. ✅ Fez deploy das functions?

### "Variáveis undefined no frontend"
1. ✅ Variável tem prefixo `VITE_`?
2. ✅ Reiniciou o servidor após mudar `.env`?
3. ✅ Fez rebuild após alterar variáveis?

### "Functions não encontram variáveis"
1. ✅ Arquivo `functions/.env` existe?
2. ✅ `dotenv` está instalado nas functions?
3. ✅ `config()` está sendo chamado no `index.ts`?

## 📝 Checklist de Segurança

### ✅ O que PODE estar no Frontend:
- [x] Firebase Config (público por design)
- [x] MercadoPago Public Key
- [x] URLs públicas
- [x] Informações da empresa

### ❌ O que NÃO PODE estar no Frontend:
- [ ] MercadoPago Access Token (agora no backend ✅)
- [ ] Tokens privados
- [ ] Credenciais de API sensíveis

## 📚 Documentação Relacionada

- Ver `functions/DEPLOY_GUIDE.md` para guia completo de deploy
- [Vite - Environment Variables](https://vitejs.dev/guide/env-and-mode.html)
- [Firebase Functions - Environment](https://firebase.google.com/docs/functions/config-env)

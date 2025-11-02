# 🚀 Guia de Deploy - Firebase Functions

## 📋 Índice
1. [Configuração Inicial](#configuração-inicial)
2. [Desenvolvimento Local](#desenvolvimento-local)
3. [Deploy para Produção](#deploy-para-produção)
4. [Troubleshooting](#troubleshooting)

---

## 🔧 Configuração Inicial

### 1. Instalar Dependências

```bash
# Na raiz do projeto functions/
cd functions
npm install
```

### 2. Instalar Firebase CLI (se não tiver)

```bash
npm install -g firebase-tools
```

### 3. Fazer Login no Firebase

```bash
firebase login
```

---

## 💻 Desenvolvimento Local

### Passo 1: Criar arquivo .env

Crie o arquivo `functions/.env` com suas credenciais de **TESTE/DESENVOLVIMENTO**:

```env
MERCADOPAGO_ACCESS_TOKEN=TEST-seu-access-token-aqui
```

> ⚠️ **IMPORTANTE**: Use o token de TESTE do MercadoPago, não o de produção!
> ⚠️ **NUNCA** commite o arquivo `.env` no Git (já está no .gitignore)

### Passo 2: Build do TypeScript

```bash
cd functions
npm run build
```

Isso compila os arquivos `.ts` para `.js` na pasta `lib/`.

### Passo 3: Testar Localmente com Emuladores

```bash
# Na raiz do projeto (não dentro de functions/)
cd ..
firebase emulators:start --only functions
```

Isso inicia um servidor local. Você verá algo como:

```
✔  functions[us-central1-createCheckoutPreference]: http function initialized (http://127.0.0.1:5001/...)
```

### Passo 4: Testar as Functions

No seu código frontend, configure para usar o emulador local:

```typescript
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';

const functions = getFunctions();

// Apenas em desenvolvimento
if (window.location.hostname === 'localhost') {
  connectFunctionsEmulator(functions, '127.0.0.1', 5001);
}
```

---

## 🌐 Deploy para Produção

### Passo 1: Configurar Variáveis de Produção

Você tem **2 opções** para configurar as credenciais de produção:

#### Opção A: Firebase Secrets (Recomendado) ⭐

```bash
firebase functions:secrets:set MERCADOPAGO_ACCESS_TOKEN
```

O CLI vai pedir para você digitar o token. Digite o **token de PRODUÇÃO** do MercadoPago.

Para verificar se foi configurado:

```bash
firebase functions:secrets:access MERCADOPAGO_ACCESS_TOKEN
```

#### Opção B: Environment Config (Alternativa)

```bash
firebase functions:config:set mercadopago.access_token="APP-seu-token-producao"
```

Se usar esta opção, você precisa atualizar o código em `index.ts`:

```typescript
import * as functions from "firebase-functions";

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN || 
               functions.config().mercadopago?.access_token || "",
  options: {
    timeout: 20000,
  },
});
```

### Passo 2: Build Final

```bash
cd functions
npm run build
```

Verifique se não há erros de compilação.

### Passo 3: Deploy

```bash
# Voltar para a raiz do projeto
cd ..

# Deploy apenas das functions
firebase deploy --only functions
```

Você verá algo como:

```
✔  functions[createCheckoutPreference(us-central1)] Successful create operation.
✔  functions[getPaymentStatus(us-central1)] Successful create operation.

✔  Deploy complete!
```

### Passo 4: Verificar Deploy

```bash
firebase functions:list
```

Isso mostra todas as functions deployadas e suas URLs.

### Passo 5: Testar em Produção

Acesse seu site em produção e teste um checkout completo.

---

## 🐛 Troubleshooting

### Erro: "Cannot find module 'dotenv'"

```bash
cd functions
npm install dotenv
```

### Erro: "Access token is required"

- **Local**: Verifique se o arquivo `functions/.env` existe e tem o token correto
- **Produção**: Configure com `firebase functions:secrets:set MERCADOPAGO_ACCESS_TOKEN`

### Ver Logs das Functions

```bash
firebase functions:log
```

Ou no console do Firebase: https://console.firebase.google.com → Functions → Logs

### Erro: "Function deployment failed"

1. Verifique se fez login: `firebase login`
2. Verifique o projeto: `firebase projects:list`
3. Selecione o projeto correto: `firebase use seu-projeto-id`

### Testar uma Function Específica

```bash
# Deploy apenas uma function
firebase deploy --only functions:createCheckoutPreference
```

### Deletar uma Function

```bash
firebase functions:delete nomeDaFunction
```

---

## 📝 Checklist Antes do Deploy

- [ ] Arquivo `functions/.env` criado (apenas para dev local)
- [ ] `npm run build` executado sem erros
- [ ] Testado localmente com emuladores
- [ ] Variáveis de produção configuradas no Firebase
- [ ] Credenciais de PRODUÇÃO do MercadoPago configuradas
- [ ] Tokens sensíveis **NÃO** estão no código ou `.env` commitado
- [ ] URLs de callback corretas (success/failure/pending)

---

## 🔐 Segurança

### ❌ NÃO FAZER:

- Commitar arquivo `.env` no Git
- Colocar tokens no código-fonte
- Usar variáveis com prefixo `VITE_` para credenciais
- Compartilhar tokens de produção

### ✅ FAZER:

- Usar Firebase Secrets para produção
- Manter `.env` apenas localmente (já está no .gitignore)
- Usar tokens de TESTE em desenvolvimento
- Usar tokens de PRODUÇÃO apenas no Firebase

---

## 📚 Links Úteis

- [Firebase Functions Docs](https://firebase.google.com/docs/functions)
- [MercadoPago Checkout Pro](https://www.mercadopago.com.br/developers/pt/docs/checkout-pro/landing)
- [Firebase Console](https://console.firebase.google.com)

---

## 🆘 Suporte

Se algo não funcionar:

1. Verifique os logs: `firebase functions:log`
2. Teste localmente primeiro com emuladores
3. Verifique se as variáveis de ambiente estão configuradas
4. Consulte a documentação oficial do Firebase

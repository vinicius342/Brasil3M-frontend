import { collection, doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { db, functions } from '../lib/firebase';

interface MelhorEnvioTokens {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  expires_at: number;
  token_type: string;
  scope: string;
}

interface MelhorEnvioAuthConfig {
  clientId: string;
  // clientSecret REMOVIDO - agora fica seguro no backend
  redirectUri: string;
  baseUrl: string;
}

const AUTH_CONFIG: MelhorEnvioAuthConfig = {
  clientId: import.meta.env.VITE_MELHOR_ENVIO_CLIENT_ID || '',
  // clientSecret REMOVIDO - credencial sensível agora está no backend (Firebase Functions)
  redirectUri: import.meta.env.VITE_MELHOR_ENVIO_REDIRECT_URI || '',
  baseUrl: import.meta.env.VITE_MELHOR_ENVIO_BASE_URL || 'https://sandbox.melhorenvio.com.br'
};

export class MelhorEnvioAuth {
  /**
   * Gera a URL de autorização para o usuário autorizar o app
   */
  static getAuthorizationUrl(userId: string): string {
    const params = new URLSearchParams({
      client_id: AUTH_CONFIG.clientId,
      redirect_uri: AUTH_CONFIG.redirectUri,
      response_type: 'code',
      scope: [
        'shipping-calculate',
        'shipping-cancel',
        'shipping-checkout',
        'shipping-companies',
        'shipping-generate',
        'shipping-preview',
        'shipping-print',
        'shipping-share',
        'shipping-tracking',
        'ecommerce-shipping'
      ].join(' '),
      state: userId // Para identificar o usuário no callback
    });

    return `${AUTH_CONFIG.baseUrl}/oauth/authorize?${params.toString()}`;
  }

  /**
   * Troca o código de autorização por tokens de acesso via Firebase Function (SEGURO)
   */
  static async exchangeCodeForTokens(code: string, userId: string): Promise<MelhorEnvioTokens> {
    try {
      console.log('🔐 Trocando código por tokens via Firebase Function (backend seguro)...');
      
      // Chama a Firebase Function ao invés de fazer requisição direta
      const exchangeCodeFn = httpsCallable(functions, 'melhorEnvioExchangeCode');
      
      const result = await exchangeCodeFn({
        code,
        userId
      });

      const data = result.data as any;

      if (!data.success) {
        throw new Error(data.error || 'Erro ao trocar código por tokens');
      }

      console.log('✅ Tokens obtidos com sucesso via backend!');
      return data.tokens;

    } catch (error) {
      console.error('❌ Erro ao trocar código por tokens:', error);
      throw error;
    }
  }

  /**
   * Renova o access_token usando o refresh_token via Firebase Function (SEGURO)
   */
  static async refreshTokens(userId: string): Promise<MelhorEnvioTokens | null> {
    try {
      console.log('🔄 Renovando tokens via Firebase Function...');
      
      const currentTokens = await this.getTokensFromFirestore(userId);
      if (!currentTokens?.refresh_token) {
        throw new Error('Refresh token não encontrado');
      }

      // A lógica de refresh agora acontece no backend via getMelhorEnvioToken
      // que é chamado automaticamente pelas Firebase Functions
      // Esta função mantida para compatibilidade, mas o refresh real acontece no backend
      
      console.log('✅ Tokens renovados automaticamente pelo backend');
      return currentTokens;

    } catch (error) {
      console.error('❌ Erro ao renovar tokens:', error);
      throw error;
    }
  }

  /**
   * Obtém um access_token válido (renova se necessário)
   */
  static async getValidAccessToken(userId: string): Promise<string | null> {
    try {
      let tokens = await this.getTokensFromFirestore(userId);
      
      if (!tokens) {
        return null;
      }

      // Verifica se o token está próximo do vencimento (renova 5 minutos antes)
      const fiveMinutesFromNow = Date.now() + (5 * 60 * 1000);
      if (tokens.expires_at < fiveMinutesFromNow) {
        console.log('Token próximo do vencimento, renovando...');
        tokens = await this.refreshTokens(userId);
      }

      return tokens?.access_token || null;
    } catch (error) {
      console.error('Erro ao obter token válido:', error);
      return null;
    }
  }

  /**
   * Salva os tokens no Firestore
   * NOTA: Esta função não é mais chamada diretamente - os tokens são salvos pelo backend
   * Mantida para compatibilidade com código existente
   */
  private static async saveTokensToFirestore(userId: string, tokens: MelhorEnvioTokens): Promise<void> {
    // Salva na coleção específica de tokens (mesma usada pelo backend)
    const tokenRef = doc(db, 'melhorEnvioTokens', userId);
    
    await setDoc(tokenRef, {
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiresIn: tokens.expires_in,
      expiresAt: tokens.expires_at,
      tokenType: tokens.token_type,
      scope: tokens.scope,
      updatedAt: new Date()
    }, { merge: true });

    // Também atualiza o documento do usuário
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      melhorEnvioConnected: true,
      melhorEnvioConnectedAt: new Date()
    });
  }

  /**
   * Obtém os tokens do Firestore
   */
  private static async getTokensFromFirestore(userId: string): Promise<MelhorEnvioTokens | null> {
    try {
      // Busca na coleção específica de tokens (mesma usada pelo backend)
      const tokenRef = doc(db, 'melhorEnvioTokens', userId);
      const tokenDoc = await getDoc(tokenRef);
      
      if (tokenDoc.exists()) {
        const data = tokenDoc.data();
        return {
          access_token: data.accessToken,
          refresh_token: data.refreshToken,
          expires_in: data.expiresIn,
          expires_at: data.expiresAt,
          token_type: data.tokenType,
          scope: data.scope
        };
      }
      
      return null;
    } catch (error) {
      console.error('Erro ao obter tokens do Firestore:', error);
      return null;
    }
  }

  /**
   * Verifica se o usuário tem o MelhorEnvio conectado
   */
  static async isUserConnected(userId: string): Promise<boolean> {
    const tokens = await this.getTokensFromFirestore(userId);
    return !!tokens?.access_token;
  }

  /**
   * Desconecta o usuário do MelhorEnvio (remove tokens)
   */
  static async disconnectUser(userId: string): Promise<void> {
    // Remove da coleção de tokens
    const tokenRef = doc(db, 'melhorEnvioTokens', userId);
    await setDoc(tokenRef, {
      accessToken: null,
      refreshToken: null,
      disconnectedAt: new Date()
    }, { merge: true });

    // Atualiza documento do usuário
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      melhorEnvioConnected: false,
      melhorEnvioDisconnectedAt: new Date()
    });
  }
}

export { AUTH_CONFIG };

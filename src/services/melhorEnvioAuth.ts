import { collection, doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

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
  clientSecret: string;
  redirectUri: string;
  baseUrl: string;
}

const AUTH_CONFIG: MelhorEnvioAuthConfig = {
  clientId: import.meta.env.VITE_MELHOR_ENVIO_CLIENT_ID || '',
  clientSecret: import.meta.env.VITE_MELHOR_ENVIO_CLIENT_SECRET || '',
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
   * Troca o código de autorização por tokens de acesso
   */
  static async exchangeCodeForTokens(code: string, userId: string): Promise<MelhorEnvioTokens> {
    try {
      const response = await fetch(`${AUTH_CONFIG.baseUrl}/oauth/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          grant_type: 'authorization_code',
          client_id: AUTH_CONFIG.clientId,
          client_secret: AUTH_CONFIG.clientSecret,
          redirect_uri: AUTH_CONFIG.redirectUri,
          code: code
        })
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Erro na autenticação: ${error}`);
      }

      const tokens: Omit<MelhorEnvioTokens, 'expires_at'> = await response.json();
      
      // Adiciona o timestamp de expiração
      const tokensWithExpiry: MelhorEnvioTokens = {
        ...tokens,
        expires_at: Date.now() + (tokens.expires_in * 1000)
      };

      // Salva os tokens no Firestore
      await this.saveTokensToFirestore(userId, tokensWithExpiry);

      return tokensWithExpiry;
    } catch (error) {
      console.error('Erro ao trocar código por tokens:', error);
      throw error;
    }
  }

  /**
   * Renova o access_token usando o refresh_token
   */
  static async refreshTokens(userId: string): Promise<MelhorEnvioTokens | null> {
    try {
      const currentTokens = await this.getTokensFromFirestore(userId);
      if (!currentTokens?.refresh_token) {
        throw new Error('Refresh token não encontrado');
      }

      const response = await fetch(`${AUTH_CONFIG.baseUrl}/oauth/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          grant_type: 'refresh_token',
          client_id: AUTH_CONFIG.clientId,
          client_secret: AUTH_CONFIG.clientSecret,
          refresh_token: currentTokens.refresh_token
        })
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Erro ao renovar token: ${error}`);
      }

      const newTokens: Omit<MelhorEnvioTokens, 'expires_at'> = await response.json();
      
      const tokensWithExpiry: MelhorEnvioTokens = {
        ...newTokens,
        expires_at: Date.now() + (newTokens.expires_in * 1000)
      };

      // Atualiza os tokens no Firestore
      await this.saveTokensToFirestore(userId, tokensWithExpiry);

      return tokensWithExpiry;
    } catch (error) {
      console.error('Erro ao renovar tokens:', error);
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
   */
  private static async saveTokensToFirestore(userId: string, tokens: MelhorEnvioTokens): Promise<void> {
    const userRef = doc(db, 'users', userId);
    
    await updateDoc(userRef, {
      melhorEnvioTokens: tokens,
      melhorEnvioConnected: true,
      melhorEnvioConnectedAt: new Date()
    });
  }

  /**
   * Obtém os tokens do Firestore
   */
  private static async getTokensFromFirestore(userId: string): Promise<MelhorEnvioTokens | null> {
    try {
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        const data = userDoc.data();
        return data.melhorEnvioTokens || null;
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
    const userRef = doc(db, 'users', userId);
    
    await updateDoc(userRef, {
      melhorEnvioTokens: null,
      melhorEnvioConnected: false,
      melhorEnvioDisconnectedAt: new Date()
    });
  }
}

export { AUTH_CONFIG };

/**
 * Firebase Functions para Brasil 3M Marketplace
 * 
 * Funções de Pagamento (MercadoPago):
 * - createCheckoutPreference: Cria preferência de pagamento para Checkout Pro
 * - getPaymentStatus: Consulta status de um pagamento
 * 
 * Funções de Frete (Melhor Envio):
 * - calculateShipping: Calcula frete com Melhor Envio
 * - trackShipment: Rastreia pedido
 * - melhorEnvioExchangeCode: Troca código OAuth por tokens
 */

import {setGlobalOptions} from "firebase-functions";
import {onCall, HttpsError} from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import {initializeApp} from "firebase-admin/app";
import {getFirestore} from "firebase-admin/firestore";
import {MercadoPagoConfig, Payment, Preference} from "mercadopago";
import {config} from "dotenv";

// Carrega variáveis de ambiente do .env (apenas em desenvolvimento local)
config();

// Initialize Firebase Admin
initializeApp();

// Limitar instâncias para controle de custos
setGlobalOptions({ maxInstances: 10 });

// MercadoPago Configuration
// Em produção, use Firebase Environment Configuration (firebase functions:config:set)
const mercadoPagoClient = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN || "",
  options: {
    timeout: 20000,
  },
});

// Melhor Envio Configuration
const MELHOR_ENVIO_CONFIG = {
  baseUrl: process.env.MELHOR_ENVIO_BASE_URL || 'https://sandbox.melhorenvio.com.br',
  apiVersion: 'v2',
  clientId: process.env.MELHOR_ENVIO_CLIENT_ID || '',
  clientSecret: process.env.MELHOR_ENVIO_CLIENT_SECRET || '',
  token: process.env.MELHOR_ENVIO_TOKEN || '', // Token padrão (fallback)
  redirectUri: process.env.MELHOR_ENVIO_REDIRECT_URI || ''
};

// Checkout Pro - Criar Preferência
// Cria uma preferência de pagamento e retorna URL para redirecionamento
exports.createCheckoutPreference = onCall(async (request) => {
  try {
    const { items, payer, back_urls, external_reference } = request.data;
    
    if (!items || !Array.isArray(items) || items.length === 0) {
      throw new HttpsError('invalid-argument', 'Items são obrigatórios');
    }

    logger.info('🚀 Criando preferência Checkout Pro:', { 
      itemsCount: items.length,
      external_reference 
    });

    const preference = new Preference(mercadoPagoClient);
    
    const body = {
      items: items.map((item: any, index: number) => ({
        id: item.id || `item_${index}`,
        title: item.title,
        description: item.description || '',
        quantity: Number(item.quantity),
        currency_id: 'BRL',
        unit_price: Number(item.unit_price)
      })),
      payer: {
        name: payer?.name || '',
        surname: payer?.surname || '',
        email: payer?.email || '',
        identification: payer?.identification || {}
      },
      back_urls: {
        success: back_urls?.success || `https://brasil-3m-91243.web.app/checkout/success`,
        failure: back_urls?.failure || `https://brasil-3m-91243.web.app/checkout/failure`, 
        pending: back_urls?.pending || `https://brasil-3m-91243.web.app/checkout/pending`
      },
      external_reference: external_reference || `order_${Date.now()}`,
      statement_descriptor: 'BRASIL3M',
      expires: true,
      expiration_date_from: new Date().toISOString(),
      expiration_date_to: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24h
    };

    const result = await preference.create({ body });
    
    logger.info('✅ Preferência criada:', { 
      id: result.id,
      init_point: result.init_point 
    });

    return {
      success: true,
      data: {
        id: result.id,
        init_point: result.init_point,
        sandbox_init_point: result.sandbox_init_point
      }
    };
  } catch (error: any) {
    logger.error('❌ Erro ao criar preferência:', error);
    
    return {
      success: false,
      error: error.message || 'Erro ao criar preferência de pagamento',
      details: error.response?.data || null
    };
  }
});

// Get Payment Status
// Consulta o status de um pagamento específico
exports.getPaymentStatus = onCall(async (request) => {
  try {
    const { paymentId } = request.data;

    if (!paymentId) {
      throw new HttpsError('invalid-argument', 'Payment ID é obrigatório');
    }

    const payment = new Payment(mercadoPagoClient);
    const result = await payment.get({ id: paymentId });
    
    logger.info('✅ Payment status:', { 
      id: result.id,
      status: result.status 
    });
    
    return {
      success: true,
      data: result
    };
  } catch (error: any) {
    logger.error('❌ Erro ao buscar status do pagamento:', error);
    
    return {
      success: false,
      error: error.message || 'Erro ao buscar status do pagamento',
      details: error.response?.data || null
    };
  }
});

// =============================================================================
// MELHOR ENVIO - FUNÇÕES DE FRETE E RASTREAMENTO
// =============================================================================

/**
 * Função auxiliar para obter token OAuth2 do usuário
 */
async function getMelhorEnvioToken(userId?: string): Promise<string> {
  if (!userId) {
    return MELHOR_ENVIO_CONFIG.token; // Token padrão
  }

  try {
    const db = getFirestore();
    const userDoc = await db.collection('users').doc(userId).get();
    
    if (!userDoc.exists) {
      return MELHOR_ENVIO_CONFIG.token;
    }

    const userData = userDoc.data();
    const tokens = userData?.melhorEnvioTokens;
    
    if (!tokens?.access_token) {
      return MELHOR_ENVIO_CONFIG.token;
    }

    // Verificar se token está expirado
    const expiresAt = tokens.expires_at || 0;
    const fiveMinutesFromNow = Date.now() + (5 * 60 * 1000);
    
    if (expiresAt < fiveMinutesFromNow) {
      logger.info('🔄 Token expirado, renovando...');
      
      // Renovar token
      if (tokens.refresh_token) {
        const newTokens = await refreshMelhorEnvioToken(tokens.refresh_token);
        
        // Atualizar no Firestore
        await db.collection('users').doc(userId).update({
          melhorEnvioTokens: newTokens,
          melhorEnvioConnectedAt: new Date()
        });
        
        return newTokens.access_token;
      }
    }

    return tokens.access_token;
  } catch (error) {
    logger.error('Erro ao obter token:', error);
    return MELHOR_ENVIO_CONFIG.token;
  }
}

/**
 * Função auxiliar para renovar token OAuth2
 */
async function refreshMelhorEnvioToken(refreshToken: string) {
  const response = await fetch(
    `${MELHOR_ENVIO_CONFIG.baseUrl}/oauth/token`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        grant_type: 'refresh_token',
        client_id: MELHOR_ENVIO_CONFIG.clientId,
        client_secret: MELHOR_ENVIO_CONFIG.clientSecret,
        refresh_token: refreshToken
      })
    }
  );

  if (!response.ok) {
    const error = await response.text();
    logger.error('Erro ao renovar token:', error);
    throw new Error('Erro ao renovar token');
  }

  const tokens = await response.json();
  
  return {
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token,
    expires_in: tokens.expires_in,
    expires_at: Date.now() + (tokens.expires_in * 1000),
    token_type: tokens.token_type,
    scope: tokens.scope
  };
}

/**
 * Calcular Frete com Melhor Envio
 */
exports.calculateShipping = onCall(async (request) => {
  try {
    const { originCep, destinationCep, weight, dimensions, userId } = request.data;

    // Validações
    if (!originCep || !destinationCep || !weight || !dimensions) {
      throw new HttpsError('invalid-argument', 'Dados incompletos para cálculo de frete');
    }

    logger.info('📦 Calculando frete:', {
      originCep,
      destinationCep,
      weight,
      userId: userId || 'sem usuário'
    });

    // Obter token (OAuth do usuário ou token padrão)
    const accessToken = await getMelhorEnvioToken(userId);

    if (!accessToken) {
      throw new HttpsError('failed-precondition', 'Token do Melhor Envio não configurado');
    }

    const requestBody = {
      from: {
        postal_code: originCep.replace(/\D/g, '')
      },
      to: {
        postal_code: destinationCep.replace(/\D/g, '')
      },
      package: {
        height: Number(dimensions.height),
        width: Number(dimensions.width),
        length: Number(dimensions.length),
        weight: Number(weight)
      },
      options: {
        insurance_value: 100,
        receipt: false,
        own_hand: false
      },
      services: "1,2,3" // PAC, SEDEX, Jadlog
    };

    logger.info('📋 Request body:', JSON.stringify(requestBody));

    const response = await fetch(
      `${MELHOR_ENVIO_CONFIG.baseUrl}/api/${MELHOR_ENVIO_CONFIG.apiVersion}/me/shipment/calculate`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
          'User-Agent': 'Brasil3M/1.0'
        },
        body: JSON.stringify(requestBody)
      }
    );

    const responseText = await response.text();
    logger.info('📊 Response status:', response.status);
    logger.info('📄 Response:', responseText);

    if (!response.ok) {
      logger.error('❌ Erro Melhor Envio:', responseText);
      throw new HttpsError('internal', 'Erro ao calcular frete');
    }

    const data = JSON.parse(responseText);
    
    if (!Array.isArray(data) || data.length === 0) {
      logger.warn('⚠️ Nenhuma cotação retornada');
      throw new HttpsError('not-found', 'Nenhuma opção de frete disponível');
    }

    const quotes = data.map((service: any) => ({
      id: service.id?.toString() || Math.random().toString(),
      name: service.name || 'Serviço',
      price: parseFloat(service.price) || 0,
      deliveryTime: `${service.delivery_time || 0} dias úteis`,
      company: service.company?.name || 'Transportadora',
      service: service.name || 'Serviço'
    }));

    logger.info('✅ Cotações processadas:', { count: quotes.length });
    
    return {
      success: true,
      quotes
    };

  } catch (error: any) {
    logger.error('💥 Erro ao calcular frete:', error);
    
    if (error instanceof HttpsError) {
      throw error;
    }
    
    throw new HttpsError('internal', error.message || 'Erro ao calcular frete');
  }
});

/**
 * Rastrear Pedido com Melhor Envio
 */
exports.trackShipment = onCall(async (request) => {
  try {
    const { trackingCode, userId } = request.data;

    if (!trackingCode) {
      throw new HttpsError('invalid-argument', 'Código de rastreamento obrigatório');
    }

    logger.info('📍 Rastreando pedido:', trackingCode);

    const accessToken = await getMelhorEnvioToken(userId);

    if (!accessToken) {
      throw new HttpsError('failed-precondition', 'Token não configurado');
    }

    const response = await fetch(
      `${MELHOR_ENVIO_CONFIG.baseUrl}/api/${MELHOR_ENVIO_CONFIG.apiVersion}/me/shipment/tracking`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
          'User-Agent': 'Brasil3M/1.0'
        },
        body: JSON.stringify({
          orders: [trackingCode]
        })
      }
    );

    if (!response.ok) {
      const error = await response.text();
      logger.error('❌ Erro ao rastrear:', error);
      throw new HttpsError('internal', 'Erro ao rastrear pedido');
    }

    const data = await response.json();
    
    logger.info('✅ Rastreamento obtido');

    return {
      success: true,
      tracking: data[trackingCode] || null
    };

  } catch (error: any) {
    logger.error('💥 Erro ao rastrear:', error);
    
    if (error instanceof HttpsError) {
      throw error;
    }
    
    throw new HttpsError('internal', error.message || 'Erro ao rastrear pedido');
  }
});

/**
 * Trocar código OAuth por tokens (OAuth2 Flow)
 */
exports.melhorEnvioExchangeCode = onCall(async (request) => {
  try {
    const { code, userId } = request.data;

    if (!code || !userId) {
      throw new HttpsError('invalid-argument', 'Código e userId são obrigatórios');
    }

    logger.info('🔑 Trocando código por tokens:', { userId });

    const response = await fetch(
      `${MELHOR_ENVIO_CONFIG.baseUrl}/oauth/token`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          grant_type: 'authorization_code',
          client_id: MELHOR_ENVIO_CONFIG.clientId,
          client_secret: MELHOR_ENVIO_CONFIG.clientSecret,
          redirect_uri: MELHOR_ENVIO_CONFIG.redirectUri,
          code: code
        })
      }
    );

    if (!response.ok) {
      const error = await response.text();
      logger.error('❌ Erro ao trocar código:', error);
      throw new HttpsError('internal', 'Erro na autenticação com Melhor Envio');
    }

    const tokens = await response.json();
    
    // Adicionar timestamp de expiração
    const tokensWithExpiry = {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expires_in: tokens.expires_in,
      expires_at: Date.now() + (tokens.expires_in * 1000),
      token_type: tokens.token_type,
      scope: tokens.scope
    };

    // Salvar no Firestore
    const db = getFirestore();
    await db.collection('users').doc(userId).update({
      melhorEnvioTokens: tokensWithExpiry,
      melhorEnvioConnected: true,
      melhorEnvioConnectedAt: new Date()
    });

    logger.info('✅ Tokens salvos com sucesso');

    return {
      success: true,
      message: 'Conta Melhor Envio conectada com sucesso'
    };

  } catch (error: any) {
    logger.error('💥 Erro ao trocar código:', error);
    
    if (error instanceof HttpsError) {
      throw error;
    }
    
    throw new HttpsError('internal', error.message || 'Erro ao conectar conta');
  }
});


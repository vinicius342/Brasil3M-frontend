/**
 * Firebase Functions para integração com MercadoPago Checkout Pro
 * 
 * Funções disponíveis:
 * - createCheckoutPreference: Cria preferência de pagamento para Checkout Pro
 * - getPaymentStatus: Consulta status de um pagamento
 */

import {setGlobalOptions} from "firebase-functions";
import {onCall, HttpsError} from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import {initializeApp} from "firebase-admin/app";
import {MercadoPagoConfig, Payment, Preference} from "mercadopago";

// Initialize Firebase Admin
initializeApp();

// Limitar instâncias para controle de custos
setGlobalOptions({ maxInstances: 10 });

// MercadoPago Configuration
// Lê variáveis do .env da raiz (com prefixo VITE_ ou sem)
const client = new MercadoPagoConfig({
  accessToken: process.env.VITE_MERCADOPAGO_ACCESS_TOKEN || 
               process.env.MERCADOPAGO_ACCESS_TOKEN || "",
  options: {
    timeout: 20000,
  },
});

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

    const preference = new Preference(client);
    
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

    const payment = new Payment(client);
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


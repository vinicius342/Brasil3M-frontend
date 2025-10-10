/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import {setGlobalOptions} from "firebase-functions";
import {onCall, HttpsError} from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import {initializeApp} from "firebase-admin/app";
import {MercadoPagoConfig, Payment, Preference} from "mercadopago";

// Initialize Firebase Admin
initializeApp();

// For cost control, you can set the maximum number of containers that can be
// running at the same time. This helps mitigate the impact of unexpected
// traffic spikes by instead downgrading performance. This limit is a
// per-function limit. You can override the limit for each function using the
// `maxInstances` option in the function's options, e.g.
// `onRequest({ maxInstances: 5 }, (req, res) => { ... })`.
// NOTE: setGlobalOptions does not apply to functions using the v1 API. V1
// functions should each use functions.runWith({ maxInstances: 10 }) instead.
// In the v1 API, each function can only serve one request per container, so
// this will be the maximum concurrent request count.
setGlobalOptions({ maxInstances: 10 });

// MercadoPago Configuration
const MP_CONFIG = {
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN || "",
  integratorId: process.env.MERCADOPAGO_INTEGRATOR_ID || null,
  sandbox: process.env.MERCADOPAGO_SANDBOX === "true",
  webhookUrl: process.env.MERCADOPAGO_WEBHOOK_URL || "",
};

// Initialize MercadoPago client
const client = new MercadoPagoConfig({
  accessToken: MP_CONFIG.accessToken,
  options: {
    timeout: 20000,
  },
});

// Processamento de pagamento com cartão
exports.processCardPayment = onCall(async (request) => {
  try {
    const { token, transaction_amount, installments, payment_method_id, payer, description, issuer_id } = request.data;

    const payment = new Payment(client);
    
    // Gerar X-Idempotency-Key único
    const idempotencyKey = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const body = {
      transaction_amount: Number(transaction_amount),
      token,
      description: description || 'Payment from Brasil3M',
      installments: Number(installments),
      payment_method_id,
      issuer_id: Number(issuer_id), // Obrigatório para pagamentos com cartão
      payer: {
        ...payer,
        type: payer.type || 'customer',
        entity_type: payer.entity_type || 'individual'
      }
    };

    const requestOptions = {
      body,
      requestOptions: {
        idempotencyKey // Cabeçalho obrigatório
      }
    };

    const result = await payment.create(requestOptions);
    
    console.log('Payment created:', result);
    return result;
  } catch (mpError: any) {
      logger.error("Erro específico do MercadoPago", {
        error: String(mpError),
        message: mpError?.message || "Erro desconhecido",
        response: JSON.stringify(mpError?.response || {}),
        apiResponse: JSON.stringify(mpError?.api_response || {}),
        status: mpError?.status || mpError?.response?.status || "Sem status",
        data: JSON.stringify(mpError?.response?.data || mpError?.data || {}),
        stack: mpError?.stack,
        // Capturar propriedades específicas do MercadoPago SDK
        mercadoPagoError: JSON.stringify({
          cause: mpError?.cause,
          details: mpError?.details,
          body: mpError?.body,
        }),
      });
      throw mpError;
    }
});

// Process PIX Payment
// Criação de pagamento PIX
exports.createPixPayment = onCall(async (request) => {
  try {
    const { transaction_amount, payer, description } = request.data;

    const payment = new Payment(client);
    
    // Gerar X-Idempotency-Key único
    const idempotencyKey = `pix-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const body = {
      transaction_amount: Number(transaction_amount),
      description: description || 'PIX Payment from Brasil3M',
      payment_method_id: 'pix',
      payer: {
        ...payer,
        type: payer.type || 'customer',
        entity_type: payer.entity_type || 'individual'
      }
    };

    const requestOptions = {
      body,
      requestOptions: {
        idempotencyKey
      }
    };

    const result = await payment.create(requestOptions);
    
    console.log('PIX Payment created:', result);
    return result;
  } catch (error: any) {
    console.error('Error creating PIX payment:', error);
    throw new HttpsError('internal', 'Error creating PIX payment: ' + (error.message || 'Unknown error'));
  }
});

// Process Boleto Payment
// Criação de pagamento Boleto
exports.createBoletoPayment = onCall(async (request) => {
  try {
    const { transaction_amount, payer, description } = request.data;

    const payment = new Payment(client);
    
    // Gerar X-Idempotency-Key único
    const idempotencyKey = `boleto-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const body = {
      transaction_amount: Number(transaction_amount),
      description: description || 'Boleto Payment from Brasil3M',
      payment_method_id: 'bolbradesco',
      payer: {
        ...payer,
        type: payer.type || 'customer',
        entity_type: payer.entity_type || 'individual'
      }
    };

    const requestOptions = {
      body,
      requestOptions: {
        idempotencyKey
      }
    };

    const result = await payment.create(requestOptions);
    
    console.log('Boleto Payment created:', result);
    return result;
  } catch (error: any) {
    console.error('Error creating Boleto payment:', error);
    throw new HttpsError('internal', 'Error creating Boleto payment: ' + (error.message || 'Unknown error'));
  }
});

// Get Payment Status
// Consulta status do pagamento
exports.getPaymentStatus = onCall(async (request) => {
  try {
    const { paymentId } = request.data;

    const payment = new Payment(client);
    const result = await payment.get({ id: paymentId });
    
    console.log('Payment status:', result);
    return result;
  } catch (error: any) {
    console.error('Error getting payment status:', error);
    throw new HttpsError('internal', 'Error getting payment status: ' + (error.message || 'Unknown error'));
  }
});

// Checkout Pro - Criar Preferência
// Muito mais simples que o checkout transparente!
exports.createCheckoutPreference = onCall(async (request) => {
  try {
    const { items, payer, back_urls, external_reference } = request.data;
    
    if (!items || !Array.isArray(items) || items.length === 0) {
      throw new HttpsError('invalid-argument', 'Items são obrigatórios');
    }

    console.log('🚀 Criando preferência Checkout Pro:', { 
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
      // Removendo auto_return para evitar problemas com URLs localhost
      // auto_return: 'approved',
      external_reference: external_reference || `order_${Date.now()}`,
      statement_descriptor: 'BRASIL3M',
      expires: true,
      expiration_date_from: new Date().toISOString(),
      expiration_date_to: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24h
    };

    const result = await preference.create({ body });
    
    console.log('✅ Preferência criada:', { 
      id: result.id,
      init_point: result.init_point 
    });

    return {
      success: true,
      data: {
        id: result.id,
        init_point: result.init_point, // URL para redirecionar
        sandbox_init_point: result.sandbox_init_point
      }
    };
  } catch (error: any) {
    console.error('❌ Erro ao criar preferência:', error);
    
    return {
      success: false,
      error: error.message || 'Erro ao criar preferência de pagamento',
      details: error.response?.data || null
    };
  }
});

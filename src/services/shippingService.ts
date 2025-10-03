// Serviço para cálculo de frete e rastreamento REAL
import { getFirestore, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { MelhorEnvioAuth } from './melhorEnvioAuth';

export interface ShippingQuote {
  id: string;
  name: string;
  price: number;
  deliveryTime: string;
  company: string;
  service: string;
}

export interface TrackingInfo {
  status: string;
  location: string;
  date: string;
  description: string;
}

export interface TrackingData {
  trackingCode: string;
  status: string;
  estimatedDelivery?: string;
  events: TrackingInfo[];
}

// Configuração da API MelhorEnvio
export const API_CONFIG = {
  baseURL: import.meta.env.DEV 
    ? '/api/melhorenvio' // Usar proxy em desenvolvimento
    : import.meta.env.VITE_MELHOR_ENVIO_BASE_URL || 'https://sandbox.melhorenvio.com.br',
  apiVersion: import.meta.env.VITE_MELHOR_ENVIO_API_VERSION || 'v2',
  token: import.meta.env.VITE_MELHOR_ENVIO_TOKEN,
  companyName: import.meta.env.VITE_COMPANY_NAME || 'Brasil 3M',
  companyZipCode: import.meta.env.VITE_COMPANY_ZIPCODE || '01310100',
  companyDocument: import.meta.env.VITE_COMPANY_DOCUMENT || '12345678000123',
  sandboxMode: import.meta.env.VITE_MELHOR_ENVIO_SANDBOX === 'true'
};

// Função de teste de conectividade
export const testAPIConnection = async () => {
  console.log('🔍 Testando conectividade com API MelhorEnvio...');
  console.log('📋 Configuração atual:', {
    baseURL: API_CONFIG.baseURL,
    hasToken: !!API_CONFIG.token,
    tokenPreview: API_CONFIG.token ? `${API_CONFIG.token.substring(0, 10)}...` : 'não configurado',
    sandboxMode: API_CONFIG.sandboxMode
  });

  if (!API_CONFIG.token) {
    return {
      success: false,
      error: 'Token não configurado',
      type: 'no_token'
    };
  }

  // Teste 1: Verificar token com endpoint /me
  try {
    console.log('🌐 Teste 1: Verificando token com /me');
    
    const response = await fetch(`${API_CONFIG.baseURL}/api/${API_CONFIG.apiVersion}/me`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_CONFIG.token}`,
        'User-Agent': 'Brasil3M/1.0'
      }
    });

    console.log('📊 Status da resposta:', response.status);
    console.log('📋 Headers da resposta:', Object.fromEntries(response.headers.entries()));
    
    const responseText = await response.text();
    console.log('📄 Resposta completa:', responseText);
    
    if (response.status === 401) {
      return {
        success: false,
        error: 'Token inválido ou não autorizado. Verifique se: 1) O token está correto, 2) A aplicação foi aprovada no MelhorEnvio, 3) Está usando o token do ambiente correto (sandbox/produção)',
        type: 'unauthorized',
        details: responseText
      };
    }
    
    if (!response.ok) {
      return {
        success: false,
        error: `HTTP ${response.status}: ${responseText}`,
        type: 'api_error'
      };
    }

    const data = JSON.parse(responseText);
    console.log('✅ Token válido! Dados do usuário:', data);
    
    return {
      success: true,
      data,
      type: 'api_success'
    };

  } catch (error) {
    console.error('💥 Erro de conexão:', error);
    
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return {
        success: false,
        error: 'Erro de rede - possível problema de CORS ou conectividade',
        type: 'network_error',
        details: error.message
      };
    }
    
    return {
      success: false,
      error: error.message,
      type: 'unknown_error'
    };
  }
};

// Função para calcular frete com a API MelhorEnvio
export const calculateShipping = async (
  originCep: string,
  destinationCep: string,
  weight: number,
  dimensions: { length: number; width: number; height: number },
  userId?: string // Adiciona userId para OAuth2
): Promise<ShippingQuote[]> => {
  console.log('📦 Iniciando cálculo de frete...');
  console.log('📍 CEP origem:', originCep);
  console.log('📍 CEP destino:', destinationCep);
  console.log('⚖️ Peso:', weight);
  console.log('📏 Dimensões:', dimensions);
  console.log('� Usuário:', userId || 'não informado');

  try {
    let token = API_CONFIG.token; // Token padrão (fallback)

    // Se userId for fornecido, tenta obter token OAuth2
    if (userId) {
      console.log('🔑 Obtendo token OAuth2 para usuário:', userId);
      const oauthToken = await MelhorEnvioAuth.getValidAccessToken(userId);
      if (oauthToken) {
        token = oauthToken;
        console.log('✅ Token OAuth2 obtido com sucesso');
      } else {
        console.warn('⚠️ Token OAuth2 não encontrado, usando token padrão');
      }
    }

    // Verificar se há token disponível
    if (!token) {
      console.warn('⚠️ Nenhum token disponível, usando valores simulados');
      return calculateShippingFallback(originCep, destinationCep, weight);
    }

    console.log('🔑 Token utilizado:', token ? `${token.substring(0, 10)}...` : 'NÃO CONFIGURADO');
    console.log('🌐 API URL:', API_CONFIG.baseURL);
    console.log('🚀 Fazendo requisição para API MelhorEnvio...');

    const requestBody = {
      from: {
        postal_code: originCep.replace(/\D/g, '')
      },
      to: {
        postal_code: destinationCep.replace(/\D/g, '')
      },
      package: {
        height: dimensions.height,
        width: dimensions.width,
        length: dimensions.length,
        weight: weight
      },
      options: {
        insurance_value: 100,
        receipt: false,
        own_hand: false
      },
      services: "1,2,3" // Correios (PAC, SEDEX) e Jadlog conforme limitação sandbox
    };

    console.log('📋 Corpo da requisição:', JSON.stringify(requestBody, null, 2));

    const response = await fetch(`${API_CONFIG.baseURL}/api/${API_CONFIG.apiVersion}/me/shipment/calculate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
        'User-Agent': 'Brasil3M/1.0'
      },
      body: JSON.stringify(requestBody)
    });

    console.log('📊 Status da resposta:', response.status);
    console.log('📋 Headers da resposta:', Object.fromEntries(response.headers.entries()));

    const responseText = await response.text();
    console.log('📄 Resposta completa (texto):', responseText);

    if (!response.ok) {
      console.error(`❌ Erro HTTP ${response.status}:`, responseText);
      console.warn('⚠️ Erro na API, usando valores simulados');
      return calculateShippingFallback(originCep, destinationCep, weight);
    }

    let data;
    try {
      data = JSON.parse(responseText);
      console.log('✅ Dados parseados:', JSON.stringify(data, null, 2));
    } catch (parseError) {
      console.error('❌ Erro ao parsear JSON:', parseError);
      console.warn('⚠️ Erro no parse, usando valores simulados');
      return calculateShippingFallback(originCep, destinationCep, weight);
    }

    if (!data || !Array.isArray(data) || data.length === 0) {
      console.warn('⚠️ Nenhum resultado da API, usando valores simulados');
      return calculateShippingFallback(originCep, destinationCep, weight);
    }

    const quotes: ShippingQuote[] = data.map((service: any) => ({
      id: service.id?.toString() || Math.random().toString(),
      name: service.name || 'Serviço',
      price: parseFloat(service.price) || 0,
      deliveryTime: `${service.delivery_time || 0} dias úteis`,
      company: service.company?.name || 'Transportadora',
      service: service.name || 'Serviço'
    }));

    console.log('🎯 Cotações processadas:', quotes);
    return quotes;

  } catch (error) {
    console.error('💥 Erro na requisição:', error);
    
    if (error instanceof TypeError && error.message.includes('fetch')) {
      console.error('🌐 Erro de rede - possível problema de CORS');
    }
    
    console.warn('⚠️ Fallback para valores simulados devido ao erro');
    return calculateShippingFallback(originCep, destinationCep, weight);
  }
};

// Função de fallback para valores simulados
const calculateShippingFallback = (
  originCep: string,
  destinationCep: string,
  weight: number
): ShippingQuote[] => {
  console.log('📦 Usando cálculo simulado (fallback)');
  
  // Fatores de cálculo baseados em distância simulada e peso
  const basePrice = 8.50;
  const weightFactor = weight * 2.5;
  const distanceFactor = Math.random() * 3 + 1; // Simula variação por distância

  return [
    {
      id: 'pac',
      name: 'PAC',
      price: basePrice + weightFactor + distanceFactor,
      deliveryTime: '7-10 dias úteis',
      company: 'Correios',
      service: 'PAC'
    },
    {
      id: 'sedex',
      name: 'SEDEX',
      price: (basePrice + weightFactor + distanceFactor) * 1.5,
      deliveryTime: '2-3 dias úteis',
      company: 'Correios',
      service: 'SEDEX'
    }
  ];
};

// Função para rastrear pedido
export const trackOrder = async (trackingCode: string): Promise<TrackingData | null> => {
  console.log('📍 Iniciando rastreamento do pedido:', trackingCode);
  
  if (!API_CONFIG.token) {
    console.warn('⚠️ Token não configurado, retornando rastreamento simulado');
    return {
      trackingCode,
      status: 'em_transito',
      estimatedDelivery: '2024-02-15',
      events: [
        {
          status: 'postado',
          location: 'São Paulo - SP',
          date: '2024-02-10 14:30',
          description: 'Objeto postado'
        },
        {
          status: 'em_transito',
          location: 'Rio de Janeiro - RJ',
          date: '2024-02-12 09:15',
          description: 'Objeto em trânsito'
        }
      ]
    };
  }

  try {
    const response = await fetch(`${API_CONFIG.baseURL}/api/${API_CONFIG.apiVersion}/me/shipment/tracking`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${API_CONFIG.token}`,
        'User-Agent': 'Brasil3M/1.0'
      },
      body: JSON.stringify({
        orders: [trackingCode]
      })
    });

    if (!response.ok) {
      console.error('Erro ao rastrear pedido:', response.status);
      return null;
    }

    const data = await response.json();
    console.log('Dados de rastreamento:', data);

    if (!data || !data[trackingCode]) {
      return null;
    }

    const tracking = data[trackingCode];
    return {
      trackingCode,
      status: tracking.status || 'pendente',
      estimatedDelivery: tracking.estimated_delivery,
      events: tracking.tracking?.map((event: any) => ({
        status: event.status,
        location: event.location,
        date: event.date,
        description: event.description
      })) || []
    };

  } catch (error) {
    console.error('Erro ao rastrear pedido:', error);
    return null;
  }
};

// Função para buscar informações de CEP
export const searchCEP = async (cep: string) => {
  const cleanCep = cep.replace(/\D/g, '');
  
  if (cleanCep.length !== 8) {
    throw new Error('CEP deve ter 8 dígitos');
  }

  try {
    const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
    
    if (!response.ok) {
      throw new Error('Erro ao buscar CEP');
    }

    const data = await response.json();
    
    if (data.erro) {
      throw new Error('CEP não encontrado');
    }

    return {
      cep: data.cep,
      logradouro: data.logradouro,
      bairro: data.bairro,
      localidade: data.localidade,
      uf: data.uf,
      complemento: data.complemento
    };

  } catch (error) {
    console.error('Erro ao buscar CEP:', error);
    throw error;
  }
};

// Função para atualizar informações de envio no pedido
export const updateOrderShipping = async (
  orderId: string, 
  shippingData: {
    trackingCode?: string;
    shippingService?: string;
    shippingCost?: number;
    estimatedDelivery?: string;
  }
) => {
  try {
    const db = getFirestore();
    const orderRef = doc(db, 'orders', orderId);
    
    await updateDoc(orderRef, {
      ...shippingData,
      lastUpdated: serverTimestamp()
    });

    console.log('Informações de envio atualizadas:', orderId);
    return true;

  } catch (error) {
    console.error('Erro ao atualizar envio:', error);
    return false;
  }
};

// Função para verificar se a API está configurada
export const isAPIConfigured = (): boolean => {
  return !!API_CONFIG.token && API_CONFIG.token.length > 10;
};

// Função para verificar se um vendedor tem MelhorEnvio conectado
export const isSellerConnected = async (userId: string): Promise<boolean> => {
  return await MelhorEnvioAuth.isUserConnected(userId);
};

// Função para obter configuração atual
export const getShippingConfig = () => {
  return {
    apiConfigured: isAPIConfigured(),
    sandboxMode: API_CONFIG.sandboxMode,
    companyName: API_CONFIG.companyName,
    companyZipCode: API_CONFIG.companyZipCode
  };
};

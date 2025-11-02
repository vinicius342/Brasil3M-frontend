// Serviço para cálculo de frete e rastreamento via Firebase Functions (SEGURO)
import { getFirestore, doc, updateDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { functions } from '@/lib/firebase';

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

// Configuração da API MelhorEnvio (apenas dados públicos - SEM credenciais)
export const API_CONFIG = {
  baseURL: import.meta.env.VITE_MELHOR_ENVIO_BASE_URL || 'https://sandbox.melhorenvio.com.br',
  apiVersion: import.meta.env.VITE_MELHOR_ENVIO_API_VERSION || 'v2',
  // token REMOVIDO - agora fica seguro no backend (Firebase Functions)
  companyName: import.meta.env.VITE_COMPANY_NAME || 'Brasil 3M',
  companyZipCode: import.meta.env.VITE_COMPANY_ZIPCODE || '01310100',
  companyDocument: import.meta.env.VITE_COMPANY_DOCUMENT || '12345678000123',
  sandboxMode: import.meta.env.VITE_MELHOR_ENVIO_SANDBOX === 'true'
};

// Função para calcular frete via Firebase Function (SEGURO - credenciais no backend)
export const calculateShipping = async (
  originCep: string,
  destinationCep: string,
  weight: number,
  dimensions: { length: number; width: number; height: number },
  userId?: string
): Promise<ShippingQuote[]> => {
  console.log('📦 Calculando frete via Firebase Functions (SEGURO)...');
  console.log('📍 CEP origem:', originCep);
  console.log('📍 CEP destino:', destinationCep);
  console.log('⚖️ Peso:', weight);
  console.log('📏 Dimensões:', dimensions);
  console.log('👤 Usuário:', userId || 'não informado');

  try {
    // Chama a Firebase Function ao invés de fazer requisição direta
    const calculateShippingFn = httpsCallable(functions, 'calculateShipping');
    
    const result = await calculateShippingFn({
      originCep,
      destinationCep,
      weight,
      dimensions,
      userId
    });

    const data = result.data as any;
    
    if (!data.success) {
      console.error('❌ Erro na Firebase Function:', data.error);
      throw new Error(data.error || 'Erro ao calcular frete');
    }

    console.log('✅ Frete calculado com sucesso via backend!');
    return data.quotes;

  } catch (error) {
    console.error('💥 Erro ao calcular frete:', error);
    // Não usar valores simulados - lançar erro real para o usuário
    throw new Error(
      error instanceof Error 
        ? error.message 
        : 'Não foi possível calcular o frete no momento. Tente novamente em alguns instantes.'
    );
  }
};

// Função para rastrear pedido via Firebase Function (SEGURO)
export const trackOrder = async (trackingCode: string, userId?: string): Promise<TrackingData | null> => {
  console.log('📍 Rastreando pedido via Firebase Functions:', trackingCode);
  
  try {
    // Chama a Firebase Function ao invés de fazer requisição direta
    const trackShipmentFn = httpsCallable(functions, 'trackShipment');
    
    const result = await trackShipmentFn({
      trackingCode,
      userId
    });

    const data = result.data as any;
    
    if (!data.success) {
      console.error('❌ Erro ao rastrear pedido:', data.error);
      return null;
    }

    console.log('✅ Rastreamento obtido com sucesso via backend!');
    return data.trackingData;

  } catch (error) {
    console.error('💥 Erro ao rastrear pedido:', error);
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

// Função para verificar se a API está configurada (Firebase Functions sempre disponíveis)
export const isAPIConfigured = (): boolean => {
  return true; // Firebase Functions sempre disponíveis se projeto configurado
};

// Função para verificar se um vendedor tem MelhorEnvio conectado
export const isSellerConnected = async (userId: string): Promise<boolean> => {
  try {
    const db = getFirestore();
    const userDoc = await getDoc(doc(db, 'melhorEnvioTokens', userId));
    return userDoc.exists() && userDoc.data()?.accessToken !== undefined;
  } catch (error) {
    console.error('Erro ao verificar conexão Melhor Envio:', error);
    return false;
  }
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

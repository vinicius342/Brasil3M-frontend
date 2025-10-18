// Serviço de pagamento integrado com MercadoPago Checkout Pro via Firebase Functions
import { httpsCallable } from 'firebase/functions';
import { functions } from '@/lib/firebase';

// Tipos para Checkout Pro
export interface CheckoutPreferenceData {
  items: Array<{
    id?: string;
    title: string;
    description?: string;
    quantity: number;
    unit_price: number;
  }>;
  payer: {
    name: string;
    surname: string;
    email: string;
    identification?: {
      type: string;
      number: string;
    };
  };
  back_urls?: {
    success?: string;
    failure?: string;
    pending?: string;
  };
  external_reference?: string;
}

export interface CheckoutPreferenceResult {
  success: boolean;
  data?: {
    id: string;
    init_point: string;
    sandbox_init_point: string;
  };
  error?: string;
  details?: any;
}

export interface PaymentStatus {
  success: boolean;
  data?: {
    id: string;
    status: 'approved' | 'pending' | 'rejected' | 'cancelled';
    status_detail: string;
    payment_method_id?: string;
    payment_type_id?: string;
    transaction_amount?: number;
    date_created?: string;
    date_approved?: string;
    external_reference?: string;
  };
  error?: string;
}

class PaymentService {
  /**
   * Cria preferência para Checkout Pro
   * Esta é a função principal para iniciar um pagamento
   */
  async createCheckoutPreference(
    preferenceData: CheckoutPreferenceData
  ): Promise<CheckoutPreferenceResult> {
    try {
      console.log('🚀 Criando preferência Checkout Pro...');
      
      const createPreference = httpsCallable(functions, 'createCheckoutPreference');
      const result = await createPreference(preferenceData);
      
      console.log('✅ Preferência criada com sucesso');
      return result.data as CheckoutPreferenceResult;
    } catch (error: any) {
      console.error('❌ Erro ao criar preferência:', error);
      return {
        success: false,
        error: error.message || 'Erro ao criar preferência de pagamento',
        details: error
      };
    }
  }

  /**
   * Busca status de um pagamento específico
   * Útil para as páginas de retorno (success, failure, pending)
   */
  async getPaymentStatus(paymentId: string): Promise<PaymentStatus> {
    try {
      console.log('🔍 Buscando status do pagamento:', paymentId);
      
      const getStatus = httpsCallable(functions, 'getPaymentStatus');
      const result = await getStatus({ paymentId });
      
      console.log('✅ Status obtido com sucesso');
      return result.data as PaymentStatus;
    } catch (error: any) {
      console.error('❌ Erro ao buscar status:', error);
      return {
        success: false,
        error: error.message || 'Erro ao buscar status do pagamento'
      };
    }
  }

  /**
   * Verifica se o serviço está configurado corretamente
   */
  isConfigured(): boolean {
    // Com Checkout Pro, apenas verificamos se a PUBLIC_KEY existe
    // O ACCESS_TOKEN está no backend (mais seguro)
    const publicKey = import.meta.env.VITE_MERCADOPAGO_PUBLIC_KEY;
    
    return !!publicKey;
  }
}

// Instância singleton
export const paymentService = new PaymentService();
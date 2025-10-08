// Serviço de pagamento integrado com MercadoPago
import { getFirestore, doc, updateDoc, serverTimestamp } from 'firebase/firestore';

// Declarações de tipo para MercadoPago
declare global {
  interface Window {
    MercadoPago: any;
  }
}

// Configuração do MercadoPago
const MP_CONFIG = {
  publicKey: import.meta.env.VITE_MERCADOPAGO_PUBLIC_KEY || '',
  accessToken: import.meta.env.VITE_MERCADOPAGO_ACCESS_TOKEN || '',
  integratorId: import.meta.env.VITE_MERCADOPAGO_INTEGRATOR_ID || null,
  sandbox: import.meta.env.VITE_MERCADOPAGO_SANDBOX === 'true',
  webhookUrl: import.meta.env.VITE_MERCADOPAGO_WEBHOOK_URL || ''
};

// Tipos para MercadoPago
export interface PaymentData {
  amount: number;
  description: string;
  paymentMethodId: string;
  token?: string;
  installments?: number;
  email: string;
  firstName: string;
  lastName: string;
  identification?: {
    type: string;
    number: string;
  };
  orderId: string;
}

export interface PaymentResult {
  id: string;
  status: 'approved' | 'pending' | 'rejected' | 'cancelled';
  statusDetail: string;
  paymentMethodId: string;
  paymentTypeId: string;
  transactionAmount: number;
  dateCreated: string;
  dateApproved?: string;
  qrCode?: string;
  qrCodeBase64?: string;
  ticketUrl?: string;
  externalReference: string;
}

export interface PixPaymentData {
  amount: number;
  description: string;
  email: string;
  firstName: string;
  lastName: string;
  orderId: string;
}

export interface BoletoPaymentData {
  amount: number;
  description: string;
  email: string;
  firstName: string;
  lastName: string;
  identification: {
    type: string;
    number: string;
  };
  orderId: string;
}

class PaymentService {
  private mp: any = null;
  private cardForm: any = null;

  /**
   * Gera headers padrão para requisições do MercadoPago
   */
  private getApiHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${MP_CONFIG.accessToken}`
    };

    // Adicionar integrator_id se disponível
    if (MP_CONFIG.integratorId) {
      headers['X-Integrator-Id'] = MP_CONFIG.integratorId;
    }

    return headers;
  }

  /**
   * Inicializa o SDK do MercadoPago
   */
  async initializeMercadoPago(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.mp) {
        resolve();
        return;
      }

      // Carregar script do MercadoPago
      const script = document.createElement('script');
      script.src = 'https://sdk.mercadopago.com/js/v2';
      script.onload = () => {
        try {
          // @ts-ignore - MercadoPago global object
          if (typeof window.MercadoPago === 'undefined') {
            reject(new Error('MercadoPago SDK não foi carregado corretamente'));
            return;
          }

          const config: any = {
            locale: 'pt-BR'
          };
          
          // Adicionar integrator_id se disponível
          if (MP_CONFIG.integratorId) {
            config.integrator_id = MP_CONFIG.integratorId;
          }
          
          // @ts-ignore - MercadoPago constructor
          this.mp = new window.MercadoPago(MP_CONFIG.publicKey, config);
          console.log('✅ MercadoPago SDK inicializado com sucesso');
          resolve();
        } catch (error) {
          console.error('❌ Erro ao inicializar MercadoPago SDK:', error);
          reject(error);
        }
      };
      script.onerror = () => reject(new Error('Erro ao carregar SDK do MercadoPago'));
      document.head.appendChild(script);
    });
  }

  /**
   * Cria formulário seguro de cartão
   */
  async createCardForm(containerId: string, onSubmit: (data: any) => void): Promise<void> {
    if (!this.mp) {
      await this.initializeMercadoPago();
    }

    this.cardForm = this.mp.cardForm({
      amount: '0',
      autoMount: true,
      form: {
        id: containerId,
        cardholderName: {
          id: 'form-checkout__cardholderName',
          placeholder: 'Titular do cartão',
        },
        cardholderEmail: {
          id: 'form-checkout__cardholderEmail',
          placeholder: 'E-mail',
        },
        cardNumber: {
          id: 'form-checkout__cardNumber',
          placeholder: 'Número do cartão',
        },
        expirationDate: {
          id: 'form-checkout__expirationDate',
          placeholder: 'MM/YY',
        },
        securityCode: {
          id: 'form-checkout__securityCode',
          placeholder: 'CVV',
        },
        installments: {
          id: 'form-checkout__installments',
          placeholder: 'Parcelas',
        },
        identificationType: {
          id: 'form-checkout__identificationType',
          placeholder: 'Tipo de documento',
        },
        identificationNumber: {
          id: 'form-checkout__identificationNumber',
          placeholder: 'Número do documento',
        },
        issuer: {
          id: 'form-checkout__issuer',
          placeholder: 'Banco emissor',
        }
      },
      callbacks: {
        onFormMounted: (error: any) => {
          if (error) console.error('Erro ao montar formulário:', error);
        },
        onSubmit: (event: Event) => {
          event.preventDefault();
          onSubmit(this.cardForm.getCardFormData());
        },
        onFetching: (resource: string) => {
          console.log('Buscando:', resource);
        }
      }
    });
  }

  /**
   * Cria token do cartão usando o SDK do MercadoPago
   */
  async createCardToken(cardData: {
    cardNumber: string;
    cardholderName: string;
    expirationMonth: string;
    expirationYear: string;
    securityCode: string;
    identificationType: string;
    identificationNumber: string;
  }): Promise<string> {
    if (!this.mp) {
      await this.initializeMercadoPago();
    }

    try {
      const tokenResponse = await this.mp.createCardToken({
        cardNumber: cardData.cardNumber,
        cardholderName: cardData.cardholderName,
        cardExpirationMonth: cardData.expirationMonth,
        cardExpirationYear: cardData.expirationYear,
        securityCode: cardData.securityCode,
        identificationType: cardData.identificationType,
        identificationNumber: cardData.identificationNumber
      });

      return tokenResponse.id;
    } catch (error) {
      console.error('Erro ao criar token do cartão:', error);
      throw new Error('Erro ao processar dados do cartão. Verifique as informações.');
    }
  }

  /**
   * Atualiza o valor no formulário de cartão
   */
  updateCardFormAmount(amount: number): void {
    if (this.cardForm) {
      this.cardForm.update({ amount: amount.toString() });
    }
  }

  /**
   * Processa pagamento com cartão de crédito
   */
  async processCardPayment(paymentData: PaymentData): Promise<PaymentResult> {
    try {
      const requestBody = {
        transaction_amount: paymentData.amount,
        token: paymentData.token,
        description: paymentData.description,
        installments: paymentData.installments || 1,
        payment_method_id: paymentData.paymentMethodId,
        issuer_id: paymentData.token, // O token já contém essas informações
        payer: {
          email: paymentData.email,
          first_name: paymentData.firstName,
          last_name: paymentData.lastName,
          identification: paymentData.identification
        },
        external_reference: paymentData.orderId,
        notification_url: MP_CONFIG.webhookUrl,
        statement_descriptor: 'BRASIL3M'
      };

      const response = await fetch(`https://api.mercadopago.com/v1/payments`, {
        method: 'POST',
        headers: {
          ...this.getApiHeaders(),
          'X-Idempotency-Key': `${paymentData.orderId}-${Date.now()}`
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Erro no pagamento: ${errorData.message || response.statusText}`);
      }

      const result = await response.json();
      
      // Atualizar status do pedido no Firebase
      await this.updateOrderPaymentStatus(paymentData.orderId, {
        paymentId: result.id,
        status: result.status,
        statusDetail: result.status_detail,
        paymentMethod: result.payment_method_id,
        transactionAmount: result.transaction_amount,
        dateCreated: result.date_created,
        dateApproved: result.date_approved
      });

      return {
        id: result.id,
        status: result.status,
        statusDetail: result.status_detail,
        paymentMethodId: result.payment_method_id,
        paymentTypeId: result.payment_type_id,
        transactionAmount: result.transaction_amount,
        dateCreated: result.date_created,
        dateApproved: result.date_approved,
        externalReference: result.external_reference
      };
    } catch (error) {
      console.error('Erro ao processar pagamento:', error);
      throw error;
    }
  }

  /**
   * Cria pagamento PIX
   */
  async createPixPayment(paymentData: PixPaymentData): Promise<PaymentResult> {
    try {
      const requestBody = {
        transaction_amount: paymentData.amount,
        description: paymentData.description,
        payment_method_id: 'pix',
        payer: {
          email: paymentData.email,
          first_name: paymentData.firstName,
          last_name: paymentData.lastName
        },
        external_reference: paymentData.orderId,
        notification_url: MP_CONFIG.webhookUrl,
        date_of_expiration: new Date(Date.now() + 30 * 60 * 1000).toISOString() // 30 minutos
      };

      const response = await fetch(`https://api.mercadopago.com/v1/payments`, {
        method: 'POST',
        headers: {
          ...this.getApiHeaders(),
          'X-Idempotency-Key': `${paymentData.orderId}-pix-${Date.now()}`
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Erro no pagamento PIX: ${errorData.message || response.statusText}`);
      }

      const result = await response.json();

      // Atualizar status do pedido no Firebase
      await this.updateOrderPaymentStatus(paymentData.orderId, {
        paymentId: result.id,
        status: result.status,
        statusDetail: result.status_detail,
        paymentMethod: 'pix',
        transactionAmount: result.transaction_amount,
        dateCreated: result.date_created,
        pixQrCode: result.point_of_interaction?.transaction_data?.qr_code,
        pixQrCodeBase64: result.point_of_interaction?.transaction_data?.qr_code_base64
      });

      return {
        id: result.id,
        status: result.status,
        statusDetail: result.status_detail,
        paymentMethodId: 'pix',
        paymentTypeId: 'bank_transfer',
        transactionAmount: result.transaction_amount,
        dateCreated: result.date_created,
        qrCode: result.point_of_interaction?.transaction_data?.qr_code,
        qrCodeBase64: result.point_of_interaction?.transaction_data?.qr_code_base64,
        externalReference: result.external_reference
      };
    } catch (error) {
      console.error('Erro ao criar pagamento PIX:', error);
      throw error;
    }
  }

  /**
   * Cria pagamento com boleto
   */
  async createBoletoPayment(paymentData: BoletoPaymentData): Promise<PaymentResult> {
    try {
      const requestBody = {
        transaction_amount: paymentData.amount,
        description: paymentData.description,
        payment_method_id: 'bolbradesco', // ou outro banco
        payer: {
          email: paymentData.email,
          first_name: paymentData.firstName,
          last_name: paymentData.lastName,
          identification: paymentData.identification
        },
        external_reference: paymentData.orderId,
        notification_url: MP_CONFIG.webhookUrl,
        date_of_expiration: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString() // 3 dias
      };

      const response = await fetch(`https://api.mercadopago.com/v1/payments`, {
        method: 'POST',
        headers: {
          ...this.getApiHeaders(),
          'X-Idempotency-Key': `${paymentData.orderId}-boleto-${Date.now()}`
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Erro no pagamento boleto: ${errorData.message || response.statusText}`);
      }

      const result = await response.json();

      // Atualizar status do pedido no Firebase
      await this.updateOrderPaymentStatus(paymentData.orderId, {
        paymentId: result.id,
        status: result.status,
        statusDetail: result.status_detail,
        paymentMethod: 'boleto',
        transactionAmount: result.transaction_amount,
        dateCreated: result.date_created,
        boletoUrl: result.transaction_details?.external_resource_url
      });

      return {
        id: result.id,
        status: result.status,
        statusDetail: result.status_detail,
        paymentMethodId: result.payment_method_id,
        paymentTypeId: 'ticket',
        transactionAmount: result.transaction_amount,
        dateCreated: result.date_created,
        ticketUrl: result.transaction_details?.external_resource_url,
        externalReference: result.external_reference
      };
    } catch (error) {
      console.error('Erro ao criar pagamento boleto:', error);
      throw error;
    }
  }

  /**
   * Busca status de pagamento
   */
  async getPaymentStatus(paymentId: string): Promise<PaymentResult> {
    try {
      const response = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
        headers: this.getApiHeaders()
      });

      if (!response.ok) {
        throw new Error(`Erro ao buscar pagamento: ${response.statusText}`);
      }

      const result = await response.json();

      return {
        id: result.id,
        status: result.status,
        statusDetail: result.status_detail,
        paymentMethodId: result.payment_method_id,
        paymentTypeId: result.payment_type_id,
        transactionAmount: result.transaction_amount,
        dateCreated: result.date_created,
        dateApproved: result.date_approved,
        externalReference: result.external_reference
      };
    } catch (error) {
      console.error('Erro ao buscar status do pagamento:', error);
      throw error;
    }
  }

  /**
   * Processa webhook do MercadoPago
   */
  async processWebhook(webhookData: any): Promise<void> {
    try {
      if (webhookData.type === 'payment') {
        const paymentId = webhookData.data.id;
        const paymentStatus = await this.getPaymentStatus(paymentId);
        
        if (paymentStatus.externalReference) {
          await this.updateOrderPaymentStatus(paymentStatus.externalReference, {
            status: paymentStatus.status,
            statusDetail: paymentStatus.statusDetail,
            dateApproved: paymentStatus.dateApproved
          });
        }
      }
    } catch (error) {
      console.error('Erro ao processar webhook:', error);
      throw error;
    }
  }

  /**
   * Atualiza status do pagamento no Firebase
   */
  private async updateOrderPaymentStatus(orderId: string, paymentData: any): Promise<void> {
    try {
      const db = getFirestore();
      const orderRef = doc(db, 'orders', orderId);
      
      await updateDoc(orderRef, {
        paymentStatus: paymentData.status,
        paymentDetails: {
          ...paymentData,
          updatedAt: serverTimestamp()
        },
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Erro ao atualizar status do pedido:', error);
      throw error;
    }
  }

  /**
   * Obtém métodos de pagamento disponíveis
   */
  async getPaymentMethods(): Promise<any[]> {
    try {
      const response = await fetch('https://api.mercadopago.com/v1/payment_methods', {
        headers: this.getApiHeaders()
      });

      if (!response.ok) {
        throw new Error('Erro ao buscar métodos de pagamento');
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao buscar métodos de pagamento:', error);
      return [];
    }
  }

  /**
   * Verifica se o serviço está configurado
   */
  isConfigured(): boolean {
    return !!(MP_CONFIG.publicKey && MP_CONFIG.accessToken);
  }
}

// Instância singleton
export const paymentService = new PaymentService();

// Configuração exportada
export { MP_CONFIG };
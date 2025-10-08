import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Alert, AlertDescription } from './ui/alert';
import { Loader2, CreditCard, Smartphone, FileText } from 'lucide-react';
import { paymentService, PaymentData, PixPaymentData, BoletoPaymentData } from '@/services/paymentService';
import { useToast } from '@/hooks/use-toast';

interface PaymentFormProps {
  amount: number;
  description: string;
  orderId: string;
  paymentMethod: 'credit' | 'pix' | 'boleto';
  customerData: {
    email: string;
    firstName: string;
    lastName: string;
    cpf?: string;
  };
  onPaymentSuccess: (result: any) => void;
  onPaymentError: (error: any) => void;
}

const PaymentForm: React.FC<PaymentFormProps> = ({
  amount,
  description,
  orderId,
  paymentMethod,
  customerData,
  onPaymentSuccess,
  onPaymentError
}) => {
  const { toast } = useToast();
  const cardFormRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);
  const [mpLoaded, setMpLoaded] = useState(false);
  const [paymentResult, setPaymentResult] = useState<any>(null);

  // Estados para formulários não-cartão
  const [pixData, setPixData] = useState({
    email: customerData.email,
    firstName: customerData.firstName,
    lastName: customerData.lastName
  });

  const [boletoData, setBoletoData] = useState({
    email: customerData.email,
    firstName: customerData.firstName,
    lastName: customerData.lastName,
    cpf: customerData.cpf || ''
  });

  // Inicializar MercadoPago quando o componente carrega
  useEffect(() => {
    const initMP = async () => {
      try {
        await paymentService.initializeMercadoPago();
        setMpLoaded(true);

        // Se é cartão, criar o formulário
        if (paymentMethod === 'credit' && cardFormRef.current) {
          await paymentService.createCardForm('card-form', handleCardFormSubmit);
          paymentService.updateCardFormAmount(amount);
        }
      } catch (error) {
        console.error('Erro ao inicializar MercadoPago:', error);
        toast({
          variant: "destructive",
          title: "Erro",
          description: "Erro ao carregar sistema de pagamento."
        });
      }
    };

    initMP();
  }, [paymentMethod, amount, toast]);

  // Atualizar valor quando amount muda
  useEffect(() => {
    if (mpLoaded && paymentMethod === 'credit') {
      paymentService.updateCardFormAmount(amount);
    }
  }, [amount, mpLoaded, paymentMethod]);

  // Handler para submissão do formulário de cartão
  const handleCardFormSubmit = async (cardFormData: any) => {
    setLoading(true);
    try {
      if (!cardFormData.token) {
        throw new Error('Token do cartão não gerado');
      }

      const paymentData: PaymentData = {
        amount,
        description,
        paymentMethodId: cardFormData.payment_method_id,
        token: cardFormData.token,
        installments: cardFormData.installments,
        email: customerData.email,
        firstName: customerData.firstName,
        lastName: customerData.lastName,
        identification: {
          type: cardFormData.payer?.identification?.type || 'CPF',
          number: cardFormData.payer?.identification?.number || customerData.cpf || ''
        },
        orderId
      };

      const result = await paymentService.processCardPayment(paymentData);
      setPaymentResult(result);
      onPaymentSuccess(result);

      toast({
        title: "Pagamento processado!",
        description: `Status: ${result.status === 'approved' ? 'Aprovado' : 'Pendente'}`
      });
    } catch (error: any) {
      console.error('Erro no pagamento:', error);
      onPaymentError(error);
      toast({
        variant: "destructive",
        title: "Erro no pagamento",
        description: error.message || "Erro ao processar pagamento"
      });
    } finally {
      setLoading(false);
    }
  };

  // Handler para pagamento PIX
  const handlePixPayment = async () => {
    setLoading(true);
    try {
      const paymentData: PixPaymentData = {
        amount,
        description,
        email: pixData.email,
        firstName: pixData.firstName,
        lastName: pixData.lastName,
        orderId
      };

      const result = await paymentService.createPixPayment(paymentData);
      setPaymentResult(result);
      onPaymentSuccess(result);

      toast({
        title: "PIX gerado!",
        description: "Escaneie o QR Code ou copie o código PIX para pagar."
      });
    } catch (error: any) {
      console.error('Erro no PIX:', error);
      onPaymentError(error);
      toast({
        variant: "destructive",
        title: "Erro no PIX",
        description: error.message || "Erro ao gerar PIX"
      });
    } finally {
      setLoading(false);
    }
  };

  // Handler para pagamento boleto
  const handleBoletoPayment = async () => {
    if (!boletoData.cpf) {
      toast({
        variant: "destructive",
        title: "CPF obrigatório",
        description: "Informe o CPF para gerar o boleto."
      });
      return;
    }

    setLoading(true);
    try {
      const paymentData: BoletoPaymentData = {
        amount,
        description,
        email: boletoData.email,
        firstName: boletoData.firstName,
        lastName: boletoData.lastName,
        identification: {
          type: 'CPF',
          number: boletoData.cpf.replace(/\D/g, '')
        },
        orderId
      };

      const result = await paymentService.createBoletoPayment(paymentData);
      setPaymentResult(result);
      onPaymentSuccess(result);

      toast({
        title: "Boleto gerado!",
        description: "Clique no link para visualizar e imprimir o boleto."
      });
    } catch (error: any) {
      console.error('Erro no boleto:', error);
      onPaymentError(error);
      toast({
        variant: "destructive",
        title: "Erro no boleto",
        description: error.message || "Erro ao gerar boleto"
      });
    } finally {
      setLoading(false);
    }
  };

  // Renderizar diferentes tipos de pagamento
  const renderPaymentForm = () => {
    switch (paymentMethod) {
      case 'credit':
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Cartão de Crédito
              </CardTitle>
              <CardDescription>
                Preencha os dados do seu cartão de forma segura
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!mpLoaded ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin mr-2" />
                  <span>Carregando formulário seguro...</span>
                </div>
              ) : (
                <div>
                  <div id="card-form" ref={cardFormRef}>
                    {/* Campos serão injetados pelo SDK do MercadoPago */}
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <Label>Número do cartão</Label>
                        <input id="form-checkout__cardNumber" type="text" className="w-full p-2 border rounded" />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Vencimento</Label>
                          <input id="form-checkout__expirationDate" type="text" className="w-full p-2 border rounded" placeholder="MM/YY" />
                        </div>
                        <div>
                          <Label>CVV</Label>
                          <input id="form-checkout__securityCode" type="text" className="w-full p-2 border rounded" />
                        </div>
                      </div>
                      
                      <div>
                        <Label>Nome no cartão</Label>
                        <input id="form-checkout__cardholderName" type="text" className="w-full p-2 border rounded" />
                      </div>
                      
                      <div>
                        <Label>E-mail</Label>
                        <input id="form-checkout__cardholderEmail" type="email" className="w-full p-2 border rounded" defaultValue={customerData.email} />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Tipo de documento</Label>
                          <select id="form-checkout__identificationType" className="w-full p-2 border rounded">
                            <option value="CPF">CPF</option>
                            <option value="CNPJ">CNPJ</option>
                          </select>
                        </div>
                        <div>
                          <Label>Número do documento</Label>
                          <input id="form-checkout__identificationNumber" type="text" className="w-full p-2 border rounded" defaultValue={customerData.cpf} />
                        </div>
                      </div>
                      
                      <div>
                        <Label>Parcelas</Label>
                        <select id="form-checkout__installments" className="w-full p-2 border rounded">
                          <option value="1">1x sem juros</option>
                        </select>
                      </div>
                      
                      <select id="form-checkout__issuer" className="hidden"></select>
                    </div>
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full mt-4" 
                    disabled={loading}
                    onClick={() => {
                      const form = document.getElementById('card-form') as HTMLFormElement;
                      if (form) {
                        const event = new Event('submit', { bubbles: true, cancelable: true });
                        form.dispatchEvent(event);
                      }
                    }}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Processando...
                      </>
                    ) : (
                      `Pagar R$ ${amount.toFixed(2).replace('.', ',')}`
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        );

      case 'pix':
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="h-5 w-5" />
                Pagamento PIX
              </CardTitle>
              <CardDescription>
                Pagamento instantâneo via PIX
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="pix-email">E-mail</Label>
                  <Input
                    id="pix-email"
                    type="email"
                    value={pixData.email}
                    onChange={(e) => setPixData(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="pix-firstName">Nome</Label>
                    <Input
                      id="pix-firstName"
                      value={pixData.firstName}
                      onChange={(e) => setPixData(prev => ({ ...prev, firstName: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="pix-lastName">Sobrenome</Label>
                    <Input
                      id="pix-lastName"
                      value={pixData.lastName}
                      onChange={(e) => setPixData(prev => ({ ...prev, lastName: e.target.value }))}
                    />
                  </div>
                </div>

                <Alert>
                  <Smartphone className="h-4 w-4" />
                  <AlertDescription>
                    Após confirmar, você receberá um QR Code para pagar com seu app do banco.
                    O PIX expira em 30 minutos.
                  </AlertDescription>
                </Alert>

                <Button 
                  onClick={handlePixPayment} 
                  className="w-full" 
                  disabled={loading || !pixData.email || !pixData.firstName}
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Gerando PIX...
                    </>
                  ) : (
                    `Gerar PIX R$ ${amount.toFixed(2).replace('.', ',')}`
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        );

      case 'boleto':
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Boleto Bancário
              </CardTitle>
              <CardDescription>
                Vencimento em 3 dias úteis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="boleto-email">E-mail</Label>
                  <Input
                    id="boleto-email"
                    type="email"
                    value={boletoData.email}
                    onChange={(e) => setBoletoData(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="boleto-firstName">Nome</Label>
                    <Input
                      id="boleto-firstName"
                      value={boletoData.firstName}
                      onChange={(e) => setBoletoData(prev => ({ ...prev, firstName: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="boleto-lastName">Sobrenome</Label>
                    <Input
                      id="boleto-lastName"
                      value={boletoData.lastName}
                      onChange={(e) => setBoletoData(prev => ({ ...prev, lastName: e.target.value }))}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="boleto-cpf">CPF *</Label>
                  <Input
                    id="boleto-cpf"
                    value={boletoData.cpf}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '').slice(0, 11);
                      const formatted = value.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
                      setBoletoData(prev => ({ ...prev, cpf: formatted }));
                    }}
                    placeholder="000.000.000-00"
                  />
                </div>

                <Alert>
                  <FileText className="h-4 w-4" />
                  <AlertDescription>
                    O boleto será enviado por e-mail e poderá ser pago em qualquer banco.
                    Vencimento em 3 dias úteis.
                  </AlertDescription>
                </Alert>

                <Button 
                  onClick={handleBoletoPayment} 
                  className="w-full" 
                  disabled={loading || !boletoData.email || !boletoData.cpf || !boletoData.firstName}
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Gerando boleto...
                    </>
                  ) : (
                    `Gerar Boleto R$ ${amount.toFixed(2).replace('.', ',')}`
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      {renderPaymentForm()}
      
      {/* Mostrar resultado do pagamento se disponível */}
      {paymentResult && (
        <Card>
          <CardHeader>
            <CardTitle>Status do Pagamento</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p><strong>ID:</strong> {paymentResult.id}</p>
              <p><strong>Status:</strong> {paymentResult.status}</p>
              <p><strong>Valor:</strong> R$ {paymentResult.transactionAmount.toFixed(2).replace('.', ',')}</p>
              
              {paymentResult.qrCode && (
                <div className="mt-4">
                  <Label>Código PIX:</Label>
                  <Input value={paymentResult.qrCode} readOnly className="font-mono text-xs" />
                </div>
              )}
              
              {paymentResult.qrCodeBase64 && (
                <div className="mt-4 text-center">
                  <Label>QR Code PIX:</Label>
                  <div className="mt-2">
                    <img 
                      src={`data:image/png;base64,${paymentResult.qrCodeBase64}`}
                      alt="QR Code PIX"
                      className="mx-auto"
                    />
                  </div>
                </div>
              )}
              
              {paymentResult.ticketUrl && (
                <div className="mt-4">
                  <Button asChild className="w-full">
                    <a href={paymentResult.ticketUrl} target="_blank" rel="noopener noreferrer">
                      Ver Boleto
                    </a>
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PaymentForm;
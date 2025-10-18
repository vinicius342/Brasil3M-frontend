import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { XCircle, RefreshCw, CreditCard, AlertTriangle } from "lucide-react";
import Header from "@/components/Header";
import { paymentService } from "@/services/paymentService";

const CheckoutFailure = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [paymentInfo, setPaymentInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Parâmetros que o MercadoPago retorna
  const paymentId = searchParams.get('payment_id');
  const status = searchParams.get('status');
  const externalReference = searchParams.get('external_reference');

  useEffect(() => {
    const fetchPaymentInfo = async () => {
      if (paymentId) {
        try {
          const result = await paymentService.getPaymentStatus(paymentId);
          
          if (result.success && result.data) {
            setPaymentInfo(result.data);
          }
        } catch (error) {
          console.error('Erro ao buscar informações do pagamento:', error);
        }
      }
      setLoading(false);
    };

    fetchPaymentInfo();
  }, [paymentId]);

  const getErrorMessage = (status: string, statusDetail?: string) => {
    switch (status) {
      case 'rejected':
        switch (statusDetail) {
          case 'cc_rejected_insufficient_amount':
            return 'Saldo insuficiente no cartão';
          case 'cc_rejected_bad_filled_card_number':
            return 'Número do cartão inválido';
          case 'cc_rejected_bad_filled_date':
            return 'Data de vencimento inválida';
          case 'cc_rejected_bad_filled_security_code':
            return 'Código de segurança inválido';
          case 'cc_rejected_blacklist':
            return 'Cartão não autorizado';
          default:
            return 'Pagamento rejeitado pelo banco emissor';
        }
      default:
        return 'Não foi possível processar o pagamento';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p>Verificando status do pagamento...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card className="text-center">
            <CardHeader>
              <div className="flex justify-center mb-4">
                <XCircle className="h-16 w-16 text-red-500" />
              </div>
              <CardTitle className="text-2xl text-red-700">
                Pagamento Não Autorizado
              </CardTitle>
              <CardDescription>
                {paymentInfo ? 
                  getErrorMessage(paymentInfo.status, paymentInfo.status_detail) :
                  'Houve um problema com o processamento do seu pagamento.'
                }
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {paymentInfo && (
                <div className="p-4 bg-red-50 rounded-lg text-left">
                  <div className="flex items-center space-x-2 mb-2">
                    <CreditCard className="h-4 w-4 text-red-600" />
                    <span className="font-semibold text-red-900">Detalhes do Pagamento</span>
                  </div>
                  <p className="text-sm text-red-700">ID: {paymentId}</p>
                  <p className="text-sm text-red-700">Status: {paymentInfo.status}</p>
                  <p className="text-sm text-red-700">
                    Valor: R$ {paymentInfo.transaction_amount?.toFixed(2).replace('.', ',')}
                  </p>
                  {paymentInfo.status_detail && (
                    <p className="text-sm text-red-700">Motivo: {paymentInfo.status_detail}</p>
                  )}
                </div>
              )}

              <div className="p-4 bg-yellow-50 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  <span className="font-semibold text-yellow-900">O que fazer agora?</span>
                </div>
                <ul className="text-sm text-yellow-700 space-y-1 text-left">
                  <li>• Verifique os dados do seu cartão</li>
                  <li>• Entre em contato com seu banco</li>
                  <li>• Tente usar outro cartão ou forma de pagamento</li>
                  <li>• Certifique-se de que há saldo suficiente</li>
                </ul>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  onClick={() => navigate('/checkout')} 
                  className="flex-1"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Tentar Novamente
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/')} 
                  className="flex-1"
                >
                  Voltar à Loja
                </Button>
              </div>

              <div className="text-xs text-gray-500">
                <p>Se o problema persistir, entre em contato conosco:</p>
                <p>📧 suporte@brasil3m.com | 📱 (11) 99999-9999</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CheckoutFailure;
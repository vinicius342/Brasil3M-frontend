import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, CreditCard, QrCode, FileText, RefreshCw } from "lucide-react";
import Header from "@/components/Header";
import { paymentService } from "@/services/paymentService";

const CheckoutPending = () => {
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

  const getPaymentInstructions = (paymentMethodId?: string) => {
    switch (paymentMethodId) {
      case 'pix':
        return {
          icon: <QrCode className="h-6 w-6 text-blue-600" />,
          title: 'Pagamento PIX Pendente',
          instructions: [
            'Abra o app do seu banco',
            'Escaneie o código QR ou copie e cole o código PIX',
            'Confirme o pagamento',
            'O pagamento será processado instantaneamente'
          ],
          timeLimit: 'O código PIX expira em 30 minutos'
        };
      case 'bolbradesco':
        return {
          icon: <FileText className="h-6 w-6 text-orange-600" />,
          title: 'Boleto Bancário Gerado',
          instructions: [
            'Pague o boleto em qualquer banco, casa lotérica ou internet banking',
            'O prazo de vencimento é de 3 dias úteis',
            'Após o pagamento, aguarde até 2 dias úteis para confirmação',
            'Você receberá um email quando o pagamento for confirmado'
          ],
          timeLimit: 'Vencimento em 3 dias úteis'
        };
      default:
        return {
          icon: <Clock className="h-6 w-6 text-yellow-600" />,
          title: 'Pagamento Pendente',
          instructions: [
            'Seu pagamento está sendo processado',
            'Você receberá uma confirmação por email em breve',
            'O prazo para confirmação pode variar conforme a forma de pagamento'
          ],
          timeLimit: 'Aguarde a confirmação'
        };
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

  const paymentInstructions = getPaymentInstructions(paymentInfo?.payment_method_id);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card className="text-center">
            <CardHeader>
              <div className="flex justify-center mb-4">
                {paymentInstructions.icon}
              </div>
              <CardTitle className="text-2xl text-yellow-700">
                {paymentInstructions.title}
              </CardTitle>
              <CardDescription>
                Siga as instruções abaixo para finalizar seu pagamento
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {paymentInfo && (
                <div className="p-4 bg-yellow-50 rounded-lg text-left">
                  <div className="flex items-center space-x-2 mb-2">
                    <CreditCard className="h-4 w-4 text-yellow-600" />
                    <span className="font-semibold text-yellow-900">Detalhes do Pagamento</span>
                  </div>
                  <p className="text-sm text-yellow-700">ID: {paymentId}</p>
                  <p className="text-sm text-yellow-700">Status: {paymentInfo.status}</p>
                  <p className="text-sm text-yellow-700">
                    Valor: R$ {paymentInfo.transaction_amount?.toFixed(2).replace('.', ',')}
                  </p>
                  <p className="text-sm text-yellow-700">Método: {paymentInfo.payment_method_id}</p>
                </div>
              )}

              {/* Mostrar QR Code do PIX se disponível */}
              {paymentInfo?.point_of_interaction?.transaction_data?.qr_code_base64 && (
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-semibold text-blue-900 mb-3">Código QR PIX</h3>
                  <div className="flex justify-center mb-3">
                    <img 
                      src={`data:image/png;base64,${paymentInfo.point_of_interaction.transaction_data.qr_code_base64}`}
                      alt="QR Code PIX"
                      className="w-48 h-48"
                    />
                  </div>
                  <div className="text-xs bg-white p-2 rounded border font-mono break-all">
                    {paymentInfo.point_of_interaction.transaction_data.qr_code}
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="mt-2"
                    onClick={() => navigator.clipboard.writeText(paymentInfo.point_of_interaction.transaction_data.qr_code)}
                  >
                    Copiar Código PIX
                  </Button>
                </div>
              )}

              {/* Mostrar link do boleto se disponível */}
              {paymentInfo?.point_of_interaction?.transaction_data?.ticket_url && (
                <div className="p-4 bg-orange-50 rounded-lg">
                  <h3 className="font-semibold text-orange-900 mb-3">Boleto Bancário</h3>
                  <Button 
                    onClick={() => window.open(paymentInfo.point_of_interaction.transaction_data.ticket_url, '_blank')}
                    className="w-full"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Baixar Boleto
                  </Button>
                </div>
              )}

              <div className="p-4 bg-gray-50 rounded-lg text-left">
                <h3 className="font-semibold text-gray-900 mb-3">Como pagar:</h3>
                <ol className="text-sm text-gray-700 space-y-1">
                  {paymentInstructions.instructions.map((instruction, index) => (
                    <li key={index} className="flex">
                      <span className="font-semibold mr-2">{index + 1}.</span>
                      <span>{instruction}</span>
                    </li>
                  ))}
                </ol>
                <p className="text-xs text-gray-500 mt-3">
                  ⏰ {paymentInstructions.timeLimit}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  onClick={() => window.location.reload()} 
                  variant="outline"
                  className="flex-1"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Verificar Status
                </Button>
                <Button 
                  onClick={() => navigate('/orders')} 
                  className="flex-1"
                >
                  Acompanhar Pedido
                </Button>
              </div>

              <div className="text-xs text-gray-500">
                <p>Dúvidas? Entre em contato conosco:</p>
                <p>📧 suporte@brasil3m.com | 📱 (11) 99999-9999</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPending;
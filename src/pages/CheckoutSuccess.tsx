import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Package, CreditCard, Calendar } from "lucide-react";
import Header from "@/components/Header";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { paymentService } from "@/services/paymentService";

const CheckoutSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { clearCart } = useCart();
  const { currentUser } = useAuth();
  
  const [paymentInfo, setPaymentInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Parâmetros que o MercadoPago retorna
  const paymentId = searchParams.get('payment_id');
  const status = searchParams.get('status');
  const externalReference = searchParams.get('external_reference');
  const merchantOrderId = searchParams.get('merchant_order_id');

  useEffect(() => {
    const fetchPaymentInfo = async () => {
      if (paymentId) {
        try {
          const result = await paymentService.getPaymentStatus(paymentId);
          
          if (result.success && result.data) {
            setPaymentInfo(result.data);
            
            // Limpar carrinho apenas se o pagamento foi aprovado
            if (result.data.status === 'approved') {
              clearCart();
            }
          }
        } catch (error) {
          console.error('Erro ao buscar informações do pagamento:', error);
        }
      }
      setLoading(false);
    };

    fetchPaymentInfo();
  }, [paymentId, clearCart]);

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
                <CheckCircle className="h-16 w-16 text-green-500" />
              </div>
              <CardTitle className="text-2xl text-green-700">
                Pagamento Realizado com Sucesso!
              </CardTitle>
              <CardDescription>
                Obrigado pela sua compra! Seus produtos serão enviados em breve.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {paymentInfo && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <CreditCard className="h-4 w-4" />
                      <span className="font-semibold">Pagamento</span>
                    </div>
                    <p className="text-sm text-gray-600">ID: {paymentId}</p>
                    <p className="text-sm text-gray-600">Status: {paymentInfo.status}</p>
                    <p className="text-sm text-gray-600">
                      Valor: R$ {paymentInfo.transaction_amount?.toFixed(2).replace('.', ',')}
                    </p>
                  </div>
                  
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <Package className="h-4 w-4" />
                      <span className="font-semibold">Pedido</span>
                    </div>
                    <p className="text-sm text-gray-600">Referência: {externalReference}</p>
                    {merchantOrderId && (
                      <p className="text-sm text-gray-600">Ordem: {merchantOrderId}</p>
                    )}
                  </div>
                </div>
              )}

              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Calendar className="h-4 w-4 text-blue-600" />
                  <span className="font-semibold text-blue-900">Próximos Passos</span>
                </div>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Você receberá um email de confirmação em breve</li>
                  <li>• Acompanhe o status do seu pedido na área "Meus Pedidos"</li>
                  <li>• O envio será realizado em até 2 dias úteis</li>
                  <li>• Você receberá o código de rastreamento por email</li>
                </ul>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  onClick={() => navigate('/orders')} 
                  className="flex-1"
                >
                  Ver Meus Pedidos
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/')} 
                  className="flex-1"
                >
                  Continuar Comprando
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CheckoutSuccess;
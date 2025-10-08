import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { CheckCircle, XCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';

const PaymentCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [processing, setProcessing] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState<'success' | 'error' | 'pending'>('pending');

  useEffect(() => {
    const processCallback = async () => {
      try {
        const status = searchParams.get('status');
        const paymentId = searchParams.get('payment_id');
        const orderId = searchParams.get('external_reference');
        const merchantOrderId = searchParams.get('merchant_order_id');

        console.log('Callback recebido:', { status, paymentId, orderId, merchantOrderId });

        if (!orderId) {
          toast.error('ID do pedido não encontrado');
          setPaymentStatus('error');
          return;
        }

        // Mapear status do MercadoPago para nosso sistema
        let finalStatus: 'pending' | 'approved' | 'rejected' | 'in_process';
        let orderStatus: 'pending' | 'confirmed' | 'processing' | 'cancelled';

        switch (status) {
          case 'approved':
            finalStatus = 'approved';
            orderStatus = 'confirmed';
            setPaymentStatus('success');
            break;
          case 'pending':
          case 'in_process':
            finalStatus = 'in_process';
            orderStatus = 'processing';
            setPaymentStatus('pending');
            break;
          case 'rejected':
          case 'cancelled':
            finalStatus = 'rejected';
            orderStatus = 'cancelled';
            setPaymentStatus('error');
            break;
          default:
            finalStatus = 'pending';
            orderStatus = 'pending';
            setPaymentStatus('pending');
        }

        // Atualizar status do pedido no Firestore
        try {
          await updateDoc(doc(db, 'orders', orderId), {
            paymentStatus: finalStatus,
            status: orderStatus,
            paymentId: paymentId,
            updatedAt: new Date()
          });

          console.log('Status do pedido atualizado:', { finalStatus, orderStatus });
        } catch (error) {
          console.error('Erro ao atualizar pedido:', error);
          toast.error('Erro ao atualizar status do pedido');
        }

        // Redirecionar após 3 segundos
        setTimeout(() => {
          navigate(`/order-confirmation/${orderId}`);
        }, 3000);

      } catch (error) {
        console.error('Erro no callback:', error);
        setPaymentStatus('error');
        toast.error('Erro ao processar pagamento');
      } finally {
        setProcessing(false);
      }
    };

    processCallback();
  }, [searchParams, navigate]);

  const getStatusConfig = () => {
    switch (paymentStatus) {
      case 'success':
        return {
          icon: CheckCircle,
          color: 'text-green-500',
          title: 'Pagamento Aprovado!',
          message: 'Seu pagamento foi processado com sucesso.',
          bgColor: 'bg-green-50'
        };
      case 'error':
        return {
          icon: XCircle,
          color: 'text-red-500',
          title: 'Pagamento Rejeitado',
          message: 'Houve um problema com seu pagamento. Tente novamente.',
          bgColor: 'bg-red-50'
        };
      case 'pending':
      default:
        return {
          icon: Clock,
          color: 'text-orange-500',
          title: 'Pagamento Pendente',
          message: 'Seu pagamento está sendo processado.',
          bgColor: 'bg-orange-50'
        };
    }
  };

  const statusConfig = getStatusConfig();
  const StatusIcon = statusConfig.icon;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full mx-4">
        <Card>
          <CardHeader className="text-center">
            <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${statusConfig.bgColor} mb-4 mx-auto`}>
              <StatusIcon className={`h-8 w-8 ${statusConfig.color}`} />
            </div>
            <CardTitle className="text-xl">
              {processing ? 'Processando...' : statusConfig.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            {processing ? (
              <div>
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-muted-foreground">
                  Verificando status do pagamento...
                </p>
              </div>
            ) : (
              <>
                <p className="text-muted-foreground">
                  {statusConfig.message}
                </p>
                
                {paymentStatus === 'success' && (
                  <p className="text-sm text-green-600">
                    Você será redirecionado para a confirmação do pedido em alguns segundos.
                  </p>
                )}

                {paymentStatus === 'error' && (
                  <div className="space-y-2">
                    <Button 
                      onClick={() => navigate('/checkout')} 
                      className="w-full"
                    >
                      Tentar Novamente
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => navigate('/')} 
                      className="w-full"
                    >
                      Voltar ao Início
                    </Button>
                  </div>
                )}

                {paymentStatus === 'pending' && (
                  <div className="space-y-2">
                    <p className="text-sm text-orange-600">
                      Você será redirecionado para acompanhar seu pedido em alguns segundos.
                    </p>
                    <Button 
                      variant="outline" 
                      onClick={() => navigate('/orders')} 
                      className="w-full"
                    >
                      Ver Meus Pedidos
                    </Button>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PaymentCallback;
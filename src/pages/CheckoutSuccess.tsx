import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Package, CreditCard, Calendar } from "lucide-react";
import Header from "@/components/Header";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { paymentService } from "@/services/paymentService";
import { getFirestore, collection, query, where, getDocs, doc, updateDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";

const CheckoutSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { clearCart, cartItems } = useCart();
  const { currentUser } = useAuth();
  const { toast } = useToast();
  
  const [paymentInfo, setPaymentInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [stockUpdated, setStockUpdated] = useState(false);

  // Parâmetros que o MercadoPago retorna
  const paymentId = searchParams.get('payment_id');
  const status = searchParams.get('status');
  const externalReference = searchParams.get('external_reference');
  const merchantOrderId = searchParams.get('merchant_order_id');

  // Função para atualizar estoque dos produtos
  const updateProductsStock = async (orderItems: any[]) => {
    const db = getFirestore();
    
    console.log('🔄 Atualizando estoque dos produtos...');
    
    for (const item of orderItems) {
      try {
        const productRef = doc(db, 'products', item.id);
        const productSnap = await getDoc(productRef);
        
        if (!productSnap.exists()) {
          console.warn(`⚠️ Produto ${item.id} não encontrado`);
          continue;
        }
        
        const productData = productSnap.data();
        const currentStock = productData.stock || 0;
        const currentSalesCount = productData.salesCount || 0;
        
        // Calcular novo estoque (não pode ser negativo)
        const newStock = Math.max(0, currentStock - item.quantity);
        
        await updateDoc(productRef, {
          stock: newStock,
          salesCount: currentSalesCount + item.quantity,
          updatedAt: serverTimestamp()
        });
        
        console.log(`✅ Produto ${item.name}: estoque ${currentStock} → ${newStock}, vendas: ${currentSalesCount} → ${currentSalesCount + item.quantity}`);
      } catch (error) {
        console.error(`❌ Erro ao atualizar estoque do produto ${item.id}:`, error);
      }
    }
    
    console.log('✅ Atualização de estoque concluída');
  };

  // Função para atualizar status do pedido no Firestore
  const updateOrderStatus = async () => {
    if (!currentUser || !externalReference) return;
    
    try {
      const db = getFirestore();
      
      // Buscar pedido pela external_reference
      const ordersQuery = query(
        collection(db, 'orders'),
        where('external_reference', '==', externalReference),
        where('userId', '==', currentUser.uid)
      );
      
      const ordersSnapshot = await getDocs(ordersQuery);
      
      if (ordersSnapshot.empty) {
        console.warn('⚠️ Pedido não encontrado:', externalReference);
        return;
      }
      
      const orderDoc = ordersSnapshot.docs[0];
      const orderData = orderDoc.data();
      
      // Atualizar status do pedido
      await updateDoc(doc(db, 'orders', orderDoc.id), {
        status: 'confirmed',
        paymentStatus: 'approved',
        paymentId: paymentId,
        paidAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      console.log('✅ Status do pedido atualizado para confirmed');
      
      // Atualizar estoque dos produtos (SE ainda não foi atualizado)
      if (!stockUpdated && orderData.items) {
        await updateProductsStock(orderData.items);
        setStockUpdated(true);
      }
      
    } catch (error) {
      console.error('❌ Erro ao atualizar pedido:', error);
    }
  };

  useEffect(() => {
    const fetchPaymentInfo = async () => {
      if (paymentId) {
        try {
          const result = await paymentService.getPaymentStatus(paymentId);
          
          if (result.success && result.data) {
            setPaymentInfo(result.data);
            
            // Se o pagamento foi aprovado
            if (result.data.status === 'approved') {
              console.log('✅ Pagamento aprovado - Processando pedido...');
              
              // 1. Atualizar status do pedido e reduzir estoque
              await updateOrderStatus();
              
              // 2. Limpar carrinho
              clearCart();
              
              toast({
                title: "Pedido confirmado!",
                description: "Seu pedido foi processado com sucesso."
              });
            }
          }
        } catch (error) {
          console.error('Erro ao buscar informações do pagamento:', error);
          toast({
            variant: "destructive",
            title: "Erro",
            description: "Erro ao processar informações do pagamento."
          });
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
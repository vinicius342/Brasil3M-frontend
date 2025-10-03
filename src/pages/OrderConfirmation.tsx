import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, Package, CreditCard, MapPin, Download, Home, Copy, Truck } from "lucide-react";
import Header from "@/components/Header";
import TrackingComponent from "@/components/TrackingComponent";
import { useToast } from "@/hooks/use-toast";
import { getFirestore, doc, getDoc } from "firebase/firestore";

const OrderConfirmation = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [orderData, setOrderData] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("");

  useEffect(() => {
    const fetchOrderData = async () => {
      const orderId = searchParams.get('orderId');
      const payment = searchParams.get('payment') || 'credit';
      
      setPaymentMethod(payment);
      
      if (!orderId) {
        toast({
          variant: "destructive",
          title: "Erro",
          description: "ID do pedido não encontrado."
        });
        navigate('/');
        return;
      }

      try {
        const db = getFirestore();
        const orderDoc = await getDoc(doc(db, 'orders', orderId));
        
        if (!orderDoc.exists()) {
          toast({
            variant: "destructive",
            title: "Pedido não encontrado",
            description: "O pedido solicitado não existe."
          });
          navigate('/');
          return;
        }

        const orderData = orderDoc.data();
        
        // Formatar dados para exibição
        const formattedOrder = {
          id: orderDoc.id,
          status: orderData.status === 'processing' ? 'confirmed' : orderData.status,
          total: orderData.totalAmount || 0,
          subtotal: orderData.subtotal || 0,
          shippingCost: orderData.shippingCost || 0,
          items: orderData.items || [],
          shipping: {
            method: orderData.shippingMethod || "Entrega Padrão",
            company: orderData.shippingCompany || "Brasil 3M",
            address: orderData.shippingAddress || {},
            estimatedDelivery: orderData.estimatedDeliveryTime || "5-7 dias úteis"
          },
          payment: {
            method: orderData.paymentMethod || 'Cartão de Crédito',
            status: orderData.paymentStatus || 'confirmed'
          },
          tracking: orderData.trackingCode || null,
          createdAt: orderData.createdAt?.toDate?.()?.toLocaleDateString('pt-BR') || new Date().toLocaleDateString('pt-BR')
        };
        
        setOrderData(formattedOrder);
      } catch (error) {
        console.error("Erro ao buscar pedido:", error);
        toast({
          variant: "destructive",
          title: "Erro",
          description: "Erro ao carregar dados do pedido."
        });
        
        // Fallback: usar dados mockados se houver erro
        const fallbackOrderId = orderId || Math.random().toString(36).substr(2, 9).toUpperCase();
        setOrderData({
          id: fallbackOrderId,
          status: "confirmed",
          total: 0,
          subtotal: 0,
          shippingCost: 0,
          items: [],
          shipping: {
            method: "Entrega Padrão",
            company: "Brasil 3M",
            address: {
              street: "Endereço não informado",
              neighborhood: "",
              city: "",
              state: "",
              zipCode: ""
            },
            estimatedDelivery: "5-7 dias úteis"
          },
          payment: {
            method: payment === 'credit' ? 'Cartão de Crédito' : payment === 'pix' ? 'PIX' : 'Boleto Bancário',
            status: payment === 'pix' ? 'pending' : 'confirmed'
          },
          tracking: null,
          createdAt: new Date().toLocaleDateString('pt-BR')
        });
      }
    };

    fetchOrderData();
  }, [searchParams, navigate, toast]);

  const copyOrderId = () => {
    if (orderData?.id) {
      navigator.clipboard.writeText(orderData.id);
      toast({
        title: "Copiado!",
        description: "Número do pedido copiado para a área de transferência."
      });
    }
  };

  const downloadReceipt = () => {
    toast({
      title: "Download iniciado",
      description: "O comprovante será baixado em instantes."
    });
  };

  if (!orderData) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-96">
            <div className="text-center">
              <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">Carregando pedido...</h2>
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
        <div className="max-w-4xl mx-auto">
          {/* Success Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              {orderData.payment.method === 'PIX' && orderData.payment.status === 'pending' 
                ? 'Pedido Criado com Sucesso!' 
                : 'Pedido Confirmado!'}
            </h1>
            <p className="text-muted-foreground">
              {orderData.payment.method === 'PIX' && orderData.payment.status === 'pending'
                ? 'Agora finalize o pagamento via PIX para confirmar seu pedido'
                : 'Seu pedido foi processado e será preparado para envio'}
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Order Details */}
            <div className="lg:col-span-2 space-y-6">
              {/* Order Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Package className="h-5 w-5" />
                      <span>Detalhes do Pedido</span>
                    </div>
                    <Badge variant={orderData.status === "confirmed" ? "default" : "secondary"}>
                      {orderData.status === "confirmed" ? "Confirmado" : "Aguardando Pagamento"}
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    <div className="flex items-center space-x-2">
                      <span>Pedido #{orderData.id}</span>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={copyOrderId}
                        className="h-auto p-1"
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                    <span className="text-sm">Realizado em {orderData.createdAt}</span>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {orderData.items.map((item, index) => (
                      <div key={item.productId || index} className="flex items-center space-x-4 p-4 border rounded-lg">
                        <img
                          src={item.image || "/placeholder.svg"}
                          alt={item.productName || item.name}
                          className="w-16 h-16 object-cover rounded-md"
                        />
                        <div className="flex-1">
                          <h4 className="font-medium">{item.productName || item.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            Quantidade: {item.quantity}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">
                            R$ {(item.subtotal || (item.price * item.quantity)).toFixed(2).replace('.', ',')}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            R$ {item.price.toFixed(2).replace('.', ',')} cada
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Shipping Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <MapPin className="h-5 w-5" />
                    <span>Informações de Entrega</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">Endereço de Entrega</h4>
                      <p className="text-muted-foreground">
                        {orderData.shipping.address.street}<br />
                        {orderData.shipping.address.neighborhood && `${orderData.shipping.address.neighborhood}, `}
                        {orderData.shipping.address.city}{orderData.shipping.address.state && ` - ${orderData.shipping.address.state}`}<br />
                        {orderData.shipping.address.zipCode && `CEP: ${orderData.shipping.address.zipCode}`}
                      </p>
                    </div>
                    <Separator />
                    <div>
                      <h4 className="font-semibold mb-2">Método de Entrega</h4>
                      <p className="text-muted-foreground">{orderData.shipping.method}</p>
                      {orderData.shipping.company && (
                        <p className="text-sm text-muted-foreground">{orderData.shipping.company}</p>
                      )}
                      <p className="text-sm text-primary">
                        Prazo estimado: {orderData.shipping.estimatedDelivery}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <CreditCard className="h-5 w-5" />
                    <span>Informações de Pagamento</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span>Método de Pagamento:</span>
                      <span className="font-semibold">{orderData.payment.method}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Status:</span>
                      <Badge variant={orderData.payment.status === "confirmed" ? "default" : "secondary"}>
                        {orderData.payment.status === "confirmed" ? "Confirmado" : "Aguardando"}
                      </Badge>
                    </div>
                    
                    {orderData.payment.method === 'PIX' && orderData.payment.status === 'pending' && (
                      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <h4 className="font-semibold text-blue-900 mb-2">Complete o pagamento PIX</h4>
                        <p className="text-sm text-blue-800 mb-3">
                          Use o QR Code ou copie a chave PIX para finalizar seu pagamento.
                        </p>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            Ver QR Code
                          </Button>
                          <Button size="sm" variant="outline">
                            Copiar Chave PIX
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Rastreamento (se disponível) */}
              {orderData.tracking && (
                <TrackingComponent 
                  trackingCode={orderData.tracking} 
                  orderId={orderData.id}
                />
              )}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-4">
                <CardHeader>
                  <CardTitle>Resumo do Pedido</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Subtotal</span>
                        <span>R$ {(orderData.subtotal || (orderData.total - (orderData.shippingCost || 0))).toFixed(2).replace('.', ',')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Entrega ({orderData.shipping.method})</span>
                        <span>
                          {(orderData.shippingCost || 0) === 0 ? "Grátis" : `R$ ${(orderData.shippingCost || 0).toFixed(2).replace('.', ',')}`}
                        </span>
                      </div>
                      <Separator />
                      <div className="flex justify-between font-semibold text-lg">
                        <span>Total</span>
                        <span>R$ {orderData.total.toFixed(2).replace('.', ',')}</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Button onClick={downloadReceipt} variant="outline" className="w-full">
                        <Download className="h-4 w-4 mr-2" />
                        Baixar Comprovante
                      </Button>
                      <Button onClick={() => navigate('/')} className="w-full">
                        <Home className="h-4 w-4 mr-2" />
                        Continuar Comprando
                      </Button>
                      <Button onClick={() => navigate('/orders')} variant="outline" className="w-full">
                        <Package className="h-4 w-4 mr-2" />
                        Ver Meus Pedidos
                      </Button>
                    </div>

                    <div className="text-center text-xs text-muted-foreground">
                      <p>Você receberá atualizações por email</p>
                      <p>sobre o status do seu pedido</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;

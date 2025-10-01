import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, Package, CreditCard, MapPin, Download, Home, Copy } from "lucide-react";
import Header from "@/components/Header";
import { useToast } from "@/hooks/use-toast";

const OrderConfirmation = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [orderData, setOrderData] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("");

  useEffect(() => {
    // Simular busca dos dados do pedido
    const orderId = searchParams.get('orderId') || Math.random().toString(36).substr(2, 9).toUpperCase();
    const payment = searchParams.get('payment') || 'credit';
    
    setPaymentMethod(payment);
    
    // Dados mockados do pedido
    setOrderData({
      id: orderId,
      status: "confirmed",
      total: 598.80,
      items: [
        {
          id: 1,
          name: "Smartphone Galaxy S21",
          price: 299.90,
          quantity: 1,
          image: "/placeholder.svg"
        },
        {
          id: 2,
          name: "Fone de Ouvido Bluetooth",
          price: 149.50,
          quantity: 2,
          image: "/placeholder.svg"
        }
      ],
      shipping: {
        method: "Entrega Padrão",
        address: {
          street: "Rua das Flores, 123",
          neighborhood: "Centro",
          city: "São Paulo",
          state: "SP",
          zipCode: "01234-567"
        },
        estimatedDelivery: "5-7 dias úteis"
      },
      payment: {
        method: payment === 'credit' ? 'Cartão de Crédito' : payment === 'pix' ? 'PIX' : 'Boleto Bancário',
        status: payment === 'pix' ? 'pending' : 'confirmed'
      },
      createdAt: new Date().toLocaleDateString('pt-BR')
    });
  }, [searchParams]);

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
                    {orderData.items.map((item) => (
                      <div key={item.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-16 h-16 object-cover rounded-md"
                        />
                        <div className="flex-1">
                          <h4 className="font-medium">{item.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            Quantidade: {item.quantity}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">
                            R$ {(item.price * item.quantity).toFixed(2).replace('.', ',')}
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
                        {orderData.shipping.address.neighborhood}, {orderData.shipping.address.city} - {orderData.shipping.address.state}<br />
                        CEP: {orderData.shipping.address.zipCode}
                      </p>
                    </div>
                    <Separator />
                    <div>
                      <h4 className="font-semibold mb-2">Método de Entrega</h4>
                      <p className="text-muted-foreground">{orderData.shipping.method}</p>
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
                        <span>R$ {(orderData.total - 0).toFixed(2).replace('.', ',')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Entrega</span>
                        <span className="text-green-600">Grátis</span>
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

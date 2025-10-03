import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Package, Search, Eye, Truck, CheckCircle, Clock, AlertCircle, ShoppingBag, Star } from "lucide-react";
import Header from "@/components/Header";
import TrackingComponent from "@/components/TrackingComponent";
import { useAuth } from "@/contexts/AuthContext";
import { getFirestore, collection, query, where, orderBy, getDocs } from "firebase/firestore";
import { Link } from "react-router-dom";

const Orders = () => {
  const { currentUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showTrackingDialog, setShowTrackingDialog] = useState(false);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!currentUser) return;

      setLoading(true);
      setError("");
      
      try {
        const db = getFirestore();
        const ordersQuery = query(
          collection(db, "orders"),
          where("buyerId", "==", currentUser.uid),
          orderBy("createdAt", "desc")
        );

        const ordersSnapshot = await getDocs(ordersQuery);
        const ordersList = [];

        for (const doc of ordersSnapshot.docs) {
          const orderData = doc.data();
          
          // Processar itens do pedido
          const items = orderData.items?.map(item => ({
            name: item.name || item.productName || "Produto",
            quantity: item.quantity || 1,
            price: `R$ ${(item.price || 0).toFixed(2).replace('.', ',')}`,
            image: item.image || "/placeholder.svg"
          })) || [];

          // Formatar status
          let status = "Preparando";
          switch (orderData.status) {
            case "delivered":
              status = "Entregue";
              break;
            case "shipping":
              status = "Em trânsito";
              break;
            case "cancelled":
              status = "Cancelado";
              break;
            case "processing":
            default:
              status = "Preparando";
              break;
          }

          ordersList.push({
            id: doc.id,
            date: orderData.createdAt?.toDate?.()?.toLocaleDateString('pt-BR') || "Data não disponível",
            status,
            total: `R$ ${(orderData.totalAmount || 0).toFixed(2).replace('.', ',')}`,
            items,
            tracking: orderData.trackingCode || null,
            estimatedDelivery: orderData.estimatedDelivery?.toDate?.()?.toLocaleDateString('pt-BR') || null,
            shippingAddress: orderData.shippingAddress || null,
            paymentMethod: orderData.paymentMethod || "Não informado"
          });
        }

        setOrders(ordersList);
      } catch (error) {
        console.error("Erro ao buscar pedidos:", error);
        setError("Erro ao carregar pedidos. Tente novamente.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [currentUser]);

  const handleOrderAction = (orderId: string, action: string) => {
    const order = orders.find(o => o.id === orderId);
    
    switch (action) {
      case 'details':
        // Navegar para página de detalhes do pedido
        console.log(`Ver detalhes do pedido ${orderId}`);
        // navigate(`/order-details/${orderId}`);
        break;
      case 'track':
        // Abrir modal de rastreamento
        if (order?.tracking) {
          setSelectedOrder(order);
          setShowTrackingDialog(true);
        }
        break;
      case 'rate':
        // Abrir modal de avaliação
        console.log(`Avaliar produtos do pedido ${orderId}`);
        break;
      case 'reorder':
        // Adicionar produtos novamente ao carrinho
        console.log(`Comprar novamente pedido ${orderId}`);
        break;
      case 'cancel':
        // Cancelar pedido (com confirmação)
        console.log(`Cancelar pedido ${orderId}`);
        break;
      default:
        break;
    }
  };

  const getStatusMessage = (status: string) => {
    switch (status) {
      case 'Entregue':
        return 'Seu pedido foi entregue com sucesso!';
      case 'Em trânsito':
        return 'Seu pedido está a caminho!';
      case 'Cancelado':
        return 'Este pedido foi cancelado.';
      case 'Preparando':
      default:
        return 'Estamos preparando seu pedido.';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Entregue":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "Em trânsito":
        return <Truck className="h-4 w-4 text-blue-600" />;
      case "Preparando":
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case "Cancelado":
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Package className="h-4 w-4" />;
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "Entregue":
        return "default";
      case "Em trânsito":
        return "secondary";
      case "Preparando":
        return "outline";
      case "Cancelado":
        return "destructive";
      default:
        return "outline";
    }
  };

  const filteredOrders = orders.filter(order =>
    order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    order.items.some(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const activeOrders = filteredOrders.filter(order => 
    ["Preparando", "Em trânsito"].includes(order.status)
  );

  const completedOrders = filteredOrders.filter(order => 
    ["Entregue", "Cancelado"].includes(order.status)
  );

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Meus Pedidos</h1>
          <p className="text-muted-foreground">Acompanhe seus pedidos e histórico de compras</p>
        </div>

        {error && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardContent className="p-4">
              <p className="text-red-800">{error}</p>
            </CardContent>
          </Card>
        )}

        {loading ? (
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="animate-pulse space-y-4">
                    <div className="flex justify-between">
                      <div className="space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-32"></div>
                        <div className="h-3 bg-gray-200 rounded w-24"></div>
                      </div>
                      <div className="h-6 bg-gray-200 rounded w-20"></div>
                    </div>
                    <div className="h-16 bg-gray-200 rounded"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : orders.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <ShoppingBag className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Nenhum pedido encontrado</h3>
              <p className="text-muted-foreground mb-6">
                Você ainda não fez nenhum pedido. Que tal começar suas compras?
              </p>
              <Button asChild>
                <Link to="/">Começar a Comprar</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Search */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Buscar por número do pedido ou produto..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <Tabs defaultValue="all" className="space-y-6">
              <TabsList>
                <TabsTrigger value="all">Todos ({filteredOrders.length})</TabsTrigger>
                <TabsTrigger value="active">Ativos ({activeOrders.length})</TabsTrigger>
                <TabsTrigger value="completed">Finalizados ({completedOrders.length})</TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="space-y-6">
                {filteredOrders.map((order) => (
                  <OrderCard 
                    key={order.id} 
                    order={order} 
                    getStatusIcon={getStatusIcon} 
                    getStatusVariant={getStatusVariant}
                    handleOrderAction={handleOrderAction}
                  />
                ))}
              </TabsContent>

              <TabsContent value="active" className="space-y-6">
                {activeOrders.length === 0 ? (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">Nenhum pedido ativo</h3>
                      <p className="text-muted-foreground">Todos os seus pedidos foram finalizados.</p>
                    </CardContent>
                  </Card>
                ) : (
                  activeOrders.map((order) => (
                    <OrderCard 
                      key={order.id} 
                      order={order} 
                      getStatusIcon={getStatusIcon} 
                      getStatusVariant={getStatusVariant}
                      handleOrderAction={handleOrderAction}
                    />
                  ))
                )}
              </TabsContent>

              <TabsContent value="completed" className="space-y-6">
                {completedOrders.length === 0 ? (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">Nenhum pedido finalizado</h3>
                      <p className="text-muted-foreground">Seus pedidos finalizados aparecerão aqui.</p>
                    </CardContent>
                  </Card>
                ) : (
                  completedOrders.map((order) => (
                    <OrderCard 
                      key={order.id} 
                      order={order} 
                      getStatusIcon={getStatusIcon} 
                      getStatusVariant={getStatusVariant}
                      handleOrderAction={handleOrderAction}
                    />
                  ))
                )}
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>

      {/* Modal de Rastreamento */}
      <Dialog open={showTrackingDialog} onOpenChange={setShowTrackingDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Rastreamento do Pedido</DialogTitle>
            <DialogDescription>
              Acompanhe o status de entrega do seu pedido em tempo real.
            </DialogDescription>
          </DialogHeader>
          {selectedOrder?.tracking && (
            <TrackingComponent 
              trackingCode={selectedOrder.tracking} 
              orderId={selectedOrder.id}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

const OrderCard = ({ order, getStatusIcon, getStatusVariant, handleOrderAction }: any) => (
  <Card>
    <CardHeader>
      <div className="flex items-center justify-between">
        <div>
          <CardTitle className="text-lg">Pedido #{order.id.slice(-8).toUpperCase()}</CardTitle>
          <CardDescription>Realizado em {order.date}</CardDescription>
        </div>
        <div className="flex items-center space-x-2">
          {getStatusIcon(order.status)}
          <Badge variant={getStatusVariant(order.status)}>{order.status}</Badge>
        </div>
      </div>
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        {/* Items */}
        <div className="space-y-3">
          {order.items.map((item: any, index: number) => (
            <div key={index} className="flex items-center space-x-4">
              <img
                src={item.image}
                alt={item.name}
                className="w-16 h-16 object-cover rounded-md bg-muted"
              />
              <div className="flex-1">
                <h4 className="font-medium">{item.name}</h4>
                <p className="text-sm text-muted-foreground">
                  Quantidade: {item.quantity} • {item.price}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Order Details */}
        <div className="border-t pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Total do pedido</p>
              <p className="text-lg font-semibold">{order.total}</p>
            </div>
            
            {order.paymentMethod && (
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Método de pagamento</p>
                <p className="text-sm font-medium">{order.paymentMethod}</p>
              </div>
            )}
            
            {order.tracking && (
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Código de rastreamento</p>
                <p className="text-sm font-medium">{order.tracking}</p>
              </div>
            )}

            {order.estimatedDelivery && (
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Previsão de entrega</p>
                <p className="text-sm font-medium">{order.estimatedDelivery}</p>
              </div>
            )}
          </div>

          {order.shippingAddress && (
            <div className="mb-4 p-3 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Endereço de entrega</p>
              <p className="text-sm">
                {order.shippingAddress.street}, {order.shippingAddress.number}
                {order.shippingAddress.complement && `, ${order.shippingAddress.complement}`}
                <br />
                {order.shippingAddress.neighborhood}, {order.shippingAddress.city} - {order.shippingAddress.state}
                <br />
                CEP: {order.shippingAddress.zipCode}
              </p>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleOrderAction(order.id, 'details')}
            >
              <Eye className="h-4 w-4 mr-2" />
              Ver Detalhes
            </Button>
            
            {order.status === "Entregue" && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleOrderAction(order.id, 'rate')}
              >
                <Star className="h-4 w-4 mr-2" />
                Avaliar Produtos
              </Button>
            )}
            
            {order.tracking && order.status !== "Entregue" && order.status !== "Cancelado" && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleOrderAction(order.id, 'track')}
              >
                <Truck className="h-4 w-4 mr-2" />
                Rastrear Pedido
              </Button>
            )}
            
            {order.status === "Entregue" && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleOrderAction(order.id, 'reorder')}
              >
                <Package className="h-4 w-4 mr-2" />
                Comprar Novamente
              </Button>
            )}
            
            {order.status === "Preparando" && (
              <Button 
                variant="outline" 
                size="sm" 
                className="text-red-600 hover:text-red-700"
                onClick={() => handleOrderAction(order.id, 'cancel')}
              >
                <AlertCircle className="h-4 w-4 mr-2" />
                Cancelar Pedido
              </Button>
            )}
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);

export default Orders;
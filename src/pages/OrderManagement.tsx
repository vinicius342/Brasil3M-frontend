import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Package, Search, Edit, Truck, Clock, CheckCircle, AlertCircle, Calendar } from "lucide-react";
import Header from "@/components/Header";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { getFirestore, collection, query, orderBy, getDocs, doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { updateOrderShipping, markOrderAsDelivered } from "@/services/shippingService";

const OrderManagement = () => {
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showUpdateDialog, setShowUpdateDialog] = useState(false);
  const [updating, setUpdating] = useState(false);

  // Form para atualização de pedido
  const [updateForm, setUpdateForm] = useState({
    status: "",
    trackingCode: "",
    carrier: "",
    estimatedDelivery: ""
  });

  // Buscar todos os pedidos
  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const db = getFirestore();
        const ordersQuery = query(
          collection(db, "orders"),
          orderBy("createdAt", "desc")
        );

        const ordersSnapshot = await getDocs(ordersQuery);
        const ordersList = ordersSnapshot.docs.map(doc => {
          const orderData = doc.data();
          return {
            id: doc.id,
            ...orderData,
            date: orderData.createdAt?.toDate?.()?.toLocaleDateString('pt-BR') || "Data não disponível",
            total: `R$ ${(orderData.totalAmount || 0).toFixed(2).replace('.', ',')}`,
            customerEmail: orderData.buyerEmail || "Email não informado",
            items: orderData.items || []
          };
        });

        setOrders(ordersList);
      } catch (error) {
        console.error("Erro ao buscar pedidos:", error);
        toast({
          variant: "destructive",
          title: "Erro",
          description: "Não foi possível carregar os pedidos."
        });
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [toast]);

  // Filtrar pedidos
  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.customerEmail.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Atualizar status do pedido
  const handleUpdateOrder = async () => {
    if (!selectedOrder) return;

    setUpdating(true);
    try {
      const db = getFirestore();
      const orderRef = doc(db, 'orders', selectedOrder.id);
      
      const updateData: any = {
        status: updateForm.status || selectedOrder.status,
        updatedAt: serverTimestamp()
      };

      // Se foi adicionado código de rastreamento
      if (updateForm.trackingCode && updateForm.trackingCode !== selectedOrder.trackingCode) {
        updateData.trackingCode = updateForm.trackingCode;
        updateData.carrier = updateForm.carrier || "Correios";
        updateData.shippedAt = serverTimestamp();
        
        if (updateForm.estimatedDelivery) {
          updateData.estimatedDelivery = new Date(updateForm.estimatedDelivery);
        }
      }

      // Se foi marcado como entregue
      if (updateForm.status === 'delivered') {
        updateData.deliveredAt = serverTimestamp();
      }

      await updateDoc(orderRef, updateData);

      // Atualizar a lista local
      setOrders(prev => prev.map(order => 
        order.id === selectedOrder.id 
          ? { ...order, ...updateData, trackingCode: updateForm.trackingCode }
          : order
      ));

      toast({
        title: "Sucesso!",
        description: "Pedido atualizado com sucesso."
      });

      setShowUpdateDialog(false);
      setSelectedOrder(null);
      setUpdateForm({
        status: "",
        trackingCode: "",
        carrier: "",
        estimatedDelivery: ""
      });

    } catch (error) {
      console.error("Erro ao atualizar pedido:", error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível atualizar o pedido."
      });
    } finally {
      setUpdating(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'shipping':
        return <Truck className="h-4 w-4 text-blue-600" />;
      case 'cancelled':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-orange-600" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'processing':
        return 'Processando';
      case 'confirmed':
        return 'Confirmado';
      case 'shipping':
        return 'Em trânsito';
      case 'delivered':
        return 'Entregue';
      case 'cancelled':
        return 'Cancelado';
      default:
        return 'Processando';
    }
  };

  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'delivered':
        return 'default';
      case 'shipping':
        return 'secondary';
      case 'cancelled':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Gerenciar Pedidos</h1>
          <p className="text-muted-foreground">Gerencie todos os pedidos da plataforma</p>
        </div>

        {/* Filtros */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Label htmlFor="search">Buscar pedidos</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="search"
                    placeholder="ID do pedido ou email do cliente..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filtrar por status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="processing">Processando</SelectItem>
                    <SelectItem value="confirmed">Confirmado</SelectItem>
                    <SelectItem value="shipping">Em trânsito</SelectItem>
                    <SelectItem value="delivered">Entregue</SelectItem>
                    <SelectItem value="cancelled">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lista de Pedidos */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
              <p className="text-sm text-muted-foreground">Carregando pedidos...</p>
            </div>
          </div>
        ) : filteredOrders.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Nenhum pedido encontrado</h3>
              <p className="text-muted-foreground">
                {searchTerm || statusFilter !== "all" 
                  ? "Tente ajustar os filtros de busca."
                  : "Não há pedidos para exibir."
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <Card key={order.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        {getStatusIcon(order.status)}
                        <h3 className="font-semibold">Pedido #{order.id.slice(-8).toUpperCase()}</h3>
                        <Badge variant={getStatusVariant(order.status)}>
                          {getStatusLabel(order.status)}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                        <div>
                          <span className="font-medium">Cliente:</span> {order.customerEmail}
                        </div>
                        <div>
                          <span className="font-medium">Data:</span> {order.date}
                        </div>
                        <div>
                          <span className="font-medium">Total:</span> {order.total}
                        </div>
                      </div>
                      
                      {order.trackingCode && (
                        <div className="mt-2 text-sm">
                          <span className="font-medium">Rastreamento:</span> 
                          <code className="ml-2 px-2 py-1 bg-muted rounded">{order.trackingCode}</code>
                        </div>
                      )}
                      
                      <div className="mt-3">
                        <span className="font-medium text-sm">Itens:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {order.items.slice(0, 3).map((item, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {item.productName || item.name} ({item.quantity})
                            </Badge>
                          ))}
                          {order.items.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{order.items.length - 3} item(s)
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedOrder(order);
                        setUpdateForm({
                          status: order.status,
                          trackingCode: order.trackingCode || "",
                          carrier: order.carrier || "",
                          estimatedDelivery: ""
                        });
                        setShowUpdateDialog(true);
                      }}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Atualizar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Dialog de Atualização */}
        <Dialog open={showUpdateDialog} onOpenChange={setShowUpdateDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Atualizar Pedido</DialogTitle>
              <DialogDescription>
                Atualize o status e informações de entrega do pedido.
              </DialogDescription>
            </DialogHeader>
            
            {selectedOrder && (
              <div className="grid gap-4">
                <div>
                  <Label>Pedido</Label>
                  <p className="text-sm text-muted-foreground">
                    #{selectedOrder.id.slice(-8).toUpperCase()} - {selectedOrder.customerEmail}
                  </p>
                </div>
                
                <div>
                  <Label htmlFor="status">Status *</Label>
                  <Select value={updateForm.status} onValueChange={(value) => setUpdateForm(prev => ({ ...prev, status: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="processing">Processando</SelectItem>
                      <SelectItem value="confirmed">Confirmado</SelectItem>
                      <SelectItem value="shipping">Em trânsito</SelectItem>
                      <SelectItem value="delivered">Entregue</SelectItem>
                      <SelectItem value="cancelled">Cancelado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="trackingCode">Código de Rastreamento</Label>
                  <Input
                    id="trackingCode"
                    placeholder="Ex: BR123456789BR"
                    value={updateForm.trackingCode}
                    onChange={(e) => setUpdateForm(prev => ({ ...prev, trackingCode: e.target.value }))}
                  />
                </div>
                
                <div>
                  <Label htmlFor="carrier">Transportadora</Label>
                  <Input
                    id="carrier"
                    placeholder="Ex: Correios, SEDEX"
                    value={updateForm.carrier}
                    onChange={(e) => setUpdateForm(prev => ({ ...prev, carrier: e.target.value }))}
                  />
                </div>
                
                <div>
                  <Label htmlFor="estimatedDelivery">Previsão de Entrega</Label>
                  <Input
                    id="estimatedDelivery"
                    type="date"
                    value={updateForm.estimatedDelivery}
                    onChange={(e) => setUpdateForm(prev => ({ ...prev, estimatedDelivery: e.target.value }))}
                  />
                </div>
                
                <div className="flex space-x-2">
                  <Button onClick={handleUpdateOrder} disabled={updating} className="flex-1">
                    {updating ? "Atualizando..." : "Atualizar Pedido"}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setShowUpdateDialog(false);
                      setSelectedOrder(null);
                    }}
                    disabled={updating}
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default OrderManagement;

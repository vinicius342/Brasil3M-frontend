import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, Search, Eye, Truck, CheckCircle, Clock, AlertCircle } from "lucide-react";

const Orders = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const orders = [
    {
      id: "ORD-001",
      date: "2024-01-15",
      status: "Entregue",
      total: "R$ 299,90",
      items: [
        { name: "Smartphone Galaxy S21", quantity: 1, price: "R$ 299,90", image: "/placeholder.svg" }
      ],
      tracking: "BR123456789",
      estimatedDelivery: "2024-01-20"
    },
    {
      id: "ORD-002",
      date: "2024-01-10",
      status: "Em trânsito",
      total: "R$ 149,50",
      items: [
        { name: "Fone de Ouvido Bluetooth", quantity: 1, price: "R$ 149,50", image: "/placeholder.svg" }
      ],
      tracking: "BR987654321",
      estimatedDelivery: "2024-01-25"
    },
    {
      id: "ORD-003",
      date: "2024-01-05",
      status: "Preparando",
      total: "R$ 89,90",
      items: [
        { name: "Case para iPhone", quantity: 2, price: "R$ 44,95", image: "/placeholder.svg" },
        { name: "Cabo USB-C", quantity: 1, price: "R$ 45,00", image: "/placeholder.svg" }
      ],
      tracking: "BR456789123",
      estimatedDelivery: "2024-01-30"
    },
    {
      id: "ORD-004",
      date: "2023-12-20",
      status: "Cancelado",
      total: "R$ 199,90",
      items: [
        { name: "Tablet Android", quantity: 1, price: "R$ 199,90", image: "/placeholder.svg" }
      ],
      tracking: null,
      estimatedDelivery: null
    }
  ];

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
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Meus Pedidos</h1>
          <p className="text-muted-foreground">Acompanhe seus pedidos e histórico de compras</p>
        </div>

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
              <OrderCard key={order.id} order={order} getStatusIcon={getStatusIcon} getStatusVariant={getStatusVariant} />
            ))}
          </TabsContent>

          <TabsContent value="active" className="space-y-6">
            {activeOrders.map((order) => (
              <OrderCard key={order.id} order={order} getStatusIcon={getStatusIcon} getStatusVariant={getStatusVariant} />
            ))}
          </TabsContent>

          <TabsContent value="completed" className="space-y-6">
            {completedOrders.map((order) => (
              <OrderCard key={order.id} order={order} getStatusIcon={getStatusIcon} getStatusVariant={getStatusVariant} />
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

const OrderCard = ({ order, getStatusIcon, getStatusVariant }: any) => (
  <Card>
    <CardHeader>
      <div className="flex items-center justify-between">
        <div>
          <CardTitle className="text-lg">Pedido {order.id}</CardTitle>
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
          <div className="flex items-center justify-between mb-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Total do pedido</p>
              <p className="text-lg font-semibold">{order.total}</p>
            </div>
            {order.tracking && (
              <div className="space-y-1 text-right">
                <p className="text-sm text-muted-foreground">Código de rastreamento</p>
                <p className="text-sm font-medium">{order.tracking}</p>
              </div>
            )}
          </div>

          {order.estimatedDelivery && (
            <div className="mb-4">
              <p className="text-sm text-muted-foreground">
                Previsão de entrega: <span className="font-medium">{order.estimatedDelivery}</span>
              </p>
            </div>
          )}

          <div className="flex space-x-2">
            <Button variant="outline" size="sm">
              <Eye className="h-4 w-4 mr-2" />
              Ver Detalhes
            </Button>
            {order.status === "Entregue" && (
              <Button variant="outline" size="sm">
                Avaliar Produto
              </Button>
            )}
            {order.tracking && (
              <Button variant="outline" size="sm">
                <Truck className="h-4 w-4 mr-2" />
                Rastrear
              </Button>
            )}
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);

export default Orders;
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { User, Package, Heart, CreditCard, MapPin, ShoppingBag, Store, Star } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import Header from "@/components/Header";
import { EmailVerification } from "@/components/EmailVerification";

const Dashboard = () => {
  const { currentUser, logout } = useAuth();
  const [role, setRole] = useState<string | null>(null);
  const [user, setUser] = useState({
    displayName: "",
    email: "",
    avatar: "",
    orders: 0,
    wishlist: 0,
    reviews: 0
  });

  const recentOrders = [
    { id: "001", date: "2024-01-15", status: "Entregue", total: "R$ 299,90", items: 2 },
    { id: "002", date: "2024-01-10", status: "Em trânsito", total: "R$ 149,50", items: 1 },
    { id: "003", date: "2024-01-05", status: "Preparando", total: "R$ 89,90", items: 3 }
  ];

  useEffect(() => {
    const fetchUserData = async () => {
      if (currentUser) {
        const db = getFirestore();
        const userDoc = await getDoc(doc(db, "users", currentUser.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setUser({
            displayName: currentUser.displayName || "",
            email: currentUser.email || "",
            avatar: data.avatar || "/placeholder.svg",
            orders: data.orders || 0,
            wishlist: data.wishlist || 0,
            reviews: data.reviews || 0
          });
          setRole(data.role || null);
        }
      }
    };
    fetchUserData();
  }, [currentUser]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Minha Conta</h1>
          <p className="text-muted-foreground">Gerencie seus pedidos, perfil e preferências</p>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                    <User className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{user.displayName}</h3>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                </div>

                <nav className="space-y-2">
                  <Link to="/my-account" className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted transition-colors">
                    <User className="h-4 w-4" />
                    <span>Meu Perfil</span>
                  </Link>
                  <Link to="/orders" className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted transition-colors">
                    <Package className="h-4 w-4" />
                    <span>Meus Pedidos</span>
                  </Link>
                  <Link to="/wishlist" className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted transition-colors">
                    <Heart className="h-4 w-4" />
                    <span>Lista de Desejos</span>
                  </Link>
                    {(role === "seller" || role === "admin") && (
                      <Link to="/seller" className="flex items-center space-x-3 p-2 rounded-lg hover:bg-muted transition-colors">
                        <Store className="h-4 w-4" />
                        <span>Vender</span>
                      </Link>
                    )}
                  <Button variant="outline" className="w-full mt-2" onClick={async () => { await logout(); }}>
                    Sair
                  </Button>
                  {role === "admin" && (
                    <Button asChild variant="outline" className="w-full mt-2">
                      <Link to="/admin">Acessar Admin</Link>
                    </Button>
                  )}
                </nav>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList>
                <TabsTrigger value="overview">Visão Geral</TabsTrigger>
                <TabsTrigger value="orders">Pedidos Recentes</TabsTrigger>
                <TabsTrigger value="stats">Estatísticas</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                {/* Verificação de E-mail */}
                <EmailVerification />
                
                <div className="grid md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Total de Pedidos</p>
                          <p className="text-2xl font-bold text-foreground">{user.orders}</p>
                        </div>
                        <Package className="h-8 w-8 text-primary" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Lista de Desejos</p>
                          <p className="text-2xl font-bold text-foreground">{user.wishlist}</p>
                        </div>
                        <Heart className="h-8 w-8 text-primary" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">Avaliações</p>
                          <p className="text-2xl font-bold text-foreground">{user.reviews}</p>
                        </div>
                        <Star className="h-8 w-8 text-primary" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Ações Rápidas</CardTitle>
                    <CardDescription>Acesse rapidamente as principais funcionalidades</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <Button variant="outline" className="h-20 flex-col" asChild>
                        <Link to="/orders">
                          <Package className="h-6 w-6 mb-2" />
                          Ver Pedidos
                        </Link>
                      </Button>
                      <Button variant="outline" className="h-20 flex-col" asChild>
                        <Link to="/my-account">
                          <User className="h-6 w-6 mb-2" />
                          Editar Perfil
                        </Link>
                      </Button>
                      <Button variant="outline" className="h-20 flex-col" asChild>
                        <Link to="/wishlist">
                          <Heart className="h-6 w-6 mb-2" />
                          Lista de Desejos
                        </Link>
                      </Button>
                      <Button variant="outline" className="h-20 flex-col" asChild>
                        <Link to="/support">
                          <ShoppingBag className="h-6 w-6 mb-2" />
                          Suporte
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="orders" className="space-y-4">
                {recentOrders.map((order) => (
                  <Card key={order.id}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div>
                            <p className="font-semibold">Pedido #{order.id}</p>
                            <p className="text-sm text-muted-foreground">{order.date}</p>
                          </div>
                          <Badge variant={order.status === "Entregue" ? "default" : "secondary"}>
                            {order.status}
                          </Badge>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">{order.total}</p>
                          <p className="text-sm text-muted-foreground">{order.items} {order.items === 1 ? 'item' : 'itens'}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="stats" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Suas Estatísticas</CardTitle>
                    <CardDescription>Resumo da sua atividade na plataforma</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span>Membro desde</span>
                        <span className="font-medium">Janeiro 2024</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total gasto</span>
                        <span className="font-medium">R$ 1.299,90</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Economia em promoções</span>
                        <span className="font-medium text-green-600">R$ 259,80</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Pontos de fidelidade</span>
                        <span className="font-medium">1.250 pontos</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
import { useState } from "react";
import Header from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { User, CreditCard, MapPin, Shield, Plus, Trash2, Store } from "lucide-react";

const Profile = () => {
  // Mock user data - em um app real viria do estado/contexto de autenticação
  const userStatus = {
    type: "seller", // "client" ou "seller"
    isActive: true,
    memberSince: "Janeiro 2024"
  };

  const [profile, setProfile] = useState({
    firstName: "João",
    lastName: "Silva",
    email: "joao@email.com",
    phone: "(11) 99999-9999",
    cpf: "123.456.789-00"
  });

  const [addresses] = useState([
    {
      id: 1,
      type: "Casa",
      street: "Rua das Flores, 123",
      neighborhood: "Centro",
      city: "São Paulo",
      state: "SP",
      zipCode: "01234-567",
      isDefault: true
    },
    {
      id: 2,
      type: "Trabalho",
      street: "Av. Paulista, 1000",
      neighborhood: "Bela Vista",
      city: "São Paulo",
      state: "SP",
      zipCode: "01310-100",
      isDefault: false
    }
  ]);

  const [paymentMethods] = useState([
    {
      id: 1,
      type: "Cartão de Crédito",
      brand: "Visa",
      lastFour: "1234",
      expiryDate: "12/25",
      isDefault: true
    },
    {
      id: 2,
      type: "Cartão de Débito",
      brand: "Mastercard",
      lastFour: "5678",
      expiryDate: "08/26",
      isDefault: false
    }
  ]);

  const handleProfileUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Perfil atualizado:", profile);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Meu Perfil</h1>
              <p className="text-muted-foreground">Gerencie suas informações pessoais, endereços e formas de pagamento</p>
            </div>
            
            <div className="flex items-center gap-2">
              <Badge variant={userStatus.type === "seller" ? "default" : "secondary"} className="flex items-center gap-1">
                {userStatus.type === "seller" ? <Store className="h-3 w-3" /> : <User className="h-3 w-3" />}
                {userStatus.type === "seller" ? "Vendedor" : "Cliente"}
              </Badge>
              <Badge variant={userStatus.isActive ? "default" : "destructive"} className="flex items-center gap-1">
                <Shield className="h-3 w-3" />
                {userStatus.isActive ? "Ativo" : "Inativo"}
              </Badge>
            </div>
          </div>
          
          <div className="mt-4">
            <p className="text-sm text-muted-foreground">
              Membro desde: {userStatus.memberSince}
            </p>
          </div>
        </div>

        <Tabs defaultValue="personal" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="personal">Dados Pessoais</TabsTrigger>
            <TabsTrigger value="addresses">Endereços</TabsTrigger>
            <TabsTrigger value="payment">Pagamento</TabsTrigger>
          </TabsList>

          {/* Dados Pessoais */}
          <TabsContent value="personal">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span>Informações Pessoais</span>
                </CardTitle>
                <CardDescription>
                  Atualize seus dados pessoais e informações de contato
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleProfileUpdate} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">Nome</Label>
                      <Input
                        id="firstName"
                        value={profile.firstName}
                        onChange={(e) => setProfile({...profile, firstName: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Sobrenome</Label>
                      <Input
                        id="lastName"
                        value={profile.lastName}
                        onChange={(e) => setProfile({...profile, lastName: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profile.email}
                      onChange={(e) => setProfile({...profile, email: e.target.value})}
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="phone">Telefone</Label>
                      <Input
                        id="phone"
                        value={profile.phone}
                        onChange={(e) => setProfile({...profile, phone: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cpf">CPF</Label>
                      <Input
                        id="cpf"
                        value={profile.cpf}
                        onChange={(e) => setProfile({...profile, cpf: e.target.value})}
                      />
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center space-x-2">
                      <Shield className="h-5 w-5" />
                      <span>Segurança</span>
                    </h3>
                    <Button variant="outline" type="button">
                      Alterar Senha
                    </Button>
                  </div>

                  <Button type="submit">Salvar Alterações</Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Endereços */}
          <TabsContent value="addresses">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center space-x-2">
                      <MapPin className="h-5 w-5" />
                      <span>Meus Endereços</span>
                    </CardTitle>
                    <CardDescription>
                      Gerencie seus endereços de entrega
                    </CardDescription>
                  </div>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Endereço
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {addresses.map((address) => (
                    <Card key={address.id} className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <h4 className="font-semibold">{address.type}</h4>
                            {address.isDefault && (
                              <Badge variant="default" className="text-xs">Padrão</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {address.street}<br />
                            {address.neighborhood}, {address.city} - {address.state}<br />
                            CEP: {address.zipCode}
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">Editar</Button>
                          <Button variant="outline" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Formas de Pagamento */}
          <TabsContent value="payment">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center space-x-2">
                      <CreditCard className="h-5 w-5" />
                      <span>Formas de Pagamento</span>
                    </CardTitle>
                    <CardDescription>
                      Gerencie seus cartões e formas de pagamento
                    </CardDescription>
                  </div>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Cartão
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {paymentMethods.map((method) => (
                    <Card key={method.id} className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-8 bg-gradient-to-r from-primary to-primary/80 rounded flex items-center justify-center">
                            <CreditCard className="h-4 w-4 text-white" />
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <h4 className="font-semibold">{method.brand} •••• {method.lastFour}</h4>
                              {method.isDefault && (
                                <Badge variant="default" className="text-xs">Padrão</Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {method.type} • Expira em {method.expiryDate}
                            </p>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">Editar</Button>
                          <Button variant="outline" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Profile;
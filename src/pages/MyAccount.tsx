import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import { EmailVerification } from "@/components/EmailVerification";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, CreditCard, MapPin, Shield, Plus, Trash2, Store, Loader2, Edit } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection, 
  getDocs, 
  addDoc, 
  deleteDoc, 
  query, 
  where,
  serverTimestamp 
} from "firebase/firestore";
import { updateProfile, updatePassword } from "firebase/auth";

const Profile = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const db = getFirestore();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userStatus, setUserStatus] = useState({
    type: "client",
    isActive: true,
    memberSince: ""
  });

  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    cpf: "",
    displayName: ""
  });

  const [addresses, setAddresses] = useState([]);
  const [paymentMethods, setPaymentMethods] = useState([]);
  
  // Estados para modais
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [editingPayment, setEditingPayment] = useState(null);

  // Novos dados para formulários
  const [newAddress, setNewAddress] = useState({
    type: "",
    street: "",
    neighborhood: "",
    city: "",
    state: "",
    zipCode: "",
    isDefault: false
  });

  const [newPayment, setNewPayment] = useState({
    type: "credit",
    brand: "",
    lastFour: "",
    expiryDate: "",
    holderName: "",
    isDefault: false
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  // Carregar dados do usuário
  useEffect(() => {
    const loadUserData = async () => {
      if (!currentUser) {
        navigate('/login');
        return;
      }

      try {
        setLoading(true);

        // Carregar dados do perfil
        const userDoc = await getDoc(doc(db, "users", currentUser.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setProfile({
            firstName: userData.firstName || "",
            lastName: userData.lastName || "",
            email: currentUser.email || "",
            phone: userData.phone || "",
            cpf: userData.cpf || "",
            displayName: currentUser.displayName || ""
          });
          
          setUserStatus({
            type: userData.role || "client",
            isActive: userData.status === "active",
            memberSince: userData.createdAt?.toDate()?.toLocaleDateString('pt-BR', { 
              month: 'long', 
              year: 'numeric' 
            }) || "Data não disponível"
          });
        }

        // Carregar endereços
        const addressQuery = query(collection(db, "addresses"), where("userId", "==", currentUser.uid));
        const addressSnapshot = await getDocs(addressQuery);
        const addressList = addressSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setAddresses(addressList);

        // Carregar formas de pagamento
        const paymentQuery = query(collection(db, "paymentMethods"), where("userId", "==", currentUser.uid));
        const paymentSnapshot = await getDocs(paymentQuery);
        const paymentList = paymentSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setPaymentMethods(paymentList);

      } catch (error) {
        console.error("Erro ao carregar dados:", error);
        toast({
          variant: "destructive",
          title: "Erro",
          description: "Erro ao carregar dados do perfil."
        });
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [currentUser, db, navigate, toast]);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    try {
      setSaving(true);

      // Atualizar displayName no Firebase Auth
      const displayName = `${profile.firstName} ${profile.lastName}`;
      await updateProfile(currentUser, { displayName });

      // Atualizar dados no Firestore
      await updateDoc(doc(db, "users", currentUser.uid), {
        firstName: profile.firstName,
        lastName: profile.lastName,
        phone: profile.phone,
        cpf: profile.cpf,
        displayName,
        updatedAt: serverTimestamp()
      });

      toast({
        title: "Sucesso!",
        description: "Perfil atualizado com sucesso."
      });
    } catch (error) {
      console.error("Erro ao atualizar perfil:", error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro ao atualizar perfil. Tente novamente."
      });
    } finally {
      setSaving(false);
    }
  };

  // Funções para gerenciar endereços
  const handleAddAddress = async () => {
    if (!currentUser || !newAddress.type || !newAddress.street) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Preencha todos os campos obrigatórios."
      });
      return;
    }

    try {
      // Se for padrão, remover padrão dos outros
      if (newAddress.isDefault) {
        const addressesToUpdate = addresses.filter(addr => addr.isDefault);
        for (const addr of addressesToUpdate) {
          await updateDoc(doc(db, "addresses", addr.id), { isDefault: false });
        }
      }

      await addDoc(collection(db, "addresses"), {
        ...newAddress,
        userId: currentUser.uid,
        createdAt: serverTimestamp()
      });

      // Recarregar endereços
      const addressQuery = query(collection(db, "addresses"), where("userId", "==", currentUser.uid));
      const addressSnapshot = await getDocs(addressQuery);
      const addressList = addressSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setAddresses(addressList);

      setNewAddress({
        type: "",
        street: "",
        neighborhood: "",
        city: "",
        state: "",
        zipCode: "",
        isDefault: false
      });
      setIsAddressModalOpen(false);

      toast({
        title: "Sucesso!",
        description: "Endereço adicionado com sucesso."
      });
    } catch (error) {
      console.error("Erro ao adicionar endereço:", error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro ao adicionar endereço."
      });
    }
  };

  const handleDeleteAddress = async (addressId: string) => {
    try {
      await deleteDoc(doc(db, "addresses", addressId));
      setAddresses(addresses.filter(addr => addr.id !== addressId));
      
      toast({
        title: "Sucesso!",
        description: "Endereço removido com sucesso."
      });
    } catch (error) {
      console.error("Erro ao remover endereço:", error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro ao remover endereço."
      });
    }
  };

  // Funções para gerenciar formas de pagamento
  const handleAddPayment = async () => {
    if (!currentUser || !newPayment.brand || !newPayment.lastFour) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Preencha todos os campos obrigatórios."
      });
      return;
    }

    try {
      // Se for padrão, remover padrão dos outros
      if (newPayment.isDefault) {
        const paymentsToUpdate = paymentMethods.filter(payment => payment.isDefault);
        for (const payment of paymentsToUpdate) {
          await updateDoc(doc(db, "paymentMethods", payment.id), { isDefault: false });
        }
      }

      await addDoc(collection(db, "paymentMethods"), {
        ...newPayment,
        userId: currentUser.uid,
        createdAt: serverTimestamp()
      });

      // Recarregar formas de pagamento
      const paymentQuery = query(collection(db, "paymentMethods"), where("userId", "==", currentUser.uid));
      const paymentSnapshot = await getDocs(paymentQuery);
      const paymentList = paymentSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setPaymentMethods(paymentList);

      setNewPayment({
        type: "credit",
        brand: "",
        lastFour: "",
        expiryDate: "",
        holderName: "",
        isDefault: false
      });
      setIsPaymentModalOpen(false);

      toast({
        title: "Sucesso!",
        description: "Forma de pagamento adicionada com sucesso."
      });
    } catch (error) {
      console.error("Erro ao adicionar forma de pagamento:", error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro ao adicionar forma de pagamento."
      });
    }
  };

  const handleDeletePayment = async (paymentId: string) => {
    try {
      await deleteDoc(doc(db, "paymentMethods", paymentId));
      setPaymentMethods(paymentMethods.filter(payment => payment.id !== paymentId));
      
      toast({
        title: "Sucesso!",
        description: "Forma de pagamento removida com sucesso."
      });
    } catch (error) {
      console.error("Erro ao remover forma de pagamento:", error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro ao remover forma de pagamento."
      });
    }
  };

  // Função para alterar senha
  const handlePasswordChange = async () => {
    if (!currentUser || !passwordData.newPassword || passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "As senhas não coincidem ou estão vazias."
      });
      return;
    }

    try {
      await updatePassword(currentUser, passwordData.newPassword);
      
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      });
      setIsPasswordModalOpen(false);

      toast({
        title: "Sucesso!",
        description: "Senha alterada com sucesso."
      });
    } catch (error) {
      console.error("Erro ao alterar senha:", error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Erro ao alterar senha. Verifique sua senha atual."
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
            <span className="ml-2">Carregando dados...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Verificação de E-mail */}
        <div className="mb-6">
          <EmailVerification />
        </div>

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
                    <Dialog open={isPasswordModalOpen} onOpenChange={setIsPasswordModalOpen}>
                      <DialogTrigger asChild>
                        <Button variant="outline" type="button">
                          Alterar Senha
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Alterar Senha</DialogTitle>
                          <DialogDescription>
                            Digite sua nova senha abaixo.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="newPassword">Nova Senha</Label>
                            <Input
                              id="newPassword"
                              type="password"
                              value={passwordData.newPassword}
                              onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
                            <Input
                              id="confirmPassword"
                              type="password"
                              value={passwordData.confirmPassword}
                              onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setIsPasswordModalOpen(false)}>
                            Cancelar
                          </Button>
                          <Button onClick={handlePasswordChange}>
                            Alterar Senha
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>

                  <Button type="submit" disabled={saving}>
                    {saving ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Salvando...
                      </>
                    ) : (
                      "Salvar Alterações"
                    )}
                  </Button>
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
                  <Dialog open={isAddressModalOpen} onOpenChange={setIsAddressModalOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Adicionar Endereço
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                      <DialogHeader>
                        <DialogTitle>Adicionar Endereço</DialogTitle>
                        <DialogDescription>
                          Preencha os dados do novo endereço.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="addressType">Tipo</Label>
                            <Select value={newAddress.type} onValueChange={(value) => setNewAddress({...newAddress, type: value})}>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Casa">Casa</SelectItem>
                                <SelectItem value="Trabalho">Trabalho</SelectItem>
                                <SelectItem value="Outro">Outro</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="zipCode">CEP</Label>
                            <Input
                              id="zipCode"
                              value={newAddress.zipCode}
                              onChange={(e) => setNewAddress({...newAddress, zipCode: e.target.value})}
                              placeholder="00000-000"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="street">Endereço</Label>
                          <Input
                            id="street"
                            value={newAddress.street}
                            onChange={(e) => setNewAddress({...newAddress, street: e.target.value})}
                            placeholder="Rua, número, complemento"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="neighborhood">Bairro</Label>
                            <Input
                              id="neighborhood"
                              value={newAddress.neighborhood}
                              onChange={(e) => setNewAddress({...newAddress, neighborhood: e.target.value})}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="city">Cidade</Label>
                            <Input
                              id="city"
                              value={newAddress.city}
                              onChange={(e) => setNewAddress({...newAddress, city: e.target.value})}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="state">Estado</Label>
                          <Input
                            id="state"
                            value={newAddress.state}
                            onChange={(e) => setNewAddress({...newAddress, state: e.target.value})}
                            placeholder="SP"
                          />
                        </div>
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="isDefaultAddress"
                            checked={newAddress.isDefault}
                            onChange={(e) => setNewAddress({...newAddress, isDefault: e.target.checked})}
                          />
                          <Label htmlFor="isDefaultAddress">Definir como endereço padrão</Label>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAddressModalOpen(false)}>
                          Cancelar
                        </Button>
                        <Button onClick={handleAddAddress}>
                          Adicionar
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
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
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleDeleteAddress(address.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                  {addresses.length === 0 && (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">Nenhum endereço cadastrado.</p>
                    </div>
                  )}
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
                  <Dialog open={isPaymentModalOpen} onOpenChange={setIsPaymentModalOpen}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Adicionar Cartão
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                      <DialogHeader>
                        <DialogTitle>Adicionar Forma de Pagamento</DialogTitle>
                        <DialogDescription>
                          Preencha os dados do cartão.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="paymentType">Tipo</Label>
                          <Select value={newPayment.type} onValueChange={(value) => setNewPayment({...newPayment, type: value})}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="credit">Cartão de Crédito</SelectItem>
                              <SelectItem value="debit">Cartão de Débito</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="holderName">Nome no Cartão</Label>
                          <Input
                            id="holderName"
                            value={newPayment.holderName}
                            onChange={(e) => setNewPayment({...newPayment, holderName: e.target.value})}
                            placeholder="Como impresso no cartão"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="brand">Bandeira</Label>
                            <Select value={newPayment.brand} onValueChange={(value) => setNewPayment({...newPayment, brand: value})}>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Visa">Visa</SelectItem>
                                <SelectItem value="Mastercard">Mastercard</SelectItem>
                                <SelectItem value="Elo">Elo</SelectItem>
                                <SelectItem value="American Express">American Express</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="lastFour">Últimos 4 dígitos</Label>
                            <Input
                              id="lastFour"
                              value={newPayment.lastFour}
                              onChange={(e) => setNewPayment({...newPayment, lastFour: e.target.value})}
                              placeholder="1234"
                              maxLength={4}
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="expiryDate">Data de Vencimento</Label>
                          <Input
                            id="expiryDate"
                            value={newPayment.expiryDate}
                            onChange={(e) => setNewPayment({...newPayment, expiryDate: e.target.value})}
                            placeholder="MM/AA"
                          />
                        </div>
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="isDefaultPayment"
                            checked={newPayment.isDefault}
                            onChange={(e) => setNewPayment({...newPayment, isDefault: e.target.checked})}
                          />
                          <Label htmlFor="isDefaultPayment">Definir como padrão</Label>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsPaymentModalOpen(false)}>
                          Cancelar
                        </Button>
                        <Button onClick={handleAddPayment}>
                          Adicionar
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
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
                              {method.type === "credit" ? "Cartão de Crédito" : "Cartão de Débito"} • Expira em {method.expiryDate}
                            </p>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleDeletePayment(method.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                  {paymentMethods.length === 0 && (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">Nenhuma forma de pagamento cadastrada.</p>
                    </div>
                  )}
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
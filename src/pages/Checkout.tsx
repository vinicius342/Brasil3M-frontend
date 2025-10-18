import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CreditCard, MapPin, Truck, Shield, Plus, Edit, Trash2, Calculator } from "lucide-react";
import Header from "@/components/Header";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { getFirestore, collection, addDoc, serverTimestamp, query, where, getDocs, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { calculateShipping, searchCEP, ShippingQuote, API_CONFIG } from "@/services/shippingService";
import { paymentService } from "@/services/paymentService";

const Checkout = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { cartItems, getTotalPrice, clearCart } = useCart();
  const { currentUser } = useAuth();
  const [step, setStep] = useState(1);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState("");
  const [selectedPayment, setSelectedPayment] = useState("credit");
  const [selectedShipping, setSelectedShipping] = useState("standard");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [loadingShipping, setLoadingShipping] = useState(false);
  const [shippingQuotes, setShippingQuotes] = useState<ShippingQuote[]>([]);
  const [showAddAddressDialog, setShowAddAddressDialog] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  
  // Form para novo endereço
  const [newAddress, setNewAddress] = useState({
    name: "",
    street: "",
    number: "",
    complement: "",
    neighborhood: "",
    city: "",
    state: "",
    zipCode: ""
  });
  const [loadingCEP, setLoadingCEP] = useState(false);
  
  // Estados para pagamento removidos - agora usando Checkout Pro simples

  // Buscar dados do CEP
  const handleCEPSearch = async (cep: string) => {
    if (cep.replace(/\D/g, '').length === 8) {
      setLoadingCEP(true);
      try {
        const addressData = await searchCEP(cep);
        setNewAddress(prev => ({
          ...prev,
          street: addressData.logradouro,
          neighborhood: addressData.bairro,
          city: addressData.localidade,
          state: addressData.uf,
          zipCode: addressData.cep
        }));
      } catch (error) {
        toast({
          variant: "destructive",
          title: "CEP não encontrado",
          description: "Verifique o CEP informado e tente novamente."
        });
      } finally {
        setLoadingCEP(false);
      }
    }
  };

  // Calcular frete quando endereço for selecionado
  useEffect(() => {
    const calculateShippingQuotes = async () => {
      if (!selectedAddress || addresses.length === 0) {
        setShippingQuotes([]);
        return;
      }

      const selectedAddressData = addresses.find(addr => addr.id === selectedAddress);
      if (!selectedAddressData?.zipCode) return;

      setLoadingShipping(true);
      try {
        // Calcular peso e dimensões baseados nos itens do carrinho
        const totalWeight = cartItems.reduce((acc, item) => acc + (item.quantity * (item.weight || 0.5)), 0); // Usar peso do item ou padrão 500g
        const dimensions = { length: 20, width: 15, height: 10 }; // Dimensões padrão para o pacote

        const quotes = await calculateShipping(
          API_CONFIG.companyZipCode, // CEP de origem configurável
          selectedAddressData.zipCode,
          totalWeight,
          dimensions
        );

        setShippingQuotes(quotes);
        
        // Selecionar automaticamente a primeira opção
        if (quotes.length > 0) {
          setSelectedShipping(quotes[0].id);
        }
      } catch (error) {
        console.error('Erro ao calcular frete:', error);
        toast({
          variant: "destructive",
          title: "Erro no frete",
          description: "Não foi possível calcular o frete. Tente novamente."
        });
        
        // Fallback para opções padrão
        setShippingQuotes([
          {
            id: 'standard',
            name: 'Entrega Padrão',
            price: 0,
            deliveryTime: '5-7 dias úteis',
            company: 'Brasil 3M',
            service: 'Frete Grátis'
          }
        ]);
        setSelectedShipping('standard');
      } finally {
        setLoadingShipping(false);
      }
    };

    calculateShippingQuotes();
  }, [selectedAddress, addresses, cartItems, toast]);

  // Buscar endereços do usuário
  useEffect(() => {
    const fetchAddresses = async () => {
      if (!currentUser) return;
      
      setLoadingAddresses(true);
      try {
        const db = getFirestore();
        const addressesQuery = query(
          collection(db, 'addresses'),
          where('userId', '==', currentUser.uid)
        );
        
        const addressesSnapshot = await getDocs(addressesQuery);
        const addressesList = addressesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setAddresses(addressesList);
        
        // Selecionar o primeiro endereço se houver
        if (addressesList.length > 0) {
          setSelectedAddress(addressesList[0].id);
        }
      } catch (error) {
        console.error("Erro ao buscar endereços:", error);
        toast({
          variant: "destructive",
          title: "Erro",
          description: "Não foi possível carregar seus endereços."
        });
      } finally {
        setLoadingAddresses(false);
      }
    };

    fetchAddresses();
  }, [currentUser, toast]);

  // Adicionar ou editar endereço
  const handleAddOrUpdateAddress = async () => {
    if (!currentUser) return;
    
    // Validar campos obrigatórios
    if (!newAddress.name || !newAddress.street || !newAddress.number || 
        !newAddress.neighborhood || !newAddress.city || !newAddress.state || !newAddress.zipCode) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Preencha todos os campos obrigatórios."
      });
      return;
    }

    try {
      const db = getFirestore();
      
      if (editingAddress) {
        // Atualizar endereço existente
        const addressData = {
          ...newAddress,
          updatedAt: serverTimestamp()
        };

        await updateDoc(doc(db, 'addresses', editingAddress.id), addressData);
        
        // Atualizar a lista local
        setAddresses(prev => prev.map(addr => 
          addr.id === editingAddress.id ? { ...addr, ...addressData } : addr
        ));
        
        toast({
          title: "Sucesso!",
          description: "Endereço atualizado com sucesso."
        });
      } else {
        // Adicionar novo endereço
        const addressData = {
          ...newAddress,
          userId: currentUser.uid,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        };

        const docRef = await addDoc(collection(db, 'addresses'), addressData);
        
        // Adicionar o novo endereço à lista local
        const newAddressWithId = { id: docRef.id, ...addressData };
        setAddresses(prev => [...prev, newAddressWithId]);
        
        // Selecionar o novo endereço
        setSelectedAddress(docRef.id);
        
        toast({
          title: "Sucesso!",
          description: "Endereço adicionado com sucesso."
        });
      }
      
      // Limpar formulário e fechar dialog
      setNewAddress({
        name: "",
        street: "",
        number: "",
        complement: "",
        neighborhood: "",
        city: "",
        state: "",
        zipCode: ""
      });
      setEditingAddress(null);
      setShowAddAddressDialog(false);
      
    } catch (error) {
      console.error("Erro ao salvar endereço:", error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: `Não foi possível ${editingAddress ? 'atualizar' : 'adicionar'} o endereço.`
      });
    }
  };

  // Excluir endereço
  const handleDeleteAddress = async (addressId) => {
    try {
      const db = getFirestore();
      await deleteDoc(doc(db, 'addresses', addressId));
      
      // Remover da lista local
      setAddresses(prev => prev.filter(addr => addr.id !== addressId));
      
      // Se o endereço excluído estava selecionado, selecionar outro
      if (selectedAddress === addressId) {
        const remainingAddresses = addresses.filter(addr => addr.id !== addressId);
        setSelectedAddress(remainingAddresses.length > 0 ? remainingAddresses[0].id : "");
      }
      
      toast({
        title: "Sucesso!",
        description: "Endereço removido com sucesso."
      });
    } catch (error) {
      console.error("Erro ao excluir endereço:", error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível remover o endereço."
      });
    }
  };

  const subtotal = getTotalPrice();
  const selectedShippingQuote = shippingQuotes.find(quote => quote.id === selectedShipping);
  const shippingCost = selectedShippingQuote?.price || 0;
  const total = subtotal + shippingCost;

  const handleFinishOrder = async () => {
    if (!acceptTerms) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Você deve aceitar os termos e condições para continuar."
      });
      return;
    }

    if (cartItems.length === 0) {
      toast({
        variant: "destructive",
        title: "Carrinho vazio",
        description: "Adicione produtos ao carrinho antes de finalizar a compra."
      });
      return;
    }

    if (!currentUser) {
      toast({
        variant: "destructive",
        title: "Erro de autenticação",
        description: "Você precisa estar logado para finalizar a compra."
      });
      navigate('/login');
      return;
    }

    if (!selectedAddress) {
      toast({
        variant: "destructive",
        title: "Endereço obrigatório",
        description: "Selecione um endereço de entrega para continuar."
      });
      return;
    }

    setLoading(true);

    try {
      console.log('🚀 Criando preferência para Checkout Pro...');
      
      // Buscar endereço selecionado
      const selectedAddressData = addresses.find(addr => addr.id === selectedAddress);
      
      // Preparar items para o MercadoPago
      const items = cartItems.map((item, index) => ({
        id: `item_${index}`,
        title: item.name,
        description: `Produto ${item.name}`,
        quantity: item.quantity,
        unit_price: item.price
      }));

      // Adicionar frete como item se houver
      if (shippingCost > 0) {
        items.push({
          id: 'shipping',
          title: 'Frete',
          description: selectedShippingQuote?.name || 'Entrega',
          quantity: 1,
          unit_price: shippingCost
        });
      }

      // Criar preferência do Checkout Pro
      const preferenceResult = await paymentService.createCheckoutPreference({
        items,
        payer: {
          name: currentUser.displayName?.split(' ')[0] || 'Cliente',
          surname: currentUser.displayName?.split(' ').slice(1).join(' ') || '',
          email: currentUser.email || '',
          identification: {
            type: 'CPF',
            number: '12345678909' // Você pode coletar isso em um campo do formulário
          }
        },
        back_urls: {
          success: `https://brasil-3m-91243.web.app/checkout/success`,
          failure: `https://brasil-3m-91243.web.app/checkout/failure`,
          pending: `https://brasil-3m-91243.web.app/checkout/pending`
        },
        external_reference: `order_${Date.now()}_${currentUser.uid}`
      });

      if (preferenceResult.success && preferenceResult.data) {
        console.log('✅ Preferência criada:', preferenceResult.data);
        
        // Salvar dados do pedido no Firebase antes de redirecionar
        const db = getFirestore();
        const orderData = {
          userId: currentUser.uid,
          items: cartItems,
          total,
          subtotal,
          shipping: {
            cost: shippingCost,
            option: selectedShippingQuote
          },
          address: selectedAddressData,
          paymentMethod: 'mercadopago_checkout_pro',
          preferenceId: preferenceResult.data.id,
          status: 'pending_payment',
          createdAt: serverTimestamp(),
          external_reference: `order_${Date.now()}_${currentUser.uid}`
        };

        await addDoc(collection(db, 'orders'), orderData);
        
        // Redirecionar para o Checkout Pro do MercadoPago
        // Em sandbox, usar sandbox_init_point; em produção, usar init_point
        const checkoutUrl = preferenceResult.data.sandbox_init_point || preferenceResult.data.init_point;
        
        toast({
          title: "Redirecionando...",
          description: "Você será direcionado para o MercadoPago para finalizar o pagamento."
        });
        
        // Redirecionar para o MercadoPago
        window.location.href = checkoutUrl;
        
      } else {
        throw new Error(preferenceResult.error || 'Erro ao criar preferência de pagamento');
      }

    } catch (error: any) {
      console.error('❌ Erro ao finalizar pedido:', error);
      toast({
        variant: "destructive",
        title: "Erro no checkout",
        description: error.message || "Erro ao processar pagamento. Tente novamente."
      });
    } finally {
      setLoading(false);
    }
  };

  // Handlers para pagamento removidos - agora usando Checkout Pro

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Finalizar Compra</h1>
          <p className="text-muted-foreground">Complete sua compra em poucos passos</p>
        </div>

        {cartItems.length === 0 ? (
          <div className="text-center py-16">
            <h2 className="text-2xl font-semibold mb-4">Seu carrinho está vazio</h2>
            <p className="text-muted-foreground mb-8">Adicione produtos ao carrinho para continuar com a compra.</p>
            <Button onClick={() => navigate('/')}>
              Continuar Comprando
            </Button>
          </div>
        ) : (

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Address Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MapPin className="h-5 w-5" />
                  <span>Endereço de Entrega</span>
                </CardTitle>
                <CardDescription>Escolha onde você quer receber seu pedido</CardDescription>
              </CardHeader>
              <CardContent>
                {loadingAddresses ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                      <p className="text-sm text-muted-foreground">Carregando endereços...</p>
                    </div>
                  </div>
                ) : addresses.length === 0 ? (
                  <div className="text-center py-8">
                    <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Nenhum endereço cadastrado</h3>
                    <p className="text-muted-foreground mb-4">Adicione um endereço para continuar com a compra.</p>
                  </div>
                ) : (
                  <RadioGroup value={selectedAddress} onValueChange={setSelectedAddress}>
                    {addresses.map((address) => (
                      <div key={address.id} className="flex items-start space-x-3 p-4 border rounded-lg">
                        <RadioGroupItem value={address.id} className="mt-1" />
                        <div className="flex-1">
                          <h4 className="font-semibold">{address.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {address.street}, {address.number}
                            {address.complement && `, ${address.complement}`}<br />
                            {address.neighborhood}, {address.city} - {address.state}<br />
                            CEP: {address.zipCode}
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => {
                              setEditingAddress(address);
                              setNewAddress(address);
                              setShowAddAddressDialog(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-600 hover:text-red-700"
                            onClick={() => handleDeleteAddress(address.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </RadioGroup>
                )}
                
                <Dialog open={showAddAddressDialog} onOpenChange={setShowAddAddressDialog}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="mt-4">
                      <Plus className="h-4 w-4 mr-2" />
                      {addresses.length === 0 ? "Adicionar Endereço" : "Adicionar Novo Endereço"}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>
                        {editingAddress ? "Editar Endereço" : "Adicionar Novo Endereço"}
                      </DialogTitle>
                      <DialogDescription>
                        Preencha as informações do endereço de entrega.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4">
                      <div>
                        <Label htmlFor="name">Nome do Endereço *</Label>
                        <Input
                          id="name"
                          placeholder="Ex: Casa, Trabalho"
                          value={newAddress.name}
                          onChange={(e) => setNewAddress(prev => ({ ...prev, name: e.target.value }))}
                        />
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="col-span-2">
                          <Label htmlFor="street">Rua *</Label>
                          <Input
                            id="street"
                            placeholder="Nome da rua"
                            value={newAddress.street}
                            onChange={(e) => setNewAddress(prev => ({ ...prev, street: e.target.value }))}
                          />
                        </div>
                        <div>
                          <Label htmlFor="number">Número *</Label>
                          <Input
                            id="number"
                            placeholder="123"
                            value={newAddress.number}
                            onChange={(e) => setNewAddress(prev => ({ ...prev, number: e.target.value }))}
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="complement">Complemento</Label>
                        <Input
                          id="complement"
                          placeholder="Apto, bloco, etc."
                          value={newAddress.complement}
                          onChange={(e) => setNewAddress(prev => ({ ...prev, complement: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="neighborhood">Bairro *</Label>
                        <Input
                          id="neighborhood"
                          placeholder="Nome do bairro"
                          value={newAddress.neighborhood}
                          onChange={(e) => setNewAddress(prev => ({ ...prev, neighborhood: e.target.value }))}
                        />
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="col-span-2">
                          <Label htmlFor="city">Cidade *</Label>
                          <Input
                            id="city"
                            placeholder="Nome da cidade"
                            value={newAddress.city}
                            onChange={(e) => setNewAddress(prev => ({ ...prev, city: e.target.value }))}
                          />
                        </div>
                        <div>
                          <Label htmlFor="state">Estado *</Label>
                          <Input
                            id="state"
                            placeholder="SP"
                            maxLength={2}
                            value={newAddress.state}
                            onChange={(e) => setNewAddress(prev => ({ ...prev, state: e.target.value.toUpperCase() }))}
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="zipCode">CEP *</Label>
                        <div className="flex space-x-2">
                          <Input
                            id="zipCode"
                            placeholder="00000-000"
                            value={newAddress.zipCode}
                            onChange={(e) => {
                              const value = e.target.value.replace(/\D/g, '').slice(0, 8);
                              const formatted = value.replace(/^(\d{5})(\d)/, '$1-$2');
                              setNewAddress(prev => ({ ...prev, zipCode: formatted }));
                              
                              if (value.length === 8) {
                                handleCEPSearch(value);
                              }
                            }}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            disabled={loadingCEP || newAddress.zipCode.replace(/\D/g, '').length !== 8}
                            onClick={() => handleCEPSearch(newAddress.zipCode)}
                          >
                            {loadingCEP ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                            ) : (
                              <Calculator className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                        {loadingCEP && (
                          <p className="text-xs text-muted-foreground mt-1">Buscando CEP...</p>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        <Button onClick={handleAddOrUpdateAddress} className="flex-1">
                          {editingAddress ? "Atualizar" : "Adicionar"}
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={() => {
                            setShowAddAddressDialog(false);
                            setEditingAddress(null);
                            setNewAddress({
                              name: "",
                              street: "",
                              number: "",
                              complement: "",
                              neighborhood: "",
                              city: "",
                              state: "",
                              zipCode: ""
                            });
                          }}
                        >
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>

            {/* Shipping Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Truck className="h-5 w-5" />
                  <span>Forma de Entrega</span>
                </CardTitle>
                <CardDescription>Escolha como você quer receber seu pedido</CardDescription>
              </CardHeader>
              <CardContent>
                {!selectedAddress ? (
                  <div className="text-center py-8">
                    <Calculator className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Selecione um endereço</h3>
                    <p className="text-muted-foreground">Escolha um endereço de entrega para calcular o frete.</p>
                  </div>
                ) : loadingShipping ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                      <p className="text-sm text-muted-foreground">Calculando frete...</p>
                    </div>
                  </div>
                ) : shippingQuotes.length === 0 ? (
                  <div className="text-center py-8">
                    <Truck className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Frete não disponível</h3>
                    <p className="text-muted-foreground">Não foi possível calcular o frete para este endereço.</p>
                  </div>
                ) : (
                  <RadioGroup value={selectedShipping} onValueChange={setSelectedShipping}>
                    {shippingQuotes.map((quote) => (
                      <div key={quote.id} className="flex items-start space-x-3 p-4 border rounded-lg">
                        <RadioGroupItem value={quote.id} className="mt-1" />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-semibold">{quote.name}</h4>
                            <span className="font-semibold">
                              {quote.price === 0 ? "Grátis" : `R$ ${quote.price.toFixed(2).replace('.', ',')}`}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">{quote.company} - {quote.service}</p>
                          <p className="text-sm text-primary">{quote.deliveryTime}</p>
                        </div>
                      </div>
                    ))}
                  </RadioGroup>
                )}
              </CardContent>
            </Card>

            {/* Payment Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CreditCard className="h-5 w-5" />
                  <span>Forma de Pagamento</span>
                </CardTitle>
                <CardDescription>Você será redirecionado para o MercadoPago para finalizar o pagamento</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg bg-blue-50">
                    <div className="flex items-center space-x-3">
                      <CreditCard className="h-6 w-6 text-blue-600" />
                      <div>
                        <h4 className="font-semibold text-blue-900">Checkout Seguro MercadoPago</h4>
                        <p className="text-sm text-blue-700">
                          💳 Cartão de crédito e débito<br />
                          💰 PIX<br />
                          🎫 Boleto bancário
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 p-3 bg-white rounded border border-blue-200">
                      <p className="text-xs text-blue-600">
                        ✅ <strong>Mais segurança:</strong> Seus dados de pagamento são processados diretamente pelo MercadoPago<br />
                        ✅ <strong>Praticidade:</strong> Todas as formas de pagamento em um lugar<br />
                        ✅ <strong>Confiança:</strong> Certificação PCI DSS
                      </p>
                    </div>
                  </div>
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
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex items-center space-x-3">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-12 h-12 object-cover rounded-md"
                      />
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{item.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          Qtd: {item.quantity}
                        </p>
                      </div>
                      <span className="font-semibold">
                        R$ {(item.price * item.quantity).toFixed(2).replace('.', ',')}
                      </span>
                    </div>
                  ))}

                  <Separator />

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>R$ {subtotal.toFixed(2).replace('.', ',')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Entrega</span>
                      <span>
                        {shippingCost === 0 ? "Grátis" : `R$ ${shippingCost.toFixed(2).replace('.', ',')}`}
                      </span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-semibold text-lg">
                      <span>Total</span>
                      <span>R$ {total.toFixed(2).replace('.', ',')}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Checkbox 
                      id="terms" 
                      checked={acceptTerms}
                      onCheckedChange={(checked) => setAcceptTerms(checked as boolean)}
                    />
                    <label htmlFor="terms">
                      Aceito os <a href="/terms-of-use" className="text-primary underline">termos de uso</a>
                    </label>
                  </div>

                  <Button onClick={handleFinishOrder} className="w-full" disabled={loading}>
                    <Shield className="h-4 w-4 mr-2" />
                    {loading ? "Criando checkout..." : "Finalizar Compra"}
                  </Button>

                  <div className="text-center text-xs text-muted-foreground">
                    <p>Compra segura e protegida</p>
                    <p>SSL 256 bits</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        )}
      </div>
    </div>
  );
};

export default Checkout;
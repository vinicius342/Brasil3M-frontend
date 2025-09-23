import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { CreditCard, MapPin, Truck, Shield, Plus } from "lucide-react";

const Checkout = () => {
  const [step, setStep] = useState(1);
  const [selectedAddress, setSelectedAddress] = useState("1");
  const [selectedPayment, setSelectedPayment] = useState("credit");
  const [selectedShipping, setSelectedShipping] = useState("standard");

  const cartItems = [
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
  ];

  const addresses = [
    {
      id: "1",
      name: "Casa",
      street: "Rua das Flores, 123",
      neighborhood: "Centro",
      city: "São Paulo",
      state: "SP",
      zipCode: "01234-567"
    },
    {
      id: "2",
      name: "Trabalho",
      street: "Av. Paulista, 1000",
      neighborhood: "Bela Vista",
      city: "São Paulo",
      state: "SP",
      zipCode: "01310-100"
    }
  ];

  const shippingOptions = [
    {
      id: "standard",
      name: "Entrega Padrão",
      time: "5-7 dias úteis",
      price: 0,
      description: "Entrega gratuita"
    },
    {
      id: "express",
      name: "Entrega Expressa",
      time: "2-3 dias úteis",
      price: 15.90,
      description: "Entrega rápida"
    },
    {
      id: "same-day",
      name: "Entrega no Mesmo Dia",
      time: "Até 6 horas",
      price: 29.90,
      description: "Disponível em São Paulo"
    }
  ];

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shippingCost = shippingOptions.find(option => option.id === selectedShipping)?.price || 0;
  const total = subtotal + shippingCost;

  const handleFinishOrder = () => {
    console.log("Finalizando pedido...", {
      items: cartItems,
      address: selectedAddress,
      payment: selectedPayment,
      shipping: selectedShipping,
      total
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Finalizar Compra</h1>
          <p className="text-muted-foreground">Complete sua compra em poucos passos</p>
        </div>

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
                <RadioGroup value={selectedAddress} onValueChange={setSelectedAddress}>
                  {addresses.map((address) => (
                    <div key={address.id} className="flex items-start space-x-3 p-4 border rounded-lg">
                      <RadioGroupItem value={address.id} className="mt-1" />
                      <div className="flex-1">
                        <h4 className="font-semibold">{address.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {address.street}<br />
                          {address.neighborhood}, {address.city} - {address.state}<br />
                          CEP: {address.zipCode}
                        </p>
                      </div>
                    </div>
                  ))}
                </RadioGroup>
                <Button variant="outline" className="mt-4">
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Novo Endereço
                </Button>
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
                <RadioGroup value={selectedShipping} onValueChange={setSelectedShipping}>
                  {shippingOptions.map((option) => (
                    <div key={option.id} className="flex items-start space-x-3 p-4 border rounded-lg">
                      <RadioGroupItem value={option.id} className="mt-1" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold">{option.name}</h4>
                          <span className="font-semibold">
                            {option.price === 0 ? "Grátis" : `R$ ${option.price.toFixed(2).replace('.', ',')}`}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">{option.description}</p>
                        <p className="text-sm text-primary">{option.time}</p>
                      </div>
                    </div>
                  ))}
                </RadioGroup>
              </CardContent>
            </Card>

            {/* Payment Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <CreditCard className="h-5 w-5" />
                  <span>Forma de Pagamento</span>
                </CardTitle>
                <CardDescription>Escolha como você quer pagar</CardDescription>
              </CardHeader>
              <CardContent>
                <RadioGroup value={selectedPayment} onValueChange={setSelectedPayment}>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3 p-4 border rounded-lg">
                      <RadioGroupItem value="credit" className="mt-1" />
                      <div className="flex-1">
                        <h4 className="font-semibold">Cartão de Crédito</h4>
                        <p className="text-sm text-muted-foreground">Visa, Mastercard, Elo</p>
                        {selectedPayment === "credit" && (
                          <div className="mt-4 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor="cardNumber">Número do Cartão</Label>
                                <Input id="cardNumber" placeholder="1234 5678 9012 3456" />
                              </div>
                              <div>
                                <Label htmlFor="cardName">Nome no Cartão</Label>
                                <Input id="cardName" placeholder="João Silva" />
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor="expiry">Validade</Label>
                                <Input id="expiry" placeholder="MM/AA" />
                              </div>
                              <div>
                                <Label htmlFor="cvv">CVV</Label>
                                <Input id="cvv" placeholder="123" />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-start space-x-3 p-4 border rounded-lg">
                      <RadioGroupItem value="pix" className="mt-1" />
                      <div className="flex-1">
                        <h4 className="font-semibold">PIX</h4>
                        <p className="text-sm text-muted-foreground">Pagamento instantâneo</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3 p-4 border rounded-lg">
                      <RadioGroupItem value="boleto" className="mt-1" />
                      <div className="flex-1">
                        <h4 className="font-semibold">Boleto Bancário</h4>
                        <p className="text-sm text-muted-foreground">Vencimento em 3 dias úteis</p>
                      </div>
                    </div>
                  </div>
                </RadioGroup>
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
                    <Checkbox id="terms" />
                    <label htmlFor="terms">
                      Aceito os <a href="/terms" className="text-primary underline">termos de uso</a>
                    </label>
                  </div>

                  <Button onClick={handleFinishOrder} className="w-full">
                    <Shield className="h-4 w-4 mr-2" />
                    Finalizar Compra
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
      </div>
    </div>
  );
};

export default Checkout;
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Phone, Clock, Users, Headphones } from "lucide-react";
import Header from "@/components/Header";

const Support = () => {
  const handleWhatsAppContact = () => {
    // Substitua pelo número real do WhatsApp da empresa
    const phoneNumber = "5511999999999"; // Formato: código do país + DDD + número
    const message = encodeURIComponent("Olá! Preciso de suporte com minha conta no Brasil3M.");
    window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank');
  };

  const handleDiscordContact = () => {
    // Substitua pelo link do servidor Discord da empresa
    const discordInvite = "https://discord.gg/brasil3m"; // Link do convite Discord
    window.open(discordInvite, '_blank');
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Central de Suporte</h1>
          <p className="text-muted-foreground">
            Estamos aqui para ajudar! Entre em contato conosco através dos nossos canais de atendimento.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* WhatsApp Support */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <MessageCircle className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <CardTitle className="text-xl">WhatsApp</CardTitle>
                  <CardDescription>Atendimento rápido e direto</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Segunda a Sexta: 9h às 18h
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Resposta em até 30 minutos
                  </span>
                </div>
                <Badge variant="secondary" className="w-fit">
                  Mais Popular
                </Badge>
                <Button 
                  onClick={handleWhatsAppContact}
                  className="w-full bg-green-600 hover:bg-green-700"
                  size="lg"
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Conversar no WhatsApp
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Discord Support */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                  <Users className="h-6 w-6 text-indigo-600" />
                </div>
                <div>
                  <CardTitle className="text-xl">Discord</CardTitle>
                  <CardDescription>Comunidade e suporte 24/7</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Disponível 24/7
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">
                    Comunidade ativa de players
                  </span>
                </div>
                <Badge variant="outline" className="w-fit">
                  Comunidade
                </Badge>
                <Button 
                  onClick={handleDiscordContact}
                  className="w-full bg-indigo-600 hover:bg-indigo-700"
                  size="lg"
                >
                  <Users className="h-4 w-4 mr-2" />
                  Entrar no Discord
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* FAQ Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Headphones className="h-5 w-5" />
              <span>Perguntas Frequentes</span>
            </CardTitle>
            <CardDescription>
              Encontre respostas rápidas para as dúvidas mais comuns
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold mb-2">🛒 Como faço um pedido?</h3>
                <p className="text-muted-foreground text-sm">
                  Navegue pelas categorias, adicione itens ao carrinho e finalize sua compra. 
                  Você receberá os itens automaticamente no servidor DayZ.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">💳 Quais formas de pagamento vocês aceitam?</h3>
                <p className="text-muted-foreground text-sm">
                  Aceitamos PIX, cartão de crédito, débito e transferência bancária. 
                  Todos os pagamentos são processados de forma segura.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">⏰ Quanto tempo demora para receber os itens?</h3>
                <p className="text-muted-foreground text-sm">
                  Os itens são entregues automaticamente em até 15 minutos após a confirmação do pagamento, 
                  desde que você esteja online no servidor.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">🔄 Posso devolver um item?</h3>
                <p className="text-muted-foreground text-sm">
                  Devido à natureza digital dos produtos, não realizamos devoluções. 
                  Certifique-se de verificar todos os detalhes antes de finalizar sua compra.
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">🎮 Como me torno um vendedor?</h3>
                <p className="text-muted-foreground text-sm">
                  Entre em contato conosco através do WhatsApp ou Discord para solicitar 
                  uma conta de vendedor. Analisaremos seu perfil e histórico no servidor.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Emergency Contact */}
        <Card className="mt-6 border-orange-200 bg-orange-50">
          <CardContent className="p-6">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Phone className="h-4 w-4 text-orange-600" />
              </div>
              <div>
                <h3 className="font-semibold text-orange-900 mb-1">
                  Problema Urgente?
                </h3>
                <p className="text-sm text-orange-800 mb-3">
                  Para problemas críticos que afetam sua gameplay ou questões de segurança, 
                  entre em contato imediatamente via WhatsApp marcando como "URGENTE".
                </p>
                <Button 
                  onClick={handleWhatsAppContact}
                  variant="outline" 
                  size="sm"
                  className="border-orange-300 text-orange-700 hover:bg-orange-100"
                >
                  Contato Urgente
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Support;

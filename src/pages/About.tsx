import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Shield, Heart, Target } from "lucide-react";

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-foreground mb-4">Sobre Nós</h1>
            <p className="text-xl text-muted-foreground">
              Conectando vendedores e compradores em uma plataforma segura e confiável
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  Nossa Missão
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Democratizar o comércio eletrônico, oferecendo uma plataforma 
                  acessível e intuitiva para vendedores de todos os tamanhos 
                  alcançarem seus clientes.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-primary" />
                  Nossos Valores
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Transparência, segurança e inovação são os pilares que guiam 
                  nossa plataforma, sempre priorizando a satisfação e confiança 
                  de nossos usuários.
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="text-center">
              <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">+10.000</h3>
              <p className="text-muted-foreground">Usuários Ativos</p>
            </div>
            
            <div className="text-center">
              <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">100%</h3>
              <p className="text-muted-foreground">Transações Seguras</p>
            </div>
            
            <div className="text-center">
              <div className="bg-primary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Target className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">24/7</h3>
              <p className="text-muted-foreground">Suporte Disponível</p>
            </div>
          </div>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Nossa História</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Fundada em 2024, nossa plataforma nasceu da necessidade de criar 
                um marketplace verdadeiramente brasileiro, que entende as particularidades 
                do nosso mercado e oferece soluções personalizadas.
              </p>
              <p className="text-muted-foreground">
                Desde o início, nosso foco tem sido desenvolver ferramentas que 
                empoderem vendedores de todos os portes, desde pequenos empreendedores 
                até grandes marcas, oferecendo as mesmas oportunidades de crescimento.
              </p>
            </CardContent>
          </Card>

          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Junte-se à Nossa Comunidade</h2>
            <p className="text-muted-foreground mb-6">
              Seja você um vendedor em busca de novos clientes ou um comprador 
              procurando produtos únicos, nossa plataforma é o lugar certo para você.
            </p>
            <div className="flex gap-2 justify-center flex-wrap">
              <Badge variant="secondary">Vendedores Verificados</Badge>
              <Badge variant="secondary">Pagamento Seguro</Badge>
              <Badge variant="secondary">Entrega Rápida</Badge>
              <Badge variant="secondary">Suporte 24/7</Badge>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default About;
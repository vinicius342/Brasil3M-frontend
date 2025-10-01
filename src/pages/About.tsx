import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Zap, CheckCircle, Headphones, Gamepad2, Lock } from "lucide-react";

const About = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Cabeçalho principal */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-foreground mb-4 flex items-center justify-center gap-3">
              <Gamepad2 className="h-10 w-10 text-primary" />
              🛒 Loja Oficial BRASIL 3M
            </h1>
            <p className="text-xl text-muted-foreground">
              Bem-vindo à Loja Oficial do BRASIL 3M!
            </p>
          </div>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                🇧🇷 BRASIL 3M
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                O BRASIL 3M é um servidor de DayZ criado para liberar todo o potencial de modificação do jogo e proporcionar uma experiência única para cada player. Aqui, acreditamos que o DayZ pode ir muito além do básico, e por isso trabalhamos constantemente em inovação, personalização e equilíbrio para transformar cada experiência dentro do servidor em algo memorável.
              </p>
              
              <p className="text-muted-foreground leading-relaxed">
                Nosso foco atual é <strong>Sobrevivência e PVP</strong>, oferecendo uma jogabilidade intensa, desafiadora e dinâmica, onde cada encontro pode ser decisivo e cada escolha faz a diferença. Além disso, prezamos por uma comunidade sólida e ativa, onde o respeito e a diversão caminham juntos, garantindo um ambiente competitivo e ao mesmo tempo justo.
              </p>
              
              <p className="text-muted-foreground leading-relaxed">
                Atualmente, estamos no <strong>Xbox, no mapa Chernarus</strong>, entregando uma vivência totalmente envolvente dentro do universo de DayZ.
              </p>
              
              <p className="text-muted-foreground leading-relaxed">
                E a jornada não para por aí: em breve o BRASIL 3M também estará no <strong>PC e PlayStation</strong>, além de lançar um <strong>servidor exclusivo de RP (Roleplay)</strong>, expandindo horizontes e oferecendo novas formas de jogar e se divertir.
              </p>
              
              <p className="text-lg font-semibold text-primary leading-relaxed">
                Se você busca evolução, ação, adrenalina e novos desafios, o BRASIL 3M é o seu lugar. Venha com a gente e ajude a escrever essa história!
              </p>
            </CardContent>
          </Card>

          {/* Seção principal */}
          <Card className="mb-8">
            <CardContent className="p-8">
              <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                Aqui você encontra tudo o que precisa para elevar sua experiência dentro do nosso servidor de DayZ.
              </p>
              
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Nosso compromisso é oferecer <strong>segurança</strong>, <strong>transparência</strong> e <strong>confiança</strong> em cada compra. 
                Trabalhamos com um sistema confiável e ágil, garantindo que seus benefícios sejam entregues de forma rápida e sem complicações.
              </p>
              
              <p className="text-muted-foreground leading-relaxed">
                Na Loja BRASIL 3M, você tem a certeza de estar investindo em um servidor que cresce todos os dias, 
                trazendo inovações, eventos exclusivos e uma comunidade cada vez mais ativa. Cada contribuição é 
                fundamental para manter e melhorar o servidor, e em troca você recebe vantagens que tornam sua 
                jornada ainda mais intensa e divertida.
              </p>
            </CardContent>
          </Card>

          {/* Por que comprar conosco */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Zap className="h-6 w-6 text-primary" />
                ⚡ Por que comprar na Loja BRASIL 3M?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="flex items-start gap-3">
                  <Lock className="h-5 w-5 text-green-500 mt-1" />
                  <div>
                    <h4 className="font-semibold mb-1">Pagamento rápido, fácil e seguro</h4>
                    <p className="text-sm text-muted-foreground">🔒 Sistema de pagamento protegido e confiável</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-green-500 mt-1" />
                  <div>
                    <h4 className="font-semibold mb-1">Entrega garantida dentro do servidor</h4>
                    <p className="text-sm text-muted-foreground">✅ Seus benefícios entregues rapidamente</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Headphones className="h-5 w-5 text-green-500 mt-1" />
                  <div>
                    <h4 className="font-semibold mb-1">Suporte dedicado para tirar dúvidas</h4>
                    <p className="text-sm text-muted-foreground">🤝 Equipe sempre pronta para ajudar</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Gamepad2 className="h-5 w-5 text-green-500 mt-1" />
                  <div>
                    <h4 className="font-semibold mb-1">Benefícios exclusivos</h4>
                    <p className="text-sm text-muted-foreground">🎮 Vantagens que fazem a diferença na sua gameplay</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Call to action final */}
          <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl font-bold mb-4">Faça parte dessa evolução!</h2>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Fortaleça ainda mais o BRASIL 3M. Sua confiança é o que nos move a continuar 
                inovando e oferecendo a melhor experiência de DayZ no Brasil.
              </p>
              
              <div className="space-y-2">
                <p className="text-lg font-semibold text-primary">
                  Compre com segurança. Jogue com intensidade. Viva o BRASIL 3M!
                </p>
              </div>
              
              <div className="flex gap-2 justify-center flex-wrap mt-6">
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  <Shield className="h-3 w-3 mr-1" />
                  Pagamento Seguro
                </Badge>
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  <Zap className="h-3 w-3 mr-1" />
                  Entrega Rápida
                </Badge>
                <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                  <Gamepad2 className="h-3 w-3 mr-1" />
                  Servidor DayZ
                </Badge>
                <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                  <Headphones className="h-3 w-3 mr-1" />
                  Suporte 24/7
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default About;
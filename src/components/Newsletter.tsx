
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

const Newsletter = () => {
  return (
    <section className="py-12 md:py-20 bg-gradient-to-r from-ecommerce-navy to-ecommerce-navy-light bg-black">
      <div className="container mx-auto px-4">
        <Card className="max-w-4xl mx-auto border-0 bg-white/10 backdrop-blur-sm">
          <CardContent className="p-6 md:p-12 text-center">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
              Fique por Dentro das <span className="text-foreground">Novidades</span>
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-foreground/80 mb-6 md:mb-8 max-w-2xl mx-auto px-4 sm:px-0">
              Receba ofertas exclusivas, lançamentos e promoções especiais diretamente no seu email
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 max-w-md mx-auto">
              <Input 
                type="email" 
                placeholder="Seu melhor email"
                className="bg-white/20 border-white/30 text-white placeholder:text-foreground/60 flex-1"
              />
              <Button className="bg-primary hover:bg-primary/90 text-white px-6 md:px-8 w-full sm:w-auto">
                Inscrever-se
              </Button>
            </div>
            
            <p className="text-xs md:text-sm text-foreground/60 mt-4">
              Não enviamos spam. Cancele a qualquer momento.
            </p>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};

export default Newsletter;

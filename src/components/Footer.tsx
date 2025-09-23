
import { Store } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-ecommerce-navy text-white py-12 md:py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          <div className="space-y-4 sm:col-span-2 lg:col-span-1">
            <div className="flex items-center space-x-2">
              <Store className="h-6 w-6 md:h-8 md:w-8 text-foreground" />
              <span className="text-xl md:text-2xl font-bold">LojaOnline</span>
            </div>
            <p className="text-foreground/70 text-sm md:text-base">
              Sua loja online de confiança com os melhores produtos e preços do mercado.
            </p>
          </div>
          
          <div>
            <h3 className="text-base md:text-lg font-semibold mb-3 md:mb-4">Categorias</h3>
            <ul className="space-y-2 text-foreground/70 text-sm md:text-base">
              <li><a href="#" className="hover:text-white transition-colors">Eletrônicos</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Moda</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Casa & Jardim</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Esportes</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-base md:text-lg font-semibold mb-3 md:mb-4">Atendimento</h3>
            <ul className="space-y-2 text-foreground/70 text-sm md:text-base">
              <li><a href="#" className="hover:text-white transition-colors">Central de Ajuda</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Trocas e Devoluções</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Entrega</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Contato</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-base md:text-lg font-semibold mb-3 md:mb-4">Empresa</h3>
            <ul className="space-y-2 text-foreground/70 text-sm md:text-base">
              <li><a href="#" className="hover:text-white transition-colors">Sobre Nós</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Trabalhe Conosco</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Política de Privacidade</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Termos de Uso</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-white/20 mt-8 md:mt-12 pt-6 md:pt-8 text-center">
          <p className="text-foreground/60 text-sm md:text-base">
            © 2024 LojaOnline. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

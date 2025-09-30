
import { Store } from "lucide-react";
import brasilLogo2 from "@/assets/brasil-logo-2.png";
import {Link} from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-ecommerce-navy text-white py-12 md:py-16 bg-black">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
          <div className="space-y-4 sm:col-span-2 lg:col-span-1">
            <div className="flex items-center space-x-2">
              <img src={brasilLogo2} alt="Brasil 3M Logo" className="h-6 w-6 md:h-8 md:w-8" />
              <span className="text-xl md:text-2xl font-bold" style={{ color: '#DAA520' }}>Brasil 3M</span>
            </div>
            <p className="text-sm md:text-base">
              Seja lenda. Seja 3M.
            </p>
          </div>
          
          <div>
            <h3 className="text-base md:text-lg font-semibold mb-3 md:mb-4" style={{ color: '#DAA520' }}>Categorias</h3>
            <ul className="space-y-2 text-sm md:text-base text-white">
              <li><a href="#" className="hover:text-white transition-colors">Eletrônicos</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Moda</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Casa & Jardim</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Esportes</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-base md:text-lg font-semibold mb-3 md:mb-4" style={{ color: '#DAA520' }}>Atendimento</h3>
            <ul className="space-y-2 text-sm md:text-base">
              <li><a href="#" className="hover:text-white transition-colors">Central de Ajuda</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Trocas e Devoluções</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Entrega</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Contato</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-base md:text-lg font-semibold mb-3 md:mb-4" style={{ color: '#DAA520' }}>Empresa</h3>
            <ul className="space-y-2 text-sm md:text-base">
              <li>
                <Link to="/about">
                  <span className="hover:text-white transition-colors">Sobre Nós</span>
                </Link>
              </li>
              <li>
                <Link to="/privacy-policy">
                  <span className="hover:text-white transition-colors">Política de Privacidade</span>
                </Link>
              </li>
              <li>
                <Link to="/terms-of-use">
                  <span className="hover:text-white transition-colors">Termos de Uso</span>
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-white/20 mt-8 md:mt-12 pt-6 md:pt-8 text-center">
          <p className="text-sm md:text-base">
            © 2025 Brasil 3M. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

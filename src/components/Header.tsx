
import { Button } from "@/components/ui/button";
import { Store, Menu } from "lucide-react";
import { Link } from "react-router-dom";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import CartSidebar from "./CartSidebar";
import brasilLogo2 from "@/assets/brasil-logo-2.png";

const Header = () => {
  return (
    <header className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full border-b border-border/40">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <img src={brasilLogo2} alt="Brasil 3M Logo" className="h-9 w-9" />
          <span className="text-lg md:text-2xl font-bold text-gradient">Brasil 3M</span>
        </Link>
        
        <nav className="hidden md:flex items-center space-x-8">
          <a href="#home" className="text-foreground hover:text-primary transition-colors">Início</a>
          <a href="#categories" className="text-foreground hover:text-primary transition-colors">Categorias</a>
          <a href="#products" className="text-foreground hover:text-primary transition-colors">Produtos</a>
          <a href="#about" className="text-foreground hover:text-primary transition-colors">Sobre</a>
          <a href="#contact" className="text-foreground hover:text-primary transition-colors">Contato</a>
        </nav>
        
        {/* Mobile Menu */}
        <Sheet>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right">
            <nav className="flex flex-col space-y-6 mt-8">
              <a href="#home" className="text-foreground hover:text-primary transition-colors text-lg">Início</a>
              <a href="#categories" className="text-foreground hover:text-primary transition-colors text-lg">Categorias</a>
              <a href="#products" className="text-foreground hover:text-primary transition-colors text-lg">Produtos</a>
              <a href="#about" className="text-foreground hover:text-primary transition-colors text-lg">Sobre</a>
              <a href="#contact" className="text-foreground hover:text-primary transition-colors text-lg">Contato</a>
              <Link to="/login" className="text-foreground hover:text-primary transition-colors text-lg">Entrar</Link>
            </nav>
          </SheetContent>
        </Sheet>
        
        <div className="flex items-center space-x-2 md:space-x-4">
          <CartSidebar />
          <Button size="sm" className="hidden md:inline-flex" asChild>
            <Link to="/login">Entrar</Link>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;

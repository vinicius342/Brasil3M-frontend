import { Button } from "@/components/ui/button";
import { Store, Menu, User } from "lucide-react";
import { Link } from "react-router-dom";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import CartSidebar from "./CartSidebar";
import brasilLogo2 from "@/assets/brasil-logo-2.png";
import { useAuth } from "@/contexts/AuthContext";

const Header = () => {
  const { currentUser } = useAuth();

  return (
    <header className="bg-black sticky top-0 z-50 w-full border-b border-border/40">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-2">
          <img src={brasilLogo2} alt="Brasil 3M Logo" className="h-9 w-9" />
          <span className="text-lg md:text-2xl font-bold" style={{color: '#ddb91a'}}>Brasil 3M</span>
        </Link>
        <nav className="hidden md:flex items-center space-x-8">
          <Link to="/" className="text-white hover:text-white transition-colors relative after:absolute after:left-0 after:-bottom-1 after:w-full after:h-0.5 after:bg-yellow-400 after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:origin-left">
            Início
          </Link>
          <Link to="/categoria/categorias" className="text-white hover:text-white transition-colors relative after:absolute after:left-0 after:-bottom-1 after:w-full after:h-0.5 after:bg-yellow-400 after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:origin-left">
            Categorias
          </Link>
          <Link to="/" className="text-white hover:text-white transition-colors relative after:absolute after:left-0 after:-bottom-1 after:w-full after:h-0.5 after:bg-yellow-400 after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:origin-left">
            Produtos
          </Link>
          <Link to="/about" className="text-white hover:text-white transition-colors relative after:absolute after:left-0 after:-bottom-1 after:w-full after:h-0.5 after:bg-yellow-400 after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:origin-left">
            Sobre
          </Link>
        </nav>
        {/* Mobile Menu */}
        <Sheet>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5 text-white" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="bg-black">
            <nav className="flex flex-col space-y-6 mt-8">
              <Link to="/" className="text-white hover:text-white transition-colors relative after:absolute after:left-0 after:-bottom-1 after:w-full after:h-0.5 after:bg-yellow-400 after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:origin-left text-lg">Início</Link>
              <Link to="/categoria/categorias" className="text-white hover:text-white transition-colors relative after:absolute after:left-0 after:-bottom-1 after:w-full after:h-0.5 after:bg-yellow-400 after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:origin-left text-lg">Categorias</Link>
              <Link to="/" className="text-white hover:text-white transition-colors relative after:absolute after:left-0 after:-bottom-1 after:w-full after:h-0.5 after:bg-yellow-400 after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:origin-left text-lg">Produtos</Link>
              <Link to="/about" className="text-white hover:text-white transition-colors relative after:absolute after:left-0 after:-bottom-1 after:w-full after:h-0.5 after:bg-yellow-400 after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:origin-left text-lg">Sobre</Link>
              {!currentUser ? (
                <Link to="/login" className="text-white hover:text-white transition-colors text-lg">Entrar</Link>
              ) : (
                <Link to="/profile" className="text-white hover:text-white transition-colors text-lg">Perfil</Link>
              )}
            </nav>
          </SheetContent>
        </Sheet>
        <div className="flex items-center space-x-2 md:space-x-4 text-white">
          <CartSidebar />
          {!currentUser ? (
            <Button size="sm" className="hidden md:inline-flex bg-yellow-400 text-black hover:bg-yellow-500" asChild>
              <Link to="/login">Entrar</Link>
            </Button>
          ) : (
            <Button size="sm" className="hidden md:inline-flex" variant="ghost" asChild>
              <Link to="/profile">
                <User className="h-5 w-5 text-white" />
              </Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;

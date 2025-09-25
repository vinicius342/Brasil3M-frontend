import { Button } from "@/components/ui/button";
import { ShoppingBag } from "lucide-react";
import { useEffect, useState } from "react";
import brasilLogo from "@/assets/brasil-logo.jpg";

const HeroSection = () => {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <section id="home" className="min-h-[60vh] sm:min-h-[70vh] md:min-h-[100vh] flex items-center justify-center relative overflow-hidden">
      {/* Fundo preto fixo atrás do parallax */}
      <div className="absolute inset-0 w-full h-full bg-black z-0" />
      {/* Parallax Background */}
      <div
        className="absolute inset-0 z-10"
        style={{ transform: `translateY(${scrollY * 0.5}px)` }}
      >
        <img
          src={brasilLogo}
          alt="Brasil Logo"
          className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 object-contain"
        />
      </div>
      <div className="container px-4 mx-auto text-center relative z-20">
        <div className="max-w-4xl animate-fade-in" style={{ marginRight: 'auto' }}>
          <div className="min-h-[100vh] flex flex-col justify-end" style={{ paddingBottom: '15vh' }}>
            <h1 className="text-5xl font-bold text-white" style={{ textAlign: 'left' }}>Bem-vindo ao Brasil 3M</h1>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;

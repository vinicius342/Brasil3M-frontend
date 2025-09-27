import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart } from "lucide-react";
import { Link } from "react-router-dom";
import { getFirestore, collection, query, where, orderBy, limit, onSnapshot } from "firebase/firestore";

const fallbackImages = [
  "https://images.unsplash.com/photo-1721322800607-8c38375eef04?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1582562124811-c09040d0a901?w=400&h=400&fit=crop"
];

const FeaturedProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const db = getFirestore();

  useEffect(() => {
    const q = query(
      collection(db, "products"),
      where("status", "==", "active"),
      orderBy("salesCount", "desc"),
      limit(4)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name,
          price: data.price ? `R$ ${Number(data.price).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : "",
          originalPrice: data.originalPrice ? `R$ ${Number(data.originalPrice).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : "",
          image: data.images && data.images.length > 0 ? data.images[0] : fallbackImages[Math.floor(Math.random() * fallbackImages.length)],
          badge: data.badge || "Destaque",
          rating: data.rating || 4.5
        };
      });
      setProducts(list);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [db]);

  return (
    <section id="products" className="py-12 md:py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-primary mb-4">
            Produtos em <span className="text-gradient">Destaque</span>
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-primary/70 max-w-2xl mx-auto px-4 sm:px-0">
            Confira nossos produtos mais populares
          </p>
        </div>
        {loading ? (
          <div className="text-center py-12 text-primary/60">Carregando produtos...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-8">
            {products.map((product, index) => (
              <Link key={product.id} to={`/produto/${product.id}`}>
                <Card
                  className="group hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden border-0 gradient-card animate-scale-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <CardContent className="p-0">
                    <div className="relative overflow-hidden">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-48 sm:h-56 md:h-64 object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      <Badge className="absolute top-2 left-2 md:top-3 md:left-3 bg-primary text-white text-xs">
                        {product.badge}
                      </Badge>
                      <div className="absolute inset-0 bg-ecommerce-navy/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <Button className="bg-white text-primary hover:bg-secondary text-sm">
                          <ShoppingCart className="mr-2 h-4 w-4" />
                          Ver Produto
                        </Button>
                      </div>
                    </div>
                    <div className="p-4 md:p-6">
                      <h3 className="text-base md:text-lg font-semibold text-primary mb-2 line-clamp-2">{product.name}</h3>
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-lg md:text-xl font-bold text-primary">{product.price}</span>
                        {product.originalPrice && (
                          <span className="text-xs md:text-sm text-primary/50 line-through">{product.originalPrice}</span>
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          {/* <span className="text-yellow-500">★</span>
                          <span className="text-xs md:text-sm text-primary/70 ml-1">{product.rating}</span> */}
                        </div>
                        <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80 text-xs md:text-sm">
                          Ver Detalhes
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
        <div className="text-center mt-8 md:mt-12">
          <Link to="/produtos">
            <Button size="lg" variant="outline" className="border-primary text-primary hover:bg-primary hover:text-white w-full sm:w-auto">
              Ver Todos os Produtos
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;

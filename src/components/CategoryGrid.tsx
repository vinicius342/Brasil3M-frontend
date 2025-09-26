
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { getFirestore, collection, query, where, onSnapshot } from "firebase/firestore";

const fallbackImages = [
  "https://images.unsplash.com/photo-1721322800607-8c38375eef04?w=400&h=300&fit=crop",
  "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=400&h=300&fit=crop",
  "https://images.unsplash.com/photo-1582562124811-c09040d0a901?w=400&h=300&fit=crop"
];

const CategoryGrid = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const db = getFirestore();

  useEffect(() => {
    const q = query(collection(db, "categories"), where("status", "==", "active"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name,
          slug: data.slug || doc.id,
          image: data.image || fallbackImages[Math.floor(Math.random() * fallbackImages.length)],
          count: data.count ? `${data.count} produtos` : "? - produtos"
        };
      });
      setCategories(list);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [db]);

  return (
    <section id="categories" className="py-12 md:py-20 bg-ecommerce-cream/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-primary mb-4">
            Explore Nossas <span className="text-gradient">Categorias</span>
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-primary/70 max-w-2xl mx-auto px-4 sm:px-0">
            Encontre exatamente o que você procura em nossa seleção de produtos
          </p>
        </div>
        {loading ? (
          <div className="text-center py-12 text-primary/60">Carregando categorias...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
            {categories.map((category, index) => (
              <Link key={category.id} to={`/categoria/${category.slug}`}>
                <Card 
                  className="group hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden border-0 gradient-card animate-scale-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <CardContent className="p-0">
                    <div className="relative overflow-hidden">
                      <img 
                        src={category.image} 
                        alt={category.name}
                        className="w-full h-36 sm:h-40 md:h-48 object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-ecommerce-navy/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>
                    <div className="p-4 md:p-6">
                      <h3 className="text-lg md:text-xl font-semibold text-primary mb-2">{category.name}</h3>
                      <p className="text-sm md:text-base text-primary/60">{category.count}</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default CategoryGrid;

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, ArrowRight } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  icon?: string;
  productCount?: number;
}

interface Product {
  id: string;
  category: string;
}

const Categories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Categorias padrão caso não existam no Firestore
  const defaultCategories: Category[] = [
    {
      id: "eletronicos",
      name: "Eletrônicos",
      slug: "eletronicos",
      description: "Smartphones, notebooks, TVs e muito mais",
      image: "https://images.unsplash.com/photo-1721322800607-8c38375eef04?w=500&h=300&fit=crop",
      icon: "📱"
    },
    {
      id: "moda",
      name: "Moda",
      slug: "moda",
      description: "Roupas, calçados e acessórios para todos os estilos",
      image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&h=300&fit=crop",
      icon: "👕"
    },
    {
      id: "casa-jardim",
      name: "Casa & Jardim",
      slug: "casa-jardim",
      description: "Móveis, decoração e utensílios para o lar",
      image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500&h=300&fit=crop",
      icon: "🏠"
    },
    {
      id: "esportes",
      name: "Esportes",
      slug: "esportes",
      description: "Equipamentos esportivos e fitness",
      image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500&h=300&fit=crop",
      icon: "⚽"
    },
    {
      id: "beleza",
      name: "Beleza",
      slug: "beleza",
      description: "Cosméticos, perfumes e cuidados pessoais",
      image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=500&h=300&fit=crop",
      icon: "💄"
    },
    {
      id: "livros",
      name: "Livros",
      slug: "livros",
      description: "Literatura, educação e entretenimento",
      image: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=500&h=300&fit=crop",
      icon: "📚"
    },
    {
      id: "brinquedos",
      name: "Brinquedos",
      slug: "brinquedos",
      description: "Diversão para crianças de todas as idades",
      image: "https://images.unsplash.com/photo-1558877804-79b3ee023bf7?w=500&h=300&fit=crop",
      icon: "🧸"
    },
    {
      id: "automotivo",
      name: "Automotivo",
      slug: "automotivo",
      description: "Peças, acessórios e equipamentos para veículos",
      image: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=500&h=300&fit=crop",
      icon: "🚗"
    },
    {
      id: "ferramentas",
      name: "Ferramentas",
      slug: "ferramentas",
      description: "Ferramentas profissionais e para o lar",
      image: "https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=500&h=300&fit=crop",
      icon: "🔧"
    }
  ];

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log("🔄 Iniciando busca de categorias...");

      // Buscar categorias no Firestore
      const categoriesQuery = query(
        collection(db, "categories"),
        orderBy("name", "asc")
      );
      
      console.log("📋 Executando query de categorias...");
      const categoriesSnapshot = await getDocs(categoriesQuery);
      console.log(`📊 Total de categorias encontradas no Firestore: ${categoriesSnapshot.size}`);
      
      const firestoreCategories: Category[] = [];
      
      categoriesSnapshot.forEach((doc) => {
        const data = doc.data();
        console.log(`📁 Categoria encontrada: ID=${doc.id}, Nome=${data.name}, Dados=`, data);
        firestoreCategories.push({
          id: doc.id,
          ...data
        } as Category);
      });

      // Se não existirem categorias no Firestore, usar as padrão
      const categoriesToUse = firestoreCategories.length > 0 ? firestoreCategories : defaultCategories;
      console.log(`🎯 Usando ${categoriesToUse.length} categorias (${firestoreCategories.length > 0 ? 'Firestore' : 'padrão'})`);

      // Buscar contagem de produtos para cada categoria
      console.log("🔢 Iniciando contagem de produtos por categoria...");
      const categoriesWithCount = await Promise.all(
        categoriesToUse.map(async (category, index) => {
          console.log(`📦 [${index + 1}/${categoriesToUse.length}] Processando categoria: ID="${category.id}", Nome="${category.name}"`);
          
          // Verificar se tem ID válido
          if (!category.id) {
            console.log(`❌ Categoria ${category.name} não tem ID - pulando`);
            return { ...category, productCount: 0 };
          }

          // Verificar o tamanho do ID
          console.log(`🔍 ID da categoria: "${category.id}" (${category.id.length} caracteres)`);
          
          // Só faz a contagem se o id for um id do Firestore (20 caracteres)
          if (category.id.length === 20) {
            try {
              console.log(`🔎 Buscando produtos onde categoryId == "${category.id}"`);
              const productsQuery = query(
                collection(db, "products"),
                where("categoryId", "==", category.id)
              );
              const productsSnapshot = await getDocs(productsQuery);
              console.log(`✅ Categoria "${category.name}": ${productsSnapshot.size} produtos encontrados`);
              
              // Log dos produtos encontrados
              productsSnapshot.forEach((doc) => {
                const product = doc.data();
                console.log(`  📄 Produto: ${product.name} (categoryId: ${product.categoryId})`);
              });
              
              return {
                ...category,
                productCount: productsSnapshot.size
              };
            } catch (err) {
              console.error(`❌ Erro ao contar produtos da categoria ${category.id}:`, err);
              return {
                ...category,
                productCount: 0
              };
            }
          } else {
            console.log(`⏭️ Categoria "${category.name}" (ID: ${category.id}) não é do Firestore (${category.id.length} chars) - pulando contagem`);
            // Para categorias default, não faz contagem
            return {
              ...category,
              productCount: 0
            };
          }
        })
      );

      console.log("📊 Resultado final das categorias com contagem:", categoriesWithCount);

      setCategories(categoriesWithCount);
      console.log("✅ Categorias carregadas e definidas no estado:", categoriesWithCount);

    } catch (err) {
      console.error("❌ Erro geral ao buscar categorias:", err);
      setError("Erro ao carregar categorias. Tente novamente.");
    } finally {
      setLoading(false);
      console.log("🏁 Processo de carregamento de categorias finalizado");
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Carregando categorias...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <p className="text-red-500 mb-4">{error}</p>
            <button 
              onClick={fetchCategories}
              className="text-primary hover:underline"
            >
              Tentar novamente
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-8">
          <Link to="/" className="hover:text-primary">Home</Link>
          <span>/</span>
          <span className="text-foreground">Categorias</span>
        </nav>

        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Explore Nossas Categorias
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Descubra milhares de produtos organizados por categoria. 
            Encontre exatamente o que você precisa de forma rápida e fácil.
          </p>
        </div>

        {/* Categories Grid */}
        {categories.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Nenhuma categoria disponível no momento.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {categories.map((category) => (
              <Link key={category.id} to={`/categoria/${category.id}`}>
                <Card className="group hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden h-full">
                  <CardContent className="p-0">
                    {/* Category Image */}
                    <div className="relative h-48 overflow-hidden">
                      <img 
                        src={category.image || "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=500&h=300&fit=crop"} 
                        alt={category.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      
                      {/* Icon */}
                      {category.icon && (
                        <div className="absolute top-4 left-4 text-4xl">
                          {category.icon}
                        </div>
                      )}
                      
                      {/* Product Count Badge */}
                      {typeof category.productCount === 'number' && (
                        <Badge 
                          variant="secondary" 
                          className="absolute top-4 right-4 bg-white/90 text-black"
                        >
                          {category.productCount} produto{category.productCount !== 1 ? 's' : ''}
                        </Badge>
                      )}
                      
                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <div className="bg-white rounded-full p-3 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                          <ArrowRight className="h-6 w-6 text-primary" />
                        </div>
                      </div>
                    </div>
                    
                    {/* Category Info */}
                    <div className="p-6">
                      <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                        {category.name}
                      </h3>
                      {category.description && (
                        <p className="text-muted-foreground text-sm leading-relaxed">
                          {category.description}
                        </p>
                      )}
                      
                      {/* Action Link */}
                      <div className="flex items-center justify-between mt-4">
                        <span className="text-sm text-primary font-medium group-hover:underline">
                          Ver produtos
                        </span>
                        <ArrowRight className="h-4 w-4 text-primary transform translate-x-0 group-hover:translate-x-1 transition-transform duration-300" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}

        {/* Call to Action */}
        <div className="mt-16 text-center">
          <div className="bg-muted/50 rounded-lg p-8">
            <h2 className="text-2xl font-semibold mb-4">Não encontrou o que procura?</h2>
            <p className="text-muted-foreground mb-6">
              Explore todos os nossos produtos ou use nossa busca avançada para encontrar exatamente o que você precisa.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                to="/produtos" 
                className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                Ver Todos os Produtos
              </Link>
              <Link 
                to="/produtos?q=" 
                className="inline-flex items-center justify-center rounded-md border border-input bg-background px-6 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                Buscar Produtos
              </Link>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Categories;

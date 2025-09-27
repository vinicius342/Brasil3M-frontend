import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { ShoppingCart, Filter, Grid3X3, List, Star, Loader2 } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { db } from "@/lib/firebase";
import { collection, query, where, orderBy, getDocs, limit, startAfter, DocumentData, QueryDocumentSnapshot } from "firebase/firestore";

interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  images: string[];
  badge?: string;
  rating: number;
  brand: string;
  category: string;
  description: string;
  stock: number;
  createdAt: any;
  salesCount: number;
}

const categoryTitles = {
  "eletronicos": "Eletrônicos",
  "moda": "Moda",
  "casa-jardim": "Casa & Jardim",
  "esportes": "Esportes",
  "beleza": "Beleza",
  "livros": "Livros"
};

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryFilter = searchParams.get("categoria") || "";
  const searchQuery = searchParams.get("q") || "";
  
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState("relevance");
  const [priceRange, setPriceRange] = useState([0, 5000]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    categoryFilter ? [categoryFilter] : []
  );
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [hasNextPage, setHasNextPage] = useState(false);

  const productsPerPage = 12;

  const fetchProducts = async (pageNum: number = 1) => {
    try {
      setLoading(true);
      setError(null);

      let q = query(
        collection(db, "products"),
        limit(productsPerPage)
      );

      // Filtro por categoria se especificado
      if (selectedCategories.length > 0) {
        q = query(q, where("category", "in", selectedCategories));
      }

      // Adicionar ordenação baseada no sortBy
      switch (sortBy) {
        case "price-asc":
          q = query(q, orderBy("price", "asc"));
          break;
        case "price-desc":
          q = query(q, orderBy("price", "desc"));
          break;
        case "rating":
          q = query(q, orderBy("rating", "desc"));
          break;
        case "newest":
          q = query(q, orderBy("createdAt", "desc"));
          break;
        default: // relevance
          q = query(q, orderBy("salesCount", "desc"));
      }

      // Paginação
      if (pageNum > 1 && lastDoc) {
        q = query(q, startAfter(lastDoc));
      }

      const querySnapshot = await getDocs(q);
      const fetchedProducts: Product[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        fetchedProducts.push({
          id: doc.id,
          ...data
        } as Product);
      });

      if (pageNum === 1) {
        setProducts(fetchedProducts);
      } else {
        setProducts(prev => [...prev, ...fetchedProducts]);
        setCurrentPage(pageNum);
      }

      // Verificar se há próxima página
      setHasNextPage(querySnapshot.docs.length === productsPerPage);
      if (querySnapshot.docs.length > 0) {
        setLastDoc(querySnapshot.docs[querySnapshot.docs.length - 1]);
      }

    } catch (err) {
      console.error("Erro ao buscar produtos:", err);
      setError("Erro ao carregar produtos. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
    setLastDoc(null);
    fetchProducts(1);
  }, [sortBy, selectedCategories]);

  const brands = [...new Set(products.map(p => p.brand))];
  const categories = [...new Set(products.map(p => p.category))];

  const toggleBrand = (brand: string) => {
    setSelectedBrands(prev => 
      prev.includes(brand) 
        ? prev.filter(b => b !== brand)
        : [...prev, brand]
    );
  };

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev => {
      const newCategories = prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category];
      
      // Atualizar URL params
      const newSearchParams = new URLSearchParams(searchParams);
      if (newCategories.length > 0) {
        newSearchParams.set("categoria", newCategories.join(","));
      } else {
        newSearchParams.delete("categoria");
      }
      setSearchParams(newSearchParams);
      
      return newCategories;
    });
  };

  const filteredProducts = products.filter(product => {
    const inPriceRange = product.price >= priceRange[0] && product.price <= priceRange[1];
    const inSelectedBrands = selectedBrands.length === 0 || selectedBrands.includes(product.brand);
    
    // Filtro de busca por nome
    const matchesSearch = !searchQuery || 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.brand.toLowerCase().includes(searchQuery.toLowerCase());
    
    return inPriceRange && inSelectedBrands && matchesSearch;
  });

  const getPageTitle = () => {
    if (searchQuery) return `Busca: "${searchQuery}"`;
    if (selectedCategories.length === 1) {
      return categoryTitles[selectedCategories[0] as keyof typeof categoryTitles] || "Produtos";
    }
    if (selectedCategories.length > 1) {
      return "Múltiplas Categorias";
    }
    return "Todos os Produtos";
  };

  const clearAllFilters = () => {
    setPriceRange([0, 5000]);
    setSelectedBrands([]);
    setSelectedCategories([]);
    const newSearchParams = new URLSearchParams();
    if (searchQuery) newSearchParams.set("q", searchQuery);
    setSearchParams(newSearchParams);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-8">
          <Link to="/" className="hover:text-primary">Home</Link>
          <span>/</span>
          <span className="text-foreground">Produtos</span>
          {searchQuery && (
            <>
              <span>/</span>
              <span className="text-foreground">Busca</span>
            </>
          )}
        </nav>

        {/* Page Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">{getPageTitle()}</h1>
            <p className="text-muted-foreground">{filteredProducts.length} produtos encontrados</p>
            {searchQuery && (
              <p className="text-sm text-muted-foreground mt-1">
                Mostrando resultados para: <span className="font-medium">"{searchQuery}"</span>
              </p>
            )}
          </div>
          
          <div className="flex items-center gap-4 mt-4 md:mt-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="md:hidden"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filtros
            </Button>
            
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("grid")}
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("list")}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
            
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Ordenar por" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="relevance">Relevância</SelectItem>
                <SelectItem value="price-asc">Menor preço</SelectItem>
                <SelectItem value="price-desc">Maior preço</SelectItem>
                <SelectItem value="rating">Melhor avaliação</SelectItem>
                <SelectItem value="newest">Mais recente</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className={`lg:w-64 space-y-6 ${showFilters ? 'block' : 'hidden'} lg:block`}>
            {/* Categories Filter */}
            {categories.length > 0 && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-4">Categorias</h3>
                  <div className="space-y-3">
                    {categories.map(category => (
                      <div key={category} className="flex items-center space-x-2">
                        <Checkbox
                          id={category}
                          checked={selectedCategories.includes(category)}
                          onCheckedChange={() => toggleCategory(category)}
                        />
                        <label htmlFor={category} className="text-sm cursor-pointer">
                          {categoryTitles[category as keyof typeof categoryTitles] || category}
                        </label>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Price Range Filter */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">Faixa de Preço</h3>
                <div className="space-y-4">
                  <Slider
                    value={priceRange}
                    onValueChange={setPriceRange}
                    max={5000}
                    step={50}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>R$ {priceRange[0]}</span>
                    <span>R$ {priceRange[1]}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Brands Filter */}
            {brands.length > 0 && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-4">Marcas</h3>
                  <div className="space-y-3">
                    {brands.map(brand => (
                      <div key={brand} className="flex items-center space-x-2">
                        <Checkbox
                          id={brand}
                          checked={selectedBrands.includes(brand)}
                          onCheckedChange={() => toggleBrand(brand)}
                        />
                        <label htmlFor={brand} className="text-sm cursor-pointer">
                          {brand}
                        </label>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Clear Filters */}
            {(selectedCategories.length > 0 || selectedBrands.length > 0 || priceRange[0] > 0 || priceRange[1] < 5000) && (
              <Button variant="outline" onClick={clearAllFilters} className="w-full">
                Limpar Todos os Filtros
              </Button>
            )}
          </div>

          {/* Products Grid */}
          <div className="flex-1">
            {loading && currentPage === 1 ? (
              <div className="text-center py-12">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                <p className="text-muted-foreground">Carregando produtos...</p>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-red-500 mb-4">{error}</p>
                <Button onClick={() => fetchProducts(1)}>
                  Tentar novamente
                </Button>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">
                  {products.length === 0 
                    ? "Nenhum produto encontrado." 
                    : searchQuery 
                      ? `Nenhum produto encontrado para "${searchQuery}" com os filtros aplicados.`
                      : "Nenhum produto encontrado com os filtros aplicados."
                  }
                </p>
                {(products.length > 0 || searchQuery) && (
                  <Button onClick={clearAllFilters}>
                    Limpar Filtros
                  </Button>
                )}
              </div>
            ) : (
              <>
                <div className={viewMode === "grid" 
                  ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
                  : "space-y-4"
                }>
                  {filteredProducts.map((product) => (
                    <Link key={product.id} to={`/produto/${product.id}`}>
                      <Card className={`group hover:shadow-lg transition-all duration-300 cursor-pointer ${
                        viewMode === "list" ? "flex" : ""
                      }`}>
                        <CardContent className={`p-0 ${viewMode === "list" ? "flex w-full" : ""}`}>
                          <div className={`relative overflow-hidden ${
                            viewMode === "list" ? "w-48 h-32" : "w-full h-64"
                          }`}>
                            <img 
                              src={product.images[0] || "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=400&fit=crop"} 
                              alt={product.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            {product.badge && (
                              <Badge className="absolute top-2 left-2">{product.badge}</Badge>
                            )}
                            <Badge 
                              variant="secondary" 
                              className="absolute top-2 right-2 text-xs"
                            >
                              {categoryTitles[product.category as keyof typeof categoryTitles] || product.category}
                            </Badge>
                            {viewMode === "grid" && (
                              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                <Button className="bg-white text-black hover:bg-gray-100">
                                  <ShoppingCart className="mr-2 h-4 w-4" />
                                  Ver Produto
                                </Button>
                              </div>
                            )}
                          </div>
                          <div className={`p-4 ${viewMode === "list" ? "flex-1 flex flex-col justify-between" : ""}`}>
                            <div>
                              <h3 className="font-semibold mb-2">{product.name}</h3>
                              <p className="text-sm text-muted-foreground mb-2">{product.brand}</p>
                              <div className="flex items-center gap-1 mb-2">
                                {[...Array(5)].map((_, i) => (
                                  <Star key={i} className={`w-3 h-3 ${
                                    i < Math.floor(product.rating) 
                                      ? 'fill-yellow-400 text-yellow-400' 
                                      : 'text-gray-300'
                                  }`} />
                                ))}
                                <span className="text-xs text-muted-foreground ml-1">({product.rating})</span>
                              </div>
                              {viewMode === "list" && (
                                <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                                  {product.description}
                                </p>
                              )}
                            </div>
                            <div className="flex items-center justify-between">
                              <div>
                                <span className="font-bold text-primary">
                                  R$ {product.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                </span>
                                {product.originalPrice && (
                                  <span className="text-sm text-muted-foreground line-through ml-2">
                                    R$ {product.originalPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                  </span>
                                )}
                              </div>
                              {viewMode === "list" && (
                                <Button size="sm">
                                  <ShoppingCart className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>

                {/* Load More Button */}
                {hasNextPage && !loading && (
                  <div className="mt-12 text-center">
                    <Button 
                      onClick={() => fetchProducts(currentPage + 1)}
                      variant="outline"
                      size="lg"
                    >
                      Carregar mais produtos
                    </Button>
                  </div>
                )}

                {/* Loading indicator for pagination */}
                {loading && currentPage > 1 && (
                  <div className="mt-12 text-center">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                    <p className="text-sm text-muted-foreground mt-2">Carregando mais produtos...</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Products;

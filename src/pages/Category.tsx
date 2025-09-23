
import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { ShoppingCart, Filter, Grid3X3, List, Star } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";

const categoryProducts = {
  "eletronicos": [
    {
      id: 1,
      name: "Smartphone Premium",
      price: "R$ 2.499,99",
      originalPrice: "R$ 2.999,99",
      image: "https://images.unsplash.com/photo-1721322800607-8c38375eef04?w=400&h=400&fit=crop",
      badge: "Oferta",
      rating: 4.8,
      brand: "TechPro"
    },
    {
      id: 5,
      name: "Notebook Gaming",
      price: "R$ 4.299,99",
      originalPrice: "R$ 4.999,99",
      image: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=400&h=400&fit=crop",
      badge: "Gamer",
      rating: 4.9,
      brand: "GameMax"
    },
    {
      id: 6,
      name: "Fones Bluetooth Pro",
      price: "R$ 899,99",
      originalPrice: "R$ 1.199,99",
      image: "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=400&h=400&fit=crop",
      badge: "Bestseller",
      rating: 4.7,
      brand: "AudioTech"
    },
    {
      id: 7,
      name: "Smart TV 65\"",
      price: "R$ 3.299,99",
      originalPrice: "",
      image: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=400&h=400&fit=crop",
      badge: "Novo",
      rating: 4.6,
      brand: "ViewMax"
    }
  ],
  "moda": [
    {
      id: 8,
      name: "Camiseta Premium",
      price: "R$ 89,99",
      originalPrice: "R$ 119,99",
      image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop",
      badge: "Oferta",
      rating: 4.5,
      brand: "StylePro"
    },
    {
      id: 9,
      name: "Calça Jeans",
      price: "R$ 159,99",
      originalPrice: "",
      image: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=400&fit=crop",
      badge: "Novo",
      rating: 4.3,
      brand: "DenimStyle"
    }
  ]
};

const categoryTitles = {
  "eletronicos": "Eletrônicos",
  "moda": "Moda",
  "casa-jardim": "Casa & Jardim",
  "esportes": "Esportes",
  "beleza": "Beleza",
  "livros": "Livros"
};

const Category = () => {
  const { slug } = useParams();
  const categorySlug = slug || "eletronicos";
  const categoryTitle = categoryTitles[categorySlug as keyof typeof categoryTitles] || "Categoria";
  const products = categoryProducts[categorySlug as keyof typeof categoryProducts] || [];
  
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState("relevance");
  const [priceRange, setPriceRange] = useState([0, 5000]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  const brands = [...new Set(products.map(p => p.brand))];

  const toggleBrand = (brand: string) => {
    setSelectedBrands(prev => 
      prev.includes(brand) 
        ? prev.filter(b => b !== brand)
        : [...prev, brand]
    );
  };

  const filteredProducts = products.filter(product => {
    const price = parseFloat(product.price.replace('R$ ', '').replace('.', '').replace(',', '.'));
    const inPriceRange = price >= priceRange[0] && price <= priceRange[1];
    const inSelectedBrands = selectedBrands.length === 0 || selectedBrands.includes(product.brand);
    return inPriceRange && inSelectedBrands;
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-8">
          <Link to="/" className="hover:text-primary">Home</Link>
          <span>/</span>
          <span className="text-foreground">{categoryTitle}</span>
        </nav>

        {/* Page Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">{categoryTitle}</h1>
            <p className="text-muted-foreground">{filteredProducts.length} produtos encontrados</p>
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
          </div>

          {/* Products Grid */}
          <div className="flex-1">
            {filteredProducts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">Nenhum produto encontrado com os filtros aplicados.</p>
                <Button onClick={() => {
                  setPriceRange([0, 5000]);
                  setSelectedBrands([]);
                }}>
                  Limpar Filtros
                </Button>
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
                              src={product.image} 
                              alt={product.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <Badge className="absolute top-2 left-2">{product.badge}</Badge>
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
                            </div>
                            <div className="flex items-center justify-between">
                              <div>
                                <span className="font-bold text-primary">{product.price}</span>
                                {product.originalPrice && (
                                  <span className="text-sm text-muted-foreground line-through ml-2">
                                    {product.originalPrice}
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

                {/* Pagination */}
                <div className="mt-12">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious href="#" />
                      </PaginationItem>
                      <PaginationItem>
                        <PaginationLink href="#" isActive>1</PaginationLink>
                      </PaginationItem>
                      <PaginationItem>
                        <PaginationLink href="#">2</PaginationLink>
                      </PaginationItem>
                      <PaginationItem>
                        <PaginationLink href="#">3</PaginationLink>
                      </PaginationItem>
                      <PaginationItem>
                        <PaginationNext href="#" />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Category;

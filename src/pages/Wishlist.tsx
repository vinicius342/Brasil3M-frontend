import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Heart, ShoppingCart, Search, Trash2, Star } from "lucide-react";
import Header from "@/components/Header";

const Wishlist = () => {
  const [searchTerm, setSearchTerm] = useState("");
  
  const [wishlistItems, setWishlistItems] = useState([
    {
      id: 1,
      name: "Smartphone Galaxy S21",
      price: 299.90,
      originalPrice: 399.90,
      image: "/placeholder.svg",
      category: "Eletrônicos",
      rating: 4.5,
      reviews: 128,
      inStock: true,
      discount: 25,
      addedDate: "2024-01-10"
    },
    {
      id: 2,
      name: "Notebook Gamer Intel Core i7",
      price: 2999.90,
      originalPrice: 3499.90,
      image: "/placeholder.svg",
      category: "Informática",
      rating: 4.8,
      reviews: 89,
      inStock: true,
      discount: 15,
      addedDate: "2024-01-05"
    },
    {
      id: 3,
      name: "Tênis Esportivo Nike",
      price: 189.90,
      originalPrice: 249.90,
      image: "/placeholder.svg",
      category: "Esportes",
      rating: 4.2,
      reviews: 203,
      inStock: false,
      discount: 24,
      addedDate: "2023-12-28"
    },
    {
      id: 4,
      name: "Fone de Ouvido Bluetooth",
      price: 149.50,
      originalPrice: 199.90,
      image: "/placeholder.svg",
      category: "Eletrônicos",
      rating: 4.6,
      reviews: 156,
      inStock: true,
      discount: 25,
      addedDate: "2024-01-12"
    },
    {
      id: 5,
      name: "Smart TV 55 4K",
      price: 1899.90,
      originalPrice: 2299.90,
      image: "/placeholder.svg",
      category: "Eletrônicos",
      rating: 4.7,
      reviews: 94,
      inStock: true,
      discount: 17,
      addedDate: "2023-12-20"
    }
  ]);

  const removeFromWishlist = (id: number) => {
    setWishlistItems(items => items.filter(item => item.id !== id));
  };

  const filteredItems = wishlistItems.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalValue = wishlistItems.reduce((sum, item) => sum + item.price, 0);
  const totalSavings = wishlistItems.reduce((sum, item) => sum + (item.originalPrice - item.price), 0);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Lista de Desejos</h1>
              <p className="text-muted-foreground">
                {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'itens'} salvos
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Valor total</p>
              <p className="text-2xl font-bold text-primary">
                R$ {totalValue.toFixed(2).replace('.', ',')}
              </p>
              {totalSavings > 0 && (
                <p className="text-sm text-green-600">
                  Economia: R$ {totalSavings.toFixed(2).replace('.', ',')}
                </p>
              )}
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Buscar na lista de desejos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {filteredItems.length === 0 ? (
          <div className="text-center py-16">
            <Heart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">
              {searchTerm ? "Nenhum item encontrado" : "Sua lista de desejos está vazia"}
            </h3>
            <p className="text-muted-foreground mb-6">
              {searchTerm 
                ? "Tente usar outros termos de busca" 
                : "Adicione produtos que você gostaria de comprar futuramente"
              }
            </p>
            <Button asChild>
              <Link to="/">Explorar Produtos</Link>
            </Button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => (
              <Card key={item.id} className="group hover:shadow-lg transition-shadow">
                <CardContent className="p-0">
                  <div className="relative">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-48 object-cover rounded-t-lg"
                    />
                    {item.discount > 0 && (
                      <Badge className="absolute top-2 left-2">
                        -{item.discount}%
                      </Badge>
                    )}
                    {!item.inStock && (
                      <Badge variant="destructive" className="absolute top-2 right-2">
                        Esgotado
                      </Badge>
                    )}
                    <Button
                      variant="outline"
                      size="icon"
                      className="absolute top-2 right-2 bg-white/90 hover:bg-white"
                      onClick={() => removeFromWishlist(item.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>

                  <div className="p-4">
                    <div className="mb-2">
                      <Badge variant="outline" className="text-xs">
                        {item.category}
                      </Badge>
                    </div>

                    <h3 className="font-semibold text-foreground mb-2 line-clamp-2">
                      {item.name}
                    </h3>

                    <div className="flex items-center space-x-1 mb-3">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < Math.floor(item.rating)
                                ? "text-yellow-400 fill-current"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-muted-foreground">
                        ({item.reviews})
                      </span>
                    </div>

                    <div className="mb-4">
                      <div className="flex items-center space-x-2">
                        <span className="text-xl font-bold text-primary">
                          R$ {item.price.toFixed(2).replace('.', ',')}
                        </span>
                        {item.originalPrice > item.price && (
                          <span className="text-sm text-muted-foreground line-through">
                            R$ {item.originalPrice.toFixed(2).replace('.', ',')}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Button 
                        className="w-full" 
                        disabled={!item.inStock}
                        asChild={item.inStock}
                      >
                        {item.inStock ? (
                          <Link to={`/produto/${item.id}`}>
                            <ShoppingCart className="h-4 w-4 mr-2" />
                            Comprar Agora
                          </Link>
                        ) : (
                          <>
                            <ShoppingCart className="h-4 w-4 mr-2" />
                            Produto Esgotado
                          </>
                        )}
                      </Button>

                      <Button variant="outline" className="w-full" asChild>
                        <Link to={`/produto/${item.id}`}>
                          Ver Detalhes
                        </Link>
                      </Button>
                    </div>

                    <p className="text-xs text-muted-foreground mt-2">
                      Adicionado em {item.addedDate}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;
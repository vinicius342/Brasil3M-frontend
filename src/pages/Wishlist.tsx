import { useState } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Heart, ShoppingCart, Search, Trash2, Star } from "lucide-react";
import Header from "@/components/Header";
import { useWishlist } from "@/contexts/WishlistContext";
import { useCart } from "@/contexts/CartContext";

const Wishlist = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const { wishlistItems, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();

  const handleAddToCart = (item: any) => {
    addToCart({
      id: item.productId,
      name: item.name,
      price: item.price,
      image: item.image,
      stock: 999 // Assumir que tem estoque, seria melhor buscar do produto real
    }, 1);
  };

  const filteredItems = wishlistItems.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalValue = wishlistItems.reduce((sum, item) => sum + item.price, 0);

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
                    <Button
                      variant="outline"
                      size="icon"
                      className="absolute top-2 right-2 bg-white/90 hover:bg-white"
                      onClick={() => removeFromWishlist(item.productId)}
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>

                  <div className="p-4">
                    <h3 className="font-semibold text-foreground mb-2 line-clamp-2">
                      {item.name}
                    </h3>

                    <div className="mb-4">
                      <div className="flex items-center space-x-2">
                        <span className="text-xl font-bold text-primary">
                          R$ {item.price.toFixed(2).replace('.', ',')}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Button 
                        className="w-full"
                        onClick={() => handleAddToCart(item)}
                      >
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        Adicionar ao Carrinho
                      </Button>

                      <Button variant="outline" className="w-full" asChild>
                        <Link to={`/produto/${item.productId}`}>
                          Ver Detalhes
                        </Link>
                      </Button>
                    </div>

                    <p className="text-xs text-muted-foreground mt-2">
                      Adicionado em {item.dateAdded.toLocaleDateString('pt-BR')}
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
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { ShoppingCart, Heart, Star, Truck, Shield, RotateCcw, Calculator, MapPin, AlertCircle } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getFirestore, doc, getDoc, collection, query, where, orderBy, limit, getDocs } from "firebase/firestore";
import { useCart } from "@/contexts/CartContext";
import { useWishlist } from "@/contexts/WishlistContext";
import { calculateShipping, searchCEP, ShippingQuote } from "@/services/shippingService";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";

const fallbackImages = [
  "https://images.unsplash.com/photo-1721322800607-8c38375eef04?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=400&h=400&fit=crop",
  "https://images.unsplash.com/photo-1582562124811-c09040d0a901?w=400&h=400&fit=crop"
];

const ProductDetail = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [cep, setCep] = useState("");
  const [shippingQuotes, setShippingQuotes] = useState<ShippingQuote[]>([]);
  const [loadingShipping, setLoadingShipping] = useState(false);
  const [cepError, setCepError] = useState("");
  const [validatingProduct, setValidatingProduct] = useState(false);
  const db = getFirestore();
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { toast } = useToast();

  // Função para validar produto em tempo real
  const validateProduct = async () => {
    if (!id) return null;
    
    try {
      const productRef = doc(db, "products", id);
      const productSnap = await getDoc(productRef);
      
      if (!productSnap.exists()) {
        return { valid: false, error: "Produto não encontrado" };
      }
      
      const productData = productSnap.data();
      
      // Validar status
      if (productData.status !== 'active') {
        return { valid: false, error: "Este produto não está mais disponível para venda" };
      }
      
      // Validar estoque
      if (productData.stock === 0) {
        return { valid: false, error: "Produto fora de estoque" };
      }
      
      return { 
        valid: true, 
        stock: productData.stock,
        minQuantity: productData.minQuantity,
        maxQuantity: productData.maxQuantity,
        status: productData.status
      };
    } catch (error) {
      console.error("Erro ao validar produto:", error);
      return { valid: false, error: "Erro ao validar produto" };
    }
  };

  const handleAddToCart = async () => {
    if (!product) return;
    
    setValidatingProduct(true);
    
    try {
      // Validar produto em tempo real
      const validation = await validateProduct();
      
      if (!validation || !validation.valid) {
        toast({
          variant: "destructive",
          title: "Não foi possível adicionar ao carrinho",
          description: validation?.error || "Produto indisponível"
        });
        return;
      }
      
      // Validar quantidade em relação ao estoque atual
      if (quantity > validation.stock) {
        toast({
          variant: "destructive",
          title: "Quantidade indisponível",
          description: `Este produto tem apenas ${validation.stock} unidade(s) disponível(is).`
        });
        setQuantity(Math.min(quantity, validation.stock));
        return;
      }
      
      // Validar quantidade mínima (se configurada)
      if (validation.minQuantity && quantity < validation.minQuantity) {
        toast({
          variant: "destructive",
          title: "Quantidade abaixo do mínimo",
          description: `Este produto requer quantidade mínima de ${validation.minQuantity} unidade(s).`
        });
        return;
      }
      
      // Validar quantidade máxima (se configurada)
      if (validation.maxQuantity && quantity > validation.maxQuantity) {
        toast({
          variant: "destructive",
          title: "Quantidade acima do máximo",
          description: `Este produto permite quantidade máxima de ${validation.maxQuantity} unidade(s) por pedido.`
        });
        setQuantity(Math.min(quantity, validation.maxQuantity));
        return;
      }
      
      // Tudo validado - adicionar ao carrinho
      addToCart({
        id: product.id,
        name: product.name,
        price: parseFloat(product.price.replace('R$ ', '').replace('.', '').replace(',', '.')),
        image: product.images[0],
        stock: validation.stock,
        weight: product.weight,
        sellerId: product.sellerId // ID do vendedor
      }, quantity);
      
      toast({
        title: "Produto adicionado ao carrinho!",
        description: `${quantity}x ${product.name}`
      });
      
      // Resetar quantidade após adicionar
      setQuantity(1);
      
    } catch (error) {
      console.error("Erro ao adicionar ao carrinho:", error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível adicionar o produto ao carrinho. Tente novamente."
      });
    } finally {
      setValidatingProduct(false);
    }
  };

  const handleWishlistToggle = async () => {
    if (!product) return;

    const productData = {
      id: product.id,
      name: product.name,
      price: parseFloat(product.price.replace('R$ ', '').replace('.', '').replace(',', '.')),
      image: product.images[0]
    };

    if (isInWishlist(product.id)) {
      await removeFromWishlist(product.id);
    } else {
      await addToWishlist(productData);
    }
  };

  // Calcular frete
  const handleShippingCalculation = async () => {
    if (!cep || cep.replace(/\D/g, '').length !== 8) {
      setCepError("CEP deve ter 8 dígitos");
      return;
    }

    setCepError("");
    setLoadingShipping(true);
    
    try {
      // Verificar se CEP é válido
      const cepData = await searchCEP(cep);
      if (!cepData) {
        setCepError("CEP não encontrado");
        return;
      }

      // Calcular frete baseado no produto
      const weight = product.weight || 0.5; // Usar peso do produto ou padrão 500g
      const dimensions = product.dimensions || { length: 20, width: 15, height: 10 }; // Usar dimensões do produto ou padrão
      
      const quotes = await calculateShipping(
        '01310-100', // CEP de origem (configurável)
        cep,
        weight * quantity,
        dimensions
      );

      setShippingQuotes(quotes);
    } catch (error) {
      console.error('Erro ao calcular frete:', error);
      setCepError(
        error instanceof Error 
          ? error.message 
          : "Erro ao calcular frete. Verifique o CEP e tente novamente."
      );
      setShippingQuotes([]); // Limpar cotações ao invés de mostrar valores falsos
    } finally {
      setLoadingShipping(false);
    }
  };

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // Buscar produto específico
        const productRef = doc(db, "products", id);
        const productSnap = await getDoc(productRef);
        
        if (!productSnap.exists()) {
          setError("Produto não encontrado");
          return;
        }
        
        const productData = productSnap.data();
        const formattedProduct = {
          id: productSnap.id,
          name: productData.name,
          price: `R$ ${Number(productData.price).toLocaleString('pt-BR', {minimumFractionDigits: 2})}`,
          originalPrice: productData.originalPrice ? `R$ ${Number(productData.originalPrice).toLocaleString('pt-BR', {minimumFractionDigits: 2})}` : "",
          images: productData.images && productData.images.length > 0 ? productData.images : [fallbackImages[Math.floor(Math.random() * fallbackImages.length)]],
          badge: productData.badge || "Produto",
          rating: productData.rating || 4.5,
          description: productData.description || "Descrição não disponível",
          features: productData.features || [],
          categoryId: productData.categoryId,
          stock: productData.stock || 0,
          status: productData.status || "active",
          minQuantity: productData.minQuantity,
          maxQuantity: productData.maxQuantity,
          sellerId: productData.sellerId, // ID do vendedor
          weight: productData.weight || 0.5, // Peso em kg
          dimensions: productData.dimensions || { length: 20, width: 15, height: 10 } // Dimensões em cm
        };
        
        setProduct(formattedProduct);
        
        // Buscar produtos relacionados da mesma categoria
        if (productData.categoryId) {
          const relatedQuery = query(
            collection(db, "products"),
            where("categoryId", "==", productData.categoryId),
            where("status", "==", "active"),
            orderBy("createdAt", "desc"),
            limit(5)
          );
          
          const relatedSnap = await getDocs(relatedQuery);
          const relatedList = relatedSnap.docs
            .filter(doc => doc.id !== id)
            .slice(0, 4)
            .map(doc => {
              const data = doc.data();
              return {
                id: doc.id,
                name: data.name,
                price: `R$ ${Number(data.price).toLocaleString('pt-BR', {minimumFractionDigits: 2})}`,
                originalPrice: data.originalPrice ? `R$ ${Number(data.originalPrice).toLocaleString('pt-BR', {minimumFractionDigits: 2})}` : "",
                images: data.images && data.images.length > 0 ? data.images : [fallbackImages[Math.floor(Math.random() * fallbackImages.length)]],
                badge: data.badge || "Produto"
              };
            });
          
          setRelatedProducts(relatedList);
        }
        
      } catch (error) {
        console.error("Erro ao buscar produto:", error);
        setError("Erro ao carregar produto");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, db]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <p className="text-lg text-muted-foreground">Carregando produto...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <p className="text-lg text-muted-foreground mb-4">{error || "Produto não encontrado"}</p>
            <Link to="/">
              <Button>Voltar para Home</Button>
            </Link>
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
          <span className="text-foreground">{product.name}</span>
        </nav>

        {/* Product Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="aspect-square overflow-hidden rounded-lg border">
              <img 
                src={product.images[selectedImage]} 
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="grid grid-cols-4 gap-2">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`aspect-square overflow-hidden rounded border-2 ${
                    selectedImage === index ? 'border-primary' : 'border-border'
                  }`}
                >
                  <img src={image} alt={`${product.name} ${index + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <Badge className="mb-2">{product.badge}</Badge>
              <h1 className="text-3xl font-bold text-foreground mb-2">{product.name}</h1>
              <div className="flex items-center gap-2 mb-4">
                {/* <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-4 h-4 ${i < Math.floor(product.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">({product.rating}) • 156 avaliações</span> */}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span className="text-3xl font-bold text-primary">{product.price}</span>
                {product.originalPrice && (
                  <span className="text-xl text-muted-foreground line-through">{product.originalPrice}</span>
                )}
              </div>
              {product.originalPrice && (
                <p className="text-sm text-green-600">Economia de R$ {(parseFloat(product.originalPrice.replace('R$ ', '').replace('.', '').replace(',', '.')) - parseFloat(product.price.replace('R$ ', '').replace('.', '').replace(',', '.'))).toFixed(2).replace('.', ',')}</p>
              )}
            </div>

            <div className="space-y-4">
              <p className="text-muted-foreground">{product.description}</p>
              
              {product.features && product.features.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">Características:</h3>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    {product.features.map((feature, index) => (
                      <li key={index}>• {feature}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Alertas de Status e Estoque */}
              {product.status !== 'active' && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Este produto não está mais disponível para venda.
                  </AlertDescription>
                </Alert>
              )}

              {product.stock === 0 && product.status === 'active' && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Produto fora de estoque no momento.
                  </AlertDescription>
                </Alert>
              )}

              {product.stock > 0 && product.stock <= 5 && product.status === 'active' && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Últimas {product.stock} unidades disponíveis!
                  </AlertDescription>
                </Alert>
              )}

              {product.stock !== undefined && product.stock > 0 && (
                <div>
                  <p className="text-sm text-muted-foreground">
                    <span className="font-semibold">Estoque:</span> {product.stock} unidades disponíveis
                  </p>
                  {product.minQuantity && (
                    <p className="text-sm text-muted-foreground">
                      <span className="font-semibold">Quantidade mínima:</span> {product.minQuantity} unidades
                    </p>
                  )}
                  {product.maxQuantity && (
                    <p className="text-sm text-muted-foreground">
                      <span className="font-semibold">Quantidade máxima por pedido:</span> {product.maxQuantity} unidades
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center border rounded">
                <button 
                  onClick={() => setQuantity(Math.max(product.minQuantity || 1, quantity - 1))}
                  className="px-3 py-2 hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={product.stock === 0 || product.status !== 'active' || quantity <= (product.minQuantity || 1)}
                >
                  -
                </button>
                <span className="px-4 py-2 min-w-[3rem] text-center">{quantity}</span>
                <button 
                  onClick={() => {
                    const maxAllowed = product.maxQuantity 
                      ? Math.min(product.stock || 999, product.maxQuantity)
                      : (product.stock || 999);
                    setQuantity(Math.min(maxAllowed, quantity + 1));
                  }}
                  className="px-3 py-2 hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={
                    product.stock === 0 || 
                    product.status !== 'active' || 
                    quantity >= (product.stock || 999) ||
                    (product.maxQuantity && quantity >= product.maxQuantity)
                  }
                >
                  +
                </button>
              </div>
              <Button 
                size="lg" 
                className="flex-1" 
                disabled={product.stock === 0 || product.status !== 'active' || validatingProduct}
                onClick={handleAddToCart}
              >
                <ShoppingCart className="mr-2 h-4 w-4" />
                {validatingProduct 
                  ? "Validando..." 
                  : product.status !== 'active' 
                    ? "Indisponível"
                    : product.stock === 0 
                      ? "Fora de Estoque" 
                      : "Adicionar ao Carrinho"
                }
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                onClick={handleWishlistToggle}
                className={isInWishlist(product?.id || '') ? 'text-red-500 border-red-500' : ''}
              >
                <Heart className={`h-4 w-4 ${isInWishlist(product?.id || '') ? 'fill-current' : ''}`} />
              </Button>
            </div>

            {/* Calculadora de Frete */}
            <Card className="p-4">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Truck className="h-5 w-5 text-primary" />
                  <h3 className="font-semibold">Calcular Frete e Prazo</h3>
                </div>
                
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Label htmlFor="cep">CEP de destino</Label>
                    <Input
                      id="cep"
                      placeholder="00000-000"
                      value={cep}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '').slice(0, 8);
                        const formatted = value.replace(/^(\d{5})(\d)/, '$1-$2');
                        setCep(formatted);
                        setCepError("");
                        setShippingQuotes([]);
                      }}
                    />
                    {cepError && (
                      <p className="text-xs text-red-500 mt-1">{cepError}</p>
                    )}
                  </div>
                  <Button 
                    onClick={handleShippingCalculation}
                    disabled={loadingShipping || cep.replace(/\D/g, '').length !== 8}
                    className="mt-6"
                  >
                    {loadingShipping ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                    ) : (
                      <>
                        <Calculator className="h-4 w-4 mr-2" />
                        Calcular
                      </>
                    )}
                  </Button>
                </div>

                {/* Resultados do frete */}
                {shippingQuotes.length > 0 && (
                  <div className="space-y-2 pt-2 border-t">
                    <p className="text-sm font-medium text-muted-foreground">Opções de entrega:</p>
                    {shippingQuotes.map((quote) => (
                      <div key={quote.id} className="flex justify-between items-center p-2 border rounded">
                        <div>
                          <p className="font-medium text-sm">{quote.name}</p>
                          <p className="text-xs text-muted-foreground">{quote.company}</p>
                          <p className="text-xs text-muted-foreground">{quote.deliveryTime}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-primary">
                            {quote.price === 0 ? 'Grátis' : `R$ ${quote.price.toFixed(2).replace('.', ',')}`}
                          </p>
                        </div>
                      </div>
                    ))}
                    <p className="text-xs text-muted-foreground">
                      * Frete calculado para {quantity} {quantity === 1 ? 'unidade' : 'unidades'}
                    </p>
                  </div>
                )}
              </div>
            </Card>

            <div className="grid grid-cols-3 gap-4 pt-6 border-t">
              {/* <div className="text-center">
                <Truck className="h-6 w-6 mx-auto mb-2 text-primary" />
                <p className="text-sm font-medium">Frete Grátis</p>
                <p className="text-xs text-muted-foreground">Acima de R$ 199</p>
              </div>
              <div className="text-center">
                <Shield className="h-6 w-6 mx-auto mb-2 text-primary" />
                <p className="text-sm font-medium">Garantia</p>
                <p className="text-xs text-muted-foreground">12 meses</p>
              </div>
              <div className="text-center">
                <RotateCcw className="h-6 w-6 mx-auto mb-2 text-primary" />
                <p className="text-sm font-medium">Troca Fácil</p>
                <p className="text-xs text-muted-foreground">30 dias</p>
              </div> */}
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold mb-8 text-center">Produtos Relacionados</h2>
            <Carousel className="w-full">
              <CarouselContent>
                {relatedProducts.map((relatedProduct) => (
                  <CarouselItem key={relatedProduct.id} className="md:basis-1/2 lg:basis-1/4">
                    <Link to={`/produto/${relatedProduct.id}`}>
                      <Card className="group hover:shadow-lg transition-all duration-300 cursor-pointer">
                        <CardContent className="p-0">
                          <div className="relative overflow-hidden">
                            <img 
                              src={relatedProduct.images[0]} 
                              alt={relatedProduct.name}
                              className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <Badge className="absolute top-2 left-2">{relatedProduct.badge}</Badge>
                          </div>
                          <div className="p-4">
                            <h3 className="font-semibold mb-2">{relatedProduct.name}</h3>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-primary">{relatedProduct.price}</span>
                              {relatedProduct.originalPrice && (
                                <span className="text-sm text-muted-foreground line-through">{relatedProduct.originalPrice}</span>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>
          </section>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default ProductDetail;

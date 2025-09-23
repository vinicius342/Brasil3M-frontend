import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { ShoppingCart, Heart, Star, Truck, Shield, RotateCcw } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const mockProducts = [
  {
    id: 1,
    name: "Smartphone Premium",
    price: "R$ 2.499,99",
    originalPrice: "R$ 2.999,99",
    images: [
      "https://images.unsplash.com/photo-1721322800607-8c38375eef04?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1682685797527-9918987c9f9a?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1682687220744-498a5c33c953?w=400&h=400&fit=crop"
    ],
    badge: "Oferta",
    rating: 4.8,
    description: "O melhor smartphone do mercado com câmera de alta resolução e bateria de longa duração.",
    features: [
      "Tela AMOLED de 6.7 polegadas",
      "Câmera de 108MP",
      "Bateria de 5000mAh",
      "Processador Octa-Core",
      "8GB de RAM",
      "256GB de armazenamento"
    ]
  },
  {
    id: 2,
    name: "Fones Wireless Pro",
    price: "R$ 899,99",
    originalPrice: "R$ 1.199,99",
    images: [
      "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1583394842265-1c3da6c642f0?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1560525794-7685f36a63a9?w=400&h=400&fit=crop"
    ],
    badge: "Bestseller",
    rating: 4.9,
    description: "Experimente a liberdade sem fios com a melhor qualidade de som e cancelamento de ruído.",
    features: [
      "Cancelamento de ruído ativo",
      "Bluetooth 5.2",
      "Bateria de longa duração (até 30 horas)",
      "Resistente à água e suor",
      "Estojo de carregamento sem fio"
    ]
  },
  {
    id: 3,
    name: "Smartwatch Elite",
    price: "R$ 1.299,99",
    originalPrice: "",
    images: [
      "https://images.unsplash.com/photo-1582562124811-c09040d0a901?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1612831753349-e5f4899595c7?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1614632255323-885783094477?w=400&h=400&fit=crop"
    ],
    badge: "Novo",
    rating: 4.7,
    description: "Monitore sua saúde e bem-estar com este smartwatch elegante e cheio de recursos.",
    features: [
      "Monitoramento cardíaco",
      "GPS integrado",
      "Resistente à água",
      "Notificações de smartphone",
      "Monitoramento de sono",
      "Bateria de longa duração"
    ]
  },
  {
    id: 4,
    name: "Tablet Ultra",
    price: "R$ 1.899,99",
    originalPrice: "R$ 2.299,99",
    images: [
      "https://images.unsplash.com/photo-1721322800607-8c38375eef04?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1682685797527-9918987c9f9a?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1682687220744-498a5c33c953?w=400&h=400&fit=crop"
    ],
    badge: "Oferta",
    rating: 4.6,
    description: "Desfrute de uma experiência visual incrível com este tablet de alta performance.",
    features: [
      "Tela de 11 polegadas",
      "Processador Octa-Core",
      "4GB de RAM",
      "64GB de armazenamento",
      "Câmera de 13MP",
      "Bateria de longa duração"
    ]
  }
];

const ProductDetail = () => {
  const { id } = useParams();
  const productId = id ? parseInt(id) : 1;
  const product = mockProducts.find(p => p.id === productId) || mockProducts[0];
  
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  const relatedProducts = mockProducts.filter(p => p.id !== product.id).slice(0, 4);

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
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-4 h-4 ${i < Math.floor(product.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">({product.rating}) • 156 avaliações</span>
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
              
              <div>
                <h3 className="font-semibold mb-2">Características:</h3>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  {product.features.map((feature, index) => (
                    <li key={index}>• {feature}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center border rounded">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-2 hover:bg-muted"
                >
                  -
                </button>
                <span className="px-4 py-2">{quantity}</span>
                <button 
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-3 py-2 hover:bg-muted"
                >
                  +
                </button>
              </div>
              <Button size="lg" className="flex-1">
                <ShoppingCart className="mr-2 h-4 w-4" />
                Adicionar ao Carrinho
              </Button>
              <Button variant="outline" size="lg">
                <Heart className="h-4 w-4" />
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-4 pt-6 border-t">
              <div className="text-center">
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
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
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
      </div>

      <Footer />
    </div>
  );
};

export default ProductDetail;

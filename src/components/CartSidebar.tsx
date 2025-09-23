
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ShoppingCart, Plus, Minus, Trash2, X } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

const CartSidebar = () => {
  const [cartItems, setCartItems] = useState<CartItem[]>([
    {
      id: 1,
      name: "Smartphone Galaxy",
      price: 899.99,
      quantity: 1,
      image: "/placeholder.svg"
    },
    {
      id: 2,
      name: "Fone Bluetooth",
      price: 199.99,
      quantity: 2,
      image: "/placeholder.svg"
    },
    {
      id: 3,
      name: "Capa Protetora",
      price: 29.99,
      quantity: 1,
      image: "/placeholder.svg"
    }
  ]);

  const updateQuantity = (id: number, newQuantity: number) => {
    if (newQuantity === 0) {
      removeItem(id);
      return;
    }
    setCartItems(items =>
      items.map(item =>
        item.id === id ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const removeItem = (id: number) => {
    setCartItems(items => items.filter(item => item.id !== id));
  };

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <ShoppingCart className="h-4 w-4 md:h-5 md:w-5" />
          {getTotalItems() > 0 && (
            <Badge className="absolute -top-2 -right-2 h-4 w-4 md:h-5 md:w-5 rounded-full p-0 flex items-center justify-center text-xs">
              {getTotalItems()}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:w-96 sm:max-w-96">
        <SheetHeader>
          <SheetTitle>Seu Carrinho</SheetTitle>
          <SheetDescription>
            {cartItems.length > 0 ? `${getTotalItems()} itens no carrinho` : "Seu carrinho está vazio"}
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-col h-full">
          <div className="flex-1 overflow-y-auto py-4">
            {cartItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <ShoppingCart className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Carrinho vazio</h3>
                <p className="text-muted-foreground mb-4">Adicione produtos para começar suas compras</p>
                <Button>Continuar Comprando</Button>
              </div>
            ) : (
              <div className="space-y-4">
                 {cartItems.map((item) => (
                   <div key={item.id} className="flex items-start space-x-3 p-3 md:p-4 border rounded-lg">
                     <img
                       src={item.image}
                       alt={item.name}
                       className="w-12 h-12 md:w-16 md:h-16 object-cover rounded-md flex-shrink-0"
                     />
                     <div className="flex-1 min-w-0">
                       <h4 className="font-semibold text-sm md:text-base truncate">{item.name}</h4>
                       <p className="text-xs md:text-sm text-muted-foreground">
                         R$ {item.price.toFixed(2)}
                       </p>
                       <div className="flex items-center space-x-2 mt-2">
                         <Button
                           variant="outline"
                           size="icon"
                           className="h-7 w-7 md:h-8 md:w-8"
                           onClick={() => updateQuantity(item.id, item.quantity - 1)}
                         >
                           <Minus className="h-3 w-3 md:h-4 md:w-4" />
                         </Button>
                         <span className="w-6 md:w-8 text-center text-sm">{item.quantity}</span>
                         <Button
                           variant="outline"
                           size="icon"
                           className="h-7 w-7 md:h-8 md:w-8"
                           onClick={() => updateQuantity(item.id, item.quantity + 1)}
                         >
                           <Plus className="h-3 w-3 md:h-4 md:w-4" />
                         </Button>
                       </div>
                     </div>
                     <div className="flex flex-col items-end space-y-2 flex-shrink-0">
                       <p className="font-semibold text-sm md:text-base">
                         R$ {(item.price * item.quantity).toFixed(2)}
                       </p>
                       <Button
                         variant="ghost"
                         size="icon"
                         className="h-7 w-7 md:h-8 md:w-8 text-destructive hover:text-destructive"
                         onClick={() => removeItem(item.id)}
                       >
                         <Trash2 className="h-3 w-3 md:h-4 md:w-4" />
                       </Button>
                     </div>
                   </div>
                 ))}
              </div>
            )}
          </div>

          {cartItems.length > 0 && (
            <div className="border-t pt-4 space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>R$ {getTotalPrice().toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Frete:</span>
                  <span>R$ 15.00</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total:</span>
                  <span>R$ {(getTotalPrice() + 15).toFixed(2)}</span>
                </div>
              </div>
              <div className="space-y-2">
                <Button className="w-full" size="lg">
                  Finalizar Compra
                </Button>
                <Button variant="outline" className="w-full">
                  Continuar Comprando
                </Button>
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default CartSidebar;

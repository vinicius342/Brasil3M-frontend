import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useAuth } from "./AuthContext";
import { 
  getFirestore, 
  collection, 
  doc, 
  addDoc, 
  deleteDoc, 
  query, 
  where, 
  onSnapshot,
  serverTimestamp 
} from "firebase/firestore";

interface WishlistItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  image: string;
  dateAdded: Date;
}

interface WishlistContextType {
  wishlistItems: WishlistItem[];
  addToWishlist: (product: {
    id: string;
    name: string;
    price: number;
    image: string;
  }) => Promise<void>;
  removeFromWishlist: (productId: string) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
  clearWishlist: () => void;
  getTotalItems: () => number;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
};

interface WishlistProviderProps {
  children: ReactNode;
}

export const WishlistProvider = ({ children }: WishlistProviderProps) => {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const { currentUser } = useAuth();
  const db = getFirestore();

  // Carregar wishlist do Firestore quando usuário estiver logado
  useEffect(() => {
    if (!currentUser) {
      // Se não estiver logado, carregar do localStorage
      const savedWishlist = localStorage.getItem("wishlist");
      if (savedWishlist) {
        try {
          const parsed = JSON.parse(savedWishlist);
          setWishlistItems(parsed.map((item: any) => ({
            ...item,
            dateAdded: new Date(item.dateAdded)
          })));
        } catch (error) {
          console.error("Erro ao carregar wishlist do localStorage:", error);
        }
      }
      return;
    }

    // Se estiver logado, buscar do Firestore
    const q = query(
      collection(db, "wishlists"),
      where("userId", "==", currentUser.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          productId: data.productId,
          name: data.name,
          price: data.price,
          image: data.image,
          dateAdded: data.dateAdded?.toDate() || new Date()
        };
      });
      setWishlistItems(items);
    });

    return () => unsubscribe();
  }, [currentUser, db]);

  // Salvar no localStorage se não estiver logado
  useEffect(() => {
    if (!currentUser) {
      localStorage.setItem("wishlist", JSON.stringify(wishlistItems));
    }
  }, [wishlistItems, currentUser]);

  const addToWishlist = async (product: {
    id: string;
    name: string;
    price: number;
    image: string;
  }) => {
    if (isInWishlist(product.id)) return;

    const newItem = {
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      dateAdded: new Date()
    };

    if (!currentUser) {
      // Se não estiver logado, salvar no estado local
      setWishlistItems(prev => [...prev, {
        id: Date.now().toString(),
        ...newItem
      }]);
      return;
    }

    try {
      // Se estiver logado, salvar no Firestore
      await addDoc(collection(db, "wishlists"), {
        ...newItem,
        userId: currentUser.uid,
        dateAdded: serverTimestamp()
      });
    } catch (error) {
      console.error("Erro ao adicionar à wishlist:", error);
    }
  };

  const removeFromWishlist = async (productId: string) => {
    if (!currentUser) {
      // Se não estiver logado, remover do estado local
      setWishlistItems(prev => prev.filter(item => item.productId !== productId));
      return;
    }

    try {
      // Se estiver logado, remover do Firestore
      const itemToRemove = wishlistItems.find(item => item.productId === productId);
      if (itemToRemove) {
        await deleteDoc(doc(db, "wishlists", itemToRemove.id));
      }
    } catch (error) {
      console.error("Erro ao remover da wishlist:", error);
    }
  };

  const isInWishlist = (productId: string) => {
    return wishlistItems.some(item => item.productId === productId);
  };

  const clearWishlist = () => {
    setWishlistItems([]);
    if (!currentUser) {
      localStorage.removeItem("wishlist");
    }
  };

  const getTotalItems = () => {
    return wishlistItems.length;
  };

  const value: WishlistContextType = {
    wishlistItems,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    clearWishlist,
    getTotalItems
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};

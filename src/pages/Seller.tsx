import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useEmailVerification } from "@/hooks/useEmailVerification";
import { EmailVerification } from "@/components/EmailVerification";
import MelhorEnvioConnection from "@/components/MelhorEnvioConnection";
import Header from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Package, DollarSign, Eye, Edit, Trash2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { 
  getFirestore, 
  collection, 
  getDocs, 
  query, 
  where,
  onSnapshot,
  orderBy,
  limit,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp
} from "firebase/firestore";

const Seller = () => {
  const { currentUser } = useAuth();
  const { isEmailVerified } = useEmailVerification(false);
  const [products, setProducts] = useState([]);
  const [sales, setSales] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditProductOpen, setIsEditProductOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const navigate = useNavigate();
  const db = getFirestore();

  // Verificar role do usuário
  useEffect(() => {
    if (!currentUser) return;

    const checkRole = async () => {
      try {
        const userDoc = await getDocs(query(collection(db, "users"), where("__name__", "==", currentUser.uid)));
        if (!userDoc.empty) {
          const userData = userDoc.docs[0].data();
          if (userData.role !== "seller" && userData.role !== "admin") {
            navigate("/profile");
          }
        }
      } catch (err) {
        console.error("Erro ao verificar role do usuário:", err);
      }
    };

    checkRole();
  }, [currentUser, navigate]);

  // Buscar categorias disponíveis
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const q = query(collection(db, "categories"), where("status", "==", "active"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
          const categoriesList = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setCategories(categoriesList);
        });

        return () => unsubscribe();
      } catch (error) {
        console.error("Erro ao buscar categorias:", error);
      }
    };

    fetchCategories();
  }, [db]);

  // Buscar produtos do vendedor
  useEffect(() => {
    if (!currentUser) return;

    const fetchProducts = async () => {
      try {
        const q = query(
          collection(db, "products"), 
          where("sellerId", "==", currentUser.uid),
          orderBy("createdAt", "desc"),
          limit(5)
        );
        
        const unsubscribe = onSnapshot(q, (snapshot) => {
          const productsList = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            price: `R$ ${doc.data().price?.toFixed(2).replace('.', ',') || '0,00'}`,
            sales: doc.data().salesCount || 0
          }));
          setProducts(productsList);
        });

        return () => unsubscribe();
      } catch (error) {
        console.error("Erro ao buscar produtos:", error);
      }
    };

    fetchProducts();
  }, [currentUser, db]);

  // Buscar vendas do vendedor
  useEffect(() => {
    if (!currentUser) return;

    const fetchSales = async () => {
      try {
        // Buscar TODOS os pedidos confirmados
        const q = query(
          collection(db, "orders"), 
          where("status", "in", ["confirmed", "shipping", "delivered"]),
          orderBy("createdAt", "desc"),
          limit(50)
        );
        
        const unsubscribe = onSnapshot(q, async (snapshot) => {
          const salesList = [];
          
          for (const orderDoc of snapshot.docs) {
            const orderData = orderDoc.data();
            
            // Filtrar apenas itens que pertencem ao vendedor atual
            const sellerItems = (orderData.items || []).filter(item => item.sellerId === currentUser.uid);
            
            // Se não há itens do vendedor, pular este pedido
            if (sellerItems.length === 0) continue;
            
            // Calcular total apenas dos itens do vendedor
            const sellerTotal = sellerItems.reduce((acc, item) => {
              return acc + (item.price * item.quantity);
            }, 0);
            
            // Buscar dados do comprador
            let buyerName = "N/A";
            try {
              const buyerDoc = await getDocs(query(collection(db, "users"), where("__name__", "==", orderData.userId)));
              if (!buyerDoc.empty) {
                const buyer = buyerDoc.docs[0].data();
                buyerName = `${buyer.firstName || ''} ${buyer.lastName || ''}`.trim() || buyer.email || "Cliente";
              }
            } catch (error) {
              console.error("Erro ao buscar comprador:", error);
            }

            salesList.push({
              id: orderDoc.id,
              products: sellerItems, // Apenas produtos do vendedor
              total: `R$ ${sellerTotal.toFixed(2).replace('.', ',')}`,
              buyer: buyerName,
              address: orderData.address ? 
                `${orderData.address.street}, ${orderData.address.number}, ${orderData.address.city} - ${orderData.address.state}` : 
                "Endereço não informado",
              status: orderData.status === "delivered" ? "Entregue" : 
                     orderData.status === "shipping" ? "A caminho" : 
                     orderData.status === "confirmed" ? "Confirmado" :
                     orderData.status === "cancelled" ? "Cancelada" : "Processando",
              date: orderData.createdAt?.toDate().toLocaleDateString('pt-BR') || new Date().toLocaleDateString('pt-BR')
            });
          }
          
          setSales(salesList);
          setLoading(false);
        });

        return () => unsubscribe();
      } catch (error) {
        console.error("Erro ao buscar vendas:", error);
        setLoading(false);
      }
    };

    fetchSales();
  }, [currentUser, db]);



  // Função para editar produto
  const handleEditProduct = (product) => {
    setEditingProduct({
      id: product.id,
      name: product.name || product.title,
      description: product.description,
      price: product.price ? product.price.toString().replace('R$ ', '').replace(',', '.') : '',
      stock: (product.stock || product.quantity || 0).toString(),
      categoryId: product.categoryId,
      images: product.images ? product.images.join(', ') : ''
    });
    setIsEditProductOpen(true);
  };

  // Função para salvar edição do produto
  const saveEditProduct = async () => {
    if (!editingProduct.name.trim() || !editingProduct.description.trim() || !editingProduct.price || !editingProduct.stock || !editingProduct.categoryId) {
      alert("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    try {
      await updateDoc(doc(db, "products", editingProduct.id), {
        name: editingProduct.name,
        description: editingProduct.description,
        price: parseFloat(editingProduct.price),
        stock: parseInt(editingProduct.stock),
        categoryId: editingProduct.categoryId,
        images: editingProduct.images ? editingProduct.images.split(',').map(url => url.trim()) : [],
        updatedAt: serverTimestamp()
      });

      setIsEditProductOpen(false);
      setEditingProduct(null);
    } catch (error) {
      console.error("Erro ao editar produto:", error);
      alert("Erro ao editar produto. Tente novamente.");
    }
  };

  // Função para excluir produto
  const handleDeleteProduct = async (productId, productName) => {
    const confirmDelete = window.confirm(`Tem certeza que deseja excluir o produto "${productName}"? Esta ação não pode ser desfeita.`);
    
    if (confirmDelete) {
      try {
        await deleteDoc(doc(db, "products", productId));
      } catch (error) {
        console.error("Erro ao excluir produto:", error);
        alert("Erro ao excluir produto. Tente novamente.");
      }
    }
  };

  // Calcular estatísticas em tempo real
  const stats = {
    totalProducts: products.length,
    totalSales: sales.reduce((acc, sale) => {
      const amount = parseFloat(sale.total.replace('R$ ', '').replace(',', '.'));
      return acc + amount;
    }, 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
    pendingOrders: sales.filter(sale => sale.status === "Processando" || sale.status === "A caminho").length,
    totalViews: products.reduce((acc, product) => acc + (product.views || 0), 0)
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Verificação de E-mail */}
        <div className="mb-6">
          <EmailVerification />
        </div>
        
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Painel do Vendedor</h1>
            <p className="text-muted-foreground">Gerencie seus produtos e vendas</p>
          </div>
          <Link to="/seller/add-product">
            <Button disabled={!isEmailVerified}>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Produto
            </Button>
          </Link>
        </div>

        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Produtos</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalProducts}</div>
              <p className="text-xs text-muted-foreground">produtos cadastrados</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Vendas Total</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalSales}</div>
              <p className="text-xs text-muted-foreground">receita total</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pedidos Pendentes</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingOrders}</div>
              <p className="text-xs text-muted-foreground">pedidos pendentes</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Visualizações</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalViews}</div>
              <p className="text-xs text-muted-foreground">visualizações totais</p>
            </CardContent>
          </Card>
        </div>

        {/* Conexão MelhorEnvio */}
        <div className="mb-8">
          <MelhorEnvioConnection user={currentUser} />
        </div>

        <Card>
          <CardHeader className="flex justify-between items-center">
            <CardTitle>Meus Produtos</CardTitle>
            <Link to="/manage-products">
              <Button variant="outline">Ver Todos</Button>
            </Link>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produto</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Preço</TableHead>
                  <TableHead>Estoque</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Vendas</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                      Nenhum produto encontrado. 
                      <Link 
                        to="/seller/add-product"
                        className="text-primary hover:underline ml-1"
                      >
                        Adicione seu primeiro produto
                      </Link>
                    </TableCell>
                  </TableRow>
                ) : (
                  products.map((product) => {
                    const category = categories.find(cat => cat.id === product.categoryId);
                    return (
                      <TableRow key={product.id}>
                        <TableCell className="font-medium">{product.name || product.title}</TableCell>
                        <TableCell>{category ? category.name : "-"}</TableCell>
                        <TableCell>{product.price}</TableCell>
                        <TableCell>
                          <Badge variant={(product.stock || product.quantity) > 0 ? "default" : "destructive"}>
                            {product.stock || product.quantity || 0} unidades
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={product.status === "active" ? "default" : "secondary"}>
                            {product.status === "active" ? "Ativo" : "Inativo"}
                          </Badge>
                        </TableCell>
                        <TableCell>{product.sales} vendas</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => navigate(`/produto/${product.id}`)}
                              title="Visualizar produto"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleEditProduct(product)}
                              title="Editar produto"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleDeleteProduct(product.id, product.name || product.title)}
                              title="Excluir produto"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Dialog de Edição de Produto */}
        <Dialog open={isEditProductOpen} onOpenChange={setIsEditProductOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Editar Produto</DialogTitle>
              <DialogDescription>
                Altere os dados do produto e salve as mudanças.
              </DialogDescription>
            </DialogHeader>
            {editingProduct && (
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-product-name" className="text-right">Nome *</Label>
                  <Input
                    id="edit-product-name"
                    value={editingProduct.name}
                    onChange={(e) => setEditingProduct({...editingProduct, name: e.target.value})}
                    className="col-span-3"
                    placeholder="Ex: Smartphone Samsung Galaxy"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-product-description" className="text-right">Descrição *</Label>
                  <Textarea
                    id="edit-product-description"
                    value={editingProduct.description}
                    onChange={(e) => setEditingProduct({...editingProduct, description: e.target.value})}
                    className="col-span-3"
                    placeholder="Descreva as características do produto..."
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-product-price" className="text-right">Preço *</Label>
                  <Input
                    id="edit-product-price"
                    type="number"
                    step="0.01"
                    value={editingProduct.price}
                    onChange={(e) => setEditingProduct({...editingProduct, price: e.target.value})}
                    className="col-span-3"
                    placeholder="0.00"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-product-stock" className="text-right">Estoque *</Label>
                  <Input
                    id="edit-product-stock"
                    type="number"
                    value={editingProduct.stock}
                    onChange={(e) => setEditingProduct({...editingProduct, stock: e.target.value})}
                    className="col-span-3"
                    placeholder="Quantidade disponível"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-product-category" className="text-right">Categoria *</Label>
                  <Select
                    value={editingProduct.categoryId}
                    onValueChange={(value) => setEditingProduct({...editingProduct, categoryId: value})}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-product-images" className="text-right">Imagens</Label>
                  <Input
                    id="edit-product-images"
                    value={editingProduct.images}
                    onChange={(e) => setEditingProduct({...editingProduct, images: e.target.value})}
                    className="col-span-3"
                    placeholder="URLs das imagens separadas por vírgula"
                  />
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditProductOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={saveEditProduct}>Salvar Alterações</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Card className="mt-8">
          <CardHeader className="flex justify-between items-center">
            <CardTitle>Minhas Vendas</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produtos</TableHead>
                  <TableHead>Unidades</TableHead>
                  <TableHead>Valor Total</TableHead>
                  <TableHead>Comprador</TableHead>
                  <TableHead>Endereço</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Data</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sales.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                      Nenhuma venda encontrada ainda.
                    </TableCell>
                  </TableRow>
                ) : (
                  sales.map((sale) => (
                    <TableRow key={sale.id}>
                      <TableCell>
                        {sale.products.map((p, idx) => (
                          <div key={idx}>{p.name || p.productName || 'Produto'}</div>
                        ))}
                      </TableCell>
                      <TableCell>
                        {sale.products.map((p, idx) => (
                          <div key={idx}>{p.quantity || p.units || 1}</div>
                        ))}
                      </TableCell>
                      <TableCell>{sale.total}</TableCell>
                      <TableCell>{sale.buyer}</TableCell>
                      <TableCell className="max-w-xs truncate">{sale.address}</TableCell>
                      <TableCell>
                        <Badge variant={sale.status === "Entregue" ? "default" : sale.status === "A caminho" ? "secondary" : sale.status === "Cancelada" ? "destructive" : "outline"}>
                          {sale.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{sale.date}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Seller;
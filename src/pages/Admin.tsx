import { useState, useEffect } from "react";
import { useEmailVerification } from "@/hooks/useEmailVerification";
import { EmailVerification } from "@/components/EmailVerification";
import { useAuth } from "@/contexts/AuthContext";
import Header from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Users, DollarSign, ShoppingBag, TrendingUp, Plus, Tag } from "lucide-react";
import { 
  getFirestore, 
  collection, 
  getDocs, 
  doc, 
  updateDoc, 
  addDoc, 
  query, 
  where,
  onSnapshot
} from "firebase/firestore";

const Admin = () => {
  const { isEmailVerified } = useEmailVerification(false);
  const { currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState({ name: "", description: "" });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editCategory, setEditCategory] = useState(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const db = getFirestore();

  // Buscar usuários do Firebase
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersSnapshot = await getDocs(collection(db, "users"));
        const usersList = usersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setUsers(usersList);
      } catch (error) {
        console.error("Erro ao buscar usuários:", error);
      }
    };
    
    fetchUsers();
  }, [db]);

  // Buscar categorias do Firebase em tempo real
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "categories"), (snapshot) => {
      const categoriesList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        productCount: doc.data().productCount || 0
      }));
      setCategories(categoriesList);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [db]);

  const updateUserStatus = async (userId: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, "users", userId), {
        status: newStatus
      });
      setUsers(users.map(user => 
        user.id === userId ? { ...user, status: newStatus } : user
      ));
    } catch (error) {
      console.error("Erro ao atualizar status do usuário:", error);
    }
  };

  const updateUserType = async (userId: string, newType: string) => {
    try {
      await updateDoc(doc(db, "users", userId), {
        role: newType
      });
      setUsers(users.map(user => 
        user.id === userId ? { ...user, role: newType } : user
      ));
    } catch (error) {
      console.error("Erro ao atualizar tipo do usuário:", error);
    }
  };

  const updateCategoryStatus = async (categoryId: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, "categories", categoryId), {
        status: newStatus
      });
    } catch (error) {
      console.error("Erro ao atualizar status da categoria:", error);
    }
  };

  const addCategory = async () => {
    if (newCategory.name.trim() && newCategory.description.trim()) {
      try {
        await addDoc(collection(db, "categories"), {
          name: newCategory.name,
          description: newCategory.description,
          status: "active",
          productCount: 0,
          createdAt: new Date()
        });
        setNewCategory({ name: "", description: "" });
        setIsDialogOpen(false);
      } catch (error) {
        console.error("Erro ao adicionar categoria:", error);
      }
    }
  };

  const handleEditCategory = (category) => {
    setEditCategory({ ...category });
    setIsEditDialogOpen(true);
  };

  const saveEditCategory = async () => {
    try {
      await updateDoc(doc(db, "categories", editCategory.id), {
        name: editCategory.name,
        description: editCategory.description,
        status: editCategory.status
      });
      setIsEditDialogOpen(false);
      setEditCategory(null);
    } catch (error) {
      console.error("Erro ao editar categoria:", error);
    }
  };

  // Calcular estatísticas em tempo real
  const stats = {
    totalSales: "R$ 125.430,00", // Pode ser calculado de uma coleção de pedidos
    totalSellers: users.filter(user => user.role === "seller").length,
    totalUsers: users.length,
    totalRevenue: "R$ 2.456.789,00", // Pode ser calculado de uma coleção de pedidos
    totalCategories: categories.length
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Verificação de E-mail */}
        <div className="mb-6">
          <EmailVerification />
        </div>
        
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Painel Administrativo</h1>
          <p className="text-muted-foreground">Gerencie usuários e monitore estatísticas da plataforma</p>
        </div>

        {loading && (
          <div className="flex justify-center items-center py-8">
            <div className="text-muted-foreground">Carregando dados...</div>
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Vendedores</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalSellers}</div>
              <p className="text-xs text-muted-foreground">+3 novos este mês</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Usuários</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
              <p className="text-xs text-muted-foreground">+45 novos este mês</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 mb-8">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Gerenciamento de Categorias</CardTitle>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Nova Categoria
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Adicionar Nova Categoria</DialogTitle>
                      <DialogDescription>
                        Preencha os dados para criar uma nova categoria de produtos.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="name" className="text-right">
                          Nome
                        </Label>
                        <Input
                          id="name"
                          value={newCategory.name}
                          onChange={(e) => setNewCategory({...newCategory, name: e.target.value})}
                          className="col-span-3"
                          placeholder="Ex: Eletrônicos"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="description" className="text-right">
                          Descrição
                        </Label>
                        <Input
                          id="description"
                          value={newCategory.description}
                          onChange={(e) => setNewCategory({...newCategory, description: e.target.value})}
                          className="col-span-3"
                          placeholder="Ex: Smartphones, tablets e acessórios"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button onClick={addCategory}>Adicionar Categoria</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Produtos</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categories.map((category) => (
                    <TableRow key={category.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Tag className="h-4 w-4 text-muted-foreground" />
                          {category.name}
                        </div>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">{category.description}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {category.productCount} produtos
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={category.status === "active" ? "default" : "destructive"}>
                          {category.status === "active" ? "Ativo" : "Inativo"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Select
                            value={category.status}
                            onValueChange={(value) => updateCategoryStatus(category.id, value)}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="active">Ativo</SelectItem>
                              <SelectItem value="inactive">Inativo</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button variant="outline" size="sm" onClick={() => handleEditCategory(category)}>
                            Editar
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Gerenciamento de Usuários</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">
                        {user.displayName || user.email || user.id}
                      </TableCell>
                      <TableCell>{user.email || ""}</TableCell>
                      <TableCell>
                        <Badge variant={user.role === "seller" ? "default" : "secondary"}>
                          {user.role === "seller" ? "Vendedor" : user.role === "admin" ? "Admin" : "Cliente"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={(user.status || "active") === "active" ? "default" : "destructive"}>
                          {(user.status || "active") === "active" ? "Ativo" : "Inativo"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Select
                            value={user.status || "active"}
                            onValueChange={(value) => updateUserStatus(user.id, value)}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="active">Ativo</SelectItem>
                              <SelectItem value="inactive">Inativo</SelectItem>
                            </SelectContent>
                          </Select>
                          {/* Admin não pode alterar seu próprio tipo */}
                          {currentUser?.uid !== user.id && user.role !== "admin" && (
                            <Select
                              value={user.role || "client"}
                              onValueChange={(value) => updateUserType(user.id, value)}
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="client">Cliente</SelectItem>
                                <SelectItem value="seller">Vendedor</SelectItem>
                              </SelectContent>
                            </Select>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Editar Categoria</DialogTitle>
              <DialogDescription>
                Altere os dados da categoria e salve as mudanças.
              </DialogDescription>
            </DialogHeader>
            {editCategory && (
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-name" className="text-right">Nome</Label>
                  <Input
                    id="edit-name"
                    value={editCategory.name}
                    onChange={e => setEditCategory({ ...editCategory, name: e.target.value })}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-description" className="text-right">Descrição</Label>
                  <Input
                    id="edit-description"
                    value={editCategory.description}
                    onChange={e => setEditCategory({ ...editCategory, description: e.target.value })}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-status" className="text-right">Status</Label>
                  <Select
                    value={editCategory.status}
                    onValueChange={value => setEditCategory({ ...editCategory, status: value })}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Ativo</SelectItem>
                      <SelectItem value="inactive">Inativo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button onClick={saveEditCategory}>Salvar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
};

export default Admin;
import { useState } from "react";
import Header from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Upload, X } from "lucide-react";
import { Link } from "react-router-dom";

const AddProduct = () => {
  const [images, setImages] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [currentTag, setCurrentTag] = useState("");
  
  // Estado do formulário
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    comparePrice: "",
    category: "",
    stock: "",
    weight: "", // em kg
    length: "", // em cm
    width: "", // em cm  
    height: "" // em cm
  });

  const addTag = () => {
    if (currentTag.trim() && !tags.includes(currentTag.trim())) {
      setTags([...tags, currentTag.trim()]);
      setCurrentTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newImages = Array.from(files).map(file => URL.createObjectURL(file));
      setImages([...images, ...newImages]);
    }
  };

  const removeImage = (indexToRemove: number) => {
    setImages(images.filter((_, index) => index !== indexToRemove));
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Aqui você salvaria no Firebase/Firestore
      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        comparePrice: formData.comparePrice ? parseFloat(formData.comparePrice) : null,
        stock: parseInt(formData.stock),
        weight: parseFloat(formData.weight),
        dimensions: {
          length: parseFloat(formData.length),
          width: parseFloat(formData.width),
          height: parseFloat(formData.height)
        },
        images,
        tags,
        createdAt: new Date()
      };
      
      console.log('Dados do produto para salvar:', productData);
      alert('Produto salvo com sucesso! (implementar salvamento no Firebase)');
      
    } catch (error) {
      console.error('Erro ao salvar produto:', error);
      alert('Erro ao salvar produto');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <Link to="/seller">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Voltar
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Adicionar Produto</h1>
              <p className="text-muted-foreground">Preencha as informações do seu produto</p>
            </div>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Informações Básicas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="name">Nome do Produto</Label>
                    <Input id="name" placeholder="Digite o nome do produto" />
                  </div>
                  
                  <div>
                    <Label htmlFor="category">Categoria</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="electronics">Eletrônicos</SelectItem>
                        <SelectItem value="fashion">Moda</SelectItem>
                        <SelectItem value="home">Casa e Jardim</SelectItem>
                        <SelectItem value="sports">Esportes</SelectItem>
                        <SelectItem value="books">Livros</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="description">Descrição</Label>
                    <Textarea 
                      id="description" 
                      placeholder="Descreva seu produto detalhadamente"
                      rows={4}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Preço e Estoque</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="price">Preço (R$)</Label>
                    <Input id="price" type="number" step="0.01" placeholder="0,00" />
                  </div>
                  
                  <div>
                    <Label htmlFor="comparePrice">Preço Comparativo (R$)</Label>
                    <Input id="comparePrice" type="number" step="0.01" placeholder="0,00" />
                    <p className="text-sm text-muted-foreground mt-1">
                      Preço original para mostrar desconto
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="stock">Quantidade em Estoque</Label>
                    <Input id="stock" type="number" placeholder="0" />
                  </div>

                  <div>
                    <Label htmlFor="sku">SKU (Código)</Label>
                    <Input id="sku" placeholder="SKU do produto" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Imagens do Produto</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                    <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-4">
                      Arraste e solte imagens aqui ou clique para selecionar
                    </p>
                    <Input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      id="image-upload"
                    />
                    <Label htmlFor="image-upload">
                      <Button variant="outline" type="button">
                        Selecionar Imagens
                      </Button>
                    </Label>
                  </div>
                  
                  {images.length > 0 && (
                    <div className="grid grid-cols-4 gap-4">
                      {images.map((image, index) => (
                        <div key={index} className="relative">
                          <img
                            src={image}
                            alt={`Preview ${index}`}
                            className="w-full h-24 object-cover rounded-lg"
                          />
                          <Button
                            variant="destructive"
                            size="sm"
                            className="absolute -top-2 -right-2 h-6 w-6 p-0"
                            onClick={() => removeImage(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tags e Especificações</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="tags">Tags</Label>
                  <div className="flex gap-2 mb-2">
                    <Input
                      id="tags"
                      value={currentTag}
                      onChange={(e) => setCurrentTag(e.target.value)}
                      placeholder="Digite uma tag"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    />
                    <Button type="button" onClick={addTag}>
                      Adicionar
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                        {tag}
                        <X
                          className="h-3 w-3 cursor-pointer"
                          onClick={() => removeTag(tag)}
                        />
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="weight">Peso para Frete (kg) *</Label>
                    <Input 
                      id="weight" 
                      type="number" 
                      step="0.01" 
                      placeholder="0.50"
                      value={formData.weight}
                      onChange={(e) => handleInputChange('weight', e.target.value)}
                      required
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Peso do produto embalado para cálculo de frete
                    </p>
                  </div>
                  
                  <div>
                    <Label htmlFor="stock">Estoque</Label>
                    <Input 
                      id="stock" 
                      type="number" 
                      placeholder="10"
                      value={formData.stock}
                      onChange={(e) => handleInputChange('stock', e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium">Dimensões para Frete (cm) *</Label>
                  <div className="grid grid-cols-3 gap-3 mt-2">
                    <div>
                      <Label htmlFor="length" className="text-xs text-muted-foreground">Comprimento</Label>
                      <Input 
                        id="length" 
                        type="number" 
                        step="0.1"
                        placeholder="20"
                        value={formData.length}
                        onChange={(e) => handleInputChange('length', e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="width" className="text-xs text-muted-foreground">Largura</Label>
                      <Input 
                        id="width" 
                        type="number" 
                        step="0.1"
                        placeholder="15"
                        value={formData.width}
                        onChange={(e) => handleInputChange('width', e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="height" className="text-xs text-muted-foreground">Altura</Label>
                      <Input 
                        id="height" 
                        type="number" 
                        step="0.1"
                        placeholder="10"
                        value={formData.height}
                        onChange={(e) => handleInputChange('height', e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Dimensões do produto embalado (caixa/envelope) para cálculo de frete
                  </p>
                </div>
              </CardContent>
            </Card>

            <div className="flex gap-4 justify-end">
              <Link to="/seller">
                <Button variant="outline" type="button">Cancelar</Button>
              </Link>
              <Button type="submit">Salvar Produto</Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default AddProduct;
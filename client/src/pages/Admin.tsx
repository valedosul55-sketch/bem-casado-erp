import { useState, useRef } from 'react';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { Pencil, Trash2, Plus, Search, Package, DollarSign, TrendingUp, FileText } from 'lucide-react';
import { Link } from 'wouter';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarcodeInput } from '@/components/BarcodeInput';
import AdminStores from './AdminStores';
import AdminStock from './AdminStock';
import AdminNotifications from './AdminNotifications';
import AdminStockMovements from './AdminStockMovements';
import AdminQuickStock from './AdminQuickStock';
import AdminNFe from './AdminNFe';
import AdminAdjustments from './AdminAdjustments';

export default function Admin() {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const ean13InputRef = useRef<HTMLInputElement>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    description: '',
    price: '',
    stock: '',
    unit: 'un',
    imageUrl: '',
    category: '',
    ean13: '',
    active: 1,
  });

  // Queries
  // @ts-ignore - Types will be regenerated
  const { data: products, refetch } = trpc.products.list.useQuery();
  
  // Mutations
  // @ts-ignore - Types will be regenerated
  const createMutation = trpc.products.create.useMutation();
  // @ts-ignore - Types will be regenerated
  const updateMutation = trpc.products.update.useMutation();
  // @ts-ignore - Types will be regenerated
  const deleteMutation = trpc.products.delete.useMutation();

  // Filtrar produtos
  const filteredProducts = products?.filter((product: any) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.brand?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Estatísticas
  const totalProducts = products?.length || 0;
  const totalValue = products?.reduce((sum: number, p: any) => sum + (p.price * p.stock), 0) || 0;
  const lowStockCount = products?.filter((p: any) => p.stock < 100).length || 0;

  // Resetar formulário
  const resetForm = () => {
    setFormData({
      name: '',
      brand: '',
      description: '',
      price: '',
      stock: '',
      unit: 'un',
      imageUrl: '',
      category: '',
      ean13: '',
      active: 1,
    });
    setEditingProduct(null);
  };

  // Abrir diálogo de edição
  const handleEdit = (product: any) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      brand: product.brand || '',
      description: product.description || '',
      price: (product.price / 100).toFixed(2),
      stock: product.stock.toString(),
      unit: product.unit || 'un',
      imageUrl: product.imageUrl || '',
      category: product.category || '',
      ean13: product.ean13 || '',
      active: product.active,
    });
    setShowEditDialog(true);
  };

  // Criar produto
  const handleCreate = async () => {
    try {
      const priceValue = parseFloat(formData.price.toString().replace(',', '.'));
      const stockValue = parseInt(formData.stock.toString());
      
      if (isNaN(priceValue)) {
        toast.error('Preço inválido', {
          description: 'Digite um valor numérico válido para o preço (ex: 29.90)',
        });
        return;
      }
      
      if (isNaN(stockValue)) {
        toast.error('Estoque inválido', {
          description: 'Digite um valor numérico válido para o estoque',
        });
        return;
      }

      await createMutation.mutateAsync({
        name: formData.name,
        brand: formData.brand || undefined,
        description: formData.description || undefined,
        price: Math.round(priceValue * 100),
        stock: stockValue,
        unit: formData.unit,
        imageUrl: formData.imageUrl || undefined,
        category: formData.category || undefined,
        ean13: formData.ean13 || undefined,
        active: formData.active,
      });

      toast.success('Produto criado com sucesso!');
      setShowCreateDialog(false);
      resetForm();
      refetch();
    } catch (error) {
      toast.error('Erro ao criar produto', {
        description: error instanceof Error ? error.message : 'Tente novamente',
      });
    }
  };

  // Atualizar produto
  const handleUpdate = async () => {
    if (!editingProduct) return;

    try {
      const priceValue = parseFloat(formData.price.toString().replace(',', '.'));
      const stockValue = parseInt(formData.stock.toString());
      
      if (isNaN(priceValue)) {
        toast.error('Preço inválido', {
          description: 'Digite um valor numérico válido para o preço (ex: 29.90)',
        });
        return;
      }
      
      if (isNaN(stockValue)) {
        toast.error('Estoque inválido', {
          description: 'Digite um valor numérico válido para o estoque',
        });
        return;
      }

      await updateMutation.mutateAsync({
        id: editingProduct.id,
        name: formData.name,
        brand: formData.brand || undefined,
        description: formData.description || undefined,
        price: Math.round(priceValue * 100),
        stock: stockValue,
        unit: formData.unit,
        imageUrl: formData.imageUrl || undefined,
        category: formData.category || undefined,
        ean13: formData.ean13 || undefined,
        active: formData.active,
      });

      toast.success('Produto atualizado com sucesso!');
      setShowEditDialog(false);
      resetForm();
      refetch();
    } catch (error) {
      toast.error('Erro ao atualizar produto', {
        description: error instanceof Error ? error.message : 'Tente novamente',
      });
    }
  };

  // Deletar produto
  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Tem certeza que deseja excluir "${name}"?`)) return;

    try {
      await deleteMutation.mutateAsync({ id });
      toast.success('Produto excluído com sucesso!');
      refetch();
    } catch (error) {
      toast.error('Erro ao excluir produto', {
        description: error instanceof Error ? error.message : 'Tente novamente',
      });
    }
  };

  // Formulário de produto (reutilizável para criar/editar)
  const ProductForm = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <Label htmlFor="name">Nome do Produto *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Arroz Branco Tipo 1"
          />
        </div>

        <div>
          <Label htmlFor="brand">Marca</Label>
          <Input
            id="brand"
            value={formData.brand}
            onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
            placeholder="Bem Casado"
          />
        </div>

        <div>
          <Label htmlFor="category">Categoria</Label>
          <Input
            id="category"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            placeholder="Arroz, Feijão, etc"
          />
        </div>

        <div>
          <Label htmlFor="price">Preço (R$) *</Label>
          <Input
            id="price"
            type="number"
            step="0.01"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            placeholder="29.90"
          />
        </div>

        <div>
          <Label htmlFor="stock">Estoque *</Label>
          <Input
            id="stock"
            type="number"
            value={formData.stock}
            onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
            placeholder="100"
          />
        </div>

        <div>
          <Label htmlFor="unit">Unidade</Label>
          <Input
            id="unit"
            value={formData.unit}
            onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
            placeholder="un, kg, cx"
          />
        </div>

        <div>
          <Label htmlFor="ean13">Código de Barras (EAN-13)</Label>
          <Input
            ref={ean13InputRef}
            id="ean13"
            type="text"
            value={formData.ean13}
            onChange={(e) => setFormData({ ...formData, ean13: e.target.value })}
            placeholder="Escaneie ou digite o código..."
            className="font-mono text-lg"
            autoComplete="off"
            maxLength={13}
          />
          <p className="text-xs text-green-600 mt-1">
            ✅ Campo otimizado para leitor de código de barras - Clique e escaneie!
          </p>
        </div>

        <div>
          <Label htmlFor="active">Status</Label>
          <select
            id="active"
            value={formData.active}
            onChange={(e) => setFormData({ ...formData, active: parseInt(e.target.value) })}
            className="w-full px-3 py-2 border rounded-md"
          >
            <option value={1}>Ativo</option>
            <option value={0}>Inativo</option>
          </select>
        </div>

        <div className="col-span-2">
          <Label htmlFor="imageUrl">URL da Imagem</Label>
          <Input
            id="imageUrl"
            value={formData.imageUrl}
            onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
            placeholder="https://exemplo.com/imagem.jpg"
          />
        </div>

        <div className="col-span-2">
          <Label htmlFor="description">Descrição</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Descrição detalhada do produto..."
            rows={3}
          />
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Painel Administrativo</h1>
              <p className="text-gray-600 mt-1">Gerenciar produtos, preços e estoque</p>
            </div>
            <div className="flex gap-2">
              <Link href="/admin/dashboard">
                <Button variant="outline">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Dashboard
                </Button>
              </Link>
              <Link href="/admin/nfce">
                <Button variant="outline">
                  <FileText className="w-4 h-4 mr-2" />
                  Notas Fiscais
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="products" className="space-y-6">
          <TabsList>
            <TabsTrigger value="products">Produtos</TabsTrigger>
            <TabsTrigger value="quick">Entrada Rápida</TabsTrigger>
            <TabsTrigger value="nfe">Importar NF-e</TabsTrigger>
            <TabsTrigger value="adjustments">Ajustes</TabsTrigger>
            <TabsTrigger value="stock">Estoque</TabsTrigger>
            <TabsTrigger value="movements">Movimentações</TabsTrigger>
            <TabsTrigger value="stores">Filiais</TabsTrigger>
            <TabsTrigger value="notifications">Notificações</TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="space-y-6">
        {/* Estatísticas */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total de Produtos</CardTitle>
              <Package className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalProducts}</div>
              <p className="text-xs text-gray-500 mt-1">produtos cadastrados</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Valor em Estoque</CardTitle>
              <DollarSign className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                R$ {(totalValue / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-gray-500 mt-1">valor total do inventário</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Estoque Baixo</CardTitle>
              <TrendingUp className="h-4 w-4 text-orange-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{lowStockCount}</div>
              <p className="text-xs text-gray-500 mt-1">produtos com menos de 100 unidades</p>
            </CardContent>
          </Card>
        </div>

        {/* Ações e Busca */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <CardTitle>Produtos</CardTitle>
                <CardDescription>Gerenciar catálogo de produtos</CardDescription>
              </div>
              <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
                <DialogTrigger asChild>
                  <Button onClick={resetForm}>
                    <Plus className="h-4 w-4 mr-2" />
                    Novo Produto
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Criar Novo Produto</DialogTitle>
                    <DialogDescription>
                      Preencha os dados do novo produto
                    </DialogDescription>
                  </DialogHeader>
                  <ProductForm />
                  <div className="flex justify-end gap-2 mt-4">
                    <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={handleCreate} disabled={createMutation.isPending}>
                      {createMutation.isPending ? 'Criando...' : 'Criar Produto'}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por nome ou marca..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Tabela de Produtos */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Produto</TableHead>
                    <TableHead>Marca</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead className="text-right">Preço</TableHead>
                    <TableHead className="text-right">Estoque</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts?.map((product: any) => (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell>{product.brand || '-'}</TableCell>
                      <TableCell>{product.category || '-'}</TableCell>
                      <TableCell className="text-right">
                        R$ {(product.price / 100).toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right">
                        <span className={product.stock < 100 ? 'text-orange-600 font-semibold' : ''}>
                          {product.stock} {product.unit}
                        </span>
                      </TableCell>
                      <TableCell className="text-center">
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            product.active
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {product.active ? 'Ativo' : 'Inativo'}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(product)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(product.id, product.name)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {filteredProducts?.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Nenhum produto encontrado</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Dialog de Edição */}
         <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col">
            <DialogHeader>
              <DialogTitle>Editar Produto</DialogTitle>
              <DialogDescription>
                Atualize as informações do produto.
              </DialogDescription>
            </DialogHeader>
            <div className="overflow-y-auto flex-1 pr-2">
              <ProductForm />
            </div>
            <div className="flex justify-end gap-2 mt-4 pt-4 border-t">
              <Button variant="outline" onClick={() => setShowEditDialog(false)}>Cancelar</Button>
              <Button onClick={handleUpdate}>Salvar Alterações</Button>
            </div>
          </DialogContent>
        </Dialog>
        </TabsContent>

        <TabsContent value="quick">
          <AdminQuickStock />
        </TabsContent>

        <TabsContent value="nfe">
          <AdminNFe />
        </TabsContent>

        <TabsContent value="adjustments">
          <AdminAdjustments />
        </TabsContent>

        <TabsContent value="stock">
          <AdminStock />
        </TabsContent>

        <TabsContent value="movements">
          <AdminStockMovements />
        </TabsContent>

            <TabsContent value="stores">
              <AdminStores />
            </TabsContent>

            <TabsContent value="notifications">
              <AdminNotifications />
            </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

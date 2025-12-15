import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from 'sonner';
import { Search, Package, ArrowRightLeft, Settings, AlertTriangle } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';

export default function AdminStock() {
  const [selectedStoreId, setSelectedStoreId] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState('');
  const [editingStock, setEditingStock] = useState<any>(null);
  const [minStockValue, setMinStockValue] = useState('');

  // Queries
  // @ts-ignore
  const { data: stores } = trpc.system.getStores.useQuery();
  
  // Query de estoque por loja
  // @ts-ignore
  const { data: stockProducts, refetch } = trpc.stock.listByStore.useQuery(
    { storeId: parseInt(selectedStoreId) },
    { enabled: !!selectedStoreId }
  );
  
  // Mutation para atualizar configurações
  // @ts-ignore
  const updateSettingsMutation = trpc.stock.updateSettings.useMutation();

  const filteredProducts = stockProducts?.filter((product: any) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.brand?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEditSettings = (product: any) => {
    setEditingStock(product);
    setMinStockValue(product.minStock.toString());
  };

  const handleSaveSettings = async () => {
    if (!editingStock || !selectedStoreId) return;

    try {
      const minStock = parseInt(minStockValue);
      if (isNaN(minStock) || minStock < 0) {
        toast.error('Valor inválido', {
          description: 'O estoque mínimo deve ser um número positivo.',
        });
        return;
      }

      await updateSettingsMutation.mutateAsync({
        productId: editingStock.id,
        storeId: parseInt(selectedStoreId),
        minStock: minStock,
      });

      toast.success('Configurações atualizadas!');
      setEditingStock(null);
      refetch();
    } catch (error) {
      toast.error('Erro ao salvar', {
        description: 'Não foi possível atualizar as configurações.',
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        <div className="w-full md:w-64">
          <Label className="mb-2 block">Selecione a Loja</Label>
          <Select value={selectedStoreId} onValueChange={setSelectedStoreId}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione uma loja..." />
            </SelectTrigger>
            <SelectContent>
              {stores?.map((store: any) => (
                <SelectItem key={store.id} value={store.id.toString()}>
                  {store.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="relative w-full md:w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            placeholder="Buscar produtos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      {!selectedStoreId ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Package className="h-12 w-12 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900">Selecione uma loja</h3>
            <p className="text-gray-500 max-w-sm mt-2">
              Selecione uma loja acima para visualizar e gerenciar o estoque específico daquela unidade.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Estoque da Loja</CardTitle>
            <CardDescription>
              Gerencie a quantidade e configure alertas de estoque mínimo.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produto</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Estoque Atual</TableHead>
                  <TableHead>Estoque Mínimo</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts?.map((product: any) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-gray-500">{product.brand}</p>
                      </div>
                    </TableCell>
                    <TableCell>{product.category}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className={
                          product.quantity <= product.minStock && product.minStock > 0
                            ? 'text-red-600 font-bold flex items-center gap-1' 
                            : ''
                        }>
                          {product.quantity <= product.minStock && product.minStock > 0 && (
                            <AlertTriangle className="w-4 h-4" />
                          )}
                          {product.quantity} {product.unit}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-gray-500">{product.minStock}</span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Dialog open={editingStock?.id === product.id} onOpenChange={(open) => !open && setEditingStock(null)}>
                          <DialogTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleEditSettings(product)}
                            >
                              <Settings className="w-4 h-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Configurar Estoque</DialogTitle>
                              <DialogDescription>
                                Defina o nível mínimo de estoque para receber alertas.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="py-4">
                              <Label htmlFor="minStock">Estoque Mínimo</Label>
                              <Input
                                id="minStock"
                                type="number"
                                value={minStockValue}
                                onChange={(e) => setMinStockValue(e.target.value)}
                                placeholder="Ex: 10"
                                className="mt-2"
                              />
                              <p className="text-sm text-gray-500 mt-2">
                                Você será notificado quando o estoque desta loja atingir este valor.
                              </p>
                            </div>
                            <DialogFooter>
                              <Button variant="outline" onClick={() => setEditingStock(null)}>Cancelar</Button>
                              <Button onClick={handleSaveSettings}>Salvar</Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredProducts?.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                      Nenhum produto encontrado.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

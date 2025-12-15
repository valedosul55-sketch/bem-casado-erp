import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { ArrowUpCircle, ArrowDownCircle, RefreshCw, Package, Calendar, Filter } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';

export default function AdminStockMovements() {
  const [showEntryDialog, setShowEntryDialog] = useState(false);
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [showAdjustmentDialog, setShowAdjustmentDialog] = useState(false);
  
  // Filtros
  const [filterProductId, setFilterProductId] = useState<number | undefined>();
  const [filterStoreId, setFilterStoreId] = useState<number | undefined>();
  const [filterType, setFilterType] = useState<'entry' | 'exit' | 'adjustment' | undefined>();

  // Form states para entrada
  const [entryForm, setEntryForm] = useState({
    productId: '',
    storeId: '',
    quantity: '',
    unitCost: '',
    reason: '',
    notes: '',
  });

  // Form states para saída
  const [exitForm, setExitForm] = useState({
    productId: '',
    storeId: '',
    quantity: '',
    reason: '',
    notes: '',
  });

  // Form states para ajuste
  const [adjustmentForm, setAdjustmentForm] = useState({
    productId: '',
    storeId: '',
    quantity: '',
    reason: '',
    notes: '',
  });

  // Queries
  const { data: movements, refetch } = trpc.stockMovements.list.useQuery({
    productId: filterProductId,
    storeId: filterStoreId,
    movementType: filterType,
  });

  const { data: products } = trpc.products.list.useQuery();
  const { data: stores } = trpc.stock.listStores.useQuery();

  // Mutations
  const createMovement = trpc.stockMovements.create.useMutation();

  // Resetar formulários
  const resetEntryForm = () => {
    setEntryForm({
      productId: '',
      storeId: '',
      quantity: '',
      unitCost: '',
      reason: '',
      notes: '',
    });
  };

  const resetExitForm = () => {
    setExitForm({
      productId: '',
      storeId: '',
      quantity: '',
      reason: '',
      notes: '',
    });
  };

  const resetAdjustmentForm = () => {
    setAdjustmentForm({
      productId: '',
      storeId: '',
      quantity: '',
      reason: '',
      notes: '',
    });
  };

  // Criar entrada de estoque
  const handleCreateEntry = async () => {
    try {
      if (!entryForm.productId || !entryForm.quantity || !entryForm.reason) {
        toast.error('Preencha os campos obrigatórios');
        return;
      }

      await createMovement.mutateAsync({
        productId: parseInt(entryForm.productId),
        storeId: entryForm.storeId ? parseInt(entryForm.storeId) : undefined,
        movementType: 'entry',
        quantity: parseInt(entryForm.quantity),
        unitCost: entryForm.unitCost ? Math.round(parseFloat(entryForm.unitCost) * 100) : undefined,
        reason: entryForm.reason,
        notes: entryForm.notes || undefined,
      });

      toast.success('Entrada registrada com sucesso!');
      setShowEntryDialog(false);
      resetEntryForm();
      refetch();
    } catch (error) {
      toast.error('Erro ao registrar entrada', {
        description: error instanceof Error ? error.message : 'Tente novamente',
      });
    }
  };

  // Criar saída de estoque
  const handleCreateExit = async () => {
    try {
      if (!exitForm.productId || !exitForm.quantity || !exitForm.reason) {
        toast.error('Preencha os campos obrigatórios');
        return;
      }

      await createMovement.mutateAsync({
        productId: parseInt(exitForm.productId),
        storeId: exitForm.storeId ? parseInt(exitForm.storeId) : undefined,
        movementType: 'exit',
        quantity: parseInt(exitForm.quantity),
        reason: exitForm.reason,
        notes: exitForm.notes || undefined,
      });

      toast.success('Saída registrada com sucesso!');
      setShowExitDialog(false);
      resetExitForm();
      refetch();
    } catch (error) {
      toast.error('Erro ao registrar saída', {
        description: error instanceof Error ? error.message : 'Tente novamente',
      });
    }
  };

  // Criar ajuste de estoque
  const handleCreateAdjustment = async () => {
    try {
      if (!adjustmentForm.productId || !adjustmentForm.quantity || !adjustmentForm.reason) {
        toast.error('Preencha os campos obrigatórios');
        return;
      }

      await createMovement.mutateAsync({
        productId: parseInt(adjustmentForm.productId),
        storeId: adjustmentForm.storeId ? parseInt(adjustmentForm.storeId) : undefined,
        movementType: 'adjustment',
        quantity: parseInt(adjustmentForm.quantity), // Pode ser positivo ou negativo
        reason: adjustmentForm.reason,
        notes: adjustmentForm.notes || undefined,
      });

      toast.success('Ajuste registrado com sucesso!');
      setShowAdjustmentDialog(false);
      resetAdjustmentForm();
      refetch();
    } catch (error) {
      toast.error('Erro ao registrar ajuste', {
        description: error instanceof Error ? error.message : 'Tente novamente',
      });
    }
  };

  // Formatar data
  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleString('pt-BR');
  };

  // Formatar tipo de movimentação
  const formatMovementType = (type: string) => {
    const types: Record<string, string> = {
      entry: 'Entrada',
      exit: 'Saída',
      adjustment: 'Ajuste',
    };
    return types[type] || type;
  };

  // Cor do badge por tipo
  const getTypeBadgeColor = (type: string) => {
    const colors: Record<string, string> = {
      entry: 'bg-green-100 text-green-800',
      exit: 'bg-red-100 text-red-800',
      adjustment: 'bg-blue-100 text-blue-800',
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Movimentações de Estoque</h2>
          <p className="text-gray-600">Registre entradas, saídas e ajustes de estoque</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={showEntryDialog} onOpenChange={setShowEntryDialog}>
            <DialogTrigger asChild>
              <Button className="bg-green-600 hover:bg-green-700">
                <ArrowUpCircle className="w-4 h-4 mr-2" />
                Entrada
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Registrar Entrada de Estoque</DialogTitle>
                <DialogDescription>
                  Adicione produtos ao estoque (compra, devolução, etc.)
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="entry-product">Produto *</Label>
                  <select
                    id="entry-product"
                    value={entryForm.productId}
                    onChange={(e) => setEntryForm({ ...entryForm, productId: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="">Selecione um produto</option>
                    {products?.map((p: any) => (
                      <option key={p.id} value={p.id}>
                        {p.name} - {p.brand}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label htmlFor="entry-store">Loja</Label>
                  <select
                    id="entry-store"
                    value={entryForm.storeId}
                    onChange={(e) => setEntryForm({ ...entryForm, storeId: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="">Estoque geral</option>
                    {stores?.map((s: any) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label htmlFor="entry-quantity">Quantidade *</Label>
                  <Input
                    id="entry-quantity"
                    type="number"
                    value={entryForm.quantity}
                    onChange={(e) => setEntryForm({ ...entryForm, quantity: e.target.value })}
                    placeholder="100"
                  />
                </div>

                <div>
                  <Label htmlFor="entry-cost">Custo Unitário (R$)</Label>
                  <Input
                    id="entry-cost"
                    type="number"
                    step="0.01"
                    value={entryForm.unitCost}
                    onChange={(e) => setEntryForm({ ...entryForm, unitCost: e.target.value })}
                    placeholder="29.90"
                  />
                </div>

                <div>
                  <Label htmlFor="entry-reason">Motivo *</Label>
                  <select
                    id="entry-reason"
                    value={entryForm.reason}
                    onChange={(e) => setEntryForm({ ...entryForm, reason: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="">Selecione o motivo</option>
                    <option value="purchase">Compra de fornecedor</option>
                    <option value="return">Devolução de cliente</option>
                    <option value="transfer_in">Transferência entre filiais</option>
                    <option value="donation_received">Doação recebida</option>
                    <option value="other">Outro</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="entry-notes">Observações</Label>
                  <Textarea
                    id="entry-notes"
                    value={entryForm.notes}
                    onChange={(e) => setEntryForm({ ...entryForm, notes: e.target.value })}
                    placeholder="Informações adicionais..."
                    rows={3}
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowEntryDialog(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleCreateEntry} disabled={createMovement.isPending}>
                    {createMovement.isPending ? 'Salvando...' : 'Registrar Entrada'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={showExitDialog} onOpenChange={setShowExitDialog}>
            <DialogTrigger asChild>
              <Button className="bg-red-600 hover:bg-red-700">
                <ArrowDownCircle className="w-4 h-4 mr-2" />
                Saída
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Registrar Saída de Estoque</DialogTitle>
                <DialogDescription>
                  Remova produtos do estoque (venda, perda, doação, etc.)
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="exit-product">Produto *</Label>
                  <select
                    id="exit-product"
                    value={exitForm.productId}
                    onChange={(e) => setExitForm({ ...exitForm, productId: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="">Selecione um produto</option>
                    {products?.map((p: any) => (
                      <option key={p.id} value={p.id}>
                        {p.name} - {p.brand}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label htmlFor="exit-store">Loja</Label>
                  <select
                    id="exit-store"
                    value={exitForm.storeId}
                    onChange={(e) => setExitForm({ ...exitForm, storeId: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="">Estoque geral</option>
                    {stores?.map((s: any) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label htmlFor="exit-quantity">Quantidade *</Label>
                  <Input
                    id="exit-quantity"
                    type="number"
                    value={exitForm.quantity}
                    onChange={(e) => setExitForm({ ...exitForm, quantity: e.target.value })}
                    placeholder="50"
                  />
                </div>

                <div>
                  <Label htmlFor="exit-reason">Motivo *</Label>
                  <select
                    id="exit-reason"
                    value={exitForm.reason}
                    onChange={(e) => setExitForm({ ...exitForm, reason: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="">Selecione o motivo</option>
                    <option value="sale">Venda</option>
                    <option value="loss">Perda/Quebra</option>
                    <option value="donation">Doação</option>
                    <option value="transfer_out">Transferência entre filiais</option>
                    <option value="expired">Produto vencido</option>
                    <option value="other">Outro</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="exit-notes">Observações</Label>
                  <Textarea
                    id="exit-notes"
                    value={exitForm.notes}
                    onChange={(e) => setExitForm({ ...exitForm, notes: e.target.value })}
                    placeholder="Informações adicionais..."
                    rows={3}
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowExitDialog(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleCreateExit} disabled={createMovement.isPending}>
                    {createMovement.isPending ? 'Salvando...' : 'Registrar Saída'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={showAdjustmentDialog} onOpenChange={setShowAdjustmentDialog}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <RefreshCw className="w-4 h-4 mr-2" />
                Ajuste
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Ajuste de Estoque</DialogTitle>
                <DialogDescription>
                  Corrija divergências no estoque (use valores positivos para adicionar ou negativos para remover)
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="adj-product">Produto *</Label>
                  <select
                    id="adj-product"
                    value={adjustmentForm.productId}
                    onChange={(e) => setAdjustmentForm({ ...adjustmentForm, productId: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="">Selecione um produto</option>
                    {products?.map((p: any) => (
                      <option key={p.id} value={p.id}>
                        {p.name} - {p.brand}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label htmlFor="adj-store">Loja</Label>
                  <select
                    id="adj-store"
                    value={adjustmentForm.storeId}
                    onChange={(e) => setAdjustmentForm({ ...adjustmentForm, storeId: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="">Estoque geral</option>
                    {stores?.map((s: any) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label htmlFor="adj-quantity">Quantidade de Ajuste *</Label>
                  <Input
                    id="adj-quantity"
                    type="number"
                    value={adjustmentForm.quantity}
                    onChange={(e) => setAdjustmentForm({ ...adjustmentForm, quantity: e.target.value })}
                    placeholder="+10 ou -5"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Use valores positivos (+) para adicionar ou negativos (-) para remover
                  </p>
                </div>

                <div>
                  <Label htmlFor="adj-reason">Motivo *</Label>
                  <select
                    id="adj-reason"
                    value={adjustmentForm.reason}
                    onChange={(e) => setAdjustmentForm({ ...adjustmentForm, reason: e.target.value })}
                    className="w-full px-3 py-2 border rounded-md"
                  >
                    <option value="">Selecione o motivo</option>
                    <option value="inventory_count">Contagem de inventário</option>
                    <option value="system_error">Correção de erro do sistema</option>
                    <option value="found_items">Produtos encontrados</option>
                    <option value="missing_items">Produtos faltantes</option>
                    <option value="other">Outro</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="adj-notes">Observações</Label>
                  <Textarea
                    id="adj-notes"
                    value={adjustmentForm.notes}
                    onChange={(e) => setAdjustmentForm({ ...adjustmentForm, notes: e.target.value })}
                    placeholder="Informações adicionais..."
                    rows={3}
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowAdjustmentDialog(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleCreateAdjustment} disabled={createMovement.isPending}>
                    {createMovement.isPending ? 'Salvando...' : 'Registrar Ajuste'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>Produto</Label>
              <select
                value={filterProductId || ''}
                onChange={(e) => setFilterProductId(e.target.value ? parseInt(e.target.value) : undefined)}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="">Todos os produtos</option>
                {products?.map((p: any) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label>Loja</Label>
              <select
                value={filterStoreId || ''}
                onChange={(e) => setFilterStoreId(e.target.value ? parseInt(e.target.value) : undefined)}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="">Todas as lojas</option>
                {stores?.map((s: any) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label>Tipo</Label>
              <select
                value={filterType || ''}
                onChange={(e) => setFilterType(e.target.value as any || undefined)}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="">Todos os tipos</option>
                <option value="entry">Entrada</option>
                <option value="exit">Saída</option>
                <option value="adjustment">Ajuste</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabela de Movimentações */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Histórico de Movimentações
          </CardTitle>
          <CardDescription>
            Últimas 100 movimentações de estoque
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data/Hora</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Produto</TableHead>
                  <TableHead>Loja</TableHead>
                  <TableHead>Quantidade</TableHead>
                  <TableHead>Motivo</TableHead>
                  <TableHead>Observações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {movements && movements.length > 0 ? (
                  movements.map((mov: any) => (
                    <TableRow key={mov.id}>
                      <TableCell className="text-sm">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          {formatDate(mov.createdAt)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeBadgeColor(mov.movementType)}`}>
                          {formatMovementType(mov.movementType)}
                        </span>
                      </TableCell>
                      <TableCell className="font-medium">{mov.productName}</TableCell>
                      <TableCell>{mov.storeName || 'Geral'}</TableCell>
                      <TableCell>
                        <span className={mov.quantity > 0 ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
                          {mov.quantity > 0 ? '+' : ''}{mov.quantity}
                        </span>
                      </TableCell>
                      <TableCell>{mov.reason}</TableCell>
                      <TableCell className="text-sm text-gray-600">{mov.notes || '-'}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-gray-500 py-8">
                      Nenhuma movimentação encontrada
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

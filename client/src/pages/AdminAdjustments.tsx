import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { 
  Plus, 
  Minus, 
  AlertTriangle, 
  CheckCircle, 
  Search,
  Filter,
  Download
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

// Motivos de ajuste
const ADJUSTMENT_REASONS = {
  inventory: 'Inventário/Contagem Física',
  loss: 'Perda/Extravio',
  damage: 'Dano/Avaria',
  expiry: 'Vencimento',
  return: 'Devolução de Cliente',
  correction: 'Correção de Erro',
  transfer: 'Transferência entre Lojas',
  sample: 'Amostra Grátis',
  theft: 'Furto/Roubo',
  other: 'Outro Motivo',
};

export default function AdminAdjustments() {
  // Estados do formulário
  const [searchProduct, setSearchProduct] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [adjustmentType, setAdjustmentType] = useState<'positive' | 'negative'>('positive');
  const [quantity, setQuantity] = useState('');
  const [reason, setReason] = useState('');
  const [notes, setNotes] = useState('');
  const [unitCost, setUnitCost] = useState('');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  // Estados de filtros do histórico
  const [filterReason, setFilterReason] = useState('');
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');

  // Queries
  const { data: products } = trpc.products.list.useQuery();
  const { data: adjustmentsData, refetch: refetchAdjustments } = trpc.adjustments.list.useQuery({
    reason: filterReason || undefined,
    startDate: filterStartDate ? new Date(filterStartDate) : undefined,
    endDate: filterEndDate ? new Date(filterEndDate) : undefined,
    limit: 100,
  });
  const { data: stats } = trpc.adjustments.stats.useQuery({});

  // Mutations
  const createAdjustmentMutation = trpc.adjustments.create.useMutation();

  // Filtrar produtos pela busca
  const filteredProducts = products?.filter((p: any) =>
    p.name.toLowerCase().includes(searchProduct.toLowerCase()) ||
    p.brand?.toLowerCase().includes(searchProduct.toLowerCase()) ||
    p.ean13?.includes(searchProduct)
  );

  // Selecionar produto
  const handleSelectProduct = (product: any) => {
    setSelectedProduct(product);
    setSearchProduct('');
  };

  // Validar e preparar ajuste
  const handlePrepareAdjustment = () => {
    if (!selectedProduct) {
      toast.error('Selecione um produto');
      return;
    }

    if (!quantity || parseInt(quantity) === 0) {
      toast.error('Informe a quantidade');
      return;
    }

    if (!reason) {
      toast.error('Selecione o motivo do ajuste');
      return;
    }

    if (!notes.trim()) {
      toast.error('Adicione observações sobre o ajuste');
      return;
    }

    // Verificar se é ajuste grande
    const qtd = parseInt(quantity);
    const estoqueAtual = selectedProduct.stock || 0;

    if (adjustmentType === 'negative' && qtd > estoqueAtual) {
      toast.error(`Estoque insuficiente. Disponível: ${estoqueAtual}`);
      return;
    }

    const percentual = (qtd / estoqueAtual) * 100;
    if (percentual > 10) {
      setShowConfirmDialog(true);
    } else {
      handleSubmitAdjustment();
    }
  };

  // Submeter ajuste
  const handleSubmitAdjustment = async () => {
    setShowConfirmDialog(false);

    try {
      const qtd = parseInt(quantity);
      const finalQuantity = adjustmentType === 'positive' ? qtd : -qtd;

      const result = await createAdjustmentMutation.mutateAsync({
        productId: selectedProduct.id,
        quantity: finalQuantity,
        reason: reason as any,
        notes: notes.trim(),
        unitCost: unitCost ? Math.round(parseFloat(unitCost) * 100) : undefined,
      });

      toast.success('Ajuste registrado com sucesso!', {
        description: result.message,
        duration: 5000,
      });

      // Limpar formulário
      setSelectedProduct(null);
      setQuantity('');
      setReason('');
      setNotes('');
      setUnitCost('');

      // Atualizar histórico
      refetchAdjustments();
    } catch (error) {
      toast.error('Erro ao registrar ajuste', {
        description: (error as Error).message,
      });
    }
  };

  // Exportar relatório
  const handleExportReport = () => {
    if (!adjustmentsData?.adjustments) return;

    const csv = [
      ['Data', 'Produto', 'Quantidade', 'Motivo', 'Observações'].join(','),
      ...adjustmentsData.adjustments.map((adj: any) =>
        [
          new Date(adj.createdAt).toLocaleString('pt-BR'),
          adj.productName,
          adj.quantity,
          ADJUSTMENT_REASONS[adj.reason as keyof typeof ADJUSTMENT_REASONS] || adj.reason,
          `"${adj.notes?.replace(/"/g, '""') || ''}"`,
        ].join(',')
      ),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `ajustes-estoque-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();

    toast.success('Relatório exportado com sucesso!');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Ajustes Manuais de Estoque</h2>
        <p className="text-gray-600 mt-1">
          Registre ajustes de estoque com rastreabilidade completa
        </p>
      </div>

      {/* Estatísticas */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                Total de Ajustes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalAdjustments}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                Ajustes Positivos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                +{stats.positiveAdjustments.totalQuantity}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {stats.positiveAdjustments.count} operações
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                Ajustes Negativos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                -{stats.negativeAdjustments.totalQuantity}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {stats.negativeAdjustments.count} operações
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Formulário de Ajuste */}
      <Card>
        <CardHeader>
          <CardTitle>Novo Ajuste</CardTitle>
          <CardDescription>
            Registre entrada ou saída manual de estoque
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Tipo de Ajuste */}
          <div className="flex gap-4">
            <Button
              variant={adjustmentType === 'positive' ? 'default' : 'outline'}
              onClick={() => setAdjustmentType('positive')}
              className="flex-1"
            >
              <Plus className="w-4 h-4 mr-2" />
              Entrada (+)
            </Button>
            <Button
              variant={adjustmentType === 'negative' ? 'default' : 'outline'}
              onClick={() => setAdjustmentType('negative')}
              className="flex-1"
            >
              <Minus className="w-4 h-4 mr-2" />
              Saída (-)
            </Button>
          </div>

          {/* Busca de Produto */}
          <div>
            <Label>Produto</Label>
            {selectedProduct ? (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertTitle>{selectedProduct.name}</AlertTitle>
                <AlertDescription>
                  Estoque atual: {selectedProduct.stock} {selectedProduct.unit}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedProduct(null)}
                    className="ml-2"
                  >
                    Alterar
                  </Button>
                </AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-2">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Buscar por nome, marca ou código de barras..."
                    value={searchProduct}
                    onChange={(e) => setSearchProduct(e.target.value)}
                    className="pl-10"
                  />
                </div>
                {searchProduct && filteredProducts && filteredProducts.length > 0 && (
                  <div className="border rounded-lg max-h-60 overflow-y-auto">
                    {filteredProducts.slice(0, 10).map((product: any) => (
                      <button
                        key={product.id}
                        onClick={() => handleSelectProduct(product)}
                        className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b last:border-b-0"
                      >
                        <div className="font-medium">{product.name}</div>
                        <div className="text-sm text-gray-500">
                          Estoque: {product.stock} {product.unit} | EAN: {product.ean13 || 'N/A'}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Quantidade */}
          <div>
            <Label htmlFor="quantity">Quantidade</Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="Digite a quantidade"
            />
          </div>

          {/* Custo Unitário (apenas para entradas) */}
          {adjustmentType === 'positive' && (
            <div>
              <Label htmlFor="unitCost">Custo Unitário (R$) - Opcional</Label>
              <Input
                id="unitCost"
                type="number"
                step="0.01"
                min="0"
                value={unitCost}
                onChange={(e) => setUnitCost(e.target.value)}
                placeholder="0.00"
              />
              <p className="text-xs text-gray-500 mt-1">
                Informe o custo para atualizar o custo médio ponderado
              </p>
            </div>
          )}

          {/* Motivo */}
          <div>
            <Label htmlFor="reason">Motivo do Ajuste</Label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o motivo" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(ADJUSTMENT_REASONS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Observações */}
          <div>
            <Label htmlFor="notes">Observações *</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Descreva o motivo do ajuste em detalhes..."
              rows={3}
              maxLength={1000}
            />
            <p className="text-xs text-gray-500 mt-1">
              {notes.length}/1000 caracteres
            </p>
          </div>

          {/* Botão de Submissão */}
          <Button
            onClick={handlePrepareAdjustment}
            disabled={createAdjustmentMutation.isPending}
            className="w-full"
          >
            {createAdjustmentMutation.isPending ? 'Registrando...' : 'Registrar Ajuste'}
          </Button>
        </CardContent>
      </Card>

      {/* Histórico de Ajustes */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Histórico de Ajustes</CardTitle>
              <CardDescription>
                {adjustmentsData?.total || 0} ajustes registrados
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportReport}
              disabled={!adjustmentsData?.adjustments?.length}
            >
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filtros */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <Label htmlFor="filterReason">Motivo</Label>
              <Select value={filterReason} onValueChange={setFilterReason}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os motivos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos os motivos</SelectItem>
                  {Object.entries(ADJUSTMENT_REASONS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="filterStartDate">Data Inicial</Label>
              <Input
                id="filterStartDate"
                type="date"
                value={filterStartDate}
                onChange={(e) => setFilterStartDate(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="filterEndDate">Data Final</Label>
              <Input
                id="filterEndDate"
                type="date"
                value={filterEndDate}
                onChange={(e) => setFilterEndDate(e.target.value)}
              />
            </div>
          </div>

          {/* Tabela */}
          <div className="border rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Data
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Produto
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Quantidade
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Motivo
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Observações
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {adjustmentsData?.adjustments?.map((adjustment: any) => (
                    <tr key={adjustment.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {new Date(adjustment.createdAt).toLocaleString('pt-BR')}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {adjustment.productName}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span
                          className={`font-medium ${
                            adjustment.quantity > 0 ? 'text-green-600' : 'text-red-600'
                          }`}
                        >
                          {adjustment.quantity > 0 ? '+' : ''}
                          {adjustment.quantity}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {ADJUSTMENT_REASONS[adjustment.reason as keyof typeof ADJUSTMENT_REASONS] ||
                          adjustment.reason}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-500">
                        {adjustment.notes}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {!adjustmentsData?.adjustments?.length && (
              <div className="text-center py-12 text-gray-500">
                Nenhum ajuste registrado
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Dialog de Confirmação */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-500" />
              Confirmar Ajuste Grande
            </DialogTitle>
            <DialogDescription>
              Este ajuste representa mais de 10% do estoque atual do produto.
              <br />
              <br />
              <strong>Produto:</strong> {selectedProduct?.name}
              <br />
              <strong>Estoque Atual:</strong> {selectedProduct?.stock}
              <br />
              <strong>Quantidade do Ajuste:</strong> {adjustmentType === 'positive' ? '+' : '-'}
              {quantity}
              <br />
              <br />
              Deseja continuar?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSubmitAdjustment}>Confirmar Ajuste</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

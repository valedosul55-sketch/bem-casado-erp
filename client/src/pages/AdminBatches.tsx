/**
 * Página de Gestão de Lotes e Validade
 * 
 * Interface administrativa para controle de lotes:
 * - Listagem de lotes com filtros
 * - Criação e edição de lotes
 * - Alertas de validade
 * - FIFO automático
 * - Rastreabilidade
 */

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Package, 
  Plus, 
  AlertTriangle, 
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  TrendingDown
} from "lucide-react";
import { toast } from "sonner";

export default function AdminBatches() {
  // Estados
  const [selectedStore, setSelectedStore] = useState<string>("all");
  const [selectedProduct, setSelectedProduct] = useState<string>("all");
  const [onlyActive, setOnlyActive] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // Form states para criar lote
  const [newBatch, setNewBatch] = useState({
    productId: "",
    storeId: "",
    batchNumber: "",
    quantity: "",
    unitCost: "",
    entryDate: new Date().toISOString().split("T")[0],
    expiryDate: "",
    supplier: "",
    notes: "",
  });

  // Queries
  const { data: stores } = trpc.reports.listStores.useQuery();
  const { data: products } = trpc.products.listActive.useQuery();

  // Listar lotes
  const { data: batches, refetch: refetchBatches } = trpc.batches.list.useQuery({
    storeId: selectedStore !== "all" ? Number(selectedStore) : undefined,
    productId: selectedProduct !== "all" ? Number(selectedProduct) : undefined,
    onlyActive,
  });

  // Alertas de validade
  const { data: alerts } = trpc.batches.expiryAlerts.useQuery({
    storeId: selectedStore !== "all" ? Number(selectedStore) : undefined,
    daysThreshold: 30,
  });

  // Mutations
  const createBatchMutation = trpc.batches.create.useMutation({
    onSuccess: () => {
      toast.success("Lote criado com sucesso!");
      setIsCreateDialogOpen(false);
      resetForm();
      refetchBatches();
    },
    onError: (error) => {
      toast.error(`Erro ao criar lote: ${error.message}`);
    },
  });

  const resetForm = () => {
    setNewBatch({
      productId: "",
      storeId: "",
      batchNumber: "",
      quantity: "",
      unitCost: "",
      entryDate: new Date().toISOString().split("T")[0],
      expiryDate: "",
      supplier: "",
      notes: "",
    });
  };

  const handleCreateBatch = () => {
    if (!newBatch.productId || !newBatch.storeId || !newBatch.batchNumber || !newBatch.quantity || !newBatch.unitCost) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    createBatchMutation.mutate({
      productId: Number(newBatch.productId),
      storeId: Number(newBatch.storeId),
      batchNumber: newBatch.batchNumber,
      quantity: Number(newBatch.quantity),
      unitCost: Number(newBatch.unitCost) * 100, // Converter para centavos
      entryDate: newBatch.entryDate,
      expiryDate: newBatch.expiryDate || undefined,
      supplier: newBatch.supplier || undefined,
      notes: newBatch.notes || undefined,
    });
  };

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(cents / 100);
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("pt-BR");
  };

  const getStatusBadge = (status: string, daysToExpiry?: number | null) => {
    switch (status) {
      case "expired":
        return <Badge variant="destructive" className="flex items-center gap-1">
          <XCircle className="h-3 w-3" />
          Vencido
        </Badge>;
      case "expiring":
        return <Badge variant="default" className="bg-orange-500 flex items-center gap-1">
          <AlertTriangle className="h-3 w-3" />
          Vence em {daysToExpiry} dias
        </Badge>;
      case "depleted":
        return <Badge variant="secondary" className="flex items-center gap-1">
          <TrendingDown className="h-3 w-3" />
          Esgotado
        </Badge>;
      default:
        return <Badge variant="default" className="bg-green-500 flex items-center gap-1">
          <CheckCircle className="h-3 w-3" />
          Ativo
        </Badge>;
    }
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestão de Lotes e Validade</h1>
          <p className="text-muted-foreground">
            Controle de lotes com FIFO e alertas de vencimento
          </p>
        </div>
        <Package className="h-8 w-8 text-muted-foreground" />
      </div>

      {/* Alertas de Validade */}
      {alerts && alerts.stats.total > 0 && (
        <Card className="border-orange-200 bg-orange-50 dark:bg-orange-900/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-900 dark:text-orange-100">
              <AlertTriangle className="h-5 w-5" />
              Alertas de Validade
            </CardTitle>
            <CardDescription className="text-orange-800 dark:text-orange-200">
              {alerts.stats.expired} vencidos • {alerts.stats.expiringSoon} vencem em 7 dias • {alerts.stats.expiringLater} vencem em 30 dias
            </CardDescription>
          </CardHeader>
        </Card>
      )}

      {/* Filtros e Ações */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Filtros</CardTitle>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Lote
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Criar Novo Lote</DialogTitle>
                  <DialogDescription>
                    Registre um novo lote de produto com controle de validade
                  </DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-4">
                  {/* Produto */}
                  <div className="space-y-2">
                    <Label>Produto *</Label>
                    <Select value={newBatch.productId} onValueChange={(v) => setNewBatch({ ...newBatch, productId: v })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o produto" />
                      </SelectTrigger>
                      <SelectContent>
                        {products?.map((p: any) => (
                          <SelectItem key={p.id} value={p.id.toString()}>
                            {p.name} - {p.brand}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Loja */}
                  <div className="space-y-2">
                    <Label>Loja *</Label>
                    <Select value={newBatch.storeId} onValueChange={(v) => setNewBatch({ ...newBatch, storeId: v })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a loja" />
                      </SelectTrigger>
                      <SelectContent>
                        {stores?.map((s) => (
                          <SelectItem key={s.id} value={s.id.toString()}>
                            {s.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Número do Lote */}
                  <div className="space-y-2">
                    <Label>Número do Lote *</Label>
                    <Input
                      placeholder="Ex: LOTE-2024-001"
                      value={newBatch.batchNumber}
                      onChange={(e) => setNewBatch({ ...newBatch, batchNumber: e.target.value })}
                    />
                  </div>

                  {/* Quantidade */}
                  <div className="space-y-2">
                    <Label>Quantidade *</Label>
                    <Input
                      type="number"
                      min="1"
                      placeholder="Ex: 100"
                      value={newBatch.quantity}
                      onChange={(e) => setNewBatch({ ...newBatch, quantity: e.target.value })}
                    />
                  </div>

                  {/* Custo Unitário */}
                  <div className="space-y-2">
                    <Label>Custo Unitário (R$) *</Label>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="Ex: 12.50"
                      value={newBatch.unitCost}
                      onChange={(e) => setNewBatch({ ...newBatch, unitCost: e.target.value })}
                    />
                  </div>

                  {/* Data de Entrada */}
                  <div className="space-y-2">
                    <Label>Data de Entrada *</Label>
                    <Input
                      type="date"
                      value={newBatch.entryDate}
                      onChange={(e) => setNewBatch({ ...newBatch, entryDate: e.target.value })}
                    />
                  </div>

                  {/* Data de Validade */}
                  <div className="space-y-2">
                    <Label>Data de Validade</Label>
                    <Input
                      type="date"
                      value={newBatch.expiryDate}
                      onChange={(e) => setNewBatch({ ...newBatch, expiryDate: e.target.value })}
                    />
                  </div>

                  {/* Fornecedor */}
                  <div className="space-y-2">
                    <Label>Fornecedor</Label>
                    <Input
                      placeholder="Ex: Fornecedor XYZ"
                      value={newBatch.supplier}
                      onChange={(e) => setNewBatch({ ...newBatch, supplier: e.target.value })}
                    />
                  </div>

                  {/* Observações */}
                  <div className="space-y-2 col-span-2">
                    <Label>Observações</Label>
                    <Input
                      placeholder="Observações adicionais"
                      value={newBatch.notes}
                      onChange={(e) => setNewBatch({ ...newBatch, notes: e.target.value })}
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 mt-4">
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={handleCreateBatch} disabled={createBatchMutation.isPending}>
                    {createBatchMutation.isPending ? "Criando..." : "Criar Lote"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Filtro de Loja */}
            <div className="space-y-2">
              <Label>Loja</Label>
              <Select value={selectedStore} onValueChange={setSelectedStore}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas as lojas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as lojas</SelectItem>
                  {stores?.map((store) => (
                    <SelectItem key={store.id} value={store.id.toString()}>
                      {store.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Filtro de Produto */}
            <div className="space-y-2">
              <Label>Produto</Label>
              <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os produtos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os produtos</SelectItem>
                  {products?.map((product: any) => (
                    <SelectItem key={product.id} value={product.id.toString()}>
                      {product.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Filtro Apenas Ativos */}
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={onlyActive ? "active" : "all"} onValueChange={(v) => setOnlyActive(v === "active")}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os lotes</SelectItem>
                  <SelectItem value="active">Apenas ativos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">Todos os Lotes</TabsTrigger>
          <TabsTrigger value="alerts">Alertas de Validade</TabsTrigger>
        </TabsList>

        {/* Tab: Todos os Lotes */}
        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle>Lotes Cadastrados</CardTitle>
              <CardDescription>
                {batches?.length || 0} lotes encontrados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Lote</th>
                      <th className="text-left p-2">Produto</th>
                      <th className="text-left p-2">Loja</th>
                      <th className="text-right p-2">Qtd Atual</th>
                      <th className="text-right p-2">Qtd Inicial</th>
                      <th className="text-right p-2">Custo Unit.</th>
                      <th className="text-center p-2">Entrada</th>
                      <th className="text-center p-2">Validade</th>
                      <th className="text-center p-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {batches?.map((batch) => (
                      <tr key={batch.id} className="border-b hover:bg-muted/50">
                        <td className="p-2 font-mono text-sm">{batch.batchNumber}</td>
                        <td className="p-2">
                          <div>
                            <div className="font-medium">{batch.productName}</div>
                            <div className="text-sm text-muted-foreground">{batch.productBrand}</div>
                          </div>
                        </td>
                        <td className="p-2">{batch.storeName}</td>
                        <td className="text-right p-2 font-mono">{batch.quantity}</td>
                        <td className="text-right p-2 font-mono text-muted-foreground">{batch.initialQuantity}</td>
                        <td className="text-right p-2">{formatCurrency(batch.unitCost)}</td>
                        <td className="text-center p-2 text-sm">{formatDate(batch.entryDate)}</td>
                        <td className="text-center p-2 text-sm">
                          {batch.expiryDate ? (
                            <div className="flex items-center justify-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {formatDate(batch.expiryDate)}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </td>
                        <td className="text-center p-2">
                          {getStatusBadge(batch.status, batch.daysToExpiry)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Alertas */}
        <TabsContent value="alerts">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                Alertas de Validade
              </CardTitle>
              <CardDescription>
                Lotes vencidos ou próximos ao vencimento
              </CardDescription>
            </CardHeader>
            <CardContent>
              {alerts && alerts.batches.length > 0 ? (
                <div className="space-y-4">
                  {/* Lotes Vencidos */}
                  {alerts.batches.filter((b) => b.isExpired).length > 0 && (
                    <div>
                      <h3 className="font-medium text-destructive mb-2 flex items-center gap-2">
                        <XCircle className="h-4 w-4" />
                        Vencidos ({alerts.batches.filter((b) => b.isExpired).length})
                      </h3>
                      <div className="space-y-2">
                        {alerts.batches
                          .filter((b) => b.isExpired)
                          .map((batch) => (
                            <div key={batch.id} className="border border-red-200 bg-red-50 dark:bg-red-900/20 rounded-lg p-3">
                              <div className="flex items-center justify-between">
                                <div>
                                  <div className="font-medium">{batch.productName}</div>
                                  <div className="text-sm text-muted-foreground">
                                    Lote: {batch.batchNumber} • {batch.storeName} • {batch.quantity} unidades
                                  </div>
                                </div>
                                <Badge variant="destructive">
                                  Vencido há {Math.abs(batch.daysToExpiry!)} dias
                                </Badge>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* Vencem em 7 dias */}
                  {alerts.batches.filter((b) => !b.isExpired && b.daysToExpiry! <= 7).length > 0 && (
                    <div>
                      <h3 className="font-medium text-orange-600 mb-2 flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4" />
                        Vencem em 7 dias ({alerts.batches.filter((b) => !b.isExpired && b.daysToExpiry! <= 7).length})
                      </h3>
                      <div className="space-y-2">
                        {alerts.batches
                          .filter((b) => !b.isExpired && b.daysToExpiry! <= 7)
                          .map((batch) => (
                            <div key={batch.id} className="border border-orange-200 bg-orange-50 dark:bg-orange-900/20 rounded-lg p-3">
                              <div className="flex items-center justify-between">
                                <div>
                                  <div className="font-medium">{batch.productName}</div>
                                  <div className="text-sm text-muted-foreground">
                                    Lote: {batch.batchNumber} • {batch.storeName} • {batch.quantity} unidades
                                  </div>
                                </div>
                                <Badge className="bg-orange-500">
                                  {batch.daysToExpiry} dias
                                </Badge>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* Vencem em 30 dias */}
                  {alerts.batches.filter((b) => !b.isExpired && b.daysToExpiry! > 7).length > 0 && (
                    <div>
                      <h3 className="font-medium text-yellow-600 mb-2 flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Vencem em 30 dias ({alerts.batches.filter((b) => !b.isExpired && b.daysToExpiry! > 7).length})
                      </h3>
                      <div className="space-y-2">
                        {alerts.batches
                          .filter((b) => !b.isExpired && b.daysToExpiry! > 7)
                          .map((batch) => (
                            <div key={batch.id} className="border border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-3">
                              <div className="flex items-center justify-between">
                                <div>
                                  <div className="font-medium">{batch.productName}</div>
                                  <div className="text-sm text-muted-foreground">
                                    Lote: {batch.batchNumber} • {batch.storeName} • {batch.quantity} unidades
                                  </div>
                                </div>
                                <Badge variant="secondary">
                                  {batch.daysToExpiry} dias
                                </Badge>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhum alerta de validade! 🎉</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

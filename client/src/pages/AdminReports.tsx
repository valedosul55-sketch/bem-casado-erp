/**
 * Página de Relatórios de Estoque
 * 
 * Interface administrativa para visualização de relatórios gerenciais:
 * - Posição de estoque
 * - Movimentações
 * - Produtos com estoque baixo
 * - Custo médio e margem
 * - Gráficos de evolução
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
import { 
  FileText, 
  Download, 
  TrendingUp, 
  TrendingDown, 
  Package, 
  AlertTriangle,
  DollarSign,
  BarChart3,
  Calendar,
  Filter
} from "lucide-react";
import { toast } from "sonner";

export default function AdminReports() {
  // Estados para filtros
  const [selectedStore, setSelectedStore] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [activeTab, setActiveTab] = useState("position");

  // Queries
  const { data: stores } = trpc.reports.listStores.useQuery();
  const { data: categories } = trpc.reports.listCategories.useQuery();

  // Relatório de Posição de Estoque
  const { data: stockPosition, isLoading: loadingPosition } = trpc.reports.stockPosition.useQuery({
    storeId: selectedStore !== "all" ? Number(selectedStore) : undefined,
    category: selectedCategory !== "all" ? selectedCategory : undefined,
  });

  // Relatório de Produtos com Estoque Baixo
  const { data: lowStock, isLoading: loadingLowStock } = trpc.reports.lowStockProducts.useQuery({
    storeId: selectedStore !== "all" ? Number(selectedStore) : undefined,
  });

  // Relatório de Custo Médio
  const { data: avgCost, isLoading: loadingAvgCost } = trpc.reports.averageCostReport.useQuery({
    storeId: selectedStore !== "all" ? Number(selectedStore) : undefined,
    category: selectedCategory !== "all" ? selectedCategory : undefined,
  });

  // Relatório de Movimentações
  const { data: movements, isLoading: loadingMovements } = trpc.reports.stockMovements.useQuery({
    startDate: startDate || undefined,
    endDate: endDate || undefined,
    storeId: selectedStore !== "all" ? Number(selectedStore) : undefined,
    limit: 100,
  });

  // Top Produtos
  const { data: topProducts } = trpc.reports.topMovedProducts.useQuery({
    startDate: startDate || undefined,
    endDate: endDate || undefined,
    storeId: selectedStore !== "all" ? Number(selectedStore) : undefined,
    limit: 10,
  });

  // Evolução de Estoque (para gráfico)
  const { data: evolution } = trpc.reports.stockEvolution.useQuery(
    {
      startDate: startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      endDate: endDate || new Date().toISOString(),
      storeId: selectedStore !== "all" ? Number(selectedStore) : undefined,
    },
    {
      enabled: !!startDate || !!endDate,
    }
  );

  // Funções de exportação
  const handleExportCSV = (data: any[], filename: string) => {
    if (!data || data.length === 0) {
      toast.error("Nenhum dado para exportar");
      return;
    }

    // Converter para CSV
    const headers = Object.keys(data[0]).join(",");
    const rows = data.map((row) =>
      Object.values(row)
        .map((val) => `"${val}"`)
        .join(",")
    );
    const csv = [headers, ...rows].join("\n");

    // Download
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();

    toast.success("Relatório exportado com sucesso!");
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

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Relatórios de Estoque</h1>
          <p className="text-muted-foreground">
            Análises gerenciais e indicadores de desempenho
          </p>
        </div>
        <FileText className="h-8 w-8 text-muted-foreground" />
      </div>

      {/* Filtros Globais */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                      {store.name} - {store.city}/{store.state}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Filtro de Categoria */}
            <div className="space-y-2">
              <Label>Categoria</Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas as categorias" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as categorias</SelectItem>
                  {categories?.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Data Inicial */}
            <div className="space-y-2">
              <Label>Data Inicial</Label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            {/* Data Final */}
            <div className="space-y-2">
              <Label>Data Final</Label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs de Relatórios */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="position">Posição</TabsTrigger>
          <TabsTrigger value="movements">Movimentações</TabsTrigger>
          <TabsTrigger value="lowstock">Estoque Baixo</TabsTrigger>
          <TabsTrigger value="avgcost">Custo Médio</TabsTrigger>
          <TabsTrigger value="charts">Gráficos</TabsTrigger>
        </TabsList>

        {/* Tab: Posição de Estoque */}
        <TabsContent value="position" className="space-y-4">
          {/* Cards de Estatísticas */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total de Produtos
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stockPosition?.stats.totalItems || 0}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Quantidade Total
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stockPosition?.stats.totalQuantity || 0}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Valor Total
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(stockPosition?.stats.totalValue || 0)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Alertas de Estoque
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-destructive">
                  {stockPosition?.stats.lowStockCount || 0}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabela de Posição */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Posição de Estoque</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleExportCSV(stockPosition?.items || [], "posicao_estoque")}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Exportar CSV
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loadingPosition ? (
                <div className="text-center py-8 text-muted-foreground">Carregando...</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Produto</th>
                        <th className="text-left p-2">Loja</th>
                        <th className="text-right p-2">Quantidade</th>
                        <th className="text-right p-2">Mín/Máx</th>
                        <th className="text-right p-2">Valor Unit.</th>
                        <th className="text-right p-2">Valor Total</th>
                        <th className="text-center p-2">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stockPosition?.items.map((item, idx) => (
                        <tr key={idx} className="border-b hover:bg-muted/50">
                          <td className="p-2">
                            <div>
                              <div className="font-medium">{item.productName}</div>
                              <div className="text-sm text-muted-foreground">
                                {item.productBrand}
                              </div>
                            </div>
                          </td>
                          <td className="p-2">{item.storeName}</td>
                          <td className="text-right p-2 font-mono">{item.quantity}</td>
                          <td className="text-right p-2 text-sm text-muted-foreground">
                            {item.minStock || 0} / {item.maxStock || "-"}
                          </td>
                          <td className="text-right p-2">
                            {formatCurrency(item.productPrice)}
                          </td>
                          <td className="text-right p-2 font-medium">
                            {formatCurrency(item.quantity * item.productPrice)}
                          </td>
                          <td className="text-center p-2">
                            {item.quantity <= (item.minStock || 0) ? (
                              <Badge variant="destructive">Baixo</Badge>
                            ) : (
                              <Badge variant="default">OK</Badge>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Movimentações */}
        <TabsContent value="movements" className="space-y-4">
          {/* Estatísticas de Movimentações */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  Entradas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  +{movements?.stats.totalEntries || 0}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <TrendingDown className="h-4 w-4 text-red-500" />
                  Saídas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  -{movements?.stats.totalExits || 0}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Ajustes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {movements?.stats.totalAdjustments || 0}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Saldo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${(movements?.stats.netChange || 0) >= 0 ? "text-green-600" : "text-red-600"}`}>
                  {movements?.stats.netChange || 0}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabela de Movimentações */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Histórico de Movimentações</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleExportCSV(movements?.movements || [], "movimentacoes")}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Exportar CSV
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loadingMovements ? (
                <div className="text-center py-8 text-muted-foreground">Carregando...</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Data</th>
                        <th className="text-left p-2">Produto</th>
                        <th className="text-left p-2">Loja</th>
                        <th className="text-center p-2">Tipo</th>
                        <th className="text-right p-2">Quantidade</th>
                        <th className="text-left p-2">Motivo</th>
                      </tr>
                    </thead>
                    <tbody>
                      {movements?.movements.map((mov) => (
                        <tr key={mov.id} className="border-b hover:bg-muted/50">
                          <td className="p-2 text-sm">
                            {formatDate(mov.createdAt)}
                          </td>
                          <td className="p-2">
                            <div>
                              <div className="font-medium">{mov.productName}</div>
                              <div className="text-sm text-muted-foreground">
                                {mov.productBrand}
                              </div>
                            </div>
                          </td>
                          <td className="p-2">{mov.storeName}</td>
                          <td className="text-center p-2">
                            {mov.movementType === "entry" && (
                              <Badge variant="default" className="bg-green-500">
                                Entrada
                              </Badge>
                            )}
                            {(mov.movementType === "exit" || mov.movementType === "sale") && (
                              <Badge variant="destructive">Saída</Badge>
                            )}
                            {mov.movementType === "adjustment" && (
                              <Badge variant="secondary">Ajuste</Badge>
                            )}
                          </td>
                          <td className="text-right p-2 font-mono">
                            {mov.movementType === "entry" ? "+" : ""}
                            {mov.quantity}
                          </td>
                          <td className="p-2 text-sm text-muted-foreground">
                            {mov.reason || "-"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Estoque Baixo */}
        <TabsContent value="lowstock" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-destructive" />
                    Produtos com Estoque Baixo
                  </CardTitle>
                  <CardDescription>
                    {lowStock?.stats.totalProducts || 0} produtos abaixo do estoque mínimo
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleExportCSV(lowStock?.items || [], "estoque_baixo")}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Exportar CSV
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loadingLowStock ? (
                <div className="text-center py-8 text-muted-foreground">Carregando...</div>
              ) : lowStock?.items.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhum produto com estoque baixo! 🎉</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Produto</th>
                        <th className="text-left p-2">Loja</th>
                        <th className="text-right p-2">Atual</th>
                        <th className="text-right p-2">Mínimo</th>
                        <th className="text-right p-2">Déficit</th>
                        <th className="text-left p-2">Localização</th>
                      </tr>
                    </thead>
                    <tbody>
                      {lowStock?.items.map((item, idx) => (
                        <tr key={idx} className="border-b hover:bg-muted/50">
                          <td className="p-2">
                            <div>
                              <div className="font-medium">{item.productName}</div>
                              <div className="text-sm text-muted-foreground">
                                {item.productBrand}
                              </div>
                            </div>
                          </td>
                          <td className="p-2">{item.storeName}</td>
                          <td className="text-right p-2 font-mono text-destructive font-bold">
                            {item.quantity}
                          </td>
                          <td className="text-right p-2 font-mono">
                            {item.minStock}
                          </td>
                          <td className="text-right p-2 font-mono text-destructive">
                            {item.deficit}
                          </td>
                          <td className="p-2 text-sm text-muted-foreground">
                            {item.location || "-"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Custo Médio */}
        <TabsContent value="avgcost" className="space-y-4">
          {/* Estatísticas de Custo */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Custo Total
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(avgCost?.stats.totalCost || 0)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Valor Total
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(avgCost?.stats.totalValue || 0)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Lucro Potencial
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(avgCost?.stats.totalProfit || 0)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Margem Média
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {(avgCost?.stats.averageMargin || 0).toFixed(1)}%
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabela de Custo Médio */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Análise de Custo e Margem</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleExportCSV(avgCost?.items || [], "custo_medio")}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Exportar CSV
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loadingAvgCost ? (
                <div className="text-center py-8 text-muted-foreground">Carregando...</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Produto</th>
                        <th className="text-left p-2">Loja</th>
                        <th className="text-right p-2">Qtd</th>
                        <th className="text-right p-2">Custo Unit.</th>
                        <th className="text-right p-2">Preço Unit.</th>
                        <th className="text-right p-2">Custo Total</th>
                        <th className="text-right p-2">Valor Total</th>
                        <th className="text-right p-2">Margem</th>
                      </tr>
                    </thead>
                    <tbody>
                      {avgCost?.items.map((item, idx) => (
                        <tr key={idx} className="border-b hover:bg-muted/50">
                          <td className="p-2">
                            <div>
                              <div className="font-medium">{item.productName}</div>
                              <div className="text-sm text-muted-foreground">
                                {item.productBrand}
                              </div>
                            </div>
                          </td>
                          <td className="p-2">{item.storeName}</td>
                          <td className="text-right p-2 font-mono">{item.quantity}</td>
                          <td className="text-right p-2">
                            {formatCurrency(item.averageCost)}
                          </td>
                          <td className="text-right p-2">
                            {formatCurrency(item.price)}
                          </td>
                          <td className="text-right p-2">
                            {formatCurrency(item.totalCost || 0)}
                          </td>
                          <td className="text-right p-2 font-medium">
                            {formatCurrency(item.totalValue || 0)}
                          </td>
                          <td className="text-right p-2">
                            <Badge
                              variant={
                                (item.margin || 0) >= 20
                                  ? "default"
                                  : (item.margin || 0) >= 10
                                  ? "secondary"
                                  : "destructive"
                              }
                            >
                              {(item.margin || 0).toFixed(1)}%
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Gráficos */}
        <TabsContent value="charts" className="space-y-4">
          {/* Top Produtos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Top 10 Produtos Mais Movimentados
              </CardTitle>
              <CardDescription>
                Produtos com maior volume de movimentações no período
              </CardDescription>
            </CardHeader>
            <CardContent>
              {topProducts?.items && topProducts.items.length > 0 ? (
                <div className="space-y-4">
                  {topProducts.items.map((item, idx) => (
                    <div key={idx} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">
                          {idx + 1}. {item.productName}
                        </span>
                        <span className="text-muted-foreground">
                          {item.totalQuantity} unidades
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <div
                          className="bg-green-500 h-6 rounded flex items-center justify-center text-xs text-white px-2"
                          style={{
                            width: `${(Number(item.entries) / Number(item.totalQuantity)) * 100}%`,
                          }}
                        >
                          +{item.entries}
                        </div>
                        <div
                          className="bg-red-500 h-6 rounded flex items-center justify-center text-xs text-white px-2"
                          style={{
                            width: `${(Number(item.exits) / Number(item.totalQuantity)) * 100}%`,
                          }}
                        >
                          -{item.exits}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Selecione um período para visualizar os dados
                </div>
              )}
            </CardContent>
          </Card>

          {/* Evolução de Estoque */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Evolução de Estoque
              </CardTitle>
              <CardDescription>
                Movimentações diárias no período selecionado
              </CardDescription>
            </CardHeader>
            <CardContent>
              {evolution?.data && evolution.data.length > 0 ? (
                <div className="space-y-2">
                  {evolution.data.map((day, idx) => (
                    <div key={idx} className="flex items-center gap-4 text-sm">
                      <span className="w-24 text-muted-foreground">
                        {formatDate(day.date)}
                      </span>
                      <div className="flex-1 flex gap-2 items-center">
                        <span className="text-green-600 w-16 text-right">
                          +{day.entries}
                        </span>
                        <span className="text-red-600 w-16 text-right">
                          -{day.exits}
                        </span>
                        <span className="text-muted-foreground w-16 text-right">
                          ={day.netChange}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  Selecione um período para visualizar os dados
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

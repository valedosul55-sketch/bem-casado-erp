import { useState, useEffect } from 'react';
import { trpc } from '@/lib/trpc';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'wouter';
import { ChevronLeft, TrendingUp, TrendingDown, DollarSign, ShoppingCart, Users, Receipt } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function AdminDashboard() {
  const [selectedStoreId, setSelectedStoreId] = useState<number | undefined>(undefined);

  // @ts-ignore - Types will be regenerated
  const { data: stores } = trpc.system.getStores.useQuery();

  // Query para estatísticas gerais
  // @ts-ignore - Types will be regenerated
  const { data: stats, isLoading: loadingStats } = trpc.dashboard.estatisticas.useQuery({ storeId: selectedStoreId });

  // Query para faturamento diário
  // @ts-ignore - Types will be regenerated
  const { data: faturamentoDiario, isLoading: loadingDiario } = trpc.dashboard.faturamentoDiario.useQuery({ dias: 30, storeId: selectedStoreId });

  // Query para faturamento mensal
  // @ts-ignore - Types will be regenerated
  const { data: faturamentoMensal, isLoading: loadingMensal } = trpc.dashboard.faturamentoMensal.useQuery({ storeId: selectedStoreId });

  // Query para produtos mais vendidos
  // @ts-ignore - Types will be regenerated
  const { data: produtosMaisVendidos, isLoading: loadingProdutos } = trpc.dashboard.produtosMaisVendidos.useQuery({ limite: 10, storeId: selectedStoreId });

  // Função para formatar valor em reais
  const formatarValor = (valor: number) => {
    return (valor / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  // Função para formatar data
  const formatarData = (data: string) => {
    const d = new Date(data);
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Dashboard de Vendas</h1>
            <p className="text-muted-foreground mt-1">
              Visão geral do desempenho e análise de vendas
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="w-64">
              <Select 
                value={selectedStoreId?.toString() || "all"} 
                onValueChange={(val) => setSelectedStoreId(val === "all" ? undefined : Number(val))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todas as Lojas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as Lojas</SelectItem>
                  {stores?.map((store: any) => (
                    <SelectItem key={store.id} value={store.id.toString()}>
                      {store.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Link href="/admin">
              <Button variant="outline">
                <ChevronLeft className="w-4 h-4 mr-2" />
                Voltar
              </Button>
            </Link>
          </div>
        </div>

        {/* Cards de Métricas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Vendas Hoje */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Vendas Hoje</CardTitle>
              <Receipt className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loadingStats ? (
                <div className="h-8 bg-muted animate-pulse rounded" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{formatarValor(stats?.vendasHoje || 0)}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats?.quantidadeHoje || 0} {stats?.quantidadeHoje === 1 ? 'venda' : 'vendas'}
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          {/* Vendas do Mês */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Vendas do Mês</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loadingStats ? (
                <div className="h-8 bg-muted animate-pulse rounded" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{formatarValor(stats?.vendasMes || 0)}</div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    {stats?.crescimentoMensal && stats.crescimentoMensal > 0 ? (
                      <>
                        <TrendingUp className="w-3 h-3 text-green-500" />
                        <span className="text-green-500">+{stats.crescimentoMensal.toFixed(1)}%</span>
                      </>
                    ) : stats?.crescimentoMensal && stats.crescimentoMensal < 0 ? (
                      <>
                        <TrendingDown className="w-3 h-3 text-red-500" />
                        <span className="text-red-500">{stats.crescimentoMensal.toFixed(1)}%</span>
                      </>
                    ) : (
                      <span>vs mês anterior</span>
                    )}
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          {/* Ticket Médio */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ticket Médio</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loadingStats ? (
                <div className="h-8 bg-muted animate-pulse rounded" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{formatarValor(stats?.ticketMedio || 0)}</div>
                  <p className="text-xs text-muted-foreground">
                    Valor médio por venda
                  </p>
                </>
              )}
            </CardContent>
          </Card>

          {/* Total de Clientes */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Clientes Únicos</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loadingStats ? (
                <div className="h-8 bg-muted animate-pulse rounded" />
              ) : (
                <>
                  <div className="text-2xl font-bold">{stats?.totalClientes || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    Últimos 30 dias
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Gráfico de Faturamento Diário */}
        <Card>
          <CardHeader>
            <CardTitle>Faturamento Diário</CardTitle>
            <CardDescription>Vendas dos últimos 30 dias</CardDescription>
          </CardHeader>
          <CardContent>
            {loadingDiario ? (
              <div className="h-80 bg-muted animate-pulse rounded" />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={faturamentoDiario}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="data" 
                    tickFormatter={formatarData}
                    fontSize={12}
                  />
                  <YAxis 
                    tickFormatter={(value) => formatarValor(value)}
                    fontSize={12}
                  />
                  <Tooltip 
                    formatter={(value: number) => formatarValor(value)}
                    labelFormatter={(label) => formatarData(label)}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="total" 
                    name="Faturamento" 
                    stroke="#E63946" 
                    strokeWidth={2}
                    dot={{ fill: '#E63946', r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Gráfico de Faturamento Mensal */}
        <Card>
          <CardHeader>
            <CardTitle>Faturamento Mensal</CardTitle>
            <CardDescription>Vendas dos últimos 12 meses</CardDescription>
          </CardHeader>
          <CardContent>
            {loadingMensal ? (
              <div className="h-80 bg-muted animate-pulse rounded" />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={faturamentoMensal}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="mes" 
                    fontSize={12}
                  />
                  <YAxis 
                    tickFormatter={(value) => formatarValor(value)}
                    fontSize={12}
                  />
                  <Tooltip 
                    formatter={(value: number) => formatarValor(value)}
                  />
                  <Legend />
                  <Bar 
                    dataKey="total" 
                    name="Faturamento" 
                    fill="#E63946" 
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Top 10 Produtos Mais Vendidos */}
        <Card>
          <CardHeader>
            <CardTitle>Top 10 Produtos Mais Vendidos</CardTitle>
            <CardDescription>Últimos 30 dias</CardDescription>
          </CardHeader>
          <CardContent>
            {loadingProdutos ? (
              <div className="h-80 bg-muted animate-pulse rounded" />
            ) : (
              <ResponsiveContainer width="100%" height={400}>
                <BarChart 
                  data={produtosMaisVendidos} 
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 150, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" fontSize={12} />
                  <YAxis 
                    type="category" 
                    dataKey="nome" 
                    fontSize={12}
                    width={140}
                  />
                  <Tooltip 
                    formatter={(value: number, name: string) => {
                      if (name === 'Quantidade') return `${value} un`;
                      return formatarValor(value);
                    }}
                  />
                  <Legend />
                  <Bar 
                    dataKey="quantidade" 
                    name="Quantidade" 
                    fill="#E63946" 
                    radius={[0, 8, 8, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

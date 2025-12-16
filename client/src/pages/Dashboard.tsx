import ERPLayout from "@/components/ERPLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import {
  ShoppingCart,
  Users,
  Package,
  DollarSign,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Clock,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

// Dados de exemplo para os gráficos
const vendasData = [
  { name: "Jan", vendas: 4000 },
  { name: "Fev", vendas: 3000 },
  { name: "Mar", vendas: 5000 },
  { name: "Abr", vendas: 4500 },
  { name: "Mai", vendas: 6000 },
  { name: "Jun", vendas: 5500 },
];

const produtosData = [
  { name: "Bem Casado", vendas: 120 },
  { name: "Brigadeiro", vendas: 98 },
  { name: "Bolo de Pote", vendas: 86 },
  { name: "Trufa", vendas: 72 },
  { name: "Brownie", vendas: 65 },
];

export default function Dashboard() {
  // Buscar estatísticas do backend
  const { data: stats } = trpc.dashboard.getStats.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
  });

  const cards = [
    {
      title: "Vendas do Mês",
      value: stats?.vendasMes ? `R$ ${stats.vendasMes.toLocaleString("pt-BR")}` : "R$ 0,00",
      icon: ShoppingCart,
      trend: "+12%",
      trendUp: true,
      color: "bg-orange-500",
    },
    {
      title: "Clientes Ativos",
      value: stats?.clientesAtivos?.toString() || "0",
      icon: Users,
      trend: "+5%",
      trendUp: true,
      color: "bg-green-500",
    },
    {
      title: "Produtos Cadastrados",
      value: stats?.produtosCadastrados?.toString() || "0",
      icon: Package,
      trend: "0%",
      trendUp: true,
      color: "bg-amber-500",
    },
    {
      title: "A Receber",
      value: stats?.aReceber ? `R$ ${stats.aReceber.toLocaleString("pt-BR")}` : "R$ 0,00",
      icon: DollarSign,
      trend: "-3%",
      trendUp: false,
      color: "bg-blue-500",
    },
  ];

  const alertas = [
    { tipo: "estoque", mensagem: "5 produtos com estoque baixo", icon: AlertTriangle, cor: "text-amber-500" },
    { tipo: "pedido", mensagem: "3 pedidos aguardando confirmação", icon: Clock, cor: "text-blue-500" },
    { tipo: "financeiro", mensagem: "2 contas vencem hoje", icon: DollarSign, cor: "text-red-500" },
  ];

  return (
    <ERPLayout>
      <div className="space-y-6">
        {/* Cards de Resumo */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {cards.map((card, index) => (
            <Card key={index} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="flex items-stretch">
                  <div className={`${card.color} w-2`} />
                  <div className="flex-1 p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">{card.title}</p>
                        <p className="text-2xl font-bold mt-1">{card.value}</p>
                      </div>
                      <div className={`${card.color} p-3 rounded-lg`}>
                        <card.icon className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <div className="flex items-center gap-1 mt-2">
                      {card.trendUp ? (
                        <TrendingUp className="w-4 h-4 text-green-500" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-red-500" />
                      )}
                      <span className={card.trendUp ? "text-green-500 text-sm" : "text-red-500 text-sm"}>
                        {card.trend}
                      </span>
                      <span className="text-muted-foreground text-sm">vs mês anterior</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Gráfico de Vendas */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-orange-500" />
                Vendas por Mês
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={vendasData}>
                    <defs>
                      <linearGradient id="colorVendas" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="name" stroke="#6b7280" fontSize={12} />
                    <YAxis stroke="#6b7280" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#fff",
                        border: "1px solid #e5e7eb",
                        borderRadius: "8px",
                      }}
                      formatter={(value: number) => [`R$ ${value.toLocaleString("pt-BR")}`, "Vendas"]}
                    />
                    <Area
                      type="monotone"
                      dataKey="vendas"
                      stroke="#f97316"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorVendas)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Gráfico de Produtos Mais Vendidos */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Package className="w-5 h-5 text-green-500" />
                Produtos Mais Vendidos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={produtosData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis type="number" stroke="#6b7280" fontSize={12} />
                    <YAxis dataKey="name" type="category" stroke="#6b7280" fontSize={12} width={100} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#fff",
                        border: "1px solid #e5e7eb",
                        borderRadius: "8px",
                      }}
                    />
                    <Bar dataKey="vendas" fill="#22c55e" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Alertas e Pedidos Recentes */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Alertas */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                Alertas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {alertas.map((alerta, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors cursor-pointer"
                  >
                    <alerta.icon className={`w-5 h-5 ${alerta.cor}`} />
                    <span className="text-sm">{alerta.mensagem}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Pedidos Recentes */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-orange-500" />
                Pedidos Recentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { numero: "#001234", cliente: "Maria Silva", valor: "R$ 450,00", status: "Confirmado" },
                  { numero: "#001233", cliente: "João Santos", valor: "R$ 280,00", status: "Em Produção" },
                  { numero: "#001232", cliente: "Ana Costa", valor: "R$ 620,00", status: "Pronto" },
                ].map((pedido, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors cursor-pointer"
                  >
                    <div>
                      <p className="font-medium">{pedido.numero}</p>
                      <p className="text-sm text-muted-foreground">{pedido.cliente}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-green-600">{pedido.valor}</p>
                      <p className="text-xs text-muted-foreground">{pedido.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </ERPLayout>
  );
}

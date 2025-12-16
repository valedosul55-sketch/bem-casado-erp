import { useState } from "react";
import ERPLayout from "@/components/ERPLayout";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  DollarSign,
  Plus,
  ArrowUpCircle,
  ArrowDownCircle,
  CheckCircle,
  Clock,
  AlertTriangle,
  XCircle,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

interface FinancialForm {
  type: "pagar" | "receber";
  description: string;
  amount: string;
  dueDate: string;
  category: string;
  notes: string;
}

const initialForm: FinancialForm = {
  type: "receber",
  description: "",
  amount: "",
  dueDate: "",
  category: "",
  notes: "",
};

const statusConfig = {
  pendente: { label: "Pendente", color: "bg-amber-100 text-amber-700", icon: Clock },
  pago: { label: "Pago", color: "bg-green-100 text-green-700", icon: CheckCircle },
  vencido: { label: "Vencido", color: "bg-red-100 text-red-700", icon: AlertTriangle },
  cancelado: { label: "Cancelado", color: "bg-gray-100 text-gray-700", icon: XCircle },
};

const categoriesReceita = [
  "Vendas",
  "Serviços",
  "Outros",
];

const categoriesDespesa = [
  "Fornecedores",
  "Salários",
  "Aluguel",
  "Energia",
  "Água",
  "Internet",
  "Marketing",
  "Manutenção",
  "Impostos",
  "Outros",
];

export default function Financeiro() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<FinancialForm>(initialForm);
  const [activeTab, setActiveTab] = useState("receber");

  const utils = trpc.useUtils();
  const { data: accounts = [], isLoading } = trpc.financial.list.useQuery({});

  const createMutation = trpc.financial.create.useMutation({
    onSuccess: () => {
      toast.success("Conta cadastrada com sucesso!");
      utils.financial.list.invalidate();
      setDialogOpen(false);
      setForm(initialForm);
    },
    onError: (error) => {
      toast.error("Erro ao cadastrar conta: " + error.message);
    },
  });

  const updateMutation = trpc.financial.update.useMutation({
    onSuccess: () => {
      toast.success("Conta atualizada com sucesso!");
      utils.financial.list.invalidate();
    },
    onError: (error) => {
      toast.error("Erro ao atualizar conta: " + error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.description || !form.amount || !form.dueDate) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    createMutation.mutate({
      type: form.type,
      description: form.description,
      amount: form.amount,
      dueDate: form.dueDate,
      category: form.category || undefined,
      notes: form.notes || undefined,
    });
  };

  const handleMarkAsPaid = (id: number) => {
    updateMutation.mutate({
      id,
      status: "pago",
      paidDate: new Date().toISOString(),
    });
  };

  const receberAccounts = accounts.filter((a) => a.type === "receber");
  const pagarAccounts = accounts.filter((a) => a.type === "pagar");

  const totalReceber = receberAccounts
    .filter((a) => a.status === "pendente")
    .reduce((sum, a) => sum + parseFloat(a.amount), 0);

  const totalPagar = pagarAccounts
    .filter((a) => a.status === "pendente")
    .reduce((sum, a) => sum + parseFloat(a.amount), 0);

  const saldo = totalReceber - totalPagar;

  const renderTable = (data: typeof accounts, type: "pagar" | "receber") => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Descrição</TableHead>
          <TableHead className="hidden md:table-cell">Categoria</TableHead>
          <TableHead>Vencimento</TableHead>
          <TableHead>Valor</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="w-[100px]"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {isLoading ? (
          <TableRow>
            <TableCell colSpan={6} className="text-center py-8">
              Carregando...
            </TableCell>
          </TableRow>
        ) : data.length === 0 ? (
          <TableRow>
            <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
              Nenhuma conta encontrada
            </TableCell>
          </TableRow>
        ) : (
          data.map((account) => {
            const config = statusConfig[account.status as keyof typeof statusConfig];
            const StatusIcon = config?.icon || Clock;
            const isOverdue =
              account.status === "pendente" && new Date(account.dueDate) < new Date();

            return (
              <TableRow key={account.id}>
                <TableCell>
                  <div className="font-medium">{account.description}</div>
                  {account.notes && (
                    <div className="text-xs text-muted-foreground truncate max-w-[200px]">
                      {account.notes}
                    </div>
                  )}
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {account.category || "-"}
                </TableCell>
                <TableCell>
                  <span className={isOverdue ? "text-red-600 font-medium" : ""}>
                    {new Date(account.dueDate).toLocaleDateString("pt-BR")}
                  </span>
                </TableCell>
                <TableCell>
                  <span
                    className={`font-medium ${type === "receber" ? "text-green-600" : "text-red-600"}`}
                  >
                    R$ {parseFloat(account.amount).toFixed(2)}
                  </span>
                </TableCell>
                <TableCell>
                  <Badge className={`${isOverdue && account.status === "pendente" ? "bg-red-100 text-red-700" : config?.color} gap-1`}>
                    <StatusIcon className="w-3 h-3" />
                    {isOverdue && account.status === "pendente" ? "Vencido" : config?.label}
                  </Badge>
                </TableCell>
                <TableCell>
                  {account.status === "pendente" && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-green-600 border-green-600 hover:bg-green-50"
                      onClick={() => handleMarkAsPaid(account.id)}
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Pagar
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            );
          })
        )}
      </TableBody>
    </Table>
  );

  return (
    <ERPLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <DollarSign className="w-7 h-7 text-orange-500" />
              Financeiro
            </h1>
            <p className="text-muted-foreground">Controle de contas a pagar e receber</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-green-600 hover:bg-green-700">
                <Plus className="w-4 h-4 mr-2" />
                Nova Conta
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nova Conta</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div>
                  <Label htmlFor="type">Tipo *</Label>
                  <Select
                    value={form.type}
                    onValueChange={(value: "pagar" | "receber") =>
                      setForm({ ...form, type: value, category: "" })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="receber">
                        <div className="flex items-center gap-2">
                          <ArrowUpCircle className="w-4 h-4 text-green-500" />
                          A Receber
                        </div>
                      </SelectItem>
                      <SelectItem value="pagar">
                        <div className="flex items-center gap-2">
                          <ArrowDownCircle className="w-4 h-4 text-red-500" />
                          A Pagar
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="description">Descrição *</Label>
                  <Input
                    id="description"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Descrição da conta"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="amount">Valor *</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      value={form.amount}
                      onChange={(e) => setForm({ ...form, amount: e.target.value })}
                      placeholder="0,00"
                    />
                  </div>
                  <div>
                    <Label htmlFor="dueDate">Vencimento *</Label>
                    <Input
                      id="dueDate"
                      type="date"
                      value={form.dueDate}
                      onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="category">Categoria</Label>
                  <Select
                    value={form.category}
                    onValueChange={(value) => setForm({ ...form, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      {(form.type === "receber" ? categoriesReceita : categoriesDespesa).map(
                        (cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat}
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="notes">Observações</Label>
                  <Textarea
                    id="notes"
                    value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                    placeholder="Observações"
                    rows={2}
                  />
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" className="bg-green-600 hover:bg-green-700">
                    Cadastrar
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">A Receber</p>
                  <p className="text-2xl font-bold text-green-600">
                    R$ {totalReceber.toFixed(2)}
                  </p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">A Pagar</p>
                  <p className="text-2xl font-bold text-red-600">
                    R$ {totalPagar.toFixed(2)}
                  </p>
                </div>
                <div className="p-3 bg-red-100 rounded-lg">
                  <TrendingDown className="w-6 h-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Saldo Previsto</p>
                  <p className={`text-2xl font-bold ${saldo >= 0 ? "text-green-600" : "text-red-600"}`}>
                    R$ {saldo.toFixed(2)}
                  </p>
                </div>
                <div className={`p-3 rounded-lg ${saldo >= 0 ? "bg-green-100" : "bg-red-100"}`}>
                  <DollarSign className={`w-6 h-6 ${saldo >= 0 ? "text-green-600" : "text-red-600"}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="receber" className="gap-2">
              <ArrowUpCircle className="w-4 h-4" />
              A Receber ({receberAccounts.length})
            </TabsTrigger>
            <TabsTrigger value="pagar" className="gap-2">
              <ArrowDownCircle className="w-4 h-4" />
              A Pagar ({pagarAccounts.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="receber">
            <Card>
              <CardContent className="p-0">{renderTable(receberAccounts, "receber")}</CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pagar">
            <Card>
              <CardContent className="p-0">{renderTable(pagarAccounts, "pagar")}</CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ERPLayout>
  );
}

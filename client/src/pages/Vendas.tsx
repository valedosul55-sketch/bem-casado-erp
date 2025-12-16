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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  ShoppingCart,
  Plus,
  Search,
  MoreHorizontal,
  Eye,
  FileText,
  CheckCircle,
  Clock,
  Truck,
  XCircle,
  Package,
} from "lucide-react";

interface OrderForm {
  customerId: number | undefined;
  status: "orcamento" | "confirmado" | "producao" | "pronto" | "entregue" | "cancelado";
  deliveryDate: string;
  deliveryAddress: string;
  notes: string;
  discount: string;
}

const initialForm: OrderForm = {
  customerId: undefined,
  status: "orcamento",
  deliveryDate: "",
  deliveryAddress: "",
  notes: "",
  discount: "0",
};

const statusConfig = {
  orcamento: { label: "Orçamento", color: "bg-gray-100 text-gray-700", icon: FileText },
  confirmado: { label: "Confirmado", color: "bg-blue-100 text-blue-700", icon: CheckCircle },
  producao: { label: "Em Produção", color: "bg-amber-100 text-amber-700", icon: Clock },
  pronto: { label: "Pronto", color: "bg-green-100 text-green-700", icon: Package },
  entregue: { label: "Entregue", color: "bg-emerald-100 text-emerald-700", icon: Truck },
  cancelado: { label: "Cancelado", color: "bg-red-100 text-red-700", icon: XCircle },
};

export default function Vendas() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<OrderForm>(initialForm);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const utils = trpc.useUtils();
  const { data: orders = [], isLoading } = trpc.orders.list.useQuery({});
  const { data: customers = [] } = trpc.customers.list.useQuery();
  const { data: products = [] } = trpc.products.list.useQuery();

  const createMutation = trpc.orders.create.useMutation({
    onSuccess: (data) => {
      toast.success(`Pedido ${data.orderNumber} criado com sucesso!`);
      utils.orders.list.invalidate();
      setDialogOpen(false);
      setForm(initialForm);
    },
    onError: (error) => {
      toast.error("Erro ao criar pedido: " + error.message);
    },
  });

  const updateStatusMutation = trpc.orders.updateStatus.useMutation({
    onSuccess: () => {
      toast.success("Status atualizado com sucesso!");
      utils.orders.list.invalidate();
    },
    onError: (error) => {
      toast.error("Erro ao atualizar status: " + error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({
      customerId: form.customerId,
      status: form.status,
      deliveryDate: form.deliveryDate || undefined,
      deliveryAddress: form.deliveryAddress || undefined,
      notes: form.notes || undefined,
      discount: form.discount || undefined,
    });
  };

  const handleStatusChange = (orderId: number, newStatus: string) => {
    updateStatusMutation.mutate({
      id: orderId,
      status: newStatus as any,
    });
  };

  const getCustomerName = (customerId: number | null) => {
    if (!customerId) return "Cliente não informado";
    const customer = customers.find((c) => c.id === customerId);
    return customer?.name || "Cliente não encontrado";
  };

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.orderNumber?.toLowerCase().includes(search.toLowerCase()) ||
      getCustomerName(order.customerId).toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <ERPLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <ShoppingCart className="w-7 h-7 text-orange-500" />
              Vendas e Pedidos
            </h1>
            <p className="text-muted-foreground">Gerencie orçamentos e pedidos</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-green-600 hover:bg-green-700">
                <Plus className="w-4 h-4 mr-2" />
                Novo Pedido
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Novo Pedido</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="customer">Cliente</Label>
                    <Select
                      value={form.customerId?.toString() || ""}
                      onValueChange={(value) =>
                        setForm({ ...form, customerId: value ? parseInt(value) : undefined })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um cliente..." />
                      </SelectTrigger>
                      <SelectContent>
                        {customers.map((customer) => (
                          <SelectItem key={customer.id} value={customer.id.toString()}>
                            {customer.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={form.status}
                      onValueChange={(value: any) => setForm({ ...form, status: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="orcamento">Orçamento</SelectItem>
                        <SelectItem value="confirmado">Confirmado</SelectItem>
                        <SelectItem value="producao">Em Produção</SelectItem>
                        <SelectItem value="pronto">Pronto</SelectItem>
                        <SelectItem value="entregue">Entregue</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="deliveryDate">Data de Entrega</Label>
                    <Input
                      id="deliveryDate"
                      type="date"
                      value={form.deliveryDate}
                      onChange={(e) => setForm({ ...form, deliveryDate: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="discount">Desconto (R$)</Label>
                    <Input
                      id="discount"
                      type="number"
                      step="0.01"
                      value={form.discount}
                      onChange={(e) => setForm({ ...form, discount: e.target.value })}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="deliveryAddress">Endereço de Entrega</Label>
                    <Input
                      id="deliveryAddress"
                      value={form.deliveryAddress}
                      onChange={(e) => setForm({ ...form, deliveryAddress: e.target.value })}
                      placeholder="Endereço completo para entrega"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="notes">Observações</Label>
                    <Textarea
                      id="notes"
                      value={form.notes}
                      onChange={(e) => setForm({ ...form, notes: e.target.value })}
                      placeholder="Observações do pedido"
                      rows={3}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" className="bg-green-600 hover:bg-green-700">
                    Criar Pedido
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por número ou cliente..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Status</SelectItem>
                  <SelectItem value="orcamento">Orçamento</SelectItem>
                  <SelectItem value="confirmado">Confirmado</SelectItem>
                  <SelectItem value="producao">Em Produção</SelectItem>
                  <SelectItem value="pronto">Pronto</SelectItem>
                  <SelectItem value="entregue">Entregue</SelectItem>
                  <SelectItem value="cancelado">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { status: "orcamento", label: "Orçamentos", color: "text-gray-600" },
            { status: "confirmado", label: "Confirmados", color: "text-blue-600" },
            { status: "producao", label: "Em Produção", color: "text-amber-600" },
            { status: "pronto", label: "Prontos", color: "text-green-600" },
          ].map((item) => (
            <Card key={item.status}>
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold">
                  {orders.filter((o) => o.status === item.status).length}
                </p>
                <p className={`text-sm ${item.color}`}>{item.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Table */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Pedido</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead className="hidden md:table-cell">Data</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden md:table-cell">Total</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      Carregando...
                    </TableCell>
                  </TableRow>
                ) : filteredOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      Nenhum pedido encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredOrders.map((order) => {
                    const config = statusConfig[order.status as keyof typeof statusConfig];
                    const StatusIcon = config?.icon || FileText;
                    return (
                      <TableRow key={order.id}>
                        <TableCell>
                          <span className="font-medium">{order.orderNumber}</span>
                        </TableCell>
                        <TableCell>{getCustomerName(order.customerId)}</TableCell>
                        <TableCell className="hidden md:table-cell">
                          {new Date(order.createdAt).toLocaleDateString("pt-BR")}
                        </TableCell>
                        <TableCell>
                          <Badge className={`${config?.color} gap-1`}>
                            <StatusIcon className="w-3 h-3" />
                            {config?.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <span className="font-medium text-green-600">
                            R$ {parseFloat(order.total).toFixed(2)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedOrder(order);
                                  setDetailsOpen(true);
                                }}
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                Ver Detalhes
                              </DropdownMenuItem>
                              {order.status !== "entregue" && order.status !== "cancelado" && (
                                <>
                                  {order.status === "orcamento" && (
                                    <DropdownMenuItem
                                      onClick={() => handleStatusChange(order.id, "confirmado")}
                                    >
                                      <CheckCircle className="w-4 h-4 mr-2 text-blue-500" />
                                      Confirmar
                                    </DropdownMenuItem>
                                  )}
                                  {order.status === "confirmado" && (
                                    <DropdownMenuItem
                                      onClick={() => handleStatusChange(order.id, "producao")}
                                    >
                                      <Clock className="w-4 h-4 mr-2 text-amber-500" />
                                      Iniciar Produção
                                    </DropdownMenuItem>
                                  )}
                                  {order.status === "producao" && (
                                    <DropdownMenuItem
                                      onClick={() => handleStatusChange(order.id, "pronto")}
                                    >
                                      <Package className="w-4 h-4 mr-2 text-green-500" />
                                      Marcar como Pronto
                                    </DropdownMenuItem>
                                  )}
                                  {order.status === "pronto" && (
                                    <DropdownMenuItem
                                      onClick={() => handleStatusChange(order.id, "entregue")}
                                    >
                                      <Truck className="w-4 h-4 mr-2 text-emerald-500" />
                                      Marcar como Entregue
                                    </DropdownMenuItem>
                                  )}
                                  <DropdownMenuItem
                                    onClick={() => handleStatusChange(order.id, "cancelado")}
                                    className="text-red-600"
                                  >
                                    <XCircle className="w-4 h-4 mr-2" />
                                    Cancelar
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Order Details Dialog */}
        <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Detalhes do Pedido {selectedOrder?.orderNumber}</DialogTitle>
            </DialogHeader>
            {selectedOrder && (
              <div className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Cliente</p>
                    <p className="font-medium">{getCustomerName(selectedOrder.customerId)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status</p>
                    <Badge
                      className={`${statusConfig[selectedOrder.status as keyof typeof statusConfig]?.color}`}
                    >
                      {statusConfig[selectedOrder.status as keyof typeof statusConfig]?.label}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Data do Pedido</p>
                    <p className="font-medium">
                      {new Date(selectedOrder.createdAt).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Data de Entrega</p>
                    <p className="font-medium">
                      {selectedOrder.deliveryDate
                        ? new Date(selectedOrder.deliveryDate).toLocaleDateString("pt-BR")
                        : "-"}
                    </p>
                  </div>
                </div>
                {selectedOrder.deliveryAddress && (
                  <div>
                    <p className="text-sm text-muted-foreground">Endereço de Entrega</p>
                    <p className="font-medium">{selectedOrder.deliveryAddress}</p>
                  </div>
                )}
                {selectedOrder.notes && (
                  <div>
                    <p className="text-sm text-muted-foreground">Observações</p>
                    <p className="font-medium">{selectedOrder.notes}</p>
                  </div>
                )}
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Subtotal:</span>
                    <span>R$ {parseFloat(selectedOrder.subtotal).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Desconto:</span>
                    <span>R$ {parseFloat(selectedOrder.discount || "0").toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center text-lg font-bold">
                    <span>Total:</span>
                    <span className="text-green-600">
                      R$ {parseFloat(selectedOrder.total).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </ERPLayout>
  );
}

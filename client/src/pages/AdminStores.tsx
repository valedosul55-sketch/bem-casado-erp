import { useState } from 'react';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { Pencil, Trash2, Plus, Store, MapPin, Phone, Mail } from 'lucide-react';

export default function AdminStores() {
  const [editingStore, setEditingStore] = useState<any>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    cnpj: '',
    ie: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    phone: '',
    email: '',
    notificationEmail: '',
    active: 1,
  });

  // Queries
  // @ts-ignore - Types will be regenerated
  const { data: stores, refetch } = trpc.system.getStores.useQuery();
  
  // Mutations
  // @ts-ignore - Types will be regenerated
  const createMutation = trpc.system.createStore.useMutation();
  // @ts-ignore - Types will be regenerated
  const updateMutation = trpc.system.updateStore.useMutation();
  // @ts-ignore - Types will be regenerated
  const deleteMutation = trpc.system.deleteStore.useMutation();

  // Resetar formulário
  const resetForm = () => {
    setFormData({
      name: '',
      cnpj: '',
      ie: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      phone: '',
      email: '',
      notificationEmail: '',
      active: 1,
    });
    setEditingStore(null);
  };

  // Abrir diálogo de edição
  const handleEdit = (store: any) => {
    setEditingStore(store);
    setFormData({
      name: store.name,
      cnpj: store.cnpj,
      ie: store.ie || '',
      address: store.address || '',
      city: store.city || '',
      state: store.state || '',
      zipCode: store.zipCode || '',
      phone: store.phone || '',
      email: store.email || '',
      notificationEmail: store.notificationEmail || '',
      active: store.active,
    });
    setShowEditDialog(true);
  };

  // Criar loja
  const handleCreate = async () => {
    try {
      if (!formData.name || !formData.cnpj) {
        toast.error('Nome e CNPJ são obrigatórios');
        return;
      }

      await createMutation.mutateAsync({
        ...formData,
        ie: formData.ie || undefined,
        address: formData.address || undefined,
        city: formData.city || undefined,
        state: formData.state || undefined,
        zipCode: formData.zipCode || undefined,
        phone: formData.phone || undefined,
        email: formData.email || undefined,
        notificationEmail: formData.notificationEmail || undefined,
      });

      toast.success('Loja criada com sucesso!');
      setShowCreateDialog(false);
      resetForm();
      refetch();
    } catch (error) {
      toast.error('Erro ao criar loja', {
        description: error instanceof Error ? error.message : 'Tente novamente',
      });
    }
  };

  // Atualizar loja
  const handleUpdate = async () => {
    if (!editingStore) return;

    try {
      await updateMutation.mutateAsync({
        id: editingStore.id,
        ...formData,
        ie: formData.ie || undefined,
        address: formData.address || undefined,
        city: formData.city || undefined,
        state: formData.state || undefined,
        zipCode: formData.zipCode || undefined,
        phone: formData.phone || undefined,
        email: formData.email || undefined,
        notificationEmail: formData.notificationEmail || undefined,
      });

      toast.success('Loja atualizada com sucesso!');
      setShowEditDialog(false);
      resetForm();
      refetch();
    } catch (error) {
      toast.error('Erro ao atualizar loja', {
        description: error instanceof Error ? error.message : 'Tente novamente',
      });
    }
  };

  // Deletar loja
  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Tem certeza que deseja excluir a loja "${name}"?`)) return;

    try {
      await deleteMutation.mutateAsync({ id });
      toast.success('Loja excluída com sucesso!');
      refetch();
    } catch (error) {
      toast.error('Erro ao excluir loja', {
        description: error instanceof Error ? error.message : 'Tente novamente',
      });
    }
  };

  // Formulário de loja
  const StoreForm = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <Label htmlFor="name">Nome da Loja *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Ex: Filial Centro"
          />
        </div>

        <div>
          <Label htmlFor="cnpj">CNPJ *</Label>
          <Input
            id="cnpj"
            value={formData.cnpj}
            onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
            placeholder="00.000.000/0000-00"
          />
        </div>

        <div>
          <Label htmlFor="ie">Inscrição Estadual</Label>
          <Input
            id="ie"
            value={formData.ie}
            onChange={(e) => setFormData({ ...formData, ie: e.target.value })}
            placeholder="000.000.000.000"
          />
        </div>

        <div className="col-span-2">
          <Label htmlFor="address">Endereço</Label>
          <Input
            id="address"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            placeholder="Rua, Número, Bairro"
          />
        </div>

        <div>
          <Label htmlFor="city">Cidade</Label>
          <Input
            id="city"
            value={formData.city}
            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            placeholder="São José dos Campos"
          />
        </div>

        <div>
          <Label htmlFor="state">UF</Label>
          <Input
            id="state"
            value={formData.state}
            onChange={(e) => setFormData({ ...formData, state: e.target.value })}
            placeholder="SP"
            maxLength={2}
          />
        </div>

        <div>
          <Label htmlFor="zipCode">CEP</Label>
          <Input
            id="zipCode"
            value={formData.zipCode}
            onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
            placeholder="00000-000"
          />
        </div>

        <div>
          <Label htmlFor="phone">Telefone</Label>
          <Input
            id="phone"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="(00) 00000-0000"
          />
        </div>

        <div className="col-span-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            placeholder="loja@exemplo.com"
          />
        </div>

        <div className="col-span-2">
          <Label htmlFor="notificationEmail">Email para Notificações (Estoque Baixo)</Label>
          <Input
            id="notificationEmail"
            type="email"
            value={formData.notificationEmail}
            onChange={(e) => setFormData({ ...formData, notificationEmail: e.target.value })}
            placeholder="gerente@exemplo.com"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Este email receberá alertas quando o estoque atingir o nível mínimo.
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
            <option value={1}>Ativa</option>
            <option value={0}>Inativa</option>
          </select>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Gerenciar Filiais</h2>
          <p className="text-muted-foreground">
            Cadastre e gerencie as lojas físicas e matriz.
          </p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nova Loja
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Cadastrar Nova Loja</DialogTitle>
              <DialogDescription>
                Preencha os dados da nova filial. O CNPJ e IE são essenciais para emissão fiscal.
              </DialogDescription>
            </DialogHeader>
            <StoreForm />
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>Cancelar</Button>
              <Button onClick={handleCreate}>Cadastrar</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {stores?.map((store: any) => (
          <Card key={store.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {store.name}
              </CardTitle>
              <Store className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold mb-2">{store.city}/{store.state}</div>
              <div className="space-y-1 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">CNPJ:</span> {store.cnpj}
                </div>
                {store.ie && (
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">IE:</span> {store.ie}
                  </div>
                )}
                {store.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-3 w-3" /> {store.phone}
                  </div>
                )}
                {store.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-3 w-3" /> {store.email}
                  </div>
                )}
              </div>
              
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" size="sm" onClick={() => handleEdit(store)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button variant="destructive" size="sm" onClick={() => handleDelete(store.id, store.name)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Loja</DialogTitle>
          </DialogHeader>
          <StoreForm />
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>Cancelar</Button>
            <Button onClick={handleUpdate}>Salvar Alterações</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

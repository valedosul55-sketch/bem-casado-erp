import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Key, UserCheck, UserX, Link2, Copy, Check } from "lucide-react";
import { PasswordInput } from "@/components/PasswordInput";

const ROLE_LABELS: Record<string, string> = {
  admin: "Administrador",
  gerente: "Gerente",
  vendedor: "Vendedor",
  operador: "Operador",
  user: "Usuário",
};

const ROLE_COLORS: Record<string, string> = {
  admin: "bg-red-500",
  gerente: "bg-blue-500",
  vendedor: "bg-green-500",
  operador: "bg-yellow-500",
  user: "bg-gray-500",
};

export default function Usuarios() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isPasswordOpen, setIsPasswordOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    name: "",
    email: "",
    role: "user" as "user" | "admin" | "gerente" | "vendedor" | "operador",
    empresa: "",
    filial: "",
    departamento: "",
  });
  const [newPassword, setNewPassword] = useState("");
  const [isResetLinkOpen, setIsResetLinkOpen] = useState(false);
  const [resetLink, setResetLink] = useState("");
  const [copied, setCopied] = useState(false);

  const utils = trpc.useUtils();
  const { data: users, isLoading } = trpc.users.list.useQuery();

  const createUser = trpc.users.create.useMutation({
    onSuccess: () => {
      toast.success("Usuário criado com sucesso!");
      setIsCreateOpen(false);
      resetForm();
      utils.users.list.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const updateUser = trpc.users.update.useMutation({
    onSuccess: () => {
      toast.success("Usuário atualizado com sucesso!");
      setIsEditOpen(false);
      utils.users.list.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const deleteUser = trpc.users.delete.useMutation({
    onSuccess: () => {
      toast.success("Usuário desativado com sucesso!");
      utils.users.list.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const generateResetLink = trpc.users.generateResetLink.useMutation({
    onSuccess: (data) => {
      setResetLink(data.resetUrl);
      setIsResetLinkOpen(true);
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const changePassword = trpc.users.changePassword.useMutation({
    onSuccess: () => {
      toast.success("Senha alterada com sucesso!");
      setIsPasswordOpen(false);
      setNewPassword("");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const resetForm = () => {
    setFormData({
      username: "",
      password: "",
      name: "",
      email: "",
      role: "user",
      empresa: "",
      filial: "",
      departamento: "",
    });
  };

  const handleCreate = () => {
    createUser.mutate(formData);
  };

  const handleEdit = () => {
    if (!selectedUser) return;
    updateUser.mutate({
      id: selectedUser.id,
      name: formData.name,
      email: formData.email || undefined,
      role: formData.role,
      empresa: formData.empresa,
      filial: formData.filial,
      departamento: formData.departamento,
    });
  };

  const handleDelete = (user: any) => {
    if (confirm(`Deseja realmente desativar o usuário ${user.name}?`)) {
      deleteUser.mutate({ id: user.id });
    }
  };

  const handleChangePassword = () => {
    if (!selectedUser || !newPassword) return;
    changePassword.mutate({
      id: selectedUser.id,
      newPassword,
    });
  };

  const openEditDialog = (user: any) => {
    setSelectedUser(user);
    setFormData({
      username: user.username || "",
      password: "",
      name: user.name || "",
      email: user.email || "",
      role: user.role || "user",
      empresa: user.empresa || "",
      filial: user.filial || "",
      departamento: user.departamento || "",
    });
    setIsEditOpen(true);
  };

  const openPasswordDialog = (user: any) => {
    setSelectedUser(user);
    setNewPassword("");
    setIsPasswordOpen(true);
  };

  const handleGenerateResetLink = (user: any) => {
    if (!user.email) {
      toast.error("Usuário não possui email cadastrado");
      return;
    }
    setSelectedUser(user);
    generateResetLink.mutate({ userId: user.id });
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(resetLink);
    setCopied(true);
    toast.success("Link copiado!");
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Gestão de Usuários</h1>
          <p className="text-gray-500">Gerencie os usuários do sistema</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="bg-orange-500 hover:bg-orange-600">
              <Plus className="w-4 h-4 mr-2" />
              Novo Usuário
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Criar Novo Usuário</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Usuário *</Label>
                  <Input
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    placeholder="usuario"
                  />
                </div>
                <div>
                  <Label>Senha *</Label>
                  <PasswordInput
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="******"
                    autoComplete="new-password"
                  />
                </div>
              </div>
              <div>
                <Label>Nome Completo *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Nome do usuário"
                />
              </div>
              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="email@exemplo.com"
                />
              </div>
              <div>
                <Label>Perfil de Acesso *</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value: any) => setFormData({ ...formData, role: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Administrador</SelectItem>
                    <SelectItem value="gerente">Gerente</SelectItem>
                    <SelectItem value="vendedor">Vendedor</SelectItem>
                    <SelectItem value="operador">Operador</SelectItem>
                    <SelectItem value="user">Usuário</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>Empresa</Label>
                  <Input
                    value={formData.empresa}
                    onChange={(e) => setFormData({ ...formData, empresa: e.target.value })}
                    placeholder="001"
                  />
                </div>
                <div>
                  <Label>Filial</Label>
                  <Input
                    value={formData.filial}
                    onChange={(e) => setFormData({ ...formData, filial: e.target.value })}
                    placeholder="01"
                  />
                </div>
                <div>
                  <Label>Departamento</Label>
                  <Input
                    value={formData.departamento}
                    onChange={(e) => setFormData({ ...formData, departamento: e.target.value })}
                    placeholder="Vendas"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                  Cancelar
                </Button>
                <Button
                  className="bg-orange-500 hover:bg-orange-600"
                  onClick={handleCreate}
                  disabled={createUser.isPending}
                >
                  {createUser.isPending ? "Criando..." : "Criar Usuário"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Usuário</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Nome Completo</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div>
              <Label>Email</Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div>
              <Label>Perfil de Acesso</Label>
              <Select
                value={formData.role}
                onValueChange={(value: any) => setFormData({ ...formData, role: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Administrador</SelectItem>
                  <SelectItem value="gerente">Gerente</SelectItem>
                  <SelectItem value="vendedor">Vendedor</SelectItem>
                  <SelectItem value="operador">Operador</SelectItem>
                  <SelectItem value="user">Usuário</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Empresa</Label>
                <Input
                  value={formData.empresa}
                  onChange={(e) => setFormData({ ...formData, empresa: e.target.value })}
                />
              </div>
              <div>
                <Label>Filial</Label>
                <Input
                  value={formData.filial}
                  onChange={(e) => setFormData({ ...formData, filial: e.target.value })}
                />
              </div>
              <div>
                <Label>Departamento</Label>
                <Input
                  value={formData.departamento}
                  onChange={(e) => setFormData({ ...formData, departamento: e.target.value })}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsEditOpen(false)}>
                Cancelar
              </Button>
              <Button
                className="bg-orange-500 hover:bg-orange-600"
                onClick={handleEdit}
                disabled={updateUser.isPending}
              >
                {updateUser.isPending ? "Salvando..." : "Salvar"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reset Link Dialog */}
      <Dialog open={isResetLinkOpen} onOpenChange={setIsResetLinkOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Link de Recuperação de Senha</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-500">
              Link gerado para: <strong>{selectedUser?.name}</strong>
            </p>
            <div className="flex gap-2">
              <Input
                value={resetLink}
                readOnly
                className="font-mono text-xs"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={copyToClipboard}
                title="Copiar link"
              >
                {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>
            <p className="text-xs text-gray-400">
              Este link expira em 1 hora. Envie-o ao usuário via WhatsApp, email ou outro meio.
            </p>
            <div className="flex justify-end">
              <Button variant="outline" onClick={() => setIsResetLinkOpen(false)}>
                Fechar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Change Password Dialog */}
      <Dialog open={isPasswordOpen} onOpenChange={setIsPasswordOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Alterar Senha</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-500">
              Alterando senha de: <strong>{selectedUser?.name}</strong>
            </p>
            <div>
              <Label>Nova Senha</Label>
              <PasswordInput
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                autoComplete="new-password"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsPasswordOpen(false)}>
                Cancelar
              </Button>
              <Button
                className="bg-orange-500 hover:bg-orange-600"
                onClick={handleChangePassword}
                disabled={changePassword.isPending || newPassword.length < 6}
              >
                {changePassword.isPending ? "Alterando..." : "Alterar Senha"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Usuário</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Perfil</TableHead>
              <TableHead>Empresa/Filial</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users?.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.name}</TableCell>
                <TableCell>{user.username}</TableCell>
                <TableCell>{user.email || "-"}</TableCell>
                <TableCell>
                  <Badge className={`${ROLE_COLORS[user.role]} text-white`}>
                    {ROLE_LABELS[user.role] || user.role}
                  </Badge>
                </TableCell>
                <TableCell>
                  {user.empresa || "-"} / {user.filial || "-"}
                </TableCell>
                <TableCell>
                  {user.active ? (
                    <Badge className="bg-green-500 text-white">
                      <UserCheck className="w-3 h-3 mr-1" />
                      Ativo
                    </Badge>
                  ) : (
                    <Badge className="bg-gray-400 text-white">
                      <UserX className="w-3 h-3 mr-1" />
                      Inativo
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleGenerateResetLink(user)}
                      title="Gerar Link de Recuperação"
                      disabled={!user.email}
                    >
                      <Link2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openPasswordDialog(user)}
                      title="Alterar Senha"
                    >
                      <Key className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openEditDialog(user)}
                      title="Editar"
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(user)}
                      title="Desativar"
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

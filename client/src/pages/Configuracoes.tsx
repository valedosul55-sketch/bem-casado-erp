import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { User, Lock, Shield, Building } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";

export default function Configuracoes() {
  const { user } = useAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const { data: permissions } = trpc.users.getPermissions.useQuery();

  const changePassword = trpc.users.changePassword.useMutation({
    onSuccess: () => {
      toast.success("Senha alterada com sucesso!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("As senhas não coincidem");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("A senha deve ter no mínimo 6 caracteres");
      return;
    }
    if (!user?.id) {
      toast.error("Usuário não encontrado");
      return;
    }
    changePassword.mutate({
      id: user.id,
      newPassword,
    });
  };

  const PERMISSION_LABELS: Record<string, string> = {
    "*": "Acesso Total",
    dashboard: "Dashboard",
    vendas: "Vendas",
    clientes: "Clientes",
    produtos: "Produtos",
    estoque: "Estoque",
    financeiro: "Financeiro",
    relatorios: "Relatórios",
    cadastros: "Cadastros",
    usuarios: "Usuários",
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Configurações</h1>
          <p className="text-gray-500">Gerencie suas configurações pessoais</p>
        </div>

        <Tabs defaultValue="perfil" className="space-y-4">
          <TabsList>
            <TabsTrigger value="perfil">
              <User className="w-4 h-4 mr-2" />
              Meu Perfil
            </TabsTrigger>
            <TabsTrigger value="senha">
              <Lock className="w-4 h-4 mr-2" />
              Alterar Senha
            </TabsTrigger>
            <TabsTrigger value="permissoes">
              <Shield className="w-4 h-4 mr-2" />
              Permissões
            </TabsTrigger>
          </TabsList>

          <TabsContent value="perfil">
            <Card>
              <CardHeader>
                <CardTitle>Informações do Perfil</CardTitle>
                <CardDescription>Seus dados de usuário no sistema</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-500">Nome</Label>
                    <p className="font-medium">{user?.name || "-"}</p>
                  </div>
                  <div>
                    <Label className="text-gray-500">Usuário</Label>
                    <p className="font-medium">{user?.username || "-"}</p>
                  </div>
                  <div>
                    <Label className="text-gray-500">Email</Label>
                    <p className="font-medium">{user?.email || "-"}</p>
                  </div>
                  <div>
                    <Label className="text-gray-500">Perfil de Acesso</Label>
                    <p className="font-medium capitalize">{user?.role || "-"}</p>
                  </div>
                </div>
                <div className="pt-4 border-t">
                  <div className="flex items-center gap-2 text-gray-500">
                    <Building className="w-4 h-4" />
                    <span>Empresa: {user?.empresa || "-"}</span>
                    <span>|</span>
                    <span>Filial: {user?.filial || "-"}</span>
                    <span>|</span>
                    <span>Departamento: {user?.departamento || "-"}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="senha">
            <Card>
              <CardHeader>
                <CardTitle>Alterar Senha</CardTitle>
                <CardDescription>Atualize sua senha de acesso</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
                  <div>
                    <Label htmlFor="newPassword">Nova Senha</Label>
                    <Input
                      id="newPassword"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Mínimo 6 caracteres"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repita a nova senha"
                      className="mt-1"
                    />
                  </div>
                  <Button
                    type="submit"
                    className="bg-orange-500 hover:bg-orange-600"
                    disabled={changePassword.isPending}
                  >
                    {changePassword.isPending ? "Alterando..." : "Alterar Senha"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="permissoes">
            <Card>
              <CardHeader>
                <CardTitle>Minhas Permissões</CardTitle>
                <CardDescription>
                  Módulos que você tem acesso baseado no seu perfil ({user?.role})
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {permissions?.map((permission) => (
                    <div
                      key={permission}
                      className="flex items-center gap-2 p-3 bg-green-50 rounded-lg border border-green-200"
                    >
                      <Shield className="w-4 h-4 text-green-600" />
                      <span className="text-green-800 font-medium">
                        {PERMISSION_LABELS[permission] || permission}
                      </span>
                    </div>
                  ))}
                </div>
                {permissions?.includes("*") && (
                  <p className="mt-4 text-sm text-gray-500">
                    Você tem acesso total ao sistema como administrador.
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}

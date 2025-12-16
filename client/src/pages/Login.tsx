import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { Cloud, Lock, Building2, GitBranch, Users, User } from "lucide-react";
import { getLoginUrl } from "@/const";

export default function Login() {
  const [, setLocation] = useLocation();
  const [formData, setFormData] = useState({
    empresa: "",
    filial: "",
    departamento: "",
    usuario: "",
    senha: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simular validação e redirecionar para OAuth do Manus
    if (!formData.empresa || !formData.usuario || !formData.senha) {
      toast.error("Por favor, preencha todos os campos obrigatórios");
      setIsLoading(false);
      return;
    }
    
    // Salvar dados do formulário no localStorage para uso posterior
    localStorage.setItem("erp_empresa", formData.empresa);
    localStorage.setItem("erp_filial", formData.filial);
    localStorage.setItem("erp_departamento", formData.departamento);
    
    // Redirecionar para autenticação OAuth
    window.location.href = getLoginUrl();
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden">
      {/* Imagem de fundo com overlay laranja/amarelo */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1556761175-b413da4baf72?ixlib=rb-4.0.3&auto=format&fit=crop&w=1974&q=80')`,
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-amber-500/85 via-orange-400/80 to-yellow-500/75" />
      
      {/* Card de Login */}
      <Card className="relative z-10 w-full max-w-md mx-4 shadow-2xl border-0">
        <CardContent className="p-8">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl font-bold text-orange-600">erp</span>
              <Cloud className="w-10 h-10 text-orange-500 fill-orange-400" />
            </div>
            <h1 className="text-4xl font-bold tracking-tight">
              <span className="text-orange-500">bem</span>
              <span className="text-amber-600">casado</span>
            </h1>
            <p className="text-sm text-muted-foreground mt-1">Sistema de Gestão para Confeitaria</p>
          </div>

          {/* Formulário */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Empresa e Filial */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="empresa" className="text-sm font-medium flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-orange-500" />
                  Empresa
                </Label>
                <Input
                  id="empresa"
                  name="empresa"
                  type="text"
                  placeholder="001"
                  value={formData.empresa}
                  onChange={handleChange}
                  className="border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="filial" className="text-sm font-medium flex items-center gap-2">
                  <GitBranch className="w-4 h-4 text-orange-500" />
                  Filial
                </Label>
                <Input
                  id="filial"
                  name="filial"
                  type="text"
                  placeholder="01"
                  value={formData.filial}
                  onChange={handleChange}
                  className="border-gray-300 focus:border-orange-500 focus:ring-orange-500"
                />
              </div>
            </div>

            {/* Departamento */}
            <div className="space-y-2">
              <Label htmlFor="departamento" className="text-sm font-medium flex items-center gap-2">
                <Users className="w-4 h-4 text-orange-500" />
                Departamento
              </Label>
              <Input
                id="departamento"
                name="departamento"
                type="text"
                placeholder="Vendas"
                value={formData.departamento}
                onChange={handleChange}
                className="border-gray-300 focus:border-orange-500 focus:ring-orange-500"
              />
            </div>

            {/* Usuário */}
            <div className="space-y-2">
              <Label htmlFor="usuario" className="text-sm font-medium flex items-center gap-2">
                <User className="w-4 h-4 text-orange-500" />
                Usuário
              </Label>
              <Input
                id="usuario"
                name="usuario"
                type="text"
                placeholder="seu.usuario"
                value={formData.usuario}
                onChange={handleChange}
                className="border-gray-300 focus:border-orange-500 focus:ring-orange-500"
              />
            </div>

            {/* Senha */}
            <div className="space-y-2">
              <Label htmlFor="senha" className="text-sm font-medium flex items-center gap-2">
                <Lock className="w-4 h-4 text-orange-500" />
                Senha
              </Label>
              <Input
                id="senha"
                name="senha"
                type="password"
                placeholder="••••••••"
                value={formData.senha}
                onChange={handleChange}
                className="border-gray-300 focus:border-orange-500 focus:ring-orange-500"
              />
            </div>

            {/* Botão de Acessar */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-gray-500 to-gray-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-3 transition-all duration-300"
            >
              {isLoading ? "Acessando..." : "Acessar"}
            </Button>
          </form>

          {/* Links */}
          <div className="mt-6 flex flex-col items-center gap-2 text-sm">
            <button 
              type="button"
              className="text-green-600 hover:text-green-700 hover:underline transition-colors"
              onClick={() => toast.info("Funcionalidade em desenvolvimento")}
            >
              Esqueci minha senha
            </button>
            <button 
              type="button"
              className="text-green-600 hover:text-green-700 hover:underline transition-colors"
              onClick={() => toast.info("Funcionalidade em desenvolvimento")}
            >
              Alterar minha senha
            </button>
          </div>

          {/* Versão */}
          <div className="mt-6 text-center text-xs text-muted-foreground">
            v1.0.0
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

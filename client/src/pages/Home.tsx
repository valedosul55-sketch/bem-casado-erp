import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import { Loader2, Cloud, Lock, Building2, Users, Briefcase, User, AlertCircle } from "lucide-react";
import { trpc } from "@/lib/trpc";

// Token storage key
const AUTH_TOKEN_KEY = "bem_casado_auth_token";

export default function Home() {
  const { user, loading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [formData, setFormData] = useState({
    empresa: "BEM CASADO",
    filial: "MATRIZ",
    departamento: "GERAL",
    usuario: "",
    senha: "",
  });
  const [error, setError] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const loginMutation = trpc.auth.localLogin.useMutation({
    onSuccess: (data) => {
      // Store token in localStorage for persistence
      if (data.token) {
        localStorage.setItem(AUTH_TOKEN_KEY, data.token);
      }
      // Redirect to dashboard
      window.location.href = "/dashboard";
    },
    onError: (err) => {
      setError(err.message || "Erro ao fazer login");
      setIsLoggingIn(false);
    },
  });

  useEffect(() => {
    if (isAuthenticated && user) {
      setLocation("/dashboard");
    }
  }, [isAuthenticated, user, setLocation]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!formData.usuario || !formData.senha) {
      setError("Preencha usuário e senha");
      return;
    }

    setIsLoggingIn(true);
    loginMutation.mutate({
      username: formData.usuario,
      password: formData.senha,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-orange-500 mx-auto" />
          <p className="mt-4 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Background with gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-amber-100 via-orange-100 to-yellow-100">
        {/* Decorative circles */}
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-orange-200/50 rounded-full blur-3xl" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] bg-yellow-200/50 rounded-full blur-3xl" />
      </div>

      {/* Login Card */}
      <Card className="relative z-10 w-full max-w-md mx-4 shadow-2xl border-0 bg-white/95 backdrop-blur">
        <CardHeader className="text-center pb-2 pt-8">
          {/* Logo */}
          <div className="flex justify-center mb-4">
            <div className="relative">
              <Cloud className="w-20 h-20 text-orange-400 fill-orange-100" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold text-orange-600">BC</span>
              </div>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-800">BEM CASADO</h1>
          <p className="text-sm text-gray-500">Sistema de Gestão para Confeitaria</p>
        </CardHeader>
        <CardContent className="px-6 pb-8">
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Error message */}
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            {/* Empresa */}
            <div className="space-y-1">
              <Label htmlFor="empresa" className="text-xs text-gray-500 flex items-center gap-1">
                <Building2 className="w-3 h-3" />
                EMPRESA
              </Label>
              <Input
                id="empresa"
                value={formData.empresa}
                onChange={(e) => setFormData({ ...formData, empresa: e.target.value })}
                className="bg-gray-50 border-gray-200"
                readOnly
              />
            </div>

            {/* Filial e Departamento */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="filial" className="text-xs text-gray-500 flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  FILIAL
                </Label>
                <Input
                  id="filial"
                  value={formData.filial}
                  onChange={(e) => setFormData({ ...formData, filial: e.target.value })}
                  className="bg-gray-50 border-gray-200"
                  readOnly
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="departamento" className="text-xs text-gray-500 flex items-center gap-1">
                  <Briefcase className="w-3 h-3" />
                  DEPARTAMENTO
                </Label>
                <Input
                  id="departamento"
                  value={formData.departamento}
                  onChange={(e) => setFormData({ ...formData, departamento: e.target.value })}
                  className="bg-gray-50 border-gray-200"
                  readOnly
                />
              </div>
            </div>

            {/* Usuário */}
            <div className="space-y-1">
              <Label htmlFor="usuario" className="text-xs text-gray-500 flex items-center gap-1">
                <User className="w-3 h-3" />
                USUÁRIO
              </Label>
              <Input
                id="usuario"
                value={formData.usuario}
                onChange={(e) => setFormData({ ...formData, usuario: e.target.value })}
                placeholder="Seu usuário"
                className="bg-gray-50 border-gray-200"
                autoComplete="username"
              />
            </div>

            {/* Senha */}
            <div className="space-y-1">
              <Label htmlFor="senha" className="text-xs text-gray-500 flex items-center gap-1">
                <Lock className="w-3 h-3" />
                SENHA
              </Label>
              <Input
                id="senha"
                type="password"
                value={formData.senha}
                onChange={(e) => setFormData({ ...formData, senha: e.target.value })}
                placeholder="Sua senha"
                className="bg-gray-50 border-gray-200"
                autoComplete="current-password"
              />
            </div>

            {/* Login Button */}
            <Button
              type="submit"
              disabled={isLoggingIn}
              className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold py-6 text-lg shadow-lg shadow-orange-200 disabled:opacity-50"
            >
              {isLoggingIn ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  ENTRANDO...
                </>
              ) : (
                "ENTRAR"
              )}
            </Button>

            {/* Forgot Password */}
            <div className="text-center">
              <Button
                type="button"
                variant="link"
                className="text-orange-600 hover:text-orange-700 text-sm"
                onClick={() => setLocation("/recuperar-senha")}
              >
                Esqueceu a senha?
              </Button>
            </div>

            {/* Footer */}
            <p className="text-center text-xs text-gray-400 pt-2">
              ERP Bem Casado v1.0 - Sistema de Gestão
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

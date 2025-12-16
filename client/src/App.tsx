import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Clientes from "./pages/Clientes";
import Produtos from "./pages/Produtos";
import Estoque from "./pages/Estoque";
import Vendas from "./pages/Vendas";
import Financeiro from "./pages/Financeiro";
import Relatorios from "./pages/Relatorios";
import Cadastros from "./pages/Cadastros";
import Usuarios from "./pages/Usuarios";
import RecuperarSenha, { RedefinirSenha } from "./pages/RecuperarSenha";
import Configuracoes from "./pages/Configuracoes";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/login"} component={Home} />
      <Route path={"/dashboard"} component={Dashboard} />
      <Route path={"/clientes"} component={Clientes} />
      <Route path={"/produtos"} component={Produtos} />
      <Route path={"/estoque"} component={Estoque} />
      <Route path={"/vendas"} component={Vendas} />
      <Route path={"/financeiro"} component={Financeiro} />
      <Route path={"/relatorios"} component={Relatorios} />
      <Route path={"/cadastros"} component={Cadastros} />
      <Route path={"/usuarios"} component={Usuarios} />
      <Route path={"/configuracoes"} component={Configuracoes} />
      <Route path={"/recuperar-senha"} component={RecuperarSenha} />
      <Route path={"/redefinir-senha"} component={RedefinirSenha} />
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;

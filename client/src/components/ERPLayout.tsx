import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Cloud,
  LayoutDashboard,
  ShoppingCart,
  Users,
  Package,
  Warehouse,
  DollarSign,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Bell,
  Database,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ERPLayoutProps {
  children: React.ReactNode;
}

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: ShoppingCart, label: "Vendas", href: "/vendas" },
  { icon: Users, label: "Clientes", href: "/clientes" },
  { icon: Package, label: "Produtos", href: "/produtos" },
  { icon: Warehouse, label: "Estoque", href: "/estoque" },
  { icon: DollarSign, label: "Financeiro", href: "/financeiro" },
  { icon: BarChart3, label: "Relatórios", href: "/relatorios" },
  { icon: Database, label: "Cadastros", href: "/cadastros" },
  { icon: Settings, label: "Configurações", href: "/configuracoes" },
];

export default function ERPLayout({ children }: ERPLayoutProps) {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const empresa = localStorage.getItem("erp_empresa") || "001";
  const filial = localStorage.getItem("erp_filial") || "01";

  const handleLogout = async () => {
    await logout();
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar Desktop */}
      <aside
        className={cn(
          "hidden lg:flex flex-col bg-sidebar text-sidebar-foreground transition-all duration-300",
          sidebarOpen ? "w-64" : "w-20"
        )}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-sidebar-border">
          <Link href="/dashboard" className="flex items-center gap-2">
            <Cloud className="w-8 h-8 text-orange-500 fill-orange-400" />
            {sidebarOpen && (
              <div className="flex flex-col">
                <span className="text-lg font-bold">
                  <span className="text-orange-400">bem</span>
                  <span className="text-amber-400">casado</span>
                </span>
                <span className="text-[10px] text-sidebar-foreground/60">ERP Confeitaria</span>
              </div>
            )}
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-sidebar-foreground hover:bg-sidebar-accent"
          >
            <Menu className="w-5 h-5" />
          </Button>
        </div>

        {/* Empresa/Filial Info */}
        {sidebarOpen && (
          <div className="px-4 py-3 border-b border-sidebar-border">
            <div className="text-xs text-sidebar-foreground/60">Empresa: {empresa}</div>
            <div className="text-xs text-sidebar-foreground/60">Filial: {filial}</div>
          </div>
        )}

        {/* Menu */}
        <ScrollArea className="flex-1 py-4">
          <nav className="px-2 space-y-1">
            {menuItems.map((item) => {
              const isActive = location === item.href || location.startsWith(item.href + "/");
              return (
                <Link key={item.href} href={item.href}>
                  <div
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors cursor-pointer",
                      isActive
                        ? "bg-orange-500 text-white"
                        : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                    )}
                  >
                    <item.icon className="w-5 h-5 flex-shrink-0" />
                    {sidebarOpen && <span className="font-medium">{item.label}</span>}
                  </div>
                </Link>
              );
            })}
          </nav>
        </ScrollArea>

        {/* User Info */}
        <div className="p-4 border-t border-sidebar-border">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-3 w-full hover:bg-sidebar-accent rounded-lg p-2 transition-colors">
                <Avatar className="w-8 h-8">
                  <AvatarFallback className="bg-orange-500 text-white text-sm">
                    {user?.name?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                {sidebarOpen && (
                  <>
                    <div className="flex-1 text-left">
                      <div className="text-sm font-medium truncate">{user?.name || "Usuário"}</div>
                      <div className="text-xs text-sidebar-foreground/60 truncate">
                        {user?.role === "admin" ? "Administrador" : "Usuário"}
                      </div>
                    </div>
                    <ChevronDown className="w-4 h-4 text-sidebar-foreground/60" />
                  </>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => window.location.href = "/configuracoes"}>
                <Settings className="w-4 h-4 mr-2" />
                Configurações
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                <LogOut className="w-4 h-4 mr-2" />
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-sidebar text-sidebar-foreground transform transition-transform lg:hidden",
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="h-16 flex items-center justify-between px-4 border-b border-sidebar-border">
          <Link href="/dashboard" className="flex items-center gap-2">
            <Cloud className="w-8 h-8 text-orange-500 fill-orange-400" />
            <span className="text-lg font-bold">
              <span className="text-orange-400">bem</span>
              <span className="text-amber-400">casado</span>
            </span>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(false)}
            className="text-sidebar-foreground"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        <ScrollArea className="flex-1 py-4">
          <nav className="px-2 space-y-1">
            {menuItems.map((item) => {
              const isActive = location === item.href;
              return (
                <Link key={item.href} href={item.href}>
                  <div
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors cursor-pointer",
                      isActive
                        ? "bg-orange-500 text-white"
                        : "text-sidebar-foreground/80 hover:bg-sidebar-accent"
                    )}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="font-medium">{item.label}</span>
                  </div>
                </Link>
              );
            })}
          </nav>
        </ScrollArea>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-16 bg-card border-b border-border flex items-center justify-between px-4 lg:px-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </Button>
            <div className="hidden sm:block">
              <h1 className="text-lg font-semibold text-foreground">
                {menuItems.find((item) => location.startsWith(item.href))?.label || "Dashboard"}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-orange-500 rounded-full" />
            </Button>
            <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
              <span>Empresa: {empresa}</span>
              <span>|</span>
              <span>Filial: {filial}</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

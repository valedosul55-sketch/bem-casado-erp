import { useState } from "react";
import ERPLayout from "@/components/ERPLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  FolderOpen,
  Folder,
  FileText,
  ChevronRight,
  ChevronDown,
  Search,
  Plus,
  Star,
  Building2,
  Users,
  Settings,
  Receipt,
  DollarSign,
  LayoutGrid,
  Database,
  Sliders,
  FileSearch,
  BarChart3,
  Workflow,
  Link2,
  Calculator,
  FileCode,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Estrutura de menu hierárquico baseada no Omega Light
const menuStructure = [
  {
    id: "cadastros-tabelas",
    label: "Cadastros e Tabelas",
    icon: Database,
    children: [
      {
        id: "tabelas",
        label: "Tabelas",
        icon: LayoutGrid,
        children: [
          { id: "dados-empresa", label: "Dados da Empresa", icon: Building2 },
          { id: "organizacionais", label: "Organizacionais", icon: Users },
          { id: "operacionais", label: "Operacionais", icon: Settings },
          { id: "fiscais", label: "Fiscais", icon: Receipt },
          { id: "financeiras", label: "Financeiras", icon: DollarSign },
          { id: "gerais", label: "Gerais", icon: FileText },
        ],
      },
      {
        id: "cadastros",
        label: "Cadastros",
        icon: FolderOpen,
        children: [
          { id: "clientes", label: "Clientes", icon: Users },
          { id: "fornecedores", label: "Fornecedores", icon: Building2 },
          { id: "produtos", label: "Produtos", icon: FileText },
          { id: "servicos", label: "Serviços", icon: Settings },
        ],
      },
      {
        id: "parametros",
        label: "Parâmetros",
        icon: Sliders,
        children: [
          { id: "param-gerais", label: "Gerais", icon: Settings },
          { id: "param-vendas", label: "Vendas", icon: Receipt },
          { id: "param-estoque", label: "Estoque", icon: Database },
        ],
      },
      {
        id: "consultas",
        label: "Consultas",
        icon: FileSearch,
        children: [
          { id: "consulta-clientes", label: "Clientes", icon: Users },
          { id: "consulta-produtos", label: "Produtos", icon: FileText },
          { id: "consulta-pedidos", label: "Pedidos", icon: Receipt },
        ],
      },
      {
        id: "relatorios",
        label: "Relatórios",
        icon: BarChart3,
        children: [
          { id: "rel-vendas", label: "Vendas", icon: FileText },
          { id: "rel-financeiro", label: "Financeiro", icon: DollarSign },
          { id: "rel-estoque", label: "Estoque", icon: Database },
        ],
      },
      {
        id: "processos",
        label: "Processos",
        icon: Workflow,
        children: [
          { id: "proc-importacao", label: "Importação", icon: FileCode },
          { id: "proc-exportacao", label: "Exportação", icon: FileCode },
        ],
      },
      {
        id: "integradoras",
        label: "Integradoras",
        icon: Link2,
        children: [
          { id: "int-api", label: "APIs", icon: FileCode },
          { id: "int-webhook", label: "Webhooks", icon: Link2 },
        ],
      },
      {
        id: "saldos-iniciais",
        label: "Saldos Iniciais",
        icon: Calculator,
        children: [
          { id: "saldo-estoque", label: "Estoque", icon: Database },
          { id: "saldo-financeiro", label: "Financeiro", icon: DollarSign },
        ],
      },
      {
        id: "workflow",
        label: "Workflow",
        icon: Workflow,
        children: [],
      },
      {
        id: "relatorios-config",
        label: "Relatórios Configurados",
        icon: FileCode,
        children: [],
      },
    ],
  },
];

// Dados de exemplo para a tabela
const dadosEmpresa = [
  { dig: "001", ccm: "12345678", nome: "BEM CASADO ALIMENTOS LTDA", cidade: "São Paulo", endereco: "Rua das Flores, 123" },
];

interface MenuItem {
  id: string;
  label: string;
  icon: any;
  children?: MenuItem[];
}

interface TreeItemProps {
  item: MenuItem;
  level: number;
  selectedId: string | null;
  onSelect: (id: string) => void;
  expandedIds: Set<string>;
  toggleExpand: (id: string) => void;
}

function TreeItem({ item, level, selectedId, onSelect, expandedIds, toggleExpand }: TreeItemProps) {
  const hasChildren = item.children && item.children.length > 0;
  const isExpanded = expandedIds.has(item.id);
  const isSelected = selectedId === item.id;
  const Icon = item.icon;

  return (
    <div>
      <div
        className={cn(
          "flex items-center gap-2 py-1.5 px-2 rounded cursor-pointer transition-colors",
          isSelected ? "bg-orange-100 text-orange-700" : "hover:bg-muted"
        )}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
        onClick={() => {
          if (hasChildren) {
            toggleExpand(item.id);
          }
          onSelect(item.id);
        }}
      >
        {hasChildren ? (
          isExpanded ? (
            <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          ) : (
            <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          )
        ) : (
          <span className="w-4" />
        )}
        {hasChildren ? (
          isExpanded ? (
            <FolderOpen className="w-4 h-4 text-amber-500 flex-shrink-0" />
          ) : (
            <Folder className="w-4 h-4 text-amber-500 flex-shrink-0" />
          )
        ) : (
          <Icon className="w-4 h-4 text-muted-foreground flex-shrink-0" />
        )}
        <span className="text-sm truncate">{item.label}</span>
        <Star className="w-3 h-3 text-muted-foreground/50 ml-auto flex-shrink-0 hover:text-amber-500" />
      </div>
      {hasChildren && isExpanded && (
        <div>
          {item.children!.map((child) => (
            <TreeItem
              key={child.id}
              item={child}
              level={level + 1}
              selectedId={selectedId}
              onSelect={onSelect}
              expandedIds={expandedIds}
              toggleExpand={toggleExpand}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function Cadastros() {
  const [selectedId, setSelectedId] = useState<string | null>("dados-empresa");
  const [expandedIds, setExpandedIds] = useState<Set<string>>(
    new Set(["cadastros-tabelas", "tabelas"])
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [maxRows, setMaxRows] = useState("100");

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const getSelectedLabel = () => {
    const findLabel = (items: MenuItem[]): string | null => {
      for (const item of items) {
        if (item.id === selectedId) return item.label;
        if (item.children) {
          const found = findLabel(item.children);
          if (found) return found;
        }
      }
      return null;
    };
    return findLabel(menuStructure) || "Selecione um item";
  };

  return (
    <ERPLayout>
      <div className="flex h-[calc(100vh-8rem)] gap-0 -m-4 lg:-m-6">
        {/* Sidebar com menu hierárquico */}
        {sidebarOpen && (
          <div className="w-80 bg-card border-r flex flex-col">
            {/* Header do painel */}
            <div className="bg-orange-500 text-white p-2 flex items-center justify-between">
              <span className="font-medium text-sm">Cadastros e Tabelas</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-white hover:bg-orange-600"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Busca */}
            <div className="p-2 border-b flex gap-2">
              <Input
                placeholder="Buscar..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-8 text-sm"
              />
              <Button size="icon" className="h-8 w-8 bg-orange-500 hover:bg-orange-600">
                <Search className="w-4 h-4" />
              </Button>
              <Button size="icon" variant="outline" className="h-8 w-8 text-orange-500 border-orange-500">
                <span className="text-lg font-bold">−</span>
              </Button>
            </div>

            {/* Árvore de menu */}
            <ScrollArea className="flex-1">
              <div className="p-2">
                {menuStructure.map((item) => (
                  <TreeItem
                    key={item.id}
                    item={item}
                    level={0}
                    selectedId={selectedId}
                    onSelect={setSelectedId}
                    expandedIds={expandedIds}
                    toggleExpand={toggleExpand}
                  />
                ))}
              </div>
            </ScrollArea>
          </div>
        )}

        {/* Conteúdo principal */}
        <div className="flex-1 flex flex-col bg-background">
          {/* Toolbar */}
          <div className="border-b p-2 flex items-center justify-between bg-card">
            <div className="flex items-center gap-2">
              {!sidebarOpen && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSidebarOpen(true)}
                  className="text-orange-500"
                >
                  <FolderOpen className="w-4 h-4 mr-1" />
                  Menu
                </Button>
              )}
              <h2 className="font-medium">{getSelectedLabel()}</h2>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Máx.</span>
              <Input
                value={maxRows}
                onChange={(e) => setMaxRows(e.target.value)}
                className="w-16 h-8 text-sm"
              />
            </div>
          </div>

          {/* Tabela de dados */}
          <div className="flex-1 overflow-auto p-4">
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[80px]">
                        <div className="flex items-center gap-1">
                          Dig
                          <ChevronDown className="w-3 h-3" />
                        </div>
                      </TableHead>
                      <TableHead className="w-[120px]">
                        <div className="flex items-center gap-1">
                          CCM
                          <ChevronDown className="w-3 h-3" />
                        </div>
                      </TableHead>
                      <TableHead>
                        <div className="flex items-center gap-1">
                          Nome
                          <ChevronDown className="w-3 h-3" />
                        </div>
                      </TableHead>
                      <TableHead className="w-[150px]">
                        <div className="flex items-center gap-1">
                          Cidade
                          <ChevronDown className="w-3 h-3" />
                        </div>
                      </TableHead>
                      <TableHead>
                        <div className="flex items-center gap-1">
                          Endereço
                          <ChevronDown className="w-3 h-3" />
                        </div>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedId === "dados-empresa" ? (
                      dadosEmpresa.map((row, index) => (
                        <TableRow key={index} className="cursor-pointer hover:bg-muted">
                          <TableCell>{row.dig}</TableCell>
                          <TableCell>{row.ccm}</TableCell>
                          <TableCell className="font-medium">{row.nome}</TableCell>
                          <TableCell>{row.cidade}</TableCell>
                          <TableCell>{row.endereco}</TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                          Selecione um item no menu para visualizar os dados
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Footer com total */}
            <div className="flex justify-end mt-2 text-sm text-muted-foreground">
              Total: {selectedId === "dados-empresa" ? dadosEmpresa.length : 0}
            </div>
          </div>
        </div>
      </div>
    </ERPLayout>
  );
}

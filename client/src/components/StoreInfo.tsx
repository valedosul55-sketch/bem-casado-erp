import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Ruler, Package, ShoppingCart, Building2 } from 'lucide-react';

export default function StoreInfo() {
  return (
    <div className="absolute top-4 left-4 z-10 max-w-md">
      <Card className="bg-white/95 backdrop-blur">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Building2 className="h-6 w-6 text-primary" />
            <CardTitle>Loja de Fábrica Bem Casado</CardTitle>
          </div>
          <CardDescription>
            Visualização 3D interativa do layout da loja física
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Ruler className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Dimensões da Loja</span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-sm">
              <div className="bg-muted p-2 rounded">
                <div className="font-semibold">31m</div>
                <div className="text-xs text-muted-foreground">Largura</div>
              </div>
              <div className="bg-muted p-2 rounded">
                <div className="font-semibold">15m</div>
                <div className="text-xs text-muted-foreground">Profundidade</div>
              </div>
              <div className="bg-muted p-2 rounded">
                <div className="font-semibold">8m</div>
                <div className="text-xs text-muted-foreground">Altura</div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Produtos Disponíveis</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="bg-orange-100 border-orange-300">
                Arroz Parboilizado
              </Badge>
              <Badge variant="outline" className="bg-red-100 border-red-300">
                Arroz Branco
              </Badge>
              <Badge variant="outline" className="bg-blue-100 border-blue-300">
                Arroz Mix
              </Badge>
              <Badge variant="outline" className="bg-amber-100 border-amber-300">
                Feijão Preto
              </Badge>
              <Badge variant="outline" className="bg-yellow-100 border-yellow-300">
                Feijão Carioca
              </Badge>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Infraestrutura</span>
            </div>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>• 30 pallets organizados em 5 fileiras</li>
              <li>• 2 caixas registradoras no lado direito</li>
              <li>• Produtos empilhados até 1,5m de altura</li>
              <li>• Espaçamento adequado para circulação</li>
            </ul>
          </div>

          <div className="pt-2 border-t">
            <p className="text-xs text-muted-foreground">
              💡 Use o mouse para rotacionar, zoom e explorar a loja em 3D
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

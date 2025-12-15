import { useState } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { Button } from './ui/button';

export default function TestModeBanner() {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 px-4 relative">
      <div className="container mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <div className="flex-1">
            <p className="font-semibold text-sm md:text-base">
              🚧 Loja em Fase de Testes
            </p>
            <p className="text-xs md:text-sm opacity-90">
              Compras online estarão disponíveis em breve! Por enquanto, visite nossa loja física para aproveitar os melhores preços.
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsVisible(false)}
          className="text-white hover:bg-white/20 flex-shrink-0"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

import { X } from 'lucide-react';
import { useState } from 'react';

export default function InaugurationBanner() {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="relative bg-gradient-to-r from-primary via-pink-600 to-primary text-white py-3 px-4 overflow-hidden">
      {/* Animação de flash/brilho */}
      <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-transparent via-white/20 to-transparent" />
      
      <div className="container relative z-10">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 text-center">
            <p className="text-sm md:text-base font-bold animate-bounce">
              🛒 ABERTO NESTE SÁBADO! 🛒
            </p>
            <p className="text-xs md:text-sm mt-1">
              <span className="font-bold text-yellow-300">13 de Dezembro - 7h às 13h</span> - Venha conhecer nossa loja de fábrica com preços imperíveis!<br/>
              <span className="font-bold text-yellow-300">Retorna dia 10/01/2026</span> no mesmo horário!
            </p>
          </div>
          
          <button
            onClick={() => setIsVisible(false)}
            className="flex-shrink-0 hover:bg-white/20 rounded-full p-1 transition-colors"
            aria-label="Fechar banner"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Efeito de brilho animado */}
      <style>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        
        .animate-shimmer {
          animation: shimmer 3s infinite;
        }
      `}</style>
      <div className="absolute inset-0 animate-shimmer bg-gradient-to-r from-transparent via-white/30 to-transparent" />
    </div>
  );
}

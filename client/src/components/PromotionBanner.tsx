import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Clock, Tag } from 'lucide-react';
import { getActivePromotions, getRemainingTime, Promotion } from '@/data/promotions';

export default function PromotionBanner() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [timeRemaining, setTimeRemaining] = useState<ReturnType<typeof getRemainingTime> | null>(null);

  useEffect(() => {
    const active = getActivePromotions();
    setPromotions(active);
  }, []);

  useEffect(() => {
    if (promotions.length === 0) return;

    // Auto-rotate banners every 5 seconds
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % promotions.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [promotions.length]);

  useEffect(() => {
    if (promotions.length === 0) return;

    // Update countdown timer every second
    const updateTimer = () => {
      const remaining = getRemainingTime(promotions[currentIndex].endDate);
      setTimeRemaining(remaining);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [currentIndex, promotions]);

  if (promotions.length === 0) {
    return null;
  }

  const currentPromo = promotions[currentIndex];

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + promotions.length) % promotions.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % promotions.length);
  };

  return (
    <Card className="relative overflow-hidden">
      <div
        className="p-8 text-white transition-colors duration-500"
        style={{ backgroundColor: currentPromo.bannerColor }}
      >
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Conteúdo da promoção */}
          <div className="flex-1 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-3 mb-3">
              <span className="text-5xl">{currentPromo.icon}</span>
              <Badge className="bg-white text-gray-900 hover:bg-gray-100 text-lg px-4 py-1">
                <Tag className="h-4 w-4 mr-2" />
                {currentPromo.discount}% OFF
              </Badge>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-2">{currentPromo.title}</h2>
            <p className="text-lg md:text-xl opacity-90">{currentPromo.description}</p>
          </div>

          {/* Timer de contagem regressiva */}
          {timeRemaining && !timeRemaining.expired && (
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-6 min-w-[280px]">
              <div className="flex items-center justify-center gap-2 mb-3">
                <Clock className="h-5 w-5" />
                <span className="font-semibold text-lg">Termina em:</span>
              </div>
              <div className="grid grid-cols-4 gap-2 text-center">
                <div className="bg-white/30 rounded-lg p-2">
                  <div className="text-2xl font-bold">{timeRemaining.days}</div>
                  <div className="text-xs opacity-90">Dias</div>
                </div>
                <div className="bg-white/30 rounded-lg p-2">
                  <div className="text-2xl font-bold">{timeRemaining.hours}</div>
                  <div className="text-xs opacity-90">Horas</div>
                </div>
                <div className="bg-white/30 rounded-lg p-2">
                  <div className="text-2xl font-bold">{timeRemaining.minutes}</div>
                  <div className="text-xs opacity-90">Min</div>
                </div>
                <div className="bg-white/30 rounded-lg p-2">
                  <div className="text-2xl font-bold">{timeRemaining.seconds}</div>
                  <div className="text-xs opacity-90">Seg</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navegação */}
        {promotions.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full p-2 transition-all"
              aria-label="Promoção anterior"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full p-2 transition-all"
              aria-label="Próxima promoção"
            >
              <ChevronRight className="h-6 w-6" />
            </button>

            {/* Indicadores */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {promotions.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    idx === currentIndex ? 'bg-white w-8' : 'bg-white/50'
                  }`}
                  aria-label={`Ir para promoção ${idx + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </Card>
  );
}

import { MapPin, Phone, Mail, Clock } from 'lucide-react';
import { useState } from 'react';
import Newsletter from './Newsletter';
import HowToGetThereModal from './HowToGetThereModal';
import { VisaIcon, MastercardIcon, EloIcon, AmexIcon, HipercardIcon, PixIcon, AleloIcon, SodexoIcon, TicketIcon, VRIcon, IFoodIcon } from "@/components/PaymentIcons";

export default function Footer() {
  const [isHowToGetThereModalOpen, setIsHowToGetThereModalOpen] = useState(false);
  return (
    <footer className="mt-auto">
      {/* Newsletter */}
      <Newsletter />

      {/* Informações de contato */}
      <div className="bg-gray-900 text-white py-8">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Endereço */}
            <div>
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                Localização
              </h3>
              <p className="text-gray-300 text-sm mb-4">
                Av. Capão Grosso, 257 - Capão Grosso<br/>São José dos Campos - SP
              </p>
              <button
                onClick={() => setIsHowToGetThereModalOpen(true)}
                className="inline-flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-3 rounded-lg font-bold transition-all hover:scale-105 shadow-lg hover:shadow-xl"
              >
                <MapPin className="h-5 w-5" />
                Como Chegar
              </button>
            </div>

            {/* Contato */}
            <div>
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <Phone className="h-5 w-5 text-primary" />
                Contato
              </h3>
              <div className="space-y-2 text-gray-300 text-sm">
                <a 
                  href="https://wa.me/551239075811"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 hover:text-primary transition-colors"
                >
                  <Phone className="h-4 w-4" />
                  (12) 3907-5811
                </a>
                <a 
                  href="tel:+551232074000"
                  className="flex items-center gap-2 hover:text-primary transition-colors"
                >
                  <Phone className="h-4 w-4" />
                  (12) 3207-4000
                </a>
                <p className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  contato@arrozbemcasado.com.br
                </p>
              </div>
            </div>

            {/* Horário */}
            <div>
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Horário de Funcionamento
              </h3>
              <div className="space-y-1 text-gray-300 text-sm">
                <p>Sábado: 7h às 13h</p>
                <p className="text-gray-400 text-xs mt-2">Fechado nos outros dias</p>
              </div>
            </div>
          </div>

          {/* Formas de Pagamento */}
          <div className="border-t border-gray-800 mt-8 pt-8">
            <h3 className="font-bold text-lg mb-4 text-center">Formas de Pagamento Aceitas</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Cartões de Crédito/Débito */}
              <div>
                <h4 className="text-sm font-semibold text-gray-300 mb-3">Cartão de Crédito/Débito</h4>
                <div className="flex flex-wrap gap-3">
                  <VisaIcon className="h-10" />
                  <MastercardIcon className="h-10" />
                  <EloIcon className="h-10" />
                  <HipercardIcon className="h-10" />
                  <AmexIcon className="h-10" />
                </div>
              </div>

              {/* Vales Alimentação e Refeição */}
              <div>
                <h4 className="text-sm font-semibold text-gray-300 mb-3">Vales Alimentação/Refeição</h4>
                <div className="flex flex-wrap gap-3">
                  <AleloIcon className="h-10" />
                  <SodexoIcon className="h-10" />
                  <TicketIcon className="h-10" />
                  <VRIcon className="h-10" />
                  <IFoodIcon className="h-10" />
                </div>
              </div>

              {/* Pix */}
              <div>
                <h4 className="text-sm font-semibold text-gray-300 mb-3">Pix</h4>
                <div className="flex flex-wrap gap-3">
                  <PixIcon className="h-12" />
                </div>
              </div>
            </div>
            <p className="text-center text-gray-400 text-xs mt-4">Pagamentos processados com segurança pelo SafraPay</p>
          </div>

          {/* Copyright */}
          <div className="border-t border-gray-800 mt-8 pt-6 text-center text-gray-400 text-sm">
            <p>&copy; {new Date().getFullYear()} Bem Casado Alimentos. Todos os direitos reservados.</p>
          </div>
        </div>
      </div>

      {/* Modal Como Chegar */}
      <HowToGetThereModal
        open={isHowToGetThereModalOpen}
        onOpenChange={setIsHowToGetThereModalOpen}
      />
    </footer>
  );
}

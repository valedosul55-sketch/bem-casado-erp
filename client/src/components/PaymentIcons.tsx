// Componente com badges simples de formas de pagamento
// Usando apenas texto e cores das bandeiras para máxima compatibilidade

interface IconProps {
  className?: string;
}

// CARTÕES DE CRÉDITO/DÉBITO

export const VisaIcon = ({ className = "h-10" }: IconProps) => (
  <div className={`${className} flex items-center justify-center bg-[#1A1F71] text-white font-bold px-3 rounded text-sm`}>
    VISA
  </div>
);

export const MastercardIcon = ({ className = "h-10" }: IconProps) => (
  <div className={`${className} flex items-center justify-center bg-black text-white font-bold px-3 rounded text-sm`}>
    MASTERCARD
  </div>
);

export const EloIcon = ({ className = "h-10" }: IconProps) => (
  <div className={`${className} flex items-center justify-center bg-[#FFCB05] text-black font-bold px-3 rounded text-sm`}>
    ELO
  </div>
);

export const HipercardIcon = ({ className = "h-10" }: IconProps) => (
  <div className={`${className} flex items-center justify-center bg-[#C8102E] text-white font-bold px-3 rounded text-sm`}>
    HIPERCARD
  </div>
);

export const AmexIcon = ({ className = "h-10" }: IconProps) => (
  <div className={`${className} flex items-center justify-center bg-[#006FCF] text-white font-bold px-3 rounded text-sm`}>
    AMEX
  </div>
);

// PIX

export const PixIcon = ({ className = "h-10" }: IconProps) => (
  <div className={`${className} flex items-center justify-center bg-[#32BCAD] text-white font-bold px-3 rounded text-sm`}>
    PIX
  </div>
);

// VALES ALIMENTAÇÃO/REFEIÇÃO

export const SodexoIcon = ({ className = "h-10" }: IconProps) => (
  <div className={`${className} flex items-center justify-center bg-[#2D1B4E] text-white font-bold px-3 rounded text-sm`}>
    SODEXO
  </div>
);

export const TicketIcon = ({ className = "h-10" }: IconProps) => (
  <div className={`${className} flex items-center justify-center bg-[#E31E24] text-white font-bold px-3 rounded text-sm`}>
    TICKET
  </div>
);

export const VRIcon = ({ className = "h-10" }: IconProps) => (
  <div className={`${className} flex items-center justify-center bg-[#00A859] text-white font-bold px-3 rounded text-sm`}>
    VR
  </div>
);

export const AleloIcon = ({ className = "h-10" }: IconProps) => (
  <div className={`${className} flex items-center justify-center bg-[#00A99D] text-white font-bold px-3 rounded text-sm`}>
    ALELO
  </div>
);

export const IFoodIcon = ({ className = "h-10" }: IconProps) => (
  <div className={`${className} flex items-center justify-center bg-[#EA1D2C] text-white font-bold px-3 rounded text-sm`}>
    IFOOD
  </div>
);

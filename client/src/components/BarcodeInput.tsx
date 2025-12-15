import { Input } from './ui/input';

interface BarcodeInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  id?: string;
}

/**
 * Campo de input simples para código de barras
 * Funciona naturalmente com leitores USB/Bluetooth que simulam teclado
 */
export function BarcodeInput({ value, onChange, placeholder, className, id }: BarcodeInputProps) {
  return (
    <div className="relative">
      <Input
        id={id}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={className}
        autoComplete="off"
        maxLength={13}
      />
      <div className="text-xs text-green-600 mt-1 flex items-center gap-1">
        <span>✅</span>
        <span>Campo otimizado para leitor de código de barras - Clique e escaneie!</span>
      </div>
    </div>
  );
}

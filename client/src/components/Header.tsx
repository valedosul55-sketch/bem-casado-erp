import { Link, useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { APP_TITLE } from '@/const';
import { Home, Info, Crown, MapPin } from 'lucide-react';

export default function Header() {
  const [location] = useLocation();

  return (
    <header className="bg-primary text-primary-foreground shadow-lg sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/">
            <a className="text-2xl font-bold hover:opacity-80 transition-opacity cursor-pointer">
              {APP_TITLE}
            </a>
          </Link>

          {/* Navegação */}
          <nav className="flex items-center gap-2">
            <Link href="/">
              <Button
                variant={location === '/' ? 'secondary' : 'ghost'}
                className="flex items-center gap-2"
              >
                <Home className="h-4 w-4" />
                <span className="hidden sm:inline">Loja</span>
              </Button>
            </Link>
            <Link href="/clube-vip">
              <Button
                variant={location === '/clube-vip' ? 'secondary' : 'ghost'}
                className="flex items-center gap-2"
              >
                <Crown className="h-4 w-4" />
                <span className="hidden sm:inline">Clube VIP</span>
              </Button>
            </Link>
            <Link href="/como-chegar">
              <Button
                variant={location === '/como-chegar' ? 'secondary' : 'ghost'}
                className="flex items-center gap-2"
              >
                <MapPin className="h-4 w-4" />
                <span className="hidden sm:inline">Como Chegar</span>
              </Button>
            </Link>

            <Link href="/sobre">
              <Button
                variant={location === '/sobre' ? 'secondary' : 'ghost'}
                className="flex items-center gap-2"
              >
                <Info className="h-4 w-4" />
                <span className="hidden sm:inline">Sobre Nós</span>
              </Button>
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}

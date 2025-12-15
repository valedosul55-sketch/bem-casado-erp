import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, Router as WouterRouter } from "wouter";
import { BASE_PATH } from "./config";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import About from "./pages/About";
import VipClub from "./pages/VipClub";
import Checkout from "./pages/Checkout";
import OrderConfirmation from "./pages/OrderConfirmation";
import Admin from "./pages/Admin";
import AdminNFCe from "./pages/AdminNFCe";
import AdminDashboard from "./pages/AdminDashboard";
import POS from "./pages/POS";
import GestaoNFCe from "./pages/GestaoNFCe";
import ComoChegar from "./pages/ComoChegar";
import Monitor from "./pages/Monitor";
import AdminReports from "./pages/AdminReports";
import ApiDocs from "./pages/ApiDocs";
import AdminBatches from "./pages/AdminBatches";
import AdminStockSettings from "./pages/AdminStockSettings";
import AdminMonitoring from "./pages/AdminMonitoring";

import { CartProvider } from "./contexts/CartContext";
import ShoppingCart from "./components/ShoppingCart";
import Header from "./components/Header";
import WhatsAppButton from "./components/WhatsAppButton";
import InaugurationBanner from "./components/InaugurationBanner";
import TestModeBanner from "./components/TestModeBanner";
import { useAutoUpdate } from "./hooks/useAutoUpdate";

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <WouterRouter base={BASE_PATH}>
      <TestModeBanner />
      <InaugurationBanner />
      <Header />
      <Switch>
        <Route path={"/"} component={Home} />
        <Route path={"/clube-vip"} component={VipClub} />
        <Route path={"/como-chegar"} component={ComoChegar} />

        <Route path={"/checkout"} component={Checkout} />
        <Route path={"/order-confirmation/:orderId"} component={OrderConfirmation} />
        <Route path={"/admin"} component={Admin} />
        <Route path={"/admin/dashboard"} component={AdminDashboard} />
        <Route path={"/admin/nfce"} component={AdminNFCe} />
        <Route path={"/pdv"} component={POS} />
        <Route path={"/gestao-nfce"} component={GestaoNFCe} />
        <Route path={"/monitor"} component={Monitor} />
        <Route path={"/admin/relatorios"} component={AdminReports} />
        <Route path={"/api/docs"} component={ApiDocs} />
        <Route path={"/admin/lotes"} component={AdminBatches} />
        <Route path={"/admin/estoque/configuracoes"} component={AdminStockSettings} />
        <Route path={"/admin/monitoramento"} component={AdminMonitoring} />
        <Route path={"/404"} component={NotFound} />
        {/* Final fallback route */}
        <Route component={NotFound} />
      </Switch>
    </WouterRouter>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  // Hook para detectar e aplicar atualizações automaticamente
  useAutoUpdate();
  
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        // switchable
      >
        <CartProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
          <ShoppingCart />
          <WhatsAppButton />
        </TooltipProvider>
        </CartProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;

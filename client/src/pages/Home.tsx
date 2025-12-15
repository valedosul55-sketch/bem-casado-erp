import StoreVisualization from "@/components/StoreVisualization";
import Footer from "@/components/Footer";
import AppDownloadBanner from "@/components/AppDownloadBanner";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <AppDownloadBanner />
      <main className="flex-1 container py-8">
        <StoreVisualization />
      </main>
      <Footer />
    </div>
  );
}

import { Outlet } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { ToastProvider } from "@/components/ui/use-toast";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function MainLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <div className="min-h-screen bg-white flex flex-col">
          <Header />
          <main className="pt-16 flex-grow">
            <Outlet />
          </main>
          <Footer />
          <Toaster />
        </div>
      </ToastProvider>
    </QueryClientProvider>
  );
}

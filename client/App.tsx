import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import CardDetail from "./pages/CardDetail";
import Cards from "./pages/Cards";
import Archetypes from "./pages/Archetypes";
import About from "./pages/About";
import Inventory from "./pages/Inventory";
import NotFound from "./pages/NotFound";
import Admin from "./pages/Admin";
import Order from "./pages/Order";
import CardInput from "./pages/CardMarket/CardInput";
import CardPrice from "./pages/CardMarket/CardPrice";
import Cart from "./pages/Cart";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/card/:id" element={<CardDetail />} />
          <Route path="/cards" element={<Cards />} />
          <Route path="/archetypes" element={<Archetypes />} />
          <Route path="/about" element={<About />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/order" element={<Order />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/cardInput" element={<CardInput />} />
          <Route path="/cardPrice" element={<CardPrice />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);

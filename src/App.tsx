import React from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { Layout } from "./components/layout/Layout";
import { Home } from "./pages/Home";
import { Products } from "./pages/Products";
import { Cart } from "./pages/Cart";
import { Categories } from "./pages/Categories";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import LoginPage from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import ProfilePage from './pages/ProfilePage';
import { OrderDetailsPage } from './pages/OrderDetailsPage';
import { FloatingDock } from "@/components/ui/floating-dock";
import { CartProvider } from "@/hooks/useCart";
import { WishlistProvider, useWishlist } from "@/hooks/useWishlist";
import {
  IconBrandGithub,
  IconBrandX,
  IconExchange,
  IconNewSection,
  IconTerminal2,
  IconShoppingCart,
  IconHome,
  IconLogout,
  IconHeart
} from "@tabler/icons-react";
import { useAuth } from "./hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { Wishlist } from "./pages/Wishlist";
import { About } from "./pages/About";
import { Checkout } from "./pages/Checkout";

const queryClient = new QueryClient();

function useDockLinks() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const { wishlist } = useWishlist();
  
  return [
    {
      title: "Home",
      icon: <IconHome className="h-full w-full text-white" />,
      href: "/home",
    },
    {
      title: "Products",
      icon: <IconTerminal2 className="h-full w-full text-white" />,
      href: "/products",
    },
    {
      title: "Categories",
      icon: <IconNewSection className="h-full w-full text-white" />,
      href: "/categories",
    },
    {
      title: "About",
      icon: <IconExchange className="h-full w-full text-white" />,
      href: "/about",
    },
    {
      title: "Cart",
      icon: <IconShoppingCart className="h-full w-full text-white" />,
      href: "/cart",
      showBadge: true,
    },
    {
      title: "Wishlist",
      icon: <IconHeart className="h-full w-full text-white" />,
      href: "/wishlist",
      showBadge: true,
      badgeCount: wishlist.length,
    },
    {
      title: "Logout",
      icon: <IconLogout className="h-full w-full text-white" />,
      onClick: () => {
        logout();
        navigate("/login");
      },
    },
  ];
}

function DockWithLinks() {
  const location = useLocation();
  if (location.pathname === "/login") return null;
  const dockLinks = useDockLinks();
  return (
    <div className="fixed bottom-4 left-0 w-full flex justify-center z-50">
      <FloatingDock items={dockLinks} />
    </div>
  );
}

const App = () => {
  return (
    <div className="min-h-screen bg-black relative">
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <CartProvider>
              <WishlistProvider>
                <Routes>
                  <Route path="/chat" element={<Index />} />
                  <Route path="/" element={<Index key="home" />} />
                  <Route path="/home" element={
                    <Layout>
                      <Home />
                    </Layout>
                  } />
                  <Route path="/products" element={
                    <Layout>
                      <Products />
                    </Layout>
                  } />
                  <Route path="/cart" element={
                    <Layout>
                      <Cart />
                    </Layout>
                  } />
                  <Route path="/checkout" element={
                    <Layout>
                      <Checkout />
                    </Layout>
                  } />
                  <Route path="/wishlist" element={
                    <Layout>
                      <Wishlist />
                    </Layout>
                  } />
                  <Route path="/categories" element={
                    <Layout>
                      <Categories />
                    </Layout>
                  } />
                  <Route path="/about" element={
                    <Layout>
                      <About />
                    </Layout>
                  } />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/signup" element={<SignupPage />} />
                  <Route path="/profile" element={
                    <Layout>
                      <ProfilePage />
                    </Layout>
                  } />
                  <Route path="/profile/orders/:orderId" element={
                    <Layout>
                      <OrderDetailsPage />
                    </Layout>
                  } />
                  <Route path="*" element={<NotFound />} />
                </Routes>
                <DockWithLinks />
              </WishlistProvider>
            </CartProvider>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </div>
  );
};

export default App;

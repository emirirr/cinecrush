import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route } from "react-router-dom";
import { useEffect, useState } from "react";
import Navbar from "@/components/shared/Navbar";
import { initAnalytics } from "@/lib/firebase";
import Landing from "@/pages/Landing";
import Discover from "@/pages/Discover";
import SwipeMatch from "@/pages/SwipeMatch";
import Matches from "@/pages/Matches";
import Chat from "@/pages/Chat";
import UserProfile from "@/pages/UserProfile";
import Profile from "@/pages/Profile";
import ProtectedRoute from "@/components/shared/ProtectedRoute";
import ThemeProvider from "@/components/shared/ThemeProvider";
import MessageNotifications from "@/components/shared/MessageNotifications";
import Login from "@/pages/auth/Login";
import Register from "@/pages/auth/Register";
import ForgotPassword from "@/pages/auth/ForgotPassword";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  const [promptEvent, setPromptEvent] = useState<any>(null);
  const [updateAvailable, setUpdateAvailable] = useState(false);

  useEffect(() => {
    initAnalytics();
    const onBeforeInstall = (e: any) => {
      e.preventDefault();
      setPromptEvent(e);
    };
    window.addEventListener('beforeinstallprompt', onBeforeInstall);

    const onSWUpdated = () => setUpdateAvailable(true);
    window.addEventListener('swUpdated', onSWUpdated as any);

    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall);
      window.removeEventListener('swUpdated', onSWUpdated as any);
    };
  }, []);

  const triggerInstall = async () => {
    if (!promptEvent) return;
    await promptEvent.prompt();
    setPromptEvent(null);
  };

  const reloadForUpdate = () => window.location.reload();

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <HashRouter>
          <ThemeProvider>
          <div className="min-h-screen bg-background">
            <MessageNotifications />
            {/* Simple install/update prompts */}
            {promptEvent && (
              <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 bg-card border border-border rounded-full px-4 py-2 shadow">
                <button className="text-sm" onClick={triggerInstall}>Install Cinecrush</button>
              </div>
            )}
            {updateAvailable && (
              <div className="fixed bottom-36 left-1/2 -translate-x-1/2 z-50 bg-card border border-border rounded-full px-4 py-2 shadow">
                <button className="text-sm" onClick={reloadForUpdate}>Update available — Reload</button>
              </div>
            )}
            <Routes>
              {/* Auth routes - no navbar */}
              <Route path="/auth/login" element={<Login />} />
              <Route path="/auth/register" element={<Register />} />
              <Route path="/auth/forgot-password" element={<ForgotPassword />} />
              
              {/* Main app routes - with navbar */}
              <Route path="/*" element={
                <>
                  <Navbar />
                  <Routes>
                    <Route path="/" element={<Landing />} />
                    <Route path="/discover" element={<Discover />} />
                    <Route path="/swipe" element={<SwipeMatch />} />
                    <Route path="/matches" element={<Matches />} />
                    <Route path="/user/:id" element={<UserProfile />} />
                    <Route path="/chat" element={<Chat />} />
                    <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                    {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </>
              } />
            </Routes>
          </div>
          </ThemeProvider>
        </HashRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;

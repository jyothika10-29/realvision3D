import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";

import Home from "@/pages/Home";
import PropertyDetail from "@/pages/PropertyDetail";
import ARView from "@/pages/ARView";
import VirtualTourPage from "@/pages/VirtualTourPage";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import Search from "@/pages/Search";
import Properties from "@/pages/Properties";
import ProfilePage from "@/pages/ProfilePage";
import PlotDesignerPage from "@/pages/PlotDesignerPage";
import AddPropertyPage from "@/pages/AddPropertyPage";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { AuthProvider } from "@/hooks/use-auth";
import { ThemeProvider, useTheme } from "@/hooks/use-theme";
import { ProtectedRoute } from "./lib/protected-route";

const MainLayout = ({ children }: { children: React.ReactNode }) => {
  const { theme } = useTheme();
  
  return (
    <div className={`flex flex-col min-h-screen transition-colors duration-300 ${
      theme === 'dark' 
        ? 'bg-slate-900 text-slate-100' 
        : 'bg-white text-slate-900'
    }`}>
      <Header />
      <div className="flex-grow">{children}</div>
      <Footer />
    </div>
  );
};

function Router() {
  return (
    <Switch>
      <Route path="/auth">
        {() => <AuthPage />}
      </Route>
      
      <Route path="/search">
        {() => (
          <MainLayout>
            <Search />
          </MainLayout>
        )}
      </Route>
      
      <Route path="/properties">
        {() => (
          <MainLayout>
            <Properties />
          </MainLayout>
        )}
      </Route>
      
      <ProtectedRoute 
        path="/properties/:id/ar" 
        component={() => (
          <ARView />
        )}
      />
      
      <ProtectedRoute 
        path="/properties/:id/design" 
        component={() => (
          <MainLayout>
            <PlotDesignerPage />
          </MainLayout>
        )}
      />
      
      <ProtectedRoute 
        path="/properties/:id/virtual-tour/:tourId" 
        component={VirtualTourPage}
      />
      
      <Route path="/properties/:id">
        {({ id }) => (
          <MainLayout>
            <PropertyDetail />
          </MainLayout>
        )}
      </Route>
      
      <ProtectedRoute 
        path="/profile" 
        component={() => (
          <MainLayout>
            <ProfilePage />
          </MainLayout>
        )}
      />
      
      <ProtectedRoute 
        path="/add-property" 
        component={() => (
          <MainLayout>
            <AddPropertyPage />
          </MainLayout>
        )}
      />
      
      <Route path="/">
        {() => (
          <MainLayout>
            <Home />
          </MainLayout>
        )}
      </Route>
      
      <Route>
        {() => (
          <MainLayout>
            <NotFound />
          </MainLayout>
        )}
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <Router />
          <Toaster />
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import PropertyCard from "@/components/PropertyCard";
import FilterControls from "@/components/FilterControls";
import { Property } from "@shared/schema";
import { ChevronRight, Building, MapPin, Compass, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/use-theme";

export default function Home() {
  const { theme } = useTheme();
  const [showPropertyGrid, setShowPropertyGrid] = useState(false);
  const [filters, setFilters] = useState({
    priceRange: "all",
    bedrooms: "all",
    propertyType: "all"
  });

  // Fetch properties from backend with direct fetch
  const { data: properties, isLoading, error } = useQuery<Property[]>({
    queryKey: ['/api/properties'],
    queryFn: async () => {
      try {
        const res = await fetch('/api/properties', {
          credentials: "include"
        });
        
        if (!res.ok) {
          throw new Error(`Failed to fetch properties: ${res.status}`);
        }
        
        return await res.json();
      } catch (error) {
        console.error("Error fetching properties:", error);
        throw error;
      }
    },
    retry: 1,
    refetchOnWindowFocus: false,
  });

  // Apply filters to properties
  const filteredProperties = properties ? properties.filter(property => {
    if (filters.priceRange !== "all") {
      const [min, max] = filters.priceRange.split("-").map(Number);
      const propertyPrice = Number(property.price);
      
      if (max && (propertyPrice < min || propertyPrice > max)) {
        return false;
      }
      
      if (!max && propertyPrice < min) {
        return false;
      }
    }
    
    if (filters.bedrooms !== "all") {
      const bedroomsValue = parseInt(filters.bedrooms);
      const propertyBedrooms = typeof property.bedrooms === 'string' 
        ? parseInt(property.bedrooms) 
        : property.bedrooms;
      
      if (propertyBedrooms < bedroomsValue) {
        return false;
      }
    }
    
    if (filters.propertyType !== "all" && property.type !== filters.propertyType) {
      return false;
    }
    
    return true;
  }) : [];

  // If showPropertyGrid is false, show the landing page
  if (!showPropertyGrid) {
    return (
      <div className={`min-h-screen overflow-hidden ${
        theme === 'dark' 
          ? 'bg-slate-900 text-slate-100' 
          : 'bg-white text-gray-800'
      }`}>
        {/* Header with Logo */}
        <header className="absolute top-0 left-0 w-full z-50 py-6 px-8">
          {/* This header is now hidden to avoid conflict with the main header */}
        </header>

        {/* Hero Section */}
        <section className="relative min-h-screen flex flex-col justify-center">
          {/* Removed background image for clean white background */}
          
          <div className="container mx-auto px-4 z-10 mt-20">
            <div className="flex flex-col md:flex-row items-center gap-10">
              <div className="md:w-1/2">
                <div className="inline-block mb-4 px-3 py-1 bg-primary/10 backdrop-blur-md border border-primary/20 rounded-full text-primary text-sm font-medium">
                  Transforming Real Estate Exploration
                </div>
                <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-gray-800 to-primary">
                    Experience Properties in Augmented Reality
                  </span>
                </h1>
                <p className="text-xl text-gray-600 mb-10 max-w-2xl">
                  RealVisionAR brings properties to life through immersive AR technology. Visualize your future home in 3D before ever setting foot inside.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button 
                    onClick={() => setShowPropertyGrid(true)}
                    className="text-lg font-medium px-8 py-6"
                  >
                    Explore Properties <ChevronRight className="ml-2 h-5 w-5" />
                  </Button>
                  <Button 
                      variant="outline" 
                      className="text-lg font-medium px-8 py-6 border-gray-200 hover:bg-gray-100"
                    >
                      Learn More
                    </Button>
                </div>
              </div>

              <div className="md:w-1/2 mt-10 md:mt-0 relative">
                {/* Interactive environment hologram effect around container */}
                <div className="absolute -inset-4 bg-gradient-to-r from-blue-600/10 via-indigo-600/5 to-purple-600/10 rounded-3xl blur-xl"></div>
                <div className="absolute -right-10 top-1/2 -translate-y-1/2 w-20 h-20 bg-blue-500/20 rounded-full animate-[ping_4s_cubic-bezier(0,0,0.2,1)_infinite]"></div>
                <div className="absolute -left-10 top-1/3 w-32 h-32 bg-indigo-600/10 rounded-full blur-3xl animate-[pulse_7s_ease-in-out_infinite]"></div>
                
                {/* Dynamic Pulse Ring Effect */}
                <div className="absolute inset-0 rounded-2xl">
                  <div className="absolute inset-0 rounded-2xl border-2 border-blue-500/20 animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite]"></div>
                  <div className="absolute inset-0 rounded-2xl border border-blue-500/30 animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite_0.75s]"></div>
                  <div className="absolute inset-0 rounded-2xl border border-blue-500/10 animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite_1.5s]"></div>
                </div>
                
                <div className="relative w-full aspect-[4/3] bg-gradient-to-br from-primary/30 to-primary/5 rounded-2xl shadow-2xl overflow-hidden border border-white/20 backdrop-blur-sm z-10">
                  {/* Interactive AR View Preview with 3D Elements */}
                  <div className="absolute inset-0">
                    {/* Camera Feed Simulation with enhanced gradient */}
                    <div className="absolute inset-0 bg-gradient-to-r from-slate-900/90 via-blue-900/80 to-indigo-900/90"></div>
                    
                    {/* Parallax Scanning Grid Animation */}
                    <div className="absolute inset-0 bg-[url('/models/ar-grid.svg')] bg-cover opacity-30 animate-pulse" 
                      style={{backgroundPosition: 'center', backgroundSize: '120%'}}></div>
                    
                    {/* Subtle particle effect overlay */}
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4zIi8+PC9zdmc+')] opacity-30"></div>
                    
                    {/* Futuristic Scanner Effect */}
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                      <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500/0 via-blue-500/80 to-blue-500/0 animate-scan" 
                        style={{
                          animation: 'scanVertical 4s ease-in-out infinite',
                          boxShadow: '0 0 20px 5px rgba(59, 130, 246, 0.5)'
                        }}>
                      </div>
                    </div>
                    
                    {/* Augmented Reality Coordinate System */}
                    <div className="absolute left-0 right-0 bottom-12 flex justify-center">
                      <div className="flex gap-4 px-4 py-2 bg-slate-900/40 backdrop-blur-sm rounded-lg border border-blue-500/20">
                        <div className="flex items-center gap-1 text-xs text-blue-200">
                          <span className="w-3 h-3 inline-block bg-red-500/80 rounded-full"></span>
                          <span>X</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-blue-200">
                          <span className="w-3 h-3 inline-block bg-green-500/80 rounded-full"></span>
                          <span>Y</span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-blue-200">
                          <span className="w-3 h-3 inline-block bg-blue-500/80 rounded-full"></span>
                          <span>Z</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Enhanced Holographic AR Placement Indicator */}
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                      <div className="relative">
                        {/* Exterior circles with different animations */}
                        <div className="h-20 w-20 rounded-full border-2 border-blue-500 border-dashed animate-[spin_8s_linear_infinite] opacity-70"></div>
                        <div className="absolute inset-0 h-16 w-16 m-auto rounded-full border border-blue-400/50 animate-[spin_12s_linear_infinite_reverse] opacity-60"></div>
                        <div className="absolute inset-0 h-12 w-12 m-auto rounded-full border border-indigo-500/60 border-dotted animate-[spin_6s_linear_infinite] opacity-70"></div>
                        
                        {/* AR targeting center */}
                        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-5 w-5 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 animate-pulse-custom"></div>
                        
                        {/* Crosshair elements */}
                        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-[calc(50%+14px)] h-4 w-px bg-blue-400/70"></div>
                        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-[calc(50%-14px)] h-4 w-px bg-blue-400/70"></div>
                        <div className="absolute left-1/2 top-1/2 -translate-x-[calc(50%+14px)] -translate-y-1/2 h-px w-4 bg-blue-400/70"></div>
                        <div className="absolute left-1/2 top-1/2 -translate-x-[calc(50%-14px)] -translate-y-1/2 h-px w-4 bg-blue-400/70"></div>
                        
                        {/* Holographic decorative elements */}
                        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-24 w-24 rounded-full border border-blue-500/20 animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite]"></div>
                      </div>
                    </div>
                    
                    {/* AR Floating Data Panels */}
                    <div className="absolute right-8 top-1/4 px-3 py-2 bg-blue-900/40 backdrop-blur-sm rounded-lg border border-blue-500/30 animate-float text-left">
                      <div className="text-blue-100 text-xs font-mono">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
                          <span>Model: LuxMod 3-BR</span>
                        </div>
                        <div className="mt-1 text-blue-200/80 text-[10px]">Surface tracking: 98%</div>
                      </div>
                    </div>
                    
                    <div className="absolute left-8 top-2/3 px-3 py-2 bg-indigo-900/40 backdrop-blur-sm rounded-lg border border-indigo-500/30 animate-float text-left" style={{animationDelay: '0.5s'}}>
                      <div className="text-blue-100 text-xs font-mono">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse"></span>
                          <span>Scale: 1:50</span>
                        </div>
                        <div className="mt-1 text-blue-200/80 text-[10px]">AR depth: optimal</div>
                      </div>
                    </div>
                    
                    {/* 3D Model Preview (Modern House Silhouette) */}
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72">
                      <img 
                        src="/models/modern-house-preview.svg" 
                        alt="3D House Model" 
                        className="w-full h-full object-contain opacity-95 animate-float animate-pulse-custom"
                        style={{
                          transform: "scale(1.5)",
                          animation: 'float 3s ease-in-out infinite',
                          filter: 'drop-shadow(0 0 10px rgba(59, 130, 246, 0.6))'
                        }}
                      />
                    </div>
                    
                    {/* AR Measurement Lines */}
                    <div className="absolute left-1/3 top-3/4 w-1/3 h-px bg-blue-400/70"></div>
                    <div className="absolute left-1/3 top-3/4 w-px h-6 bg-blue-400/70"></div>
                    <div className="absolute left-1/3 top-3/4 text-[10px] text-blue-400/90 ml-2 mt-1">12.5m</div>
                    
                    {/* AR UI Elements */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-3">
                      <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white/90">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15 15l-6-6M9 15l6-6" />
                        </svg>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white/90">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14" />
                        </svg>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white/90">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14" />
                        </svg>
                      </div>
                    </div>
                    
                    {/* AR Focus Points */}
                    <div className="absolute left-1/4 top-1/3">
                      <div className="h-1.5 w-1.5 rounded-full bg-blue-400/70 animate-ping"></div>
                    </div>
                    <div className="absolute right-1/3 top-1/4">
                      <div className="h-1.5 w-1.5 rounded-full bg-blue-400/70 animate-ping" style={{animationDelay: '1s'}}></div>
                    </div>
                    
                    {/* AR Detection Text */}
                    <div className="absolute top-3 left-1/2 -translate-x-1/2 px-2 py-1 bg-blue-900/60 backdrop-blur-sm text-blue-100 text-xs rounded">
                      Surface Detected
                    </div>
                  </div>
                </div>
                
                {/* Status Indicators */}
                <div className="absolute -bottom-4 -right-4 bg-white/10 backdrop-blur-md p-3 rounded-xl border border-white/20 z-50">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
                    <span className="text-sm font-medium">Real-time AR Processing</span>
                  </div>
                </div>
                
                {/* Highlight Rings */}
                <div className="absolute -right-3 -top-3 w-24 h-24 bg-blue-500/20 rounded-full animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite]"></div>
                <div className="absolute -left-6 -bottom-6 w-36 h-36 bg-indigo-600/10 rounded-full blur-2xl"></div>
              </div>
            </div>

            <div className="mt-20 flex justify-center">
              <a href="#features" className="animate-bounce inline-flex flex-col items-center text-white/60 hover:text-white/90">
                <span className="text-sm font-medium mb-2">Discover More</span>
                <ArrowDown className="h-5 w-5" />
              </a>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className={`py-24 relative overflow-hidden ${
          theme === 'dark' 
            ? 'bg-slate-800 text-slate-100' 
            : 'bg-white text-gray-800'
        }`}>
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <div className="inline-block mb-4 px-3 py-1 bg-primary/10 backdrop-blur-md border border-primary/20 rounded-full text-primary text-sm font-medium">
                Revolutionary Technology
              </div>
              <h2 className={`text-4xl md:text-5xl font-bold mb-6 ${
                theme === 'dark' ? 'text-slate-100' : 'text-gray-800'
              }`}>
                Cutting-Edge Features
              </h2>
              <p className={`text-lg max-w-2xl mx-auto ${
                theme === 'dark' ? 'text-slate-300' : 'text-gray-600'
              }`}>
                RealVisionAR combines the latest in augmented reality and 3D rendering to provide an unparalleled property exploration experience.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className={`p-8 rounded-2xl shadow-lg border transition-all hover:translate-y-[-5px] hover:border-primary/30 ${
                theme === 'dark' 
                  ? 'bg-slate-700 border-slate-600 text-slate-100' 
                  : 'bg-white border-gray-100 text-gray-800'
              }`}>
                <div className="h-14 w-14 bg-primary/20 text-primary rounded-xl flex items-center justify-center mb-6 text-2xl">
                  <Building className="h-7 w-7" />
                </div>
                <h3 className={`text-xl font-bold mb-4 ${
                  theme === 'dark' ? 'text-white' : 'text-gray-800'
                }`}>Immersive 3D Visualization</h3>
                <p className={
                  theme === 'dark' ? 'text-slate-300' : 'text-gray-600'
                }>
                  View properties in stunning 3D detail from any angle. Get a realistic sense of space and layout before ever setting foot inside.
                </p>
              </div>
              
              {/* Feature 2 */}
              <div className={`p-8 rounded-2xl shadow-lg border transition-all hover:translate-y-[-5px] hover:border-primary/30 ${
                theme === 'dark' 
                  ? 'bg-slate-700 border-slate-600 text-slate-100' 
                  : 'bg-white border-gray-100 text-gray-800'
              }`}>
                <div className="h-14 w-14 bg-primary/20 text-primary rounded-xl flex items-center justify-center mb-6 text-2xl">
                  <MapPin className="h-7 w-7" />
                </div>
                <h3 className={`text-xl font-bold mb-4 ${
                  theme === 'dark' ? 'text-white' : 'text-gray-800'
                }`}>Augmented Reality Tours</h3>
                <p className={
                  theme === 'dark' ? 'text-slate-300' : 'text-gray-600'
                }>
                  Use your mobile device to place properties in your real environment. Walk around and explore homes as if they were right in front of you.
                </p>
              </div>
              
              {/* Feature 3 */}
              <div className={`p-8 rounded-2xl shadow-lg border transition-all hover:translate-y-[-5px] hover:border-primary/30 ${
                theme === 'dark' 
                  ? 'bg-slate-700 border-slate-600 text-slate-100' 
                  : 'bg-white border-gray-100 text-gray-800'
              }`}>
                <div className="h-14 w-14 bg-primary/20 text-primary rounded-xl flex items-center justify-center mb-6 text-2xl">
                  <Compass className="h-7 w-7" />
                </div>
                <h3 className={`text-xl font-bold mb-4 ${
                  theme === 'dark' ? 'text-white' : 'text-gray-800'
                }`}>Interactive Floorplans</h3>
                <p className={
                  theme === 'dark' ? 'text-slate-300' : 'text-gray-600'
                }>
                  Click on any room to get detailed information and visualize furniture placement, room dimensions, and design possibilities.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className={`py-24 relative overflow-hidden ${
          theme === 'dark' 
            ? 'bg-slate-900 text-slate-100' 
            : 'bg-white text-gray-800'
        }`}>
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <div className="inline-block mb-4 px-3 py-1 bg-primary/10 backdrop-blur-md border border-primary/20 rounded-full text-primary text-sm font-medium">
                Simple Process
              </div>
              <h2 className={`text-4xl md:text-5xl font-bold mb-6 ${
                theme === 'dark' ? 'text-slate-100' : 'text-gray-800'
              }`}>
                How RealVisionAR Works
              </h2>
              <p className={`text-lg max-w-2xl mx-auto ${
                theme === 'dark' ? 'text-slate-300' : 'text-gray-600'
              }`}>
                Our platform makes it easy to explore properties in augmented reality with just a few simple steps.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
              <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-primary/0 via-primary/50 to-primary/0 hidden md:block"></div>
              
              {/* Step 1 */}
              <div className={`relative flex flex-col items-center text-center p-8 shadow-sm rounded-lg border ${
                theme === 'dark' 
                  ? 'bg-slate-700 border-slate-600' 
                  : 'bg-white border-gray-100'
              }`}>
                <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-white font-bold text-xl mb-6 relative z-10">
                  1
                </div>
                <h3 className={`text-xl font-bold mb-4 ${
                  theme === 'dark' ? 'text-white' : 'text-gray-800'
                }`}>Browse Properties</h3>
                <p className={
                  theme === 'dark' ? 'text-slate-300' : 'text-gray-600'
                }>
                  Explore our extensive catalog of available properties with detailed information and high-quality images.
                </p>
              </div>
              
              {/* Step 2 */}
              <div className={`relative flex flex-col items-center text-center p-8 shadow-sm rounded-lg border ${
                theme === 'dark' 
                  ? 'bg-slate-700 border-slate-600' 
                  : 'bg-white border-gray-100'
              }`}>
                <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-white font-bold text-xl mb-6 relative z-10">
                  2
                </div>
                <h3 className={`text-xl font-bold mb-4 ${
                  theme === 'dark' ? 'text-white' : 'text-gray-800'
                }`}>Select AR View</h3>
                <p className={
                  theme === 'dark' ? 'text-slate-300' : 'text-gray-600'
                }>
                  Choose a property and click on the AR view option to experience it in augmented reality on your device.
                </p>
              </div>
              
              {/* Step 3 */}
              <div className={`relative flex flex-col items-center text-center p-8 shadow-sm rounded-lg border ${
                theme === 'dark' 
                  ? 'bg-slate-700 border-slate-600' 
                  : 'bg-white border-gray-100'
              }`}>
                <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-white font-bold text-xl mb-6 relative z-10">
                  3
                </div>
                <h3 className={`text-xl font-bold mb-4 ${
                  theme === 'dark' ? 'text-white' : 'text-gray-800'
                }`}>Immersive Experience</h3>
                <p className={
                  theme === 'dark' ? 'text-slate-300' : 'text-gray-600'
                }>
                  Place the 3D model in your environment and walk around to explore every detail of your potential new home.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className={`py-24 relative overflow-hidden border-t ${
          theme === 'dark' 
            ? 'bg-slate-800 border-slate-700' 
            : 'bg-white border-gray-100'
        }`}>
          <div className="container mx-auto px-4 text-center">
            <h2 className={`text-4xl md:text-5xl font-bold mb-6 ${
              theme === 'dark' ? 'text-slate-100' : 'text-gray-800'
            }`}>Ready to transform your property search?</h2>
            <p className={`text-lg max-w-2xl mx-auto mb-10 ${
              theme === 'dark' ? 'text-slate-300' : 'text-gray-600'
            }`}>
              Join thousands of satisfied users who have found their dream homes using RealVisionAR's immersive technology.
            </p>
            <Button 
              onClick={() => setShowPropertyGrid(true)}
              size="lg"
              className="text-lg font-medium px-10 py-6"
            >
              Start Exploring Properties <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </section>

        {/* Footer */}
        <footer className={`py-12 border-t ${
          theme === 'dark' 
            ? 'bg-slate-900 border-slate-800' 
            : 'bg-white border-gray-100'
        }`}>
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="mb-6 md:mb-0">
                <span className="text-primary text-xl font-bold font-heading block mb-4">
                  RealVision<span className="text-amber-500">AR</span>
                </span>
                <p className={`text-sm ${
                  theme === 'dark' ? 'text-slate-400' : 'text-gray-500'
                }`}>© 2025 RealVisionAR. All rights reserved.</p>
              </div>
              <div className="flex gap-8">
                <a href="#" className={`transition-colors ${
                  theme === 'dark' 
                    ? 'text-slate-400 hover:text-slate-200' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}>Privacy Policy</a>
                <a href="#" className={`transition-colors ${
                  theme === 'dark' 
                    ? 'text-slate-400 hover:text-slate-200' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}>Terms of Service</a>
                <a href="#" className={`transition-colors ${
                  theme === 'dark' 
                    ? 'text-slate-400 hover:text-slate-200' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}>Contact Us</a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    );
  }

  // If showPropertyGrid is true, show the property listing grid
  return (
    <main className={`min-h-screen ${
      theme === 'dark' 
        ? 'bg-slate-900 text-slate-100' 
        : 'bg-white text-gray-800'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 pt-8">
        <div className="flex flex-col md:flex-row justify-between items-start mb-10">
          <div>
            <span className="text-primary text-2xl font-bold font-heading block mb-6">
              RealVision<span className="text-amber-500">AR</span>
            </span>
            <h1 className={`text-3xl font-bold mb-3 ${
              theme === 'dark' ? 'text-slate-100' : 'text-gray-800'
            }`}>Explore Properties</h1>
            <p className={
              theme === 'dark' ? 'text-slate-300 max-w-xl' : 'text-gray-600 max-w-xl'
            }>Find your dream home with immersive AR visualization and take virtual tours from anywhere</p>
          </div>
          
          <div className="flex flex-col md:flex-row items-center gap-4 mt-6 md:mt-0">
            <Button 
              onClick={() => setShowPropertyGrid(false)} 
              variant="outline"
              className={
                theme === 'dark'
                  ? 'border-slate-700 text-slate-200 hover:bg-slate-800 w-full md:w-auto'
                  : 'border-gray-200 text-gray-700 hover:bg-gray-100 w-full md:w-auto'
              }
            >
              Back to Landing Page
            </Button>
            <FilterControls filters={filters} setFilters={setFilters} />
          </div>
        </div>

        <div className={`mb-8 p-6 rounded-xl border ${
          theme === 'dark' 
            ? 'bg-slate-800 border-slate-700' 
            : 'bg-gray-50 border-gray-100'
        }`}>
          <div className="text-center">
            <h2 className={`text-xl font-medium mb-2 ${
              theme === 'dark' ? 'text-slate-100' : 'text-gray-800'
            }`}>Find Your Perfect Property</h2>
            <p className={
              theme === 'dark' ? 'text-slate-300' : 'text-gray-600'
            }>Browse our selection of premium properties with AR visualization</p>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className={`rounded-xl shadow-sm overflow-hidden h-96 animate-pulse border ${
                theme === 'dark' 
                  ? 'bg-slate-800 border-slate-700' 
                  : 'bg-white border-gray-100'
              }`}>
                <div className={`h-48 sm:h-64 ${
                  theme === 'dark' ? 'bg-slate-700' : 'bg-gray-100'
                }`}></div>
                <div className="p-4">
                  <div className={`h-4 rounded w-3/4 mb-2 ${
                    theme === 'dark' ? 'bg-slate-700' : 'bg-gray-100'
                  }`}></div>
                  <div className={`h-4 rounded w-1/2 mb-4 ${
                    theme === 'dark' ? 'bg-slate-700' : 'bg-gray-100'
                  }`}></div>
                  <div className={`h-4 rounded w-full ${
                    theme === 'dark' ? 'bg-slate-700' : 'bg-gray-100'
                  }`}></div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className={`p-6 rounded-xl ${
            theme === 'dark' 
              ? 'bg-red-500/5 border border-red-500/10 text-red-300' 
              : 'bg-red-500/10 border border-red-500/20 text-red-400'
          }`}>
            <p>Error loading properties. Please try again later.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProperties.length > 0 ? (
              filteredProperties.map(property => (
                <PropertyCard key={property.id} property={property} />
              ))
            ) : (
              <div className={`col-span-1 sm:col-span-2 lg:col-span-3 text-center py-12 rounded-xl border ${
                theme === 'dark' 
                  ? 'bg-slate-800 border-slate-700 text-slate-300' 
                  : 'bg-gray-50 border-gray-100 text-gray-600'
              }`}>
                <p>No properties match your current filters. Try adjusting your search criteria.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}

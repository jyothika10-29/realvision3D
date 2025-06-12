import { useState, useEffect } from "react";
import { useParams, Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Property } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Home, CameraIcon } from "lucide-react";
import SimpleARViewer from "@/components/SimpleARViewer";

export default function ARView() {
  const { id } = useParams();
  const [modelView, setModelView] = useState("exterior");
  const [showARView, setShowARView] = useState(false);
  const [, navigate] = useLocation();

  const { data: property, isLoading } = useQuery<Property>({
    queryKey: [`/api/properties/${id}`],
    queryFn: async () => {
      try {
        const res = await fetch(`/api/properties/${id}`, {
          credentials: "include"
        });
        
        if (!res.ok) {
          throw new Error(`Failed to fetch property: ${res.status}`);
        }
        
        return await res.json();
      } catch (error) {
        console.error("Error fetching property for AR view:", error);
        throw error;
      }
    },
    retry: 1,
    refetchOnWindowFocus: false,
  });

  // Add/remove AR active class to body
  useEffect(() => {
    if (showARView) {
      // Add AR-specific class to body when AR view is active
      document.body.classList.add('ar-viewer-active');
    } else {
      // Remove class when AR view is closed
      document.body.classList.remove('ar-viewer-active');
    }
    
    // Cleanup function to ensure class is removed when component unmounts
    return () => {
      document.body.classList.remove('ar-viewer-active');
    };
  }, [showARView]);

  // Handle launching AR view with explicit camera permission request
  const launchAR = async () => {
    // First request camera permissions before showing AR view
    // This will trigger the browser's permission dialog
    try {
      console.log('Pre-requesting camera permissions before AR launch');
      
      // Using standard getUserMedia to request camera access
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
      
      // Immediately stop all tracks to release the camera
      stream.getTracks().forEach(track => {
        console.log('Stopping camera track', track.kind);
        track.stop();
      });
      
      console.log('Camera permissions granted, launching AR view');
      // Now show the AR view since we have camera permission
      setShowARView(true);
    } catch (error) {
      console.error('Camera permission denied:', error);
      // Show notification about camera permissions
      alert('Camera access is required for AR view. Please allow camera permissions and try again.');
    }
  };

  // Handle closing AR view
  const closeAR = () => {
    setShowARView(false);
  };

  // Handle navigating back to property detail
  const goBackToProperty = () => {
    navigate(`/properties/${id}`);
  };

  // If AR view is active, show the SimpleAR viewer
  if (showARView) {
    return <SimpleARViewer propertyId={id || "1"} modelType={modelView} onClose={closeAR} />;
  }

  return (
    <main className="bg-gradient-to-b from-slate-900 to-black min-h-screen text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Top navigation */}
        <div className="flex justify-between items-center mb-8">
          <Button 
            variant="ghost" 
            onClick={goBackToProperty} 
            className="text-white hover:bg-white/10 flex items-center"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to Property
          </Button>
          
          <h1 className="text-xl font-semibold">AR Visualization</h1>
        </div>
        
        {/* AR Preview Section */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 mb-8">
          <h2 className="text-lg font-medium mb-4">Property AR Experience</h2>
          
          <div className="aspect-video bg-gradient-to-br from-blue-900/40 to-indigo-900/40 rounded-lg flex flex-col items-center justify-center mb-4 border border-white/10 relative overflow-hidden">
            {/* Preview image or loading state */}
            {isLoading ? (
              <div className="animate-pulse flex flex-col items-center">
                <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p>Loading property details...</p>
              </div>
            ) : (
              <>
                <img 
                  src="/models/house-preview.svg" 
                  alt="AR Preview" 
                  className="w-44 h-44 object-contain mb-4 opacity-80"
                />
                <p className="text-lg font-medium mb-1">{property?.title || 'Property Model'}</p>
                <p className="text-sm text-slate-300 mb-4">Ready for AR Viewing</p>
                
                <Button 
                  onClick={launchAR}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 px-6 py-6 rounded-full flex items-center gap-3 text-lg font-medium transition-all hover:scale-105"
                >
                  <CameraIcon className="h-6 w-6" />
                  Launch AR View
                </Button>
              </>
            )}
          </div>
          
          <div className="bg-slate-900/50 rounded-lg p-4">
            <h3 className="font-medium mb-2 text-blue-300">How AR Mode Works</h3>
            <ul className="text-sm space-y-2 text-slate-300">
              <li className="flex items-start">
                <span className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mr-2 mt-0.5">1</span>
                <span>Tap "Launch AR View" to start the AR experience</span>
              </li>
              <li className="flex items-start">
                <span className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mr-2 mt-0.5">2</span>
                <span>Allow camera permissions when prompted</span>
              </li>
              <li className="flex items-start">
                <span className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mr-2 mt-0.5">3</span>
                <span>The 3D model will appear in your space</span>
              </li>
              <li className="flex items-start">
                <span className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mr-2 mt-0.5">4</span>
                <span>Use on-screen controls to interact with the model</span>
              </li>
            </ul>
          </div>
        </div>
        
        {/* Model Selection */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6">
          <h2 className="text-lg font-medium mb-4">Select Model View</h2>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <button 
              className={`aspect-square bg-slate-700/50 rounded-lg flex flex-col items-center justify-center transition-all hover:bg-slate-700 ${modelView === 'exterior' ? 'ring-2 ring-blue-500 bg-slate-700' : ''}`}
              onClick={() => setModelView('exterior')}
            >
              <Home className="h-8 w-8 mb-2 text-blue-400" />
              <span>Exterior</span>
            </button>
            
            <button 
              className={`aspect-square bg-slate-700/50 rounded-lg flex flex-col items-center justify-center transition-all hover:bg-slate-700 ${modelView === 'interior' ? 'ring-2 ring-blue-500 bg-slate-700' : ''}`}
              onClick={() => setModelView('interior')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8 mb-2 text-blue-400">
                <path d="M12 22v-7" />
                <path d="M5 22v-8.5a7 7 0 0 1 14 0V22" />
                <path d="M18 2H6" />
                <path d="M2 14h20" />
              </svg>
              <span>Interior</span>
            </button>
            
            <button 
              className={`aspect-square bg-slate-700/50 rounded-lg flex flex-col items-center justify-center transition-all hover:bg-slate-700 ${modelView === 'full' ? 'ring-2 ring-blue-500 bg-slate-700' : ''}`}
              onClick={() => setModelView('full')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8 mb-2 text-blue-400">
                <rect width="18" height="18" x="3" y="3" />
                <path d="M7 7v10" />
                <path d="M17 7v10" />
                <path d="M3 12h18" />
              </svg>
              <span>Full View</span>
            </button>
            
            <button 
              className={`aspect-square bg-slate-700/50 rounded-lg flex flex-col items-center justify-center transition-all hover:bg-slate-700 ${modelView === 'floorplan' ? 'ring-2 ring-blue-500 bg-slate-700' : ''}`}
              onClick={() => setModelView('floorplan')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8 mb-2 text-blue-400">
                <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                <line x1="3" x2="21" y1="9" y2="9" />
                <line x1="9" x2="9" y1="21" y2="9" />
              </svg>
              <span>Floor Plan</span>
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}

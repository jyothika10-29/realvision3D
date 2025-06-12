import { useState, useEffect } from "react";
import { useParams, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Camera } from "lucide-react";
import VirtualTourAR from "@/components/VirtualTourAR";
import { VirtualTour, TourHotspot } from "@shared/schema";

// Define the props for VirtualTourAR component to match required format
interface FormattedHotspot {
  id: number;
  position: { x: number, y: number, z: number };
  title: string;
  description?: string;
  linkedSceneId?: number;
}

export default function VirtualTourPage() {
  const { id, tourId } = useParams();
  const [loading, setLoading] = useState(true);

  // Fetch virtual tour data
  const { data: tour, isLoading: tourLoading } = useQuery<VirtualTour>({
    queryKey: [`/api/virtual-tours/${tourId}`],
    queryFn: async () => {
      try {
        const res = await fetch(`/api/virtual-tours/${tourId}`, {
          credentials: "include"
        });
        
        if (!res.ok) {
          throw new Error(`Failed to fetch virtual tour: ${res.status}`);
        }
        
        return await res.json();
      } catch (error) {
        console.error("Error fetching virtual tour:", error);
        throw error;
      }
    },
    enabled: !!tourId,
    retry: 1,
    refetchOnWindowFocus: false,
  });

  // Fetch tour hotspots
  const { data: hotspots, isLoading: hotspotsLoading } = useQuery<TourHotspot[]>({
    queryKey: [`/api/virtual-tours/${tourId}/hotspots`],
    queryFn: async () => {
      try {
        const res = await fetch(`/api/virtual-tours/${tourId}/hotspots`, {
          credentials: "include"
        });
        
        if (!res.ok) {
          throw new Error(`Failed to fetch tour hotspots: ${res.status}`);
        }
        
        return await res.json();
      } catch (error) {
        console.error("Error fetching hotspots:", error);
        return [];
      }
    },
    enabled: !!tourId && !!tour,
    retry: 1,
    refetchOnWindowFocus: false,
  });

  // Format hotspots for the VirtualTourAR component
  const formattedHotspots: FormattedHotspot[] = hotspots?.map(hotspot => ({
    id: hotspot.id,
    position: {
      x: parseFloat(hotspot.positionX.toString()),
      y: parseFloat(hotspot.positionY.toString()),
      z: parseFloat(hotspot.positionZ.toString()),
    },
    title: hotspot.title,
    description: hotspot.description || undefined,
    linkedSceneId: hotspot.linkedSceneId || undefined,
  })) || [];

  useEffect(() => {
    setLoading(tourLoading || hotspotsLoading);
  }, [tourLoading, hotspotsLoading]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-t-2 border-primary rounded-full animate-spin mb-4 mx-auto"></div>
          <h2 className="text-lg font-medium">Loading Virtual Tour...</h2>
        </div>
      </div>
    );
  }

  if (!tour) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white shadow-lg rounded-lg p-6 max-w-md w-full">
          <h2 className="text-xl font-bold text-red-600 mb-4">Tour Not Found</h2>
          <p className="text-gray-600 mb-6">
            The virtual tour you're looking for could not be found or may have been removed.
          </p>
          <Link href={`/properties/${id}`}>
            <Button className="w-full">
              Return to Property
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* Header Bar */}
      <div className="bg-gray-800 text-white p-4 flex justify-between items-center">
        <Link href={`/properties/${id}`}>
          <Button variant="ghost" className="text-white hover:bg-white/10">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Property
          </Button>
        </Link>
        <h1 className="text-lg font-medium">{tour.name}</h1>
        <div className="w-[100px]"></div> {/* Spacer for balance */}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Virtual Tour Viewer */}
        <div className="flex-1 relative">
          <VirtualTourAR
            propertyId={parseInt(id || '0')}
            modelType={tour.modelType as '360' | 'photogrammetry'}
            modelUrl={tour.modelUrl}
            hotspots={formattedHotspots}
          />
        </div>

        {/* Tour Info */}
        <div className="bg-gray-800 text-white p-4">
          <p className="text-sm opacity-75">{tour.description}</p>
        </div>
      </div>
    </div>
  );
}
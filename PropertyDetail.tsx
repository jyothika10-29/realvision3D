import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Property, PropertyRoom } from "@shared/schema";
import SimpleModelViewer from "@/components/SimpleModelViewer";
import FloorPlanViewer from "@/components/FloorPlanViewer";
import FurnishingPreview from "@/components/FurnishingPreview";
import { Home, Droplets, RulerIcon, MapPin, Calendar, User, Share2, Heart, ZoomIn, ZoomOut, RefreshCw, Home as HomeIcon, Maximize, Search } from "lucide-react";

export default function PropertyDetail() {
  const { id } = useParams();
  const { toast } = useToast();
  const [activeFloor, setActiveFloor] = useState("first");
  
  // Fetch property details - force returnNull for 401 responses
  const { data: property, isLoading: propertyLoading, isError: propertyError } = useQuery<Property>({
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
        console.error("Error fetching property:", error);
        throw error;
      }
    },
    retry: 1,
    refetchOnWindowFocus: false,
  });
  
  // Fetch property room details - only when property is available
  const { data: rooms, isLoading: roomsLoading } = useQuery<PropertyRoom[]>({
    queryKey: [`/api/properties/${id}/rooms`],
    queryFn: async () => {
      try {
        const res = await fetch(`/api/properties/${id}/rooms`, {
          credentials: "include"
        });
        
        if (!res.ok) {
          throw new Error(`Failed to fetch property rooms: ${res.status}`);
        }
        
        return await res.json();
      } catch (error) {
        console.error("Error fetching property rooms:", error);
        return [];
      }
    },
    enabled: !!property, // Only fetch rooms when property data is available
  });

  // Toggle save property
  const handleSaveProperty = () => {
    toast({
      title: "Property Saved",
      description: "This property has been saved to your favorites.",
    });
  };

  // Schedule viewing
  const handleScheduleViewing = () => {
    toast({
      title: "Viewing Requested",
      description: "A real estate agent will contact you shortly.",
    });
  };
  
  // Contact agent
  const handleContactAgent = () => {
    toast({
      title: "Agent Contacted",
      description: "A real estate agent will call you shortly.",
    });
  };

  if (propertyLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="flex flex-col md:flex-row gap-6">
            <div className="w-full md:w-2/3">
              <div className="h-[500px] bg-gray-200 rounded-lg mb-6"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
            </div>
            <div className="w-full md:w-1/3 bg-gray-200 rounded-lg h-[400px]"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md">
          <p>Property not found or has been removed.</p>
        </div>
      </div>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
      <div className="flex flex-col md:flex-row items-start gap-6 py-6">
        {/* Left Column: Main Visualization & Controls */}
        <div className="w-full md:w-2/3">
          <Tabs defaultValue="3d">
            <TabsList className="border-b border-gray-200 w-full justify-start mb-4 bg-transparent p-0">
              <TabsTrigger value="3d" className="px-4 py-2 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none data-[state=inactive]:text-gray-500 data-[state=active]:text-primary">3D Model</TabsTrigger>
              <TabsTrigger value="ar" className="px-4 py-2 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none data-[state=inactive]:text-gray-500 data-[state=active]:text-primary">AR View</TabsTrigger>
              <TabsTrigger value="floor-plan" className="px-4 py-2 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none data-[state=inactive]:text-gray-500 data-[state=active]:text-primary">Floor Plan</TabsTrigger>
              <TabsTrigger value="gallery" className="px-4 py-2 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none data-[state=inactive]:text-gray-500 data-[state=active]:text-primary">Gallery</TabsTrigger>
            </TabsList>
            
            <TabsContent value="3d" className="mt-0">
              <div className="relative bg-gray-100 rounded-lg overflow-hidden h-[500px]">
                {/* Use appropriate 3D model based on property type */}
                <SimpleModelViewer 
                  modelUrl={property.type === 'plot' ? null : "/models/house1.glb"} 
                  className="h-full w-full"
                  isPlot={property.type === 'plot'}
                />
                
                {/* AR button overlay */}
                <div className="absolute top-4 right-4 z-10">
                  <Link href={`/properties/${id}/ar`}>
                    <button className="bg-blue-600 text-white px-4 py-2 rounded">
                      View in AR
                    </button>
                  </Link>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="ar" className="mt-0">
              <div className="bg-gray-100 rounded-lg p-8 text-center">
                <div className="mb-4 text-blue-600">
                  <span className="i-ri-augmented-reality-line text-5xl"></span>
                </div>
                <h3 className="text-lg font-medium mb-2">Experience in AR</h3>
                <p className="text-gray-600 mb-4">
                  Click the button below to view this property in augmented reality.
                </p>
                <Link href={`/properties/${id}/ar`}>
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                    Launch AR View
                  </Button>
                </Link>
              </div>
            </TabsContent>
            
            <TabsContent value="floor-plan" className="mt-0">
              <div className="bg-gray-100 rounded-lg overflow-hidden">
                {rooms ? (
                  <div>
                    <Tabs defaultValue="basic">
                      <TabsList className="w-full mb-2">
                        <TabsTrigger value="basic" className="flex-1">Basic Floor Plan</TabsTrigger>
                        <TabsTrigger value="furnished" className="flex-1">Furnished Preview</TabsTrigger>
                      </TabsList>
                      
                      <TabsContent value="basic" className="mt-0">
                        <FloorPlanViewer rooms={rooms} />
                      </TabsContent>
                      
                      <TabsContent value="furnished" className="mt-0">
                        <FurnishingPreview rooms={rooms} />
                      </TabsContent>
                    </Tabs>
                  </div>
                ) : (
                  <div className="h-[500px] flex items-center justify-center">
                    <p className="text-gray-500">Floor plan not available</p>
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="gallery" className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-100 rounded-lg overflow-hidden h-[350px] relative">
                  <div className="w-full h-full">
                    <SimpleModelViewer 
                      modelUrl="/models/image_livingroom.glb" 
                      className="h-full w-full"
                    />
                  </div>
                  <div className="absolute bottom-2 left-2 bg-white/80 px-2 py-1 rounded text-xs">
                    Living Room (3D Interactive)
                  </div>
                  <div className="absolute top-2 right-2 bg-white/80 px-2 py-1 rounded text-xs">
                    Click and drag to rotate
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* Property Description */}
          <div className="mt-6">
            <h2 className="text-xl font-bold font-heading mb-4">{property.title}</h2>
            <p className="text-gray-600 mb-4">
              {property.description}
            </p>
            <div className="flex flex-wrap gap-2 mb-6">
              <span className="bg-gray-100 px-3 py-1 rounded-full text-sm">Smart Home</span>
              <span className="bg-gray-100 px-3 py-1 rounded-full text-sm">Energy Efficient</span>
              <span className="bg-gray-100 px-3 py-1 rounded-full text-sm">Open Floor Plan</span>
              <span className="bg-gray-100 px-3 py-1 rounded-full text-sm">Hardwood Floors</span>
              <span className="bg-gray-100 px-3 py-1 rounded-full text-sm">Central AC</span>
            </div>
          </div>
        </div>

        {/* Right Column: Property Details & Interactions */}
        <div className="w-full md:w-1/3 bg-white p-6 rounded-lg shadow-sm">
          <div className="border-b border-gray-200 pb-4 mb-4">
            <h3 className="text-xl font-bold font-heading mb-1">${Number(property.price).toLocaleString()}</h3>
            <p className="text-neutral-dark mb-2">{property.address}, {property.city}, {property.state}</p>
            <div className="flex items-center mt-2 text-gray-600">
              <div className="flex items-center mr-4">
                <Home className="w-4 h-4 mr-1" /> {property.bedrooms} beds
              </div>
              <div className="flex items-center mr-4">
                <Droplets className="w-4 h-4 mr-1" /> {property.bathrooms} baths
              </div>
              <div className="flex items-center">
                <RulerIcon className="w-4 h-4 mr-1" /> {property.sqft.toLocaleString()} sq ft
              </div>
            </div>
          </div>

          {/* Interactive Floor Plan */}
          {rooms && (
            <div className="mb-6">
              <h4 className="text-lg font-medium font-heading mb-3">Interactive Floor Plan</h4>
              <div className="bg-gray-100 rounded-lg p-4 relative">
                <FloorPlanViewer rooms={rooms} variant="small" />
              </div>
            </div>
          )}

          {/* Contact & Actions */}
          <div className="space-y-3">
            <Button 
              className="w-full py-6 bg-primary hover:bg-blue-700 flex items-center justify-center"
              onClick={handleScheduleViewing}
            >
              <Calendar className="mr-2 h-5 w-5" /> Schedule a Viewing
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full py-6 border-primary text-primary hover:bg-blue-50 flex items-center justify-center"
              onClick={handleContactAgent}
            >
              <User className="mr-2 h-5 w-5" /> Contact Agent
            </Button>
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                className="flex-1 py-2 border-gray-300 text-gray-700 hover:bg-gray-50 flex items-center justify-center"
              >
                <Share2 className="mr-1 h-4 w-4" /> Share
              </Button>
              
              <Button 
                variant="outline" 
                className="flex-1 py-2 border-gray-300 text-gray-700 hover:bg-gray-50 flex items-center justify-center"
                onClick={handleSaveProperty}
              >
                <Heart className="mr-1 h-4 w-4" /> Save
              </Button>
            </div>

            {property?.type === 'plot' && (
              <Link href={`/properties/${id}/design`}>
                <Button 
                  className="w-full py-6 bg-blue-700 hover:bg-blue-800 flex items-center justify-center mt-3"
                >
                  <HomeIcon className="mr-2 h-5 w-5" /> Design This Plot
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Loader2, Building } from "lucide-react";
import { Property } from "@shared/schema";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import FilterControls from "@/components/FilterControls";
import PropertyCard from "@/components/PropertyCard";

export default function Properties() {
  const [activeTab, setActiveTab] = useState("all");
  const [filters, setFilters] = useState({
    priceRange: "all",
    bedrooms: "all",
    propertyType: "all"
  });
  
  // Fetch properties
  const { data: properties, isLoading, error } = useQuery<Property[]>({
    queryKey: ["/api/properties"],
  });

  // Filter properties based on active tab and filters
  const filteredProperties = properties?.filter(property => {
    // Handle tabs
    if (activeTab === "featured" && !property.featured) return false;
    
    // Handle filters
    const matchesPriceRange = filters.priceRange === "all" || 
      (filters.priceRange === "0-500000" && Number(property.price) <= 500000) ||
      (filters.priceRange === "500000-1000000" && Number(property.price) > 500000 && Number(property.price) <= 1000000) ||
      (filters.priceRange === "1000000+" && Number(property.price) > 1000000);

    const matchesBedrooms = filters.bedrooms === "all" || 
      (filters.bedrooms === "1" && property.bedrooms === 1) ||
      (filters.bedrooms === "2" && property.bedrooms === 2) ||
      (filters.bedrooms === "3" && property.bedrooms === 3) ||
      (filters.bedrooms === "4+" && property.bedrooms >= 4);

    const matchesPropertyType = filters.propertyType === "all" || 
      property.type.toLowerCase() === filters.propertyType.toLowerCase();

    return matchesPriceRange && matchesBedrooms && matchesPropertyType;
  });

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center mb-8">
          <Building className="text-primary mr-3 h-7 w-7" />
          <h1 className="text-3xl font-bold">Browse Properties</h1>
        </div>
        
        <div className="flex flex-col md:flex-row gap-8">
          {/* Filter sidebar */}
          <div className="md:w-1/4">
            <div className="bg-white rounded-lg border p-6 sticky top-20">
              <h2 className="text-lg font-medium mb-4">Filter Properties</h2>
              <FilterControls filters={filters} setFilters={setFilters} />
            </div>
          </div>
          
          {/* Properties section */}
          <div className="md:w-3/4">
            <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full mb-6">
              <TabsList>
                <TabsTrigger value="all">All Properties</TabsTrigger>
                <TabsTrigger value="featured">Featured Properties</TabsTrigger>
              </TabsList>
              
              <TabsContent value="all" className="mt-6">
                {renderPropertyGrid(filteredProperties, isLoading, error)}
              </TabsContent>
              
              <TabsContent value="featured" className="mt-6">
                {renderPropertyGrid(filteredProperties, isLoading, error)}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}

function renderPropertyGrid(properties: Property[] | undefined, isLoading: boolean, error: Error | null) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-red-50 text-red-500 rounded-lg p-4">
        Failed to load properties. Please try again.
      </div>
    );
  }
  
  if (!properties || properties.length === 0) {
    return (
      <div className="bg-slate-50 rounded-lg p-8 text-center">
        <h3 className="text-lg font-medium mb-2">No properties found</h3>
        <p className="text-muted-foreground">Try adjusting your filters to see more properties.</p>
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {properties.map((property) => (
        <div key={property.id}>
          <PropertyCard property={property} />
        </div>
      ))}
    </div>
  );
}
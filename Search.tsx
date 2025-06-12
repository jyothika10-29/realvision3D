import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { 
  Search as SearchIcon, 
  Filter, 
  Loader2 
} from "lucide-react";
import { Property } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import PropertyCard from "@/components/PropertyCard";
import FilterControls from "@/components/FilterControls";

export default function Search() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    priceRange: "all",
    bedrooms: "all",
    propertyType: "all"
  });
  
  const { data: properties, isLoading, error } = useQuery<Property[]>({
    queryKey: ["/api/properties"],
  });

  // Filter properties based on search term and filters
  const filteredProperties = properties?.filter(property => {
    const matchesSearch = !searchTerm || 
      property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.description.toLowerCase().includes(searchTerm.toLowerCase());

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

    return matchesSearch && matchesPriceRange && matchesBedrooms && matchesPropertyType;
  });

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Search Properties</h1>
        
        <div className="mb-8">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by title, address, or description..."
              className="pl-10 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filter sidebar */}
          <div className="lg:w-1/4">
            <Card className="sticky top-20">
              <CardContent className="pt-6">
                <div className="flex items-center mb-4">
                  <Filter className="mr-2 h-5 w-5" />
                  <h2 className="text-lg font-medium">Filters</h2>
                </div>
                <FilterControls filters={filters} setFilters={setFilters} />
              </CardContent>
            </Card>
          </div>
          
          {/* Property grid */}
          <div className="lg:w-3/4">
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : error ? (
              <div className="bg-red-50 text-red-500 rounded-lg p-4">
                Failed to load properties. Please try again.
              </div>
            ) : filteredProperties?.length === 0 ? (
              <div className="bg-slate-50 rounded-lg p-8 text-center">
                <h3 className="text-lg font-medium mb-2">No properties found</h3>
                <p className="text-muted-foreground mb-4">Try adjusting your search or filters.</p>
                <Button variant="outline" onClick={() => {
                  setSearchTerm("");
                  setFilters({
                    priceRange: "all",
                    bedrooms: "all",
                    propertyType: "all"
                  });
                }}>
                  Clear all filters
                </Button>
              </div>
            ) : (
              <div>
                <p className="text-muted-foreground mb-4">{filteredProperties?.length} properties found</p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProperties?.map((property) => (
                    <div key={property.id}>
                      <PropertyCard property={property} />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
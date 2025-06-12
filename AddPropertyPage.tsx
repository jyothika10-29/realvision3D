import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { insertPropertySchema } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { Loader2, Upload } from "lucide-react";

// Extended schema with validation for form inputs
const propertyFormSchema = insertPropertySchema.extend({
  price: z.string().min(1, "Price is required"),
  plotSize: z.string().optional(),
  imageFiles: z.instanceof(FileList).optional(),
  // Add a custom field for features that's not in the DB schema
  features: z.string().optional(),
});

type PropertyFormValues = z.infer<typeof propertyFormSchema>;

export default function AddPropertyPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [, navigate] = useLocation();
  const [propertyType, setPropertyType] = useState<"house" | "plot">("house");
  const [isUploading, setIsUploading] = useState(false);

  // Initialize form with react-hook-form
  const form = useForm<PropertyFormValues>({
    resolver: zodResolver(propertyFormSchema),
    defaultValues: {
      title: "",
      description: "",
      price: "",
      bedrooms: "1", // Changed to string to match schema
      bathrooms: "1", // Changed to string to match schema
      sqft: "1000", // Changed to string to match schema
      address: "",
      city: "",
      state: "",
      zipCode: "",
      type: "house",
      status: "for_sale",
      features: "",
      plotSize: "",
      imageUrl: "", // Add a default value for required fields
      createdAt: new Date().toISOString(),
    },
  });

  // Create property mutation
  const createPropertyMutation = useMutation({
    mutationFn: async (values: PropertyFormValues) => {
      setIsUploading(true);
      try {
        // Format the data for API consumption
        const propertyData = {
          ...values,
          userId: user?.id || 0,
        };
        
        const response = await apiRequest("POST", "/api/properties", propertyData);
        const data = await response.json();
        return data;
      } finally {
        setIsUploading(false);
      }
    },
    onSuccess: () => {
      // Invalidate queries to refresh the property list
      queryClient.invalidateQueries({ queryKey: ["/api/properties"] });
      
      // Show success message and redirect
      toast({
        title: "Property Added",
        description: "Your property has been successfully listed!",
      });
      
      navigate("/");
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to add property: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Form submission handler
  function onSubmit(values: PropertyFormValues) {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to post a property listing.",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }
    
    // Convert numeric fields to strings for the API
    const preparedValues = {
      ...values,
      bedrooms: String(values.bedrooms),
      bathrooms: String(values.bathrooms),
      sqft: String(values.sqft),
      price: String(values.price),
    };

    createPropertyMutation.mutate(preparedValues);
  }

  // Update form values when property type changes
  const handlePropertyTypeChange = (value: "house" | "plot") => {
    setPropertyType(value);
    form.setValue("type", value);
  };

  return (
    <div className="container mx-auto py-10 px-4 sm:px-6 lg:px-8 max-w-5xl">
      <Card className="shadow-lg border-0">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-t-lg">
          <CardTitle className="text-2xl font-bold">List Your Property</CardTitle>
          <CardDescription className="text-blue-100">
            Fill out the details below to list your property on our platform
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <Tabs defaultValue="details" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="details">Property Details</TabsTrigger>
              <TabsTrigger value="location">Location</TabsTrigger>
              <TabsTrigger value="features">Features & Amenities</TabsTrigger>
            </TabsList>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <TabsContent value="details" className="space-y-4">
                  <div className="space-y-2">
                    <Label>Property Type</Label>
                    <RadioGroup 
                      defaultValue="house" 
                      className="flex space-x-4"
                      onValueChange={(value) => handlePropertyTypeChange(value as "house" | "plot")}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="house" id="house" />
                        <Label htmlFor="house" className="cursor-pointer">House</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="plot" id="plot" />
                        <Label htmlFor="plot" className="cursor-pointer">Plot/Land</Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Property Title</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. Modern Family Home" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Describe your property in detail..." 
                            className="min-h-[120px]" 
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Price ($)</FormLabel>
                          <FormControl>
                            <Input 
                              type="text" 
                              placeholder="e.g. 349000" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Listing Status</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="for_sale">For Sale</SelectItem>
                              <SelectItem value="for_rent">For Rent</SelectItem>
                              <SelectItem value="pending">Sale Pending</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {propertyType === "house" ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="bedrooms"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Bedrooms</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                min={0} 
                                {...field} 
                                onChange={(e) => field.onChange(e.target.value)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="bathrooms"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Bathrooms</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                min={0} 
                                step={0.5}
                                {...field} 
                                onChange={(e) => field.onChange(e.target.value)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="sqft"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Square Footage</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                min={1} 
                                {...field} 
                                onChange={(e) => field.onChange(e.target.value)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="sqft"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Plot Area (sq ft)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                min={1}
                                {...field} 
                                onChange={(e) => field.onChange(e.target.value)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="plotSize"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Plot Dimensions (e.g. 60x75)</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g. 60x75" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  )}

                  <FormField
                    control={form.control}
                    name="imageFiles"
                    render={({ field: { onChange, value, ...fieldProps } }) => (
                      <FormItem>
                        <FormLabel>Property Images</FormLabel>
                        <FormControl>
                          <div className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center hover:border-primary transition-colors cursor-pointer">
                            <input
                              type="file"
                              id="imageFiles"
                              className="hidden"
                              multiple
                              accept="image/*"
                              onChange={(e) => {
                                if (e.target.files) {
                                  onChange(e.target.files);
                                }
                              }}
                            />
                            <label htmlFor="imageFiles" className="cursor-pointer flex flex-col items-center">
                              <Upload className="w-10 h-10 text-gray-400 mb-2" />
                              <span className="text-sm text-gray-500">
                                Drag and drop your images here, or click to select files
                              </span>
                              <span className="text-xs text-gray-400 mt-1">
                                (Up to 10 images, max 5MB each)
                              </span>
                            </label>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TabsContent>

                <TabsContent value="location" className="space-y-4">
                  <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Street Address</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g. 123 Main St" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. New York" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="state"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>State</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. NY" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="zipCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>ZIP Code</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. 10001" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="features" className="space-y-4">
                  <FormField
                    control={form.control}
                    name="features"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Features & Amenities</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="List key features of your property (e.g. Hardwood floors, Central AC, Smart Home, etc.)"
                            className="min-h-[150px]"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </TabsContent>

                <div className="flex justify-end pt-4">
                  <Button 
                    type="submit" 
                    disabled={isUploading || createPropertyMutation.isPending}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8"
                    size="lg"
                  >
                    {(isUploading || createPropertyMutation.isPending) && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    List Property
                  </Button>
                </div>
              </form>
            </Form>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
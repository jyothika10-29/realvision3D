import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'wouter';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import FloorplanAIAssistant from '@/components/FloorplanAIAssistant';
import PlotFurnishingPreview from '@/components/PlotFurnishingPreview';
import ThreeScene from '@/components/ThreeScene';
// import ARViewport from '@/components/ARViewport';
import InteractiveElevationPlanner from '@/components/InteractiveElevationPlanner';
import {
  Property,
  FloorplanComponent,
  Floorplan,
  ElevationDesign,
  UserElevation,
} from '@shared/schema';

export default function PlotDesignerPage() {
  const { id } = useParams<{ id: string }>();
  const propertyId = parseInt(id);
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedTab, setSelectedTab] = useState('floorplan');
  const [showARDialog, setShowARDialog] = useState(false);
  
  // State for floorplan designer
  const [floorplanComponents, setFloorplanComponents] = useState<FloorplanComponent[]>([]);
  const [selectedComponents, setSelectedComponents] = useState<{component: FloorplanComponent, position: {x: number, y: number}}[]>([]);
  const [gridSize, setGridSize] = useState({ width: 1200, height: 800 });
  const [floorplanName, setFloorplanName] = useState('My Custom Floorplan');
  const [isometricView, setIsometricView] = useState(false);
  
  // State for elevation planner
  const [selectedFloorplan, setSelectedFloorplan] = useState<Floorplan | null>(null);
  const [elevationDesigns, setElevationDesigns] = useState<ElevationDesign[]>([]);
  const [selectedElevation, setSelectedElevation] = useState<ElevationDesign | null>(null);
  const [selectedMaterials, setSelectedMaterials] = useState<Record<string, string>>({});
  const [selectedColors, setSelectedColors] = useState<Record<string, string>>({});
  
  // Queries
  const { data: property, isLoading: isLoadingProperty } = useQuery({
    queryKey: ['/api/properties', propertyId],
    queryFn: async () => {
      const res = await fetch(`/api/properties/${propertyId}`);
      if (!res.ok) throw new Error('Failed to fetch property');
      return await res.json() as Property;
    },
    enabled: !!propertyId,
  });
  
  const { data: components, isLoading: isLoadingComponents } = useQuery({
    queryKey: ['/api/floorplan-components'],
    queryFn: async () => {
      const res = await fetch('/api/floorplan-components');
      if (!res.ok) throw new Error('Failed to fetch floorplan components');
      return await res.json() as FloorplanComponent[];
    },
  });
  
  const { data: userFloorplans, isLoading: isLoadingFloorplans } = useQuery({
    queryKey: ['/api/users', user?.id, 'floorplans'],
    queryFn: async () => {
      if (!user) return [];
      const res = await fetch(`/api/users/${user.id}/floorplans`);
      if (!res.ok) throw new Error('Failed to fetch user floorplans');
      return await res.json() as Floorplan[];
    },
    enabled: !!user,
  });
  
  const { data: designs, isLoading: isLoadingDesigns } = useQuery({
    queryKey: ['/api/elevation-designs'],
    queryFn: async () => {
      const res = await fetch('/api/elevation-designs');
      if (!res.ok) throw new Error('Failed to fetch elevation designs');
      return await res.json() as ElevationDesign[];
    },
  });
  
  // Mutations
  const saveFloorplanMutation = useMutation({
    mutationFn: async (floorplanData: any) => {
      const res = await apiRequest('POST', '/api/floorplans', floorplanData);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users', user?.id, 'floorplans'] });
      toast({
        title: "Floorplan saved",
        description: "Your floorplan has been saved successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error saving floorplan",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const deleteFloorplanMutation = useMutation({
    mutationFn: async (floorplanId: number) => {
      const res = await apiRequest('DELETE', `/api/floorplans/${floorplanId}`);
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to delete floorplan");
      }
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users', user?.id, 'floorplans'] });
      toast({
        title: "Floorplan deleted",
        description: "The floorplan has been deleted successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error deleting floorplan",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const saveElevationMutation = useMutation({
    mutationFn: async (elevationData: any) => {
      const res = await apiRequest('POST', '/api/user-elevations', elevationData);
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users', user?.id, 'elevations'] });
      toast({
        title: "Elevation design saved",
        description: "Your elevation design has been saved successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error saving elevation design",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Effects
  useEffect(() => {
    if (components) {
      setFloorplanComponents(components);
    }
  }, [components]);
  
  useEffect(() => {
    if (designs) {
      setElevationDesigns(designs);
      if (designs.length > 0) {
        setSelectedElevation(designs[0]);
        
        // Initialize materials and colors based on first design
        const design = designs[0];
        if (design) {
          try {
            const materialOptions = JSON.parse(design.materialOptions);
            const colorOptions = JSON.parse(design.colorOptions);
            
            // Set default selected materials and colors
            const materials: Record<string, string> = {};
            const colors: Record<string, string> = {};
            
            Object.entries(materialOptions).forEach(([category, options]) => {
              if (Array.isArray(options) && options.length > 0) {
                materials[category] = options[0] as string;
              }
            });
            
            Object.entries(colorOptions).forEach(([category, options]) => {
              if (Array.isArray(options) && options.length > 0) {
                colors[category] = options[0] as string;
              }
            });
            
            setSelectedMaterials(materials);
            setSelectedColors(colors);
          } catch (error) {
            console.error('Error parsing elevation design options:', error);
          }
        }
      }
    }
  }, [designs]);
  
  // Handlers
  const handleComponentDrag = (component: FloorplanComponent, event: React.DragEvent) => {
    event.dataTransfer.setData('application/json', JSON.stringify(component));
  };
  
  const handleGridDrop = (event: React.DragEvent) => {
    event.preventDefault();
    const componentData = event.dataTransfer.getData('application/json');
    if (componentData) {
      const component = JSON.parse(componentData) as FloorplanComponent;
      const gridRect = event.currentTarget.getBoundingClientRect();
      const x = event.clientX - gridRect.left;
      const y = event.clientY - gridRect.top;
      
      // Add the component to the selected components with its position
      setSelectedComponents([
        ...selectedComponents,
        { component, position: { x, y } }
      ]);
    }
  };
  
  const handleGridDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };
  
  const handleRemoveComponent = (index: number) => {
    const updatedComponents = [...selectedComponents];
    updatedComponents.splice(index, 1);
    setSelectedComponents(updatedComponents);
  };
  
  const handleApplyAISuggestion = (suggestions: { component: FloorplanComponent; position: { x: number; y: number } }[]) => {
    setSelectedComponents(suggestions);
    toast({
      title: "AI Suggestions Applied",
      description: "The AI-recommended layout has been applied to your floorplan.",
    });
  };
  
  const handleSaveFloorplan = () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to save your floorplan.",
        variant: "destructive",
      });
      return;
    }
    
    if (!property) {
      toast({
        title: "Error",
        description: "Property information not available.",
        variant: "destructive",
      });
      return;
    }
    
    const floorplanData = {
      name: floorplanName,
      propertyId,
      userId: user.id,
      description: `Floorplan for ${property.title}`,
      layout: JSON.stringify(selectedComponents),
      dimensions: JSON.stringify(gridSize),
    };
    
    saveFloorplanMutation.mutate(floorplanData);
  };
  
  const handleSaveElevation = () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to save your elevation design.",
        variant: "destructive",
      });
      return;
    }
    
    if (!selectedFloorplan) {
      toast({
        title: "Floorplan required",
        description: "Please select a floorplan first.",
        variant: "destructive",
      });
      return;
    }
    
    if (!selectedElevation) {
      toast({
        title: "Elevation design required",
        description: "Please select an elevation design.",
        variant: "destructive",
      });
      return;
    }
    
    const elevationData = {
      name: `${selectedElevation.name} customization`,
      floorplanId: selectedFloorplan.id,
      elevationDesignId: selectedElevation.id,
      userId: user.id,
      selectedMaterials: JSON.stringify(selectedMaterials),
      selectedColors: JSON.stringify(selectedColors),
      customOptions: JSON.stringify({}), // For future customizations
    };
    
    saveElevationMutation.mutate(elevationData);
  };
  
  const handleViewInAR = () => {
    setShowARDialog(true);
  };
  
  const handleDeleteFloorplan = (floorplanId: number, event: React.MouseEvent) => {
    // Stop propagation to prevent triggering the parent click handler
    event.stopPropagation();
    
    if (confirm("Are you sure you want to delete this floorplan? This action cannot be undone.")) {
      deleteFloorplanMutation.mutate(floorplanId);
    }
  };
  
  if (isLoadingProperty) {
    return <div className="flex items-center justify-center min-h-screen">Loading property...</div>;
  }
  
  if (!property) {
    return <div className="flex items-center justify-center min-h-screen">Property not found.</div>;
  }
  
  // Only allow plot type properties to use this page
  if (property.type !== 'plot') {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6">
        <h1 className="text-3xl font-bold mb-4">Invalid Property Type</h1>
        <p className="text-lg mb-6">This designer is only available for empty plots.</p>
        <Button onClick={() => navigate('/properties')}>Return to Properties</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-primary">Plot Designer</h1>
          <p className="text-lg mb-2">{property.title} - {property.address}</p>
          <p className="text-sm text-muted-foreground">
            Size: {property.plotSize || 'N/A'} | Type: {property.plotType || 'Standard'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate(`/properties/${propertyId}`)}>
            Back to Property
          </Button>
          <Button onClick={handleViewInAR}>View in AR</Button>
        </div>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="floorplan">Floorplan Designer</TabsTrigger>
          <TabsTrigger value="elevation">Elevation Planner</TabsTrigger>
        </TabsList>
        
        {/* Floorplan Designer */}
        <TabsContent value="floorplan">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Component Library */}
            <Card className="lg:col-span-1 overflow-auto max-h-[800px]">
              <CardContent className="pt-6">
                <h3 className="text-lg font-bold mb-4">Component Library</h3>
                
                {isLoadingComponents ? (
                  <div className="flex justify-center p-4">Loading components...</div>
                ) : (
                  <div>
                    <h4 className="font-semibold my-3">Essential</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {floorplanComponents
                        .filter(comp => comp.category === 'essential')
                        .map((component) => (
                          <div
                            key={component.id}
                            className="p-2 border rounded-md bg-secondary/20 cursor-grab"
                            draggable
                            onDragStart={(e) => handleComponentDrag(component, e)}
                          >
                            <div className="text-xs font-medium">{component.name}</div>
                            <div className="text-xs text-muted-foreground">{component.width}x{component.height}</div>
                          </div>
                        ))}
                    </div>
                    
                    <h4 className="font-semibold my-3">Outdoor</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {floorplanComponents
                        .filter(comp => comp.category === 'outdoor')
                        .map((component) => (
                          <div
                            key={component.id}
                            className="p-2 border rounded-md bg-secondary/20 cursor-grab"
                            draggable
                            onDragStart={(e) => handleComponentDrag(component, e)}
                          >
                            <div className="text-xs font-medium">{component.name}</div>
                            <div className="text-xs text-muted-foreground">{component.width}x{component.height}</div>
                          </div>
                        ))}
                    </div>
                    
                    <h4 className="font-semibold my-3">Utility</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {floorplanComponents
                        .filter(comp => comp.category === 'utility')
                        .map((component) => (
                          <div
                            key={component.id}
                            className="p-2 border rounded-md bg-secondary/20 cursor-grab"
                            draggable
                            onDragStart={(e) => handleComponentDrag(component, e)}
                          >
                            <div className="text-xs font-medium">{component.name}</div>
                            <div className="text-xs text-muted-foreground">{component.width}x{component.height}</div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Design Grid */}
            <Card className="lg:col-span-3">
              <CardContent className="pt-6">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-4">
                    <h3 className="text-lg font-bold">Design your floorplan</h3>
                    <div className="flex items-center gap-2">
                      <label htmlFor="view-toggle" className="text-sm font-medium">
                        View:
                      </label>
                      <div className="flex bg-secondary/20 p-1 rounded-md">
                        <button 
                          className={`px-3 py-1 text-xs rounded-md ${!isometricView ? 'bg-primary text-primary-foreground' : ''}`}
                          onClick={() => setIsometricView(false)}
                        >
                          2D Top
                        </button>
                        <button 
                          className={`px-3 py-1 text-xs rounded-md ${isometricView ? 'bg-primary text-primary-foreground' : ''}`}
                          onClick={() => setIsometricView(true)}
                        >
                          Isometric
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={floorplanName}
                      onChange={(e) => setFloorplanName(e.target.value)}
                      className="px-3 py-1 border rounded-md"
                      placeholder="Floorplan name"
                    />
                    <Button 
                      onClick={handleSaveFloorplan}
                      disabled={selectedComponents.length === 0 || saveFloorplanMutation.isPending}
                    >
                      Save Floorplan
                    </Button>
                  </div>
                </div>
                
                <Tabs defaultValue="design" className="w-full">
                  <TabsList className="mb-4">
                    <TabsTrigger value="design">Design Layout</TabsTrigger>
                    <TabsTrigger value="furnished">Furnished Preview</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="design" className="mt-0">
                    <div className="border-2 border-dashed rounded-md bg-secondary/10 relative overflow-hidden"
                      style={{ height: '600px' }}
                      onDrop={handleGridDrop}
                      onDragOver={handleGridDragOver}
                    >
                  <div className="absolute top-0 left-0 w-full h-full">
                    {/* Grid lines */}
                    {isometricView ? (
                      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                          <pattern id="isometric-grid" width="80" height="80" patternUnits="userSpaceOnUse">
                            <path d="M 0 0 L 80 40 M 80 0 L 0 40" fill="none" stroke="rgba(0,0,0,0.1)" strokeWidth="1"/>
                            <path d="M 0 40 L 0 80 M 80 40 L 80 80" fill="none" stroke="rgba(0,0,0,0.1)" strokeWidth="1"/>
                          </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#isometric-grid)" />
                      </svg>
                    ) : (
                      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(0,0,0,0.1)" strokeWidth="1"/>
                          </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#grid)" />
                      </svg>
                    )}
                    
                    {/* Plot outline */}
                    <div 
                      className={`absolute border-2 border-primary/50 ${!isometricView ? 'rounded-md' : ''}`}
                      style={{
                        top: '20px',
                        left: '20px',
                        width: 'calc(100% - 40px)',
                        height: 'calc(100% - 40px)',
                        transform: isometricView ? 'rotateX(60deg) rotateZ(45deg)' : 'none',
                        transformOrigin: 'center center',
                        transition: 'transform 0.3s ease-in-out',
                      }}
                    >
                      <div className={`absolute bg-background px-2 text-xs ${
                        isometricView 
                          ? 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transform -rotate-45' 
                          : 'top-0 left-1/2 -translate-x-1/2 -translate-y-1/2'
                      }`}>
                        {property.plotSize || 'Plot dimensions'}
                      </div>
                      
                      {/* Show 3D visualization of corners in isometric view */}
                      {isometricView && (
                        <>
                          <div className="absolute top-0 left-0 w-2 h-2 bg-primary/80" 
                               style={{ transform: 'translate(-50%, -50%)', zIndex: 10 }} />
                          <div className="absolute top-0 right-0 w-2 h-2 bg-primary/80" 
                               style={{ transform: 'translate(50%, -50%)', zIndex: 10 }} />
                          <div className="absolute bottom-0 left-0 w-2 h-2 bg-primary/80" 
                               style={{ transform: 'translate(-50%, 50%)', zIndex: 10 }} />
                          <div className="absolute bottom-0 right-0 w-2 h-2 bg-primary/80" 
                               style={{ transform: 'translate(50%, 50%)', zIndex: 10 }} />
                          
                          {/* Vertical lines at corners */}
                          <div className="absolute top-0 left-0 w-0.5 h-6 bg-primary/30" 
                               style={{ transform: 'translate(-50%, -100%)', zIndex: 5 }} />
                          <div className="absolute top-0 right-0 w-0.5 h-6 bg-primary/30" 
                               style={{ transform: 'translate(50%, -100%)', zIndex: 5 }} />
                          <div className="absolute bottom-0 left-0 w-0.5 h-6 bg-primary/30" 
                               style={{ transform: 'translate(-50%, 100%)', zIndex: 5 }} />
                          <div className="absolute bottom-0 right-0 w-0.5 h-6 bg-primary/30" 
                               style={{ transform: 'translate(50%, 100%)', zIndex: 5 }} />
                        </>
                      )}
                    </div>
                    
                    {/* Placed components */}
                    {selectedComponents.map((item, index) => {
                      let color = '#E6F7FF';
                      let label = item.component.name;
                      
                      try {
                        if (item.component.properties) {
                          const props = JSON.parse(item.component.properties);
                          if (props.color) color = props.color;
                          if (props.label) label = props.label;
                        }
                      } catch (e) {
                        console.error('Error parsing component properties:', e);
                      }
                      
                      return (
                        <div
                          key={index}
                          className={`absolute border border-gray-400 flex items-center justify-center cursor-move ${
                            isometricView ? 'isometric-component' : ''
                          }`}
                          style={{
                            left: `${item.position.x}px`,
                            top: `${item.position.y}px`,
                            width: `${item.component.width * 20}px`,
                            height: `${item.component.height * 20}px`,
                            backgroundColor: color,
                            transform: isometricView 
                              ? 'translate(-50%, -50%) rotateX(60deg) rotateZ(45deg)' 
                              : 'translate(-50%, -50%)',
                            boxShadow: isometricView ? '5px 5px 10px rgba(0, 0, 0, 0.2)' : 'none',
                          }}
                          onClick={() => handleRemoveComponent(index)}
                        >
                          <span className={`text-xs font-medium pointer-events-none ${
                            isometricView ? 'transform -rotate-45 -translate-y-1' : ''
                          }`}>
                            {label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
                
                <div className="mt-2 text-xs text-muted-foreground">
                  Drag components from the library and drop them on the grid. Click on a placed component to remove it.
                </div>
              </TabsContent>
              
              <TabsContent value="furnished" className="mt-0">
                <div className="border-2 border-dashed rounded-md bg-secondary/10 relative overflow-hidden" style={{ height: '700px' }}>
                  <PlotFurnishingPreview 
                    components={selectedComponents}
                    gridSize={{ width: 1000, height: 800 }}
                    isometricView={isometricView}
                  />
                </div>
                
                <div className="mt-2 text-xs text-muted-foreground">
                  This is how your floorplan would look with furniture. The preview updates as you modify the design.
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
            
            {/* AI Assistant */}
            <Card className="lg:col-span-4 mt-6">
              <CardContent className="pt-6">
                <FloorplanAIAssistant
                  plotSize={property.plotSize || ''}
                  selectedComponents={selectedComponents}
                  availableComponents={floorplanComponents}
                  onApplySuggestion={handleApplyAISuggestion}
                />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        {/* Elevation Planner */}
        <TabsContent value="elevation">
          {/* Step 1: Select a floorplan */}
          {!selectedFloorplan ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-3">
                <CardContent className="pt-6">
                  <h3 className="text-lg font-bold mb-4">Your Floorplans</h3>
                  
                  {isLoadingFloorplans ? (
                    <div className="flex justify-center p-4">Loading floorplans...</div>
                  ) : userFloorplans && userFloorplans.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {userFloorplans.filter(fp => fp.propertyId === propertyId).map((floorplan) => (
                        <div
                          key={floorplan.id}
                          className="p-4 border rounded-lg cursor-pointer hover:border-primary transition-colors"
                          onClick={() => setSelectedFloorplan(floorplan)}
                        >
                          <div className="text-lg font-medium mb-1">{floorplan.name}</div>
                          <div className="text-sm text-muted-foreground">Created: {new Date(floorplan.createdAt).toLocaleDateString()}</div>
                          <div className="mt-4 flex justify-between items-center">
                            <Button 
                              variant="destructive" 
                              size="sm"
                              onClick={(e) => handleDeleteFloorplan(floorplan.id, e)}
                            >
                              Delete
                            </Button>
                            <Button size="sm">Select This Floorplan</Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center p-8 bg-secondary/10 rounded-md">
                      <h4 className="text-lg font-medium mb-2">No floorplans found</h4>
                      <p className="text-muted-foreground mb-4">
                        Before creating an elevation design, you need to create a floorplan.
                      </p>
                      <Button 
                        onClick={() => setSelectedTab('floorplan')}
                        className="mx-auto"
                      >
                        Go to Floorplan Designer
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          ) : (
            /* Step 2: Interactive Elevation Planner */
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-primary">
                  Designing Elevation for: {selectedFloorplan.name}
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedFloorplan(null)}
                >
                  Choose Different Floorplan
                </Button>
              </div>
              
              <InteractiveElevationPlanner 
                floorplan={selectedFloorplan} 
                onSave={handleSaveElevation}
              />
            </div>
          )}
        </TabsContent>
      </Tabs>
      
      {/* 3D Preview of current design */}
      {(selectedElevation || selectedComponents.length > 0 || selectedFloorplan) && (
        <Card className="mt-8">
          <CardContent className="pt-6">
            <h3 className="text-xl font-bold mb-4">3D Preview</h3>
            <div className="w-full h-[400px] bg-secondary/10 rounded-md relative overflow-hidden">
              <ThreeScene 
                modelUrl={selectedElevation?.modelUrl || property.modelUrl}
                propertyType={property.type}
                plotSize={property.plotSize}
                floorplan={
                  selectedComponents.length > 0 
                    ? selectedComponents 
                    : selectedFloorplan
                      ? selectedFloorplan
                      : undefined
                }
                materialOptions={selectedElevation ? selectedMaterials : undefined}
                colorOptions={selectedElevation ? selectedColors : undefined}
              />
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* AR dialog */}
      <AlertDialog open={showARDialog} onOpenChange={setShowARDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>View in AR</AlertDialogTitle>
            <AlertDialogDescription>
              Ready to view your design in augmented reality? This will open the AR viewer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground mb-2">
              The AR view will allow you to place your design in real space using your device's camera.
            </p>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => navigate(`/ar-view?propertyId=${propertyId}`)}>
              Launch AR View
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
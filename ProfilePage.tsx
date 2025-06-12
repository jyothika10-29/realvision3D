import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Camera, KeyRound, Mail, User, History, Home, Heart, Bell } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

// Define form schemas
const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
});

const securitySchema = z.object({
  currentPassword: z.string().min(6, "Password must be at least 6 characters"),
  newPassword: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Password must be at least 6 characters"),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const notificationSchema = z.object({
  emailNotifications: z.boolean(),
  propertyAlerts: z.boolean(),
  marketUpdates: z.boolean(),
  accountAlerts: z.boolean(),
});

// Define form value types
type ProfileFormValues = z.infer<typeof profileSchema>;
type SecurityFormValues = z.infer<typeof securitySchema>;
type NotificationFormValues = z.infer<typeof notificationSchema>;

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState("profile");
  const { user, logoutMutation } = useAuth();
  const { toast } = useToast();
  const [location, navigate] = useLocation();

  // Redirect if not logged in
  if (!user) {
    navigate("/auth");
    return null;
  }

  // Activity history (this would come from an API in a real app)
  const activityHistory = [
    { 
      type: "view", 
      propertyId: 1, 
      propertyName: "Modern Family Home", 
      date: "2025-04-06T14:32:00Z",
      icon: <Home className="h-4 w-4 text-blue-500" />
    },
    { 
      type: "save", 
      propertyId: 3, 
      propertyName: "Luxury Apartment", 
      date: "2025-04-05T09:15:00Z",
      icon: <Heart className="h-4 w-4 text-red-500" /> 
    },
    { 
      type: "ar-view", 
      propertyId: 2, 
      propertyName: "Suburban Townhouse", 
      date: "2025-04-04T16:45:00Z",
      icon: <Camera className="h-4 w-4 text-green-500" />
    },
  ];

  // Saved properties (this would come from an API in a real app)
  const savedProperties = [
    {
      id: 3,
      name: "Luxury Apartment",
      price: "$1,250,000",
      imageUrl: "/property3.jpg"
    },
    {
      id: 5,
      name: "Beachfront Villa",
      price: "$2,800,000",
      imageUrl: "/property5.jpg"
    }
  ];

  // Profile form
  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
    },
  });

  // Security form
  const securityForm = useForm<SecurityFormValues>({
    resolver: zodResolver(securitySchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  // Notifications form
  const notificationForm = useForm<NotificationFormValues>({
    resolver: zodResolver(notificationSchema),
    defaultValues: {
      emailNotifications: true,
      propertyAlerts: true,
      marketUpdates: false,
      accountAlerts: true,
    },
  });

  // Handle profile update
  const onProfileSubmit = (data: ProfileFormValues) => {
    // In a real app, we would call an API to update the profile
    toast({
      title: "Profile updated",
      description: "Your profile information has been updated successfully.",
    });
  };

  // Handle password change
  const onSecuritySubmit = (data: SecurityFormValues) => {
    // In a real app, we would call an API to change the password
    securityForm.reset();
    toast({
      title: "Password changed",
      description: "Your password has been updated successfully.",
    });
  };

  // Handle notification preferences
  const onNotificationSubmit = (data: NotificationFormValues) => {
    // In a real app, we would call an API to update notification preferences
    toast({
      title: "Notification preferences updated",
      description: "Your notification preferences have been saved.",
    });
  };

  // Handle account deletion
  const handleDeleteAccount = () => {
    // In a real app, we would call an API to delete the account
    const confirmed = window.confirm(
      "Are you sure you want to delete your account? This action cannot be undone."
    );
    
    if (confirmed) {
      logoutMutation.mutate(undefined, {
        onSuccess: () => {
          toast({
            title: "Account deleted",
            description: "Your account has been deleted successfully.",
          });
          navigate("/");
        },
      });
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="container max-w-6xl py-10 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* User info sidebar */}
        <div className="md:w-1/3">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex justify-center mb-4">
                <Avatar className="h-24 w-24">
                  <AvatarImage src="/avatar-placeholder.jpg" />
                  <AvatarFallback className="text-3xl bg-primary/10">
                    {user.name?.charAt(0)?.toUpperCase() || user.username?.charAt(0)?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </div>
              <CardTitle className="text-center text-2xl">{user.name || user.username}</CardTitle>
              <CardDescription className="text-center">
                {user.email || "No email provided"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 px-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Member since</span>
                  <span className="font-medium">
                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Properties viewed</span>
                  <Badge variant="outline">5</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Saved properties</span>
                  <Badge variant="outline">{savedProperties.length}</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">AR experiences</span>
                  <Badge variant="outline">3</Badge>
                </div>
              </div>
            </CardContent>
            <CardFooter className="px-4 py-4">
              <Button variant="outline" className="w-full" onClick={() => logoutMutation.mutate()}>
                Sign Out
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* Main content area */}
        <div className="md:w-2/3">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-4 mb-8">
              <TabsTrigger value="profile">Profile</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
              <TabsTrigger value="notifications">Notifications</TabsTrigger>
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value="profile">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>
                    Update your personal information and how it appears on your account
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...profileForm}>
                    <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
                      <FormField
                        control={profileForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Your name" {...field} />
                            </FormControl>
                            <FormDescription>
                              This is the name that will be displayed on your profile
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={profileForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input 
                                type="email" 
                                placeholder="you@example.com" 
                                {...field} 
                              />
                            </FormControl>
                            <FormDescription>
                              We'll use this email for notifications and account recovery
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="mt-6">
                        <Button type="submit">Save Changes</Button>
                      </div>
                    </form>
                  </Form>
                </CardContent>
              </Card>

              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Saved Properties</CardTitle>
                  <CardDescription>
                    Properties you've saved for future reference
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {savedProperties.length > 0 ? (
                    <div className="space-y-4">
                      {savedProperties.map(property => (
                        <div key={property.id} className="flex items-center gap-4 p-3 bg-secondary/20 rounded-lg">
                          <div className="w-16 h-16 bg-secondary rounded-md flex items-center justify-center overflow-hidden">
                            {property.imageUrl ? (
                              <img 
                                src={property.imageUrl} 
                                alt={property.name} 
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Home className="h-8 w-8 text-secondary-foreground/60" />
                            )}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium">{property.name}</h4>
                            <p className="text-sm text-muted-foreground">{property.price}</p>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => navigate(`/properties/${property.id}`)}
                          >
                            View
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Heart className="h-12 w-12 mx-auto mb-3 opacity-20" />
                      <p>You haven't saved any properties yet</p>
                      <Button 
                        variant="link" 
                        className="mt-2"
                        onClick={() => navigate('/properties')}
                      >
                        Browse properties
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Security Tab */}
            <TabsContent value="security">
              <Card>
                <CardHeader>
                  <CardTitle>Security Settings</CardTitle>
                  <CardDescription>
                    Manage your password and security preferences
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...securityForm}>
                    <form onSubmit={securityForm.handleSubmit(onSecuritySubmit)} className="space-y-6">
                      <FormField
                        control={securityForm.control}
                        name="currentPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Current Password</FormLabel>
                            <FormControl>
                              <Input 
                                type="password" 
                                placeholder="••••••••" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={securityForm.control}
                        name="newPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>New Password</FormLabel>
                            <FormControl>
                              <Input 
                                type="password" 
                                placeholder="••••••••" 
                                {...field} 
                              />
                            </FormControl>
                            <FormDescription>
                              Password must be at least 6 characters long
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={securityForm.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Confirm New Password</FormLabel>
                            <FormControl>
                              <Input 
                                type="password" 
                                placeholder="••••••••" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="mt-6">
                        <Button type="submit">Change Password</Button>
                      </div>
                    </form>
                  </Form>
                </CardContent>
              </Card>

              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="text-destructive">Danger Zone</CardTitle>
                  <CardDescription>
                    Permanently delete your account and all associated data
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Once you delete your account, there is no going back. This action cannot be undone.
                  </p>
                  <Button 
                    variant="destructive" 
                    onClick={handleDeleteAccount}
                  >
                    Delete Account
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Activity History Tab */}
            <TabsContent value="activity">
              <Card>
                <CardHeader>
                  <CardTitle>Activity History</CardTitle>
                  <CardDescription>
                    Your recent activity on RealVisionAR
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {activityHistory.length > 0 ? (
                    <div className="space-y-4">
                      {activityHistory.map((activity, index) => (
                        <div key={index} className="flex items-start gap-4 p-4 border-b last:border-0">
                          <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center">
                            {activity.icon}
                          </div>
                          <div className="flex-1">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-medium">
                                  {activity.type === 'view' && 'Viewed property'}
                                  {activity.type === 'save' && 'Saved property'}
                                  {activity.type === 'ar-view' && 'Used AR view on property'}
                                </p>
                                <p className="text-sm text-primary">
                                  {activity.propertyName}
                                </p>
                              </div>
                              <p className="text-xs text-muted-foreground">
                                {formatDate(activity.date)}
                              </p>
                            </div>
                            <div className="mt-2">
                              <Button 
                                variant="link" 
                                className="h-auto p-0 text-sm"
                                onClick={() => navigate(`/properties/${activity.propertyId}`)}
                              >
                                View Property
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <History className="h-12 w-12 mx-auto mb-3 opacity-20" />
                      <p>No activity yet</p>
                      <Button 
                        variant="link" 
                        className="mt-2"
                        onClick={() => navigate('/properties')}
                      >
                        Browse properties
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Notifications Tab */}
            <TabsContent value="notifications">
              <Card>
                <CardHeader>
                  <CardTitle>Notification Preferences</CardTitle>
                  <CardDescription>
                    Choose what types of notifications you'd like to receive
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...notificationForm}>
                    <form onSubmit={notificationForm.handleSubmit(onNotificationSubmit)} className="space-y-6">
                      <FormField
                        control={notificationForm.control}
                        name="emailNotifications"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Email Notifications</FormLabel>
                              <FormDescription>
                                Receive notifications via email
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={notificationForm.control}
                        name="propertyAlerts"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Property Alerts</FormLabel>
                              <FormDescription>
                                Get notified about new properties matching your criteria
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={notificationForm.control}
                        name="marketUpdates"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Market Updates</FormLabel>
                              <FormDescription>
                                Receive real estate market trends and updates
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={notificationForm.control}
                        name="accountAlerts"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base">Account Alerts</FormLabel>
                              <FormDescription>
                                Get important updates about your account
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      
                      <div className="mt-6">
                        <Button type="submit">Save Preferences</Button>
                      </div>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
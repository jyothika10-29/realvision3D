import { useState } from "react";
import { useLocation } from "wouter";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useAuth } from "@/hooks/use-auth";
import { useTheme } from "@/hooks/use-theme";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";

// Custom styled input component
import React, { forwardRef } from "react";

const WhiteInput = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  (props, ref) => {
    const { theme } = useTheme();
    return (
      <Input 
        ref={ref}
        {...props} 
        className="themed-input"
        style={{
          backgroundColor: theme === 'dark' ? '#1e293b' : 'white',
          borderColor: theme === 'dark' ? '#334155' : '#d1d5db',
          color: theme === 'dark' ? '#f8fafc' : 'inherit',
          boxShadow: "none",
          transition: "background-color 0.3s, border-color 0.3s, color 0.3s"
        }}
      />
    );
  }
);

// Extend the schema with client-side validation
const loginSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Password must be at least 6 characters"),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const [activeTab, setActiveTab] = useState("login");
  const [location, navigate] = useLocation();
  const { user, loginMutation, registerMutation } = useAuth();
  const { theme } = useTheme();

  // Redirect if already logged in
  if (user) {
    navigate("/");
    return null;
  }

  // Get saved credentials if available
  const { getSavedCredentials, savedUsername, rememberMe, setRememberMe } = useAuth();
  const savedCredentials = getSavedCredentials();
  
  // Login Form with saved username if available
  const loginForm = useForm<LoginFormValues & { rememberMe: boolean }>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: savedCredentials.username || "",
      password: "",
      rememberMe: rememberMe,
    },
  });

  // Register Form
  const registerForm = useForm<RegisterFormValues & { rememberMe: boolean }>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      rememberMe: true, // Default to true for new registrations
    },
  });

  // Handle login form submission
  const onLoginSubmit = (data: LoginFormValues & { rememberMe: boolean }) => {
    const { rememberMe: remember, ...loginData } = data;
    
    // Update the global rememberMe state
    setRememberMe(remember);
    
    // Pass both login credentials and rememberMe preference
    loginMutation.mutate({ ...loginData, rememberMe: remember }, {
      onSuccess: () => {
        navigate("/");
      },
    });
  };

  // Handle register form submission
  const onRegisterSubmit = (data: RegisterFormValues & { rememberMe: boolean }) => {
    const { confirmPassword, rememberMe: remember, ...userData } = data;
    
    // Update the global rememberMe state
    setRememberMe(remember);
    
    // Pass both user data and rememberMe preference
    registerMutation.mutate({ ...userData, rememberMe: remember }, {
      onSuccess: () => {
        navigate("/");
      },
    });
  };

  return (
    <div className={`min-h-screen flex items-center justify-center ${theme === 'dark' ? 'bg-slate-900' : 'bg-slate-100'} p-4 transition-colors duration-300`}>
      <div className={`grid md:grid-cols-2 gap-8 max-w-6xl w-full mx-auto ${theme === 'dark' ? 'bg-slate-800' : 'bg-white'} rounded-2xl shadow-lg overflow-hidden transition-colors duration-300`}>
        {/* Left side - Auth Forms */}
        <div className="p-8 flex flex-col justify-center">
          <div className="mb-8">
            <h1 className="text-3xl font-bold tracking-tight mb-2">
              RealVisionAR
            </h1>
            <p className="text-muted-foreground">
              Log in to explore properties in augmented reality
            </p>
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-2 mb-6">
              <TabsTrigger value="login">Log In</TabsTrigger>
              <TabsTrigger value="register">Create New Account</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <Card className="border-none shadow-none">
                <CardHeader className="px-0 pt-0">
                  <CardTitle>Welcome back</CardTitle>
                  <CardDescription>
                    Enter your credentials to log in to your account
                  </CardDescription>
                </CardHeader>
                <CardContent className="px-0">
                  <Form {...loginForm}>
                    <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                      <FormField
                        control={loginForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                              <WhiteInput 
                                placeholder="yourusername" 
                                {...field} 
                                disabled={loginMutation.isPending}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={loginForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <WhiteInput 
                                type="password" 
                                placeholder="••••••••" 
                                {...field}
                                disabled={loginMutation.isPending}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={loginForm.control}
                        name="rememberMe"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                disabled={loginMutation.isPending}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>Remember me</FormLabel>
                            </div>
                          </FormItem>
                        )}
                      />
                      
                      <Button 
                        type="submit" 
                        className="w-full"
                        disabled={loginMutation.isPending}
                      >
                        {loginMutation.isPending ? "Logging in..." : "Log In"}
                      </Button>
                      
                      {loginMutation.isError && (
                        <p className="text-sm text-destructive">
                          {loginMutation.error?.message || "Failed to login. Please try again."}
                        </p>
                      )}
                    </form>
                  </Form>
                </CardContent>
                <CardFooter className="px-0 pb-0">
                  <div className="text-sm text-muted-foreground">
                    Don't have an account?{" "}
                    <Button 
                      variant="link" 
                      className="p-0" 
                      onClick={() => setActiveTab("register")}
                    >
                      Create one now
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="register">
              <Card className="border-none shadow-none">
                <CardHeader className="px-0 pt-0">
                  <CardTitle>Create an account</CardTitle>
                  <CardDescription>
                    Enter your details to create a new account
                  </CardDescription>
                </CardHeader>
                <CardContent className="px-0">
                  <Form {...registerForm}>
                    <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                      <FormField
                        control={registerForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                              <WhiteInput 
                                placeholder="Your Name" 
                                {...field}
                                disabled={registerMutation.isPending}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={registerForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                              <WhiteInput 
                                placeholder="yourusername" 
                                {...field}
                                disabled={registerMutation.isPending}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={registerForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <WhiteInput 
                                type="email" 
                                placeholder="you@example.com" 
                                {...field}
                                disabled={registerMutation.isPending}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={registerForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <WhiteInput 
                                type="password" 
                                placeholder="••••••••" 
                                {...field}
                                disabled={registerMutation.isPending}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={registerForm.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Confirm Password</FormLabel>
                            <FormControl>
                              <WhiteInput 
                                type="password" 
                                placeholder="••••••••" 
                                {...field}
                                disabled={registerMutation.isPending}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={registerForm.control}
                        name="rememberMe"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                disabled={registerMutation.isPending}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>Remember me</FormLabel>
                            </div>
                          </FormItem>
                        )}
                      />
                      
                      <Button 
                        type="submit" 
                        className="w-full"
                        disabled={registerMutation.isPending}
                      >
                        {registerMutation.isPending ? "Creating Account..." : "Create Account"}
                      </Button>
                      
                      {registerMutation.isError && (
                        <p className="text-sm text-destructive">
                          {registerMutation.error?.message || "Failed to create account. Please try again."}
                        </p>
                      )}
                    </form>
                  </Form>
                </CardContent>
                <CardFooter className="px-0 pb-0">
                  <div className="text-sm text-muted-foreground">
                    Already have an account?{" "}
                    <Button 
                      variant="link" 
                      className="p-0" 
                      onClick={() => setActiveTab("login")}
                    >
                      Log in instead
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
        
        {/* Right side - Hero section */}
        <div className="hidden md:block bg-gradient-to-br from-primary/80 to-primary/30 text-white p-12 flex flex-col justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('/pattern.svg')] opacity-10"></div>
          <div className="relative z-10">
            <h2 className="text-3xl font-bold mb-6">Experience Real Estate in Augmented Reality</h2>
            <p className="text-white/90 mb-8">
              Explore properties in a whole new dimension with our cutting-edge AR technology. 
              See floor plans come to life and visualize your future home before even visiting.
            </p>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                  <span className="text-white">✓</span>
                </div>
                <div>
                  <h3 className="font-medium">3D Property Tours</h3>
                  <p className="text-white/80 text-sm">Explore every corner of properties in immersive 3D</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                  <span className="text-white">✓</span>
                </div>
                <div>
                  <h3 className="font-medium">AR Visualization</h3>
                  <p className="text-white/80 text-sm">See how furniture fits in your potential new home</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                  <span className="text-white">✓</span>
                </div>
                <div>
                  <h3 className="font-medium">Interactive Floor Plans</h3>
                  <p className="text-white/80 text-sm">Click on any room to see detailed information</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Redirect } from "wouter";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";

// Form schemas
const emailLoginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

const mobileLoginSchema = z.object({
  mobileNumber: z.string().min(10, { message: "Please enter a valid mobile number" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

const emailRegisterSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

const mobileRegisterSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  mobileNumber: z.string().min(10, { message: "Please enter a valid mobile number" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

const otpVerificationSchema = z.object({
  mobileNumber: z.string().min(10, { message: "Please enter a valid mobile number" }),
  otpCode: z.string().length(6, { message: "OTP must be 6 digits" }),
});

export default function AuthPage() {
  const { 
    user,
    emailLoginMutation, 
    mobileLoginMutation,
    emailRegisterMutation,
    mobileRegisterMutation,
    generateOtpMutation, 
    verifyOtpMutation 
  } = useAuth();
  
  const [authTab, setAuthTab] = useState<"login" | "register">("login");
  const [methodTab, setMethodTab] = useState<"email" | "mobile">("email");
  const [showOtpVerification, setShowOtpVerification] = useState(false);
  const [pendingMobileNumber, setPendingMobileNumber] = useState("");

  // Email login form
  const emailLoginForm = useForm<z.infer<typeof emailLoginSchema>>({
    resolver: zodResolver(emailLoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // Mobile login form
  const mobileLoginForm = useForm<z.infer<typeof mobileLoginSchema>>({
    resolver: zodResolver(mobileLoginSchema),
    defaultValues: {
      mobileNumber: "",
      password: "",
    },
  });

  // Email register form
  const emailRegisterForm = useForm<z.infer<typeof emailRegisterSchema>>({
    resolver: zodResolver(emailRegisterSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  // Mobile register form
  const mobileRegisterForm = useForm<z.infer<typeof mobileRegisterSchema>>({
    resolver: zodResolver(mobileRegisterSchema),
    defaultValues: {
      name: "",
      mobileNumber: "",
      password: "",
    },
  });

  // OTP verification form
  const otpVerificationForm = useForm<z.infer<typeof otpVerificationSchema>>({
    resolver: zodResolver(otpVerificationSchema),
    defaultValues: {
      mobileNumber: pendingMobileNumber,
      otpCode: "",
    },
  });

  // Handle email login
  const onEmailLoginSubmit = (data: z.infer<typeof emailLoginSchema>) => {
    emailLoginMutation.mutate(data);
  };

  // Handle mobile login
  const onMobileLoginSubmit = (data: z.infer<typeof mobileLoginSchema>) => {
    mobileLoginMutation.mutate(data);
  };

  // Handle email register
  const onEmailRegisterSubmit = (data: z.infer<typeof emailRegisterSchema>) => {
    emailRegisterMutation.mutate(data);
  };

  // Handle mobile register
  const onMobileRegisterSubmit = (data: z.infer<typeof mobileRegisterSchema>) => {
    mobileRegisterMutation.mutate(data);
    setPendingMobileNumber(data.mobileNumber);
    generateOtpMutation.mutate({ mobileNumber: data.mobileNumber });
    setShowOtpVerification(true);
  };

  // Handle OTP verification
  const onOtpVerificationSubmit = (data: z.infer<typeof otpVerificationSchema>) => {
    verifyOtpMutation.mutate(data);
  };

  // Generate OTP for login
  const handleGenerateOtp = () => {
    const mobileNumber = mobileLoginForm.getValues("mobileNumber");
    if (mobileNumber) {
      setPendingMobileNumber(mobileNumber);
      generateOtpMutation.mutate({ mobileNumber });
      setShowOtpVerification(true);
    }
  };

  // Redirect if user is already logged in
  if (user) {
    return <Redirect to="/" />;
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left side - Auth forms */}
      <div className="w-full md:w-1/2 p-6 flex items-center justify-center">
        <div className="w-full max-w-md">
          <h1 className="text-3xl font-bold mb-6 text-center">
            <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              AR Real Estate
            </span>
          </h1>

          {showOtpVerification ? (
            <Card>
              <CardHeader>
                <CardTitle>Verify Mobile Number</CardTitle>
                <CardDescription>
                  Enter the 6-digit code sent to your mobile
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...otpVerificationForm}>
                  <form
                    onSubmit={otpVerificationForm.handleSubmit(onOtpVerificationSubmit)}
                    className="space-y-4"
                  >
                    <FormField
                      control={otpVerificationForm.control}
                      name="mobileNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Mobile Number</FormLabel>
                          <FormControl>
                            <Input {...field} readOnly />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={otpVerificationForm.control}
                      name="otpCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>OTP Code</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Enter 6-digit OTP" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={verifyOtpMutation.isPending}
                    >
                      {verifyOtpMutation.isPending && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      Verify
                    </Button>
                  </form>
                </Form>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowOtpVerification(false);
                    setPendingMobileNumber("");
                  }}
                >
                  Back
                </Button>
                <Button
                  variant="link"
                  onClick={() => generateOtpMutation.mutate({ mobileNumber: pendingMobileNumber })}
                  disabled={generateOtpMutation.isPending}
                >
                  {generateOtpMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Resend OTP
                </Button>
              </CardFooter>
            </Card>
          ) : (
            <Tabs value={authTab} onValueChange={(v) => setAuthTab(v as any)}>
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
              </TabsList>

              {/* Login Tab */}
              <TabsContent value="login">
                <Card>
                  <CardHeader>
                    <CardTitle>Welcome Back</CardTitle>
                    <CardDescription>
                      Sign in to your account to explore properties
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Tabs value={methodTab} onValueChange={(v) => setMethodTab(v as any)}>
                      <TabsList className="grid w-full grid-cols-2 mb-4">
                        <TabsTrigger value="email">Email</TabsTrigger>
                        <TabsTrigger value="mobile">Mobile</TabsTrigger>
                      </TabsList>

                      {/* Email Login Form */}
                      <TabsContent value="email">
                        <Form {...emailLoginForm}>
                          <form
                            onSubmit={emailLoginForm.handleSubmit(onEmailLoginSubmit)}
                            className="space-y-4"
                          >
                            <FormField
                              control={emailLoginForm.control}
                              name="email"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Email</FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="your.email@example.com"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={emailLoginForm.control}
                              name="password"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Password</FormLabel>
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
                            <Button
                              type="submit"
                              className="w-full"
                              disabled={emailLoginMutation.isPending}
                            >
                              {emailLoginMutation.isPending && (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              )}
                              Sign In
                            </Button>
                          </form>
                        </Form>
                      </TabsContent>

                      {/* Mobile Login Form */}
                      <TabsContent value="mobile">
                        <Form {...mobileLoginForm}>
                          <form
                            onSubmit={mobileLoginForm.handleSubmit(onMobileLoginSubmit)}
                            className="space-y-4"
                          >
                            <FormField
                              control={mobileLoginForm.control}
                              name="mobileNumber"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Mobile Number</FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="Enter your mobile number"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={mobileLoginForm.control}
                              name="password"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Password</FormLabel>
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
                            <div className="flex space-x-2">
                              <Button
                                type="submit"
                                className="flex-1"
                                disabled={mobileLoginMutation.isPending}
                              >
                                {mobileLoginMutation.isPending && (
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                )}
                                Sign In
                              </Button>
                              <Button
                                type="button"
                                variant="outline"
                                onClick={handleGenerateOtp}
                                disabled={generateOtpMutation.isPending}
                              >
                                {generateOtpMutation.isPending && (
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                )}
                                Use OTP
                              </Button>
                            </div>
                          </form>
                        </Form>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Register Tab */}
              <TabsContent value="register">
                <Card>
                  <CardHeader>
                    <CardTitle>Create an Account</CardTitle>
                    <CardDescription>
                      Sign up to explore properties in AR
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Tabs value={methodTab} onValueChange={(v) => setMethodTab(v as any)}>
                      <TabsList className="grid w-full grid-cols-2 mb-4">
                        <TabsTrigger value="email">Email</TabsTrigger>
                        <TabsTrigger value="mobile">Mobile</TabsTrigger>
                      </TabsList>

                      {/* Email Register Form */}
                      <TabsContent value="email">
                        <Form {...emailRegisterForm}>
                          <form
                            onSubmit={emailRegisterForm.handleSubmit(onEmailRegisterSubmit)}
                            className="space-y-4"
                          >
                            <FormField
                              control={emailRegisterForm.control}
                              name="name"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Name</FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="Your Name"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={emailRegisterForm.control}
                              name="email"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Email</FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="your.email@example.com"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={emailRegisterForm.control}
                              name="password"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Password</FormLabel>
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
                            <Button
                              type="submit"
                              className="w-full"
                              disabled={emailRegisterMutation.isPending}
                            >
                              {emailRegisterMutation.isPending && (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              )}
                              Create Account
                            </Button>
                          </form>
                        </Form>
                      </TabsContent>

                      {/* Mobile Register Form */}
                      <TabsContent value="mobile">
                        <Form {...mobileRegisterForm}>
                          <form
                            onSubmit={mobileRegisterForm.handleSubmit(onMobileRegisterSubmit)}
                            className="space-y-4"
                          >
                            <FormField
                              control={mobileRegisterForm.control}
                              name="name"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Name</FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="Your Name"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={mobileRegisterForm.control}
                              name="mobileNumber"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Mobile Number</FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="Enter your mobile number"
                                      {...field}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={mobileRegisterForm.control}
                              name="password"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Password</FormLabel>
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
                            <Button
                              type="submit"
                              className="w-full"
                              disabled={mobileRegisterMutation.isPending}
                            >
                              {mobileRegisterMutation.isPending && (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              )}
                              Create Account
                            </Button>
                          </form>
                        </Form>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </div>

      {/* Right side - Hero section */}
      <div className="w-full md:w-1/2 bg-gradient-to-br from-primary/10 to-primary/5 p-6 hidden md:flex items-center justify-center">
        <div className="max-w-lg text-center">
          <h2 className="text-4xl font-bold mb-4">
            <span className="bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              Experience Real Estate in AR
            </span>
          </h2>
          <p className="text-xl text-gray-700 mb-8">
            Explore properties in augmented reality, visualize spaces before visiting, and experience a new dimension in real estate browsing.
          </p>
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-white rounded-lg p-4 shadow-md">
              <h3 className="font-semibold mb-2">3D Tours</h3>
              <p className="text-sm text-gray-600">Explore properties in detailed 3D models</p>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-md">
              <h3 className="font-semibold mb-2">AR Visualization</h3>
              <p className="text-sm text-gray-600">Place properties in your environment</p>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-md">
              <h3 className="font-semibold mb-2">Floor Plans</h3>
              <p className="text-sm text-gray-600">Interactive room-by-room walkthroughs</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
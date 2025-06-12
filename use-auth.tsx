import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import {
  useQuery,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import { insertUserSchema, User as SelectUser, InsertUser } from "@shared/schema";
import { getQueryFn, apiRequest, queryClient } from "../lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// Storage keys for saved credentials
const SAVED_USERNAME_KEY = "rv_saved_username";
const REMEMBER_ME_KEY = "rv_remember_me";

// Define types for mutation results
type LoginResult = { user: SelectUser; rememberMe?: boolean };
type RegisterResult = { user: SelectUser; rememberMe?: boolean };

// Define types for mutation inputs
type LoginInput = LoginData & { rememberMe?: boolean };
type RegisterInput = InsertUser & { rememberMe?: boolean };

type AuthContextType = {
  user: SelectUser | null;
  isLoading: boolean;
  error: Error | null;
  savedUsername: string | null;
  rememberMe: boolean;
  setRememberMe: (value: boolean) => void;
  loginMutation: UseMutationResult<LoginResult, Error, LoginInput>;
  logoutMutation: UseMutationResult<void, Error, void>;
  registerMutation: UseMutationResult<RegisterResult, Error, RegisterInput>;
  getSavedCredentials: () => { username: string | null };
  clearSavedCredentials: () => void;
};

type LoginData = Pick<InsertUser, "username" | "password">;

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [savedUsername, setSavedUsername] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState<boolean>(false);

  // Load saved credentials when component mounts
  useEffect(() => {
    try {
      const savedUsername = localStorage.getItem(SAVED_USERNAME_KEY);
      const rememberMeSetting = localStorage.getItem(REMEMBER_ME_KEY) === 'true';
      
      setSavedUsername(savedUsername);
      setRememberMe(rememberMeSetting);
      
      console.log("Loaded saved credentials:", { savedUsername, rememberMeSetting });
    } catch (error) {
      console.error("Error reading from localStorage:", error);
    }
  }, []);

  const {
    data: user,
    error,
    isLoading,
  } = useQuery<SelectUser | null, Error>({
    queryKey: ["/api/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });

  // Save user credentials to localStorage when rememberMe is enabled
  const saveCredentials = (username: string, remember: boolean) => {
    try {
      if (remember) {
        localStorage.setItem(SAVED_USERNAME_KEY, username);
        localStorage.setItem(REMEMBER_ME_KEY, 'true');
        setSavedUsername(username);
        setRememberMe(true);
        console.log(`Credentials saved for user: ${username}`);
      } else {
        clearSavedCredentials();
      }
    } catch (error) {
      console.error("Error saving to localStorage:", error);
    }
  };

  // Clear saved credentials from localStorage
  const clearSavedCredentials = () => {
    try {
      localStorage.removeItem(SAVED_USERNAME_KEY);
      localStorage.setItem(REMEMBER_ME_KEY, 'false');
      setSavedUsername(null);
      setRememberMe(false);
      console.log("Saved credentials cleared");
    } catch (error) {
      console.error("Error clearing localStorage:", error);
    }
  };

  // Get saved credentials for login form
  const getSavedCredentials = () => {
    return { username: savedUsername };
  };

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginData & { rememberMe?: boolean }) => {
      const { rememberMe: remember, ...loginCredentials } = credentials;
      const res = await apiRequest("POST", "/api/login", loginCredentials);
      return { 
        user: await res.json(),
        rememberMe: remember 
      };
    },
    onSuccess: (data: { user: SelectUser; rememberMe?: boolean }) => {
      const { user, rememberMe: remember = false } = data;
      queryClient.setQueryData(["/api/user"], user);
      
      // Save credentials if remember me is checked
      saveCredentials(user.username, remember);
      
      toast({
        title: "Login successful",
        description: `Welcome back, ${user.username}!`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Login failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (credentials: InsertUser & { rememberMe?: boolean }) => {
      const { rememberMe: remember, ...registerData } = credentials;
      const res = await apiRequest("POST", "/api/register", registerData);
      return { 
        user: await res.json(),
        rememberMe: remember 
      };
    },
    onSuccess: (data: { user: SelectUser; rememberMe?: boolean }) => {
      const { user, rememberMe: remember = true } = data;
      queryClient.setQueryData(["/api/user"], user);
      
      // Save credentials after registration (default to true)
      saveCredentials(user.username, remember);
      
      toast({
        title: "Registration successful",
        description: `Welcome, ${user.username}!`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/logout");
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/user"], null);
      
      // Note: We don't clear saved credentials here since we want to remember them
      // But we do update rememberMe setting if it was changed
      try {
        localStorage.setItem(REMEMBER_ME_KEY, rememberMe ? 'true' : 'false');
      } catch (error) {
        console.error("Error updating localStorage:", error);
      }
      
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Logout failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  return (
    <AuthContext.Provider
      value={{
        user: user ?? null,
        isLoading,
        error,
        savedUsername,
        rememberMe,
        setRememberMe,
        loginMutation,
        logoutMutation,
        registerMutation,
        getSavedCredentials,
        clearSavedCredentials,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
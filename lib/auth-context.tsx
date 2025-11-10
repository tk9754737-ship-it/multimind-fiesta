'use client';

import { createContext, SetStateAction, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from './supabase';
import { FcGoogle } from 'react-icons/fc'; // Install with: npm install react-icons


interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
  signInWithGoogle: () => Promise<{ error: Error | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event: any, session: SetStateAction<Session | null>) => {
      setSession(session);
      setUser((session as any)?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);
   const handleGoogleSignIn = async () => {
    setLoading(true);
    setError('');
    try {
      const { error } = await signInWithGoogle();
      if (error) throw error;
      // Supabase will redirect, so no need to push router here
    } catch (error: unknown) {
      setError((error as any)?.message || 'Google sign-in failed');
    } finally {
      setLoading(false);
    }
  };
   


  const signUp = async (email: string, password: string, fullName?: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const resetPassword = async (email: string): Promise<{ error: Error | null }> => {

  try {
    // Get the site URL from environment variable first
    let siteUrl = process.env.NEXT_PUBLIC_APP_URL;

    // If not set, construct from window location but ensure it's not localhost for production
    if (!siteUrl) {
      if (typeof window !== "undefined") {
        const { protocol, hostname, port } = window.location;
        if (hostname === "localhost" || hostname === "127.0.0.1") {
          // Fallback for local development
          siteUrl = "http://localhost:3000";
        } else {
          siteUrl = `${protocol}//${hostname}${port ? `:${port}` : ""}`;
        }
      } else {
        // Server-side fallback (for SSR or API routes)
        siteUrl = "https://multimind-ai.vercel.app";
      }
    }

    // Remove trailing slash if present
    siteUrl = siteUrl.replace(/\/$/, "");

    console.log("🔗 Using site URL:", siteUrl);

    // Attempt the password reset call
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${siteUrl}/reset-password`,
    });

    if (error) {
      console.error("❌ Supabase reset password error:", error);
      return { error };
    }

    console.log("✅ Password reset email sent successfully");
    return { error: null };
  } catch (err) {
    console.error("❌ Unexpected resetPassword error:", err);
   return { error: err instanceof Error ? err : new Error(String(err)) };

  }
};
  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
    signInWithGoogle
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
// Add this function to your auth-context
async function signInWithGoogle() {
  const { error } = await supabase.auth.signInWithOAuth({ provider: 'google' });
  return { error };
}

function setError(arg0: any) {
  throw new Error('Function not implemented.');
}

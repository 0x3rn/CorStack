"use client";

import { getFirebaseAuth } from '@/lib/firebase';


import { useState, FormEvent, useEffect } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useAdminAuth } from '@/components/AdminAuthProvider';
import toast from "react-hot-toast";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [user, loading, authError] = useAdminAuth();
  const router = useRouter();

  useEffect(() => {
    if (user && !loading) {
      router.push("/admin");
    }
  }, [user, loading, router]);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    
    try {
      await signInWithEmailAndPassword(getFirebaseAuth(), email, password);
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : "Failed to log in");
    } finally {
      setIsLoggingIn(false);
    }
  };

  if (loading) return <div className="min-h-[50vh] flex items-center justify-center">Loading...</div>;
  if (user) return null;

  return (
    <div className="flex items-center justify-center min-h-[80vh] px-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-soft p-8 border border-black/[0.05]">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-brand-dark mb-2">Admin Login</h1>
          <p className="text-text-muted text-sm">Sign in to manage your Corstack business.</p>
        </div>
        
        {authError && <p role="alert" className="mb-4 text-red-600">{authError}</p>}
        <form onSubmit={handleLogin} className="flex flex-col gap-5">
          <div>
            <label htmlFor="admin-email" className="block text-sm font-semibold text-gray-700 mb-2 ml-1">Email Address</label>
            <input 
              id="admin-email" autoComplete="username" type="email"
              required 
              className="w-full py-3 px-5 rounded-[12px] border border-black/10 font-[inherit] text-[0.95rem] outline-none transition-colors duration-300 focus:border-accent-primary focus:ring-4 focus:ring-accent-primary/15"
              placeholder="admin@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          
          <div>
            <label htmlFor="admin-password" className="block text-sm font-semibold text-gray-700 mb-2 ml-1">Password</label>
            <input 
              id="admin-password" autoComplete="current-password" type="password"
              required 
              className="w-full py-3 px-5 rounded-[12px] border border-black/10 font-[inherit] text-[0.95rem] outline-none transition-colors duration-300 focus:border-accent-primary focus:ring-4 focus:ring-accent-primary/15"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          
          <button 
            type="submit" 
            disabled={isLoggingIn}
            className="btn btn-primary w-full mt-4"
          >
            {isLoggingIn ? "Signing In..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}

"use client";

import { useState, FormEvent, useEffect } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../../lib/firebase";
import { useRouter } from "next/navigation";
import { useAuthState } from "react-firebase-hooks/auth";
import toast from "react-hot-toast";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [user, loading] = useAuthState(auth);
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
      await signInWithEmailAndPassword(auth, email, password);
      toast.success("Logged in successfully");
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Failed to log in");
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
        
        <form onSubmit={handleLogin} className="flex flex-col gap-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 ml-1">Email Address</label>
            <input 
              type="email" 
              required 
              className="w-full py-3 px-5 rounded-[12px] border border-black/10 font-[inherit] text-[0.95rem] outline-none transition-colors duration-300 focus:border-accent-primary focus:ring-4 focus:ring-accent-primary/15"
              placeholder="admin@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 ml-1">Password</label>
            <input 
              type="password" 
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

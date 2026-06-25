"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { auth } from "../../lib/firebase";
import { signOut } from "firebase/auth";
import { useAuthState } from "react-firebase-hooks/auth";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const [user, loading] = useAuthState(auth);
  const router = useRouter();

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/admin/login");
  };

  return (
    <div className="min-h-screen bg-bg-light flex flex-col">
      <nav className="site-header static flex justify-between items-center bg-white shadow-sm px-8 py-4 z-10 relative">
        <Link href="/" className="font-bold text-xl text-brand-dark">
          CorStack Admin
        </Link>
        {user && !loading && (
          <div className="flex items-center gap-6">
            <span className="text-sm text-text-muted">{user.email}</span>
            <button 
              onClick={handleLogout}
              className="text-sm font-semibold text-accent-primary hover:text-brand-dark transition-colors"
            >
              Logout
            </button>
          </div>
        )}
      </nav>
      
      <div className="flex flex-1 overflow-hidden">
        {user && !loading && (
          <aside className="w-64 bg-white border-r border-black/5 flex flex-col p-4 gap-2 shrink-0 overflow-y-auto">
            <Link href="/admin/overview" className="px-4 py-3 rounded-lg text-sm font-medium hover:bg-black/5 transition-colors">
              Overview
            </Link>
            <Link href="/admin" className="px-4 py-3 rounded-lg text-sm font-medium hover:bg-black/5 transition-colors">
              Leads
            </Link>
            <Link href="/admin/pricing" className="px-4 py-3 rounded-lg text-sm font-medium hover:bg-black/5 transition-colors">
              Pricing
            </Link>
            <Link href="/admin/portfolio" className="px-4 py-3 rounded-lg text-sm font-medium hover:bg-black/5 transition-colors">
              Portfolio
            </Link>
          </aside>
        )}
        
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

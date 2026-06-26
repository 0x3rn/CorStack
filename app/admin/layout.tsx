"use client";

import { ReactNode, useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { auth } from "../../lib/firebase";
import { signOut } from "firebase/auth";
import { useAuthState } from "react-firebase-hooks/auth";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const [user, loading] = useAuthState(auth);
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close mobile menu when navigating
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/admin/login");
  };

  return (
    <div className="h-[100dvh] overflow-hidden bg-bg-light flex flex-col md:flex-row">
      {/* Mobile Top Bar (Only visible on mobile when logged in, just for the hamburger) */}
      {user && !loading && (
        <div className="md:hidden flex items-center p-4 bg-white shadow-sm z-20">
          <button 
            className="text-brand-dark p-1 mr-4"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 12h18M3 6h18M3 18h18" />
            </svg>
          </button>
          <span className="font-bold text-lg text-brand-dark">CorStack Admin</span>
        </div>
      )}
      
      <div className="flex flex-1 overflow-hidden relative">
        {user && !loading && (
          <>
            {/* Mobile backdrop */}
            {isMobileMenuOpen && (
              <div 
                className="fixed inset-0 bg-black/50 z-30 md:hidden"
                onClick={() => setIsMobileMenuOpen(false)}
              />
            )}
            
            <aside className={`
              fixed md:static inset-y-0 left-0 z-40 w-64 bg-white border-r border-black/5 flex flex-col h-full
              transition-transform duration-300 ease-in-out shrink-0
              ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
            `}>
              {/* Header */}
              <div className="p-4 mb-2 px-6 flex justify-between items-center shrink-0">
                <Link href="/admin" className="font-bold text-xl text-brand-dark">
                  CorStack Admin
                </Link>
                <button 
                  className="md:hidden text-brand-dark p-1"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
                </button>
              </div>

              {/* Scrollable Links */}
              <div className="flex-1 overflow-y-auto px-4 flex flex-col gap-2">
                <Link href="/admin/overview" className={`px-4 py-3 rounded-lg text-sm font-medium hover:bg-black/5 transition-colors ${pathname === '/admin/overview' ? 'bg-black/5' : ''}`}>
                  Overview
                </Link>
                <Link href="/admin" className={`px-4 py-3 rounded-lg text-sm font-medium hover:bg-black/5 transition-colors ${pathname === '/admin' ? 'bg-black/5' : ''}`}>
                  Leads
                </Link>
                <Link href="/admin/pricing" className={`px-4 py-3 rounded-lg text-sm font-medium hover:bg-black/5 transition-colors ${pathname === '/admin/pricing' ? 'bg-black/5' : ''}`}>
                  Pricing
                </Link>
                <Link href="/admin/portfolio" className={`px-4 py-3 rounded-lg text-sm font-medium hover:bg-black/5 transition-colors ${pathname === '/admin/portfolio' ? 'bg-black/5' : ''}`}>
                  Portfolio
                </Link>
                <Link href="/admin/services" className={`px-4 py-3 rounded-lg text-sm font-medium hover:bg-black/5 transition-colors ${pathname === '/admin/services' ? 'bg-black/5' : ''}`}>
                  Services
                </Link>
                <Link href="/admin/client-types" className={`px-4 py-3 rounded-lg text-sm font-medium hover:bg-black/5 transition-colors ${pathname === '/admin/client-types' ? 'bg-black/5' : ''}`}>
                  Who We Work With
                </Link>
                <Link href="/admin/process" className={`px-4 py-3 rounded-lg text-sm font-medium hover:bg-black/5 transition-colors ${pathname === '/admin/process' ? 'bg-black/5' : ''}`}>
                  Process
                </Link>
                
                <div className="my-2 border-t border-black/5"></div>
                
                <Link href="/admin/settings" className={`px-4 py-3 rounded-lg text-sm font-medium hover:bg-black/5 transition-colors ${pathname === '/admin/settings' ? 'bg-black/5' : ''}`}>
                  Settings
                </Link>
                
                <div className="my-2 border-t border-black/5"></div>
                
                <Link href="/" className="flex items-center gap-2 px-4 py-3 rounded-lg text-sm font-medium hover:bg-black/5 transition-colors text-text-muted">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
                  Go back to main site
                </Link>
              </div>
              
              {/* Fixed Footer */}
              <div className="p-4 mt-auto border-t border-black/5 flex flex-col gap-2 shrink-0 bg-white">
                <div className="px-4 py-2 text-xs text-text-muted truncate">
                  {user.email}
                </div>
                <button 
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 rounded-lg text-sm font-semibold text-accent-primary hover:bg-black/5 transition-colors"
                >
                  Logout
                </button>
              </div>
            </aside>
          </>
        )}
        
        <main className="flex-1 overflow-y-auto p-4 md:p-8 w-full">
          {children}
        </main>
      </div>
    </div>
  );
}

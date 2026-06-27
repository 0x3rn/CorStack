"use client";

import { useEffect, useState } from "react";
import { auth } from "../../lib/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

interface Lead {
  id: string;
  status: string;
  actualPricePaid?: number;
  currency?: 'usd' | 'ngn';
}

export default function OverviewDashboard() {
  const [user, loading] = useAuthState(auth);
  const router = useRouter();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/admin/login");
    } else if (user) {
      if (process.env.NEXT_PUBLIC_ADMIN_EMAIL && user.email !== process.env.NEXT_PUBLIC_ADMIN_EMAIL) {
        toast.error("Unauthorized access. You are not the admin.");
        router.push("/");
      } else {
        fetchLeads();
      }
    }
  }, [user, loading, router]);

  const fetchLeads = async () => {
    if (!user) return;
    try {
      const token = await user.getIdToken();
      const res = await fetch('/api/admin/leads', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Failed to fetch leads: ${res.status} ${errorText}`);
      }
      
      const data = await res.json();
      setLeads(data.leads || []);
    } catch (error) {
      console.error("Error fetching leads:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (loading || isLoading) {
    return <div className="p-8 text-text-muted">Loading overview...</div>;
  }

  // Calculate totals
  const completedLeads = leads.filter(lead => lead.status === 'completed');
  
  const totalUsd = completedLeads
    .filter(lead => lead.currency === 'usd' && lead.actualPricePaid)
    .reduce((sum, lead) => sum + (lead.actualPricePaid || 0), 0);
    
  const totalNgn = completedLeads
    .filter(lead => lead.currency === 'ngn' && lead.actualPricePaid)
    .reduce((sum, lead) => sum + (lead.actualPricePaid || 0), 0);

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-brand-dark mb-8">Financial Overview</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* USD Card */}
        <div className="bg-white rounded-xl p-8 shadow-soft border border-black/5 flex flex-col justify-center items-center text-center">
          <p className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-2">Total Earned (USD)</p>
          <h2 className="text-5xl font-black text-brand-dark tracking-tighter">
            ${totalUsd.toLocaleString()}
          </h2>
          <p className="mt-4 text-sm text-text-muted">From international clients</p>
        </div>

        {/* NGN Card */}
        <div className="bg-white rounded-xl p-8 shadow-soft border border-black/5 flex flex-col justify-center items-center text-center">
          <p className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-2">Total Earned (NGN)</p>
          <h2 className="text-5xl font-black text-brand-dark tracking-tighter">
            ₦{totalNgn.toLocaleString()}
          </h2>
          <p className="mt-4 text-sm text-text-muted">From Nigerian clients</p>
        </div>
      </div>
      
      <div className="mt-8 bg-black/[0.03] border border-black/5 rounded-xl p-6">
        <h3 className="font-bold text-lg mb-2">How this is calculated</h3>
        <p className="text-sm text-text-muted mb-0">
          The totals above are calculated by summing the <strong>Price Paid</strong> of all projects in the Leads section that have been marked with the status <strong>Completed</strong>. Canceled or pending projects are not included.
        </p>
      </div>
    </div>
  );
}

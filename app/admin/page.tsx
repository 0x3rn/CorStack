"use client";
import { fetchJson } from "@/lib/client-http";

import { useEffect, useState, useCallback } from "react";
import { useAdminAuth } from '@/components/AdminAuthProvider';
import toast from "react-hot-toast";

interface Lead {
  id: string;
  status: string;
  actualPricePaid?: number;
  currency?: 'usd' | 'ngn';
}

export default function OverviewDashboard() {
  const [user, loading] = useAdminAuth();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoading, setIsLoading] = useState(true);



  const fetchLeads = useCallback(() => {
    if (!user) return Promise.resolve();
    return user.getIdToken().then(token => fetchJson<{ leads: Lead[] }>('/api/admin/leads', { headers: { Authorization: 'Bearer ' + token } }))
      .then(data => setLeads(data.leads))
      .catch(() => toast.error('Failed to load leads'))
      .finally(() => setIsLoading(false));
  }, [user]);

  useEffect(() => { if (user) void fetchLeads(); }, [user, fetchLeads]);

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

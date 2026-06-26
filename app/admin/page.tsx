"use client";

import { useEffect, useState } from "react";
import { auth } from "../../lib/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

interface Lead {
  id: string;
  name: string;
  email: string;
  message: string;
  createdAt: string;
  status: string;
  actualPricePaid?: number;
  currency?: 'usd' | 'ngn';
}

export default function AdminDashboard() {
  const [user, loading] = useAuthState(auth);
  const router = useRouter();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isLoadingLeads, setIsLoadingLeads] = useState(true);

  // States for inline editing
  const [editingLeadId, setEditingLeadId] = useState<string | null>(null);
  const [editStatus, setEditStatus] = useState('');
  const [editPrice, setEditPrice] = useState<number | ''>('');
  const [editCurrency, setEditCurrency] = useState<'usd' | 'ngn'>('usd');
  const [isSaving, setIsSaving] = useState(false);

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
      
      if (!res.ok) throw new Error('Failed to fetch leads');
      
      const data = await res.json();
      setLeads(data.leads || []);
    } catch (error) {
      console.error("Error fetching leads:", error);
    } finally {
      setIsLoadingLeads(false);
    }
  };

  const markAsRead = async (id: string, currentStatus: string) => {
    if (currentStatus !== 'new' || !user) return;
    
    try {
      const token = await user.getIdToken();
      const res = await fetch('/api/admin/leads', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ id, status: 'read' })
      });
      
      if (!res.ok) throw new Error('Failed to update lead');
      
      setLeads(prev => prev.map(lead => lead.id === id ? { ...lead, status: 'read' } : lead));
    } catch (error) {
      console.error("Error updating lead status:", error);
    }
  };

  const startEditing = (lead: Lead) => {
    setEditingLeadId(lead.id);
    setEditStatus(lead.status);
    setEditPrice(lead.actualPricePaid || '');
    setEditCurrency(lead.currency || 'usd');
  };

  const saveLeadDetails = async (id: string) => {
    if (!user) return;
    setIsSaving(true);
    try {
      const token = await user.getIdToken();
      const payload: any = { id, status: editStatus };
      if (editPrice !== '') {
        payload.actualPricePaid = Number(editPrice);
        payload.currency = editCurrency;
      }
      
      const res = await fetch('/api/admin/leads', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      
      if (!res.ok) throw new Error('Failed to update lead');
      
      setLeads(prev => prev.map(lead => lead.id === id ? { ...lead, status: editStatus, actualPricePaid: payload.actualPricePaid, currency: payload.currency } : lead));
      setEditingLeadId(null);
    } catch (error) {
      console.error("Error saving lead details:", error);
      toast.error("Failed to save changes");
    } finally {
      setIsSaving(false);
    }
  };

  if (loading || isLoadingLeads) {
    return <div className="p-8 text-text-muted">Loading dashboard...</div>;
  }

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-brand-dark mb-8">Leads & Messages</h1>
      
      {leads.length === 0 ? (
        <div className="bg-white rounded-xl p-8 text-center text-text-muted shadow-soft border border-black/5">
          No messages yet. When someone submits the contact form, it will appear here.
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {leads.map(lead => (
            <div 
              key={lead.id} 
              className={`bg-white rounded-xl p-6 shadow-soft border transition-colors ${lead.status === 'new' ? 'border-accent-primary bg-accent-primary/5' : 'border-black/5'}`}
              onMouseEnter={() => markAsRead(lead.id, lead.status)}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-lg text-brand-dark flex items-center gap-3">
                    {lead.name}
                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${lead.status === 'new' ? 'bg-accent-primary text-white' : 'bg-black/10 text-text-muted'}`}>
                      {lead.status}
                    </span>
                  </h3>
                  <a href={`mailto:${lead.email}`} className="text-sm text-accent-primary hover:underline">{lead.email}</a>
                </div>
                <div className="text-sm text-text-muted text-right">
                  {new Date(lead.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
              <div className="bg-bg-light rounded-lg p-4 text-sm text-text-muted whitespace-pre-wrap border border-black/5">
                {lead.message}
              </div>
              
              {/* EDITING MODE */}
              {editingLeadId === lead.id ? (
                <div className="mt-4 p-4 border border-black/10 rounded-lg bg-black/[0.02]">
                  <h4 className="font-bold text-sm mb-3">Edit Lead Status & Price</h4>
                  <div className="flex flex-wrap gap-4 items-end">
                    <div>
                      <label className="block text-xs font-semibold mb-1">Status</label>
                      <select 
                        value={editStatus} 
                        onChange={(e) => setEditStatus(e.target.value)}
                        className="py-1.5 px-3 border rounded text-sm bg-white"
                      >
                        <option value="new">New</option>
                        <option value="read">Read</option>
                        <option value="pending">Pending</option>
                        <option value="completed">Completed</option>
                        <option value="canceled">Canceled</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1">Price Paid</label>
                      <input 
                        type="number" 
                        value={editPrice}
                        onChange={(e) => setEditPrice(e.target.value ? Number(e.target.value) : '')}
                        placeholder="e.g. 500"
                        className="py-1.5 px-3 border rounded text-sm bg-white w-32"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1">Currency</label>
                      <select 
                        value={editCurrency} 
                        onChange={(e) => setEditCurrency(e.target.value as 'usd' | 'ngn')}
                        className="py-1.5 px-3 border rounded text-sm bg-white"
                      >
                        <option value="usd">USD</option>
                        <option value="ngn">NGN</option>
                      </select>
                    </div>
                    <div className="flex gap-2 ml-auto">
                      <button onClick={() => setEditingLeadId(null)} className="text-sm text-gray-500 hover:text-black">Cancel</button>
                      <button onClick={() => saveLeadDetails(lead.id)} disabled={isSaving} className="btn btn-primary py-1.5 px-4 text-sm">
                        {isSaving ? 'Saving...' : 'Save'}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mt-4 flex gap-3 justify-between items-center">
                  <div className="flex gap-3 items-center">
                    <a 
                      href={`mailto:${lead.email}`}
                      className="btn btn-secondary py-2 px-4 text-sm rounded-lg"
                    >
                      Reply via Email
                    </a>
                    <button 
                      onClick={() => startEditing(lead)}
                      className="text-sm font-semibold text-accent-primary hover:underline"
                    >
                      Edit Project Status & Price
                    </button>
                  </div>
                  {lead.actualPricePaid && (
                    <div className="text-sm font-bold">
                      Price Paid: {lead.currency === 'ngn' ? '₦' : '$'}{lead.actualPricePaid.toLocaleString()}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

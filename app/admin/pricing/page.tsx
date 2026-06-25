"use client";

import { useEffect, useState } from "react";
import { auth } from "../../../lib/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import toast from "react-hot-toast";

interface PricingTier {
  id?: string;
  name: string;
  desc: string;
  priceUsd: string;
  priceNgn: string;
  features: string[];
  isPopular: boolean;
  order: number;
}

export default function AdminPricingPage() {
  const [user, loading] = useAuthState(auth);
  const [tiers, setTiers] = useState<PricingTier[]>([]);
  const [isFetching, setIsFetching] = useState(true);
  
  const [isEditing, setIsEditing] = useState(false);
  const [currentTier, setCurrentTier] = useState<PricingTier | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user) {
      fetchPricing();
    }
  }, [user]);

  const fetchPricing = async () => {
    try {
      const res = await fetch('/api/content');
      const data = await res.json();
      setTiers(data.pricing || []);
    } catch (e) {
      toast.error('Failed to fetch pricing');
    } finally {
      setIsFetching(false);
    }
  };

  const handleEdit = (tier: PricingTier) => {
    setCurrentTier({ ...tier });
    setIsEditing(true);
  };

  const handleCreateNew = () => {
    setCurrentTier({
      name: '',
      desc: '',
      priceUsd: '',
      priceNgn: '',
      features: [''],
      isPopular: false,
      order: tiers.length
    });
    setIsEditing(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentTier || !user) return;
    setIsSaving(true);
    
    try {
      const token = await user.getIdToken();
      const method = currentTier.id ? 'PUT' : 'POST';
      
      const res = await fetch('/api/admin/pricing', {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(currentTier)
      });
      
      if (!res.ok) throw new Error('Failed to save');
      
      toast.success('Saved successfully');
      setIsEditing(false);
      fetchPricing();
    } catch (e) {
      toast.error('Failed to save');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this tier?')) return;
    if (!user) return;
    
    try {
      const token = await user.getIdToken();
      const res = await fetch(`/api/admin/pricing?id=${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!res.ok) throw new Error('Failed to delete');
      
      toast.success('Deleted successfully');
      fetchPricing();
    } catch (e) {
      toast.error('Failed to delete');
    }
  };

  if (loading || isFetching) return <div>Loading...</div>;
  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-brand-dark">Pricing Tiers</h1>
        {!isEditing && (
          <button onClick={handleCreateNew} className="btn btn-primary px-4 py-2 text-sm">
            Add New Tier
          </button>
        )}
      </div>

      {isEditing && currentTier ? (
        <form onSubmit={handleSave} className="bg-white rounded-xl shadow-soft p-6 border border-black/5 flex flex-col gap-5">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-xl font-bold">{currentTier.id ? 'Edit Tier' : 'New Tier'}</h2>
            <button type="button" onClick={() => setIsEditing(false)} className="text-gray-500 hover:text-black">Cancel</button>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1">Name</label>
              <input required type="text" className="w-full py-2 px-3 border rounded-lg" value={currentTier.name} onChange={e => setCurrentTier({...currentTier, name: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Order (Number)</label>
              <input required type="number" className="w-full py-2 px-3 border rounded-lg" value={currentTier.order} onChange={e => setCurrentTier({...currentTier, order: parseInt(e.target.value)})} />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-semibold mb-1">Description</label>
            <textarea required rows={2} className="w-full py-2 px-3 border rounded-lg" value={currentTier.desc} onChange={e => setCurrentTier({...currentTier, desc: e.target.value})} />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1">Price (USD)</label>
              <input required type="text" placeholder="e.g. 300 - $450" className="w-full py-2 px-3 border rounded-lg" value={currentTier.priceUsd} onChange={e => setCurrentTier({...currentTier, priceUsd: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Price (NGN)</label>
              <input required type="text" placeholder="e.g. 350,000 - ₦500,000" className="w-full py-2 px-3 border rounded-lg" value={currentTier.priceNgn} onChange={e => setCurrentTier({...currentTier, priceNgn: e.target.value})} />
            </div>
          </div>
          
          <div>
            <label className="flex items-center gap-2 cursor-pointer font-semibold text-sm">
              <input type="checkbox" checked={currentTier.isPopular} onChange={e => setCurrentTier({...currentTier, isPopular: e.target.checked})} />
              Mark as "Most Popular"
            </label>
          </div>
          
          <div>
            <label className="block text-sm font-semibold mb-2">Features</label>
            {currentTier.features.map((feature, idx) => (
              <div key={idx} className="flex gap-2 mb-2">
                <input 
                  type="text" 
                  required
                  className="flex-1 py-2 px-3 border rounded-lg" 
                  value={feature} 
                  onChange={e => {
                    const newFeatures = [...currentTier.features];
                    newFeatures[idx] = e.target.value;
                    setCurrentTier({...currentTier, features: newFeatures});
                  }} 
                />
                <button type="button" onClick={() => {
                  const newFeatures = currentTier.features.filter((_, i) => i !== idx);
                  setCurrentTier({...currentTier, features: newFeatures});
                }} className="px-3 bg-red-50 text-red-500 rounded-lg hover:bg-red-100">X</button>
              </div>
            ))}
            <button type="button" onClick={() => setCurrentTier({...currentTier, features: [...currentTier.features, '']})} className="text-sm font-semibold text-accent-primary mt-1">+ Add Feature</button>
          </div>
          
          <button type="submit" disabled={isSaving} className="btn btn-primary mt-4">
            {isSaving ? 'Saving...' : 'Save Tier'}
          </button>
        </form>
      ) : (
        <div className="grid gap-4">
          {tiers.map(tier => (
            <div key={tier.id} className="bg-white rounded-xl shadow-soft p-6 border border-black/5 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-lg">{tier.name} {tier.isPopular && <span className="ml-2 bg-accent-primary/10 text-accent-primary text-xs px-2 py-1 rounded-full uppercase">Popular</span>}</h3>
                <p className="text-sm text-text-muted mt-1">{tier.priceUsd} | {tier.priceNgn}</p>
              </div>
              <div className="flex gap-3">
                <button onClick={() => handleEdit(tier)} className="text-sm font-semibold text-accent-primary hover:underline">Edit</button>
                <button onClick={() => tier.id && handleDelete(tier.id)} className="text-sm font-semibold text-red-500 hover:underline">Delete</button>
              </div>
            </div>
          ))}
          {tiers.length === 0 && <div className="text-center py-12 text-text-muted border-2 border-dashed rounded-xl">No pricing tiers configured.</div>}
        </div>
      )}
    </div>
  );
}

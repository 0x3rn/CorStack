"use client";

import { useState, useEffect } from 'react';
import { auth } from '../../../lib/firebase';
import { usePricing } from '../../../hooks/usePricing';

export default function SettingsPage() {
  const { settings } = usePricing();
  
  const [general, setGeneral] = useState({
    heroHeadline: '',
    heroSubtitle: '',
    isAcceptingProjects: true,
    socialTwitter: '',
    socialInstagram: '',
    socialLinkedIn: ''
  });

  const [contact, setContact] = useState({
    ngnPhone: '',
    ngnEmail: '',
    usdPhone: '',
    usdEmail: ''
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Load initial data
  useEffect(() => {
    if (settings.general) {
      setGeneral(prev => ({ ...prev, ...settings.general }));
    }
    if (settings.contact) {
      setContact(prev => ({ ...prev, ...settings.contact }));
    }
  }, [settings]);

  const handleSave = async (docId: 'general' | 'contact', data: any) => {
    setLoading(true);
    setMessage('');
    
    try {
      const token = await auth.currentUser?.getIdToken();
      if (!token) throw new Error("Not authenticated");

      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ docId, ...data })
      });

      if (!res.ok) throw new Error('Failed to update settings');
      
      setMessage(`${docId} settings saved successfully! Refresh the page to see changes on the frontend.`);
    } catch (err: any) {
      setMessage(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Settings</h1>

      {message && (
        <div className={`p-4 mb-6 rounded ${message.startsWith('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          {message}
        </div>
      )}

      {/* General Settings */}
      <section className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 mb-8">
        <h2 className="text-lg font-semibold mb-4">General Settings</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Hero Headline</label>
            <input 
              type="text" 
              className="w-full p-2 border rounded focus:ring-2 focus:ring-accent-primary outline-none"
              value={general.heroHeadline}
              onChange={e => setGeneral({...general, heroHeadline: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Hero Subtitle</label>
            <textarea 
              className="w-full p-2 border rounded focus:ring-2 focus:ring-accent-primary outline-none h-24"
              value={general.heroSubtitle}
              onChange={e => setGeneral({...general, heroSubtitle: e.target.value})}
            />
          </div>
          
          <div className="flex items-center gap-2 mt-4">
            <input 
              type="checkbox" 
              id="isAccepting"
              className="w-4 h-4"
              checked={general.isAcceptingProjects}
              onChange={e => setGeneral({...general, isAcceptingProjects: e.target.checked})}
            />
            <label htmlFor="isAccepting" className="text-sm font-medium text-gray-700">Currently Accepting Projects</label>
          </div>

          <div className="pt-4 border-t mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">X / Twitter URL</label>
              <input 
                type="url" 
                className="w-full p-2 border rounded"
                value={general.socialTwitter}
                onChange={e => setGeneral({...general, socialTwitter: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Instagram URL</label>
              <input 
                type="url" 
                className="w-full p-2 border rounded"
                value={general.socialInstagram}
                onChange={e => setGeneral({...general, socialInstagram: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn URL</label>
              <input 
                type="url" 
                className="w-full p-2 border rounded"
                value={general.socialLinkedIn}
                onChange={e => setGeneral({...general, socialLinkedIn: e.target.value})}
              />
            </div>
          </div>

          <button 
            disabled={loading}
            onClick={() => handleSave('general', general)}
            className="mt-4 px-4 py-2 bg-black text-white rounded hover:bg-gray-800 disabled:opacity-50"
          >
            Save General Settings
          </button>
        </div>
      </section>

      {/* Contact Settings */}
      <section className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold mb-4">Contact Details</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Nigerian Clients */}
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900 border-b pb-2">Nigerian Clients (NGN)</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              <input 
                type="text" 
                className="w-full p-2 border rounded"
                value={contact.ngnPhone}
                onChange={e => setContact({...contact, ngnPhone: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <input 
                type="email" 
                className="w-full p-2 border rounded"
                value={contact.ngnEmail}
                onChange={e => setContact({...contact, ngnEmail: e.target.value})}
              />
            </div>
          </div>

          {/* International Clients */}
          <div className="space-y-4">
            <h3 className="font-medium text-gray-900 border-b pb-2">International Clients (USD)</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              <input 
                type="text" 
                className="w-full p-2 border rounded"
                value={contact.usdPhone}
                onChange={e => setContact({...contact, usdPhone: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <input 
                type="email" 
                className="w-full p-2 border rounded"
                value={contact.usdEmail}
                onChange={e => setContact({...contact, usdEmail: e.target.value})}
              />
            </div>
          </div>
        </div>

        <button 
          disabled={loading}
          onClick={() => handleSave('contact', contact)}
          className="mt-6 px-4 py-2 bg-black text-white rounded hover:bg-gray-800 disabled:opacity-50"
        >
          Save Contact Details
        </button>
      </section>
    </div>
  );
}

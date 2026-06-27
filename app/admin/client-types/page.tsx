"use client";

import { useEffect, useState } from "react";
import { auth } from "../../../lib/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

interface ClientTypeItem {
  id?: string;
  title: string;
  description: string;
  iconName: string;
  order: number;
}

export default function AdminClientTypesPage() {
  const [user, loading] = useAuthState(auth);
  const router = useRouter();
  const [items, setItems] = useState<ClientTypeItem[]>([]);
  const [isFetching, setIsFetching] = useState(true);
  
  const [isEditing, setIsEditing] = useState(false);
  const [currentItem, setCurrentItem] = useState<ClientTypeItem | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/admin/login");
    } else if (user) {
      if (process.env.NEXT_PUBLIC_ADMIN_EMAIL && user.email !== process.env.NEXT_PUBLIC_ADMIN_EMAIL) {
        toast.error("Unauthorized access. You are not the admin.");
        router.push("/");
      } else {
        fetchItems();
      }
    }
  }, [user, loading, router]);

  const fetchItems = async () => {
    try {
      const res = await fetch('/api/content');
      const data = await res.json();
      setItems(data.clientTypes || []);
    } catch (e) {
      toast.error('Failed to fetch client types');
    } finally {
      setIsFetching(false);
    }
  };

  const handleEdit = (item: ClientTypeItem) => {
    setCurrentItem({ ...item });
    setIsEditing(true);
  };

  const handleCreateNew = () => {
    setCurrentItem({
      title: '',
      description: '',
      iconName: 'Users',
      order: items.length
    });
    setIsEditing(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentItem || !user) return;
    setIsSaving(true);
    
    try {
      const token = await user.getIdToken();
      const method = currentItem.id ? 'PUT' : 'POST';
      
      const res = await fetch('/api/admin/collection/client_types', {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(currentItem)
      });
      
      if (!res.ok) throw new Error('Failed to save');
      
      toast.success('Saved successfully');
      setIsEditing(false);
      fetchItems();
    } catch (e) {
      toast.error('Failed to save');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this?')) return;
    if (!user) return;
    
    try {
      const token = await user.getIdToken();
      const res = await fetch(`/api/admin/collection/client_types?id=${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!res.ok) throw new Error('Failed to delete');
      toast.success('Deleted successfully');
      fetchItems();
    } catch (e) {
      toast.error('Failed to delete');
    }
  };

  if (loading || isFetching) return <div>Loading...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Manage 'Who We Work With'</h1>
        {!isEditing && (
          <button onClick={handleCreateNew} className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800">
            Add Client Type
          </button>
        )}
      </div>

      {isEditing && currentItem ? (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold mb-4">{currentItem.id ? 'Edit Client Type' : 'New Client Type'}</h2>
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input 
                required
                type="text" 
                className="w-full p-2 border rounded"
                value={currentItem.title}
                onChange={e => setCurrentItem({...currentItem, title: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea 
                required
                className="w-full p-2 border rounded"
                value={currentItem.description}
                onChange={e => setCurrentItem({...currentItem, description: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Lucide Icon Name (e.g. Rocket, Users, Building)</label>
              <input 
                required
                type="text" 
                className="w-full p-2 border rounded"
                value={currentItem.iconName}
                onChange={e => setCurrentItem({...currentItem, iconName: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Display Order</label>
              <input 
                type="number" 
                className="w-full p-2 border rounded"
                value={currentItem.order}
                onChange={e => setCurrentItem({...currentItem, order: Number(e.target.value)})}
              />
            </div>
            
            <div className="flex gap-4 pt-4 border-t">
              <button 
                type="button" 
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 border rounded text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={isSaving}
                className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800 disabled:opacity-50"
              >
                {isSaving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map(item => (
            <div key={item.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-gray-900">{item.title}</h3>
                <p className="text-sm text-gray-500">{item.description}</p>
                <span className="text-xs text-gray-400 mt-1 inline-block">Icon: {item.iconName} | Order: {item.order}</span>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleEdit(item)} className="px-3 py-1 bg-gray-100 rounded hover:bg-gray-200 text-sm">
                  Edit
                </button>
                <button onClick={() => handleDelete(item.id!)} className="px-3 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200 text-sm">
                  Delete
                </button>
              </div>
            </div>
          ))}
          {items.length === 0 && (
            <p className="text-gray-500">No client types found. Add one above.</p>
          )}
        </div>
      )}
    </div>
  );
}

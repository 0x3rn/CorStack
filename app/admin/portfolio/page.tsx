"use client";

import { useEffect, useState } from "react";
import { auth, storage } from "../../../lib/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { useRouter } from "next/navigation";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import toast from "react-hot-toast";

interface PortfolioItem {
  id?: string;
  title: string;
  category: string;
  description?: string;
  imageUrl: string;
  websiteUrl?: string;
  order: number;
}

export default function AdminPortfolioPage() {
  const [user, loading] = useAuthState(auth);
  const router = useRouter();
  const [items, setItems] = useState<PortfolioItem[]>([]);
  const [isFetching, setIsFetching] = useState(true);
  
  const [isEditing, setIsEditing] = useState(false);
  const [currentItem, setCurrentItem] = useState<PortfolioItem | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/admin/login");
    } else if (user) {
      if (process.env.NEXT_PUBLIC_ADMIN_EMAIL && user.email !== process.env.NEXT_PUBLIC_ADMIN_EMAIL) {
        toast.error("Unauthorized access. You are not the admin.");
        router.push("/");
      } else {
        fetchPortfolio();
      }
    }
  }, [user, loading, router]);

  const fetchPortfolio = async () => {
    try {
      const res = await fetch('/api/content');
      const data = await res.json();
      setItems(data.portfolio || []);
    } catch (e) {
      toast.error('Failed to fetch portfolio');
    } finally {
      setIsFetching(false);
    }
  };

  const handleEdit = (item: PortfolioItem) => {
    setCurrentItem({ ...item });
    setIsEditing(true);
  };

  const handleCreateNew = () => {
    setCurrentItem({
      title: '',
      category: '',
      description: '',
      imageUrl: '',
      websiteUrl: '',
      order: items.length
    });
    setIsEditing(true);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentItem) return;

    const storageRef = ref(storage, `portfolio/${Date.now()}_${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    setIsUploading(true);
    uploadTask.on('state_changed', 
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setUploadProgress(progress);
      }, 
      (error) => {
        toast.error("Image upload failed");
        setIsUploading(false);
      }, 
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        setCurrentItem({ ...currentItem, imageUrl: downloadURL });
        setIsUploading(false);
        setUploadProgress(0);
        toast.success("Image uploaded!");
      }
    );
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentItem || !user) return;
    if (!currentItem.imageUrl) return toast.error("Please provide an image link or upload one");
    
    setIsSaving(true);
    
    try {
      // Auto-format websiteUrl
      let finalItem = { ...currentItem };
      if (finalItem.websiteUrl && !finalItem.websiteUrl.startsWith('http://') && !finalItem.websiteUrl.startsWith('https://')) {
        finalItem.websiteUrl = 'https://' + finalItem.websiteUrl;
      }

      const token = await user.getIdToken();
      const method = finalItem.id ? 'PUT' : 'POST';
      
      const res = await fetch('/api/admin/portfolio', {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(finalItem)
      });
      
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || 'Failed to save');
      }
      
      toast.success('Saved successfully');
      setIsEditing(false);
      fetchPortfolio();
    } catch (e: any) {
      toast.error(`Failed to save: ${e.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    if (!user) return;
    
    try {
      const token = await user.getIdToken();
      const res = await fetch(`/api/admin/portfolio?id=${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!res.ok) throw new Error('Failed to delete');
      
      toast.success('Deleted successfully');
      fetchPortfolio();
    } catch (e) {
      toast.error('Failed to delete');
    }
  };

  if (loading || isFetching) return <div>Loading...</div>;
  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-brand-dark">Portfolio Items</h1>
        {!isEditing && (
          <button onClick={handleCreateNew} className="btn btn-primary px-4 py-2 text-sm">
            Add New Item
          </button>
        )}
      </div>

      {isEditing && currentItem ? (
        <form onSubmit={handleSave} className="bg-white rounded-xl shadow-soft p-6 border border-black/5 flex flex-col gap-5">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-xl font-bold">{currentItem.id ? 'Edit Item' : 'New Item'}</h2>
            <button type="button" onClick={() => setIsEditing(false)} className="text-gray-500 hover:text-black">Cancel</button>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1">Title</label>
              <input required type="text" className="w-full py-2 px-3 border rounded-lg" value={currentItem.title} onChange={e => setCurrentItem({...currentItem, title: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Category (e.g. E-Commerce)</label>
              <input required type="text" className="w-full py-2 px-3 border rounded-lg" value={currentItem.category} onChange={e => setCurrentItem({...currentItem, category: e.target.value})} />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-semibold mb-1">Description (Optional)</label>
            <textarea className="w-full py-2 px-3 border rounded-lg h-24 resize-none" value={currentItem.description || ''} onChange={e => setCurrentItem({...currentItem, description: e.target.value})}></textarea>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1">Order (Number)</label>
              <input required type="number" className="w-full py-2 px-3 border rounded-lg" value={currentItem.order} onChange={e => setCurrentItem({...currentItem, order: parseInt(e.target.value)})} />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1">Website URL (Optional)</label>
              <input type="text" placeholder="example.com" className="w-full py-2 px-3 border rounded-lg" value={currentItem.websiteUrl || ''} onChange={e => setCurrentItem({...currentItem, websiteUrl: e.target.value})} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-2">Portfolio Image</label>
            <div className="flex gap-4 items-start">
              {currentItem.imageUrl && (
                <img src={currentItem.imageUrl} alt="Preview" className="w-24 h-24 object-cover rounded-lg border border-black/10 shrink-0 mt-2" />
              )}
              <div className="flex-1 flex flex-col gap-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Option 1: Paste an Image Link</label>
                  <input 
                    type="text" 
                    placeholder="https://example.com/image.png" 
                    className="w-full py-2 px-3 border rounded-lg text-sm bg-gray-50" 
                    value={currentItem.imageUrl} 
                    onChange={e => setCurrentItem({...currentItem, imageUrl: e.target.value})} 
                  />
                </div>
                
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Option 2: Upload from Computer</label>
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand-dark file:text-white hover:file:bg-black"
                  />
                </div>
                {isUploading && <div className="text-xs text-accent-primary mt-1 font-semibold">Uploading: {Math.round(uploadProgress)}%</div>}
              </div>
            </div>
          </div>
          
          <button type="submit" disabled={isSaving || isUploading} className="btn btn-primary mt-4">
            {isSaving ? 'Saving...' : 'Save Item'}
          </button>
        </form>
      ) : (
        <div className="grid gap-4">
          {items.map(item => (
            <div key={item.id} className="bg-white rounded-xl shadow-soft p-6 border border-black/5 flex justify-between items-center gap-4">
              <div className="flex items-center gap-4">
                <img src={item.imageUrl} alt={item.title} className="w-16 h-16 object-cover rounded-lg border border-black/10 shrink-0" />
                <div>
                  <h3 className="font-bold text-lg">{item.title}</h3>
                  <p className="text-sm text-text-muted mt-1">{item.category}</p>
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={() => handleEdit(item)} className="text-sm font-semibold text-accent-primary hover:underline">Edit</button>
                <button onClick={() => item.id && handleDelete(item.id)} className="text-sm font-semibold text-red-500 hover:underline">Delete</button>
              </div>
            </div>
          ))}
          {items.length === 0 && <div className="text-center py-12 text-text-muted border-2 border-dashed rounded-xl">No portfolio items configured.</div>}
        </div>
      )}
    </div>
  );
}

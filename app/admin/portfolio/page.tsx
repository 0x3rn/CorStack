"use client";

import { useEffect, useState } from "react";
import { auth, storage } from "../../../lib/firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import { useRouter } from "next/navigation";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import toast from "react-hot-toast";

import { PortfolioItem, PortfolioImage } from "../../../lib/types";

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
  
  const [desktopLinkInput, setDesktopLinkInput] = useState("");
  const [mobileLinkInput, setMobileLinkInput] = useState("");

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
      
      const mappedPortfolio = (data.portfolio || []).map((item: any) => ({
        ...item,
        desktopImages: item.desktopImages || (item.desktopImageUrls || []).map((url: string) => ({ url, description: "" })),
        mobileImages: item.mobileImages || (item.mobileImageUrls || []).map((url: string) => ({ url, description: "" }))
      }));
      setItems(mappedPortfolio);
    } catch (e) {
      toast.error('Failed to fetch portfolio');
    } finally {
      setIsFetching(false);
    }
  };

  const handleEdit = (item: PortfolioItem) => {
    setCurrentItem({
      ...item,
      desktopImages: item.desktopImages || (item.desktopImageUrls || []).map((url: string) => ({ url, description: "" })),
      mobileImages: item.mobileImages || (item.mobileImageUrls || []).map((url: string) => ({ url, description: "" }))
    });
    setIsEditing(true);
  };

  const handleCreateNew = () => {
    setCurrentItem({
      title: '',
      category: '',
      description: '',
      desktopImages: [],
      mobileImages: [],
      websiteUrl: '',
      showOnHome: true,
      order: items.length
    });
    setIsEditing(true);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'desktop' | 'mobile') => {
    const file = e.target.files?.[0];
    if (!file || !currentItem) return;
    
    const currentImages = type === 'desktop' ? (currentItem.desktopImages || []) : (currentItem.mobileImages || []);
    if (currentImages.length >= 5) {
      toast.error("Maximum 5 images allowed");
      return;
    }

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
        const newImage: PortfolioImage = { url: downloadURL, description: "" };
        const updatedImages = [...currentImages, newImage];
        
        if (type === 'desktop') {
          setCurrentItem({ ...currentItem, desktopImages: updatedImages });
        } else {
          setCurrentItem({ ...currentItem, mobileImages: updatedImages });
        }
        
        setIsUploading(false);
        setUploadProgress(0);
        toast.success("Image uploaded!");
        
        if (e.target) e.target.value = '';
      }
    );
  };

  const handleAddLink = (type: 'desktop' | 'mobile') => {
    const linkInput = type === 'desktop' ? desktopLinkInput : mobileLinkInput;
    if (!linkInput.trim() || !currentItem) return;
    
    const currentImages = type === 'desktop' ? (currentItem.desktopImages || []) : (currentItem.mobileImages || []);
    if (currentImages.length >= 5) {
      toast.error("Maximum 5 images allowed");
      return;
    }
    
    const newImage: PortfolioImage = { url: linkInput.trim(), description: "" };
    const updatedImages = [...currentImages, newImage];
    
    if (type === 'desktop') {
      setCurrentItem({ ...currentItem, desktopImages: updatedImages });
      setDesktopLinkInput("");
    } else {
      setCurrentItem({ ...currentItem, mobileImages: updatedImages });
      setMobileLinkInput("");
    }
  };

  const updateImageDescription = (index: number, type: 'desktop' | 'mobile', description: string) => {
    if (!currentItem) return;
    const currentImages = type === 'desktop' ? [...(currentItem.desktopImages || [])] : [...(currentItem.mobileImages || [])];
    if (currentImages[index]) {
      currentImages[index].description = description;
      if (type === 'desktop') {
        setCurrentItem({ ...currentItem, desktopImages: currentImages });
      } else {
        setCurrentItem({ ...currentItem, mobileImages: currentImages });
      }
    }
  };

  const removeImage = (indexToRemove: number, type: 'desktop' | 'mobile') => {
    if (!currentItem) return;
    const currentImages = type === 'desktop' ? (currentItem.desktopImages || []) : (currentItem.mobileImages || []);
    const updatedImages = currentImages.filter((_, idx) => idx !== indexToRemove);
    
    if (type === 'desktop') {
      setCurrentItem({ ...currentItem, desktopImages: updatedImages });
    } else {
      setCurrentItem({ ...currentItem, mobileImages: updatedImages });
    }
  };

  const moveImage = (index: number, direction: 'left' | 'right', type: 'desktop' | 'mobile') => {
    if (!currentItem) return;
    const currentImages = type === 'desktop' ? (currentItem.desktopImages || []) : (currentItem.mobileImages || []);
    const newIndex = direction === 'left' ? index - 1 : index + 1;
    
    if (newIndex < 0 || newIndex >= currentImages.length) return;
    
    const updatedImages = [...currentImages];
    const temp = updatedImages[index];
    updatedImages[index] = updatedImages[newIndex];
    updatedImages[newIndex] = temp;
    
    if (type === 'desktop') {
      setCurrentItem({ ...currentItem, desktopImages: updatedImages });
    } else {
      setCurrentItem({ ...currentItem, mobileImages: updatedImages });
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentItem || !user) return;

    let finalItem = { ...currentItem };
    
    // Auto-consume dangling desktop link
    const desktopImages = finalItem.desktopImages || [];
    if (desktopLinkInput.trim() && desktopImages.length < 5) {
      finalItem.desktopImages = [...desktopImages, { url: desktopLinkInput.trim(), description: "" }];
      setDesktopLinkInput("");
    }
    
    // Auto-consume dangling mobile link
    const mobileImages = finalItem.mobileImages || [];
    if (mobileLinkInput.trim() && mobileImages.length < 5) {
      finalItem.mobileImages = [...mobileImages, { url: mobileLinkInput.trim(), description: "" }];
      setMobileLinkInput("");
    }

    const finalDesktopImages = finalItem.desktopImages || [];
    const finalMobileImages = finalItem.mobileImages || [];
    
    if (finalDesktopImages.length === 0 && finalMobileImages.length === 0) {
      return toast.error("Please provide at least one image (desktop or mobile)");
    }
    
    // Clean up empty legacy arrays to save space
    delete finalItem.desktopImageUrls;
    delete finalItem.mobileImageUrls;
    
    setIsSaving(true);
    
    try {
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

          <div className="flex items-center gap-2">
            <input 
              type="checkbox" 
              id="showOnHome" 
              checked={currentItem.showOnHome !== false} 
              onChange={e => setCurrentItem({...currentItem, showOnHome: e.target.checked})} 
              className="w-4 h-4 accent-black cursor-pointer" 
            />
            <label htmlFor="showOnHome" className="text-sm font-semibold cursor-pointer select-none">Show this item on the homepage snippet</label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4 border-t pt-6">
            {/* Desktop Images */}
            <div>
              <label className="block text-sm font-semibold mb-2">Desktop Images (Max 5)</label>
              <div className="flex flex-col gap-4">
                {(currentItem.desktopImages?.length || 0) > 0 ? (
                  <div className="grid grid-cols-2 gap-4">
                    {currentItem.desktopImages?.map((img, idx) => (
                      <div key={idx} className="relative group rounded-lg overflow-hidden border border-black/10 flex flex-col bg-gray-50">
                        <div className="relative aspect-video">
                          <img src={img.url} alt={`Desktop ${idx + 1}`} className="w-full h-full object-cover" />
                          <button 
                            type="button" 
                            onClick={() => removeImage(idx, 'desktop')}
                            className="absolute top-1 right-1 bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            &times;
                          </button>
                          <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {idx > 0 && (
                              <button type="button" onClick={() => moveImage(idx, 'left', 'desktop')} className="bg-black/70 text-white w-6 h-6 rounded flex items-center justify-center text-xs">←</button>
                            )}
                            {idx < ((currentItem.desktopImages?.length || 0) - 1) && (
                              <button type="button" onClick={() => moveImage(idx, 'right', 'desktop')} className="bg-black/70 text-white w-6 h-6 rounded flex items-center justify-center text-xs">→</button>
                            )}
                          </div>
                        </div>
                        <textarea 
                          className="w-full p-2 text-sm border-t border-black/10 resize-none outline-none focus:bg-white transition-colors" 
                          placeholder="Image description (optional)"
                          rows={2}
                          value={img.description || ''}
                          onChange={(e) => updateImageDescription(idx, 'desktop', e.target.value)}
                        />
                      </div>
                    ))}
                  </div>
                ) : null}

                {((currentItem.desktopImages?.length || 0) < 5) && (
                  <div className="flex-1 flex flex-col gap-4 p-4 border border-dashed rounded-xl bg-gray-50">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Option 1: Paste Link</label>
                      <div className="flex gap-2">
                        <input 
                          type="text" 
                          placeholder="https://.../image.png" 
                          className="flex-1 py-2 px-3 border rounded-lg text-sm bg-white" 
                          value={desktopLinkInput}
                          onChange={e => setDesktopLinkInput(e.target.value)}
                          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddLink('desktop'); } }}
                        />
                        <button type="button" onClick={() => handleAddLink('desktop')} className="px-3 py-2 bg-black text-white rounded-lg text-sm font-semibold hover:bg-gray-800">Add</button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Option 2: Upload</label>
                      <input 
                        type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'desktop')} disabled={isUploading}
                        className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand-dark file:text-white hover:file:bg-black disabled:opacity-50"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Mobile Images */}
            <div>
              <label className="block text-sm font-semibold mb-2">Mobile Images (Max 5)</label>
              <div className="flex flex-col gap-4">
                {(currentItem.mobileImages?.length || 0) > 0 ? (
                  <div className="grid grid-cols-2 gap-4">
                    {currentItem.mobileImages?.map((img, idx) => (
                      <div key={idx} className="relative group rounded-lg overflow-hidden border border-black/10 flex flex-col bg-gray-50">
                        <div className="relative aspect-[9/16]">
                          <img src={img.url} alt={`Mobile ${idx + 1}`} className="w-full h-full object-cover" />
                          <button 
                            type="button" 
                            onClick={() => removeImage(idx, 'mobile')}
                            className="absolute top-1 right-1 bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            &times;
                          </button>
                          <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {idx > 0 && (
                              <button type="button" onClick={() => moveImage(idx, 'left', 'mobile')} className="bg-black/70 text-white w-6 h-6 rounded flex items-center justify-center text-xs">←</button>
                            )}
                            {idx < ((currentItem.mobileImages?.length || 0) - 1) && (
                              <button type="button" onClick={() => moveImage(idx, 'right', 'mobile')} className="bg-black/70 text-white w-6 h-6 rounded flex items-center justify-center text-xs">→</button>
                            )}
                          </div>
                        </div>
                        <textarea 
                          className="w-full p-2 text-sm border-t border-black/10 resize-none outline-none focus:bg-white transition-colors" 
                          placeholder="Image description (optional)"
                          rows={3}
                          value={img.description || ''}
                          onChange={(e) => updateImageDescription(idx, 'mobile', e.target.value)}
                        />
                      </div>
                    ))}
                  </div>
                ) : null}

                {((currentItem.mobileImages?.length || 0) < 5) && (
                  <div className="flex-1 flex flex-col gap-4 p-4 border border-dashed rounded-xl bg-gray-50">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Option 1: Paste Link</label>
                      <div className="flex gap-2">
                        <input 
                          type="text" 
                          placeholder="https://.../image.png" 
                          className="flex-1 py-2 px-3 border rounded-lg text-sm bg-white" 
                          value={mobileLinkInput}
                          onChange={e => setMobileLinkInput(e.target.value)}
                          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddLink('mobile'); } }}
                        />
                        <button type="button" onClick={() => handleAddLink('mobile')} className="px-3 py-2 bg-black text-white rounded-lg text-sm font-semibold hover:bg-gray-800">Add</button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Option 2: Upload</label>
                      <input 
                        type="file" accept="image/*" onChange={(e) => handleImageUpload(e, 'mobile')} disabled={isUploading}
                        className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand-dark file:text-white hover:file:bg-black disabled:opacity-50"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {isUploading && <div className="text-xs text-accent-primary mt-1 font-semibold">Uploading: {Math.round(uploadProgress)}%</div>}
          
          <button type="submit" disabled={isSaving || isUploading} className="btn btn-primary mt-4">
            {isSaving ? 'Saving...' : 'Save Item'}
          </button>
        </form>
      ) : (
        <div className="grid gap-4">
          {items.map(item => (
            <div key={item.id} className="bg-white rounded-xl shadow-soft p-6 border border-black/5 flex justify-between items-center gap-4">
              <div className="flex items-center gap-4">
                <img src={item.desktopImages?.[0]?.url || item.mobileImages?.[0]?.url || item.imageUrl || ''} alt={item.title} className="w-16 h-16 object-cover rounded-lg border border-black/10 shrink-0" />
                <div>
                  <h3 className="font-bold text-lg">{item.title}</h3>
                  <p className="text-sm text-text-muted mt-1">
                    {item.category} 
                    {item.showOnHome !== false && <span className="ml-2 inline-block px-2 py-0.5 bg-green-100 text-green-700 text-xs font-bold rounded-full">Homepage</span>}
                  </p>
                  <p className="text-xs text-text-muted mt-1">
                    {item.desktopImages?.length || 0} Desktop, {item.mobileImages?.length || 0} Mobile
                  </p>
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

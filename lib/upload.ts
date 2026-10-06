'use client';
import type { User } from 'firebase/auth';

export async function uploadPortfolioImage(file: File, user: User, onProgress: (percent: number) => void): Promise<string> {
  const token = await user.getIdToken();
  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.open('POST', '/api/admin/uploads');
    request.setRequestHeader('Authorization', `Bearer ${token}`);
    request.setRequestHeader('Content-Type', file.type);
    request.timeout = 120_000;
    request.upload.onprogress = event => { if (event.lengthComputable) onProgress(event.loaded / event.total * 100); };
    request.onerror = () => reject(new Error('Image upload failed. Check your connection and try again.'));
    request.ontimeout = () => reject(new Error('Image upload timed out. Please try again.'));
    request.onload = () => {
      try {
        const result = JSON.parse(request.responseText) as { url?: string; error?: string };
        if (request.status >= 200 && request.status < 300 && result.url) resolve(result.url);
        else reject(new Error(result.error || 'Image upload failed. Please try again.'));
      } catch { reject(new Error('Image upload failed. Please try again.')); }
    };
    request.send(file);
  });
}

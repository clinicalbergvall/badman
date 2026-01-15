export function formatPhone(phone: string): string {
  
  if (phone.length === 13 && phone.startsWith('+254')) {
    return `${phone.slice(0, 4)} ${phone.slice(4, 7)} ${phone.slice(7, 10)} ${phone.slice(10)}`
  }
  return phone
}


export const formatPhoneNumber = formatPhone

export function formatCurrency(amount: number): string {
  return `KSh ${amount.toLocaleString()}`
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-KE', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(date)
}

export function formatTime(date: Date): string {
  return new Intl.DateTimeFormat('en-KE', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  }).format(date)
}

export function getBase64FileSize(base64String: string): number {
  // Remove the data:image/*;base64, prefix
  const base64WithoutPrefix = base64String.split(',')[1];
  if (!base64WithoutPrefix) return 0;
  
  // Calculate approximate size (base64 increases size by ~33%)
  const size = Math.round((base64WithoutPrefix.length * 3) / 4);
  return size;
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' bytes';
  else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  else return (bytes / 1048576).toFixed(1) + ' MB';
}

export function cn(...classes: (string | boolean | undefined)[]): string {
  return classes.filter(Boolean).join(' ')
}

export async function compressImage(base64: string, quality: number = 0.7, maxSize: number = 1024): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = base64;
    
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;
      
      // Calculate new dimensions if image is too large
      if (width > maxSize || height > maxSize) {
        if (width > height) {
          height = (height * maxSize) / width;
          width = maxSize;
        } else {
          width = (width * maxSize) / height;
          height = maxSize;
        }
      }
      
      canvas.width = width;
      canvas.height = height;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }
      
      ctx.drawImage(img, 0, 0, width, height);
      
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const reader = new FileReader();
            reader.onload = () => {
              resolve(reader.result as string);
            };
            reader.onerror = () => reject(new Error('Could not read compressed image'));
            reader.readAsDataURL(blob);
          } else {
            reject(new Error('Could not compress image'));
          }
        },
        'image/jpeg',
        quality
      );
    };
    
    img.onerror = (error) => {
      reject(error);
    };
  });
}

export async function compressImageArray(imageArray: string[], quality: number = 0.7, maxSize: number = 1024): Promise<string[]> {
  const compressedPromises = imageArray.map(img => compressImage(img, quality, maxSize));
  return Promise.all(compressedPromises);
}
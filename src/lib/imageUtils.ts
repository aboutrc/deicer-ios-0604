/**
 * Compresses an image file using canvas
 * @param file The image file to compress
 * @param maxWidth Maximum width of the compressed image (default: 800px)
 * @param quality JPEG quality from 0 to 1 (default: 0.6)
 * @returns Promise resolving to a Blob of the compressed image
 */
export const compressImage = async (
  file: File,
  maxWidth = 800,
  quality = 0.6 
): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    
    reader.onload = (event) => {
      const img = new Image();
      if (!event.target?.result) {
        reject(new Error('Failed to read file'));
        return;
      }
      
      img.src = event.target?.result as string;
      
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        
        // Calculate new dimensions
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }
        
        // Draw and compress the image
        ctx.drawImage(img, 0, 0, width, height);
        
        try {
          // Convert to blob using a promise-based approach
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                // Fallback to dataURL if toBlob fails
                try {
                  const dataUrl = canvas.toDataURL('image/jpeg', quality);
                  const byteString = atob(dataUrl.split(',')[1]);
                  const ab = new ArrayBuffer(byteString.length);
                  const ia = new Uint8Array(ab);
                
                  for (let i = 0; i < byteString.length; i++) {
                    ia[i] = byteString.charCodeAt(i);
                  }
                
                  const fallbackBlob = new Blob([ab], { type: 'image/jpeg' });
                  resolve(fallbackBlob);
                } catch (dataUrlError) {
                  console.error('DataURL fallback error:', dataUrlError);
                  reject(new Error('Failed to create image blob'));
                }
                return;
              }
              console.log('Image compressed successfully:', blob.size, 'bytes');
              resolve(blob);
            },
            'image/jpeg', // Always convert to JPEG for consistency
            quality
          );
        } catch (canvasError) {
          console.error('Canvas error:', canvasError);
          reject(new Error('Canvas operation failed'));
        }
      };
      
      img.onerror = () => {
        console.error('Image load error');
        reject(new Error('Failed to load image'));
      };
    };
    
    reader.onerror = () => {
      console.error('FileReader error');
      reject(new Error('Failed to read file'));
    };
  });
};
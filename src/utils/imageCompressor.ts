/**
 * KIRI PROJECT - Client-Side Image Compression Engine
 * Optimizes all uploaded media (portfolios, receipts, avatars, covers) before sending to DB/Storage.
 * Converts to WebP/JPEG with dimension clamping and quality scaling.
 */

export interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  maxSizeMB?: number;
  outputFormat?: 'image/webp' | 'image/jpeg' | 'image/png';
}

export async function compressImage(
  file: File | Blob,
  options: CompressionOptions = {}
): Promise<Blob> {
  const {
    maxWidth = 1600,
    maxHeight = 1600,
    quality = 0.82,
    outputFormat = 'image/webp'
  } = options;

  return new Promise((resolve, reject) => {
    // If not an image, pass through
    if (!file.type.startsWith('image/')) {
      resolve(file);
      return;
    }

    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e) => {
      img.src = e.target?.result as string;
    };

    reader.onerror = (err) => reject(err);

    img.onload = () => {
      let width = img.width;
      let height = img.height;

      // Calculate proportional aspect ratio
      if (width > maxWidth || height > maxHeight) {
        if (width / height > maxWidth / maxHeight) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        } else {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(file);
        return;
      }

      // Smooth resizing algorithm
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            console.log(
              `[KIRI Compressor] Original: ${(file.size / 1024).toFixed(1)} KB -> Compressed: ${(blob.size / 1024).toFixed(1)} KB (${Math.round((1 - blob.size / file.size) * 100)}% saved)`
            );
            resolve(blob);
          } else {
            resolve(file);
          }
        },
        outputFormat,
        quality
      );
    };

    img.onerror = (err) => reject(err);

    reader.readAsDataURL(file);
  });
}

/**
 * Converts File/Blob to optimized Base64 data URL
 */
export async function compressImageToBase64(
  file: File | Blob,
  options: CompressionOptions = {}
): Promise<string> {
  const compressedBlob = await compressImage(file, options);
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(compressedBlob);
  });
}

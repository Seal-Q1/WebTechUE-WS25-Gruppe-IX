export interface ImageDto {
  id: number;
  image: string | null;
}

export function serializeImageToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(',')[1] || result; //format is "data:mime;base64,data"
      resolve(base64); //TODO scale it down if to large? currently has no limit
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
}

export function deserializeBase64ToDataUrl(base64: string | null, mimeType: string = 'image/png'): string {
  if (!base64) {
    return '';
  }
  if (base64.startsWith('data:')) {
    return base64;
  }
  return `data:${mimeType};base64,${base64}`;
}

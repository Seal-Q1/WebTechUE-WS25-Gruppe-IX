export interface ImageDto {
  id: number;
  image: string | null;
}

export function serializeImageToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {

    //Validation in the backend would entail having to figure out file type from base64 data alone; not necessary for now,
    //as the frontend will force-typecast it to an image mime when displaying it anyway.
    //This is to help prevent uploads of other files which will become corrupt images effectively...; not a security feature!
    const allowedMimeTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
    if (!allowedMimeTypes.includes(file.type)) {
      alert('Supported files: PNG, JPG, WEBP');
      reject(new Error('Unsupported file type. Supported files: PNG, JPG, WEBP'));
      return;
    }

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

//This currently assumes the base64 to be a .png image. I have tested it with jpg and webp, works fine (probably browser being lenient?)
//FIXME: consider properly storing mimes too (alongside improving security regarding this)
//only ever place this into img src=, forced-typecasted to be an image mime, otherwise potential security risk as data urls can be scripts etc.
export function deserializeBase64ToDataUrl(base64: string | null, mimeType: string = 'image/png'): string {
  if (!base64) {
    return '';
  }
  if (base64.startsWith('data:')) {
    return base64;
  }
  return `data:${mimeType};base64,${base64}`;
}

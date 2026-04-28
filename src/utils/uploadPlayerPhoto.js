import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { storage } from '../firebase';

const UPLOAD_TIMEOUT_MS = 30000;

const withTimeout = (promise) =>
  Promise.race([
    promise,
    new Promise((_, reject) => {
      window.setTimeout(
        () => reject(new Error('Photo upload timed out. Check Firebase Storage rules and bucket setup.')),
        UPLOAD_TIMEOUT_MS,
      );
    }),
  ]);

export async function uploadPlayerPhoto(file) {
  if (!file) {
    return '';
  }

  if (!file.type.startsWith('image/')) {
    throw new Error('Please choose an image file.');
  }

  if (!storage) {
    throw new Error('Firebase Storage is not configured.');
  }

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const photoRef = ref(storage, `players/${Date.now()}_${safeName}`);
  const snapshot = await withTimeout(
    uploadBytes(photoRef, file, {
      contentType: file.type,
    }),
  );

  return getDownloadURL(snapshot.ref);
}

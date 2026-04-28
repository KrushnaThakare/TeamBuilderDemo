import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { storage } from '../firebase';

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
  const snapshot = await uploadBytes(photoRef, file);

  return getDownloadURL(snapshot.ref);
}

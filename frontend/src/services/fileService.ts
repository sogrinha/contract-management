import { storage } from './firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export const uploadFile = async (file: File) => {
  const fileRef = ref(storage, `contracts/${file.name}`);
  await uploadBytes(fileRef, file);
  return await getDownloadURL(fileRef);
};

import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from './firebase';

/**
 * Uploads a file to Firebase Storage and returns the download URL.
 * @param {File} file - The file to upload.
 * @param {string} folder - The folder to upload to (e.g., 'feature-requests').
 * @returns {Promise<string>} - The public download URL.
 */
export async function uploadFile(file, folder = 'uploads') {
  if (!file) return null;

  try {
    // Create a unique filename
    const filename = `${Date.now()}-${file.name.replace(/\s+/g, '_')}`;
    const storageRef = ref(storage, `${folder}/${filename}`);

    // Upload the file
    const snapshot = await uploadBytes(storageRef, file);
    
    // Get and return the download URL
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  } catch (error) {
    console.error("Error uploading file to Firebase Storage:", error);
    throw error;
  }
}

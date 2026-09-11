import { supabase } from "../supabaseClient";

export const IMAGE_BUCKET = import.meta.env.VITE_SUPABASE_STORAGE_BUCKET || "pydc-images";

const MAX_IMAGE_DIMENSION = 1600;
const TARGET_IMAGE_BYTES = 400 * 1024;

async function ensureStorageSession() {
  const { data: sessionData } = await supabase.auth.getSession();
  if (sessionData?.session) return sessionData.session;

  const { data, error } = await supabase.auth.signInAnonymously();
  if (error) throw new Error(`Storage authentication failed: ${error.message}`);
  return data.session;
}

export function getStoragePathFromUrl(imageUrl) {
  if (!imageUrl || typeof imageUrl !== "string") return null;

  const marker = `/storage/v1/object/public/${IMAGE_BUCKET}/`;
  const markerIndex = imageUrl.indexOf(marker);
  if (markerIndex === -1) return null;

  const path = imageUrl.slice(markerIndex + marker.length).split(/[?#]/, 1)[0];
  return path ? decodeURIComponent(path) : null;
}

export async function deleteImage(imageUrl) {
  const path = getStoragePathFromUrl(imageUrl);
  if (!path) return;

  try {
    await ensureStorageSession();
    const { error } = await supabase.storage.from(IMAGE_BUCKET).remove([path]);
    if (error) console.warn("Could not delete old image:", error.message);
  } catch (error) {
    console.warn("Could not delete old image:", error.message);
  }
}

function compressImage(file) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    const objectUrl = URL.createObjectURL(file);

    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      const scale = Math.min(1, MAX_IMAGE_DIMENSION / Math.max(image.width, image.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(image.width * scale));
      canvas.height = Math.max(1, Math.round(image.height * scale));

      const context = canvas.getContext("2d");
      if (!context) {
        reject(new Error("Could not prepare the image for upload."));
        return;
      }

      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(image, 0, 0, canvas.width, canvas.height);

      const createBlob = (quality) => canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error("Could not compress the image."));
          return;
        }
        if (blob.size <= TARGET_IMAGE_BYTES || quality <= 0.5) {
          resolve(blob);
          return;
        }
        createBlob(quality - 0.1);
      }, "image/jpeg", quality);

      createBlob(0.82);
    };
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Could not read the selected image."));
    };
    image.src = objectUrl;
  });
}

export async function uploadImage(file, folder) {
  if (!file) throw new Error("Please select an image.");
  if (!file.type.startsWith("image/")) throw new Error("Please select a valid image file.");

  await ensureStorageSession();
  const compressedImage = await compressImage(file);
  const filePath = `${folder}/${crypto.randomUUID()}.jpg`;
  const { error } = await supabase.storage.from(IMAGE_BUCKET).upload(filePath, compressedImage, {
    cacheControl: "3600",
    contentType: "image/jpeg",
    upsert: false,
  });

  if (error) throw error;

  const { data } = supabase.storage.from(IMAGE_BUCKET).getPublicUrl(filePath);
  if (!data?.publicUrl) throw new Error("Could not create a public image URL.");
  return data.publicUrl;
}

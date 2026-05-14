import heic2any from 'heic2any';

const CLOUD  = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
const FOLDER = import.meta.env.VITE_CLOUDINARY_FOLDER;

function isHeic(file) {
  return (
    file.type === 'image/heic' ||
    file.type === 'image/heif' ||
    file.name.toLowerCase().endsWith('.heic') ||
    file.name.toLowerCase().endsWith('.heif')
  );
}

async function heicParaJpeg(file) {
  // Tenta heic2any (puro JS, funciona em qualquer plataforma)
  try {
    const blob = await heic2any({ blob: file, toType: 'image/jpeg', quality: 0.92 });
    const result = Array.isArray(blob) ? blob[0] : blob;
    return new File([result], file.name.replace(/\.hei[cf]$/i, '.jpg'), { type: 'image/jpeg' });
  } catch {}

  // Fallback: Canvas API — funciona no macOS/iOS que têm codec HEIC nativo
  const bitmap = await createImageBitmap(file);
  const canvas = document.createElement('canvas');
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;
  canvas.getContext('2d').drawImage(bitmap, 0, 0);
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      blob => blob
        ? resolve(new File([blob], file.name.replace(/\.hei[cf]$/i, '.jpg'), { type: 'image/jpeg' }))
        : reject(new Error('Não foi possível converter o arquivo HEIC.')),
      'image/jpeg',
      0.92
    );
  });
}

export async function uploadImagem(rawFile) {
  let file = rawFile;
  if (isHeic(rawFile)) {
    file = await heicParaJpeg(rawFile);
  }
  const fd = new FormData();
  fd.append('file', file);
  fd.append('upload_preset', PRESET);
  fd.append('folder', FOLDER);
  const r = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD}/image/upload`, {
    method: 'POST',
    body: fd,
  });
  if (!r.ok) {
    const err = await r.json().catch(() => ({}));
    throw new Error(err.error?.message || 'Falha no upload');
  }
  const data = await r.json();
  return { publicId: data.public_id, url: data.secure_url, bytes: data.bytes ?? 0 };
}

const TAMANHOS = {
  thumb: 'f_auto,q_auto:eco,w_400,h_400,c_fill,g_auto',    // quadrado, smart crop
  card:  'f_auto,q_auto:good,w_600,h_600,c_fill,g_auto',   // quadrado, smart crop
  hero:  'f_auto,q_auto:good,w_1920',                       // sem crop, largura total
  full:  'f_auto,q_auto:best,w_1600',                       // sem crop, alta qualidade
};

export function urlOtimizada(publicId, tamanho = 'card') {
  if (!publicId) return '';
  return `https://res.cloudinary.com/${CLOUD}/image/upload/${TAMANHOS[tamanho]}/${publicId}`;
}

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

let _libheif = null;
async function getLibheif() {
  if (!_libheif) {
    const mod = await import('libheif-js/wasm-bundle');
    const init = mod.default ?? mod;
    _libheif = (init && typeof init.then === 'function') ? await init : init;
  }
  return _libheif;
}

async function libheifParaJpeg(file) {
  const libheif = await getLibheif();
  const buffer = await file.arrayBuffer();
  const decoder = new libheif.HeifDecoder();
  const images = decoder.decode(new Uint8Array(buffer));
  if (!images || images.length === 0) throw new Error('Arquivo HEIC sem imagens');

  const image = images[0];
  const width = image.get_width();
  const height = image.get_height();

  // Decodifica pixels via canvas temporário
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = width;
  tempCanvas.height = height;
  const tempCtx = tempCanvas.getContext('2d');
  const imageData = tempCtx.createImageData(width, height);

  await new Promise((resolve, reject) => {
    image.display(imageData, result => {
      if (!result) reject(new Error('libheif: falha ao renderizar'));
      else resolve(result);
    });
  });

  tempCtx.putImageData(imageData, 0, 0);

  // Composta sobre fundo branco — pixels transparentes (padding HEVC) viram branco, não preto
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(tempCanvas, 0, 0);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      blob => blob
        ? resolve(new File([blob], file.name.replace(/\.hei[cf]$/i, '.jpg'), { type: 'image/jpeg' }))
        : reject(new Error('Canvas blob falhou')),
      'image/jpeg',
      0.92
    );
  });
}

async function heicParaJpeg(file) {
  // 1. heic2any — puro JS, rápido
  try {
    const blob = await heic2any({ blob: file, toType: 'image/jpeg', quality: 0.92 });
    const result = Array.isArray(blob) ? blob[0] : blob;
    return new File([result], file.name.replace(/\.hei[cf]$/i, '.jpg'), { type: 'image/jpeg' });
  } catch {}

  // 2. libheif-js — WebAssembly completo, suporta todos os variantes HEIC
  return libheifParaJpeg(file);
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
  return { publicId: data.public_id, url: data.secure_url, bytes: data.bytes ?? 0, width: data.width ?? 0, height: data.height ?? 0 };
}

const TAMANHOS = {
  thumb: 'f_auto,q_auto:eco,w_400,h_400,c_fill,g_auto',
  card:  'f_auto,q_auto:good,w_600,h_600,c_fill,g_auto',
  hero:  'f_auto,q_auto:good,w_1920',
  full:  'f_auto,q_auto:best,w_1600',
};

export function urlOtimizada(publicId, tamanho = 'card', crop = null) {
  if (!publicId) return '';
  const base = TAMANHOS[tamanho];
  const aplicaCrop = crop && (tamanho === 'thumb' || tamanho === 'card');
  const cropStr = aplicaCrop
    ? `c_crop,x_${Math.round(crop.x)},y_${Math.round(crop.y)},w_${Math.round(crop.w)},h_${Math.round(crop.h)}/`
    : '';
  return `https://res.cloudinary.com/${CLOUD}/image/upload/${cropStr}${base}/${publicId}`;
}

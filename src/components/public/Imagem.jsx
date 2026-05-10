import { urlOtimizada } from '@/lib/cloudinary';

export default function Imagem({ publicId, alt = '', size = 'card', priority = false, style }) {
  if (!publicId) return null;
  return (
    <img
      src={urlOtimizada(publicId, size)}
      alt={alt}
      loading={priority ? 'eager' : 'lazy'}
      decoding="async"
      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', ...style }}
    />
  );
}

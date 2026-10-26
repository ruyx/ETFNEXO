/**
 * Las creatividades se sirven desde una ruta propia y neutra
 * (/api/nx/m/<id>) en vez de la URL de Storage: los bloqueadores cortan las
 * URLs con "banner", "728x90", "ads"... aunque la imagen sea de primera parte.
 */

// Hash corto (FNV-1a) de la URL original: si el admin cambia la imagen, cambia
// la URL servida y la caché del CDN no sirve la anterior.
function shortHash(value: string): string {
  let hash = 0x811c9dc5;
  for (let i = 0; i < value.length; i++) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(36);
}

export function toServedImageUrl(adId: string, imageUrl: unknown): string | null {
  if (typeof imageUrl !== 'string' || imageUrl === '') return null;
  return `/api/nx/m/${adId}?v=${shortHash(imageUrl)}`;
}

/**
 * Subida de imágenes del panel de administración a /api/upload/image.
 *
 * Vercel corta cualquier petición de más de 4,5 MB antes de llegar a la ruta
 * y responde con texto plano (FUNCTION_PAYLOAD_TOO_LARGE). Por eso las fotos
 * grandes se reducen en el navegador antes de enviarlas, y los errores se leen
 * aunque la respuesta no sea JSON.
 */

/** Límite que acepta la ruta; por debajo de los 4,5 MB de Vercel. */
export const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;

/** Lado mayor de la imagen tras reducirla: suficiente para un hero a 2x. */
const MAX_DIMENSION = 2400;

/** Por debajo de este peso y tamaño la imagen se sube tal cual. */
const COMPRESS_THRESHOLD_BYTES = 1.5 * 1024 * 1024;

const OUTPUT_TYPE = 'image/webp'; // conserva transparencia (logos PNG)
const OUTPUT_QUALITY = 0.85;

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

export interface UploadedImage {
  url: string;
  path: string;
}

function formatMb(bytes: number): string {
  const mb = (bytes / (1024 * 1024)).toFixed(1).replace(/\.0$/, '').replace('.', ',');
  return `${mb} MB`;
}

function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, OUTPUT_TYPE, OUTPUT_QUALITY));
}

/**
 * Reduce la imagen si es pesada o muy grande. Los GIF no se tocan para no
 * perder la animación. Si el navegador no puede procesarla, devuelve el
 * archivo original y la validación de tamaño decide.
 */
async function shrinkImage(file: File): Promise<File> {
  if (file.type === 'image/gif' || typeof createImageBitmap !== 'function') {
    return file;
  }

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    return file;
  }

  try {
    const longest = Math.max(bitmap.width, bitmap.height);
    if (file.size <= COMPRESS_THRESHOLD_BYTES && longest <= MAX_DIMENSION) {
      return file;
    }

    const scale = Math.min(1, MAX_DIMENSION / longest);
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    const context = canvas.getContext('2d');
    if (!context) return file;
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);

    const blob = await canvasToBlob(canvas);
    if (!blob || blob.size >= file.size) return file;

    const name = file.name.replace(/\.[^/.]+$/, '') + '.webp';
    return new File([blob], name, { type: OUTPUT_TYPE });
  } finally {
    bitmap.close();
  }
}

/** Lee el mensaje de error de la respuesta, sea JSON o texto plano. */
async function readUploadError(response: Response): Promise<string> {
  if (response.status === 413) {
    return `La imagen es demasiado pesada. El máximo es ${formatMb(MAX_UPLOAD_BYTES)}.`;
  }
  if (response.status === 401 || response.status === 403) {
    return 'Tu sesión ha caducado o no tienes permiso para subir imágenes. Vuelve a iniciar sesión.';
  }
  try {
    const body = await response.json();
    if (body?.error) return String(body.error);
  } catch {
    // Respuesta no JSON (error de la plataforma): mensaje genérico
  }
  return `No se pudo subir la imagen (error ${response.status}). Inténtalo de nuevo.`;
}

/**
 * Valida, reduce si hace falta y sube la imagen.
 * Lanza un Error con un mensaje listo para mostrar al usuario.
 */
export async function uploadImage(original: File): Promise<UploadedImage> {
  if (!ACCEPTED_TYPES.includes(original.type)) {
    throw new Error('Formato no admitido. Usa JPG, PNG, WebP o GIF.');
  }

  const file = await shrinkImage(original);
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new Error(
      `La imagen pesa ${formatMb(file.size)} y el máximo es ${formatMb(MAX_UPLOAD_BYTES)}. Redúcela e inténtalo de nuevo.`
    );
  }

  const formData = new FormData();
  formData.append('file', file);

  let response: Response;
  try {
    response = await fetch('/api/upload/image', { method: 'POST', body: formData });
  } catch {
    throw new Error('No hay conexión con el servidor. Revisa tu conexión e inténtalo de nuevo.');
  }

  if (!response.ok) {
    throw new Error(await readUploadError(response));
  }

  return response.json();
}

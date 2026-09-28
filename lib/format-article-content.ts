/**
 * Convierte texto plano con saltos de línea a HTML con párrafos
 * y sanitiza el HTML para prevenir XSS attacks
 *
 * El scraper devuelve contenido con:
 * - Párrafos separados por \n\n
 * - Líneas separadas por \n
 *
 * Esta función convierte eso a HTML semántico con <p> tags
 * y sanitiza el resultado removiendo scripts y eventos inline
 */
export function formatArticleContent(content: string | null | undefined): string {
  if (!content) return '';

  // Si ya contiene tags HTML (detectar <p>, <div>, etc.), sanitizar y retornar
  if (/<\/?(p|div|article|section|h[1-6]|ul|ol|li|blockquote)>/i.test(content)) {
    return sanitizeHTML(content);
  }

  // Texto plano: convertir a HTML
  const htmlContent = content
    // Normalizar saltos de línea (Windows -> Unix)
    .replace(/\r\n/g, '\n')
    // Dividir por párrafos (doble salto de línea)
    .split('\n\n')
    // Filtrar párrafos vacíos
    .filter(paragraph => paragraph.trim().length > 0)
    // Convertir cada párrafo a <p>
    .map(paragraph => {
      // Reemplazar saltos de línea simples dentro del párrafo por <br>
      const formatted = paragraph
        .trim()
        .split('\n')
        .filter(line => line.trim().length > 0)
        .join('<br>');

      return `<p>${formatted}</p>`;
    })
    .join('\n');

  // Sanitizar el HTML generado para prevenir XSS
  return sanitizeHTML(htmlContent);
}

/**
 * Sanitiza HTML removiendo scripts, eventos inline y tags peligrosos
 * Versión ligera que funciona en SSR sin dependencias pesadas
 */
function sanitizeHTML(html: string): string {
  return html
    // Remover scripts
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    // Remover eventos inline (onclick, onerror, etc)
    .replace(/\son\w+\s*=\s*["'][^"']*["']/gi, '')
    .replace(/\son\w+\s*=\s*[^\s>]*/gi, '')
    // Remover javascript: en href/src
    .replace(/javascript:/gi, '')
    // Remover data: URIs (excepto imágenes)
    .replace(/(<(?!img)[^>]+\s+(?:href|src)\s*=\s*["'])data:[^"']*["']/gi, '$1#')
    // Remover iframes no autorizados
    .replace(/<iframe(?![^>]*youtube\.com)[^>]*>.*?<\/iframe>/gi, '')
    // Remover object/embed tags
    .replace(/<(object|embed)[^>]*>.*?<\/\1>/gi, '');
}

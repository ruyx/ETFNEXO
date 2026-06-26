/**
 * Convierte texto plano con saltos de línea a HTML con párrafos
 *
 * El scraper devuelve contenido con:
 * - Párrafos separados por \n\n
 * - Líneas separadas por \n
 *
 * Esta función convierte eso a HTML semántico con <p> tags
 */
export function formatArticleContent(content: string | null | undefined): string {
  if (!content) return '';

  // Si ya contiene tags HTML (detectar <p>, <div>, etc.), retornar tal cual
  if (/<\/?(p|div|article|section|h[1-6]|ul|ol|li|blockquote)>/i.test(content)) {
    return content;
  }

  // Texto plano: convertir a HTML
  return content
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
}

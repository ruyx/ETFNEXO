/**
 * Utilidades compartidas por /api/nx/view (impresiones) y /api/nx/go (clics).
 */

import { isIP } from 'node:net';
import type { NextRequest } from 'next/server';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Crawlers, headless y herramientas de medición: no cuentan como tráfico
// facturable (Lighthouse y PageSpeed inflaban impresiones en cada auditoría).
const BOT_UA_RE = /\bbot\b|bot\/|crawl|spider|slurp|headless|lighthouse|pagespeed|curl\/|wget\/|python-requests|axios\/|node-fetch/i;

export function isValidAdId(value: unknown): value is string {
  return typeof value === 'string' && UUID_RE.test(value);
}

export function isBotRequest(request: NextRequest): boolean {
  const ua = request.headers.get('user-agent') || '';
  return ua === '' || BOT_UA_RE.test(ua);
}

// IP del visitante. En Vercel x-real-ip / x-vercel-forwarded-for los fija la
// plataforma (el cliente no puede falsearlos); x-forwarded-for queda como
// último recurso. Un valor no válido rompería el INSERT en la columna INET.
function getClientIp(request: NextRequest): string | null {
  const candidates = [
    request.headers.get('x-vercel-forwarded-for'),
    request.headers.get('x-real-ip'),
    request.headers.get('x-forwarded-for'),
  ];
  for (const header of candidates) {
    const ip = header?.split(',')[0].trim();
    if (ip && isIP(ip)) return ip;
  }
  return null;
}

export function getRequestMeta(request: NextRequest) {
  return {
    user_agent: (request.headers.get('user-agent') || 'Unknown').slice(0, 500),
    referrer: (request.headers.get('referer') || '').slice(0, 1000),
    ip_address: getClientIp(request),
  };
}

// page_url llega del cliente: solo guardamos rutas internas y acotadas.
export function sanitizePageUrl(value: unknown, fallback: string): string {
  if (typeof value === 'string' && value.startsWith('/') && !value.startsWith('//')) return value.slice(0, 500);
  return fallback;
}

export async function readJson(request: NextRequest): Promise<Record<string, unknown> | null> {
  try {
    const body = await request.json();
    return body && typeof body === 'object' ? body : null;
  } catch {
    return null;
  }
}

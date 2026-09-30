/**
 * WebMCP Provider Component
 *
 * Inicializa WebMCP al montar la aplicación
 * Muestra badge de status en desarrollo
 */

'use client';

import { useEffect, useState } from 'react';
import { initializeWebMCP } from '@/lib/webmcp/registry';

export function WebMCPProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<'initializing' | 'ready' | 'unsupported'>('initializing');

  useEffect(() => {
    // Inicializar WebMCP
    initializeWebMCP().then((supported) => {
      setStatus(supported ? 'ready' : 'unsupported');
    });
  }, []);

  return (
    <>
      {children}

      {/* Badge de status (solo en desarrollo) */}
      {process.env.NODE_ENV === 'development' && (
        <WebMCPStatusBadge status={status} />
      )}
    </>
  );
}

function WebMCPStatusBadge({ status }: { status: 'initializing' | 'ready' | 'unsupported' }) {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  const statusConfig = {
    initializing: {
      bg: 'bg-yellow-500',
      text: '⏳ WebMCP Initializing...',
    },
    ready: {
      bg: 'bg-green-500',
      text: '✓ WebMCP Ready',
    },
    unsupported: {
      bg: 'bg-gray-500',
      text: '○ WebMCP Not Supported',
    },
  };

  const config = statusConfig[status];

  return (
    <div
      className="fixed bottom-4 right-4 z-[9999] flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-white shadow-lg"
      style={{ backgroundColor: config.bg.replace('bg-', '') }}
    >
      <span>{config.text}</span>
      <button
        onClick={() => setIsVisible(false)}
        className="ml-2 opacity-70 hover:opacity-100"
        aria-label="Close"
      >
        ✕
      </button>
    </div>
  );
}

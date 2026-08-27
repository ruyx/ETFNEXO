'use client';

/**
 * DeleteAdvertiserButton - Botón para eliminar anunciante con confirmación
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2 } from 'lucide-react';

interface DeleteAdvertiserButtonProps {
  advertiserId: string;
  advertiserName: string;
  hasAds: boolean;
}

export default function DeleteAdvertiserButton({
  advertiserId,
  advertiserName,
  hasAds
}: DeleteAdvertiserButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (hasAds) {
      alert('No puedes eliminar un anunciante con anuncios activos. Elimina primero sus anuncios.');
      return;
    }

    const confirmed = confirm(
      `¿Estás seguro de eliminar el anunciante "${advertiserName}"?\n\nEsta acción no se puede deshacer.`
    );

    if (!confirmed) return;

    setIsDeleting(true);

    try {
      const res = await fetch(`/api/admin/advertisers/${advertiserId}`, {
        method: 'DELETE'
      });

      if (!res.ok) {
        throw new Error('Error al eliminar');
      }

      router.refresh();
    } catch (error) {
      alert('Error al eliminar el anunciante');
      setIsDeleting(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className="admin-ads-icon-btn admin-ads-icon-btn--delete"
      title={hasAds ? 'No se puede eliminar (tiene anuncios)' : 'Eliminar'}
    >
      <Trash2 className="w-4 h-4" />
    </button>
  );
}

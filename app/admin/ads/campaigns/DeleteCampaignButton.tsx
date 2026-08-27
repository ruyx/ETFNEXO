'use client';

/**
 * DeleteCampaignButton - Botón para eliminar campaña con confirmación
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2 } from 'lucide-react';

interface DeleteCampaignButtonProps {
  campaignId: string;
  campaignName: string;
}

export default function DeleteCampaignButton({
  campaignId,
  campaignName
}: DeleteCampaignButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    const confirmed = confirm(
      `¿Estás seguro de eliminar la campaña "${campaignName}"?\n\nEsta acción no se puede deshacer. Se eliminarán también todas las impresiones y clicks registrados.`
    );

    if (!confirmed) return;

    setIsDeleting(true);

    try {
      const res = await fetch(`/api/admin/campaigns/${campaignId}`, {
        method: 'DELETE'
      });

      if (!res.ok) {
        throw new Error('Error al eliminar');
      }

      router.refresh();
    } catch (error) {
      alert('Error al eliminar la campaña');
      setIsDeleting(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className="admin-ads-icon-btn admin-ads-icon-btn--delete"
      title="Eliminar"
    >
      <Trash2 className="w-4 h-4" />
    </button>
  );
}

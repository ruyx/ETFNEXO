// @ts-nocheck
/**
 * Edit Advertiser Page - Editar anunciante
 */

import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import AdvertiserForm from '../../AdvertiserForm';

interface PageProps {
  params: { id: string };
}

async function getAdvertiser(id: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('advertisers')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) {
    return null;
  }

  return data;
}

export async function generateMetadata({ params }: PageProps) {
  const advertiser = await getAdvertiser(params.id);

  return {
    title: advertiser ? `Editar ${advertiser.name} - ETF Nexo` : 'Anunciante No Encontrado',
    description: `Editar anunciante ${advertiser?.name || ''}`
  };
}

export default async function EditAdvertiserPage({ params }: PageProps) {
  const advertiser = await getAdvertiser(params.id);

  if (!advertiser) {
    notFound();
  }

  return <AdvertiserForm advertiser={advertiser} mode="edit" />;
}

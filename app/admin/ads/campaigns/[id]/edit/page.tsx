// @ts-nocheck
/**
 * Edit Campaign Page - Editar campaña existente
 */

import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import CampaignForm from '../../CampaignForm';

interface PageProps {
  params: { id: string };
}

async function getCampaign(id: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('ads')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) {
    return null;
  }

  return data;
}

async function getAdvertisers() {
  const supabase = await createClient();
  const { data } = await supabase
    .from('advertisers')
    .select('id, name')
    .eq('status', 'active')
    .order('name');
  return data || [];
}

export async function generateMetadata({ params }: PageProps) {
  const campaign = await getCampaign(params.id);

  return {
    title: campaign ? `Editar ${campaign.name} - ETF Nexo` : 'Campaña No Encontrada',
    description: `Editar campaña ${campaign?.name || ''}`
  };
}

export default async function EditCampaignPage({ params }: PageProps) {
  const campaign = await getCampaign(params.id);

  if (!campaign) {
    notFound();
  }

  const advertisers = await getAdvertisers();

  return <CampaignForm campaign={campaign} advertisers={advertisers} mode="edit" />;
}

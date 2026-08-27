/**
 * New Campaign Page - Crear nueva campaña
 */

import { createClient } from '@/lib/supabase/server';
import CampaignForm from '../CampaignForm';

async function getAdvertisers() {
  const supabase = await createClient();
  const { data } = await supabase
    .from('advertisers')
    .select('id, name')
    .eq('status', 'active')
    .order('name');
  return data || [];
}

export const metadata = {
  title: 'Nueva Campaña - ETF Nexo',
  description: 'Crear nueva campaña publicitaria'
};

export default async function NewCampaignPage() {
  const advertisers = await getAdvertisers();

  return <CampaignForm mode="create" advertisers={advertisers} />;
}

/**
 * New Advertiser Page - Crear nuevo anunciante
 */

import AdvertiserForm from '../AdvertiserForm';

export const metadata = {
  title: 'Nuevo Anunciante - ETF Nexo',
  description: 'Crear nuevo anunciante'
};

export default function NewAdvertiserPage() {
  return <AdvertiserForm mode="create" />;
}

'use client';

/**
 * AdvertiserForm - Formulario reutilizable para crear/editar anunciantes
 */

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';

interface Advertiser {
  id?: string;
  name: string;
  email: string;
  website: string;
  contact_person: string;
  phone: string;
  notes: string;
  status: string;
}

interface AdvertiserFormProps {
  advertiser?: Advertiser;
  mode: 'create' | 'edit';
}

export default function AdvertiserForm({ advertiser, mode }: AdvertiserFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: advertiser?.name || '',
    email: advertiser?.email || '',
    website: advertiser?.website || '',
    contact_person: advertiser?.contact_person || '',
    phone: advertiser?.phone || '',
    notes: advertiser?.notes || '',
    status: advertiser?.status || 'active'
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const url = mode === 'create'
        ? '/api/admin/advertisers'
        : `/api/admin/advertisers/${advertiser?.id}`;

      const method = mode === 'create' ? 'POST' : 'PUT';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Error al guardar');
      }

      router.push('/admin/ads/advertisers');
      router.refresh();
    } catch (err: any) {
      setError(err.message);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="admin-ads-page">
      {/* Header */}
      <div className="admin-ads-page__header">
        <div>
          <h1 className="admin-ads-page__title">
            {mode === 'create' ? 'Nuevo Anunciante' : 'Editar Anunciante'}
          </h1>
          <p className="admin-ads-page__subtitle">
            {mode === 'create'
              ? 'Completa los datos del nuevo anunciante'
              : 'Modifica los datos del anunciante'}
          </p>
        </div>
        <Link href="/admin/ads/advertisers" className="admin-ads-btn admin-ads-btn--secondary">
          <ArrowLeft className="w-4 h-4" />
          Volver
        </Link>
      </div>

      {/* Form */}
      <div className="admin-ads-card">
        <form onSubmit={handleSubmit} className="admin-ads-form">
          {error && (
            <div className="admin-ads-alert admin-ads-alert--error">
              {error}
            </div>
          )}

          {/* Información Básica */}
          <div className="admin-ads-form__section">
            <h3 className="admin-ads-form__section-title">Información Básica</h3>

            <div className="admin-ads-form__row">
              <div className="admin-ads-form__field admin-ads-form__field--full">
                <label htmlFor="name" className="admin-ads-form__label">
                  Nombre del Anunciante <span className="admin-ads-form__required">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="admin-ads-form__input"
                  placeholder="Ej: Google España"
                />
              </div>
            </div>

            <div className="admin-ads-form__row">
              <div className="admin-ads-form__field">
                <label htmlFor="email" className="admin-ads-form__label">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="admin-ads-form__input"
                  placeholder="contacto@empresa.com"
                />
              </div>

              <div className="admin-ads-form__field">
                <label htmlFor="website" className="admin-ads-form__label">
                  Sitio Web
                </label>
                <input
                  type="url"
                  id="website"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  className="admin-ads-form__input"
                  placeholder="https://empresa.com"
                />
              </div>
            </div>
          </div>

          {/* Información de Contacto */}
          <div className="admin-ads-form__section">
            <h3 className="admin-ads-form__section-title">Información de Contacto</h3>

            <div className="admin-ads-form__row">
              <div className="admin-ads-form__field">
                <label htmlFor="contact_person" className="admin-ads-form__label">
                  Persona de Contacto
                </label>
                <input
                  type="text"
                  id="contact_person"
                  value={formData.contact_person}
                  onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
                  className="admin-ads-form__input"
                  placeholder="Nombre del contacto"
                />
              </div>

              <div className="admin-ads-form__field">
                <label htmlFor="phone" className="admin-ads-form__label">
                  Teléfono
                </label>
                <input
                  type="tel"
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="admin-ads-form__input"
                  placeholder="+34 600 000 000"
                />
              </div>
            </div>
          </div>

          {/* Notas y Estado */}
          <div className="admin-ads-form__section">
            <h3 className="admin-ads-form__section-title">Detalles Adicionales</h3>

            <div className="admin-ads-form__row">
              <div className="admin-ads-form__field admin-ads-form__field--full">
                <label htmlFor="notes" className="admin-ads-form__label">
                  Notas
                </label>
                <textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="admin-ads-form__textarea"
                  rows={4}
                  placeholder="Notas internas sobre el anunciante..."
                />
              </div>
            </div>

            <div className="admin-ads-form__row">
              <div className="admin-ads-form__field">
                <label htmlFor="status" className="admin-ads-form__label">
                  Estado
                </label>
                <select
                  id="status"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="admin-ads-form__select"
                >
                  <option value="active">Activo</option>
                  <option value="inactive">Inactivo</option>
                  <option value="suspended">Suspendido</option>
                </select>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="admin-ads-form__actions">
            <Link href="/admin/ads/advertisers" className="admin-ads-btn admin-ads-btn--secondary">
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="admin-ads-btn admin-ads-btn--primary"
            >
              <Save className="w-4 h-4" />
              {isSubmitting ? 'Guardando...' : mode === 'create' ? 'Crear Anunciante' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

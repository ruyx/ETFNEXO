'use client';

/**
 * CampaignForm - Formulario completo para crear/editar campañas
 * Soporta 3 tipos: image_banner, text_banner, script (AdSense)
 */

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Image as ImageIcon, Type, Code, Info, Upload } from 'lucide-react';
import Link from 'next/link';

interface Advertiser {
  id: string;
  name: string;
}

interface Campaign {
  id?: string;
  advertiser_id?: string;
  name: string;
  type: 'image_banner' | 'text_banner' | 'script';
  placement: string;
  image_url?: string;
  image_alt?: string;
  title?: string;
  description?: string;
  cta_text?: string;
  script_code?: string;
  link_url?: string;
  target: string;
  size?: string;
  priority: number;
  max_impressions?: number;
  max_clicks?: number;
  start_date?: string;
  end_date?: string;
  status: string;
}

interface CampaignFormProps {
  campaign?: Campaign;
  advertisers: Advertiser[];
  mode: 'create' | 'edit';
}

export default function CampaignForm({ campaign, advertisers, mode }: CampaignFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState<Campaign>({
    advertiser_id: campaign?.advertiser_id || '',
    name: campaign?.name || '',
    type: campaign?.type || 'image_banner',
    placement: campaign?.placement || '',
    image_url: campaign?.image_url || '',
    image_alt: campaign?.image_alt || '',
    title: campaign?.title || '',
    description: campaign?.description || '',
    cta_text: campaign?.cta_text || '',
    script_code: campaign?.script_code || '',
    link_url: campaign?.link_url || '',
    target: campaign?.target || '_blank',
    size: campaign?.size || '',
    priority: campaign?.priority || 0,
    max_impressions: campaign?.max_impressions,
    max_clicks: campaign?.max_clicks,
    start_date: campaign?.start_date || '',
    end_date: campaign?.end_date || '',
    status: campaign?.status || 'draft'
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const url = mode === 'create'
        ? '/api/admin/campaigns'
        : `/api/admin/campaigns/${campaign?.id}`;

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

      router.push('/admin/ads/campaigns');
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
            {mode === 'create' ? 'Nueva Campaña' : 'Editar Campaña'}
          </h1>
          <p className="admin-ads-page__subtitle">
            {mode === 'create' ? 'Crea un nuevo anuncio publicitario' : 'Modifica la configuración del anuncio'}
          </p>
        </div>
        <Link href="/admin/ads/campaigns" className="admin-ads-btn admin-ads-btn--secondary">
          <ArrowLeft className="w-4 h-4" />
          Volver
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="campaign-form">
        {error && (
          <div className="admin-ads-alert admin-ads-alert--error">
            {error}
          </div>
        )}

        <div className="campaign-form__layout">
          {/* Main Form */}
          <div className="campaign-form__main">
            {/* Tipo de Anuncio */}
            <div className="admin-ads-card">
              <h3 className="admin-ads-form__section-title">Tipo de Anuncio</h3>

              <div className="campaign-type-selector">
                <div className="campaign-type-option">
                  <input
                    type="radio"
                    id="type-image"
                    name="type"
                    value="image_banner"
                    checked={formData.type === 'image_banner'}
                    onChange={(e) => setFormData({ ...formData, type: 'image_banner' })}
                  />
                  <label htmlFor="type-image">
                    <div className="campaign-type-option__icon">
                      <ImageIcon className="w-6 h-6" />
                    </div>
                    <div className="campaign-type-option__title">Banner Imagen</div>
                    <div className="campaign-type-option__description">
                      Anuncio con imagen estática
                    </div>
                  </label>
                </div>

                <div className="campaign-type-option">
                  <input
                    type="radio"
                    id="type-text"
                    name="type"
                    value="text_banner"
                    checked={formData.type === 'text_banner'}
                    onChange={(e) => setFormData({ ...formData, type: 'text_banner' })}
                  />
                  <label htmlFor="type-text">
                    <div className="campaign-type-option__icon">
                      <Type className="w-6 h-6" />
                    </div>
                    <div className="campaign-type-option__title">Banner Texto</div>
                    <div className="campaign-type-option__description">
                      Anuncio con texto y CTA
                    </div>
                  </label>
                </div>

                <div className="campaign-type-option">
                  <input
                    type="radio"
                    id="type-script"
                    name="type"
                    value="script"
                    checked={formData.type === 'script'}
                    onChange={(e) => setFormData({ ...formData, type: 'script' })}
                  />
                  <label htmlFor="type-script">
                    <div className="campaign-type-option__icon">
                      <Code className="w-6 h-6" />
                    </div>
                    <div className="campaign-type-option__title">Script</div>
                    <div className="campaign-type-option__description">
                      Google AdSense u otro script
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Información Básica */}
            <div className="admin-ads-card">
              <h3 className="admin-ads-form__section-title">Información Básica</h3>

              <div className="admin-ads-form__row">
                <div className="admin-ads-form__field admin-ads-form__field--full">
                  <label htmlFor="name" className="admin-ads-form__label">
                    Nombre de la Campaña <span className="admin-ads-form__required">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="admin-ads-form__input"
                    placeholder="Ej: Banner Sidebar Principal"
                  />
                </div>
              </div>

              <div className="admin-ads-form__row">
                <div className="admin-ads-form__field">
                  <label htmlFor="advertiser_id" className="admin-ads-form__label">
                    Anunciante
                  </label>
                  <select
                    id="advertiser_id"
                    value={formData.advertiser_id}
                    onChange={(e) => setFormData({ ...formData, advertiser_id: e.target.value })}
                    className="admin-ads-form__select"
                  >
                    <option value="">Sin anunciante</option>
                    {advertisers.map((adv) => (
                      <option key={adv.id} value={adv.id}>
                        {adv.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="admin-ads-form__field">
                  <label htmlFor="placement" className="admin-ads-form__label">
                    Ubicación <span className="admin-ads-form__required">*</span>
                  </label>
                  <select
                    id="placement"
                    required
                    value={formData.placement}
                    onChange={(e) => setFormData({ ...formData, placement: e.target.value })}
                    className="admin-ads-form__select"
                  >
                    <option value="">Selecciona ubicación</option>
                    <option value="sidebar_top">Sidebar Superior</option>
                    <option value="sidebar_bottom">Sidebar Inferior</option>
                    <option value="article_top">Artículo - Encabezado</option>
                    <option value="article_mid">Artículo - Medio</option>
                    <option value="article_bottom">Artículo - Pie</option>
                    <option value="feed_inline">Feed Inline</option>
                    <option value="header">Header</option>
                    <option value="footer">Footer</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Contenido según tipo */}
            {formData.type === 'image_banner' && (
              <div className="admin-ads-card">
                <h3 className="admin-ads-form__section-title">Contenido del Banner</h3>

                <div className="admin-ads-form__row">
                  <div className="admin-ads-form__field admin-ads-form__field--full">
                    <label htmlFor="image_url" className="admin-ads-form__label">
                      URL de la Imagen <span className="admin-ads-form__required">*</span>
                    </label>
                    <input
                      type="url"
                      id="image_url"
                      required={formData.type === 'image_banner'}
                      value={formData.image_url}
                      onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                      className="admin-ads-form__input"
                      placeholder="https://ejemplo.com/imagen.jpg"
                    />
                    <p style={{ fontSize: '0.813rem', color: 'var(--color-neutral-600)', marginTop: 'var(--spacing-1)' }}>
                      Sube la imagen a un servicio de hosting o usa una URL existente
                    </p>
                  </div>
                </div>

                <div className="admin-ads-form__row">
                  <div className="admin-ads-form__field admin-ads-form__field--full">
                    <label htmlFor="image_alt" className="admin-ads-form__label">
                      Texto Alternativo
                    </label>
                    <input
                      type="text"
                      id="image_alt"
                      value={formData.image_alt}
                      onChange={(e) => setFormData({ ...formData, image_alt: e.target.value })}
                      className="admin-ads-form__input"
                      placeholder="Descripción de la imagen para accesibilidad"
                    />
                  </div>
                </div>

                <div className="admin-ads-form__row">
                  <div className="admin-ads-form__field admin-ads-form__field--full">
                    <label htmlFor="link_url" className="admin-ads-form__label">
                      URL de Destino
                    </label>
                    <input
                      type="url"
                      id="link_url"
                      value={formData.link_url}
                      onChange={(e) => setFormData({ ...formData, link_url: e.target.value })}
                      className="admin-ads-form__input"
                      placeholder="https://ejemplo.com/destino"
                    />
                  </div>
                </div>
              </div>
            )}

            {formData.type === 'text_banner' && (
              <div className="admin-ads-card">
                <h3 className="admin-ads-form__section-title">Contenido del Banner</h3>

                <div className="admin-ads-form__row">
                  <div className="admin-ads-form__field admin-ads-form__field--full">
                    <label htmlFor="title" className="admin-ads-form__label">
                      Título <span className="admin-ads-form__required">*</span>
                    </label>
                    <input
                      type="text"
                      id="title"
                      required={formData.type === 'text_banner'}
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="admin-ads-form__input"
                      placeholder="Título del anuncio"
                    />
                  </div>
                </div>

                <div className="admin-ads-form__row">
                  <div className="admin-ads-form__field admin-ads-form__field--full">
                    <label htmlFor="description" className="admin-ads-form__label">
                      Descripción
                    </label>
                    <textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="admin-ads-form__textarea"
                      rows={3}
                      placeholder="Descripción del anuncio"
                    />
                  </div>
                </div>

                <div className="admin-ads-form__row">
                  <div className="admin-ads-form__field">
                    <label htmlFor="cta_text" className="admin-ads-form__label">
                      Texto del CTA
                    </label>
                    <input
                      type="text"
                      id="cta_text"
                      value={formData.cta_text}
                      onChange={(e) => setFormData({ ...formData, cta_text: e.target.value })}
                      className="admin-ads-form__input"
                      placeholder="Ej: Saber más"
                    />
                  </div>

                  <div className="admin-ads-form__field">
                    <label htmlFor="link_url_text" className="admin-ads-form__label">
                      URL de Destino
                    </label>
                    <input
                      type="url"
                      id="link_url_text"
                      value={formData.link_url}
                      onChange={(e) => setFormData({ ...formData, link_url: e.target.value })}
                      className="admin-ads-form__input"
                      placeholder="https://ejemplo.com"
                    />
                  </div>
                </div>
              </div>
            )}

            {formData.type === 'script' && (
              <div className="admin-ads-card">
                <h3 className="admin-ads-form__section-title">Código del Script</h3>

                <div className="campaign-code-hint">
                  <Info className="w-4 h-4" />
                  <div>
                    <strong>Google AdSense:</strong> Pega aquí el código completo que obtuviste de tu panel de AdSense.
                    El código se insertará tal como lo proporciones.
                  </div>
                </div>

                <div className="campaign-code-editor">
                  <label htmlFor="script_code" className="admin-ads-form__label">
                    Código HTML/JavaScript <span className="admin-ads-form__required">*</span>
                  </label>
                  <textarea
                    id="script_code"
                    required={formData.type === 'script'}
                    value={formData.script_code}
                    onChange={(e) => setFormData({ ...formData, script_code: e.target.value })}
                    placeholder='<script async src="https://pagead2.googlesyndication.com/..."></script>'
                  />
                </div>
              </div>
            )}

            {/* Configuración Avanzada */}
            <div className="admin-ads-card">
              <h3 className="admin-ads-form__section-title">Configuración Avanzada</h3>

              <div className="admin-ads-form__row">
                <div className="admin-ads-form__field">
                  <label htmlFor="size" className="admin-ads-form__label">
                    Tamaño
                  </label>
                  <input
                    type="text"
                    id="size"
                    value={formData.size}
                    onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                    className="admin-ads-form__input"
                    placeholder="Ej: 300x250"
                  />
                </div>

                <div className="admin-ads-form__field">
                  <label htmlFor="priority" className="admin-ads-form__label">
                    Prioridad
                  </label>
                  <input
                    type="number"
                    id="priority"
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) || 0 })}
                    className="admin-ads-form__input"
                    placeholder="0"
                  />
                  <p style={{ fontSize: '0.75rem', color: 'var(--color-neutral-600)', marginTop: 'var(--spacing-1)' }}>
                    Mayor número = mayor prioridad
                  </p>
                </div>
              </div>

              <div className="admin-ads-form__row">
                <div className="admin-ads-form__field">
                  <label htmlFor="start_date" className="admin-ads-form__label">
                    Fecha de Inicio
                  </label>
                  <input
                    type="datetime-local"
                    id="start_date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    className="admin-ads-form__input"
                  />
                </div>

                <div className="admin-ads-form__field">
                  <label htmlFor="end_date" className="admin-ads-form__label">
                    Fecha de Fin
                  </label>
                  <input
                    type="datetime-local"
                    id="end_date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    className="admin-ads-form__input"
                  />
                </div>
              </div>

              <div className="admin-ads-form__row">
                <div className="admin-ads-form__field">
                  <label htmlFor="max_impressions" className="admin-ads-form__label">
                    Máximo de Impresiones
                  </label>
                  <input
                    type="number"
                    id="max_impressions"
                    value={formData.max_impressions || ''}
                    onChange={(e) => setFormData({ ...formData, max_impressions: e.target.value ? parseInt(e.target.value) : undefined })}
                    className="admin-ads-form__input"
                    placeholder="Ilimitado"
                  />
                </div>

                <div className="admin-ads-form__field">
                  <label htmlFor="max_clicks" className="admin-ads-form__label">
                    Máximo de Clicks
                  </label>
                  <input
                    type="number"
                    id="max_clicks"
                    value={formData.max_clicks || ''}
                    onChange={(e) => setFormData({ ...formData, max_clicks: e.target.value ? parseInt(e.target.value) : undefined })}
                    className="admin-ads-form__input"
                    placeholder="Ilimitado"
                  />
                </div>
              </div>

              <div className="admin-ads-form__row">
                <div className="admin-ads-form__field">
                  <label htmlFor="target" className="admin-ads-form__label">
                    Target del Link
                  </label>
                  <select
                    id="target"
                    value={formData.target}
                    onChange={(e) => setFormData({ ...formData, target: e.target.value })}
                    className="admin-ads-form__select"
                  >
                    <option value="_blank">Nueva ventana (_blank)</option>
                    <option value="_self">Misma ventana (_self)</option>
                    <option value="_parent">Ventana padre (_parent)</option>
                    <option value="_top">Ventana superior (_top)</option>
                  </select>
                </div>

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
                    <option value="draft">Borrador</option>
                    <option value="active">Activo</option>
                    <option value="paused">Pausado</option>
                    <option value="ended">Finalizado</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="admin-ads-form__actions">
              <Link href="/admin/ads/campaigns" className="admin-ads-btn admin-ads-btn--secondary">
                Cancelar
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className="admin-ads-btn admin-ads-btn--primary"
              >
                <Save className="w-4 h-4" />
                {isSubmitting ? 'Guardando...' : mode === 'create' ? 'Crear Campaña' : 'Guardar Cambios'}
              </button>
            </div>
          </div>

          {/* Preview Sidebar */}
          <div className="campaign-form__sidebar">
            <div className="campaign-preview">
              <h3 className="campaign-preview__header">Vista Previa</h3>

              <div className="campaign-preview__content">
                <div className="campaign-preview__item">
                  <span className="campaign-preview__label">Tipo</span>
                  <span className="campaign-preview__value">
                    {formData.type === 'image_banner' ? 'Banner Imagen' :
                     formData.type === 'text_banner' ? 'Banner Texto' :
                     'Script'}
                  </span>
                </div>

                <div className="campaign-preview__item">
                  <span className="campaign-preview__label">Ubicación</span>
                  <span className="campaign-preview__value">
                    {formData.placement || 'Sin seleccionar'}
                  </span>
                </div>

                {formData.size && (
                  <div className="campaign-preview__item">
                    <span className="campaign-preview__label">Tamaño</span>
                    <span className="campaign-preview__value">{formData.size}</span>
                  </div>
                )}

                <div className="campaign-preview__item">
                  <span className="campaign-preview__label">Estado</span>
                  <span className={`admin-ads-badge admin-ads-badge--${
                    formData.status === 'active' ? 'success' :
                    formData.status === 'paused' ? 'warning' :
                    'neutral'
                  }`}>
                    {formData.status === 'active' ? 'Activo' :
                     formData.status === 'paused' ? 'Pausado' :
                     formData.status === 'ended' ? 'Finalizado' :
                     'Borrador'}
                  </span>
                </div>
              </div>

              <div className="campaign-preview__ad">
                {formData.type === 'image_banner' && formData.image_url ? (
                  <img
                    src={formData.image_url}
                    alt={formData.image_alt || 'Preview'}
                    style={{ width: '100%', borderRadius: 'var(--btn-radius)' }}
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                ) : formData.type === 'text_banner' && formData.title ? (
                  <div style={{ padding: 'var(--spacing-4)' }}>
                    <h4 style={{ margin: '0 0 var(--spacing-2) 0', fontSize: '1rem', fontWeight: '700' }}>
                      {formData.title}
                    </h4>
                    {formData.description && (
                      <p style={{ margin: '0 0 var(--spacing-3) 0', fontSize: '0.875rem', color: 'var(--color-neutral-600)' }}>
                        {formData.description}
                      </p>
                    )}
                    {formData.cta_text && (
                      <button style={{
                        padding: 'var(--spacing-2) var(--spacing-4)',
                        background: 'var(--color-primary)',
                        color: 'var(--color-white)',
                        border: 'none',
                        borderRadius: 'var(--btn-radius)',
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        cursor: 'pointer'
                      }}>
                        {formData.cta_text}
                      </button>
                    )}
                  </div>
                ) : formData.type === 'script' && formData.script_code ? (
                  <div style={{ padding: 'var(--spacing-4)', fontSize: '0.75rem', color: 'var(--color-neutral-600)' }}>
                    <Code className="w-6 h-6" style={{ margin: '0 auto var(--spacing-2)', display: 'block' }} />
                    <p style={{ margin: 0, textAlign: 'center' }}>
                      Script configurado<br/>
                      ({formData.script_code.length} caracteres)
                    </p>
                  </div>
                ) : (
                  <div className="campaign-preview__ad-empty">
                    <Info className="w-6 h-6" />
                    <p>Completa los campos para ver la vista previa</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

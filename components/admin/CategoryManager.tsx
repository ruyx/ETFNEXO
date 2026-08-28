'use client';

/**
 * CategoryManager - Modern 2026 Clean Corporate UI
 * Inline category management with sleek, professional design
 */

import { useState } from 'react';
import { Plus, Pencil, Trash2, Save, X } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  slug?: string;
  color_hex: string;
  description?: string;
}

interface CategoryManagerProps {
  categories: Category[];
  selectedCategoryId: string;
  onCategoryChange: (categoryId: string) => void;
  onCategoriesUpdate: () => void;
  apiEndpoint: string;
  loading?: boolean;
}

export default function CategoryManager({
  categories,
  selectedCategoryId,
  onCategoryChange,
  onCategoriesUpdate,
  apiEndpoint,
  loading = false
}: CategoryManagerProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    color_hex: '#3B82F6'
  });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const handleCreate = async () => {
    if (!formData.name.trim()) return;

    setSaving(true);
    try {
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setFormData({ name: '', color_hex: '#3B82F6' });
        setIsCreating(false);
        onCategoriesUpdate();
      } else {
        const error = await response.json();
        alert(error.message || 'Error al crear categoría');
      }
    } catch (error) {
      console.error('Error creating category:', error);
      alert('Error al crear categoría');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (id: string) => {
    if (!formData.name.trim()) return;

    setSaving(true);
    try {
      const response = await fetch(`${apiEndpoint}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setEditingId(null);
        setFormData({ name: '', color_hex: '#3B82F6' });
        onCategoriesUpdate();
      } else {
        const error = await response.json();
        alert(error.message || 'Error al actualizar categoría');
      }
    } catch (error) {
      console.error('Error updating category:', error);
      alert('Error al actualizar categoría');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar esta categoría?')) return;

    setDeleting(id);
    try {
      const response = await fetch(`${apiEndpoint}/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        if (selectedCategoryId === id) {
          onCategoryChange('');
        }
        onCategoriesUpdate();
      } else {
        const error = await response.json();
        alert(error.message || 'Error al eliminar categoría');
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      alert('Error al eliminar categoría');
    } finally {
      setDeleting(null);
    }
  };

  const startEdit = (category: Category) => {
    setEditingId(category.id);
    setFormData({
      name: category.name,
      color_hex: category.color_hex
    });
    setIsCreating(false);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setIsCreating(false);
    setFormData({ name: '', color_hex: '#3B82F6' });
  };

  if (loading) {
    return <div className="category-manager-loading">Cargando categorías...</div>;
  }

  return (
    <div className="category-manager">
      {/* Category Pills with Inline Edit on Hover */}
      <div className="category-manager__pills">
        {/* Sin categoría pill */}
        <button
          onClick={() => onCategoryChange('')}
          className={`category-manager__pill ${!selectedCategoryId ? 'category-manager__pill--active' : ''}`}
        >
          Sin categoría
        </button>

        {/* Category pills with hover edit */}
        {categories.map((cat) => {
          const isEditing = editingId === cat.id;
          const isSelected = selectedCategoryId === cat.id;

          if (isEditing) {
            return (
              <div key={cat.id} className="category-manager__pill category-manager__pill--editing">
                <input
                  type="color"
                  value={formData.color_hex}
                  onChange={(e) => setFormData({ ...formData, color_hex: e.target.value })}
                  className="category-manager__pill-color-input"
                  title="Color de categoría"
                />
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="category-manager__pill-text-input"
                  placeholder="Nombre"
                  autoFocus
                />
                <button
                  onClick={() => handleUpdate(cat.id)}
                  disabled={saving || !formData.name.trim()}
                  className="category-manager__pill-btn category-manager__pill-btn--save"
                  title="Guardar"
                >
                  <Save size={14} />
                </button>
                <button
                  onClick={cancelEdit}
                  disabled={saving}
                  className="category-manager__pill-btn category-manager__pill-btn--cancel"
                  title="Cancelar"
                >
                  <X size={14} />
                </button>
              </div>
            );
          }

          return (
            <div
              key={cat.id}
              className={`category-manager__pill ${isSelected ? 'category-manager__pill--active' : ''}`}
            >
              <button
                onClick={() => onCategoryChange(cat.id)}
                className="category-manager__pill-main"
              >
                <span className="category-manager__pill-dot" style={{ backgroundColor: cat.color_hex }} />
                <span className="category-manager__pill-name">{cat.name}</span>
              </button>
              <div className="category-manager__pill-actions">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsCreating(false);
                    setEditingId(cat.id);
                    setFormData({ name: cat.name, color_hex: cat.color_hex });
                  }}
                  disabled={saving || deleting !== null || isCreating}
                  className="category-manager__pill-btn category-manager__pill-btn--edit"
                  title="Editar"
                >
                  <Pencil size={12} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(cat.id);
                  }}
                  disabled={deleting === cat.id || saving || isCreating}
                  className="category-manager__pill-btn category-manager__pill-btn--delete"
                  title="Eliminar"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          );
        })}

        {/* Create new category inline */}
        {isCreating && (
          <div className="category-manager__pill category-manager__pill--creating">
            <input
              type="color"
              value={formData.color_hex}
              onChange={(e) => setFormData({ ...formData, color_hex: e.target.value })}
              className="category-manager__pill-color-input"
              title="Color de categoría"
            />
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="category-manager__pill-text-input"
              placeholder="Nueva categoría"
              autoFocus
            />
            <button
              onClick={handleCreate}
              disabled={saving || !formData.name.trim()}
              className="category-manager__pill-btn category-manager__pill-btn--save"
              title="Crear"
            >
              <Save size={14} />
            </button>
            <button
              onClick={cancelEdit}
              disabled={saving}
              className="category-manager__pill-btn category-manager__pill-btn--cancel"
              title="Cancelar"
            >
              <X size={14} />
            </button>
          </div>
        )}
      </div>

      {/* Add New Button */}
      {!isCreating && !editingId && (
        <button
          onClick={() => {
            setIsCreating(true);
            setFormData({ name: '', color_hex: '#3B82F6' });
          }}
          disabled={saving}
          className="category-manager__add-btn"
        >
          <Plus size={16} />
          <span>Nueva Categoría</span>
        </button>
      )}
    </div>
  );
}

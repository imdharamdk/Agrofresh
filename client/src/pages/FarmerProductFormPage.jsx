import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { productApi } from '../api/agroApi';
import { useAuth } from '../contexts/AuthContext';

const CATEGORY_OPTIONS = ['Vegetables', 'Fruits', 'Grains', 'Spices', 'Dairy', 'Organic'];
const UNIT_OPTIONS = ['kg', 'gram', 'litre', 'piece'];

const initialState = {
  name: '',
  description: '',
  category: 'Vegetables',
  price: '',
  bulkPrice: '',
  minBulkQty: '',
  unit: 'kg',
  quantity: '',
  location: '',
  harvestDate: '',
  isOrganic: false
};

const FarmerProductFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    ...initialState,
    location: user?.location || ''
  });
  const [images, setImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) return;
    productApi.get(id).then(({ data }) => {
      const product = data.data.product;
      setFormData({
        name: product.name,
        description: product.description,
        category: product.category,
        price: product.price,
        bulkPrice: product.bulkPrice,
        minBulkQty: product.minBulkQty,
        unit: product.unit,
        quantity: product.quantity,
        location: product.location || user?.location || '',
        harvestDate: product.harvestDate ? String(product.harvestDate).slice(0, 10) : '',
        isOrganic: Boolean(product.isOrganic)
      });
      setExistingImages(product.images || []);
    });
  }, [id, user]);

  const imagePreviews = useMemo(
    () => Array.from(images || []).map((file) => URL.createObjectURL(file)),
    [images]
  );

  useEffect(() => () => imagePreviews.forEach((url) => URL.revokeObjectURL(url)), [imagePreviews]);

  const handleChange = (key, value) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const submitHandler = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      const payload = new FormData();
      Object.entries(formData).forEach(([key, value]) => payload.append(key, value));
      Array.from(images).forEach((file) => payload.append('images', file));

      if (id) {
        if (images.length) payload.append('replaceImages', 'true');
        await productApi.update(id, payload);
      } else {
        await productApi.create(payload);
      }

      navigate('/dashboard/farmer');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <div className="mb-6">
        <h1 className="text-3xl font-black text-slate-900">{id ? 'Edit Product' : 'Add Product'}</h1>
        <p className="mt-2 text-sm text-slate-500">Fill in the details and upload clear product images.</p>
      </div>

      <form onSubmit={submitHandler} className="card grid gap-4 md:grid-cols-2">
        {/* Name */}
        <input
          className="input md:col-span-2"
          placeholder="Product Name"
          value={formData.name}
          onChange={(e) => handleChange('name', e.target.value)}
          required
        />

        {/* Category + Unit */}
        <select className="input" value={formData.category} onChange={(e) => handleChange('category', e.target.value)}>
          {CATEGORY_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select className="input" value={formData.unit} onChange={(e) => handleChange('unit', e.target.value)}>
          {UNIT_OPTIONS.map((u) => <option key={u} value={u}>{u}</option>)}
        </select>

        {/* Price + Bulk Price */}
        <input
          className="input"
          type="number"
          min="0"
          step="0.01"
          placeholder="Price (₹)"
          value={formData.price}
          onChange={(e) => handleChange('price', e.target.value)}
          required
        />
        <input
          className="input"
          type="number"
          min="0"
          step="0.01"
          placeholder="Bulk Price (₹) — optional"
          value={formData.bulkPrice}
          onChange={(e) => handleChange('bulkPrice', e.target.value)}
        />

        {/* Min Bulk Qty + Quantity */}
        <input
          className="input"
          type="number"
          min="0"
          step="0.01"
          placeholder="Min Bulk Qty — optional"
          value={formData.minBulkQty}
          onChange={(e) => handleChange('minBulkQty', e.target.value)}
        />
        <input
          className="input"
          type="number"
          min="0"
          step="0.01"
          placeholder="Available Quantity"
          value={formData.quantity}
          onChange={(e) => handleChange('quantity', e.target.value)}
          required
        />

        {/* Location + Harvest Date */}
        <input
          className="input"
          type="text"
          placeholder="Location (e.g. Nashik, Maharashtra)"
          value={formData.location}
          onChange={(e) => handleChange('location', e.target.value)}
          required
        />
        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-500">Harvest Date (optional)</label>
          <input
            className="input"
            type="date"
            value={formData.harvestDate}
            onChange={(e) => handleChange('harvestDate', e.target.value)}
          />
        </div>

        {/* Organic checkbox */}
        <label className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 md:col-span-2">
          <input
            type="checkbox"
            checked={formData.isOrganic}
            onChange={(e) => handleChange('isOrganic', e.target.checked)}
          />
          Mark as Organic Product
        </label>

        {/* Description */}
        <textarea
          className="input min-h-32 md:col-span-2"
          placeholder="Description"
          value={formData.description}
          onChange={(e) => handleChange('description', e.target.value)}
          required
        />

        {/* Image Upload */}
        <div className="md:col-span-2">
          <label className="mb-1 block text-xs font-semibold text-slate-500">Product Images (up to 5)</label>
          <input
            className="input"
            type="file"
            multiple
            accept="image/*"
            onChange={(e) => setImages(e.target.files)}
          />
          <p className="mt-1 text-xs text-slate-400">JPG, PNG, WebP • Max 5MB each • On edit, new uploads replace old images.</p>
        </div>

        {/* Existing Images (edit mode, no new selected) */}
        {!!existingImages.length && !images.length && (
          <div className="md:col-span-2">
            <p className="mb-3 text-sm font-semibold text-slate-700">Current Images</p>
            <div className="grid gap-3 sm:grid-cols-3">
              {existingImages.map((img, i) => (
                <img key={`${img.url}-${i}`} src={img.url} alt="Product" className="h-32 w-full rounded-2xl object-cover" />
              ))}
            </div>
          </div>
        )}

        {/* New Image Previews */}
        {!!imagePreviews.length && (
          <div className="md:col-span-2">
            <p className="mb-3 text-sm font-semibold text-slate-700">Preview</p>
            <div className="grid gap-3 sm:grid-cols-3">
              {imagePreviews.map((preview) => (
                <img key={preview} src={preview} alt="Preview" className="h-32 w-full rounded-2xl object-cover" />
              ))}
            </div>
          </div>
        )}

        <button type="submit" className="btn-primary md:col-span-2" disabled={saving}>
          {saving ? 'Saving...' : id ? 'Update Product' : 'Create Product'}
        </button>
      </form>
    </div>
  );
};

export default FarmerProductFormPage;

import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { productApi } from '../api/agroApi';
import { useAuth } from '../contexts/AuthContext';

const CATEGORY_OPTIONS = ['Vegetables', 'Fruits', 'Grains', 'Spices', 'Dairy', 'Organic'];
const UNIT_OPTIONS = ['kg', 'gram', 'litre', 'piece'];

const isValidUrl = (str) => {
  try { return Boolean(new URL(str)); } catch { return false; }
};

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

  const [formData, setFormData] = useState({ ...initialState, location: user?.location || '' });
  const [imgMode, setImgMode] = useState('file'); // 'file' | 'url'
  const [imageFiles, setImageFiles] = useState([]);
  const [imageUrl, setImageUrl] = useState('');
  const [existingImages, setExistingImages] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) return;
    productApi.get(id).then(({ data }) => {
      const p = data.data.product;
      setFormData({
        name: p.name,
        description: p.description,
        category: p.category,
        price: p.price,
        bulkPrice: p.bulkPrice,
        minBulkQty: p.minBulkQty,
        unit: p.unit,
        quantity: p.quantity,
        location: p.location || user?.location || '',
        harvestDate: p.harvestDate ? String(p.harvestDate).slice(0, 10) : '',
        isOrganic: Boolean(p.isOrganic)
      });
      setExistingImages(p.images || []);
      // If existing images, pre-fill URL field with first one
      if (p.images?.[0]?.url) setImageUrl(p.images[0].url);
    });
  }, [id, user]);

  const filePreviews = useMemo(
    () => Array.from(imageFiles).map((f) => URL.createObjectURL(f)),
    [imageFiles]
  );
  useEffect(() => () => filePreviews.forEach((u) => URL.revokeObjectURL(u)), [filePreviews]);

  const handleChange = (key, value) => setFormData((prev) => ({ ...prev, [key]: value }));

  const submitHandler = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      const payload = new FormData();
      Object.entries(formData).forEach(([k, v]) => payload.append(k, v));

      if (imgMode === 'url' && imageUrl.trim()) {
        // Send as imageUrl field — backend stores it directly
        payload.set('imageUrl', imageUrl.trim());
      } else if (imgMode === 'file' && imageFiles.length) {
        Array.from(imageFiles).forEach((f) => payload.append('images', f));
        if (id) payload.append('replaceImages', 'true');
      }

      if (id) {
        await productApi.update(id, payload);
      } else {
        await productApi.create(payload);
      }
      navigate('/dashboard/farmer');
    } finally {
      setSaving(false);
    }
  };

  const urlPreviewOk = imgMode === 'url' && isValidUrl(imageUrl);

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <div className="mb-6">
        <h1 className="text-3xl font-black text-slate-900">{id ? 'Edit Product' : 'Add Product'}</h1>
        <p className="mt-1 text-sm text-slate-500">Fill in the details and add a product image.</p>
      </div>

      <form onSubmit={submitHandler} className="card grid gap-4 md:grid-cols-2">

        {/* Basic fields */}
        <input className="input md:col-span-2" placeholder="Product Name" value={formData.name}
          onChange={(e) => handleChange('name', e.target.value)} required />

        <select className="input" value={formData.category} onChange={(e) => handleChange('category', e.target.value)}>
          {CATEGORY_OPTIONS.map((c) => <option key={c}>{c}</option>)}
        </select>
        <select className="input" value={formData.unit} onChange={(e) => handleChange('unit', e.target.value)}>
          {UNIT_OPTIONS.map((u) => <option key={u}>{u}</option>)}
        </select>

        <input className="input" type="number" min="0" step="0.01" placeholder="Price (₹)"
          value={formData.price} onChange={(e) => handleChange('price', e.target.value)} required />
        <input className="input" type="number" min="0" step="0.01" placeholder="Bulk Price (₹) — optional"
          value={formData.bulkPrice} onChange={(e) => handleChange('bulkPrice', e.target.value)} />

        <input className="input" type="number" min="0" step="0.01" placeholder="Min Bulk Qty — optional"
          value={formData.minBulkQty} onChange={(e) => handleChange('minBulkQty', e.target.value)} />
        <input className="input" type="number" min="0" step="0.01" placeholder="Available Quantity"
          value={formData.quantity} onChange={(e) => handleChange('quantity', e.target.value)} required />

        <input className="input" placeholder="Location (e.g. Nashik, Maharashtra)"
          value={formData.location} onChange={(e) => handleChange('location', e.target.value)} required />
        <div>
          <label className="mb-1 block text-xs font-semibold text-slate-500">Harvest Date (optional)</label>
          <input className="input" type="date" value={formData.harvestDate}
            onChange={(e) => handleChange('harvestDate', e.target.value)} />
        </div>

        <label className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 md:col-span-2">
          <input type="checkbox" checked={formData.isOrganic}
            onChange={(e) => handleChange('isOrganic', e.target.checked)} />
          Mark as Organic Product
        </label>

        <textarea className="input min-h-28 md:col-span-2" placeholder="Description"
          value={formData.description} onChange={(e) => handleChange('description', e.target.value)} required />

        {/* ── Image Section ─────────────────────────────── */}
        <div className="md:col-span-2 rounded-3xl border border-slate-200 p-4 space-y-4">
          <div>
            <p className="text-sm font-bold text-slate-800 mb-3">Product Image</p>

            {/* Toggle tabs */}
            <div className="flex rounded-2xl border border-slate-200 overflow-hidden w-fit">
              <button
                type="button"
                onClick={() => setImgMode('file')}
                className={`px-5 py-2 text-sm font-semibold transition ${imgMode === 'file' ? 'bg-leaf text-white' : 'bg-white text-slate-600 hover:bg-slate-50'}`}
              >
                📁 Upload File
              </button>
              <button
                type="button"
                onClick={() => setImgMode('url')}
                className={`px-5 py-2 text-sm font-semibold transition ${imgMode === 'url' ? 'bg-leaf text-white' : 'bg-white text-slate-600 hover:bg-slate-50'}`}
              >
                🔗 Paste URL
              </button>
            </div>
          </div>

          {/* File upload */}
          {imgMode === 'file' && (
            <div className="space-y-3">
              <input
                className="input"
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => setImageFiles(e.target.files)}
              />
              <p className="text-xs text-slate-400">JPG, PNG, WebP · Max 5MB each · Up to 5 images</p>

              {/* New file previews */}
              {filePreviews.length > 0 && (
                <div className="grid grid-cols-3 gap-3">
                  {filePreviews.map((src) => (
                    <img key={src} src={src} alt="preview" className="h-24 w-full rounded-2xl object-cover border border-slate-200" />
                  ))}
                </div>
              )}

              {/* Existing images (edit mode, no new file selected) */}
              {id && existingImages.length > 0 && imageFiles.length === 0 && (
                <div>
                  <p className="text-xs font-semibold text-slate-500 mb-2">Current images</p>
                  <div className="grid grid-cols-3 gap-3">
                    {existingImages.map((img, i) => (
                      <img key={i} src={img.url} alt="current" className="h-24 w-full rounded-2xl object-cover border border-slate-200" />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* URL input */}
          {imgMode === 'url' && (
            <div className="space-y-3">
              <input
                className="input"
                type="url"
                placeholder="https://example.com/product-image.jpg"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
              />
              <p className="text-xs text-slate-400">Paste any public image URL (Unsplash, Google Images, your own CDN, etc.)</p>

              {/* URL preview */}
              {urlPreviewOk && (
                <div className="relative w-full h-48 rounded-2xl overflow-hidden border border-slate-200">
                  <img
                    src={imageUrl}
                    alt="URL preview"
                    className="h-full w-full object-cover"
                    onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                  />
                  <div className="hidden h-full w-full items-center justify-center bg-slate-100 text-sm text-slate-500 rounded-2xl">
                    ⚠️ Could not load image — check the URL
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <button type="submit" className="btn-primary md:col-span-2" disabled={saving}>
          {saving ? 'Saving...' : id ? 'Update Product' : 'Create Product'}
        </button>
      </form>
    </div>
  );
};

export default FarmerProductFormPage;

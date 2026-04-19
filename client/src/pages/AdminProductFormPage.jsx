import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { adminApi, productApi } from '../api/agroApi';

const CATEGORY_OPTIONS = ['Vegetables', 'Fruits', 'Grains', 'Spices', 'Dairy', 'Organic'];
const UNIT_OPTIONS = ['kg', 'gram', 'litre', 'piece'];

const initialState = {
  farmerId: '',
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

const AdminProductFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState(initialState);
  const [farmers, setFarmers] = useState([]);
  const [images, setImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    adminApi.users().then(({ data }) => {
      setFarmers(data.data.users.filter((user) => user.role === 'farmer'));
    });
  }, []);

  useEffect(() => {
    if (!id) return;

    productApi.get(id).then(({ data }) => {
      const product = data.data.product;
      setFormData({
        farmerId: product.farmerId?._id || '',
        name: product.name,
        description: product.description,
        category: product.category,
        price: product.price,
        bulkPrice: product.bulkPrice,
        minBulkQty: product.minBulkQty,
        unit: product.unit,
        quantity: product.quantity,
        location: product.location || '',
        harvestDate: product.harvestDate ? String(product.harvestDate).slice(0, 10) : '',
        isOrganic: Boolean(product.isOrganic)
      });
      setExistingImages(product.images || []);
    });
  }, [id]);

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
      Object.entries(formData).forEach(([key, value]) => {
        payload.append(key, value);
      });

      Array.from(images).forEach((file) => payload.append('images', file));

      if (id) {
        if (images.length) {
          payload.append('replaceImages', 'true');
        }
        await adminApi.updateProduct(id, payload);
      } else {
        await adminApi.createProduct(payload);
      }

      navigate('/admin-dashboard');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900">{id ? 'Edit Product' : 'Add Product'}</h1>
          <p className="mt-2 text-sm text-slate-500">Admin can assign the product to any farmer and upload fresh images.</p>
        </div>
        <Link to="/admin-dashboard" className="btn-secondary">Back</Link>
      </div>

      <form onSubmit={submitHandler} className="card grid gap-4 md:grid-cols-2">
        <select className="input" value={formData.farmerId} onChange={(event) => handleChange('farmerId', event.target.value)} required>
          <option value="">Select Farmer</option>
          {farmers.map((farmer) => (
            <option key={farmer._id} value={farmer._id}>{farmer.name} • {farmer.location}</option>
          ))}
        </select>
        <input className="input" placeholder="Product Name" value={formData.name} onChange={(event) => handleChange('name', event.target.value)} required />
        <select className="input" value={formData.category} onChange={(event) => handleChange('category', event.target.value)}>
          {CATEGORY_OPTIONS.map((category) => <option key={category} value={category}>{category}</option>)}
        </select>
        <select className="input" value={formData.unit} onChange={(event) => handleChange('unit', event.target.value)}>
          {UNIT_OPTIONS.map((unit) => <option key={unit} value={unit}>{unit}</option>)}
        </select>
        <input className="input" type="number" min="0" step="0.01" placeholder="Price" value={formData.price} onChange={(event) => handleChange('price', event.target.value)} required />
        <input className="input" type="number" min="0" step="0.01" placeholder="Bulk Price" value={formData.bulkPrice} onChange={(event) => handleChange('bulkPrice', event.target.value)} />
        <input className="input" type="number" min="0" step="0.01" placeholder="Min Bulk Qty" value={formData.minBulkQty} onChange={(event) => handleChange('minBulkQty', event.target.value)} />
        <input className="input" type="number" min="0" step="0.01" placeholder="Quantity" value={formData.quantity} onChange={(event) => handleChange('quantity', event.target.value)} required />
        <input className="input" type="text" placeholder="Location" value={formData.location} onChange={(event) => handleChange('location', event.target.value)} />
        <input className="input" type="date" value={formData.harvestDate} onChange={(event) => handleChange('harvestDate', event.target.value)} />
        <label className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 md:col-span-2">
          <input type="checkbox" checked={formData.isOrganic} onChange={(event) => handleChange('isOrganic', event.target.checked)} />
          Mark as organic
        </label>
        <textarea className="input min-h-32 md:col-span-2" placeholder="Description" value={formData.description} onChange={(event) => handleChange('description', event.target.value)} required />
        <div className="md:col-span-2">
          <input className="input" type="file" multiple accept="image/*" onChange={(event) => setImages(event.target.files)} />
          <p className="mt-2 text-xs text-slate-500">Upload up to 5 images. On edit, new uploads replace old images.</p>
        </div>

        {!!existingImages.length && !images.length && (
          <div className="md:col-span-2">
            <p className="mb-3 text-sm font-semibold text-slate-700">Current Images</p>
            <div className="grid gap-3 sm:grid-cols-3">
              {existingImages.map((image, index) => (
                <img key={`${image.url}-${index}`} src={image.url} alt="Product" className="h-32 w-full rounded-2xl object-cover" />
              ))}
            </div>
          </div>
        )}

        {!!imagePreviews.length && (
          <div className="md:col-span-2">
            <p className="mb-3 text-sm font-semibold text-slate-700">New Images Preview</p>
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

export default AdminProductFormPage;

import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { productApi } from '../api/agroApi';

const initialState = {
  name: '',
  description: '',
  category: 'Vegetables',
  price: '',
  bulkPrice: '',
  minBulkQty: '',
  unit: 'kg',
  quantity: ''
};

const FarmerProductFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState(initialState);
  const [images, setImages] = useState([]);

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
        quantity: product.quantity
      });
    });
  }, [id]);

  const submitHandler = async (event) => {
    event.preventDefault();
    const payload = new FormData();
    Object.entries(formData).forEach(([key, value]) => payload.append(key, value));
    Array.from(images).forEach((file) => payload.append('images', file));

    if (id) {
      await productApi.update(id, payload);
    } else {
      await productApi.create(payload);
    }

    navigate('/dashboard/farmer');
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <form onSubmit={submitHandler} className="card grid gap-4 md:grid-cols-2">
        <div className="md:col-span-2"><h1 className="text-3xl font-black text-slate-900">{id ? 'Edit Product' : 'Add Product'}</h1></div>
        <input className="input" placeholder="Product Name" value={formData.name} onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))} required />
        <select className="input" value={formData.category} onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))}>{['Vegetables', 'Fruits', 'Grains', 'Dairy', 'Spices', 'Other'].map((category) => <option key={category}>{category}</option>)}</select>
        <input className="input" type="number" placeholder="Price" value={formData.price} onChange={(e) => setFormData((prev) => ({ ...prev, price: e.target.value }))} required />
        <input className="input" type="number" placeholder="Bulk Price" value={formData.bulkPrice} onChange={(e) => setFormData((prev) => ({ ...prev, bulkPrice: e.target.value }))} />
        <input className="input" type="number" placeholder="Min Bulk Qty" value={formData.minBulkQty} onChange={(e) => setFormData((prev) => ({ ...prev, minBulkQty: e.target.value }))} />
        <select className="input" value={formData.unit} onChange={(e) => setFormData((prev) => ({ ...prev, unit: e.target.value }))}>{['kg', 'gram', 'litre', 'dozen', 'piece'].map((unit) => <option key={unit}>{unit}</option>)}</select>
        <input className="input" type="number" placeholder="Quantity" value={formData.quantity} onChange={(e) => setFormData((prev) => ({ ...prev, quantity: e.target.value }))} required />
        <textarea className="input min-h-32 md:col-span-2" placeholder="Description" value={formData.description} onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))} required />
        <input className="input md:col-span-2" type="file" multiple accept="image/*" onChange={(e) => setImages(e.target.files)} />
        <button type="submit" className="btn-primary md:col-span-2">{id ? 'Update Product' : 'Create Product'}</button>
      </form>
    </div>
  );
};

export default FarmerProductFormPage;

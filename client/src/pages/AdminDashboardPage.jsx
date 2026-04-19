import { useEffect, useMemo, useState } from 'react';
import { adminApi } from '../api/agroApi';

const CATEGORY_OPTIONS = ['All', 'Vegetables', 'Fruits', 'Grains', 'Spices', 'Dairy', 'Organic'];
const UNIT_OPTIONS = ['kg', 'gram', 'litre', 'piece'];
const PAGE_SIZE = 6;

const initialFormState = {
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
  isOrganic: false,
  isFeatured: false
};

const toDateInput = (value) => (value ? String(value).slice(0, 10) : '');

const ProductModal = ({
  open,
  onClose,
  onSubmit,
  farmers,
  formData,
  setFormData,
  existingImages,
  removeExistingImage,
  newImages,
  addImages,
  removeNewImage,
  saving,
  editingProductId
}) => {
  const newImagePreviews = useMemo(
    () => newImages.map((file) => ({ file, preview: URL.createObjectURL(file) })),
    [newImages]
  );

  useEffect(() => () => newImagePreviews.forEach(({ preview }) => URL.revokeObjectURL(preview)), [newImagePreviews]);

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 py-8">
      <div className="max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-[2rem] bg-white p-6 shadow-2xl">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-3xl font-black text-slate-900">{editingProductId ? 'Edit Product' : 'Add Product'}</h2>
            <p className="mt-2 text-sm text-slate-500">Manage farmer assignment, featured placement, stock, and product images without leaving the dashboard.</p>
          </div>
          <button type="button" className="btn-secondary" onClick={onClose}>Close</button>
        </div>

        <form onSubmit={onSubmit} className="grid gap-4 md:grid-cols-2">
          <select className="input" value={formData.farmerId} onChange={(event) => setFormData((prev) => ({ ...prev, farmerId: event.target.value }))} required>
            <option value="">Select Farmer</option>
            {farmers.map((farmer) => (
              <option key={farmer._id} value={farmer._id}>{farmer.name} • {farmer.location}</option>
            ))}
          </select>
          <input className="input" placeholder="Product Name" value={formData.name} onChange={(event) => setFormData((prev) => ({ ...prev, name: event.target.value }))} required />
          <select className="input" value={formData.category} onChange={(event) => setFormData((prev) => ({ ...prev, category: event.target.value }))}>
            {CATEGORY_OPTIONS.filter((category) => category !== 'All').map((category) => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
          <select className="input" value={formData.unit} onChange={(event) => setFormData((prev) => ({ ...prev, unit: event.target.value }))}>
            {UNIT_OPTIONS.map((unit) => <option key={unit} value={unit}>{unit}</option>)}
          </select>
          <input className="input" type="number" min="0" step="0.01" placeholder="Price" value={formData.price} onChange={(event) => setFormData((prev) => ({ ...prev, price: event.target.value }))} required />
          <input className="input" type="number" min="0" step="0.01" placeholder="Bulk Price" value={formData.bulkPrice} onChange={(event) => setFormData((prev) => ({ ...prev, bulkPrice: event.target.value }))} />
          <input className="input" type="number" min="0" step="0.01" placeholder="Min Bulk Qty" value={formData.minBulkQty} onChange={(event) => setFormData((prev) => ({ ...prev, minBulkQty: event.target.value }))} />
          <input className="input" type="number" min="0" step="0.01" placeholder="Quantity" value={formData.quantity} onChange={(event) => setFormData((prev) => ({ ...prev, quantity: event.target.value }))} required />
          <input className="input" type="text" placeholder="Location" value={formData.location} onChange={(event) => setFormData((prev) => ({ ...prev, location: event.target.value }))} />
          <input className="input" type="date" value={formData.harvestDate} onChange={(event) => setFormData((prev) => ({ ...prev, harvestDate: event.target.value }))} />

          <label className="flex items-center gap-3 rounded-2xl border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700">
            <input type="checkbox" checked={formData.isOrganic} onChange={(event) => setFormData((prev) => ({ ...prev, isOrganic: event.target.checked }))} />
            Organic Product
          </label>
          <label className="flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-900">
            <input type="checkbox" checked={formData.isFeatured} onChange={(event) => setFormData((prev) => ({ ...prev, isFeatured: event.target.checked }))} />
            Featured Product
          </label>

          <textarea className="input min-h-32 md:col-span-2" placeholder="Description" value={formData.description} onChange={(event) => setFormData((prev) => ({ ...prev, description: event.target.value }))} required />

          <div className="md:col-span-2 rounded-3xl border border-slate-200 p-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Images</h3>
                <p className="text-xs text-slate-500">Keep, remove, or add images. Maximum 5 images per product.</p>
              </div>
              <label className="btn-secondary cursor-pointer">
                Add Images
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  className="hidden"
                  onChange={(event) => addImages(Array.from(event.target.files || []))}
                />
              </label>
            </div>

            {!!existingImages.length && (
              <div className="mt-4">
                <p className="mb-3 text-sm font-semibold text-slate-700">Current Images</p>
                <div className="grid gap-3 sm:grid-cols-3">
                  {existingImages.map((image) => (
                    <div key={image.url} className="overflow-hidden rounded-2xl border border-slate-200">
                      <img src={image.url} alt="Current product" className="h-32 w-full object-cover" />
                      <button type="button" className="w-full border-t border-slate-200 px-3 py-2 text-sm font-semibold text-rose-600" onClick={() => removeExistingImage(image.url)}>
                        Remove Image
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {!!newImagePreviews.length && (
              <div className="mt-4">
                <p className="mb-3 text-sm font-semibold text-slate-700">New Uploads</p>
                <div className="grid gap-3 sm:grid-cols-3">
                  {newImagePreviews.map(({ file, preview }) => (
                    <div key={`${file.name}-${file.lastModified}`} className="overflow-hidden rounded-2xl border border-slate-200">
                      <img src={preview} alt={file.name} className="h-32 w-full object-cover" />
                      <button type="button" className="w-full border-t border-slate-200 px-3 py-2 text-sm font-semibold text-rose-600" onClick={() => removeNewImage(file)}>
                        Remove Upload
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="md:col-span-2 flex justify-end gap-3">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={saving}>{saving ? 'Saving...' : editingProductId ? 'Update Product' : 'Create Product'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const AdminDashboardPage = () => {
  const [analytics, setAnalytics] = useState(null);
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [busyProductId, setBusyProductId] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState('');
  const [formData, setFormData] = useState(initialFormState);
  const [existingImages, setExistingImages] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [featuredFilter, setFeaturedFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);

  const farmers = useMemo(
    () => users.filter((user) => user.role === 'farmer'),
    [users]
  );

  const loadData = async () => {
    const [analyticsRes, usersRes, ordersRes, productsRes] = await Promise.all([
      adminApi.analytics(),
      adminApi.users(),
      adminApi.orders(),
      adminApi.products()
    ]);

    setAnalytics(analyticsRes.data.data);
    setUsers(usersRes.data.data.users);
    setOrders(ordersRes.data.data.orders);
    setProducts(productsRes.data.data.products);
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();

    return products.filter((product) => {
      const matchesSearch = !query || [
        product.name,
        product.description,
        product.location,
        product.farmerId?.name,
        product.farmerId?.businessName
      ].some((value) => String(value || '').toLowerCase().includes(query));

      const matchesCategory = categoryFilter === 'All' || product.category === categoryFilter;
      const matchesFeatured = featuredFilter === 'all'
        || (featuredFilter === 'featured' && product.isFeatured)
        || (featuredFilter === 'standard' && !product.isFeatured);

      return matchesSearch && matchesCategory && matchesFeatured;
    });
  }, [products, search, categoryFilter, featuredFilter]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, categoryFilter, featuredFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PAGE_SIZE));
  const paginatedProducts = filteredProducts.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const resetModal = () => {
    setModalOpen(false);
    setEditingProductId('');
    setFormData(initialFormState);
    setExistingImages([]);
    setNewImages([]);
    setSaving(false);
  };

  const openCreateModal = () => {
    setEditingProductId('');
    setFormData(initialFormState);
    setExistingImages([]);
    setNewImages([]);
    setModalOpen(true);
  };

  const openEditModal = (product) => {
    setEditingProductId(product._id);
    setFormData({
      farmerId: product.farmerId?._id || '',
      name: product.name,
      description: product.description,
      category: product.category,
      price: String(product.price ?? ''),
      bulkPrice: String(product.bulkPrice ?? ''),
      minBulkQty: String(product.minBulkQty ?? ''),
      unit: product.unit,
      quantity: String(product.quantity ?? ''),
      location: product.location || '',
      harvestDate: toDateInput(product.harvestDate),
      isOrganic: Boolean(product.isOrganic),
      isFeatured: Boolean(product.isFeatured)
    });
    setExistingImages(product.images || []);
    setNewImages([]);
    setModalOpen(true);
  };

  const deleteProduct = async (productId) => {
    if (!window.confirm('Delete this product?')) {
      return;
    }

    setBusyProductId(productId);
    try {
      await adminApi.deleteProduct(productId);
      await loadData();
    } finally {
      setBusyProductId('');
    }
  };

  const toggleFeatured = async (product) => {
    setBusyProductId(product._id);
    try {
      const payload = new FormData();
      payload.append('isFeatured', String(!product.isFeatured));
      await adminApi.updateProduct(product._id, payload);
      await loadData();
    } finally {
      setBusyProductId('');
    }
  };

  const addImages = (files) => {
    const remainingSlots = Math.max(0, 5 - existingImages.length - newImages.length);
    setNewImages((prev) => [...prev, ...files.slice(0, remainingSlots)]);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);

    try {
      const payload = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        payload.append(key, typeof value === 'boolean' ? String(value) : value);
      });
      payload.append('retainedImages', JSON.stringify(existingImages.map((image) => image.url)));
      newImages.forEach((file) => payload.append('images', file));

      if (editingProductId) {
        await adminApi.updateProduct(editingProductId, payload);
      } else {
        await adminApi.createProduct(payload);
      }

      await loadData();
      resetModal();
    } finally {
      setSaving(false);
    }
  };

  if (!analytics) return <div className="mx-auto max-w-6xl px-4 py-20">Loading admin dashboard...</div>;

  return (
    <>
      <ProductModal
        open={modalOpen}
        onClose={resetModal}
        onSubmit={handleSubmit}
        farmers={farmers}
        formData={formData}
        setFormData={setFormData}
        existingImages={existingImages}
        removeExistingImage={(url) => setExistingImages((prev) => prev.filter((image) => image.url !== url))}
        newImages={newImages}
        addImages={addImages}
        removeNewImage={(file) => setNewImages((prev) => prev.filter((item) => !(item.name === file.name && item.lastModified === file.lastModified)))}
        saving={saving}
        editingProductId={editingProductId}
      />

      <div className="mx-auto max-w-7xl space-y-10 px-4 py-12">
        <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-6">
          {Object.entries(analytics).map(([key, value]) => (
            <div key={key} className="card">
              <p className="text-sm capitalize text-slate-500">{key}</p>
              <h2 className="mt-3 text-3xl font-black text-moss">{value}</h2>
            </div>
          ))}
        </div>

        <section className="card space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-black text-slate-900">Products</h2>
              <p className="text-sm text-slate-500">Filter, feature, paginate, and edit products inline with image-level controls.</p>
            </div>
            <button type="button" className="btn-primary" onClick={openCreateModal}>Add Product</button>
          </div>

          <div className="grid gap-3 lg:grid-cols-[1.5fr_1fr_1fr]">
            <input className="input" placeholder="Search by product, farmer, or location" value={search} onChange={(event) => setSearch(event.target.value)} />
            <select className="input" value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)}>
              {CATEGORY_OPTIONS.map((category) => <option key={category} value={category}>{category}</option>)}
            </select>
            <select className="input" value={featuredFilter} onChange={(event) => setFeaturedFilter(event.target.value)}>
              <option value="all">All Products</option>
              <option value="featured">Featured Only</option>
              <option value="standard">Standard Only</option>
            </select>
          </div>

          <div className="flex items-center justify-between text-sm text-slate-500">
            <p>{filteredProducts.length} matching products</p>
            <p>Page {currentPage} of {totalPages}</p>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            {paginatedProducts.map((product) => (
              <div key={product._id} className="rounded-3xl border border-slate-100 p-4">
                <div className="flex gap-4">
                  <img
                    src={product.images?.[0]?.url || product.imageUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=500&q=80'}
                    alt={product.name}
                    className="h-24 w-24 rounded-2xl object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-lg font-bold text-slate-900">{product.name}</h3>
                          {product.isFeatured && <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">Featured</span>}
                        </div>
                        <p className="text-sm text-slate-500">{product.category} • {product.quantity} {product.unit} • ₹{product.price}</p>
                        <p className="mt-1 text-sm text-slate-500">Farmer: {product.farmerId?.name || 'Unknown'} • {product.location}</p>
                      </div>
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                        {product.isAvailable ? 'Available' : 'Out of stock'}
                      </span>
                    </div>
                    {!!product.images?.length && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {product.images.slice(0, 4).map((image) => (
                          <img key={image.url} src={image.url} alt={product.name} className="h-12 w-12 rounded-xl object-cover" />
                        ))}
                      </div>
                    )}
                    <p className="mt-3 line-clamp-2 text-sm text-slate-600">{product.description}</p>
                    <div className="mt-4 flex flex-wrap gap-3">
                      <button type="button" className="btn-secondary" onClick={() => openEditModal(product)}>Edit</button>
                      <button
                        type="button"
                        className="rounded-full border border-amber-200 px-4 py-2 text-sm font-semibold text-amber-700 transition hover:bg-amber-50"
                        onClick={() => toggleFeatured(product)}
                        disabled={busyProductId === product._id}
                      >
                        {busyProductId === product._id ? 'Updating...' : product.isFeatured ? 'Unfeature' : 'Feature'}
                      </button>
                      <button
                        type="button"
                        className="rounded-full border border-rose-200 px-4 py-2 text-sm font-semibold text-rose-600 transition hover:bg-rose-50"
                        onClick={() => deleteProduct(product._id)}
                        disabled={busyProductId === product._id}
                      >
                        {busyProductId === product._id ? 'Removing...' : 'Delete'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="rounded-3xl border border-dashed border-slate-200 px-6 py-12 text-center text-slate-500">
              No products match the current filters.
            </div>
          )}

          <div className="flex justify-end gap-3">
            <button type="button" className="btn-secondary" disabled={currentPage <= 1} onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}>Previous</button>
            <button type="button" className="btn-secondary" disabled={currentPage >= totalPages} onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}>Next</button>
          </div>
        </section>

        <section className="card space-y-4">
          <h2 className="text-2xl font-black text-slate-900">Users</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left text-slate-500">
                  <th className="py-3">Name</th>
                  <th className="py-3">Role</th>
                  <th className="py-3">Verified</th>
                  <th className="py-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user._id} className="border-b border-slate-50">
                    <td className="py-3">{user.businessName || user.name}</td>
                    <td className="py-3">{user.role}</td>
                    <td className="py-3">{user.isVerified ? 'Yes' : 'No'}</td>
                    <td className="py-3">
                      {user.role === 'farmer' && (
                        <button
                          type="button"
                          className="font-semibold text-leaf"
                          onClick={async () => {
                            await adminApi.verifyFarmer(user._id, { isVerified: !user.isVerified });
                            loadData();
                          }}
                        >
                          {user.isVerified ? 'Unverify' : 'Verify'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="card space-y-4">
          <h2 className="text-2xl font-black text-slate-900">Orders</h2>
          {orders.map((order) => (
            <div key={order._id} className="rounded-2xl border border-slate-100 p-4 text-sm text-slate-600">
              #{order._id.slice(-8)} • {order.orderType} • ₹{order.totalAmount} • {order.status}
            </div>
          ))}
        </section>
      </div>
    </>
  );
};

export default AdminDashboardPage;

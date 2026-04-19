import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../api/agroApi';

const AdminDashboardPage = () => {
  const [analytics, setAnalytics] = useState(null);
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [busyProductId, setBusyProductId] = useState('');

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

  if (!analytics) return <div className="mx-auto max-w-6xl px-4 py-20">Loading admin dashboard...</div>;

  return (
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
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black text-slate-900">Products</h2>
            <p className="text-sm text-slate-500">Admin can add, edit, remove, and reassign products with images.</p>
          </div>
          <Link to="/admin-dashboard/products/add" className="btn-primary">Add Product</Link>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          {products.map((product) => (
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
                      <h3 className="text-lg font-bold text-slate-900">{product.name}</h3>
                      <p className="text-sm text-slate-500">{product.category} • {product.quantity} {product.unit} • ₹{product.price}</p>
                      <p className="mt-1 text-sm text-slate-500">Farmer: {product.farmerId?.name || 'Unknown'} • {product.location}</p>
                    </div>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                      {product.isAvailable ? 'Available' : 'Out of stock'}
                    </span>
                  </div>
                  <p className="mt-3 line-clamp-2 text-sm text-slate-600">{product.description}</p>
                  <div className="mt-4 flex gap-3">
                    <Link to={`/admin-dashboard/products/edit/${product._id}`} className="btn-secondary">Edit</Link>
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
  );
};

export default AdminDashboardPage;

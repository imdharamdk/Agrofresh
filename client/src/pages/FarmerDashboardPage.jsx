import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { orderApi, productApi } from '../api/agroApi';
import OrderCard from '../components/OrderCard';

const FarmerDashboardPage = () => {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);

  const loadData = async () => {
    const [productsRes, ordersRes] = await Promise.all([productApi.myProducts(), orderApi.farmerOrders()]);
    setProducts(productsRes.data.data.products);
    setOrders(ordersRes.data.data.orders);
  };

  useEffect(() => { loadData(); }, []);

  const stats = useMemo(() => ({
    totalProducts: products.length,
    totalOrders: orders.length,
    pendingOrders: orders.filter((order) => order.status === 'pending').length
  }), [products, orders]);

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-8 md:py-12">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 md:gap-4">
        <div className="card p-4 md:p-6">
          <p className="text-xs text-slate-500 md:text-sm">Products</p>
          <h2 className="mt-2 text-3xl font-black text-moss md:text-4xl">{stats.totalProducts}</h2>
        </div>
        <div className="card p-4 md:p-6">
          <p className="text-xs text-slate-500 md:text-sm">Orders</p>
          <h2 className="mt-2 text-3xl font-black text-moss md:text-4xl">{stats.totalOrders}</h2>
        </div>
        <div className="card p-4 md:p-6">
          <p className="text-xs text-slate-500 md:text-sm">Pending</p>
          <h2 className="mt-2 text-3xl font-black text-amber-600 md:text-4xl">{stats.pendingOrders}</h2>
        </div>
      </div>

      {/* Products */}
      <section className="card space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-xl font-black text-slate-900 md:text-2xl">My Products</h2>
          <Link to="/dashboard/farmer/products/add" className="btn-primary py-2 text-sm">+ Add</Link>
        </div>

        {products.length === 0 ? (
          <p className="text-sm text-slate-500">No products yet.</p>
        ) : (
          <>
            {/* Mobile: card list */}
            <div className="space-y-3 md:hidden">
              {products.map((product) => (
                <div key={product._id} className="rounded-2xl border border-slate-100 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-slate-900">{product.name}</p>
                      <p className="mt-1 text-sm text-slate-500">₹{product.price}/{product.unit} · Stock: {product.quantity}</p>
                      {product.minBulkQty > 0 && (
                        <p className="text-xs text-blue-600">Bulk: ₹{product.bulkPrice} from {product.minBulkQty}</p>
                      )}
                    </div>
                    <Link className="text-sm font-semibold text-leaf shrink-0" to={`/dashboard/farmer/products/edit/${product._id}`}>Edit</Link>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop: table */}
            <div className="hidden overflow-x-auto md:block">
              <table className="min-w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-500">
                    <th className="py-3 pr-4">Product</th>
                    <th className="py-3 pr-4">Price</th>
                    <th className="py-3 pr-4">Bulk</th>
                    <th className="py-3 pr-4">Stock</th>
                    <th className="py-3">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product._id} className="border-b border-slate-50">
                      <td className="py-3 pr-4 font-semibold text-slate-900">{product.name}</td>
                      <td className="py-3 pr-4">₹{product.price}/{product.unit}</td>
                      <td className="py-3 pr-4">{product.minBulkQty ? `₹${product.bulkPrice} from ${product.minBulkQty}` : 'N/A'}</td>
                      <td className="py-3 pr-4">{product.quantity}</td>
                      <td className="py-3">
                        <Link className="font-semibold text-leaf" to={`/dashboard/farmer/products/edit/${product._id}`}>Edit</Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </section>

      {/* Orders */}
      <section className="space-y-4">
        <h2 className="text-xl font-black text-slate-900 md:text-2xl">Incoming Orders</h2>
        {orders.length === 0 && <p className="text-sm text-slate-500">No orders yet.</p>}
        <div className="grid gap-5 lg:grid-cols-2">
          {orders.map((order) => (
            <OrderCard key={order._id} order={order}>
              <select
                className="input mt-4 text-sm"
                value={order.status}
                onChange={async (e) => { await orderApi.updateStatus(order._id, { status: e.target.value }); loadData(); }}
              >
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </OrderCard>
          ))}
        </div>
      </section>
    </div>
  );
};

export default FarmerDashboardPage;

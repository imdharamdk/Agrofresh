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
    <div className="mx-auto max-w-7xl space-y-10 px-4 py-12">
      <div className="grid gap-4 md:grid-cols-3">
        <div className="card"><p className="text-sm text-slate-500">Total Products</p><h2 className="mt-3 text-4xl font-black text-moss">{stats.totalProducts}</h2></div>
        <div className="card"><p className="text-sm text-slate-500">Total Orders</p><h2 className="mt-3 text-4xl font-black text-moss">{stats.totalOrders}</h2></div>
        <div className="card"><p className="text-sm text-slate-500">Pending Orders</p><h2 className="mt-3 text-4xl font-black text-moss">{stats.pendingOrders}</h2></div>
      </div>

      <section className="card space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-black text-slate-900">My Products</h2>
          <Link to="/dashboard/farmer/products/add" className="btn-primary">Add Product</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-slate-500">
                <th className="py-3">Product</th>
                <th className="py-3">Price</th>
                <th className="py-3">Bulk</th>
                <th className="py-3">Stock</th>
                <th className="py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product._id} className="border-b border-slate-50">
                  <td className="py-3 font-semibold text-slate-900">{product.name}</td>
                  <td className="py-3">₹{product.price}/{product.unit}</td>
                  <td className="py-3">{product.minBulkQty ? `₹${product.bulkPrice} from ${product.minBulkQty}` : 'N/A'}</td>
                  <td className="py-3">{product.quantity}</td>
                  <td className="py-3"><Link className="font-semibold text-leaf" to={`/dashboard/farmer/products/edit/${product._id}`}>Edit</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-black text-slate-900">Incoming Orders</h2>
        <div className="grid gap-6 lg:grid-cols-2">
          {orders.map((order) => (
            <OrderCard key={order._id} order={order}>
              <select className="input mt-4" value={order.status} onChange={async (e) => { await orderApi.updateStatus(order._id, { status: e.target.value }); loadData(); }}>
                <option value="pending">pending</option>
                <option value="confirmed">confirmed</option>
                <option value="cancelled">cancelled</option>
              </select>
            </OrderCard>
          ))}
        </div>
      </section>
    </div>
  );
};

export default FarmerDashboardPage;

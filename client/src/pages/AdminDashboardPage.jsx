import { useEffect, useState } from 'react';
import { adminApi } from '../api/agroApi';

const AdminDashboardPage = () => {
  const [analytics, setAnalytics] = useState(null);
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);

  const loadData = async () => {
    const [analyticsRes, usersRes, ordersRes] = await Promise.all([adminApi.analytics(), adminApi.users(), adminApi.orders()]);
    setAnalytics(analyticsRes.data.data);
    setUsers(usersRes.data.data.users);
    setOrders(ordersRes.data.data.orders);
  };

  useEffect(() => { loadData(); }, []);

  if (!analytics) return <div className="mx-auto max-w-6xl px-4 py-20">Loading admin dashboard...</div>;

  return (
    <div className="mx-auto max-w-7xl space-y-10 px-4 py-12">
      <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-6">
        {Object.entries(analytics).map(([key, value]) => <div key={key} className="card"><p className="text-sm capitalize text-slate-500">{key}</p><h2 className="mt-3 text-3xl font-black text-moss">{value}</h2></div>)}
      </div>
      <section className="card space-y-4">
        <h2 className="text-2xl font-black text-slate-900">Users</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead><tr className="border-b border-slate-100 text-left text-slate-500"><th className="py-3">Name</th><th className="py-3">Role</th><th className="py-3">Verified</th><th className="py-3">Action</th></tr></thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id} className="border-b border-slate-50">
                  <td className="py-3">{user.businessName || user.name}</td>
                  <td className="py-3">{user.role}</td>
                  <td className="py-3">{user.isVerified ? 'Yes' : 'No'}</td>
                  <td className="py-3">{user.role === 'farmer' && <button type="button" className="font-semibold text-leaf" onClick={async () => { await adminApi.verifyFarmer(user._id, { isVerified: !user.isVerified }); loadData(); }}>{user.isVerified ? 'Unverify' : 'Verify'}</button>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <section className="card space-y-4">
        <h2 className="text-2xl font-black text-slate-900">Orders</h2>
        {orders.map((order) => <div key={order._id} className="rounded-2xl border border-slate-100 p-4 text-sm text-slate-600">#{order._id.slice(-8)} • {order.orderType} • ₹{order.totalAmount} • {order.status}</div>)}
      </section>
    </div>
  );
};

export default AdminDashboardPage;

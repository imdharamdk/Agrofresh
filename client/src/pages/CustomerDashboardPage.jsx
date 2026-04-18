import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { orderApi } from '../api/agroApi';
import OrderCard from '../components/OrderCard';

const CustomerDashboardPage = () => {
  const [searchParams] = useSearchParams();
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    orderApi.myOrders().then(({ data }) => setOrders(data.data.orders));
  }, []);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      {searchParams.get('success') && <div className="mb-6 rounded-2xl bg-green-50 p-4 text-green-700">Order placed successfully.</div>}
      <h1 className="mb-8 text-3xl font-black text-slate-900">My Orders</h1>
      <div className="grid gap-6 lg:grid-cols-2">
        {orders.map((order) => <OrderCard key={order._id} order={order} />)}
      </div>
    </div>
  );
};

export default CustomerDashboardPage;

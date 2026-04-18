import { useEffect, useState } from 'react';
import { deliveryApi } from '../api/agroApi';
import OrderCard from '../components/OrderCard';

const DeliveryDashboardPage = () => {
  const [orders, setOrders] = useState([]);

  const loadOrders = () => deliveryApi.orders().then(({ data }) => setOrders(data.data.orders));
  useEffect(() => { loadOrders(); }, []);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="mb-8 text-3xl font-black text-slate-900">Assigned Orders</h1>
      <div className="grid gap-6 lg:grid-cols-2">
        {orders.map((order) => (
          <OrderCard key={order._id} order={order}>
            <select className="input mt-4" value={order.deliveryStatus} onChange={async (e) => { await deliveryApi.updateStatus(order._id, { deliveryStatus: e.target.value }); loadOrders(); }}>
              <option value="assigned">assigned</option>
              <option value="picked_up">picked_up</option>
              <option value="in_transit">in_transit</option>
              <option value="delivered">delivered</option>
            </select>
          </OrderCard>
        ))}
      </div>
    </div>
  );
};

export default DeliveryDashboardPage;

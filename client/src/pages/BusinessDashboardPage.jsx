import { useEffect, useMemo, useState } from 'react';
import { io } from 'socket.io-client';
import { negotiationApi, orderApi, productApi, subscriptionApi } from '../api/agroApi';
import OrderCard from '../components/OrderCard';

const socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000', {
  autoConnect: false,
  withCredentials: true
});

const BusinessDashboardPage = () => {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [negotiations, setNegotiations] = useState([]);
  const [selectedNegotiation, setSelectedNegotiation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');
  const [proposal, setProposal] = useState({ productId: '', requestedQty: '', requestedPrice: '', notes: '' });

  const loadData = async () => {
    const [productsRes, ordersRes, negotiationsRes] = await Promise.all([
      productApi.list({ limit: 12, bulkAvailable: true }),
      orderApi.myOrders(),
      negotiationApi.mine()
    ]);
    setProducts(productsRes.data.data.products);
    setOrders(ordersRes.data.data.orders);
    setNegotiations(negotiationsRes.data.data.negotiations);
  };

  useEffect(() => { loadData(); }, []);

  useEffect(() => {
    socket.connect();
    socket.on('new-message', (payload) => setMessages((prev) => [...prev, payload]));
    return () => {
      socket.off('new-message');
      socket.disconnect();
    };
  }, []);

  const openNegotiation = async (id) => {
    const { data } = await negotiationApi.get(id);
    setSelectedNegotiation(data.data.negotiation);
    setMessages(data.data.messages);
    socket.emit('join-negotiation', { negotiationId: id });
  };

  const submitNegotiation = async (event) => {
    event.preventDefault();
    await negotiationApi.create(proposal);
    setProposal({ productId: '', requestedQty: '', requestedPrice: '', notes: '' });
    loadData();
  };

  const sendMessage = () => {
    if (!selectedNegotiation || !message.trim()) return;
    socket.emit('send-message', { negotiationId: selectedNegotiation._id, message });
    setMessage('');
  };

  const stats = useMemo(() => ({ bulkProducts: products.length, negotiations: negotiations.length, b2bOrders: orders.filter((order) => order.orderType === 'B2B').length }), [products, negotiations, orders]);

  return (
    <div className="mx-auto max-w-7xl space-y-10 px-4 py-12">
      <div className="grid gap-4 md:grid-cols-3">
        <div className="card"><p className="text-sm text-slate-500">Bulk-ready Products</p><h2 className="mt-3 text-4xl font-black text-moss">{stats.bulkProducts}</h2></div>
        <div className="card"><p className="text-sm text-slate-500">Open Negotiations</p><h2 className="mt-3 text-4xl font-black text-moss">{stats.negotiations}</h2></div>
        <div className="card"><p className="text-sm text-slate-500">B2B Orders</p><h2 className="mt-3 text-4xl font-black text-moss">{stats.b2bOrders}</h2></div>
      </div>

      <section className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
        <form onSubmit={submitNegotiation} className="card space-y-4">
          <h2 className="text-2xl font-black text-slate-900">Create Bulk Proposal</h2>
          <select className="input" value={proposal.productId} onChange={(e) => setProposal((prev) => ({ ...prev, productId: e.target.value }))} required>
            <option value="">Select Product</option>
            {products.map((product) => <option key={product._id} value={product._id}>{product.name} • ₹{product.bulkPrice || product.price}</option>)}
          </select>
          <input className="input" type="number" placeholder="Requested Qty" value={proposal.requestedQty} onChange={(e) => setProposal((prev) => ({ ...prev, requestedQty: e.target.value }))} required />
          <input className="input" type="number" placeholder="Requested Price" value={proposal.requestedPrice} onChange={(e) => setProposal((prev) => ({ ...prev, requestedPrice: e.target.value }))} required />
          <textarea className="input min-h-28" placeholder="Negotiation notes" value={proposal.notes} onChange={(e) => setProposal((prev) => ({ ...prev, notes: e.target.value }))} />
          <div className="flex gap-3">
            <button type="submit" className="btn-primary flex-1">Send Proposal</button>
            <button type="button" className="btn-secondary" onClick={() => subscriptionApi.create({ plan: 'growth' })}>Upgrade</button>
          </div>
        </form>

        <div className="card grid gap-6 lg:grid-cols-[0.75fr_1.25fr]">
          <div className="space-y-3">
            <h2 className="text-2xl font-black text-slate-900">Negotiations</h2>
            {negotiations.map((item) => (
              <button key={item._id} type="button" className="w-full rounded-2xl border border-slate-100 p-4 text-left hover:bg-slate-50" onClick={() => openNegotiation(item._id)}>
                <p className="font-semibold text-slate-900">{item.productId?.name}</p>
                <p className="text-sm text-slate-500">Qty {item.requestedQty} • Offer ₹{item.latestOfferPrice}</p>
                <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-leaf">{item.status}</p>
              </button>
            ))}
          </div>
          <div className="rounded-3xl bg-slate-900 p-5 text-white">
            <h3 className="text-xl font-bold">Negotiation Chat</h3>
            <div className="mt-4 h-80 space-y-3 overflow-y-auto rounded-2xl bg-slate-950/60 p-4">
              {messages.map((item) => <div key={item._id} className="rounded-2xl bg-white/10 p-3 text-sm"><p className="font-semibold">{item.senderId?.businessName || item.senderId?.name}</p><p className="mt-1">{item.message}</p></div>)}
            </div>
            <div className="mt-4 flex gap-3">
              <input className="input bg-white text-slate-900" placeholder="Type message" value={message} onChange={(e) => setMessage(e.target.value)} />
              <button type="button" className="btn-primary" onClick={sendMessage}>Send</button>
            </div>
          </div>
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-2xl font-black text-slate-900">Bulk Orders</h2>
        <div className="grid gap-6 lg:grid-cols-2">{orders.map((order) => <OrderCard key={order._id} order={order} />)}</div>
      </section>
    </div>
  );
};

export default BusinessDashboardPage;

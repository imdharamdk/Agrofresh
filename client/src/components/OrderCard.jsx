const statusClassMap = {
  pending: 'bg-amber-100 text-amber-700',
  confirmed: 'bg-blue-100 text-blue-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700'
};

const OrderCard = ({ order, children }) => {
  return (
    <div className="card space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Order</p>
          <h3 className="text-lg font-bold text-slate-900">#{order._id.slice(-8).toUpperCase()}</h3>
          <p className="text-sm text-slate-500">{new Date(order.createdAt).toLocaleString()}</p>
        </div>
        <div className="flex gap-2">
          <span className={`rounded-full px-3 py-1 text-sm font-semibold ${statusClassMap[order.status] || 'bg-slate-100 text-slate-700'}`}>
            {order.status}
          </span>
          <span className="rounded-full bg-green-50 px-3 py-1 text-sm font-semibold text-green-800">{order.orderType}</span>
        </div>
      </div>
      <div className="space-y-2 text-sm text-slate-600">
        {order.items.map((item) => (
          <div key={item.productId?._id || item.productId} className="flex justify-between gap-4 border-b border-slate-100 pb-2 last:border-b-0">
            <span>{item.productName || item.productId?.name} × {item.qty}</span>
            <span>₹{item.price * item.qty}</span>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between text-sm font-semibold text-slate-800">
        <span>Total</span>
        <span>₹{order.totalAmount}</span>
      </div>
      {children}
    </div>
  );
};

export default OrderCard;

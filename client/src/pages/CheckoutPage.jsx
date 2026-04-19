import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { orderApi } from '../api/agroApi';
import { useCart } from '../contexts/CartContext';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { items, subtotal, clearCart } = useCart();
  const [address, setAddress] = useState({ street: '', city: '', state: '', pincode: '' });
  const [loading, setLoading] = useState(false);

  const submitHandler = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      await orderApi.create({
        items: items.map((item) => ({ productId: item._id, qty: item.cartQty, price: item.price })),
        deliveryAddress: address,
        paymentMethod: 'COD'
      });
      clearCart();
      navigate('/orders?success=1');
    } finally {
      setLoading(false);
    }
  };

  const fieldLabels = { street: 'Street Address', city: 'City', state: 'State', pincode: 'Pincode' };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 md:py-12">
      <h1 className="mb-6 text-3xl font-black text-slate-900">Checkout</h1>
      <form onSubmit={submitHandler} className="grid gap-6 lg:grid-cols-[1fr_0.8fr] lg:items-start">

        {/* Address */}
        <div className="card space-y-4">
          <h2 className="text-xl font-bold text-slate-900">Delivery Address</h2>
          {Object.keys(address).map((field) => (
            <input
              key={field}
              className="input"
              placeholder={fieldLabels[field] || field}
              value={address[field]}
              onChange={(e) => setAddress((prev) => ({ ...prev, [field]: e.target.value }))}
              required
            />
          ))}
          <div className="rounded-2xl bg-cream p-4 font-semibold text-leaf text-sm">
            💵 Payment Method: Cash on Delivery
          </div>
        </div>

        {/* Summary */}
        <div className="card space-y-3">
          <h2 className="text-xl font-bold text-slate-900">Order Summary</h2>
          <div className="max-h-60 overflow-y-auto space-y-2">
            {items.map((item) => (
              <div key={item._id} className="flex justify-between text-sm text-slate-600 border-b border-slate-100 pb-2">
                <span className="truncate pr-2">{item.name} × {item.cartQty}</span>
                <span className="shrink-0 font-semibold">₹{item.cartQty * item.price}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-between border-t border-slate-100 pt-3 text-lg font-bold text-slate-900">
            <span>Total</span><span>₹{subtotal}</span>
          </div>
          <button type="submit" className="btn-primary w-full" disabled={loading || !items.length}>
            {loading ? 'Placing Order...' : 'Place Order'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CheckoutPage;

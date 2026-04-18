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

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <form onSubmit={submitHandler} className="grid gap-8 lg:grid-cols-[1fr_0.8fr]">
        <div className="card space-y-4">
          <h1 className="text-3xl font-black text-slate-900">Checkout</h1>
          {Object.keys(address).map((field) => (
            <input key={field} className="input" placeholder={field[0].toUpperCase() + field.slice(1)} value={address[field]} onChange={(e) => setAddress((prev) => ({ ...prev, [field]: e.target.value }))} required />
          ))}
          <div className="rounded-2xl bg-cream p-4 font-semibold text-leaf">Payment Method: Cash on Delivery</div>
        </div>
        <div className="card h-fit space-y-4">
          <h2 className="text-2xl font-black text-slate-900">Summary</h2>
          {items.map((item) => <div key={item._id} className="flex justify-between text-sm text-slate-600"><span>{item.name} × {item.cartQty}</span><span>₹{item.cartQty * item.price}</span></div>)}
          <div className="flex justify-between border-t border-slate-100 pt-4 text-lg font-bold text-slate-900"><span>Total</span><span>₹{subtotal}</span></div>
          <button type="submit" className="btn-primary w-full" disabled={loading || !items.length}>{loading ? 'Placing Order...' : 'Place Order'}</button>
        </div>
      </form>
    </div>
  );
};

export default CheckoutPage;

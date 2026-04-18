import { Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';

const CartPage = () => {
  const { items, subtotal, removeFromCart, updateQty } = useCart();

  return (
    <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 lg:grid-cols-[1.2fr_0.8fr]">
      <div className="card space-y-4">
        <h1 className="text-3xl font-black text-slate-900">Your Cart</h1>
        {!items.length && <p className="text-slate-500">Your cart is empty. <Link to="/products" className="font-semibold text-leaf">Browse products</Link></p>}
        {items.map((item) => (
          <div key={item._id} className="flex flex-col gap-4 rounded-2xl border border-slate-100 p-4 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              <img src={item.images?.[0]?.url} alt={item.name} className="h-20 w-20 rounded-2xl object-cover" />
              <div>
                <p className="font-bold text-slate-900">{item.name}</p>
                <p className="text-sm text-slate-500">₹{item.price} / {item.unit}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <input className="input w-24" type="number" min="1" max={item.quantity} value={item.cartQty} onChange={(e) => updateQty(item._id, Number(e.target.value))} />
              <button type="button" className="btn-secondary" onClick={() => removeFromCart(item._id)}>Remove</button>
            </div>
          </div>
        ))}
      </div>
      <div className="card h-fit space-y-4">
        <h2 className="text-2xl font-black text-slate-900">Order Summary</h2>
        <div className="flex justify-between text-slate-600"><span>Subtotal</span><span>₹{subtotal}</span></div>
        <div className="flex justify-between text-slate-600"><span>Delivery</span><span>COD</span></div>
        <div className="flex justify-between border-t border-slate-100 pt-4 text-lg font-bold text-slate-900"><span>Total</span><span>₹{subtotal}</span></div>
        <Link to="/checkout" className="btn-primary w-full text-center">Proceed to Checkout</Link>
      </div>
    </div>
  );
};

export default CartPage;

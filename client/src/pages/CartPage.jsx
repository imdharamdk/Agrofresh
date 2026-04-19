import { Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';

const CartPage = () => {
  const { items, subtotal, removeFromCart, updateQty } = useCart();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:py-12">
      <h1 className="mb-6 text-3xl font-black text-slate-900">Your Cart</h1>

      {!items.length ? (
        <div className="card text-center py-16">
          <p className="text-slate-500">Your cart is empty.</p>
          <Link to="/products" className="mt-4 inline-block font-semibold text-leaf">Browse products →</Link>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-start">
          {/* Cart items */}
          <div className="card space-y-4">
            {items.map((item) => (
              <div key={item._id} className="rounded-2xl border border-slate-100 p-4">
                <div className="flex gap-3">
                  <img
                    src={item.images?.[0]?.url || 'https://placehold.co/80x80?text=AF'}
                    alt={item.name}
                    className="h-16 w-16 shrink-0 rounded-xl object-cover md:h-20 md:w-20"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-slate-900 truncate">{item.name}</p>
                    <p className="text-sm text-slate-500">₹{item.price} / {item.unit}</p>
                    <p className="text-sm font-semibold text-leaf">₹{item.price * item.cartQty}</p>
                  </div>
                </div>
                <div className="mt-3 flex items-center gap-3">
                  <input
                    className="input w-24 py-2 text-sm"
                    type="number"
                    min="1"
                    max={item.quantity}
                    value={item.cartQty}
                    onChange={(e) => updateQty(item._id, Number(e.target.value))}
                  />
                  <button
                    type="button"
                    className="rounded-xl border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
                    onClick={() => removeFromCart(item._id)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="card space-y-4">
            <h2 className="text-2xl font-black text-slate-900">Order Summary</h2>
            <div className="flex justify-between text-slate-600"><span>Subtotal</span><span>₹{subtotal}</span></div>
            <div className="flex justify-between text-slate-600"><span>Delivery</span><span>COD</span></div>
            <div className="flex justify-between border-t border-slate-100 pt-4 text-lg font-bold text-slate-900">
              <span>Total</span><span>₹{subtotal}</span>
            </div>
            <Link to="/checkout" className="btn-primary block w-full text-center">
              Proceed to Checkout
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;

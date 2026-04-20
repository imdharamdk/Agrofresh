import { Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { getPrimaryProductImage } from '../utils/productImages';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const stockLabel = product.quantity === 0 ? 'Out of Stock' : product.quantity < 10 ? 'Low Stock' : 'Fresh Stock';
  const stockClass = product.quantity === 0 ? 'bg-red-100 text-red-700' : product.quantity < 10 ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700';

  return (
    <div className="overflow-hidden rounded-3xl border border-green-100 bg-white shadow-soft">
      <Link to={`/products/${product._id}`}>
        <img
          src={getPrimaryProductImage(product)}
          alt={product.name}
          className="h-52 w-full object-cover"
        />
      </Link>
      <div className="space-y-4 p-5">
        <div className="flex flex-wrap gap-2 text-xs font-bold uppercase tracking-wide">
          <span className="rounded-full bg-cream px-3 py-1 text-leaf">Direct From Farmer</span>
          <span className={`rounded-full px-3 py-1 ${stockClass}`}>{stockLabel}</span>
          {product.minBulkQty > 0 && <span className="rounded-full bg-blue-100 px-3 py-1 text-blue-700">Bulk Discount</span>}
        </div>
        <div>
          <Link to={`/products/${product._id}`} className="text-xl font-bold text-slate-900 hover:text-leaf">
            {product.name}
          </Link>
          <p className="mt-1 text-sm text-slate-500">{product.farmerId?.name} • {product.category}</p>
        </div>
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-2xl font-bold text-leaf">₹{product.price}</p>
            <p className="text-sm text-slate-500">per {product.unit}</p>
          </div>
          <button
            type="button"
            className="btn-primary"
            disabled={!product.quantity}
            onClick={() => addToCart(product, 1)}
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;

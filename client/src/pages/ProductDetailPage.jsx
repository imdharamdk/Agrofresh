import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { productApi, reviewApi } from '../api/agroApi';
import { useCart } from '../contexts/CartContext';

const ProductDetailPage = () => {
  const { id } = useParams();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [qty, setQty] = useState(1);

  useEffect(() => {
    productApi.get(id).then(({ data }) => {
      setProduct(data.data.product);
      return reviewApi.getFarmerReviews(data.data.product.farmerId._id);
    }).then(({ data }) => {
      setReviews(data.data.reviews);
      setAverageRating(data.data.averageRating);
    });
  }, [id]);

  if (!product) return <div className="mx-auto max-w-7xl px-4 py-20">Loading product...</div>;

  const stockLabel = product.quantity === 0 ? 'Out of Stock' : product.quantity < 10 ? 'Low Stock' : `${product.quantity} in stock`;

  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <img src={product.images?.[0]?.url} alt={product.name} className="h-[460px] w-full rounded-3xl object-cover shadow-soft" />
          <div className="card">
            <h2 className="text-2xl font-bold text-slate-900">Description</h2>
            <p className="mt-4 leading-7 text-slate-600">{product.description}</p>
          </div>
          <div className="card">
            <div className="flex items-center justify-between gap-4">
              <h3 className="text-2xl font-bold text-slate-900">Farmer Reviews</h3>
              <span className="rounded-full bg-amber-100 px-3 py-1 font-semibold text-amber-700">{averageRating} / 5</span>
            </div>
            <div className="mt-4 space-y-4">
              {reviews.slice(0, 4).map((review) => (
                <div key={review._id} className="rounded-2xl bg-slate-50 p-4">
                  <p className="font-semibold text-slate-900">{review.reviewerId?.businessName || review.reviewerId?.name}</p>
                  <p className="text-sm text-slate-500">Rating: {review.rating}/5</p>
                  <p className="mt-2 text-sm text-slate-600">{review.comment}</p>
                </div>
              ))}
              {!reviews.length && <p className="text-sm text-slate-500">No reviews yet.</p>}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card">
            <div className="flex flex-wrap gap-2 text-xs font-bold uppercase tracking-wide">
              <span className="rounded-full bg-cream px-3 py-1 text-leaf">Direct From Farmer</span>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-700">No Middleman Guarantee</span>
              {product.minBulkQty > 0 && <span className="rounded-full bg-blue-100 px-3 py-1 text-blue-700">Bulk from {product.minBulkQty} {product.unit}</span>}
            </div>
            <h1 className="mt-4 text-4xl font-black text-slate-900">{product.name}</h1>
            <p className="mt-2 text-slate-500">{product.category} • {product.farmerId?.location}</p>
            <div className="mt-6 flex items-end justify-between gap-4">
              <div>
                <p className="text-4xl font-black text-leaf">₹{product.price}</p>
                <p className="text-sm text-slate-500">per {product.unit}</p>
                {product.minBulkQty > 0 && <p className="mt-2 text-sm font-semibold text-blue-700">Bulk price ₹{product.bulkPrice} from {product.minBulkQty} {product.unit}</p>}
              </div>
              <span className="rounded-full bg-green-50 px-4 py-2 text-sm font-semibold text-green-700">{stockLabel}</span>
            </div>
            <div className="mt-6 flex gap-4">
              <input className="input max-w-[120px]" min="1" max={product.quantity} type="number" value={qty} onChange={(e) => setQty(Number(e.target.value))} />
              <button type="button" className="btn-primary flex-1" disabled={!product.quantity} onClick={() => addToCart(product, qty)}>Add to Cart</button>
            </div>
          </div>
          <div className="card">
            <h3 className="text-xl font-bold text-slate-900">Farmer Info</h3>
            <p className="mt-3 font-semibold text-slate-800">{product.farmerId?.name}</p>
            <p className="text-sm text-slate-500">{product.farmerId?.location}</p>
            <p className="mt-2 text-sm text-slate-500">Phone: {product.farmerId?.phone}</p>
            <p className="mt-2 text-sm text-slate-500">Verified: {product.farmerId?.isVerified ? 'Yes' : 'Pending'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;

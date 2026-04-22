import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { productApi } from '../api/agroApi';
import ProductCard from '../components/ProductCard';
import CategoryFilter from '../components/CategoryFilter';

const HomePage = () => {
  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState('');

  useEffect(() => {
    const params = { limit: 16 };

    if (category === 'Organic') {
      params.organic = 'true';
    } else if (category) {
      params.category = category;
    }

    productApi.list(params).then(({ data }) => setProducts(data.data.products)).catch(() => setProducts([]));
  }, [category]);

  const todaysHarvest = useMemo(() => {
    const today = new Date().toDateString();
    return products.filter((product) => new Date(product.createdAt).toDateString() === today);
  }, [products]);

  return (
    <div>
      {/* Hero */}
      <section className="bg-[radial-gradient(circle_at_top_left,_rgba(22,163,74,0.26),_transparent_35%),linear-gradient(135deg,_#f7fee7,_#ffffff_55%,_#dcfce7)]">
        <div className="mx-auto max-w-7xl px-4 py-12 md:py-20 grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <p className="mb-4 inline-flex rounded-full bg-white px-4 py-2 text-sm font-semibold text-leaf shadow-soft">
              Farm Fresh, Direct to You
            </p>
            <h1 className="max-w-3xl text-4xl font-black leading-tight text-moss md:text-5xl lg:text-6xl">
              AgroFresh connects farms, families, and business buyers without middlemen.
            </h1>
            <p className="mt-5 max-w-2xl text-base text-slate-600 md:text-lg">
              Buy vegetables, fruits, grains, dairy, and spices directly from verified farmers.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link to="/products" className="btn-primary">Explore Marketplace</Link>
              <Link to="/register" className="btn-secondary">Join as Farmer or Business</Link>
            </div>
          </div>

          <div className="card bg-white/80">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-3xl bg-green-50 p-4">
                <p className="text-xs font-semibold text-leaf">B2C Orders</p>
                <p className="mt-2 text-xl font-black text-moss">Fast COD checkout</p>
              </div>
              <div className="rounded-3xl bg-slate-900 p-4 text-white">
                <p className="text-xs font-semibold text-green-300">B2B Procurement</p>
                <p className="mt-2 text-xl font-black">Bulk negotiation & repeat buying</p>
              </div>
              <div className="rounded-3xl bg-amber-50 p-4">
                <p className="text-xs font-semibold text-amber-700">Delivery Layer</p>
                <p className="mt-2 text-xl font-black text-slate-900">Assignable logistics workflow</p>
              </div>
              <div className="rounded-3xl bg-blue-50 p-4">
                <p className="text-xs font-semibold text-blue-700">AI Ready</p>
                <p className="mt-2 text-xl font-black text-slate-900">Price, demand & smart suggestions</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Marketplace */}
      <section className="mx-auto max-w-7xl px-4 py-12 md:py-16">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-leaf">Featured Marketplace</p>
            <h2 className="mt-1 text-2xl font-black text-slate-900 md:text-3xl">Direct harvests from verified farmers</h2>
          </div>
          <CategoryFilter value={category} onChange={setCategory} />
        </div>
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {products.slice(0, 8).map((product) => <ProductCard key={product._id} product={product} />)}
        </div>
      </section>

      {/* Today's Harvest */}
      <section className="bg-white py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-leaf">Today's Fresh Harvest</p>
              <h2 className="mt-1 text-2xl font-black text-slate-900 md:text-3xl">Picked today, listed today</h2>
            </div>
            <Link to="/products" className="btn-secondary py-2 text-sm shrink-0">See all</Link>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {(todaysHarvest.length ? todaysHarvest : products.slice(0, 4)).map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;

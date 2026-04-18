import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { productApi } from '../api/agroApi';
import ProductCard from '../components/ProductCard';
import CategoryFilter from '../components/CategoryFilter';

const HomePage = () => {
  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState('');

  useEffect(() => {
    productApi.list({ limit: 16, category }).then(({ data }) => setProducts(data.data.products)).catch(() => setProducts([]));
  }, [category]);

  const todaysHarvest = useMemo(() => {
    const today = new Date().toDateString();
    return products.filter((product) => new Date(product.createdAt).toDateString() === today);
  }, [products]);

  return (
    <div>
      <section className="bg-[radial-gradient(circle_at_top_left,_rgba(22,163,74,0.26),_transparent_35%),linear-gradient(135deg,_#f7fee7,_#ffffff_55%,_#dcfce7)]">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-20 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <p className="mb-4 inline-flex rounded-full bg-white px-4 py-2 text-sm font-semibold text-leaf shadow-soft">Farm Fresh, Direct to You</p>
            <h1 className="max-w-3xl text-5xl font-black leading-tight text-moss md:text-6xl">AgroFresh connects farms, families, and business buyers without middlemen.</h1>
            <p className="mt-6 max-w-2xl text-lg text-slate-600">Buy vegetables, fruits, grains, dairy, and spices directly from verified farmers. Scale into B2B procurement, logistics, and AI-assisted commerce from one platform.</p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link to="/products" className="btn-primary">Explore Marketplace</Link>
              <Link to="/register" className="btn-secondary">Join as Farmer or Business</Link>
            </div>
          </div>
          <div className="card bg-white/80">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl bg-green-50 p-5">
                <p className="text-sm font-semibold text-leaf">B2C Orders</p>
                <p className="mt-3 text-3xl font-black text-moss">Fast COD checkout</p>
              </div>
              <div className="rounded-3xl bg-slate-900 p-5 text-white">
                <p className="text-sm font-semibold text-green-300">B2B Procurement</p>
                <p className="mt-3 text-3xl font-black">Bulk negotiation & repeat buying</p>
              </div>
              <div className="rounded-3xl bg-amber-50 p-5">
                <p className="text-sm font-semibold text-amber-700">Delivery Layer</p>
                <p className="mt-3 text-3xl font-black text-slate-900">Assignable logistics workflow</p>
              </div>
              <div className="rounded-3xl bg-blue-50 p-5">
                <p className="text-sm font-semibold text-blue-700">AI Ready</p>
                <p className="mt-3 text-3xl font-black text-slate-900">Price, demand, and smart suggestions</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-leaf">Featured Marketplace</p>
            <h2 className="mt-2 text-3xl font-black text-slate-900">Direct harvests from verified farmers</h2>
          </div>
          <CategoryFilter value={category} onChange={setCategory} />
        </div>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {products.slice(0, 8).map((product) => <ProductCard key={product._id} product={product} />)}
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mb-8 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-leaf">Today's Fresh Harvest</p>
              <h2 className="mt-2 text-3xl font-black text-slate-900">Picked today, listed today</h2>
            </div>
            <Link to="/products" className="btn-secondary">See all products</Link>
          </div>
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {(todaysHarvest.length ? todaysHarvest : products.slice(0, 4)).map((product) => <ProductCard key={product._id} product={product} />)}
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;

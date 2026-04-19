import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { productApi } from '../api/agroApi';
import ProductCard from '../components/ProductCard';
import CategoryFilter from '../components/CategoryFilter';

const ProductsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1 });
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    bulkAvailable: searchParams.get('bulkAvailable') || ''
  });

  const page = Number(searchParams.get('page') || 1);

  useEffect(() => {
    const params = { ...filters, page, limit: 12 };
    Object.keys(params).forEach((key) => !params[key] && delete params[key]);
    productApi.list(params).then(({ data }) => {
      setProducts(data.data.products);
      setPagination(data.data.pagination);
    });
  }, [filters, page]);

  const applyFilters = (nextFilters) => {
    setFilters(nextFilters);
    const nextParams = new URLSearchParams();
    Object.entries(nextFilters).forEach(([key, value]) => value && nextParams.set(key, value));
    nextParams.set('page', '1');
    setSearchParams(nextParams);
    setFiltersOpen(false);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 md:py-12">

      {/* Category pills — always visible */}
      <div className="mb-4">
        <CategoryFilter value={filters.category} onChange={(category) => applyFilters({ ...filters, category })} />
      </div>

      {/* Filter toggle (mobile) + filter panel */}
      <div className="mb-6 rounded-3xl border border-green-100 bg-white shadow-soft">
        {/* Mobile toggle header */}
        <button
          type="button"
          className="flex w-full items-center justify-between px-5 py-4 text-left md:hidden"
          onClick={() => setFiltersOpen((prev) => !prev)}
        >
          <span className="font-semibold text-slate-700">Filters & Search</span>
          <span className="text-slate-400">{filtersOpen ? '▲' : '▼'}</span>
        </button>

        {/* Filter body — always open on md+ */}
        <div className={`${filtersOpen ? 'block' : 'hidden'} px-5 pb-5 pt-1 md:block md:pt-5`}>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_auto]">
            <input
              className="input"
              placeholder="Search produce"
              value={filters.search}
              onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))
              }
              onKeyDown={(e) => e.key === 'Enter' && applyFilters(filters)}
            />
            <input
              className="input"
              placeholder="Min price (₹)"
              type="number"
              value={filters.minPrice}
              onChange={(e) => setFilters((prev) => ({ ...prev, minPrice: e.target.value }))}
            />
            <input
              className="input"
              placeholder="Max price (₹)"
              type="number"
              value={filters.maxPrice}
              onChange={(e) => setFilters((prev) => ({ ...prev, maxPrice: e.target.value }))}
            />
            <button type="button" className="btn-primary w-full lg:w-auto" onClick={() => applyFilters(filters)}>
              Apply
            </button>
          </div>
          <label className="mt-3 inline-flex items-center gap-3 text-sm font-semibold text-slate-700">
            <input
              type="checkbox"
              checked={filters.bulkAvailable === 'true'}
              onChange={(e) => applyFilters({ ...filters, bulkAvailable: e.target.checked ? 'true' : '' })}
            />
            Bulk-ready products only
          </label>
        </div>
      </div>

      {/* Products grid */}
      {products.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-slate-200 py-16 text-center text-slate-500">
          No products found. Try changing filters.
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {products.map((product) => <ProductCard key={product._id} product={product} />)}
        </div>
      )}

      {/* Pagination */}
      <div className="mt-10 flex items-center justify-center gap-4">
        <button
          className="btn-secondary"
          disabled={page <= 1}
          onClick={() => setSearchParams((params) => { params.set('page', String(page - 1)); return params; })}
        >
          ← Prev
        </button>
        <span className="text-sm font-semibold text-slate-700">
          {pagination.page} / {pagination.pages || 1}
        </span>
        <button
          className="btn-secondary"
          disabled={page >= (pagination.pages || 1)}
          onClick={() => setSearchParams((params) => { params.set('page', String(page + 1)); return params; })}
        >
          Next →
        </button>
      </div>
    </div>
  );
};

export default ProductsPage;

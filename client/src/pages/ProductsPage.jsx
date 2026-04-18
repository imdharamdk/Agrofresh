import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { productApi } from '../api/agroApi';
import ProductCard from '../components/ProductCard';
import CategoryFilter from '../components/CategoryFilter';

const ProductsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1 });
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
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <div className="mb-8 grid gap-4 rounded-3xl border border-green-100 bg-white p-6 shadow-soft lg:grid-cols-[2fr_1fr_1fr_1fr]">
        <input className="input" placeholder="Search produce" value={filters.search} onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))} />
        <input className="input" placeholder="Min price" type="number" value={filters.minPrice} onChange={(e) => setFilters((prev) => ({ ...prev, minPrice: e.target.value }))} />
        <input className="input" placeholder="Max price" type="number" value={filters.maxPrice} onChange={(e) => setFilters((prev) => ({ ...prev, maxPrice: e.target.value }))} />
        <button type="button" className="btn-primary" onClick={() => applyFilters(filters)}>Apply Filters</button>
        <div className="lg:col-span-4">
          <CategoryFilter value={filters.category} onChange={(category) => applyFilters({ ...filters, category })} />
        </div>
        <label className="inline-flex items-center gap-3 text-sm font-semibold text-slate-700 lg:col-span-4">
          <input type="checkbox" checked={filters.bulkAvailable === 'true'} onChange={(e) => applyFilters({ ...filters, bulkAvailable: e.target.checked ? 'true' : '' })} />
          Show bulk-ready products only
        </label>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {products.map((product) => <ProductCard key={product._id} product={product} />)}
      </div>

      <div className="mt-10 flex items-center justify-center gap-4">
        <button className="btn-secondary" disabled={page <= 1} onClick={() => setSearchParams((params) => { params.set('page', String(page - 1)); return params; })}>Previous</button>
        <span className="font-semibold text-slate-700">Page {pagination.page} of {pagination.pages || 1}</span>
        <button className="btn-secondary" disabled={page >= (pagination.pages || 1)} onClick={() => setSearchParams((params) => { params.set('page', String(page + 1)); return params; })}>Next</button>
      </div>
    </div>
  );
};

export default ProductsPage;

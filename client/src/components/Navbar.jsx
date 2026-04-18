import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';

const Navbar = () => {
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { count } = useCart();

  const handleSearch = (event) => {
    event.preventDefault();
    navigate(`/products?search=${encodeURIComponent(search)}`);
  };

  const dashboardPath = {
    farmer: '/dashboard/farmer',
    customer: '/dashboard/customer',
    business: '/b2b-dashboard',
    delivery: '/delivery-dashboard',
    admin: '/admin-dashboard'
  }[user?.role];

  return (
    <header className="sticky top-0 z-40 border-b border-green-100 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center justify-between gap-4">
          <Link to="/" className="text-3xl font-black tracking-tight text-moss">AgroFresh</Link>
          <div className="lg:hidden">
            <Link to="/cart" className="relative rounded-full bg-cream px-3 py-2 font-semibold text-leaf">
              Cart
              <span className="ml-2 rounded-full bg-leaf px-2 py-0.5 text-xs text-white">{count}</span>
            </Link>
          </div>
        </div>
        <form onSubmit={handleSearch} className="flex w-full max-w-2xl gap-3">
          <input className="input" placeholder="Search farm produce, grains, dairy..." value={search} onChange={(e) => setSearch(e.target.value)} />
          <button type="submit" className="btn-primary">Search</button>
        </form>
        <div className="hidden items-center gap-3 lg:flex">
          <NavLink to="/products" className="font-semibold text-slate-700 hover:text-leaf">Marketplace</NavLink>
          <Link to="/cart" className="relative rounded-full bg-cream px-4 py-2 font-semibold text-leaf">Cart ({count})</Link>
          {user ? (
            <>
              <Link to={dashboardPath} className="btn-secondary">Dashboard</Link>
              <button type="button" className="btn-primary" onClick={logout}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-secondary">Login</Link>
              <Link to="/register" className="btn-primary">Register</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;

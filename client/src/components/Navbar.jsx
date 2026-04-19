import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';

const Navbar = () => {
  const [search, setSearch] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { count } = useCart();

  const handleSearch = (event) => {
    event.preventDefault();
    navigate(`/products?search=${encodeURIComponent(search)}`);
    setMenuOpen(false);
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
      <div className="mx-auto max-w-7xl px-4">
        {/* Top row */}
        <div className="flex h-16 items-center justify-between gap-4">
          <Link to="/" className="text-2xl font-black tracking-tight text-moss shrink-0">AgroFresh</Link>

          {/* Desktop search */}
          <form onSubmit={handleSearch} className="hidden flex-1 max-w-xl gap-2 md:flex">
            <input className="input py-2" placeholder="Search farm produce, grains, dairy..." value={search} onChange={(e) => setSearch(e.target.value)} />
            <button type="submit" className="btn-primary py-2 px-4 shrink-0">Search</button>
          </form>

          {/* Desktop nav */}
          <div className="hidden items-center gap-3 lg:flex shrink-0">
            <NavLink to="/products" className="font-semibold text-slate-700 hover:text-leaf">Marketplace</NavLink>
            <Link to="/cart" className="relative rounded-full bg-cream px-4 py-2 font-semibold text-leaf">
              Cart ({count})
            </Link>
            {user ? (
              <>
                <Link to={dashboardPath} className="btn-secondary py-2">Dashboard</Link>
                <button type="button" className="btn-primary py-2" onClick={logout}>Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn-secondary py-2">Login</Link>
                <Link to="/register" className="btn-primary py-2">Register</Link>
              </>
            )}
          </div>

          {/* Mobile right: cart + hamburger */}
          <div className="flex items-center gap-3 lg:hidden">
            <Link to="/cart" className="relative rounded-full bg-cream px-3 py-1.5 text-sm font-semibold text-leaf">
              Cart <span className="ml-1 rounded-full bg-leaf px-1.5 py-0.5 text-xs text-white">{count}</span>
            </Link>
            <button
              type="button"
              onClick={() => setMenuOpen((prev) => !prev)}
              className="flex h-10 w-10 flex-col items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white"
              aria-label="Menu"
            >
              <span className={`block h-0.5 w-5 bg-slate-700 transition-all ${menuOpen ? 'translate-y-2 rotate-45' : ''}`} />
              <span className={`block h-0.5 w-5 bg-slate-700 transition-all ${menuOpen ? 'opacity-0' : ''}`} />
              <span className={`block h-0.5 w-5 bg-slate-700 transition-all ${menuOpen ? '-translate-y-2 -rotate-45' : ''}`} />
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="border-t border-slate-100 py-4 space-y-3 lg:hidden">
            <form onSubmit={handleSearch} className="flex gap-2">
              <input className="input py-2 text-sm" placeholder="Search produce..." value={search} onChange={(e) => setSearch(e.target.value)} />
              <button type="submit" className="btn-primary py-2 px-4 text-sm shrink-0">Go</button>
            </form>
            <NavLink to="/products" className="block rounded-2xl px-4 py-3 font-semibold text-slate-700 hover:bg-green-50" onClick={() => setMenuOpen(false)}>
              Marketplace
            </NavLink>
            {user ? (
              <>
                <Link to={dashboardPath} className="block rounded-2xl bg-green-50 px-4 py-3 font-semibold text-leaf" onClick={() => setMenuOpen(false)}>
                  Dashboard
                </Link>
                <button type="button" className="w-full rounded-2xl bg-slate-100 px-4 py-3 text-left font-semibold text-slate-700" onClick={() => { logout(); setMenuOpen(false); }}>
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="block rounded-2xl border border-green-200 px-4 py-3 text-center font-semibold text-green-800" onClick={() => setMenuOpen(false)}>
                  Login
                </Link>
                <Link to="/register" className="block rounded-2xl bg-leaf px-4 py-3 text-center font-semibold text-white" onClick={() => setMenuOpen(false)}>
                  Register
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;

import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const submitHandler = async (event) => {
    event.preventDefault();
    try {
      const result = await login(formData);
      const role = result.data.user.role;
      const fallback = {
        farmer: '/dashboard/farmer',
        customer: '/dashboard/customer',
        business: '/b2b-dashboard',
        delivery: '/delivery-dashboard',
        admin: '/admin-dashboard'
      }[role];
      navigate(location.state?.from?.pathname || fallback);
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <form onSubmit={submitHandler} className="card space-y-4">
        <h1 className="text-3xl font-black text-slate-900">Login</h1>
        {error && <div className="rounded-2xl bg-red-50 p-4 text-sm text-red-700">{error}</div>}
        <input className="input" type="email" placeholder="Email" value={formData.email} onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))} required />
        <input className="input" type="password" placeholder="Password" value={formData.password} onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))} required />
        <button type="submit" className="btn-primary w-full">Login</button>
        <p className="text-sm text-slate-500">No account? <Link className="font-semibold text-leaf" to="/register">Register</Link></p>
      </form>
    </div>
  );
};

export default LoginPage;

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'customer',
    phone: '',
    location: '',
    businessName: ''
  });

  const submitHandler = async (event) => {
    event.preventDefault();
    try {
      const result = await register(formData);
      navigate(result.data.user.role === 'farmer' ? '/dashboard/farmer' : result.data.user.role === 'business' ? '/b2b-dashboard' : '/dashboard/customer');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="mx-auto max-w-xl px-4 py-16">
      <form onSubmit={submitHandler} className="card grid gap-4 md:grid-cols-2">
        <div className="md:col-span-2">
          <h1 className="text-3xl font-black text-slate-900">Create Account</h1>
          {error && <div className="mt-4 rounded-2xl bg-red-50 p-4 text-sm text-red-700">{error}</div>}
        </div>
        <input className="input" placeholder="Full Name" value={formData.name} onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))} required />
        <input className="input" type="email" placeholder="Email" value={formData.email} onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))} required />
        <input className="input" type="password" placeholder="Password" value={formData.password} onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))} required />
        <select className="input" value={formData.role} onChange={(e) => setFormData((prev) => ({ ...prev, role: e.target.value }))}>
          <option value="customer">Customer</option>
          <option value="farmer">Farmer</option>
          <option value="business">Business Buyer</option>
        </select>
        <input className="input" placeholder="Phone" value={formData.phone} onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))} required />
        <input className="input" placeholder="Location" value={formData.location} onChange={(e) => setFormData((prev) => ({ ...prev, location: e.target.value }))} required />
        {formData.role === 'business' && <input className="input md:col-span-2" placeholder="Business Name" value={formData.businessName} onChange={(e) => setFormData((prev) => ({ ...prev, businessName: e.target.value }))} required />}
        <button type="submit" className="btn-primary md:col-span-2">Create Account</button>
      </form>
    </div>
  );
};

export default RegisterPage;

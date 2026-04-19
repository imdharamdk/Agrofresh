import { Navigate, Route, Routes } from 'react-router-dom';
import AppLayout from './layouts/AppLayout';
import ProtectedRoute from './components/ProtectedRoute';
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import FarmerDashboardPage from './pages/FarmerDashboardPage';
import FarmerProductFormPage from './pages/FarmerProductFormPage';
import CustomerDashboardPage from './pages/CustomerDashboardPage';
import BusinessDashboardPage from './pages/BusinessDashboardPage';
import DeliveryDashboardPage from './pages/DeliveryDashboardPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminProductFormPage from './pages/AdminProductFormPage';
import NotFoundPage from './pages/NotFoundPage';

const App = () => {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/products/:id" element={<ProductDetailPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route element={<ProtectedRoute roles={['customer']} />}>
          <Route path="/checkout" element={<CheckoutPage />} />
        </Route>
        <Route element={<ProtectedRoute roles={['customer']} />}>
          <Route path="/dashboard/customer" element={<CustomerDashboardPage />} />
          <Route path="/orders" element={<CustomerDashboardPage />} />
        </Route>
        <Route element={<ProtectedRoute roles={['farmer']} />}>
          <Route path="/dashboard/farmer" element={<FarmerDashboardPage />} />
          <Route path="/dashboard/farmer/products/add" element={<FarmerProductFormPage />} />
          <Route path="/dashboard/farmer/products/edit/:id" element={<FarmerProductFormPage />} />
        </Route>
        <Route element={<ProtectedRoute roles={['business']} />}>
          <Route path="/b2b-dashboard" element={<BusinessDashboardPage />} />
        </Route>
        <Route element={<ProtectedRoute roles={['delivery']} />}>
          <Route path="/delivery-dashboard" element={<DeliveryDashboardPage />} />
        </Route>
        <Route element={<ProtectedRoute roles={['admin']} />}>
          <Route path="/admin-dashboard" element={<AdminDashboardPage />} />
          <Route path="/admin-dashboard/products/add" element={<AdminProductFormPage />} />
          <Route path="/admin-dashboard/products/edit/:id" element={<AdminProductFormPage />} />
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;

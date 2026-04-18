import { Link } from 'react-router-dom';

const NotFoundPage = () => (
  <div className="mx-auto max-w-3xl px-4 py-24 text-center">
    <h1 className="text-5xl font-black text-moss">404</h1>
    <p className="mt-4 text-lg text-slate-600">The page you requested does not exist.</p>
    <Link to="/" className="btn-primary mt-8">Back Home</Link>
  </div>
);

export default NotFoundPage;

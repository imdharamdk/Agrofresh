const Footer = () => (
  <footer className="mt-20 border-t border-green-100 bg-moss text-white">
    <div className="mx-auto grid max-w-7xl gap-6 px-4 py-12 md:grid-cols-3">
      <div>
        <h3 className="text-2xl font-bold">AgroFresh</h3>
        <p className="mt-3 text-sm text-green-100">Farm-to-home and farm-to-business commerce without middlemen.</p>
      </div>
      <div>
        <p className="font-semibold">Platform</p>
        <p className="mt-3 text-sm text-green-100">B2C marketplace, bulk trading, delivery coordination, and AI-ready commerce services.</p>
      </div>
      <div>
        <p className="font-semibold">Promise</p>
        <p className="mt-3 text-sm text-green-100">Direct From Farmer freshness, fair pricing, and scalable digital agriculture operations.</p>
      </div>
    </div>
  </footer>
);

export default Footer;

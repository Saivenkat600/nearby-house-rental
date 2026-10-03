import { Link } from 'react-router-dom';

export default function Footer() {
  return <footer className="mt-12 bg-forest-800 text-white"><div className="mx-auto flex max-w-7xl flex-col justify-between gap-4 px-4 py-8 sm:flex-row sm:items-center sm:px-6 lg:px-8"><div><p className="text-lg font-bold">NearNest</p><p className="mt-1 text-sm text-forest-100">A better way to find a place that feels like home.</p></div><div className="flex gap-5 text-sm text-forest-100"><Link to="/properties">Explore rentals</Link><Link to="/register">List your home</Link></div><p className="text-xs text-forest-100">© 2026 NearNest</p></div></footer>;
}

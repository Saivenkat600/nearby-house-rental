import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const common = [{ to: '/', label: 'Home' }, { to: '/properties', label: 'Explore homes' }];
const linksByRole = {
  tenant: [...common, { to: '/nearby', label: 'Nearby' }, { to: '/favorites', label: 'Favorites' }, { to: '/my-inquiries', label: 'My inquiries' }],
  owner: [...common, { to: '/owner', label: 'Dashboard' }, { to: '/my-properties', label: 'My properties' }, { to: '/add-property', label: 'List a home' }, { to: '/owner-inquiries', label: 'Inquiries' }],
  admin: [{ to: '/admin', label: 'Dashboard' }, { to: '/admin/users', label: 'Users' }, { to: '/admin/properties', label: 'Properties' }]
};

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const links = user ? linksByRole[user.role] || common : common;
  const home = pathname === '/';
  useEffect(() => {
    if (!home) return undefined;
    const update = () => setScrolled(window.scrollY > 8);
    update();
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, [home]);
  useEffect(() => { setMenuOpen(false); }, [pathname]);
  return <header className={`sticky top-0 z-20 border-b border-forest-100 bg-white/95 backdrop-blur ${home ? `home-nav ${scrolled ? 'home-nav-scrolled' : ''}` : ''}`}>
    <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3.5 sm:px-6 lg:px-8">
      <Link to="/" className="flex shrink-0 items-center gap-2 text-xl font-black tracking-tight text-forest-800"><span className="grid h-9 w-9 place-items-center rounded-lg bg-forest-800 text-sm text-white">N</span>NearNest</Link>
      <div className="hidden items-center gap-7 lg:flex">
        {links.map((link) => <NavLink key={link.to} to={link.to} end={home && link.to === '/'} className={({ isActive }) => `home-nav-link relative py-2 text-sm font-semibold transition-colors ${isActive ? 'text-forest-800' : 'text-slate-600 hover:text-forest-700'}`}>{link.label}</NavLink>)}
      </div>
      <div className="flex items-center gap-2">
        {user ? <><span className="hidden text-sm text-slate-500 sm:inline">Hi, {user.name?.split(' ')[0]}</span><button className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold transition hover:bg-sand" onClick={() => { logout(); navigate('/'); }}>Logout</button></> :
          <><Link to="/login" className="hidden px-3 py-2 text-sm font-semibold text-slate-700 transition hover:text-forest-700 sm:inline-flex">Log in</Link><Link to="/register" className="rounded-lg bg-forest-800 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-forest-700">Get started</Link></>}
        {home && <button type="button" aria-label={menuOpen ? 'Close navigation menu' : 'Open navigation menu'} aria-expanded={menuOpen} onClick={() => setMenuOpen((open) => !open)} className="grid h-10 w-10 place-items-center rounded-lg border border-slate-200 text-forest-800 transition hover:bg-forest-50 lg:hidden"><span className="text-xl leading-none" aria-hidden="true">{menuOpen ? '×' : '☰'}</span></button>}
      </div>
    </nav>
    {home ? <div className={`home-mobile-menu ${menuOpen ? 'home-mobile-menu-open' : ''} lg:hidden`} aria-hidden={!menuOpen}>
      {links.map((link) => <NavLink key={link.to} to={link.to} end={home && link.to === '/'} tabIndex={menuOpen ? 0 : -1} className={({ isActive }) => `block rounded-md px-3 py-2.5 text-sm font-semibold transition ${isActive ? 'bg-forest-50 text-forest-800' : 'text-slate-600 hover:bg-slate-50 hover:text-forest-700'}`}>{link.label}</NavLink>)}
    </div> : <div className="flex gap-4 overflow-x-auto border-t border-slate-100 px-4 py-2 lg:hidden">
      {links.map((link) => <NavLink key={link.to} to={link.to} className={({ isActive }) => `whitespace-nowrap text-xs font-semibold ${isActive ? 'text-forest-700' : 'text-slate-500'}`}>{link.label}</NavLink>)}
    </div>}
  </header>;
}

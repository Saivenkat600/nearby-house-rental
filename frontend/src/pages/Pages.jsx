import { useCallback, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import useGeolocation from '../hooks/useGeolocation';
import { adminService } from '../services/adminService';
import { errorMessage } from '../services/api';
import { favoriteService } from '../services/favoriteService';
import { inquiryService } from '../services/inquiryService';
import { propertyService } from '../services/propertyService';
import PropertyCard from '../components/PropertyCard';
import PropertyFilter from '../components/PropertyFilter';
import PropertyMap from '../components/PropertyMap';
import { Button, EmptyState, ErrorMessage, Input, Loader, PageContainer, SectionTitle, Select, TextLink } from '../components/UI';

function asArray(result, keys = []) {
  if (Array.isArray(result)) return result;
  for (const key of keys) if (Array.isArray(result?.[key])) return result[key];
  return [];
}

export function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  async function submit(event) {
    event.preventDefault(); setBusy(true); setError('');
    try {
      const user = await login(form);
      const destination = location.state?.from?.pathname || (user.role === 'admin' ? '/admin' : user.role === 'owner' ? '/owner' : '/properties');
      navigate(destination, { replace: true });
    } catch (err) { setError(errorMessage(err)); } finally { setBusy(false); }
  }
  return <AuthForm title="Welcome back" description="Log in to continue your rental journey." onSubmit={submit} error={error} busy={busy} submitLabel="Log in"><Input label="Email address" type="email" autoComplete="email" required value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} /><Input label="Password" type="password" autoComplete="current-password" required value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} /></AuthForm>;
}

export function Home() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ search: '', city: '', minRent: '', maxRent: '', propertyType: '', bhk: '' });
  const [favorites, setFavorites] = useState([]);
  const { user } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  useEffect(() => {
    propertyService.list({ available: true })
      .then((data) => setProperties(asArray(data, ['properties'])))
      .catch((err) => setError(errorMessage(err)))
      .finally(() => setLoading(false));
  }, []);
  useEffect(() => {
    if (user?.role !== 'tenant') return;
    favoriteService.list().then((data) => setFavorites(asArray(data, ['favorites']).map((item) => item.property?._id || item.property || item._id))).catch(() => {});
  }, [user]);
  useEffect(() => {
    const page = document.querySelector('.home-page');
    if (!page) return undefined;
    if (!('IntersectionObserver' in window)) {
      page.querySelectorAll('.home-section, .home-neighborhood, .home-owner-cta').forEach((section) => section.classList.add('home-visible'));
      return undefined;
    }
    const observer = new IntersectionObserver((entries) => entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('home-visible');
        observer.unobserve(entry.target);
      }
    }), { threshold: 0.12 });
    page.querySelectorAll('.home-section, .home-neighborhood, .home-owner-cta').forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);
  async function toggleFavorite(id) {
    try {
      if (favorites.includes(id)) {
        await favoriteService.remove(id);
        setFavorites((items) => items.filter((item) => item !== id));
      } else {
        await favoriteService.add(id);
        setFavorites((items) => [...items, id]);
      }
    } catch (err) { setError(errorMessage(err)); }
  }
  function search(event) {
    event.preventDefault();
    const query = new URLSearchParams(Object.entries(filters).filter(([, value]) => value));
    navigate(`/properties?${query}`);
  }
  function clearFilters() { setFilters({ search: '', city: '', minRent: '', maxRent: '', propertyType: '', bhk: '' }); }
  const cities = [...new Set(properties.map((item) => item.city).filter(Boolean))].sort();
  const fieldClass = 'w-full rounded-lg border border-slate-200 bg-white px-3.5 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-forest-600 focus:ring-4 focus:ring-forest-100';
  const featured = properties.slice(0, 6);
  return <div className="page-shell home-page">
    <section className="home-hero relative isolate overflow-hidden bg-forest-800 text-white">
      <div className="home-hero-image absolute inset-0" aria-hidden="true" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#0b211b]/90 via-[#0b211b]/65 to-[#0b211b]/25" aria-hidden="true" />
      <div className="relative mx-auto grid max-w-7xl gap-12 px-4 pb-20 pt-16 sm:px-6 md:grid-cols-[1fr_.88fr] md:items-center md:pb-28 md:pt-24 lg:px-8">
        <div className="home-enter max-w-2xl">
          <p className="mb-5 flex items-center gap-3 text-xs font-bold uppercase tracking-[.2em] text-emerald-200"><span className="h-px w-9 bg-emerald-200" /> A place to call your own</p>
          <h1 className="max-w-xl text-4xl font-semibold leading-[1.08] sm:text-5xl md:text-6xl">Find Your Perfect Rental Home</h1>
          <p className="mt-6 max-w-lg text-base leading-7 text-white/80 sm:text-lg">A better way to find a place that feels like home. Explore thoughtful local listings and connect directly with the people behind them.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/properties" className="home-button inline-flex items-center gap-2 rounded-lg bg-white px-5 py-3.5 text-sm font-bold text-forest-800 shadow-lg transition hover:-translate-y-0.5 hover:bg-forest-50">Explore homes <span aria-hidden="true">→</span></Link>
            <Link to="/register" className="home-button inline-flex items-center gap-2 rounded-lg border border-white/40 bg-white/5 px-5 py-3.5 text-sm font-bold text-white backdrop-blur transition hover:-translate-y-0.5 hover:bg-white/15">List your property <span aria-hidden="true">↗</span></Link>
          </div>
          <div className="mt-10 flex items-center gap-3 text-sm text-white/70"><span className="flex -space-x-2" aria-hidden="true"><span className="grid h-8 w-8 place-items-center rounded-full border-2 border-white/70 bg-[#d9a78e] text-xs text-[#422c23]">N</span><span className="grid h-8 w-8 place-items-center rounded-full border-2 border-white/70 bg-[#aec5a9] text-xs text-[#213a2f]">H</span><span className="grid h-8 w-8 place-items-center rounded-full border-2 border-white/70 bg-[#e6d5ad] text-xs text-[#443d2d]">+</span></span><span>Find your next chapter, close to home.</span></div>
        </div>
        <div className="home-enter rounded-xl border border-white/60 bg-white p-5 text-forest-800 shadow-2xl shadow-black/20 sm:p-6" style={{ animationDelay: '120ms' }}>
          <div className="mb-5 flex items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[.16em] text-forest-600">Your next move</p><h2 className="mt-1 text-xl font-bold">Find a place to belong</h2></div><span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-forest-50 text-lg" aria-hidden="true">⌕</span></div>
          <form onSubmit={search} className="grid gap-3 sm:grid-cols-2">
            <label className="block text-xs font-semibold text-slate-600 sm:col-span-2">City, locality, or property title<input className={`${fieldClass} mt-1.5`} placeholder="Try ‘Madhapur’ or ‘sunlit apartment’" value={filters.search} onChange={(event) => setFilters({ ...filters, search: event.target.value })} /></label>
            <label className="block text-xs font-semibold text-slate-600">City<select className={`${fieldClass} mt-1.5`} value={filters.city} onChange={(event) => setFilters({ ...filters, city: event.target.value })}><option value="">Any city</option>{cities.map((city) => <option key={city} value={city}>{city}</option>)}</select></label>
            <label className="block text-xs font-semibold text-slate-600">Bedrooms<select className={`${fieldClass} mt-1.5`} value={filters.bhk} onChange={(event) => setFilters({ ...filters, bhk: event.target.value })}><option value="">Any bedrooms</option>{[1, 2, 3, 4, 5].map((count) => <option key={count} value={count}>{count} BHK</option>)}</select></label>
            <label className="block text-xs font-semibold text-slate-600">Minimum rent<input className={`${fieldClass} mt-1.5`} type="number" min="0" placeholder="No minimum" value={filters.minRent} onChange={(event) => setFilters({ ...filters, minRent: event.target.value })} /></label>
            <label className="block text-xs font-semibold text-slate-600">Maximum rent<input className={`${fieldClass} mt-1.5`} type="number" min="0" placeholder="No maximum" value={filters.maxRent} onChange={(event) => setFilters({ ...filters, maxRent: event.target.value })} /></label>
            <label className="block text-xs font-semibold text-slate-600 sm:col-span-2">Property type<select className={`${fieldClass} mt-1.5`} value={filters.propertyType} onChange={(event) => setFilters({ ...filters, propertyType: event.target.value })}><option value="">Any property type</option>{['Apartment', 'House', 'Villa', 'PG', 'Room', 'Studio', 'Other'].map((type) => <option key={type} value={type}>{type}</option>)}</select></label>
            <button className="home-button mt-1 inline-flex items-center justify-center gap-2 rounded-lg bg-forest-800 px-4 py-3.5 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-forest-700 sm:col-span-2" type="submit">Search homes <span aria-hidden="true">→</span></button>
          </form>
          <button type="button" onClick={clearFilters} className="mt-3 w-full py-1 text-center text-xs font-semibold text-slate-500 transition hover:text-forest-700">Clear filters</button>
        </div>
      </div>
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-[#f9faf7]/20 to-transparent" />
    </section>
    <main className="mx-auto max-w-7xl px-4 pb-16 pt-14 sm:px-6 md:pt-20 lg:px-8">
      <ErrorMessage>{error}</ErrorMessage>
      <section aria-labelledby="featured-heading" className="home-section mt-2">
        <div className="mb-7 flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[.18em] text-forest-600">Hand-picked for you</p><h2 id="featured-heading" className="mt-2 text-3xl font-semibold tracking-tight text-forest-800">Featured homes</h2><p className="mt-2 max-w-lg text-sm leading-6 text-slate-500">A few of the latest places listed by local owners.</p></div><Link to="/properties" className="group inline-flex items-center gap-2 pb-1 text-sm font-bold text-forest-700">View all properties <span className="transition-transform group-hover:translate-x-1" aria-hidden="true">→</span></Link></div>
        {loading ? <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3" aria-label="Loading featured homes">{[1, 2, 3].map((item) => <div key={item} className="overflow-hidden rounded-xl border border-slate-100 bg-white"><div className="h-56 animate-pulse bg-slate-100" /><div className="space-y-3 p-5"><div className="h-4 w-2/3 animate-pulse rounded bg-slate-100" /><div className="h-3 w-1/2 animate-pulse rounded bg-slate-100" /><div className="h-4 w-1/3 animate-pulse rounded bg-slate-100" /></div></div>)}</div> : featured.length ? <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{featured.map((item, index) => <article key={item._id} className="home-property-card group overflow-hidden rounded-xl border border-slate-100 bg-white shadow-[0_8px_28px_rgba(20,49,39,.07)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(20,49,39,.14)]" style={{ animationDelay: `${index * 70}ms` }}>
          <div className="relative h-56 overflow-hidden bg-slate-100"><Link to={`/properties/${item._id}`} aria-label={`View ${item.title}`}><img src={item.images?.[0] || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=80'} alt={item.title} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" onError={(event) => { event.currentTarget.src = 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=80'; }} /></Link><span className="absolute left-4 top-4 rounded-md bg-white/95 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide text-forest-700 shadow-sm">{item.available ? 'Available now' : 'Unavailable'}</span>{user?.role === 'tenant' && <button type="button" aria-label={favorites.includes(item._id) ? 'Remove favorite' : 'Add favorite'} aria-pressed={favorites.includes(item._id)} onClick={() => toggleFavorite(item._id)} className={`absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full bg-white/95 text-2xl leading-none shadow-sm transition hover:scale-110 hover:text-rose-600 ${favorites.includes(item._id) ? 'text-rose-600' : 'text-slate-500'}`}>{favorites.includes(item._id) ? '♥' : '♡'}</button>}</div>
          <div className="p-5"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="truncate text-xs font-semibold text-slate-500">{[item.locality, item.city].filter(Boolean).join(', ') || item.address}</p><h3 className="mt-1 truncate text-lg font-bold text-forest-800">{item.title}</h3></div><p className="shrink-0 text-right text-lg font-extrabold text-forest-700">₹{Number(item.rent).toLocaleString('en-IN')}<span className="block text-[10px] font-semibold text-slate-400">per month</span></p></div><div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-slate-100 pt-4 text-xs font-semibold text-slate-600"><span>{item.bhk ?? item.bedrooms ?? '—'} bedrooms</span>{item.bathrooms != null && <><span className="h-1 w-1 rounded-full bg-slate-300" /><span>{item.bathrooms} bathrooms</span></>}<span className="h-1 w-1 rounded-full bg-slate-300" /><span>{item.propertyType || 'Rental'}</span></div><Link to={`/properties/${item._id}`} className="mt-5 flex items-center justify-between rounded-lg border border-forest-100 px-4 py-3 text-sm font-bold text-forest-800 transition hover:border-forest-700 hover:bg-forest-50">View home details <span aria-hidden="true">↗</span></Link></div>
        </article>)}</div> : <div className="rounded-xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center"><span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-forest-50 text-xl text-forest-700" aria-hidden="true">⌂</span><h3 className="mt-4 text-lg font-bold text-forest-800">Your next home is waiting</h3><p className="mt-2 text-sm text-slate-500">There are no featured homes just yet. Explore all current listings to find a place that fits.</p><Link to="/properties" className="mt-5 inline-flex rounded-lg bg-forest-800 px-5 py-3 text-sm font-bold text-white transition hover:bg-forest-700">Explore all properties</Link></div>}
      </section>
      <section className="home-neighborhood mt-16 overflow-hidden rounded-xl bg-forest-800 text-white">
        <div className="grid md:grid-cols-[1fr_auto] md:items-center"><div className="p-7 sm:p-10"><p className="text-xs font-bold uppercase tracking-[.18em] text-emerald-200">Find your neighborhood</p><h2 className="mt-3 text-2xl font-semibold sm:text-3xl">Feel at home, wherever you land.</h2><p className="mt-3 max-w-xl text-sm leading-6 text-white/75">Explore rentals around the places that make your day. Start with nearby homes and discover a community that fits.</p><Link className="home-button mt-6 inline-flex items-center gap-2 rounded-lg bg-white px-5 py-3 text-sm font-bold text-forest-800 transition hover:-translate-y-0.5 hover:bg-forest-50" to="/nearby">Explore nearby homes <span aria-hidden="true">→</span></Link></div><div className="hidden h-full min-h-56 w-64 bg-cover bg-center md:block" role="img" aria-label="Light-filled modern home interior" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=800&q=80)' }} /></div>
      </section>
      <section className="home-section py-16"><div className="mb-7"><p className="text-xs font-bold uppercase tracking-[.18em] text-forest-600">Simple by design</p><h2 className="mt-2 text-3xl font-semibold tracking-tight text-forest-800">How NearNest works</h2></div><div className="grid gap-0 divide-y divide-slate-200 border-y border-slate-200 md:grid-cols-3 md:divide-x md:divide-y-0">{[['01', 'Search your way', 'Filter homes by neighborhood, budget, type, and the details that matter to you.'], ['02', 'Explore the details', 'Review photos, amenities, rent, and the home location on a map.'], ['03', 'Talk to the owner', 'Send an inquiry and connect directly about your next move.']].map(([number, title, body]) => <div key={number} className="py-6 md:px-7 md:first:pl-0 md:last:pr-0"><span className="text-xs font-bold tracking-[.15em] text-forest-600">{number}</span><h3 className="mt-3 text-lg font-bold text-forest-800">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-500">{body}</p></div>)}</div></section>
      <section className="home-owner-cta flex flex-col gap-5 border-t border-slate-200 pt-9 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-xs font-bold uppercase tracking-[.18em] text-forest-600">For property owners</p><h2 className="mt-2 text-2xl font-semibold text-forest-800">Good homes deserve good tenants.</h2></div><Link to="/register" className="home-button inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-forest-800 px-5 py-3.5 text-sm font-bold text-white transition hover:-translate-y-0.5 hover:bg-forest-700">List your property <span aria-hidden="true">↗</span></Link></section>
    </main>
  </div>;
}

export function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', role: 'tenant' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  async function submit(event) {
    event.preventDefault(); setBusy(true); setError('');
    try {
      const result = await register(form);
      if (result.user) navigate(result.user.role === 'owner' ? '/owner' : '/properties');
      else navigate('/login', { state: { message: 'Account created. Please log in.' } });
    } catch (err) { setError(errorMessage(err)); } finally { setBusy(false); }
  }
  return <AuthForm title="Create your account" description="Find a home or share a rental with the community." onSubmit={submit} error={error} busy={busy} submitLabel="Create account">
    <Input label="Full name" autoComplete="name" required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
    <Input label="Email address" type="email" autoComplete="email" required value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
    <Input label="Phone number" type="tel" required value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} />
    <Input label="Password (at least 6 characters)" type="password" minLength="6" autoComplete="new-password" required value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} />
    <Select label="I am a" value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value })}><option value="tenant">Tenant looking for a home</option><option value="owner">Property owner</option></Select>
  </AuthForm>;
}

function AuthForm({ title, description, children, onSubmit, error, busy, submitLabel }) {
  return <PageContainer className="max-w-xl"><div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-card sm:p-9"><SectionTitle eyebrow="NearNest account" title={title} description={description} /><form onSubmit={onSubmit} className="space-y-4"><ErrorMessage>{error}</ErrorMessage>{children}<Button className="w-full" disabled={busy}>{busy ? 'Please wait...' : submitLabel}</Button></form></div></PageContainer>;
}

export function Properties() {
  const location = useLocation();
  const [filters, setFilters] = useState(() => ({ available: 'true', ...Object.fromEntries(new URLSearchParams(location.search)) }));
  const [appliedFilters, setAppliedFilters] = useState(() => ({ available: 'true', ...Object.fromEntries(new URLSearchParams(location.search)) }));
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const load = useCallback(async () => {
    setLoading(true); setError('');
    try { setProperties(asArray(await propertyService.list(appliedFilters), ['properties'])); } catch (err) { setError(errorMessage(err)); } finally { setLoading(false); }
  }, [appliedFilters]);
  useEffect(() => { load(); }, [load]);
  useEffect(() => { if (user?.role === 'tenant') favoriteService.list().then((data) => setFavorites(asArray(data, ['favorites']).map((item) => item.property?._id || item.property || item._id))).catch(() => {}); }, [user]);
  async function toggleFavorite(id) {
    try { if (favorites.includes(id)) { await favoriteService.remove(id); setFavorites((items) => items.filter((item) => item !== id)); } else { await favoriteService.add(id); setFavorites((items) => [...items, id]); } } catch (err) { setError(errorMessage(err)); }
  }
  return <PageContainer><SectionTitle eyebrow="Browse rentals" title="Find a home that fits" description="Search by neighborhood, budget, and the details that matter to you." /><PropertyFilter filters={filters} setFilters={setFilters} onSubmit={() => setAppliedFilters(filters)} /><ErrorMessage>{error}</ErrorMessage>
    {loading ? <Loader label="Finding available homes..." /> : properties.length ? <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{properties.map((item) => <PropertyCard key={item._id} property={item} isFavorite={favorites.includes(item._id)} onFavorite={user?.role === 'tenant' ? toggleFavorite : null} />)}</div> : <div className="mt-8"><EmptyState title="No homes match those filters">Try widening your search or adjusting the rent range.</EmptyState></div>}
  </PageContainer>;
}

export function PropertyDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const [property, setProperty] = useState(null);
  const [error, setError] = useState('');
  const [favorite, setFavorite] = useState(false);
  const [message, setMessage] = useState('');
  const [phone, setPhone] = useState(user?.phone || '');
  const [notice, setNotice] = useState('');
  useEffect(() => {
    propertyService.get(id).then((data) => setProperty(data.property || data)).catch((err) => setError(errorMessage(err)));
    if (user?.role === 'tenant') favoriteService.list().then((data) => setFavorite(asArray(data, ['favorites']).some((item) => (item.property?._id || item.property) === id))).catch(() => {});
  }, [id, user]);
  async function sendInquiry(event) {
    event.preventDefault(); setNotice(''); setError('');
    try { await inquiryService.create({ property: id, message, phone }); setNotice('Your inquiry has been sent to the owner.'); setMessage(''); } catch (err) { setError(errorMessage(err)); }
  }
  async function toggleFavorite() {
    try { if (favorite) await favoriteService.remove(id); else await favoriteService.add(id); setFavorite(!favorite); } catch (err) { setError(errorMessage(err)); }
  }
  if (error && !property) return <PageContainer><ErrorMessage>{error}</ErrorMessage><TextLink to="/properties">Back to rentals</TextLink></PageContainer>;
  if (!property) return <Loader label="Loading home details..." />;
  return <PageContainer><ErrorMessage>{error}</ErrorMessage><div className="grid gap-8 lg:grid-cols-[1.4fr_.8fr]"><div>
    <div className="grid gap-3 overflow-hidden rounded-2xl sm:grid-cols-2"><img className="h-72 w-full rounded-2xl object-cover sm:col-span-2" src={property.images?.[0] || 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80'} alt={property.title} />{property.images?.slice(1, 3).map((image) => <img key={image} className="h-40 w-full rounded-xl object-cover" src={image} alt="" />)}</div>
    <div className="mt-7"><p className="text-sm font-semibold text-forest-600">{[property.locality, property.city].filter(Boolean).join(', ')}</p><h1 className="mt-2 text-3xl font-black text-forest-800">{property.title}</h1><p className="mt-4 leading-7 text-slate-600">{property.description}</p><div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">{[['Bedrooms', `${property.bhk} BHK`], ['Type', property.propertyType], ['Furnishing', property.furnishing], ['Deposit', `₹${Number(property.deposit || 0).toLocaleString('en-IN')}`]].map(([title, value]) => <div key={title} className="rounded-xl bg-sand p-4"><p className="text-xs text-slate-500">{title}</p><p className="mt-1 font-bold">{value}</p></div>)}</div>
      <h2 className="mt-8 text-xl font-bold">Amenities</h2><div className="mt-3 flex flex-wrap gap-2">{(property.amenities || []).length ? property.amenities.map((item) => <span key={item} className="rounded-full bg-forest-50 px-3 py-2 text-sm text-forest-800">{item}</span>) : <span className="text-sm text-slate-500">No amenities listed.</span>}</div>
      <h2 className="mb-3 mt-8 text-xl font-bold">Location</h2><p className="mb-3 text-sm text-slate-500">{property.address}, {property.locality}, {property.city}</p><PropertyMap properties={[property]} selected={property} />
    </div></div>
    <aside className="h-fit rounded-2xl border border-slate-100 bg-white p-6 shadow-card lg:sticky lg:top-28"><p className="text-3xl font-black text-forest-800">₹{Number(property.rent).toLocaleString('en-IN')}<span className="text-base font-medium text-slate-500"> / month</span></p><p className={`mt-2 text-sm font-semibold ${property.available ? 'text-forest-600' : 'text-rose-600'}`}>{property.available ? 'Available for rent' : 'Currently unavailable'}</p><p className="mt-5 border-t border-slate-100 pt-5 text-sm text-slate-500">Listed by <strong className="text-slate-800">{property.owner?.name || 'Property owner'}</strong></p>{user?.role === 'tenant' && <><Button variant="secondary" className="mt-5 w-full" onClick={toggleFavorite}>{favorite ? '♥ Saved to favorites' : '♡ Save this home'}</Button><h2 className="mt-7 font-bold">Interested in this home?</h2><p className="mt-1 text-sm text-slate-500">Send the owner a message to start a conversation.</p><form className="mt-4 space-y-3" onSubmit={sendInquiry}><Input label="Your phone" type="tel" required value={phone} onChange={(event) => setPhone(event.target.value)} /><label className="block text-sm font-medium text-slate-700">Message<textarea required minLength="5" rows="4" className="mt-1.5 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-forest-600" value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Hi, I am interested in this property..." /></label><ErrorMessage>{error}</ErrorMessage>{notice && <p className="text-sm text-forest-700">{notice}</p>}<Button className="w-full">Send inquiry</Button></form></>}{!user && <p className="mt-5 text-sm text-slate-500"><TextLink to="/login">Log in</TextLink> as a tenant to contact the owner.</p>}</aside>
  </div></PageContainer>;
}

export function NearbyProperties() {
  const [properties, setProperties] = useState([]);
  const [coordinates, setCoordinates] = useState({ lat: '17.3850', lng: '78.4867', radius: '10' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const geolocation = useGeolocation();
  async function search(event) {
    event?.preventDefault(); setLoading(true); setError('');
    try { setProperties(asArray(await propertyService.nearby(coordinates), ['properties'])); } catch (err) { setError(errorMessage(err)); } finally { setLoading(false); }
  }
  useEffect(() => { search(); }, []);
  function locate() {
    geolocation.locate().then(({ latitude, longitude }) => {
      setCoordinates((current) => ({ ...current, lat: latitude.toFixed(6), lng: longitude.toFixed(6) }));
    }).catch(() => {});
  }
  return <PageContainer><SectionTitle eyebrow="Around you" title="Nearby rentals" description="Search homes within a radius of your chosen location. Coordinates default to Hyderabad for demonstration." />
    <form onSubmit={search} className="mb-6 grid gap-3 rounded-2xl bg-white p-4 shadow-sm sm:grid-cols-2 lg:grid-cols-[1fr_1fr_1fr_auto_auto]"><Input label="Latitude" type="number" step="any" required value={coordinates.lat} onChange={(e) => setCoordinates({ ...coordinates, lat: e.target.value })} /><Input label="Longitude" type="number" step="any" required value={coordinates.lng} onChange={(e) => setCoordinates({ ...coordinates, lng: e.target.value })} /><Input label="Radius (km)" type="number" min="1" max="100" required value={coordinates.radius} onChange={(e) => setCoordinates({ ...coordinates, radius: e.target.value })} /><div className="flex items-end"><Button type="button" variant="secondary" onClick={locate}>Use my location</Button></div><div className="flex items-end"><Button className="w-full">Search area</Button></div></form>
    <ErrorMessage>{error || geolocation.error}</ErrorMessage><div className="grid gap-7 lg:grid-cols-[1.1fr_.9fr]"><div className="h-[440px] overflow-hidden rounded-2xl border border-slate-100"><PropertyMap properties={properties} center={[Number(coordinates.lat), Number(coordinates.lng)]} /></div><div>{loading ? <Loader /> : properties.length ? <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">{properties.map((item) => <PropertyCard key={item._id} property={item} />)}</div> : <EmptyState title="No homes in this radius">Increase your radius or try a nearby location.</EmptyState>}</div></div>
  </PageContainer>;
}

export function Favorites() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const load = useCallback(async () => { try { const data = await favoriteService.list(); setProperties(asArray(data, ['favorites']).map((item) => item.property).filter(Boolean)); } catch (err) { setError(errorMessage(err)); } finally { setLoading(false); } }, []);
  useEffect(() => { load(); }, [load]);
  async function remove(id) { try { await favoriteService.remove(id); setProperties((current) => current.filter((item) => item._id !== id)); } catch (err) { setError(errorMessage(err)); } }
  return <PageContainer><SectionTitle eyebrow="Your shortlist" title="Favorite homes" description="Keep your most promising rental options in one place." /><ErrorMessage>{error}</ErrorMessage>{loading ? <Loader /> : properties.length ? <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{properties.map((item) => <PropertyCard key={item._id} property={item} isFavorite onFavorite={remove} />)}</div> : <EmptyState title="No favorites yet"><TextLink to="/properties">Explore homes</TextLink> and save the ones you love.</EmptyState>}</PageContainer>;
}

export function MyInquiries() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => { inquiryService.mine().then((data) => setItems(asArray(data, ['inquiries']))).catch((err) => setError(errorMessage(err))).finally(() => setLoading(false)); }, []);
  return <PageContainer><SectionTitle eyebrow="Your conversations" title="My inquiries" /><ErrorMessage>{error}</ErrorMessage>{loading ? <Loader /> : items.length ? <div className="space-y-4">{items.map((item) => <InquiryCard key={item._id} inquiry={item} />)}</div> : <EmptyState title="No inquiries sent">When you contact an owner, your inquiry will appear here.</EmptyState>}</PageContainer>;
}

function InquiryCard({ inquiry, ownerView = false, onStatus }) {
  const property = inquiry.property || {};
  return <article className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm"><div className="flex flex-wrap justify-between gap-3"><div><h3 className="font-bold text-forest-800">{property.title || 'Rental property'}</h3><p className="mt-1 text-sm text-slate-500">{ownerView ? `From ${inquiry.tenant?.name || 'Tenant'} · ${inquiry.phone}` : `Owner: ${inquiry.owner?.name || 'Property owner'}`}</p></div><span className="h-fit rounded-full bg-forest-50 px-3 py-1 text-xs font-bold capitalize text-forest-700">{inquiry.status}</span></div><p className="mt-4 text-sm leading-6 text-slate-600">{inquiry.message}</p>{ownerView && <div className="mt-4 flex gap-2"><Select aria-label="Update inquiry status" value={inquiry.status} onChange={(event) => onStatus(inquiry._id, event.target.value)}><option value="pending">Pending</option><option value="contacted">Contacted</option><option value="closed">Closed</option></Select><TextLink className="self-center text-sm" to={`/properties/${property._id}`}>View property →</TextLink></div>}{!ownerView && property._id && <Link className="mt-3 inline-block text-sm font-semibold text-forest-700" to={`/properties/${property._id}`}>View property →</Link>}</article>;
}

export function OwnerDashboard() {
  const [properties, setProperties] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [error, setError] = useState('');
  useEffect(() => {
    Promise.all([propertyService.mine(), inquiryService.owner()]).then(([homes, contacts]) => { setProperties(asArray(homes, ['properties'])); setInquiries(asArray(contacts, ['inquiries'])); }).catch((err) => setError(errorMessage(err)));
  }, []);
  return <PageContainer><div className="flex flex-wrap items-end justify-between gap-4"><SectionTitle eyebrow="Owner workspace" title="Welcome to your dashboard" description="Manage your listings and respond to tenant inquiries." /><Link to="/add-property" className="rounded-xl bg-forest-800 px-5 py-3 font-semibold text-white">+ Add a property</Link></div><ErrorMessage>{error}</ErrorMessage><div className="mb-8 grid gap-4 sm:grid-cols-3">{[['Your listings', properties.length], ['Available homes', properties.filter((item) => item.available).length], ['Inquiries', inquiries.length]].map(([label, count]) => <div key={label} className="rounded-2xl bg-white p-5 shadow-sm"><p className="text-sm text-slate-500">{label}</p><p className="mt-2 text-3xl font-black text-forest-800">{count}</p></div>)}</div><div className="grid gap-4 md:grid-cols-2"><Link className="rounded-2xl border border-forest-100 bg-forest-50 p-6 font-bold text-forest-800" to="/my-properties">Manage my properties →</Link><Link className="rounded-2xl border border-forest-100 bg-forest-50 p-6 font-bold text-forest-800" to="/owner-inquiries">View tenant inquiries →</Link></div></PageContainer>;
}

const emptyProperty = { title: '', description: '', rent: '', deposit: '', address: '', city: '', locality: '', bhk: '1', propertyType: 'Apartment', furnishing: 'Unfurnished', amenities: '', images: '', latitude: '', longitude: '', available: true };

export function PropertyForm({ editing = false }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(emptyProperty);
  const [loading, setLoading] = useState(editing);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => {
    if (!editing) return;
    propertyService.get(id).then((data) => {
      const home = data.property || data;
      setForm({ ...emptyProperty, ...home, amenities: (home.amenities || []).join(', '), images: (home.images || []).join(', ') });
    }).catch((err) => setError(errorMessage(err))).finally(() => setLoading(false));
  }, [editing, id]);
  const update = (key) => (event) => setForm((current) => ({ ...current, [key]: event.target.type === 'checkbox' ? event.target.checked : event.target.value }));
  async function submit(event) {
    event.preventDefault(); setBusy(true); setError('');
    const payload = { ...form, rent: Number(form.rent), deposit: Number(form.deposit || 0), bhk: Number(form.bhk), latitude: Number(form.latitude), longitude: Number(form.longitude), amenities: form.amenities.split(',').map((item) => item.trim()).filter(Boolean), images: form.images.split(',').map((item) => item.trim()).filter(Boolean), location: `${form.locality}, ${form.city}` };
    try { if (editing) await propertyService.update(id, payload); else await propertyService.create(payload); navigate('/my-properties'); } catch (err) { setError(errorMessage(err)); } finally { setBusy(false); }
  }
  if (loading) return <Loader />;
  const fields = [['title', 'Property title', 'text'], ['rent', 'Monthly rent (₹)', 'number'], ['deposit', 'Security deposit (₹)', 'number'], ['address', 'Street address', 'text'], ['city', 'City', 'text'], ['locality', 'Locality / neighborhood', 'text'], ['latitude', 'Latitude', 'number'], ['longitude', 'Longitude', 'number']];
  return <PageContainer className="max-w-4xl"><SectionTitle eyebrow="Owner workspace" title={editing ? 'Edit your property' : 'List a rental property'} description="Share clear, accurate details so tenants can find the right home." /><form onSubmit={submit} className="space-y-5 rounded-2xl border border-slate-100 bg-white p-5 shadow-card sm:p-8"><ErrorMessage>{error}</ErrorMessage><div className="grid gap-4 sm:grid-cols-2">{fields.map(([key, label, type]) => <Input key={key} label={label} type={type} step={type === 'number' && ['latitude', 'longitude'].includes(key) ? 'any' : undefined} min={type === 'number' && !['latitude', 'longitude'].includes(key) ? 0 : undefined} required={key !== 'deposit'} value={form[key] ?? ''} onChange={update(key)} />)}<Select label="Bedrooms" value={form.bhk} onChange={update('bhk')}>{[1, 2, 3, 4, 5, 6].map((n) => <option key={n} value={n}>{n} BHK</option>)}</Select><Select label="Property type" value={form.propertyType} onChange={update('propertyType')}>{['Apartment', 'House', 'Villa', 'PG', 'Room'].map((item) => <option key={item}>{item}</option>)}</Select><Select label="Furnishing" value={form.furnishing} onChange={update('furnishing')}>{['Fully Furnished', 'Semi Furnished', 'Unfurnished'].map((item) => <option key={item}>{item}</option>)}</Select></div><label className="block text-sm font-medium">Description<textarea required rows="4" className="mt-1.5 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-forest-600" value={form.description} onChange={update('description')} /></label><Input label="Amenities (comma separated)" placeholder="Parking, Lift, Balcony" value={form.amenities} onChange={update('amenities')} /><Input label="Image URLs (comma separated)" placeholder="https://example.com/home.jpg" value={form.images} onChange={update('images')} /><label className="flex items-center gap-3 text-sm font-medium"><input type="checkbox" checked={Boolean(form.available)} onChange={update('available')} />Available for rent</label><div className="flex gap-3"><Button disabled={busy}>{busy ? 'Saving...' : editing ? 'Save changes' : 'Publish property'}</Button><Button type="button" variant="secondary" onClick={() => navigate('/my-properties')}>Cancel</Button></div></form></PageContainer>;
}

export function MyProperties() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const load = useCallback(() => propertyService.mine().then((data) => setItems(asArray(data, ['properties']))).catch((err) => setError(errorMessage(err))).finally(() => setLoading(false)), []);
  useEffect(() => { load(); }, [load]);
  async function remove(id) {
    if (!window.confirm('Delete this property listing?')) return;
    try { await propertyService.remove(id); setItems((current) => current.filter((item) => item._id !== id)); } catch (err) { setError(errorMessage(err)); }
  }
  async function toggle(item) {
    try { const data = await propertyService.update(item._id, { available: !item.available }); const updated = data.property || data; setItems((current) => current.map((property) => property._id === item._id ? { ...property, ...updated, available: !item.available } : property)); } catch (err) { setError(errorMessage(err)); }
  }
  return <PageContainer><div className="flex flex-wrap items-end justify-between gap-4"><SectionTitle eyebrow="Owner workspace" title="My properties" /><Link to="/add-property" className="mb-7 rounded-xl bg-forest-800 px-5 py-3 font-semibold text-white">+ Add property</Link></div><ErrorMessage>{error}</ErrorMessage>{loading ? <Loader /> : items.length ? <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{items.map((item) => <div key={item._id} className="rounded-2xl bg-white p-4 shadow-card"><PropertyCard property={item} /><div className="mt-3 grid grid-cols-2 gap-2"><Link className="rounded-lg border border-slate-200 p-2 text-center text-sm font-semibold" to={`/edit-property/${item._id}`}>Edit</Link><button className="rounded-lg border border-slate-200 p-2 text-sm font-semibold" onClick={() => toggle(item)}>{item.available ? 'Mark unavailable' : 'Mark available'}</button><button className="col-span-2 rounded-lg bg-rose-50 p-2 text-sm font-semibold text-rose-700" onClick={() => remove(item._id)}>Delete property</button></div></div>)}</div> : <EmptyState title="No properties listed">Add your first property to get started.</EmptyState>}</PageContainer>;
}

export function OwnerInquiries() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  useEffect(() => { inquiryService.owner().then((data) => setItems(asArray(data, ['inquiries']))).catch((err) => setError(errorMessage(err))).finally(() => setLoading(false)); }, []);
  async function update(id, status) {
    try { await inquiryService.updateStatus(id, status); setItems((current) => current.map((item) => item._id === id ? { ...item, status } : item)); } catch (err) { setError(errorMessage(err)); }
  }
  return <PageContainer><SectionTitle eyebrow="Owner workspace" title="Tenant inquiries" description="Follow up with tenants and keep inquiry statuses up to date." /><ErrorMessage>{error}</ErrorMessage>{loading ? <Loader /> : items.length ? <div className="space-y-4">{items.map((item) => <InquiryCard key={item._id} inquiry={item} ownerView onStatus={update} />)}</div> : <EmptyState title="No inquiries received">When tenants contact you, their messages will show up here.</EmptyState>}</PageContainer>;
}

export function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState('');
  useEffect(() => { adminService.stats().then((data) => setStats(data.stats || data)).catch((err) => setError(errorMessage(err))); }, []);
  const cards = [['Total users', stats?.totalUsers ?? 0], ['Tenants', stats?.totalTenants ?? 0], ['Owners', stats?.totalOwners ?? 0], ['Properties', stats?.totalProperties ?? 0], ['Available homes', stats?.availableProperties ?? 0], ['Inquiries', stats?.totalInquiries ?? 0]];
  return <PageContainer><SectionTitle eyebrow="Administration" title="Platform overview" description="A quick view of NearNest activity and management tools." /><ErrorMessage>{error}</ErrorMessage>{stats ? <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{cards.map(([label, number]) => <div key={label} className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm"><p className="text-sm text-slate-500">{label}</p><p className="mt-2 text-4xl font-black text-forest-800">{number}</p></div>)}</div> : !error && <Loader />}<div className="mt-8 flex flex-wrap gap-3"><Link to="/admin/users" className="rounded-xl bg-forest-800 px-5 py-3 font-semibold text-white">Manage users</Link><Link to="/admin/properties" className="rounded-xl border border-slate-200 px-5 py-3 font-semibold">Manage properties</Link></div></PageContainer>;
}

export function UsersManagement() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  useEffect(() => { adminService.users().then((data) => setItems(asArray(data, ['users']))).catch((err) => setError(errorMessage(err))).finally(() => setLoading(false)); }, []);
  async function remove(id) {
    if (!window.confirm('Delete this user account?')) return;
    try { await adminService.deleteUser(id); setItems((current) => current.filter((item) => item._id !== id)); } catch (err) { setError(errorMessage(err)); }
  }
  return <PageContainer><SectionTitle eyebrow="Administration" title="User management" /><ErrorMessage>{error}</ErrorMessage>{loading ? <Loader /> : <div className="overflow-x-auto rounded-2xl border border-slate-100 bg-white shadow-sm"><table className="w-full min-w-[600px] text-left text-sm"><thead className="bg-sand text-slate-600"><tr>{['Name', 'Email', 'Phone', 'Role', 'Joined', 'Action'].map((label) => <th key={label} className="px-5 py-4 font-bold">{label}</th>)}</tr></thead><tbody>{items.map((user) => <tr key={user._id} className="border-t border-slate-100"><td className="px-5 py-4 font-semibold">{user.name}</td><td className="px-5 py-4">{user.email}</td><td className="px-5 py-4">{user.phone || '—'}</td><td className="px-5 py-4 capitalize">{user.role}</td><td className="px-5 py-4">{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}</td><td className="px-5 py-4"><button className="font-semibold text-rose-600" onClick={() => remove(user._id)}>Delete</button></td></tr>)}</tbody></table>{!items.length && <p className="p-6 text-center text-slate-500">No users found.</p>}</div>}</PageContainer>;
}

export function PropertiesManagement() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  useEffect(() => { adminService.properties().then((data) => setItems(asArray(data, ['properties']))).catch((err) => setError(errorMessage(err))).finally(() => setLoading(false)); }, []);
  async function remove(id) {
    if (!window.confirm('Remove this property listing?')) return;
    try { await adminService.deleteProperty(id); setItems((current) => current.filter((item) => item._id !== id)); } catch (err) { setError(errorMessage(err)); }
  }
  async function toggle(item) {
    try { await adminService.updateAvailability(item._id, !item.available); setItems((current) => current.map((property) => property._id === item._id ? { ...property, available: !item.available } : property)); } catch (err) { setError(errorMessage(err)); }
  }
  return <PageContainer><SectionTitle eyebrow="Administration" title="Property management" /><ErrorMessage>{error}</ErrorMessage>{loading ? <Loader /> : items.length ? <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{items.map((item) => <div key={item._id} className="rounded-2xl bg-white p-4 shadow-card"><PropertyCard property={item} /><div className="mt-3 flex gap-2"><Button className="flex-1" variant="secondary" onClick={() => toggle(item)}>{item.available ? 'Mark unavailable' : 'Mark available'}</Button><Button variant="danger" onClick={() => remove(item._id)}>Remove</Button></div></div>)}</div> : <EmptyState title="No properties listed">Property listings will appear here.</EmptyState>}</PageContainer>;
}

export function NotFound() {
  return <PageContainer className="grid place-items-center text-center"><div><p className="text-7xl font-black text-forest-100">404</p><h1 className="mt-3 text-3xl font-bold text-forest-800">This page wandered off</h1><p className="mt-3 text-slate-500">The page you are looking for does not exist.</p><Link to="/" className="mt-6 inline-block rounded-xl bg-forest-800 px-5 py-3 font-semibold text-white">Back home</Link></div></PageContainer>;
}

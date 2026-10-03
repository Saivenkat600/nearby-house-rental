import { Link } from 'react-router-dom';
import { formatCurrency } from '../utils/formatters';

const placeholder = 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=80';

export default function PropertyCard({ property, onFavorite, isFavorite = false }) {
  const image = property.images?.[0] || placeholder;
  const place = [property.locality, property.city].filter(Boolean).join(', ');
  return <article className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-card transition hover:-translate-y-1">
    <div className="relative h-52 bg-slate-100"><img src={image} alt={property.title} className="h-full w-full object-cover" onError={(event) => { event.currentTarget.src = placeholder; }} /><span className={`absolute left-3 top-3 rounded-full px-3 py-1 text-xs font-bold ${property.available ? 'bg-forest-50 text-forest-700' : 'bg-slate-100 text-slate-600'}`}>{property.available ? 'Available' : 'Unavailable'}</span>
      {onFavorite && <button type="button" aria-label={isFavorite ? 'Remove favorite' : 'Add favorite'} className="absolute right-3 top-3 grid h-10 w-10 place-items-center rounded-full bg-white text-xl shadow hover:text-rose-600" onClick={() => onFavorite(property._id)}>{isFavorite ? '♥' : '♡'}</button>}
    </div>
    <div className="p-5"><div className="flex items-start justify-between gap-3"><h3 className="text-lg font-bold text-forest-800">{property.title}</h3><p className="shrink-0 font-extrabold text-forest-700">{formatCurrency(property.rent)}<span className="text-xs font-medium text-slate-400"> /mo</span></p></div>
      <p className="mt-1 text-sm text-slate-500">⌖ {place || property.address}</p><div className="mt-4 flex flex-wrap gap-2 text-xs font-medium text-slate-600"><span className="rounded-lg bg-sand px-2.5 py-1.5">{property.bhk} BHK</span><span className="rounded-lg bg-sand px-2.5 py-1.5">{property.propertyType}</span><span className="rounded-lg bg-sand px-2.5 py-1.5">{property.furnishing}</span></div>
      <Link to={`/properties/${property._id}`} className="mt-5 block rounded-xl border border-forest-100 py-3 text-center text-sm font-bold text-forest-800 hover:bg-forest-50">View details</Link>
    </div>
  </article>;
}

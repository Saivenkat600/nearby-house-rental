import { Button, Input, Select } from './UI';

export default function PropertyFilter({ filters, setFilters, onSubmit, compact = false }) {
  const set = (key) => (event) => setFilters((current) => ({ ...current, [key]: event.target.value }));
  return <form onSubmit={(event) => { event.preventDefault(); onSubmit(); }} className={`grid gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm md:grid-cols-2 ${compact ? 'lg:grid-cols-5' : 'lg:grid-cols-4'}`}>
    <Input label="Search area or title" placeholder="City, locality, keyword" value={filters.search || ''} onChange={set('search')} />
    <Input label="City" placeholder="Any city" value={filters.city || ''} onChange={set('city')} />
    <Input label="Max rent (₹)" type="number" min="0" placeholder="Any budget" value={filters.maxRent || ''} onChange={set('maxRent')} />
    <Select label="Property type" value={filters.propertyType || ''} onChange={set('propertyType')}><option value="">Any type</option>{['Apartment', 'House', 'Villa', 'PG', 'Room'].map((type) => <option key={type}>{type}</option>)}</Select>
    {!compact && <><Input label="Minimum rent (₹)" type="number" min="0" value={filters.minRent || ''} onChange={set('minRent')} /><Input label="Locality" placeholder="e.g. Madhapur" value={filters.locality || ''} onChange={set('locality')} /><Select label="Bedrooms" value={filters.bhk || ''} onChange={set('bhk')}><option value="">Any</option>{[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n} BHK</option>)}</Select><Select label="Furnishing" value={filters.furnishing || ''} onChange={set('furnishing')}><option value="">Any</option>{['Fully Furnished', 'Semi Furnished', 'Unfurnished'].map((value) => <option key={value}>{value}</option>)}</Select><Select label="Availability" value={filters.available ?? 'true'} onChange={set('available')}><option value="">Any status</option><option value="true">Available</option><option value="false">Unavailable</option></Select></>}
    <div className="flex items-end"><Button type="submit" className="w-full">Search homes</Button></div>
  </form>;
}

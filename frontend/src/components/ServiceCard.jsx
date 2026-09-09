export default function ServiceCard({ service, showPrice = false }) {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-card">
      {service.image && (
        <img src={service.image} alt={service.name} className="h-40 w-full rounded-t-2xl object-cover" loading="lazy" />
      )}
      <div className="flex flex-1 flex-col space-y-2 p-5">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-lg font-semibold text-slate-800">{service.name}</h3>
          <span className="text-xs uppercase tracking-wide text-primary">{service.category}</span>
        </div>
        <p className="flex-1 text-sm text-slate-600 line-clamp-3">{service.description}</p>
        {showPrice && (
          <p className="text-base font-bold text-accent">${service.price}</p>
        )}
      </div>
    </div>
  )
}

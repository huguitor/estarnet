export default function ServiceCard({ service, showPrice = false }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
      {service.image && (
        <img src={service.image} alt={service.name} className="h-40 w-full rounded-t-lg object-cover" loading="lazy" />
      )}
      <div className="space-y-2 p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-800">{service.name}</h3>
          <span className="text-xs uppercase tracking-wide text-primary">{service.category}</span>
        </div>
        <p className="text-sm text-slate-600 line-clamp-3">{service.description}</p>
        {showPrice && (
          <p className="text-base font-bold text-accent">${service.price}</p>
        )}
      </div>
    </div>
  )
}

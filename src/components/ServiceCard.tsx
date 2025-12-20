type Props = {
  name: string
  price?: number
  selected?: boolean
  onSelect: () => void
  subtitle?: string
}

export default function ServiceCard({ name, price, selected, onSelect, subtitle }: Props) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full text-left p-4 rounded-xl border transition shadow-sm mb-3 ${selected ? 'border-accent ring-2 ring-accent/40 bg-yellow-50' : 'border-gray-200 hover:border-black/60'}`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="font-semibold">{name}</p>
          {subtitle ? <p className="text-sm text-gray-600">{subtitle}</p> : null}
        </div>
        {typeof price === 'number' ? (
          <p className="text-primary font-bold">KSh {price.toLocaleString()}</p>
        ) : null}
      </div>
    </button>
  )
}

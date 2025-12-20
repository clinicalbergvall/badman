import { Card, Badge, Button } from '@/components/ui'
import type { BeforeAfterPhoto } from '@/lib/types'

interface CompletedJobsGalleryProps {
  photos: BeforeAfterPhoto[]
  maxItems?: number
  compact?: boolean
  onRemove?: (id: string) => void
}

export default function CompletedJobsGallery({
  photos,
  maxItems,
  compact,
  onRemove
}: CompletedJobsGalleryProps) {
  if (!photos || photos.length === 0) {
    return (
      <Card className="p-4 bg-white/80 border-dashed border-gray-200">
        <p className="text-sm text-gray-500">No completed jobs uploaded yet.</p>
      </Card>
    )
  }

  const visiblePhotos = maxItems ? photos.slice(0, maxItems) : photos

  return (
    <div className="space-y-4">
      <div
        className={`grid gap-4 ${compact ? 'md:grid-cols-1' : 'md:grid-cols-2'}`}
      >
        {visiblePhotos.map((photo) => (
          <Card key={photo.id} className="p-4 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  Transformation Spotlight
                </p>
                <p className="text-xs text-gray-500">
                  Uploaded {new Date(photo.uploadedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </p>
              </div>
              {photo.servicesUsed?.length ? (
                <Badge variant="warning" className="capitalize">
                  {photo.servicesUsed[0]}
                </Badge>
              ) : null}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <figure className="space-y-1">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Before</p>
                <img
                  src={photo.beforeImage}
                  alt={`Before cleaning ${photo.id}`}
                  className="w-full h-32 md:h-40 object-cover rounded-xl border border-gray-100"
                />
              </figure>
              <figure className="space-y-1">
                <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wide">After</p>
                <img
                  src={photo.afterImage}
                  alt={`After cleaning ${photo.id}`}
                  className="w-full h-32 md:h-40 object-cover rounded-xl border border-emerald-100"
                />
              </figure>
            </div>

            {photo.description && (
              <p className="text-sm text-gray-600">{photo.description}</p>
            )}

            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>By {photo.uploadedBy}</span>
              {photo.servicesUsed && photo.servicesUsed.length > 1 && (
                <span>{photo.servicesUsed.length} services</span>
              )}
            </div>

            {onRemove && (
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => onRemove(photo.id)}
              >
                Remove from gallery
              </Button>
            )}
          </Card>
        ))}
      </div>

      {maxItems && photos.length > maxItems && (
        <p className="text-xs text-gray-500 text-right">
          + {photos.length - maxItems} more showcased jobs
        </p>
      )}
    </div>
  )
}

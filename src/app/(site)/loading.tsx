// Shown at once while a storefront page loads (links don't prefetch, so this keeps taps feeling instant).
export default function SiteLoading() {
  return (
    <div className="container mx-auto animate-pulse px-3 pt-4 sm:px-4" aria-busy="true" aria-label="Loading">
      <div className="mb-4 h-4 w-40 rounded bg-gray-200" />
      <div className="mb-5 h-28 rounded-2xl bg-gray-200/80 sm:h-40" />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="overflow-hidden rounded-2xl border border-gray-100 bg-white">
            <div className="aspect-square bg-gray-100" />
            <div className="space-y-2 p-3">
              <div className="h-3 rounded bg-gray-200" />
              <div className="h-3 w-2/3 rounded bg-gray-200" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

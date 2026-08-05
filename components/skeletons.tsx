export function AdminRowsSkeleton({ count = 5 }: { count?: number }) {
  return <div className="admin-table card" aria-hidden="true">
    {Array.from({ length: count }).map((_, i) => <div className="admin-row" key={i}>
      <div className="skeleton-row-main">
        <span className="admin-thumb skeleton-shimmer" />
        <div className="skeleton-lines">
          <span className="skeleton-line skeleton-shimmer" style={{ width: 160 }} />
          <span className="skeleton-line skeleton-shimmer" style={{ width: 110, height: 10 }} />
        </div>
      </div>
      <div className="row-actions"><span className="skeleton-line skeleton-shimmer" style={{ width: 44 }} /></div>
    </div>)}
  </div>;
}

export function PhotoGridSkeleton({ count = 8, className = 'admin-photo-grid', cardClassName = 'admin-photo-card' }: { count?: number; className?: string; cardClassName?: string }) {
  return <div className={className} aria-hidden="true">{Array.from({ length: count }).map((_, i) => <div className={`${cardClassName} skeleton-shimmer`} key={i} />)}</div>;
}

export function DashboardCardsSkeleton() {
  return <div className="dashboard-cards" aria-hidden="true">{Array.from({ length: 4 }).map((_, i) => <div className="card admin-metric" key={i}>
    <span className="skeleton-line skeleton-shimmer" style={{ width: 18, height: 18, borderRadius: 6 }} />
    <span className="skeleton-line skeleton-shimmer" style={{ width: 48, height: 26 }} />
    <span className="skeleton-line skeleton-shimmer" style={{ width: 90 }} />
  </div>)}</div>;
}

export function FormSkeleton({ count = 5 }: { count?: number }) {
  return <div className="card editor" aria-hidden="true">{Array.from({ length: count }).map((_, i) => <div className="field" key={i}>
    <span className="skeleton-line skeleton-shimmer" style={{ width: 110, height: 10, marginBottom: 4 }} />
    <span className="skeleton-shimmer" style={{ display: 'block', height: 46, borderRadius: 10 }} />
  </div>)}</div>;
}

export function InvestorGroupsSkeleton({ groups = 2, photosPerGroup = 4 }: { groups?: number; photosPerGroup?: number }) {
  return <div className="investor-groups" aria-hidden="true">
    {Array.from({ length: groups }).map((_, i) => <div className="investor-group" key={i}>
      <div className="skeleton-group-head">
        <span className="skeleton-line skeleton-shimmer" style={{ width: 150, height: 15 }} />
        <span className="skeleton-line skeleton-shimmer" style={{ width: 100, height: 11 }} />
      </div>
      <div style={{ padding: '0 0 20px' }}>
        <PhotoGridSkeleton count={photosPerGroup} className="investor-photo-grid" cardClassName="investor-photo-card" />
      </div>
    </div>)}
  </div>;
}

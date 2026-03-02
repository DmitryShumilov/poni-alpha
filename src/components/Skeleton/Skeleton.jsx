import './Skeleton.css';

export const Skeleton = ({ width, height, borderRadius = 8, className = '', 'aria-label': ariaLabel }) => (
  <div
    className={`skeleton ${className}`}
    style={{
      width: width || '100%',
      height: height || '100%',
      borderRadius: borderRadius,
    }}
    role="status"
    aria-label={ariaLabel || 'Загрузка'}
    aria-busy="true"
  />
);

export const SkeletonKPICard = () => (
  <div className="kpi-card skeleton-card" role="status" aria-label="Загрузка KPI" aria-busy="true">
    <div className="kpi-content">
      <Skeleton height="16px" width="60%" className="skeleton-title" aria-label="Заголовок" />
      <Skeleton height="32px" width="80%" className="skeleton-value" aria-label="Значение" />
      <Skeleton height="12px" width="50%" className="skeleton-subtitle" aria-label="Подзаголовок" />
    </div>
  </div>
);

export const SkeletonChart = ({ height = 280 }) => (
  <div className="chart-card skeleton-card">
    <Skeleton height="20px" width="40%" className="skeleton-title" />
    <Skeleton height={height} width="100%" className="skeleton-chart" />
  </div>
);

export const SkeletonTable = ({ rows = 10 }) => (
  <div className="chart-card skeleton-card">
    <Skeleton height="20px" width="40%" className="skeleton-title" />
    <div className="skeleton-table">
      <div className="skeleton-table-header">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} height="16px" width="60px" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="skeleton-table-row">
          {Array.from({ length: 5 }).map((_, j) => (
            <Skeleton key={j} height="14px" width="80%" />
          ))}
        </div>
      ))}
    </div>
  </div>
);

export const SkeletonSidebar = () => (
  <aside className="sidebar skeleton-sidebar">
    <Skeleton height="40px" width="100%" className="skeleton-logo" />
    <Skeleton height="44px" width="100%" className="skeleton-btn" />
    <div className="skeleton-filters">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} height="44px" width="100%" className="skeleton-filter" />
      ))}
    </div>
  </aside>
);

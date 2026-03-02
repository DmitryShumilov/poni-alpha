const ChartCard = ({ title, subtitle, children, large = false, tall = false, wide = false, icon }) => (
  <div className={`chart-card ${large ? 'large' : ''} ${tall ? 'tall' : ''} ${wide ? 'wide' : ''}`}>
    <h3 className="chart-title">
      {icon && <span className="chart-icon" aria-hidden="true">{icon}</span>}
      <span>{title}</span>
      {subtitle && <span className="chart-subtitle">{subtitle}</span>}
    </h3>
    <div className="chart-container">{children}</div>
  </div>
);

export default ChartCard;

import { useState, useMemo } from 'react';
import './MarketShareCard.css';

const ITEMS_PER_PAGE = 10;

// Функция для вычисления цвета ячейки на основе значения (heatmap)
const getHeatmapColor = (value, maxValue) => {
  if (value === 0) return { backgroundColor: 'transparent', color: '#999' };

  // Нормализуем значение от 0 до 1
  const normalized = Math.min(value / maxValue, 1);

  // Градиент от светло-зелёного к тёмно-зелёному
  // rgba(82, 183, 136) - базовый зелёный
  const baseR = 82, baseG = 183, baseB = 136;

  // Чем выше значение, тем интенсивнее цвет
  const alpha = 0.15 + (normalized * 0.7); // от 0.15 до 0.85

  return {
    backgroundColor: `rgba(${baseR}, ${baseG}, ${baseB}, ${alpha})`,
    color: alpha > 0.5 ? '#fff' : '#1d3557',
    fontWeight: alpha > 0.5 ? '600' : '500'
  };
};

// Генерация SVG sparkline (мини-графика)
const Sparkline = ({ values, color = '#2ec4b6' }) => {
  const maxValue = Math.max(...values, 1);
  const minValue = Math.min(...values, 0);
  const range = maxValue - minValue || 1;
  
  const width = 80;
  const height = 24;
  const padding = 2;
  
  // Создаём точки для polyline
  const points = values.map((value, index) => {
    const x = padding + (index / (values.length - 1 || 1)) * (width - 2 * padding);
    const y = height - padding - ((value - minValue) / range) * (height - 2 * padding);
    return `${x},${y}`;
  }).join(' ');
  
  // Создаём area fill
  const areaPoints = `
    ${padding},${height} 
    ${points} 
    ${width - padding},${height}
  `;

  return (
    <svg 
      className="sparkline" 
      width={width} 
      height={height} 
      viewBox={`0 0 ${width} ${height}`}
      aria-hidden="true"
    >
      {/* Area fill */}
      <polygon
        points={areaPoints}
        fill={`${color}20`}
      />
      {/* Line */}
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Points */}
      {values.map((value, index) => {
        const x = padding + (index / (values.length - 1 || 1)) * (width - 2 * padding);
        const y = height - padding - ((value - minValue) / range) * (height - 2 * padding);
        return (
          <circle
            key={index}
            cx={x}
            cy={y}
            r="2"
            fill={color}
            className="sparkline-point"
          />
        );
      })}
    </svg>
  );
};

const MarketShareCard = ({ title, data, icon }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');

  // Находим максимальное значение для heatmap
  const maxValue = useMemo(() => {
    if (!data.matrix || data.matrix.length === 0) return 0;
    let max = 0;
    data.matrix.forEach(row => {
      data.months.forEach(month => {
        const value = parseFloat(row[month]) || 0;
        if (value > max) max = value;
      });
    });
    return max;
  }, [data.matrix, data.months]);

  // Фильтрация данных по поиску
  const filteredData = useMemo(() => {
    if (!searchQuery) return data.matrix;
    const query = searchQuery.toLowerCase();
    return data.matrix.filter(row =>
      row.product.toLowerCase().includes(query)
    );
  }, [data.matrix, searchQuery]);

  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentData = filteredData.slice(startIndex, endIndex);

  // Сброс на первую страницу при изменении поиска
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  return (
    <div className="chart-card market-share-card">
      <div className="market-share-header">
        <h3 className="chart-title">
          {icon && <span className={`chart-icon${icon === '%' ? ' percent-icon' : ''}`} aria-hidden="true">{icon}</span>}
          <span>{title}</span>
        </h3>
        <div className="market-share-search">
          <label htmlFor="market-share-search-input" className="visually-hidden">Поиск продукта</label>
          <input
            id="market-share-search-input"
            type="text"
            placeholder="Поиск продукта..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="search-input"
            aria-label="Поиск продукта по таблице"
          />
          <span className="search-icon" aria-hidden="true">🔍</span>
          {searchQuery && (
            <button
              className="clear-search"
              onClick={() => {
                setSearchQuery('');
                setCurrentPage(1);
              }}
              aria-label="Очистить поиск"
            >
              ✕
            </button>
          )}
        </div>
      </div>
      <div className="market-share-table-container">
        <table className="market-share-table" aria-label="Доля рынка по продуктам и месяцам">
          <caption className="visually-hidden">Таблица показывает долю рынка каждого продукта по месяцам и за год</caption>
          <thead>
            <tr>
              <th className="product-col">Продукт</th>
              {data.monthNames.map((name, idx) => (
                <th key={idx} className="month-col">{name}</th>
              ))}
              <th className="year-col">Год</th>
              <th className="trend-col">Тренд</th>
            </tr>
          </thead>
          <tbody>
            {currentData.map((row, idx) => {
              // Собираем значения по месяцам для sparkline
              const monthValues = data.months.map(month => parseFloat(row[month]) || 0);
              
              return (
                <tr key={idx}>
                  <td className="product-cell">{row.product}</td>
                  {data.months.map(month => {
                    const value = parseFloat(row[month]) || 0;
                    const style = getHeatmapColor(value, maxValue);
                    return (
                      <td
                        key={month}
                        className={`share-cell ${value > 0 ? 'has-value' : ''}`}
                        style={style}
                        title={`Доля: ${value}%`}
                      >
                        {row[month]}%
                      </td>
                    );
                  })}
                  <td
                    className="year-cell"
                    style={{
                      backgroundColor: `rgba(251, 133, 0, ${0.2 + (parseFloat(row.year) / 100) * 0.6})`
                    }}
                  >
                    <strong>{row.year}%</strong>
                  </td>
                  <td className="trend-cell">
                    <Sparkline values={monthValues} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {filteredData.length === 0 && searchQuery && (
        <div className="no-results">
          По запросу "{searchQuery}" ничего не найдено
        </div>
      )}

      {totalPages > 1 && (
        <div className="pagination">
          <button
            className="pagination-btn"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            ← Назад
          </button>
          <span className="pagination-info">
            Страница {currentPage} из {totalPages}
            {searchQuery && ` (найдено ${filteredData.length})`}
          </span>
          <button
            className="pagination-btn"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Вперёд →
          </button>
        </div>
      )}
      
      {/* Легенда тепловой карты */}
      <div className="heatmap-legend">
        <span className="legend-label">Меньше</span>
        <div className="legend-gradient">
          <div className="gradient-bar"></div>
        </div>
        <span className="legend-label">Больше</span>
      </div>
    </div>
  );
};

export default MarketShareCard;

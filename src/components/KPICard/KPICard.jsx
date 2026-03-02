import { useMemo } from 'react';
import useCountUp from '../../hooks/useCountUp';
import Tooltip from '../Tooltip/Tooltip';
import './KPICard.css';

// Иконки для разных типов KPI
const KPI_ICONS = {
  amount: '💰',
  quantity: '📦',
  contracts: '📊',
  avgContract: '📈',
  avgPrice: '🏷️',
  suppliers: '🤝',
  customers: '🏢',
  default: '📊'
};

// Определение типа KPI по заголовку
const getKPIType = (title) => {
  const titleLower = title.toLowerCase();
  if (titleLower.includes('сумм') || titleLower.includes('объём')) return 'amount';
  if (titleLower.includes('количеств')) return 'quantity';
  if (titleLower.includes('контракт')) return 'contracts';
  if (titleLower.includes('средн') && titleLower.includes('объём')) return 'avgContract';
  if (titleLower.includes('средн') && titleLower.includes('цен')) return 'avgPrice';
  if (titleLower.includes('поставщ')) return 'suppliers';
  if (titleLower.includes('заказч')) return 'customers';
  return 'default';
};

// Извлечение числового значения из строки
const extractNumber = (value) => {
  if (typeof value === 'number') return value;
  if (typeof value !== 'string') return 0;
  // Удаляем все нецифровые символы кроме минус и точки
  const cleaned = value.replace(/[^\d.,-]/g, '').replace(',', '.');
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
};

const KPICard = ({ title, value, subtitle, gradient, tooltip }) => {
  const kpiType = useMemo(() => getKPIType(title), [title]);
  const icon = KPI_ICONS[kpiType] || KPI_ICONS.default;
  const numericValue = useMemo(() => extractNumber(value), [value]);
  const animatedValue = useCountUp(numericValue, 1500, true);

  // Форматирование анимированного значения с сохранением формата оригинала
  const formatAnimatedValue = (original, animated) => {
    if (typeof original === 'number') {
      return Math.round(animated).toLocaleString('ru-RU');
    }
    // Для строковых значений (с валютой и т.д.)
    if (original.includes('₽')) {
      return new Intl.NumberFormat('ru-RU', {
        style: 'currency',
        currency: 'RUB',
        minimumFractionDigits: 0
      }).format(animated);
    }
    if (original.includes(' ')) {
      // Число с разделителями
      return Math.round(animated).toLocaleString('ru-RU');
    }
    return Math.round(animated).toLocaleString('ru-RU');
  };

  const card = (
    <div className={`kpi-card ${gradient}`}>
      <div className="kpi-content">
        <div className="kpi-header">
          <span className="kpi-icon">{icon}</span>
          <h3 className="kpi-title">{title}</h3>
        </div>
        <p className="kpi-value">{formatAnimatedValue(value, animatedValue)}</p>
        {subtitle && <p className="kpi-subtitle">{subtitle}</p>}
      </div>
      <div className="kpi-glow"></div>
    </div>
  );

  if (tooltip) {
    return (
      <Tooltip content={tooltip} position="bottom">
        {card}
      </Tooltip>
    );
  }

  return card;
};

export default KPICard;

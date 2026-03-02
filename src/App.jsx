import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement,
  Title, Tooltip, Legend, Filler } from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import './App.css';

// Импорт компонентов
import Sidebar from './components/Sidebar/Sidebar.jsx';
import KPICard from './components/KPICard/KPICard.jsx';
import ChartCard from './components/ChartCard/ChartCard.jsx';
import MarketShareCard from './components/MarketShareCard/MarketShareCard.jsx';
import ErrorBoundary from './components/ErrorBoundary/ErrorBoundary.jsx';
import { SkeletonKPICard, SkeletonChart, SkeletonTable, SkeletonSidebar } from './components/Skeleton/Skeleton.jsx';
import { ToastContainer } from './components/Toast/Toast.jsx';

// Импорт хуков и утилит
import useData from './hooks/useData';
import { useFilterSync } from './hooks/useFilterSync';
import useToastManager from './hooks/useToastManager';
import useTheme from './hooks/useTheme';
import { formatCurrency, formatCurrencyInt, formatNumber, formatQuantity, monthNames } from './utils/formatters';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title,
   Tooltip, Legend, Filler);

// Кастомный плагин для отображения процентов на Doughnut диаграмме
const doughnutLabelsPlugin = {
  id: 'doughnutLabels',
  afterDatasetsDraw: (chart, args, options) => {
    const { ctx, chartArea: { left, right, top, bottom }, data } = chart;
    const total = data.datasets[0].data.reduce((a, b) => a + b, 0);
    
    if (total === 0) return;

    const meta = chart.getDatasetMeta(0);
    const centerX = (left + right) / 2;
    const centerY = (top + bottom) / 2;
    const radius = Math.min(right - left, bottom - top) / 2;
    const innerRadius = radius * 0.5;
    // Позиция метки: посередине между внутренним и внешним радиусом
    const labelRadius = innerRadius + (radius - innerRadius) / 2;

    ctx.save();
    ctx.font = 'bold 11px "Segoe UI", Tahoma, Geneva, Verdana, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#fff';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 4;

    meta.data.forEach((arc, i) => {
      const value = data.datasets[0].data[i];
      const percentage = ((value / total) * 100).toFixed(1);
      const midAngle = (arc.startAngle + arc.endAngle) / 2;
      const x = centerX + Math.cos(midAngle) * labelRadius;
      const y = centerY + Math.sin(midAngle) * labelRadius;
      
      if (parseFloat(percentage) > 5) {
        ctx.fillText(`${percentage}%`, x, y);
      }
    });

    ctx.restore();
  }
};

// Базовые опции для Doughnut
const baseDoughnutOptions = {
  responsive: true,
  maintainAspectRatio: false,
  animation: {
    duration: 1200,
    easing: 'easeOutQuart',
    animateScale: true,
    animateRotate: true
  },
  hover: {
    mode: 'point',
    intersect: true,
    animationDuration: 200
  },
  plugins: {
    legend: { display: false },
    tooltip: {
      enabled: true,
      backgroundColor: 'rgba(29, 53, 87, 0.98)',
      titleColor: '#fff',
      bodyColor: '#fff',
      borderColor: 'rgba(46, 196, 182, 0.5)',
      borderWidth: 2,
      padding: 12,
      cornerRadius: 10,
      displayColors: true,
      boxPadding: 6,
      titleFont: {
        size: 13,
        weight: '600',
        family: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
      },
      bodyFont: {
        size: 14,
        weight: '500',
        family: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
      },
      hitRadius: 20,
      intersect: true,
      mode: 'point',
      position: 'nearest',
      callbacks: {
        label: (ctx) => {
          const value = ctx.raw !== undefined ? ctx.raw : (ctx.parsed || 0);
          const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
          const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
          return `${formatCurrency(value)} (${percentage}%)`;
        }
      }
    }
  }
};

// Компонент для графика поставщиков с кастомной легендой
const SupplierChartCard = ({ title, subtitle, data, icon }) => {
  const legendRef = useRef(null);

  useEffect(() => {
    if (legendRef.current && data.labels) {
      const total = data.datasets[0].data.reduce((a, b) => a + b, 0);
      legendRef.current.innerHTML = data.labels.map((label, i) => {
        const value = data.datasets[0].data[i];
        const percentage = ((value / total) * 100).toFixed(1);
        const color = data.datasets[0].backgroundColor[i];
        return `
          <div class="legend-item" style="border-left-color: ${color}">
            <span class="legend-color" style="background-color: ${color}"></span>
            <span class="legend-text">${label} — ${percentage}%</span>
          </div>
        `;
      }).join('');
    }
  }, [data]);

  return (
    <div className="chart-card supplier-card">
      <h3 className="chart-title">
        {icon && <span className="chart-icon" aria-hidden="true">{icon}</span>}
        <span>{title}</span>
        {subtitle && <span className="chart-subtitle">{subtitle}</span>}
      </h3>
      <div className="supplier-chart-layout">
        <div className="supplier-chart">
          <Doughnut 
            data={data} 
            options={baseDoughnutOptions}
            plugins={[doughnutLabelsPlugin]}
          />
        </div>
        <div className="supplier-legend" ref={legendRef}></div>
      </div>
    </div>
  );
};

function App() {
  const { data, loading, error, lastUpdated, refresh, loadData } = useData(true);
  const { toasts, removeToast } = useToastManager();
  const { isDark, toggleTheme } = useTheme();

  const [filters, setFilters] = useState({
    years: [], months: [], regions: [], customers: [], suppliers: [],
    products: [], minAmount: 0, maxAmount: 1e9
  });
  const [selectedYears, setSelectedYears] = useState([]);
  const [selectedMonths, setSelectedMonths] = useState([]);

  // Обёрнутая функция refresh с Toast-уведомлением
  const handleRefresh = useCallback(async () => {
    try {
      await loadData();
      // Уведомление будет показано через кастомное событие в useData
    } catch (err) {
      // Ошибка уже обработана в useData
    }
  }, [loadData]);

  // Показываем Toast при успешном обновлении данных
  useEffect(() => {
    if (lastUpdated && !loading) {
      const event = new CustomEvent('toast-add', {
        detail: {
          id: Date.now(),
          message: 'Данные успешно обновлены',
          type: 'success',
          duration: 2000
        }
      });
      document.dispatchEvent(event);
    }
  }, [lastUpdated, loading]);

  // Синхронизация фильтров с URL
  const uniqueValues = useMemo(() => {
    if (!data.length) return { years: [], months: [], regions: [], customers: [], suppliers: [], products: [] };
    return {
      years: [...new Set(data.map(item => item.year))].filter(y => y !== null && y !== undefined).sort((a, b) => a - b),
      months: [...new Set(data.map(item => item.month))].sort(),
      regions: [...new Set(data.map(item => item.region))].sort(),
      customers: [...new Set(data.map(item => item.customer))].sort(),
      suppliers: [...new Set(data.map(item => item.supplier))].sort(),
      products: [...new Set(data.map(item => item.product))].sort()
    };
  }, [data]);

  // Инициализация синхронизации URL
  const { updateUrl } = useFilterSync(filters, setFilters, selectedYears, setSelectedYears, selectedMonths, setSelectedMonths, uniqueValues);

  // Обёртки для обновления фильтров с синхронизацией URL
  const handleSetFilters = (newFilters) => {
    setFilters(newFilters);
    updateUrl(newFilters, selectedYears, selectedMonths);
  };

  const handleSetSelectedYears = (newYears) => {
    setSelectedYears(newYears);
    updateUrl(filters, newYears, selectedMonths);
  };

  const handleSetSelectedMonths = (newMonths) => {
    setSelectedMonths(newMonths);
    updateUrl(filters, selectedYears, newMonths);
  };

  const filteredData = useMemo(() => data.filter(item => {
    // Фильтрация по выбранным годам (в сайдбаре)
    if (selectedYears.length && (item.year === null || item.year === undefined || !selectedYears.includes(item.year))) return false;
    // Фильтрация по выбранным месяцам (в сайдбаре)
    if (selectedMonths.length && (item.month === null || item.month === undefined || !selectedMonths.includes(item.month))) return false;
    // Фильтрация по годам в расширенных фильтрах
    if (filters.years.length && (item.year === null || item.year === undefined || !filters.years.includes(item.year))) return false;
    // Фильтрация по месяцам в расширенных фильтрах
    if (filters.months.length && (item.month === null || item.month === undefined || !filters.months.includes(item.month))) return false;
    if (filters.regions.length && !filters.regions.includes(item.region)) return false;
    if (filters.customers.length && !filters.customers.includes(item.customer)) return false;
    if (filters.suppliers.length && !filters.suppliers.includes(item.supplier)) return false;
    if (filters.products.length && !filters.products.includes(item.product)) return false;
    if (item.amount < filters.minAmount) return false;
    if (item.amount > filters.maxAmount) return false;
    return true;
  }), [data, filters, selectedYears, selectedMonths]);

  const kpis = useMemo(() => {
    const totalAmount = filteredData.reduce((sum, item) => sum + item.amount, 0);
    const totalQuantity = filteredData.reduce((sum, item) => sum + item.quantity, 0);
    const totalContracts = filteredData.length;
    const avgContract = totalContracts > 0 ? totalAmount / totalContracts : 0;
    const uniqueSuppliers = new Set(filteredData.map(item => item.supplier)).size;
    const uniqueCustomers = new Set(filteredData.map(item => item.customer)).size;
    const avgPrice = totalQuantity > 0 ? totalAmount / totalQuantity : 0;
    
    return { 
      totalAmount, 
      totalQuantity, 
      totalContracts, 
      avgContract, 
      uniqueSuppliers, 
      uniqueCustomers, 
      avgPrice
    };
  }, [filteredData]);

  // Функция для создания tooltip с улучшенным оформлением
  const createTooltip = useCallback((ctx) => {
    const dataset = ctx.dataset;
    const label = dataset.label || '';
    const value = ctx.parsed.y || ctx.parsed.x || ctx.parsed;
    
    let formattedValue;
    if (dataset.type === 'line') {
      formattedValue = formatQuantity(value);
    } else {
      formattedValue = formatCurrency(value);
    }

    return `
      <div class="custom-tooltip">
        <div class="custom-tooltip-header">
          <span class="custom-tooltip-label">${ctx.label || ''}</span>
        </div>
        <div class="custom-tooltip-body">
          <span class="custom-tooltip-value">${formattedValue}</span>
        </div>
      </div>
    `;
  }, []);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    animation: {
      duration: 1200,
      easing: 'easeOutQuart',
      animateScale: true,
      animateRotate: true
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        enabled: true,
        external: null, // Используем стандартный tooltip с кастомным оформлением
        backgroundColor: 'rgba(29, 53, 87, 0.98)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: 'rgba(46, 196, 182, 0.5)',
        borderWidth: 2,
        padding: 12,
        displayColors: true,
        boxPadding: 6,
        cornerRadius: 10,
        titleFont: {
          size: 13,
          weight: '600',
          family: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
        },
        bodyFont: {
          size: 14,
          weight: '500',
          family: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
        },
        callbacks: {
          title: (items) => items[0]?.label || '',
          label: (ctx) => {
            if (ctx.dataset.type === 'line') {
              return `Количество: ${formatQuantity(ctx.parsed.y)}`;
            }
            return `Сумма: ${formatCurrency(ctx.parsed.y || ctx.parsed)}`;
          },
          labelColor: (ctx) => ({
            borderColor: ctx.dataset.borderColor || ctx.dataset.backgroundColor,
            backgroundColor: ctx.dataset.backgroundColor || ctx.dataset.borderColor,
            borderWidth: 2,
            borderDash: [],
            borderRadius: 4
          })
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          color: '#52b788',
          callback: (v) => v >= 1e9 ? (v/1e9).toFixed(1) + ' млрд' : v >= 1e6 ? (v/1e6).toFixed(1) + ' млн' : v >= 1e3 ? (v/1e3).toFixed(0) + ' тыс' : v,
          autoSkip: false,
          font: { size: 10, weight: '500' }
        },
        grid: { 
          color: (ctx) => ctx.tick.value === 0 ? 'rgba(82, 183, 136, 0.3)' : 'rgba(0,0,0,0.05)',
          lineWidth: (ctx) => ctx.tick.value === 0 ? 2 : 1
        },
        border: {
          color: 'rgba(82, 183, 136, 0.5)',
          width: 2
        },
        position: 'left'
      },
      y1: {
        beginAtZero: true,
        ticks: { 
          color: '#fb8500', 
          font: { size: 10, weight: '500' }, 
          autoSkip: false 
        },
        grid: { display: false },
        border: {
          color: 'rgba(251, 133, 0, 0.5)',
          width: 2
        },
        position: 'right'
      },
      x: {
        ticks: { 
          color: '#52b788', 
          font: { size: 10, weight: '500' },
          autoSkip: false,
          maxRotation: 45,
          minRotation: 0
        },
        grid: { 
          color: 'rgba(0,0,0,0.03)',
          lineWidth: 1
        },
        border: {
          color: 'rgba(82, 183, 136, 0.3)',
          width: 2
        }
      }
    }
  };

  const horizontalBarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y',
    animation: {
      duration: 1000,
      easing: 'easeOutQuart'
    },
    plugins: { 
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(29, 53, 87, 0.98)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: 'rgba(46, 196, 182, 0.5)',
        borderWidth: 2,
        padding: 12,
        cornerRadius: 10,
        titleFont: {
          size: 13,
          weight: '600',
          family: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
        },
        bodyFont: {
          size: 14,
          weight: '500',
          family: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
        },
        callbacks: {
          title: (items) => items[0]?.label || '',
          label: (ctx) => `Сумма: ${formatCurrency(ctx.parsed.x || ctx.parsed)}`
        }
      }
    },
    scales: {
      x: {
        beginAtZero: true,
        ticks: {
          color: '#52b788',
          font: { size: 10, weight: '500' },
          callback: (v) => v >= 1e9 ? (v/1e9).toFixed(1) + ' млрд' : v >= 1e6 ? (v/1e6).toFixed(1) + ' млн' : v >= 1e3 ? (v/1e3).toFixed(0) + ' тыс' : v
        },
        grid: { 
          color: (ctx) => ctx.tick.value === 0 ? 'rgba(82, 183, 136, 0.3)' : 'rgba(0,0,0,0.05)',
          lineWidth: (ctx) => ctx.tick.value === 0 ? 2 : 1
        },
        border: {
          color: 'rgba(82, 183, 136, 0.5)',
          width: 2
        }
      },
      y: {
        ticks: { 
          color: '#1d3557', 
          font: { size: 11, weight: '500' }, 
          autoSkip: false 
        },
        grid: { color: 'rgba(0,0,0,0.03)' },
        border: {
          color: 'rgba(29, 53, 87, 0.3)',
          width: 2
        }
      }
    }
  };

  // Ref для хранения ссылок на chart instances
  const chartRefs = useRef({});

  // Функция для получения градиента с учётом chart area
  const getBarGradient = useCallback((chartId, colorStart, colorEnd) => {
    const chart = chartRefs.current[chartId];
    if (!chart?.chart?.ctx) return colorStart;
    
    const ctx = chart.chart.ctx;
    const chartArea = chart.chart.chartArea;
    
    if (!chartArea) return colorStart;
    
    const gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
    gradient.addColorStop(0, colorEnd);
    gradient.addColorStop(1, colorStart);
    return gradient;
  }, []);

  const monthlyChartData = useMemo(() => {
    const md = filteredData.reduce((acc, item) => { if (item.month) acc[item.month] = (acc[item.month] || 0) + item.amount; return acc; }, {});
    const mq = filteredData.reduce((acc, item) => { if (item.month) acc[item.month] = (acc[item.month] || 0) + item.quantity; return acc; }, {});
    const labels = Object.keys(md).sort((a,b) => a-b).map(m => monthNames[m-1]);
    const months = Object.keys(md).sort((a,b) => a-b);
    return {
      labels,
      datasets: [
        {
          type: 'bar',
          label: 'Сумма (₽)',
          data: months.map(m => md[m]),
          backgroundColor: (ctx) => {
            const chart = ctx.chart;
            const chartArea = chart.chartArea;
            if (!chartArea) return 'rgba(46, 196, 182, 0.7)';
            const gradient = chart.ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
            gradient.addColorStop(0, 'rgba(46, 196, 182, 0.2)');
            gradient.addColorStop(0.5, 'rgba(46, 196, 182, 0.5)');
            gradient.addColorStop(1, 'rgba(46, 196, 182, 0.9)');
            return gradient;
          },
          borderColor: 'rgba(46, 196, 182, 1)',
          borderWidth: 2,
          borderRadius: 6,
          borderSkipped: false,
          yAxisID: 'y',
          hoverBackgroundColor: 'rgba(46, 196, 182, 1)',
          hoverBorderWidth: 3,
          hoverBorderColor: '#fff'
        },
        {
          type: 'line',
          label: 'Количество (шт)',
          data: months.map(m => mq[m]),
          borderColor: 'rgba(251, 133, 0, 1)',
          backgroundColor: (ctx) => {
            const chart = ctx.chart;
            const chartArea = chart.chartArea;
            if (!chartArea) return 'rgba(251, 133, 0, 0.15)';
            const gradient = chart.ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
            gradient.addColorStop(0, 'rgba(251, 133, 0, 0.02)');
            gradient.addColorStop(0.5, 'rgba(251, 133, 0, 0.15)');
            gradient.addColorStop(1, 'rgba(251, 133, 0, 0.4)');
            return gradient;
          },
          borderWidth: 3,
          tension: 0.4,
          fill: true,
          pointBackgroundColor: 'rgba(251, 133, 0, 1)',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 5,
          pointHoverRadius: 8,
          pointHoverBackgroundColor: 'rgba(251, 133, 0, 1)',
          pointHoverBorderColor: '#fff',
          pointHoverBorderWidth: 3,
          yAxisID: 'y1'
        }
      ]
    };
  }, [filteredData]);

  // Современная палитра для графиков
  const modernPalette = [
    'rgba(46, 196, 182, 0.85)',  // teal
    'rgba(82, 183, 136, 0.85)',  // green
    'rgba(251, 133, 0, 0.85)',   // orange
    'rgba(58, 134, 255, 0.85)',  // blue
    'rgba(114, 9, 183, 0.85)',   // purple
    'rgba(0, 180, 216, 0.85)',   // cyan
    'rgba(99, 102, 241, 0.85)',  // indigo
    'rgba(168, 85, 247, 0.85)',  // violet
    'rgba(236, 72, 153, 0.85)',  // pink
    'rgba(34, 197, 94, 0.85)'    // emerald
  ];

  const regionChartData = useMemo(() => {
    const rd = filteredData.reduce((acc, item) => { acc[item.region] = (acc[item.region] || 0) + item.amount; return acc; }, {});
    const totalAmount = Object.values(rd).reduce((sum, val) => sum + val, 0);
    const sr = Object.entries(rd).sort((a, b) => b[1] - a[1]).slice(0, 10);
    const top10Sum = sr.reduce((sum, e) => sum + e[1], 0);
    const percentage = totalAmount > 0 ? ((top10Sum / totalAmount) * 100).toFixed(1) : 0;
    return {
      labels: sr.map(e => e[0]),
      datasets: [{
        data: sr.map(e => e[1]),
        backgroundColor: modernPalette.slice(0, sr.length),
        borderWidth: 2,
        borderColor: '#fff',
        borderRadius: 6,
        hoverOffset: 10,
        hoverScale: 1.05
      }],
      percentage
    };
  }, [filteredData]);

  const yearlyChartData = useMemo(() => {
    const yd = filteredData.reduce((acc, item) => { if (item.year) acc[item.year] = (acc[item.year] || 0) + item.amount; return acc; }, {});
    const years = Object.keys(yd).sort();
    return {
      labels: years,
      datasets: [{
        data: years.map(y => yd[y]),
        backgroundColor: (ctx) => {
          const chart = ctx.chart;
          const chartArea = chart.chartArea;
          if (!chartArea) return 'rgba(46, 196, 182, 0.2)';
          const gradient = chart.ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
          gradient.addColorStop(0, 'rgba(46, 196, 182, 0.1)');
          gradient.addColorStop(0.5, 'rgba(46, 196, 182, 0.3)');
          gradient.addColorStop(1, 'rgba(46, 196, 182, 0.6)');
          return gradient;
        },
        borderColor: 'rgba(46, 196, 182, 1)',
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: 'rgba(46, 196, 182, 1)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 9,
        pointHoverBackgroundColor: 'rgba(46, 196, 182, 1)',
        pointHoverBorderColor: '#fff',
        pointHoverBorderWidth: 3
      }]
    };
  }, [filteredData]);

  const supplierChartData = useMemo(() => {
    const sd = filteredData.reduce((acc, item) => {
      if (item.supplier) {
        acc[item.supplier] = (acc[item.supplier] || 0) + item.amount;
      }
      return acc;
    }, {});

    // Сортируем и берём топ-5
    const ss = Object.entries(sd)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    const totalAmount = Object.values(sd).reduce((sum, val) => sum + val, 0);
    const top5Sum = ss.reduce((sum, e) => sum + e[1], 0);
    const othersSum = totalAmount - top5Sum;
    const top5Percentage = totalAmount > 0 ? ((top5Sum / totalAmount) * 100).toFixed(1) : 0;
    const othersPercentage = totalAmount > 0 ? ((othersSum / totalAmount) * 100).toFixed(1) : 0;

    // Формируем лейблы: топ-5 + "Остальные" (если есть)
    const labels = [...ss.map(e => e[0])];
    const dataValues = [...ss.map(e => e[1])];
    const colors = [
      'rgba(46, 196, 182, 0.95)',
      'rgba(82, 183, 136, 0.95)',
      'rgba(251, 133, 0, 0.95)',
      'rgba(58, 134, 255, 0.95)',
      'rgba(114, 9, 183, 0.95)'
    ];
    const hoverColors = [
      'rgba(46, 196, 182, 1)',
      'rgba(82, 183, 136, 1)',
      'rgba(251, 133, 0, 1)',
      'rgba(58, 134, 255, 1)',
      'rgba(114, 9, 183, 1)'
    ];

    // Добавляем категорию "Остальные", если она не нулевая
    if (othersSum > 0) {
      labels.push('Остальные');
      dataValues.push(othersSum);
      colors.push('rgba(150, 150, 150, 0.95)');
      hoverColors.push('rgba(150, 150, 150, 1)');
    }

    return {
      labels,
      datasets: [{
        data: dataValues,
        backgroundColor: colors,
        hoverBackgroundColor: hoverColors,
        borderWidth: 3,
        borderColor: '#fff',
        hoverOffset: 15,
        hoverBorderWidth: 4
      }],
      percentage: top5Percentage,
      othersPercentage
    };
  }, [filteredData]);

  const productChartData = useMemo(() => {
    const pd = filteredData.reduce((acc, item) => { acc[item.product] = (acc[item.product] || 0) + item.amount; return acc; }, {});
    const sp = Object.entries(pd).sort((a, b) => b[1] - a[1]).slice(0, 10);
    return {
      labels: sp.map(e => e[0]),
      datasets: [{
        data: sp.map(e => e[1]),
        backgroundColor: (ctx) => {
          const chart = ctx.chart;
          const chartArea = chart.chartArea;
          if (!chartArea) return modernPalette;
          // Создаём градиент для каждого бара
          return modernPalette.map((color, i) => {
            const gradient = chart.ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
            const rgbaMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
            if (rgbaMatch) {
              const [, r, g, b] = rgbaMatch;
              gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0.3)`);
              gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0.9)`);
            } else {
              gradient.addColorStop(0, 'rgba(0,0,0,0.1)');
              gradient.addColorStop(1, 'rgba(0,0,0,0.4)');
            }
            return gradient;
          });
        },
        borderColor: modernPalette.map(c => c.replace('0.85', '1')),
        borderWidth: 2,
        borderRadius: 6,
        borderSkipped: false,
        hoverBackgroundColor: 'rgba(251, 133, 0, 1)',
        hoverBorderWidth: 3,
        hoverBorderColor: '#fff'
      }]
    };
  }, [filteredData]);

  const marketShareData = useMemo(() => {
    const totalByProductMonth = {};
    const totalByMonth = {};
    const products = new Set();

    filteredData.forEach(item => {
      if (!item.product || !item.month) return;
      products.add(item.product);
      const key = `${item.product}-${item.month}`;
      totalByProductMonth[key] = (totalByProductMonth[key] || 0) + item.quantity;
      totalByMonth[item.month] = (totalByMonth[item.month] || 0) + item.quantity;
    });

    const totalQuantity = Object.values(totalByMonth).reduce((a, b) => a + b, 0);
    const productsList = [...products].sort();
    const months = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

    let matrix = productsList.map(product => {
      const row = { product };
      let productTotal = 0;
      months.forEach(month => {
        const key = `${product}-${month}`;
        const qty = totalByProductMonth[key] || 0;
        productTotal += qty;
        const share = totalQuantity > 0 ? (qty / totalQuantity) * 100 : 0;
        row[month] = share.toFixed(1);
      });
      const yearShare = totalQuantity > 0 ? (productTotal / totalQuantity) * 100 : 0;
      row.year = yearShare.toFixed(1);
      row.total = productTotal;
      return row;
    });

    matrix = matrix.sort((a, b) => parseFloat(b.year) - parseFloat(a.year));
    return { matrix, months, monthNames };
  }, [filteredData]);

  // Показываем скелетоны при загрузке
  if (loading) {
    return (
      <div className="app">
        <SkeletonSidebar />
        <main className="main-content">
          <div className="kpi-grid">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonKPICard key={i} />
            ))}
          </div>
          <div className="charts-grid">
            <SkeletonChart height={200} />
            <SkeletonChart height={280} />
            <SkeletonTable rows={10} />
            <SkeletonChart height={280} />
            <SkeletonChart height={280} />
            <SkeletonChart height={240} />
          </div>
        </main>
      </div>
    );
  }

  if (error && data.length === 0) {
    return (
      <div className="error-container">
        <div className="error-icon">⚠️</div>
        <h2>Ошибка загрузки данных</h2>
        <p className="error-message">{error}</p>
        <div className="error-actions">
          <button className="retry-btn" onClick={() => refresh()}>🔄 Повторить</button>
          <button className="help-btn" onClick={() => window.open('http://localhost:5000/api/health', '_blank')}>
            🔍 Проверить сервер
          </button>
        </div>
        <p className="error-hint">Убедитесь, что сервер запущен: <code>npm run server</code></p>
      </div>
    );
  }

  return (
    <ErrorBoundary onReset={refresh}>
      <div className="app">
        <Sidebar
          filters={filters}
          setFilters={handleSetFilters}
          uniqueValues={uniqueValues}
          selectedYears={selectedYears}
          setSelectedYears={handleSetSelectedYears}
          selectedMonths={selectedMonths}
          setSelectedMonths={handleSetSelectedMonths}
          onRefresh={handleRefresh}
          lastUpdated={lastUpdated}
          loading={loading}
          filteredData={filteredData}
          isDark={isDark}
          toggleTheme={toggleTheme}
        />
        <main className="main-content">
          <div className="kpi-grid">
            <KPICard
              title="Общая сумма контрактов"
              value={formatCurrencyInt(kpis.totalAmount)}
              subtitle="По выбранным фильтрам"
              gradient="gradient-blue"
              tooltip="Сумма всех контрактов по выбранным фильтрам"
            />
            <KPICard
              title="Количество"
              value={formatQuantity(kpis.totalQuantity)}
              subtitle="Единиц товара"
              gradient="gradient-cyan"
              tooltip="Общее количество единиц товара"
            />
            <KPICard
              title="Количество контрактов"
              value={formatNumber(kpis.totalContracts)}
              subtitle="Всего записей"
              gradient="gradient-purple"
              tooltip="Количество записей в выборке"
            />
            <KPICard
              title="Средняя сумма контракта"
              value={formatCurrencyInt(kpis.avgContract)}
              subtitle="Средняя сумма"
              gradient="gradient-green"
              tooltip="Средняя сумма одного контракта"
            />
            <KPICard
              title="Средняя цена"
              value={formatCurrency(kpis.avgPrice)}
              subtitle="Цена за единицу"
              gradient="gradient-cyan"
              tooltip="Средняя цена за единицу товара"
            />
            <KPICard
              title="Уникальных поставщиков"
              value={formatNumber(kpis.uniqueSuppliers)}
              subtitle={'Заказчиков: ' + kpis.uniqueCustomers}
              gradient="gradient-orange"
              tooltip="Количество уникальных поставщиков и заказчиков"
            />
          </div>

          <div className="charts-grid">
            <ChartCard title="Динамика по годам" icon="📈">
              <Line data={yearlyChartData} options={chartOptions} />
            </ChartCard>
            <ChartCard title="Динамика по месяцам" large icon="📅">
              <Bar data={monthlyChartData} options={chartOptions} />
            </ChartCard>
            <MarketShareCard title="Доля рынка" data={marketShareData} icon="%" />
            <ChartCard title="Топ-10 продуктов" tall icon="📦">
              <Bar data={productChartData} options={horizontalBarOptions} />
            </ChartCard>
            <ChartCard title="Топ-10 регионов" large subtitle={regionChartData.percentage ? `— ${regionChartData.percentage}% от общей суммы` : ''} icon="🗺️">
              <Bar data={regionChartData} options={horizontalBarOptions} />
            </ChartCard>
            <SupplierChartCard
              title="Топ-5 поставщиков"
              subtitle={supplierChartData.percentage ? `— ${supplierChartData.percentage}% (остальные: ${supplierChartData.othersPercentage || 0}%)` : ''}
              data={supplierChartData}
              icon="🤝"
            />
          </div>
        </main>
      </div>
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ErrorBoundary>
  );
}

export default App;

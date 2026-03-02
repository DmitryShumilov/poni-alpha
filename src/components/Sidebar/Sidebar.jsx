import { useState } from 'react';
import './Sidebar.css';
import { monthNames } from '../../utils/formatters';
import ExportButton from '../ExportButton/ExportButton.jsx';
import ExpandableFilter from '../ExpandableFilter/ExpandableFilter.jsx';
import ThemeToggle from '../ThemeToggle/ThemeToggle.jsx';

const Sidebar = ({ filters, setFilters, uniqueValues, selectedYears, setSelectedYears, selectedMonths, setSelectedMonths, onRefresh, lastUpdated, loading, filteredData, isDark, toggleTheme }) => {
  const [searchQueries, setSearchQueries] = useState({
    regions: '',
    customers: '',
    suppliers: '',
    products: ''
  });

  const handleReset = () => {
    setFilters({ years: [], months: [], regions: [], customers: [], suppliers: [], products: [], minAmount: 0, maxAmount: 1e9 });
    setSelectedMonths([]);
    setSelectedYears([]);
    setSearchQueries({ regions: '', customers: '', suppliers: '', products: '' });
  };

  const toggleYear = (year) => {
    setSelectedYears(prev =>
      prev.includes(year) ? prev.filter(y => y !== year) : [...prev, year]
    );
  };

  const toggleMonth = (month) => {
    setSelectedMonths(prev =>
      prev.includes(month) ? prev.filter(m => m !== month) : [...prev, month]
    );
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <span className="logo-icon">📊</span>
          <div className="logo-text">
            <span>Аналитика</span>
            Госзакупки
          </div>
        </div>
      </div>

      <nav className="nav-menu">
        <div className="theme-toggle-container">
          <ThemeToggle isDark={isDark} onToggle={toggleTheme} />
        </div>
        <button className="nav-item refresh-btn" onClick={onRefresh} disabled={loading}>
          <span className="nav-icon">{loading ? '⏳' : '🔄'}</span>
          <span>{loading ? 'Загрузка...' : 'Обновить данные'}</span>
        </button>
        <ExportButton data={filteredData} disabled={loading || !filteredData?.length} />
        {lastUpdated && (
          <div className="last-updated">
            <span>Обновлено: {lastUpdated.toLocaleTimeString('ru-RU')}</span>
          </div>
        )}
      </nav>

      <div className="filters-container">
        <ExpandableFilter
          name="regions"
          label="Регионы"
          options={uniqueValues.regions}
          icon="🗺️"
          filters={filters}
          setFilters={setFilters}
          searchQueries={searchQueries}
          setSearchQueries={setSearchQueries}
        />
        <ExpandableFilter
          name="customers"
          label="Заказчики"
          options={uniqueValues.customers}
          icon="🏢"
          filters={filters}
          setFilters={setFilters}
          searchQueries={searchQueries}
          setSearchQueries={setSearchQueries}
        />
        <ExpandableFilter
          name="suppliers"
          label="Поставщики"
          options={uniqueValues.suppliers}
          icon="🏭"
          filters={filters}
          setFilters={setFilters}
          searchQueries={searchQueries}
          setSearchQueries={setSearchQueries}
        />
        <ExpandableFilter
          name="products"
          label="Продукты"
          options={uniqueValues.products}
          icon="📦"
          filters={filters}
          setFilters={setFilters}
          searchQueries={searchQueries}
          setSearchQueries={setSearchQueries}
        />
      </div>

      <div className="time-selector">
        <div className="selector-label">Год</div>
        <div className="year-selector">
          {uniqueValues.years.map(year => (
            <button
              key={year}
              className={`year-btn ${selectedYears.includes(year) ? 'active' : ''}`}
              onClick={() => toggleYear(year)}
            >
              {year}
            </button>
          ))}
        </div>

        <div className="selector-label">Месяцы</div>
        <div className="month-grid">
          {monthNames.map((name, idx) => (
            <button
              key={name}
              className={`month-btn ${selectedMonths.includes(idx + 1) ? 'active' : ''}`}
              onClick={() => toggleMonth(idx + 1)}
            >
              {name}
            </button>
          ))}
        </div>
      </div>

      <div className="filter-section">
        <button className="reset-btn" onClick={handleReset}>Сбросить фильтры</button>
      </div>
    </aside>
  );
};

export default Sidebar;

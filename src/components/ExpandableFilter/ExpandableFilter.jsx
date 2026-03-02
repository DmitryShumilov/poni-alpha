import { useState } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import './ExpandableFilter.css';

const VIRTUAL_LIST_HEIGHT = 200;
const ITEM_HEIGHT = 32;

const ExpandableFilter = ({ name, label, options, icon, filters, setFilters, searchQueries, setSearchQueries }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const selectedCount = filters[name]?.length || 0;

  const toggleFilter = () => {
    setIsExpanded(prev => !prev);
  };

  const handleFilterChange = (value) => {
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleLocalSearchChange = (query) => {
    setSearchQueries(prev => ({ ...prev, [name]: query }));
  };

  const selectAll = () => {
    handleFilterChange(options);
  };

  const resetFilter = () => {
    handleFilterChange([]);
  };

  const filterOptions = (query) => {
    if (!query) return options;
    return options.filter(opt =>
      opt.toLowerCase().includes(query.toLowerCase())
    );
  };

  const filteredOptions = filterOptions(searchQueries[name]);

  // Виртуализация списка
  const virtualizer = useVirtualizer({
    count: filteredOptions.length,
    getScrollElement: () => document.getElementById(`filter-options-${name}`),
    estimateSize: () => ITEM_HEIGHT,
    overscan: 5,
  });

  return (
    <div className={`expandable-filter ${isExpanded ? 'expanded' : ''}`}>
      <div className="filter-header" onClick={toggleFilter}>
        <div className="filter-header-left">
          <span className="filter-icon">{icon}</span>
          <span className="filter-label-text">{label}</span>
          {selectedCount > 0 && (
            <span className="filter-count">{selectedCount}</span>
          )}
        </div>
        <span className={`filter-arrow ${isExpanded ? 'down' : ''}`}>›</span>
      </div>

      <div className="filter-content" style={{
        maxHeight: isExpanded ? '500px' : '0',
        opacity: isExpanded ? 1 : 0,
        pointerEvents: isExpanded ? 'auto' : 'none'
      }}>
        <div className="filter-search">
          <input
            type="text"
            placeholder="Поиск..."
            value={searchQueries[name]}
            onChange={(e) => handleLocalSearchChange(e.target.value)}
            onClick={(e) => e.stopPropagation()}
          />
          <span className="search-icon">🔍</span>
        </div>

        <div className="filter-actions">
          <button
            className="filter-action-btn"
            onClick={(e) => { e.stopPropagation(); selectAll(); }}
          >
            Выбрать всё
          </button>
          <button
            className="filter-action-btn reset"
            onClick={(e) => { e.stopPropagation(); resetFilter(); }}
          >
            Сбросить
          </button>
        </div>

        <div
          className="filter-options"
          id={`filter-options-${name}`}
          style={{
            height: filteredOptions.length > 10 ? `${VIRTUAL_LIST_HEIGHT}px` : 'auto',
            overflow: 'auto'
          }}
        >
          {filteredOptions.length > 0 ? (
            <div
              style={{
                height: `${virtualizer.getTotalSize()}px`,
                width: '100%',
                position: 'relative',
              }}
            >
              {virtualizer.getVirtualItems().map((virtualRow) => {
                const opt = filteredOptions[virtualRow.index];
                return (
                  <label
                    key={opt}
                    className="filter-option"
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      transform: `translateY(${virtualRow.start}px)`,
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={filters[name]?.includes(opt)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          handleFilterChange([...(filters[name] || []), opt]);
                        } else {
                          handleFilterChange((filters[name] || []).filter(v => v !== opt));
                        }
                      }}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <span className="option-text">{opt}</span>
                  </label>
                );
              })}
            </div>
          ) : (
            <div className="no-results">Ничего не найдено</div>
          )}
        </div>

        {filteredOptions.length > 10 && (
          <div className="virtual-list-info">
            Показано {virtualizer.getVirtualItems().length} из {filteredOptions.length}
          </div>
        )}
      </div>
    </div>
  );
};

export default ExpandableFilter;

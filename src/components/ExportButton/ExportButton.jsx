import { useState } from 'react';
import { exportFilteredData } from '../../utils/export';
import './ExportButton.css';

const ExportButton = ({ data, disabled = false }) => {
  const [showMenu, setShowMenu] = useState(false);

  const handleExport = (format) => {
    const success = exportFilteredData(data, format);
    setShowMenu(false);
    
    // Показываем Toast-уведомление
    if (success) {
      const event = new CustomEvent('toast-add', {
        detail: {
          id: Date.now(),
          message: `Файл успешно экспортирован в формате ${format.toUpperCase()}`,
          type: 'success',
          duration: 3000
        }
      });
      document.dispatchEvent(event);
    } else {
      const event = new CustomEvent('toast-add', {
        detail: {
          id: Date.now(),
          message: 'Ошибка экспорта: нет данных',
          type: 'error',
          duration: 3000
        }
      });
      document.dispatchEvent(event);
    }
  };

  return (
    <div className="export-button-container">
      <button
        className="export-btn"
        onClick={() => setShowMenu(!showMenu)}
        disabled={disabled || data.length === 0}
        title="Экспорт данных"
        aria-label="Экспорт данных в CSV или Excel"
        aria-expanded={showMenu}
        aria-haspopup="menu"
      >
        <span className="export-icon" aria-hidden="true">📥</span>
        <span>Экспорт данных</span>
      </button>

      {showMenu && (
        <>
          <div className="export-menu-overlay" onClick={() => setShowMenu(false)} aria-hidden="true" />
          <div className="export-menu" role="menu" aria-label="Меню экспорта">
            <button
              className="export-menu-item"
              onClick={() => handleExport('xlsx')}
              role="menuitem"
            >
              <span className="export-format-icon" aria-hidden="true">📊</span>
              <span>Excel (.xlsx)</span>
            </button>
            <button
              className="export-menu-item"
              onClick={() => handleExport('csv')}
              role="menuitem"
            >
              <span className="export-format-icon" aria-hidden="true">📄</span>
              <span>CSV (.csv)</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default ExportButton;

import './ThemeToggle.css';

/**
 * Компонент переключателя темы (Dark/Light)
 */
const ThemeToggle = ({ isDark, onToggle }) => {
  return (
    <button
      className="theme-toggle"
      onClick={onToggle}
      aria-label={isDark ? 'Включить светлую тему' : 'Включить тёмную тему'}
      title={isDark ? 'Светлая тема' : 'Тёмная тема'}
    >
      <span className="theme-toggle-icon">
        {isDark ? '☀️' : '🌙'}
      </span>
      <span className="theme-toggle-text">
        {isDark ? 'Светлая' : 'Тёмная'}
      </span>
    </button>
  );
};

export default ThemeToggle;

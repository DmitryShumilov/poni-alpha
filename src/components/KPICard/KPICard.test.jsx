import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import KPICard from './KPICard';

// Мокаем useCountUp хук для тестов - возвращаем "фиксированное" значение
vi.mock('../../hooks/useCountUp', () => ({
  default: (end) => {
    // Для строковых значений вроде '1 000 000 ₽' возвращаем число 1000000
    if (typeof end === 'string') {
      const cleaned = end.replace(/[^\d.,-]/g, '').replace(',', '.');
      return parseFloat(cleaned) || 0;
    }
    return end;
  }
}));

describe('KPICard', () => {
  const defaultProps = {
    title: 'Тестовый заголовок',
    value: '1 000 000 ₽',
    subtitle: 'Тестовый подзаголовок',
    gradient: 'gradient-blue'
  };

  it('renders all props correctly', async () => {
    render(<KPICard {...defaultProps} />);

    expect(screen.getByText('Тестовый заголовок')).toBeInTheDocument();
    // Ждём, пока анимация обновит значение
    await waitFor(() => {
      expect(screen.getByText('1 000 000 ₽')).toBeInTheDocument();
    }, { timeout: 2000 });
    expect(screen.getByText('Тестовый подзаголовок')).toBeInTheDocument();
  });

  it('renders without subtitle', async () => {
    render(<KPICard {...defaultProps} subtitle={null} />);

    expect(screen.getByText('Тестовый заголовок')).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText('1 000 000 ₽')).toBeInTheDocument();
    }, { timeout: 2000 });
    expect(screen.queryByText('Тестовый подзаголовок')).not.toBeInTheDocument();
  });

  it('applies gradient class', () => {
    const { container } = render(<KPICard {...defaultProps} />);

    expect(container.querySelector('.kpi-card.gradient-blue')).toBeInTheDocument();
  });

  it('renders tooltip when provided', () => {
    render(<KPICard {...defaultProps} tooltip="Тестовая подсказка" />);

    expect(screen.getByText('Тестовый заголовок')).toBeInTheDocument();
  });
});

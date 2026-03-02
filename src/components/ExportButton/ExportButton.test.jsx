import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ExportButton from './ExportButton';
import * as exportModule from '../../utils/export';

describe('ExportButton', () => {
  const mockData = [
    { id: 1, name: 'Test 1', value: 100 },
    { id: 2, name: 'Test 2', value: 200 }
  ];

  it('renders export button', () => {
    render(<ExportButton data={mockData} />);
    
    expect(screen.getByRole('button', { name: /экспорт/i })).toBeInTheDocument();
  });

  it('is disabled when data is empty', () => {
    render(<ExportButton data={[]} />);
    
    expect(screen.getByRole('button', { name: /экспорт/i })).toBeDisabled();
  });

  it('is disabled when disabled prop is true', () => {
    render(<ExportButton data={mockData} disabled={true} />);
    
    expect(screen.getByRole('button', { name: /экспорт/i })).toBeDisabled();
  });

  it('opens menu on click', () => {
    render(<ExportButton data={mockData} />);
    
    const button = screen.getByRole('button', { name: /экспорт/i });
    fireEvent.click(button);
    
    expect(screen.getByText('Excel (.xlsx)')).toBeInTheDocument();
    expect(screen.getByText('CSV (.csv)')).toBeInTheDocument();
  });

  it('calls exportToXLSX when Excel option is clicked', () => {
    const exportSpy = vi.spyOn(exportModule, 'exportFilteredData').mockReturnValue(true);
    
    render(<ExportButton data={mockData} />);
    
    fireEvent.click(screen.getByRole('button', { name: /экспорт/i }));
    fireEvent.click(screen.getByText('Excel (.xlsx)'));
    
    expect(exportSpy).toHaveBeenCalledWith(mockData, 'xlsx');
    exportSpy.mockRestore();
  });

  it('calls exportToCSV when CSV option is clicked', () => {
    const exportSpy = vi.spyOn(exportModule, 'exportFilteredData').mockReturnValue(true);
    
    render(<ExportButton data={mockData} />);
    
    fireEvent.click(screen.getByRole('button', { name: /экспорт/i }));
    fireEvent.click(screen.getByText('CSV (.csv)'));
    
    expect(exportSpy).toHaveBeenCalledWith(mockData, 'csv');
    exportSpy.mockRestore();
  });

  it('closes menu when clicking overlay', () => {
    const { container } = render(<ExportButton data={mockData} />);
    
    const button = screen.getByRole('button', { name: /экспорт/i });
    fireEvent.click(button);
    
    expect(screen.getByText('Excel (.xlsx)')).toBeInTheDocument();
    
    const overlay = container.querySelector('.export-menu-overlay');
    fireEvent.click(overlay);
    
    expect(screen.queryByText('Excel (.xlsx)')).not.toBeInTheDocument();
  });

  it('has correct ARIA attributes', () => {
    render(<ExportButton data={mockData} />);
    
    const button = screen.getByRole('button', { name: /экспорт данных в csv или excel/i });
    expect(button).toHaveAttribute('aria-expanded', 'false');
    expect(button).toHaveAttribute('aria-haspopup', 'menu');
  });
});

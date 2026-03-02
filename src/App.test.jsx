import { render } from '@testing-library/react';
import App from './App';

it('renders skeleton loaders during loading', () => {
  const { container } = render(<App />);
  // Проверяем, что отображаются скелетоны при загрузке
  const skeletonElements = container.querySelectorAll('.skeleton');
  expect(skeletonElements.length).toBeGreaterThan(0);
});

import { render, screen, fireEvent } from '@testing-library/react';
import Button from '@/components/core/Button';

test('renders button and handles click', () => {
  const handleClick = jest.fn();
  render(<Button onClick={handleClick}>Click me</Button>);
  const btn = screen.getByRole('button', { name: /click me/i });
  fireEvent.click(btn);
  expect(handleClick).toHaveBeenCalled();
});

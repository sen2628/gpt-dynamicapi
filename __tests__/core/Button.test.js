import { render, screen, fireEvent } from '@testing-library/react';
import Button from '@/components/core/Button';
import { jest } from '@jest/globals';

test('renders button and handles click', () => {
  const onClick = jest.fn();
  render(<Button onClick={onClick}>Click</Button>);
  fireEvent.click(screen.getByText('Click'));
  expect(onClick).toHaveBeenCalled();
});

import { render, screen, fireEvent } from '@testing-library/react';
import Dropdown from '@/components/core/Dropdown';
import { jest } from '@jest/globals';

test('changes selection', () => {
  const options = [
    { value: 'dev', label: 'dev' },
    { value: 'prod', label: 'prod' }
  ];
  const onChange = jest.fn();
  render(<Dropdown options={options} value="dev" onChange={onChange} />);
  fireEvent.change(screen.getByDisplayValue('dev'), { target: { value: 'prod' } });
  expect(onChange).toHaveBeenCalledWith('prod');
});

import PropTypes from 'prop-types';

export default function Dropdown({ options = [], value, onChange }) {
  return (
    <select className="border rounded px-2 py-1" value={value} onChange={(e) => onChange(e.target.value)}>
      {options.map(opt => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  );
}

Dropdown.propTypes = {
  options: PropTypes.arrayOf(PropTypes.shape({ value: PropTypes.string, label: PropTypes.string })).isRequired,
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired
};

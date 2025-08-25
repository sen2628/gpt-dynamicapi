import PropTypes from 'prop-types';

export default function List({ items = [] }) {
  return (
    <ul className="list-disc pl-6">
      {items.map((item, idx) => (
        <li key={idx}>{item}</li>
      ))}
    </ul>
  );
}

List.propTypes = {
  items: PropTypes.arrayOf(PropTypes.node).isRequired
};

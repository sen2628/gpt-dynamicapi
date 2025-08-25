import PropTypes from 'prop-types';

export default function Card({ title, children }) {
  return (
    <div className="border rounded shadow p-4 bg-white">
      {title && <h3 className="text-lg font-bold mb-2">{title}</h3>}
      <div>{children}</div>
    </div>
  );
}

Card.propTypes = {
  title: PropTypes.string,
  children: PropTypes.node
};

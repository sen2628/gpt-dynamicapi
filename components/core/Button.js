import PropTypes from 'prop-types';

export default function Button({ children, variant = 'primary', onClick, ...rest }) {
  const base = 'px-4 py-2 rounded focus:outline-none';
  const styles = {
    primary: `${base} bg-blue-600 text-white hover:bg-blue-700`,
    secondary: `${base} bg-gray-200 text-gray-800 hover:bg-gray-300`
  };
  return (
    <button className={styles[variant] || styles.primary} onClick={onClick} {...rest}>
      {children}
    </button>
  );
}

Button.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(['primary', 'secondary']),
  onClick: PropTypes.func
};

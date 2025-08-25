import React from 'react';

export default function Button({ children, variant = 'primary', ...props }) {
  const base = 'px-4 py-2 rounded font-medium focus:outline-none focus:ring';
  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-300',
    secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-300',
  };
  return (
    <button className={`${base} ${variants[variant]}`} {...props}>
      {children}
    </button>
  );
}

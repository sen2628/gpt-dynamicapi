import PropTypes from 'prop-types';

export default function Table({ columns = [], data = [] }) {
  return (
    <table className="min-w-full border">
      <thead>
        <tr>
          {columns.map(col => (
            <th key={col.accessor} className="border px-2 py-1 text-left">{col.Header}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row, idx) => (
          <tr key={idx} className="border-t">
            {columns.map(col => (
              <td key={col.accessor} className="border px-2 py-1">{row[col.accessor]}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

Table.propTypes = {
  columns: PropTypes.arrayOf(PropTypes.shape({ accessor: PropTypes.string, Header: PropTypes.string })).isRequired,
  data: PropTypes.arrayOf(PropTypes.object).isRequired
};

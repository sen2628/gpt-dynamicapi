import React, { useState, useMemo, useId, useEffect } from 'react';

/**
 * PathPicker provides an autocomplete text input for selecting object paths
 * based on a provided schema. It validates selections against the schema and
 * optional type constraints, and shows live preview information.
 */
const PathPicker = ({
  schema = {},
  value = '',
  onChange,
  expectedType,
  allowCreate = true,
  previewData,
  disabled = false,
  placeholder = 'Target path',
  className = '',
}) => {
  const listId = useId();
  const paths = useMemo(() => Object.keys(schema || {}), [schema]);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState('');

  useEffect(() => {
    validate(value);
    updatePreview(value);
  }, [value, schema, expectedType, allowCreate, previewData]);

  const getValueByPath = (obj, path) => {
    if (!obj || !path) return undefined;
    return path.split('.').reduce((o, k) => (o && o[k] !== undefined ? o[k] : undefined), obj);
  };

  const validate = (v) => {
    if (!v) {
      setError('');
      return;
    }
    const entry = schema[v];
    if (!entry) {
      if (!allowCreate) {
        setError('Path not found in schema');
        return;
      }
    } else if (expectedType && entry.type) {
      const exp = Array.isArray(expectedType) ? expectedType : [expectedType];
      if (!exp.includes(entry.type)) {
        setError(`Expected ${exp.join(' or ')} but found ${entry.type}`);
        return;
      }
    }
    setError('');
  };

  const updatePreview = (v) => {
    if (!v) {
      setPreview('');
      return;
    }
    const entry = schema[v];
    if (!entry) {
      setPreview('');
      return;
    }
    const val = previewData ? getValueByPath(previewData, v) : undefined;
    const sample = val !== undefined ? ` – e.g. ${JSON.stringify(val)}` : '';
    setPreview(`${entry.type}${sample}`);
  };

  const handleChange = (e) => {
    onChange?.(e.target.value);
  };

  return (
    <div className="space-y-1">
      <input
        type="text"
        list={listId}
        value={value}
        onChange={handleChange}
        disabled={disabled}
        placeholder={placeholder}
        className={className}
      />
      <datalist id={listId}>
        {paths.map(p => (
          <option key={p} value={p} />
        ))}
      </datalist>
      {preview && <div className="text-xs text-gray-500">Type: {preview}</div>}
      {error && <div className="text-xs text-red-500">{error}</div>}
    </div>
  );
};

export default PathPicker;


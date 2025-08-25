function parseWhereInput(input) {
  if (input && typeof input === 'object' && !Array.isArray(input)) {
    return { kind: 'tree', tree: input };
  }
  if (input == null) return null;
  const text = String(input).trim();
  if (!text) return null;
  if (text.startsWith('{') || text.startsWith('[')) {
    try {
      const parsed = JSON.parse(text);
      if (parsed && typeof parsed === 'object') {
        return { kind: 'tree', tree: parsed };
      }
      throw new Error('Invalid predicate JSON');
    } catch (err) {
      throw new Error('Invalid predicate JSON');
    }
  }
  return { kind: 'expr', expr: text };
}

module.exports = { parseWhereInput };

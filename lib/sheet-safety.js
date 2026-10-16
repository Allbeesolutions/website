// Guard Google Sheets write sinks against spreadsheet formula interpretation.
// Preserve normal values; prefix formula-shaped user text with a literal quote.
function cellText(value) {
  return typeof value === 'string' && /^[\s\u0000-\u001f]*[=+\-@]/.test(value) ? "'" + value : value;
}
function cellFields(payload, keys) {
  const copy = { ...payload };
  for (const key of keys) if (Object.hasOwn(copy, key)) copy[key] = cellText(copy[key]);
  return copy;
}
module.exports = { cellText, cellFields };

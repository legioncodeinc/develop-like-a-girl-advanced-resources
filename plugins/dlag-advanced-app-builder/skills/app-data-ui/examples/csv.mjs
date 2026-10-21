// Inert formatting helper. Integrate only after authorized, bounded server export.
export function csvCell(value) {
  const raw = String(value ?? '');
  const dangerous = /^[\t\r\n]/.test(raw) || /^[\s]*[=+@-]/u.test(raw);
  const safe = dangerous ? `\t${raw}` : raw;
  return `"${safe.replaceAll('"', '""')}"`;
}
export function csvRows(rows) {
  return rows.map(row => row.map(csvCell).join(',')).join('\r\n');
}

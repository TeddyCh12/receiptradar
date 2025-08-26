export function formatDate(input: string | Date) {
  const d = typeof input === 'string' ? new Date(input) : input;
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

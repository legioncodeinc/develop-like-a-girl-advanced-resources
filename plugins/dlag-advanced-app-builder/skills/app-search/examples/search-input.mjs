// Inert input parser. Values still require bound SQL parameters and actor scope.
export function searchInput(url) {
  const params = new URL(url).searchParams;
  const q = (params.get('q') ?? '').trim();
  if (q.length > 120) throw new RangeError('Search must be 120 characters or fewer');
  const page = params.get('page') ?? '1';
  if (!/^[1-9]\d{0,3}$/.test(page)) throw new RangeError('Invalid page');
  const sort = params.get('sort') ?? 'newest';
  if (!['newest', 'title'].includes(sort)) throw new RangeError('Invalid sort');
  return { q, page: Number(page), pageSize: 20, sort };
}

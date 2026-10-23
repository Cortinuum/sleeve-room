const ROOT = 'https://musicbrainz.org/ws/2/';
const cache = new Map();
let queue = Promise.resolve(), lastRequest = 0;
const pause = ms => new Promise(resolve => setTimeout(resolve, ms));

// MusicBrainz permits one request per second. Cache metadata, not cover images.
export function request(path) {
  if (cache.has(path)) return cache.get(path);
  const pending = queue.then(async () => {
    for (let attempt = 0; attempt < 3; attempt++) {
      await pause(Math.max(0, 1100 - (Date.now() - lastRequest)));
      lastRequest = Date.now();
      const response = await fetch(ROOT + path, {
        headers: { Accept: 'application/json' }, signal: AbortSignal.timeout(20000)
      });
      if ([429, 503].includes(response.status) && attempt < 2) {
        await pause(1500 * (attempt + 1));
        continue;
      }
      if (!response.ok) throw new Error('HTTP ' + response.status);
      return response.json();
    }
  });
  queue = pending.catch(() => {});
  cache.set(path, pending);
  pending.catch(() => cache.delete(path));
  if (cache.size > 80) cache.delete(cache.keys().next().value);
  return pending;
}

const normalized = value => (value || '').normalize('NFKC').toLocaleLowerCase().replace(/[^\p{L}\p{N}]/gu, '');
const votes = album => Number(album.rating?.['votes-count'] || 0);
function category(album) {
  const secondary = album['secondary-types'] || [];
  if (secondary.some(type => ['Live', 'Compilation', 'Remix', 'Demo', 'Interview'].includes(type))) return 2;
  return album['primary-type'] === 'Album' ? 0 : 1;
}
export function rankAlbums(albums, query = '', artistMode = false) {
  const unique = [...new Map(albums.map(album => [album.id, album])).values()];
  const exact = album => normalized(album.title) === normalized(query) ? 1 : 0;
  return unique.sort((a, b) => {
    if (!artistMode) {
      const match = exact(b) - exact(a) || Number(b.score || 0) - Number(a.score || 0);
      if (match) return match;
    }
    return category(a) - category(b) || votes(b) - votes(a)
      || Number(b.rating?.value || 0) - Number(a.rating?.value || 0)
      || Number(b.count || 0) - Number(a.count || 0)
      || (a['first-release-date'] || '9999').localeCompare(b['first-release-date'] || '9999')
      || a.title.localeCompare(b.title);
  });
}

export const PRIMARY_TYPES = {Album:'앨범', EP:'EP', Single:'싱글', Broadcast:'방송', Other:'기타'};
export const SECONDARY_TYPES = {
  Compilation:'컴필레이션', Live:'라이브', Soundtrack:'사운드트랙', Remix:'리믹스', Demo:'데모',
  'DJ-mix':'DJ 믹스', 'Mixtape/Street':'믹스테이프', Audiobook:'오디오북',
  'Audio drama':'오디오 드라마', Spokenword:'낭독·스포큰 워드', Interview:'인터뷰', 'Field recording':'현장 녹음'
};
const quote = value => '"' + value.replace(/\\/g, '\\\\').replace(/"/g, '\\"') + '"';
export function buildQuery(criteria) {
  const clauses = [];
  const artist = (criteria.artist || '').trim(), album = (criteria.album || '').trim();
  if (artist) clauses.push('artist:' + quote(artist));
  if (album) clauses.push('releasegroup:' + quote(album));
  if (Object.hasOwn(PRIMARY_TYPES, criteria.primary)) clauses.push('primarytype:' + quote(criteria.primary));
  if (criteria.secondary === 'none') clauses.push('NOT secondarytype:*');
  else if (Object.hasOwn(SECONDARY_TYPES, criteria.secondary)) clauses.push('secondarytype:' + quote(criteria.secondary));
  if (clauses.length === 1 && clauses[0].startsWith('NOT ')) clauses.unshift('*:*');
  return clauses.join(' AND ');
}

export async function searchCatalog(criteria, fetcher = request) {
  const query = buildQuery(criteria);
  const artistName = (criteria.artist || '').trim(), albumName = (criteria.album || '').trim();
  if (!query) return { albums: [], total: 0, more: null, artist: null, artistMode: false };
  let artist;
  // Keep participation-based ordering for an unfiltered artist catalogue.
  // Every combined or filtered search is sent as a server-side AND query.
  if (artistName && !albumName && !criteria.primary && !criteria.secondary) {
    const artists = await fetcher('artist/?' + new URLSearchParams({query: 'artist:' + quote(artistName), limit: '5', fmt: 'json'}));
    const first = artists.artists?.[0];
    if (first && (Number(first.score) >= 95 || normalized(first.name) === normalized(artistName))) artist = first;
  }
  const result = { albums: [], total: 0, more: null, artist: artist?.name || artistName, artistMode: !!artist, criteria: {...criteria} };
  let offset = 0;
  async function next() {
    const params = artist
      ? {artist: artist.id, inc: 'ratings+artist-credits', 'release-group-status': 'website-default'}
      : {query};
    const data = await fetcher('release-group/?' + new URLSearchParams({...params, limit: '100', offset: String(offset), fmt: 'json'}));
    const page = data['release-groups'] || [];
    offset += page.length;
    result.total = Number(data['release-group-count'] ?? data.count ?? page.length);
    result.albums = rankAlbums([...result.albums, ...page], albumName, !!artist);
    result.more = page.length && offset < result.total ? next : null;
    return result;
  }
  await next();
  // Rank the first 300 records together so a later API page cannot hide a classic.
  if (artist) for (let i = 0; i < 2 && result.more; i++) await next();
  return result;
}

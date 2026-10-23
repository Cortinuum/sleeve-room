(function (root) {
  const trim = albums => {
    const result = albums.slice();
    while (result.length && !result[result.length - 1]) result.pop();
    return result;
  };
  const api = {
    count: albums => albums.filter(Boolean).length,
    move(albums, from, to, capacity) {
      if (!Number.isInteger(from) || !Number.isInteger(to) || from < 0 || to < 0 || to >= capacity || !albums[from]) return albums;
      const result = Array.from({ length: Math.max(albums.length, to + 1) }, (_, i) => albums[i] || null);
      [result[from], result[to]] = [result[to], result[from]];
      return trim(result);
    },
    remove(albums, index) { const result = albums.slice(); result[index] = null; return trim(result); },
    add(albums, album, capacity) {
      if (api.count(albums) >= capacity || albums.some(item => item?.id === album.id)) return albums;
      const result = albums.slice();
      const empty = result.findIndex(item => !item);
      if (empty < 0) result.push(album); else result[empty] = album;
      return result;
    }
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.SleeveGrid = api;
})(typeof window !== 'undefined' ? window : globalThis);

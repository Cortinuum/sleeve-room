import { searchCatalog, buildQuery, PRIMARY_TYPES, SECONDARY_TYPES } from './search.mjs';
const $ = id => document.getElementById(id);
let generation = 0, current, visible = 30;
for (const [id, types] of [['primaryType', PRIMARY_TYPES], ['secondaryType', SECONDARY_TYPES]]) {
  for (const [value, label] of Object.entries(types)) {
    const option = document.createElement('option'); option.value = value; option.textContent = label;
    $(id).append(option);
  }
}

function albumButton(album) {
  const button = document.createElement('button');
  button.className = 'result';
  const image = document.createElement('img');
  const url = `https://coverartarchive.org/release-group/${album.id}/front-500`;
  image.loading = 'lazy'; image.alt = '';
  const text = document.createElement('div'), title = document.createElement('strong');
  const artist = document.createElement('small'), metadata = document.createElement('small');
  const plus = document.createElement('span');
  plus.className = 'result-add';
  plus.setAttribute('aria-hidden', 'true');
  title.textContent = album.title;
  artist.textContent = (album['artist-credit'] || []).map(c => c.name || c.artist?.name || '').join(', ') || current.artist || '';
  const kinds = PRIMARY_TYPES;
  const secondary = (album['secondary-types'] || []).map(t => SECONDARY_TYPES[t] || t);
  metadata.className = 'result-meta';
  metadata.textContent = [album['first-release-date']?.slice(0,4), kinds[album['primary-type']] || album['primary-type'], ...secondary].filter(Boolean).join(' · ');
  if (album.rating?.['votes-count']) metadata.title = `MusicBrainz 평점 참여 ${album.rating['votes-count']}명`;
  text.append(title, artist, metadata); plus.textContent = '…';
  button.append(plus, image, text);
  let available = false, failed = false;
  image.onload = () => { available = true; plus.textContent = '+'; button.title = album.title + ' 추가'; };
  image.onerror = () => { failed = true; image.style.visibility = 'hidden'; plus.textContent = '—'; button.title = '등록된 커버 없음 · 직접 업로드를 이용하세요'; };
  image.src = url;
  button.onclick = () => {
    if (!available) { window.sleeveRoom.toast(failed ? '등록된 커버가 없어요. 직접 업로드로 추가해 주세요.' : '커버를 불러오는 중이에요. 잠시 뒤 다시 눌러 주세요.'); return; }
    window.sleeveRoom.add({id: album.id, title: album.title, artist: artist.textContent, url});
  };
  return button;
}

function renderResults() {
  $('results').replaceChildren();
  const summary = document.createElement('div'); summary.className = 'search-summary';
  const count = current.total.toLocaleString();
  summary.textContent = `${current.artist ? current.artist + ' · ' : ''}${count}개 중 ${Math.min(visible, current.albums.length)}개 표시`;
  const help = document.createElement('small');
  help.textContent = current.artistMode ? '정규 앨범 우선 · 평점 참여 수 기준 관심도순' : '일치도 · 정규 앨범 · 등록 판본 수 순';
  summary.append(help); $('results').append(summary);
  const criteria = current.criteria;
  if (criteria) {
    const filters = [criteria.artist && '아티스트: ' + criteria.artist, criteria.album && '앨범: ' + criteria.album,
      PRIMARY_TYPES[criteria.primary], criteria.secondary === 'none' ? '추가 유형 없음' : SECONDARY_TYPES[criteria.secondary]].filter(Boolean);
    const applied = document.createElement('small'); applied.className = 'applied-filters';
    applied.textContent = filters.join(' ∩ '); summary.append(applied);
  }
  if (!current.albums.length) {
    const empty = document.createElement('div'); empty.className = 'message';
    empty.textContent = '모든 조건에 맞는 앨범이 없어요. 이름을 짧게 입력하거나 종류·추가 유형을 전체로 바꿔 보세요.';
    $('results').append(empty); return;
  }
  for (const album of current.albums.slice(0, visible)) $('results').append(albumButton(album));
  if (visible < current.albums.length || current.more) {
    const more = document.createElement('button'); more.className = 'load-more'; more.textContent = '＋ 결과 더 보기';
    more.onclick = async () => {
      const token = generation;
      const scrollTop = $('results').scrollTop;
      more.disabled = true; more.textContent = '더 찾는 중…';
      try {
        if (visible >= current.albums.length && current.more) await current.more();
        if (token !== generation) return;
        visible += 30; renderResults(); $('results').scrollTop = scrollTop;
      } catch {
        if (token === generation) { more.disabled = false; more.textContent = '다시 불러오기'; window.sleeveRoom.toast('결과를 더 가져오지 못했어요. 다시 시도해 주세요.'); }
      }
    };
    $('results').append(more);
  }
}

$('searchForm').onsubmit = async event => {
  event.preventDefault();
  const criteria = {artist:$('artistQuery').value.trim(), album:$('albumQuery').value.trim(), primary:$('primaryType').value, secondary:$('secondaryType').value};
  if (!buildQuery(criteria)) { window.sleeveRoom.toast('아티스트명·앨범명·분류 중 하나 이상 입력해 주세요.'); $('artistQuery').focus(); return; }
  const token = ++generation;
  $('results').innerHTML = '<div class="message">앨범 목록과 관심도를 확인하고 있어요…</div>';
  $('results').setAttribute('aria-busy', 'true');
  try {
    const result = await searchCatalog(criteria);
    if (token !== generation) return;
    current = result; visible = 30; renderResults(); $('results').scrollTop = 0;
  } catch {
    if (token === generation) $('results').innerHTML = '<div class="message">검색 서버에 연결하지 못했어요. 잠시 뒤 다시 검색하거나 커버를 직접 올려 주세요.</div>';
  } finally { if (token === generation) $('results').setAttribute('aria-busy', 'false'); }
};

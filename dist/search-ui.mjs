import { searchCatalog } from './search.mjs';
const $ = id => document.getElementById(id);
let generation = 0, current, visible = 30;

function albumButton(album) {
  const button = document.createElement('button');
  button.className = 'result';
  const image = document.createElement('img');
  const url = `https://coverartarchive.org/release-group/${album.id}/front-500`;
  image.loading = 'lazy'; image.alt = '';
  const text = document.createElement('div'), title = document.createElement('strong');
  const artist = document.createElement('small'), metadata = document.createElement('small');
  const plus = document.createElement('span');
  title.textContent = album.title;
  artist.textContent = (album['artist-credit'] || []).map(c => c.name || c.artist?.name || '').join(', ') || current.artist || '';
  const kinds = {Album:'앨범', EP:'EP', Single:'싱글', Broadcast:'방송', Other:'기타'};
  const secondary = (album['secondary-types'] || []).map(t => ({Live:'라이브',Compilation:'컴필레이션',Remix:'리믹스',Demo:'데모'}[t] || t));
  metadata.className = 'result-meta';
  metadata.textContent = [album['first-release-date']?.slice(0,4), kinds[album['primary-type']] || album['primary-type'], ...secondary].filter(Boolean).join(' · ');
  if (album.rating?.['votes-count']) metadata.title = `MusicBrainz 평점 참여 ${album.rating['votes-count']}명`;
  text.append(title, artist, metadata); plus.textContent = '…';
  button.append(image, text, plus);
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
  if (!current.albums.length) {
    const empty = document.createElement('div'); empty.className = 'message';
    empty.textContent = '찾은 앨범이 없어요. 검색 방식을 바꾸거나 커버를 직접 올려 주세요.';
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
  event.preventDefault(); const query = $('query').value.trim(); if (!query) return;
  const token = ++generation;
  $('results').innerHTML = '<div class="message">앨범 목록과 관심도를 확인하고 있어요…</div>';
  $('results').setAttribute('aria-busy', 'true');
  try {
    const result = await searchCatalog(query, $('searchMode').value);
    if (token !== generation) return;
    current = result; visible = 30; renderResults(); $('results').scrollTop = 0;
  } catch {
    if (token === generation) $('results').innerHTML = '<div class="message">검색 서버에 연결하지 못했어요. 잠시 뒤 다시 검색하거나 커버를 직접 올려 주세요.</div>';
  } finally { if (token === generation) $('results').setAttribute('aria-busy', 'false'); }
};

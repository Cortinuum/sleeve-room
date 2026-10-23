import { test } from 'node:test';
import assert from 'node:assert/strict';
import { rankAlbums } from './dist/search.mjs';
const album = (id, title, votes, extra = {}) => ({id,title,'primary-type':'Album','secondary-types':[],rating:{'votes-count':votes,value:4},...extra});
test('artist results rank regular albums by participation, not average rating or incoming API order', () => {
  const rows = [album('live','Live',1000,{'secondary-types':['Live']}),album('rare','Rare',1,{rating:{'votes-count':1,value:5}}),album('classic','Classic',80),album('ep','EP',90,{'primary-type':'EP'})];
  assert.deepEqual(rankAlbums(rows,'',true).map(a=>a.id),['classic','rare','ep','live']);
});
test('album title match takes priority over broad related matches', () => {
  const rows=[album('tribute','Tribute to Kid A',90,{score:100}),album('original','Kid A',2,{score:80})];
  assert.equal(rankAlbums(rows,'kid a')[0].id,'original');
});
test('deduplicate release groups while keeping same-title albums by different artists', () => {
  const rows=[album('one','Same title',5),album('two','Same title',3),album('one','Same title',5)];
  assert.equal(rankAlbums(rows,'',true).length,2);
});

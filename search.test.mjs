import { test } from 'node:test';
import assert from 'node:assert/strict';
import { rankAlbums, buildQuery, searchCatalog } from './dist/search.mjs';
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
test('artist, album, primary type and secondary type form one intersection query',()=>{
  assert.equal(buildQuery({artist:' Radiohead ',album:' In Rainbows ',primary:'Album',secondary:'Live'}),
    'artist:"Radiohead" AND releasegroup:"In Rainbows" AND primarytype:"Album" AND secondarytype:"Live"');
  assert.equal(buildQuery({artist:'Radiohead',secondary:'none'}),'artist:"Radiohead" AND NOT secondarytype:*');
});
test('mismatched artist and album return zero without falling back to a broader search',async()=>{
  const calls=[];
  const result=await searchCatalog({artist:'Nirvana',album:'In Rainbows'},async path=>{
    calls.push(path);return {count:0,'release-groups':[]};
  });
  assert.equal(result.albums.length,0);assert.equal(calls.length,1);
  assert.equal(new URLSearchParams(calls[0].split('?')[1]).get('query'),'artist:"Nirvana" AND releasegroup:"In Rainbows"');
});
test('load more preserves every selected criterion and advances the offset',async()=>{
  const calls=[],criteria={artist:'Radiohead',album:'Live',primary:'Album',secondary:'Live'};
  const result=await searchCatalog(criteria,async path=>{
    calls.push(path);return {count:2,'release-groups':[album(String(calls.length),'Live '+calls.length,0)]};
  });
  assert.equal(result.total,2);assert.ok(result.more);await result.more();
  assert.equal(result.albums.length,2);assert.equal(result.more,null);
  const params=calls.map(path=>new URLSearchParams(path.split('?')[1]));
  assert.deepEqual(params.map(p=>p.get('offset')),['0','1']);
  assert.ok(params.every(p=>p.get('query')===buildQuery(criteria)));
});
test('artist-only search keeps catalogue rating data for representative album ranking',async()=>{
  const result=await searchCatalog({artist:'Radiohead'},async path=>{
    if(path.startsWith('artist/'))return {artists:[{id:'artist-id',name:'Radiohead',score:100}]};
    const params=new URLSearchParams(path.split('?')[1]);
    assert.equal(params.get('artist'),'artist-id');assert.equal(params.get('inc'),'ratings+artist-credits');
    return {'release-group-count':2,'release-groups':[album('rare','Rare',1),album('classic','Classic',90)]};
  });
  assert.equal(result.artistMode,true);assert.equal(result.albums[0].id,'classic');
});
test('empty criteria issue no API request; filter-only searches are supported',async()=>{
  const empty=await searchCatalog({},()=>{throw Error('Unexpected request');});assert.equal(empty.total,0);
  assert.equal(buildQuery({primary:'EP'}),'primarytype:"EP"');
  assert.equal(buildQuery({secondary:'none'}),'*:* AND NOT secondarytype:*');
});

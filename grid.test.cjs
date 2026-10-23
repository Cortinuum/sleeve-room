const {test}=require('node:test');
const assert=require('node:assert/strict');
const grid=require('./dist/grid.js');
const a={id:'a'},b={id:'b'},c={id:'c'};
test('moving to the last empty slot preserves the exact position and album count',()=>{
  const result=grid.move([a,b],0,8,9);
  assert.deepEqual(result,[null,b,null,null,null,null,null,null,a]);
  assert.equal(grid.count(result),2);
  assert.deepEqual(JSON.parse(JSON.stringify(result)),result);
});
test('occupied destinations exchange only the two selected covers',()=>{
  assert.deepEqual(grid.move([a,b,c],0,2,9),[c,b,a]);
});
test('remove keeps other covers in place; a new album fills the first empty slot',()=>{
  const sparse=grid.move([a,b],0,8,9);
  const removed=grid.remove(sparse,1);
  assert.equal(removed[8],a);
  const added=grid.add(removed,c,9);
  assert.equal(added[0],c);assert.equal(added[8],a);assert.equal(grid.count(added),2);
});
test('reject out-of-bounds moves and duplicate additions without losing albums',()=>{
  const albums=[a,null,b];
  assert.equal(grid.move(albums,0,9,9),albums);
  assert.equal(grid.move(albums,1,0,9),albums);
  assert.equal(grid.add(albums,a,9),albums);
});
test('moving back restores the original collection without trailing empty cells',()=>{
  assert.deepEqual(grid.move(grid.move([a,b],0,8,9),8,0,9),[a,b]);
});

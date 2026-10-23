const {test}=require('node:test');
const assert=require('node:assert/strict');
const design=require('./dist/designs.js');
test('every template keeps all cover cells inside its export canvas',()=>{
  for(const template of design.templates)for(const n of [3,4,5,10])for(const gap of [0,8,24]){
    const state={design:template.id,n,gap},m=design.layout(state);
    for(let i=0;i<n*n;i++){
      const r=design.cellRect(state,i);
      assert.ok(r.x>=0&&r.y>=0&&r.width>0&&r.height>0);
      assert.ok(r.x+r.width<=m.width&&r.y+r.height<=m.height);
      assert.ok(Math.abs(r.width-r.height)<=1);
    }
  }
});
test('bare template has zero outer margin, zero gaps, no title and no album labels',()=>{
  for(const n of [3,4,5,10]){
    const state={design:'bare',n,gap:24,labels:true,color:'#222623',title:'DO NOT DRAW',albums:Array(n*n).fill({title:'DO NOT DRAW'})};
    const m=design.layout(state);assert.equal(m.labels,false);assert.equal(m.gap,0);
    const ctx={fillRect(){},drawImage(...args){calls.push(args.slice(-4));},fillText(){throw Error('Bare export must not render any text');}};
    const calls=[],canvas={getContext:()=>ctx};
    design.decorate(canvas,state);design.drawImages(canvas,state,Array(n*n).fill({width:600,height:600}));
    assert.equal(canvas.width,1800);assert.equal(canvas.height,1800);
    assert.deepEqual(calls[0],[0,0,1800/n,1800/n]);
    assert.equal(calls.at(-1)[0]+calls.at(-1)[2],1800);
    assert.equal(calls.at(-1)[1]+calls.at(-1)[3],1800);
    for(let i=0;i<n*n;i++)if(i%n<n-1)assert.equal(calls[i][0]+calls[i][2],calls[i+1][0]);
  }
});
test('unknown saved template falls back to the classic layout',()=>{
  assert.equal(design.layout({design:'old-unknown',n:3,gap:8}).id,'classic');
});

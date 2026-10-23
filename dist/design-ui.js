(() => {
  const list=document.getElementById('designOptions');
  for(const template of SleeveDesign.templates){
    const button=document.createElement('button');button.className='design-card';button.dataset.design=template.id;button.setAttribute('aria-pressed','false');
    const canvas=document.createElement('canvas');canvas.setAttribute('aria-hidden','true');
    const sample={design:template.id,n:3,gap:template.gap,color:template.color,title:'MY SELECTION',albums:Array(9).fill({})};
    SleeveDesign.decorate(canvas,sample);
    const ctx=canvas.getContext('2d');
    const colors=['#9ba38b','#b86a45','#545e54','#d3cbb4','#797e93','#aaa37e','#697d77','#c39d82','#4a5551'];
    for(let i=0;i<9;i++){
      const r=SleeveDesign.cellRect(sample,i);ctx.fillStyle=colors[i];ctx.fillRect(r.x,r.y,r.width,r.height);
      ctx.fillStyle='#0002';ctx.beginPath();ctx.arc(r.x+r.width/2,r.y+r.height/2,r.width*.3,0,Math.PI*2);ctx.fill();
    }
    const name=document.createElement('strong');name.textContent=template.name;
    const subtitle=document.createElement('small');subtitle.textContent=template.subtitle;
    button.append(canvas,name,subtitle);button.onclick=()=>window.sleeveRoom.setDesign(template.id);list.append(button);
  }
  window.sleeveRoom.refreshDesign();
})();

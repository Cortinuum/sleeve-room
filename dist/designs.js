(function(root){
  const templates=[
    {id:'classic',name:'클래식 슬리브',subtitle:'크림색 종이 · 작은 카탈로그',color:'#e7e0d0',gap:8},
    {id:'swiss',name:'스위스 포스터',subtitle:'큰 활자 · 비대칭 포인트',color:'#e7e0d0',gap:8,source:'https://swissgrid.posterhouse.org/',reference:'Poster House · The Swiss Grid'},
    {id:'obi',name:'오비 에디션',subtitle:'세로 띠 · 일본 프레싱 감성',color:'#e7e0d0',gap:6,source:'https://kaishu-vinyl.com/blogs/guides/what-is-an-obi-strip',reference:'KAISHU VINYL · Obi Strip'},
    {id:'contact',name:'콘택트 시트',subtitle:'필름 프레임 · 아카이브',color:'#222623',gap:12,source:'https://www.magnumphotos.com/theory-and-practice/magnum-photographers-contact-sheets-the-images-behind-the-image/',reference:'Magnum Photos · Contact Sheets'},
    {id:'bare',name:'커버만 · 여백 없이',subtitle:'제목 0 · 장식 0 · 간격 0',color:'#222623',gap:0}
  ];
  const get=id=>templates.find(t=>t.id===id)||templates[0];
  function layout(state){
    const id=get(state.design).id;
    const config={classic:[1800,1980,80,120,1640],swiss:[1800,2180,80,430,1640],obi:[1980,1980,330,130,1560],contact:[1800,2000,100,200,1600],bare:[1800,1800,0,0,1800]}[id];
    const [width,height,x,y,area]=config;
    const gap=id==='bare'?0:Number(state.gap||0)*3;
    return {id,width,height,x,y,area,gap,cell:(area-gap*(state.n-1))/state.n,labels:id!=='bare'&&state.labels};
  }
  function cellRect(state,index){
    const m=layout(state),col=index%state.n,row=Math.floor(index/state.n);
    const x=Math.round(m.x+col*(m.cell+m.gap)),y=Math.round(m.y+row*(m.cell+m.gap));
    return {x,y,width:Math.round(m.x+col*(m.cell+m.gap)+m.cell)-x,height:Math.round(m.y+row*(m.cell+m.gap)+m.cell)-y};
  }
  function inkFor(color){
    const rgb=(color||'#e7e0d0').slice(1).match(/../g)?.map(v=>parseInt(v,16))||[231,224,208];
    return rgb[0]*.299+rgb[1]*.587+rgb[2]*.114<140?'#eee8da':'#242821';
  }
  function decorate(canvas,state){
    const m=layout(state);canvas.width=m.width;canvas.height=m.height;
    const ctx=canvas.getContext('2d'),ink=inkFor(state.color),accent=ink==='#eee8da'?'#f3a873':'#d7522e';
    ctx.fillStyle=state.color;ctx.fillRect(0,0,m.width,m.height);
    if(m.id==='bare')return m;
    ctx.fillStyle=ink;
    const text=(value,x,y,size=24,weight=400,maxWidth,mono=false)=>{
      ctx.font=weight+' '+size+'px '+(mono?'monospace':'"DM Sans","Noto Sans KR",sans-serif');
      if(maxWidth===undefined)ctx.fillText(value,x,y);else ctx.fillText(value,x,y,maxWidth);
    };
    const line=(x,y,w,h=2)=>ctx.fillRect(x,y,w,h);
    const title=state.title||'MY HEAVY ROTATION';
    const count=(state.albums||[]).filter(Boolean).length;
    if(m.id==='classic'){
      text('SLEEVE ROOM / PERSONAL COLLECTION',80,60,20);text('VOL. 001',1580,60,20);line(80,82,1640);
      text(title,80,1865,70,700,1400);text('A SOUNDTRACK TO MY DAYS.',80,1920,20);
      [0,10,25,32,46,65,70,88,101,118,125].forEach((n,i)=>line(1550+n,1820,i%3===0?6:3,65));
      text('SELECTED BY YOU',1540,1920,14);
    }else if(m.id==='swiss'){
      ctx.fillStyle=accent;text('selected /',80,165,145,700,1250);
      ctx.fillStyle=ink;text(title,80,295,100,700,1560);
      text('SLEEVE ROOM',80,370,23,600);text('PERSONAL COLLECTION / 001',1060,370,23);
      line(80,392,1640,3);
      ctx.fillStyle=accent;ctx.beginPath();ctx.arc(1620,120,75,0,Math.PI*2);ctx.fill();
      ctx.fillStyle=ink;text(String(count).padStart(2,'0')+' RECORDS',80,2130,25,700);
      text('A SOUNDTRACK TO MY DAYS.',1120,2130,20);
    }else if(m.id==='obi'){
      ctx.fillStyle=accent;ctx.fillRect(0,0,260,m.height);
      ctx.fillStyle='#f6edcc';text('SR / 001',40,80,28,700);
      ctx.save();ctx.translate(153,1850);ctx.rotate(-Math.PI/2);text(title,0,0,120,700,1550);ctx.restore();
      text('33⅓ RPM',50,1910,26,600);
      ctx.fillStyle=ink;text('SLEEVE ROOM / OBI EDITION',330,80,25,700);
      text('音楽のある暮らし',330,1795,66,600);text('A LIFE WITH RECORDS.',330,1855,27);
      line(330,1890,1560);text('PERSONAL COLLECTION',330,1935,20);text('SELECTED BY YOU',1610,1935,20);
    }else if(m.id==='contact'){
      text('SLEEVE ROOM / CONTACT SHEET',100,75,23,500,undefined,true);
      text(title,100,145,65,700,1580);line(100,170,1600);
      ctx.fillStyle=accent;
      if(m.gap>=24)for(let i=0;i<state.n**2;i++){
        const rect=cellRect(state,i);text(String(i+1).padStart(2,'0'),rect.x,rect.y-10,16,500,undefined,true);
      }
      for(let y=215;y<1790;y+=65){ctx.fillRect(52,y,16,28);ctx.fillRect(1732,y,16,28);}
      ctx.fillStyle=ink;line(100,1850,1600);text('ARCHIVE / '+String(count).padStart(2,'0')+' SELECTED RECORDS',100,1910,26,500,undefined,true);
      text('KEEP THE ONES THAT STAY WITH YOU.',100,1955,18,400,undefined,true);
    }
    return m;
  }
  function drawImages(canvas,state,images){
    const m=layout(state),ctx=canvas.getContext('2d');
    for(let i=0;i<state.n**2;i++){
      const r=cellRect(state,i),image=images[i];
      if(image){const side=Math.min(image.width,image.height);ctx.drawImage(image,(image.width-side)/2,(image.height-side)/2,side,side,r.x,r.y,r.width,r.height);
        if(m.labels){
          const labelHeight=Math.max(35,Math.round(m.cell*.1));
          ctx.fillStyle='#111c';ctx.fillRect(r.x,r.y+r.height-labelHeight,r.width,labelHeight);ctx.fillStyle='#fff';ctx.font='18px "Noto Sans KR",sans-serif';
          ctx.save();ctx.beginPath();ctx.rect(r.x+8,r.y+r.height-labelHeight,r.width-16,labelHeight);ctx.clip();ctx.fillText(state.albums[i]?.title||'',r.x+8,r.y+r.height-12);ctx.restore();
        }
      }else if(m.id!=='bare'){ctx.fillStyle='#80808022';ctx.fillRect(r.x,r.y,r.width,r.height);}
    }
    return canvas;
  }
  const api={templates,get,layout,cellRect,inkFor,decorate,drawImages};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.SleeveDesign=api;
})(typeof window!=='undefined'?window:globalThis);

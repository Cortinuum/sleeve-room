const $=id=>document.getElementById(id);
let state={albums:[],n:3,gap:8,color:'#e7e0d0',title:'MY HEAVY ROTATION',labels:false,design:'classic'};
try{const saved=JSON.parse(localStorage.getItem('sleeve-room-v1'));if(saved&&Array.isArray(saved.albums))state={...state,...saved,n:[3,4,5].includes(saved.n)?saved.n:3};}catch{}
state.design=SleeveDesign.get(state.design).id;
let toastTimer;
function toast(message){$('toast').textContent=message;$('toast').style.display='block';clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').style.display='none',4500);}
function save(){try{localStorage.setItem('sleeve-room-v1',JSON.stringify(state));}catch{toast('브라우저 저장 공간이 부족합니다. 현재 작업은 PNG로 저장해 주세요.');}}
function move(from,to){
  state.albums=SleeveGrid.move(state.albums,from,to,state.n**2);
  update(); $('grid').children[to]?.focus();
  toast((to+1)+'번 칸으로 이동했어요.');
}
function render(){
  const grid=$('grid'); grid.replaceChildren();
  grid.style.gridTemplateColumns='repeat('+state.n+',1fr)';
  $('poster').style.background=state.color; $('poster').style.color=state.color==='#222623'?'#e7e0d0':'#272b23';
  $('posterTitle').textContent=state.title||'MY HEAVY ROTATION';
  $('count').textContent=SleeveGrid.count(state.albums)+' / '+state.n**2+' RECORDS';
  for(let i=0;i<state.n**2;i++){
    const slot=document.createElement('div'); slot.className='slot'; slot.dataset.index=i;
    const album=state.albums[i];
    if(album){
      const img=document.createElement('img');img.src=album.url;img.alt=album.title;img.draggable=false;
      img.addEventListener('error',()=>{img.alt='이미지를 불러올 수 없습니다';},{once:true});slot.append(img);
      const remove=document.createElement('button');remove.className='remove';remove.textContent='×';remove.ariaLabel=album.title+' 삭제';
      remove.onclick=()=>{state.albums=SleeveGrid.remove(state.albums,i);update();};slot.append(remove);
      if(SleeveDesign.layout(state).labels){const label=document.createElement('div');label.className='album-label';label.textContent=album.title;slot.append(label);}
      slot.tabIndex=0;slot.title='드래그로 이동 · 다른 커버에 놓으면 자리 교환 · Alt + 방향키로 이동';
      slot.setAttribute('aria-label',album.title+' · '+(i+1)+'번 칸 · 드래그 또는 Alt + 방향키로 이동');
      slot.onkeydown=event=>{
        if(!event.altKey)return;
        const diff={ArrowLeft:-1,ArrowRight:1,ArrowUp:-state.n,ArrowDown:state.n}[event.key];
        if(diff===undefined)return;event.preventDefault();const target=i+diff;
        if(target>=0&&target<state.n**2)move(i,target);
      };
    }else{
      slot.classList.add('empty');const number=document.createElement('span');number.textContent=String(i+1).padStart(2,'0');slot.append(number);
      slot.setAttribute('aria-label',(i+1)+'번 빈 칸');
    }
    grid.append(slot);
  }
  document.querySelectorAll('[data-n]').forEach(b=>b.classList.toggle('active',+b.dataset.n===state.n));
  document.querySelectorAll('[data-color]').forEach(b=>b.classList.toggle('active',b.dataset.color===state.color));
  refreshDesign();
}
function update(){render();save();}
$('title').value=state.title;$('gap').value=state.gap;$('labels').checked=state.labels;
$('title').oninput=e=>{state.title=e.target.value;update();};$('gap').oninput=e=>{state.gap=+e.target.value;update();};$('labels').onchange=e=>{state.labels=e.target.checked;update();};
document.querySelectorAll('[data-n]').forEach(b=>b.onclick=()=>{const n=+b.dataset.n;if(state.albums.length>n*n){toast(`${n*n+1}번 이후 칸에 커버가 있어요. 앞쪽 빈 칸으로 옮긴 뒤 변경해 주세요.`);return;}state.n=n;update();});document.querySelectorAll('[data-color]').forEach(b=>b.onclick=()=>{state.color=b.dataset.color;update();});
$('clear').onclick=()=>{if(state.albums.length&&confirm('담아 둔 앨범을 모두 비울까요?')){state.albums=[];update();}};
function add(album){if(SleeveGrid.count(state.albums)>=state.n**2){toast('그리드가 가득 찼어요. 더 큰 그리드를 선택해 주세요.');return;}if(state.albums.some(a=>a?.id===album.id)){toast('이미 담은 앨범이에요.');return;}state.albums=SleeveGrid.add(state.albums,album,state.n**2);update();}
$('upload').onchange=async e=>{for(const file of e.target.files){if(SleeveGrid.count(state.albums)>=state.n**2){toast('그리드가 가득 찼어요.');break;}if(!file.type.startsWith('image/'))continue;if(file.size>20*1024*1024){toast('20MB 이하 이미지를 선택해 주세요.');continue;}try{const bitmap=await createImageBitmap(file),canvas=document.createElement('canvas');canvas.width=canvas.height=600;const ctx=canvas.getContext('2d'),side=Math.min(bitmap.width,bitmap.height);ctx.drawImage(bitmap,(bitmap.width-side)/2,(bitmap.height-side)/2,side,side,0,0,600,600);bitmap.close();add({id:crypto.randomUUID(),title:file.name.replace(/\.[^.]+$/,''),artist:'내 컬렉션',url:canvas.toDataURL('image/jpeg',.85)});}catch{toast(file.name+' 파일을 읽을 수 없어요.');}}e.target.value='';};
async function loadImage(url){const response=await fetch(url,{signal:AbortSignal.timeout(30000)});if(!response.ok)throw Error('이미지 응답 오류');const blob=await response.blob();return createImageBitmap(blob);}
$('download').onclick=async()=>{
  if(!SleeveGrid.count(state.albums)){toast('앨범을 먼저 담아 주세요.');return;}
  const button=$('download');button.disabled=true;button.textContent='이미지 만드는 중…';
  const snapshot=JSON.parse(JSON.stringify(state));let images=[];
  try{
    const settled=await Promise.allSettled(snapshot.albums.map(a=>a?loadImage(a.url):Promise.resolve(null)));
    images=settled.map(r=>r.status==='fulfilled'?r.value:null);
    if(settled.some(r=>r.status==='rejected'))throw Error('일부 커버를 가져오지 못했어요. 해당 커버를 직접 업로드한 뒤 저장해 주세요.');
    await document.fonts.ready;
    const canvas=document.createElement('canvas');SleeveDesign.decorate(canvas,snapshot);SleeveDesign.drawImages(canvas,snapshot,images);
    const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));
    if(!blob)throw Error('이미지를 만들지 못했어요.');
    const url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download='sleeve-room-'+snapshot.design+'.png';link.click();
    setTimeout(()=>URL.revokeObjectURL(url),60000);toast('PNG를 저장했어요.');
  }catch(error){toast(error.message||'저장하지 못했어요. 다시 시도해 주세요.');}
  finally{images.forEach(image=>image?.close());button.disabled=false;button.textContent='↗ PNG 저장';}
};
function refreshDesign(){
  const m=SleeveDesign.layout(state),poster=$('poster'),grid=$('grid');
  grid.style.setProperty('--grid-n',state.n);
  SleeveDesign.decorate($('posterDecor'),state);
  $('posterDecor').setAttribute('aria-label',SleeveDesign.get(state.design).name+(state.design==='bare'?'':' · '+(state.title||'MY HEAVY ROTATION')));
  poster.dataset.design=m.id;poster.style.aspectRatio=m.width+'/'+m.height;
  grid.style.left=m.x/m.width*100+'%';grid.style.top=m.y/m.height*100+'%';
  grid.style.width=m.area/m.width*100+'%';grid.style.height=m.area/m.height*100+'%';grid.style.gap=m.gap/m.area*100+'%';
  $('gapValue').textContent=(m.id==='bare'?0:state.gap)+' px';
  for(const id of ['title','gap','labels'])$(id).disabled=m.id==='bare';
  document.querySelectorAll('[data-color]').forEach(button=>button.disabled=m.id==='bare');
  document.querySelectorAll('[data-design]').forEach(button=>{button.classList.toggle('active',button.dataset.design===m.id);button.setAttribute('aria-pressed',String(button.dataset.design===m.id));});
  const template=SleeveDesign.get(m.id),reference=$('designReference');reference.replaceChildren();
  const note=document.createElement('p');note.textContent=m.id==='bare'?'커버만 정사각형으로 저장해요. 제목·장식·바깥 여백·커버 간격은 모두 제외됩니다.':template.subtitle;reference.append(note);
  if(template.source){const link=document.createElement('a');link.href=template.source;link.target='_blank';link.rel='noopener noreferrer';link.textContent='레퍼런스 ↗ '+template.reference;reference.append(link);}
}
function setDesign(id){
  const template=SleeveDesign.get(id);if(state.design===template.id)return;
  state.design=template.id;state.gap=template.gap;state.color=template.color;
  $('gap').value=state.gap;update();
}
document.fonts.ready.then(()=>refreshDesign());

render();
window.sleeveRoom = { add, toast, move, setDesign, refreshDesign };

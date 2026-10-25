import {REGIONS,NATIONS,SCENARIOS,displayId} from './data.js';

// The reference board spans local coordinates ±8.3. TTS +X points left on
// the printed texture; SVG +Y agrees with the board's local +Z direction.
export const BOARD_SIZE=1800;
export const BOARD_HALF_EXTENT=8.3;
export const BOARD_ART='https://cdn.steamusercontent.com/ugc/1666856894575883627/D5EA1F53AE0778824FB9AD2FE5466EF2253047CE/';
export function projectPoint([x,z]){return[900-x*900/BOARD_HALF_EXTENT,900+z*900/BOARD_HALF_EXTENT];}
export function regionCenter(region){
 if(region.circle)return projectPoint(region.circle.c);
 let area=0,x=0,z=0;const ps=region.points;
 for(let i=0;i<ps.length;i++){const a=ps[i],b=ps[(i+1)%ps.length],cross=a[0]*b[1]-b[0]*a[1];area+=cross;x+=(a[0]+b[0])*cross;z+=(a[1]+b[1])*cross;}
 return projectPoint([x/(3*area),z/(3*area)]);
}
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function shape(r,attrs){
 if(r.circle){const[x,y]=projectPoint(r.circle.c);return`<circle ${attrs} cx="${x}" cy="${y}" r="${r.circle.r*900/BOARD_HALF_EXTENT}"/>`;}
 return`<polygon ${attrs} points="${r.points.map(p=>projectPoint(p).join(',')).join(' ')}"/>`;
}
export function renderWorldMap(state,{selected=null,hero=false}={}){
 const ids=Object.keys(REGIONS).sort((a,b)=>+REGIONS[b].sea-+REGIONS[a].sea||+!!REGIONS[a].circle-+!!REGIONS[b].circle);
 let shapes='',markers='',labels='';
 for(const id of ids){
  const r=REGIONS[id],active=!state||!!state.regions[id];
  if(!active){shapes+=shape(r,'class="region-unavailable" aria-hidden="true"');continue;}
  const owner=state?.regions[id]?.owner||r.original,changed=owner!==r.original&&!r.sea;
  const classes=['region-shape',id===selected?'selected':'',state?.hotspots?.[id]?'hot':'',changed?'changed-control':''].filter(Boolean).join(' ');
  shapes+=shape(r,`class="${classes}" style="--nation:${NATIONS[owner]?.color||'#aab1b8'}" ${hero?'aria-hidden="true"':`data-region="${id}" role="button" tabindex="0" aria-label="${displayId(id)} ${esc(r.name)}" aria-pressed="${id===selected}"`}`);
  if(!hero){
   const[cx,cy]=regionCenter(r),name=r.name.replace(/\b\w/g,c=>c.toUpperCase());
   labels+=`<g class="map-detail-label" data-detail-id="${id}" data-x="${cx}" data-y="${cy}" data-selected="${id===selected}" data-sea="${!!r.sea}" aria-hidden="true" style="display:none"><rect x="-62" y="-35" width="124" height="31" rx="5"/><text class="map-detail-code" x="0" y="-23">${displayId(id)}</text><text class="map-detail-name" x="0" y="-10" textLength="${Math.min(112,name.length*5.8)}" lengthAdjust="spacingAndGlyphs">${esc(name)}</text></g>`;
  }
  if(!state||hero)continue;
  const[x,y]=regionCenter(r),cs=state.commands.filter(c=>c.region===id&&c.units.length),nations=[...new Set(cs.map(c=>c.nation))];
  if(nations.length)markers+=`<g class="map-unit-stack" data-stack-x="${x}" data-stack-y="${y}" transform="translate(${x} ${y})">`;
  nations.forEach((n,i)=>{
   const count=cs.filter(c=>c.nation===n).reduce((v,c)=>v+c.units.length,0),xx=-nations.length*18+i*36,yy=14;
   markers+=`<g class="map-unit" style="--nation:${NATIONS[n].color}" transform="translate(${xx},${yy})"><rect width="32" height="24" rx="4"/><text x="16" y="17">${count}</text></g>`;
  });
  if(nations.length)markers+='</g>';
  if(changed)markers+=`<g class="map-control" transform="translate(${x-16},${y-34})"><rect width="32" height="20" rx="3" fill="${NATIONS[owner]?.color||'#aab1b8'}"/><text x="16" y="14">${esc(NATIONS[owner]?.prefix.toUpperCase()||'N')}</text></g>`;
  if(state.regions[id].bombs)markers+=`<text class="map-bomb" x="${x+24}" y="${y-15}">✹${state.regions[id].bombs}</text>`;
 }
 return`<svg class="world ${hero?'world-preview':''}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1800 1800" aria-label="War Room board map" ${hero?'role="img"':''}><g data-map-orientation><image href="${BOARD_ART}" x="0" y="0" width="1800" height="1800" preserveAspectRatio="xMidYMid meet" image-rendering="optimizeQuality" aria-hidden="true"/><g class="map-hit-layer">${shapes}</g><g class="map-markers" aria-hidden="true">${markers}</g><g class="map-detail-layer" aria-hidden="true">${labels}</g></g></svg>`;
}
const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));
export function constrainCamera(c,width,height){
 const size=Math.min(width,height),scale=clamp(c.scale||1,1,8),draw=size*scale;
 return{scale,x:draw<=width?(width-draw)/2:clamp(c.x,width-draw,0),y:draw<=height?(height-draw)/2:clamp(c.y,height-draw,0)};
}
export function zoomCamera(c,width,height,factor,anchor){
 const size=Math.min(width,height),scale=clamp(c.scale*factor,1,8),ratio=scale/c.scale;
 return constrainCamera({scale,x:anchor.x-(anchor.x-c.x)*ratio,y:anchor.y-(anchor.y-c.y)*ratio},width,height);
}
export function pinchCamera(start,width,height,current){
 const size=Math.min(width,height),scale=clamp(start.scale*current.distance/start.distance,1,8);
 return constrainCamera({scale,x:current.x-start.worldX*size*scale,y:current.y-start.worldY*size*scale},width,height);
}

// A single controller owns pointer, wheel, keyboard and resize handling. Camera
// snapshots use board coordinates so a selection/render or rotation of the phone
// doesn't discard the user's position.
export function layoutMapLabels(items,camera,width,height,rotation=0){
 if(camera.scale<1.8)return[];
 const pixels=Math.min(width,height)*camera.scale/BOARD_SIZE,rad=rotation*Math.PI/180,boxes=[],out=[];
 const sorted=[...items].sort((a,b)=>Number(b.selected)-Number(a.selected)||Number(a.sea)-Number(b.sea));
 for(const item of sorted){
  const x=900+(item.x-900)*Math.cos(rad)-(item.y-900)*Math.sin(rad),y=900+(item.x-900)*Math.sin(rad)+(item.y-900)*Math.cos(rad);
  const sx=camera.x+x*pixels,sy=camera.y+y*pixels,box={left:sx-66,right:sx+66,top:sy-39,bottom:sy};
  if(box.right<0||box.left>width||box.bottom<0||box.top>height)continue;
  if(!item.selected&&boxes.some(b=>box.left<b.right&&box.right>b.left&&box.top<b.bottom&&box.bottom>b.top))continue;
  boxes.push(box);out.push({...item,x:item.x,y:item.y,inverse:1/pixels});
 }
 return out;
}

export function mountMap(viewport,{snapshot=null,onSelect=()=>{},onChange=()=>{}}={}){
 const panel=viewport.closest('.map-panel'),stage=viewport.querySelector('.map-stage'),svg=viewport.querySelector('.world');
 const pointers=new Map(),abort=new AbortController(),signal=abort.signal;
 let width=0,height=0,base=0,camera={scale:1,x:0,y:0},rotation=snapshot?.rotation||0,expanded=!!snapshot?.expanded,lastTap=snapshot?.lastTap||null;
 let drag=null,pinch=null,hadMultiple=false,moved=false,previousOverflow=null,detailLabels=snapshot?.detailLabels!==false;
 const labelNodes=[...svg.querySelectorAll('[data-detail-id]')],labelItems=labelNodes.map(el=>({id:el.dataset.detailId,x:+el.dataset.x,y:+el.dataset.y,selected:el.dataset.selected==='true',sea:el.dataset.sea==='true'}));
 const status=panel?.querySelector('[data-map-zoom]'),selection=panel?.querySelector('[data-map-selection]');
 function local(e){const r=viewport.getBoundingClientRect();return{x:e.clientX-r.left,y:e.clientY-r.top};}
 function save(){return{scale:camera.scale,centerX:base?(width/2-camera.x)/(base*camera.scale):.5,centerY:base?(height/2-camera.y)/(base*camera.scale):.5,rotation,expanded,lastTap,detailLabels};}
 function paint(){
  // Lay out the SVG at its real zoomed size. CSS scale would magnify a
  // composited screen-size bitmap and blur even vector text on many devices.
  const draw=base*camera.scale;
  stage.style.width=draw+'px';stage.style.height=draw+'px';stage.style.transform=`translate(${camera.x}px,${camera.y}px)`;
  const visible=new Map((detailLabels?layoutMapLabels(labelItems,camera,width,height,rotation):[]).map(i=>[i.id,i]));
  for(const el of labelNodes){const item=visible.get(el.dataset.detailId);el.style.display=item?'':'none';if(item)el.setAttribute('transform',`translate(${item.x} ${item.y}) rotate(${-rotation}) scale(${item.inverse})`);}
  const detailControl=panel?.querySelector('[data-map-control="labels"]');if(detailControl){detailControl.setAttribute('aria-pressed',String(detailLabels));detailControl.textContent=detailLabels?'Labels on':'Labels off';}
  viewport.dataset.renderPixels=Math.round(draw*(window.devicePixelRatio||1));
  for(const el of svg.querySelectorAll('.map-unit-stack'))el.setAttribute('transform',`translate(${el.dataset.stackX} ${el.dataset.stackY}) rotate(${-rotation}) scale(${Math.min(1,BOARD_SIZE/draw*.9)})`);
  svg.querySelector('[data-map-orientation]')?.setAttribute('transform',`rotate(${rotation} 900 900)`);
  viewport.dataset.scale=camera.scale.toFixed(3);viewport.dataset.panX=camera.x.toFixed(2);viewport.dataset.panY=camera.y.toFixed(2);viewport.dataset.rotation=rotation;
  if(status){status.textContent=Math.round(camera.scale*100)+'%';status.setAttribute('aria-label',`Fit whole map (currently ${Math.round(camera.scale*100)} percent)`);}
  if(panel){const out=panel.querySelector('[data-map-status]');if(out)out.textContent=`${Math.round(camera.scale*100)}% zoom${rotation?' · '+rotation+'° rotation':''}`;}
  onChange(save());
 }
 function measure(initial=null){
  const old=initial||save(),r=viewport.getBoundingClientRect();width=r.width;height=r.height;base=Math.min(width,height);if(!base)return;
  camera=constrainCamera({scale:old.scale||1,x:width/2-(old.centerX??.5)*base*(old.scale||1),y:height/2-(old.centerY??.5)*base*(old.scale||1)},width,height);paint();
 }
 function zoomBy(factor,point={x:width/2,y:height/2}){camera=zoomCamera(camera,width,height,factor,point);paint();}
 function fit(){camera=constrainCamera({scale:1,x:0,y:0},width,height);paint();}
 function focusRegion(id){
  if(!REGIONS[id])return;const r=REGIONS[id],[cx,cy]=regionCenter(r),rad=rotation*Math.PI/180;
  const px=900+(cx-900)*Math.cos(rad)-(cy-900)*Math.sin(rad),py=900+(cx-900)*Math.sin(rad)+(cy-900)*Math.cos(rad);
  const points=r.circle?[[cx-r.circle.r*900/8.3,cy],[cx+r.circle.r*900/8.3,cy]]:r.points.map(projectPoint);
  const span=Math.max(Math.max(...points.map(p=>p[0]))-Math.min(...points.map(p=>p[0])),Math.max(...points.map(p=>p[1]))-Math.min(...points.map(p=>p[1])),80);
  const scale=clamp(BOARD_SIZE/(span*2),2,8);
  camera=constrainCamera({scale,x:width/2-px/BOARD_SIZE*base*scale,y:height/2-py/BOARD_SIZE*base*scale},width,height);paint();
 }
 function rotate(degrees){rotation=(rotation+degrees+360)%360;paint();}
 function setExpanded(value){
  expanded=!!value;panel?.classList.toggle('is-expanded',expanded);
  if(expanded){previousOverflow??=document.body.style.overflow;document.body.style.overflow='hidden';}
  else if(previousOverflow!==null){document.body.style.overflow=previousOverflow;previousOverflow=null;}
  const control=panel?.querySelector('[data-map-control="expand"]');if(control){control.setAttribute('aria-expanded',String(expanded));control.setAttribute('aria-label',expanded?'Close full screen map':'Open full screen map');control.textContent=expanded?'Close map':'Full screen';}
  measure();
 }
 function startGesture(){
  if(pointers.size>=2){
   const[a,b]=[...pointers.values()],x=(a.x+b.x)/2,y=(a.y+b.y)/2;
   pinch={distance:Math.max(1,Math.hypot(a.x-b.x,a.y-b.y)),x,y,worldX:(x-camera.x)/(base*camera.scale),worldY:(y-camera.y)/(base*camera.scale),scale:camera.scale};
   hadMultiple=true;drag=null;
  }else if(pointers.size===1){const p=[...pointers.values()][0];drag={x:p.x,y:p.y,originX:camera.x,originY:camera.y};pinch=null;}
 }
 viewport.addEventListener('pointerdown',e=>{
  if(e.pointerType==='mouse'&&e.button!==0)return;e.preventDefault();
  if(pointers.size===0){moved=false;hadMultiple=false;viewport.classList.add('is-dragging');}
  pointers.set(e.pointerId,{...local(e),startX:e.clientX,startY:e.clientY,region:e.target.closest('[data-region]')?.dataset.region||null});
  try{viewport.setPointerCapture(e.pointerId);}catch{}
  startGesture();
 },{signal});
 viewport.addEventListener('pointermove',e=>{
  const p=pointers.get(e.pointerId);if(!p)return;e.preventDefault();Object.assign(p,local(e));
  if(Math.hypot(e.clientX-p.startX,e.clientY-p.startY)>7)moved=true;
  if(pointers.size>=2&&pinch){const[a,b]=[...pointers.values()];camera=pinchCamera(pinch,width,height,{distance:Math.max(1,Math.hypot(a.x-b.x,a.y-b.y)),x:(a.x+b.x)/2,y:(a.y+b.y)/2});paint();}
  else if(drag){camera=constrainCamera({scale:camera.scale,x:drag.originX+p.x-drag.x,y:drag.originY+p.y-drag.y},width,height);paint();}
 },{signal});
 function release(e,canceled=false){
  const p=pointers.get(e.pointerId);if(!p)return;
  const tap=!canceled&&pointers.size===1&&!hadMultiple&&!moved,point=local(e);pointers.delete(e.pointerId);
  try{viewport.releasePointerCapture(e.pointerId);}catch{}
  if(!pointers.size){viewport.classList.remove('is-dragging');drag=null;pinch=null;}else startGesture();
  if(tap){
   const now=Date.now();
   if(lastTap&&now-lastTap.time<340&&Math.hypot(point.x-lastTap.x,point.y-lastTap.y)<30){lastTap=null;zoomBy(camera.scale<2?2.5/camera.scale:1/camera.scale,point);}
   else{lastTap={time:now,x:point.x,y:point.y};const under=document.elementFromPoint(e.clientX,e.clientY)?.closest('[data-region]'),id=under?.dataset.region||p.region;onChange(save());if(id)onSelect(id);}
  }
 }
 viewport.addEventListener('pointerup',e=>release(e),{signal});
 viewport.addEventListener('pointercancel',e=>release(e,true),{signal});
 viewport.addEventListener('lostpointercapture',e=>{if(pointers.has(e.pointerId))release(e,true);},{signal});
 // Pointer taps are handled above; prevent the subsequent click from selecting
 // a region a second time or selecting one after a drag/pinch.
 viewport.addEventListener('click',e=>{if(e.detail!==0){e.preventDefault();e.stopImmediatePropagation();}}, {capture:true,signal});
 viewport.addEventListener('wheel',e=>{e.preventDefault();zoomBy(Math.exp(-clamp(e.deltaY,-150,150)*.004),local(e));},{passive:false,signal});
 viewport.addEventListener('keydown',e=>{
  if(e.key==='+'||e.key==='='){e.preventDefault();zoomBy(1.4);}else if(e.key==='-'){e.preventDefault();zoomBy(1/1.4);}else if(e.key==='Home'||e.key==='0'){e.preventDefault();fit();}
  else if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)){e.preventDefault();const dx=e.key==='ArrowLeft'?60:e.key==='ArrowRight'?-60:0,dy=e.key==='ArrowUp'?60:e.key==='ArrowDown'?-60:0;camera=constrainCamera({...camera,x:camera.x+dx,y:camera.y+dy},width,height);paint();}
 },{signal});
 document.addEventListener('keydown',e=>{if(e.key==='Escape'&&expanded&&!document.querySelector('dialog[open]'))setExpanded(false);},{signal});
 panel?.addEventListener('click',e=>{
  const el=e.target.closest('[data-map-control]');if(!el)return;e.preventDefault();
  if(el.dataset.mapControl==='labels'){detailLabels=!detailLabels;paint();}
  if(el.dataset.mapControl==='in')zoomBy(1.5);if(el.dataset.mapControl==='out')zoomBy(1/1.5);if(el.dataset.mapControl==='fit')fit();
  if(el.dataset.mapControl==='left')rotate(-90);if(el.dataset.mapControl==='right')rotate(90);if(el.dataset.mapControl==='expand')setExpanded(!expanded);
 },{signal});
 const observer=new ResizeObserver(()=>measure());observer.observe(viewport);
 if(expanded)setExpanded(true);measure(snapshot||{scale:1,centerX:.5,centerY:.5});
 return{zoomBy,fit,focusRegion,rotate,setExpanded,snapshot:save,destroy(){const saved=save();abort.abort();observer.disconnect();if(previousOverflow!==null)document.body.style.overflow=previousOverflow;return saved;}};
}

import test from 'node:test';
import assert from 'node:assert/strict';
import {REGIONS} from '../data.js';
import {createGame} from '../engine.js';
import {projectPoint,regionCenter,renderWorldMap,constrainCamera,zoomCamera,pinchCamera} from '../map.js';

test('board projection agrees with printed island positions and is not mirrored',()=>{
 const azores=projectPoint(REGIONS.b2.circle.c),maldives=projectPoint(REGIONS.b20.circle.c),hawaii=projectPoint(REGIONS.u6.circle.c);
 // Reference locations read from the printed 2952px square, normalized to 1800.
 assert(Math.abs(azores[0]-131)<5&&Math.abs(azores[1]-871)<5);
 assert(Math.abs(maldives[0]-1097)<5&&Math.abs(maldives[1]-1531)<5);
 assert(hawaii[0]>900&&hawaii[1]<300);
 assert(regionCenter(REGIONS.b1)[0]<900,'Britain is on the left of the printed board');
 assert(regionCenter(REGIONS.j1)[0]>900,'Japan is on the right of the printed board');
});
test('whole-board camera fits 320px phones, tablets, desktop and portrait full screen',()=>{
 for(const[w,h]of[[290,290],[345,345],[720,720],[1100,600],[372,511]]){
  const c=constrainCamera({scale:1,x:-100,y:-100},w,h),size=Math.min(w,h);
  assert(c.x>=0&&c.y>=0);assert(c.x+size<=w&&c.y+size<=h);
  assert.equal(c.scale,1);
 }
});
test('pinch keeps the board point under the midpoint fixed, including translated fingers',()=>{
 const w=390,h=600,c=constrainCamera({scale:1,x:0,y:0},w,h),size=390;
 const start={scale:c.scale,distance:80,worldX:(195-c.x)/size,worldY:(300-c.y)/size};
 const pinch=pinchCamera(start,w,h,{distance:160,x:220,y:310});
 assert.equal(pinch.scale,2);assert.equal(pinch.x+start.worldX*size*pinch.scale,220);assert.equal(pinch.y+start.worldY*size*pinch.scale,310);
});
test('cursor-centered zoom and camera bounds prevent losing the board',()=>{
 const c=constrainCamera({scale:2,x:-195,y:-195},390,390),anchor={x:150,y:170};
 const before=[(anchor.x-c.x)/(390*c.scale),(anchor.y-c.y)/(390*c.scale)],next=zoomCamera(c,390,390,1.5,anchor);
 assert.equal(next.scale,3);assert(Math.abs((anchor.x-next.x)/(390*next.scale)-before[0])<1e-10);assert(Math.abs((anchor.y-next.y)/(390*next.scale)-before[1])<1e-10);
 assert.deepEqual(constrainCamera({scale:999,x:-999999,y:999999},390,390),{scale:8,x:390-3120,y:0});
 assert.deepEqual(zoomCamera(next,390,390,.00001,anchor),{scale:1,x:0,y:0});
});
test('map displays reference board with live overlays and only scenario regions selectable',()=>{
 const s=createGame({scenario:'eastern',seed:12}),map=renderWorldMap(s,{selected:'g1'});
 assert(map.includes('D5EA1F53AE0778824FB9AD2FE5466EF2253047CE'));assert(!map.includes('pattern id="grid"'));
 assert.equal((map.match(/data-region=/g)||[]).length,Object.keys(s.regions).length);
 assert(map.includes('region-unavailable'));assert(map.includes('aria-pressed="true"'));assert(!map.includes('style="width:100%'));
});

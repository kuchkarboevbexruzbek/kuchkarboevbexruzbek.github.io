// The same centreline drives the deck, wheel collisions, map and lap timing.
const HALF = 100, RADIUS = 29, STRAIGHT = HALF - RADIUS;
const WIDTH = 11, HALF_WIDTH = WIDTH / 2, MAP_SIZE = 224;
const CORNER = Math.PI * RADIUS / 2;
export const LAP = 8 * STRAIGHT + 4 * CORNER;
const wrap = (s, length) => (s % length + length) % length;
const ramps = [
  { side: -1, x: -9, shoreX: 0, shoreZ: -79 },
  { side: 1, x: 13, shoreX: 5, shoreZ: 73 }
];

export function onCircuit(distance) {
  let s = wrap(distance + STRAIGHT, LAP);
  const quarter = 2 * STRAIGHT + CORNER;
  const turn = Math.min(3, Math.floor(s / quarter));
  s -= turn * quarter;
  const arc = Math.max(0, s - 2 * STRAIGHT) / RADIUS;
  let x = s <= 2 * STRAIGHT ? -STRAIGHT + s : STRAIGHT + RADIUS * Math.sin(arc);
  let z = s <= 2 * STRAIGHT ? -HALF : -STRAIGHT - RADIUS * Math.cos(arc);
  let tx = Math.cos(arc), tz = Math.sin(arc);
  for (let i = 0; i < turn; i++) {
    [x,z] = [-z,x]; [tx,tz] = [-tz,tx];
  }
  return { x, z, tx, tz };
}

const stations = 400, spacing = LAP / stations;
const ring = Array.from({length: stations + 1}, (_,i) => onCircuit(i * spacing));
function offset(p, side, y) { return [p.x - p.tz * side, y, p.z + p.tx * side]; }

export function locate(position) {
  let distance2 = Infinity, s = 0;
  for (let i=0; i<stations; i++) {
    const a=ring[i], b=ring[i+1], dx=b.x-a.x, dz=b.z-a.z;
    const t=Math.max(0, Math.min(1, ((position.x-a.x)*dx+(position.z-a.z)*dz)/(dx*dx+dz*dz)));
    const d=(position.x-a.x-t*dx)**2+(position.z-a.z-t*dz)**2;
    if(d<distance2){ distance2=d; s=(i+t)*spacing; }
  }
  return { s:wrap(s,LAP), offset:Math.sqrt(distance2) };
}

function woodTexture(T) {
  const canvas=document.createElement('canvas'); canvas.width=512; canvas.height=256;
  const ctx=canvas.getContext('2d');
  let seed=761;
  function random(){ seed=(Math.imul(seed,1664525)+1013904223)>>>0; return seed/4294967296; }
  for(let row=0; row<8; row++){
    const y=row*32, joint=80+Math.floor(random()*350);
    for(const [start,end] of [[0,joint],[joint,512]]){
      ctx.fillStyle=['#ae703e','#c28750','#c99059','#bc814a','#b77a45'][Math.floor(random()*5)];
      ctx.fillRect(start,y,end-start,32);
      ctx.save(); ctx.beginPath(); ctx.rect(start,y,end-start,31); ctx.clip();
      for(let i=0;i<15;i++){
        const x=start+random()*(end-start), gy=y+3+random()*25;
        ctx.strokeStyle=i%3?'rgba(83,44,24,.19)':'rgba(255,217,151,.28)';
        ctx.lineWidth=.6+random(); ctx.beginPath(); ctx.moveTo(x,gy);
        ctx.bezierCurveTo(x+15,gy-3,x+35,gy+2,x+12+random()*80,gy); ctx.stroke();
      }
      ctx.restore(); ctx.fillStyle='#75482c'; ctx.fillRect(start,y,1.5,32);
      for(const x of [start+5,end-5]) { ctx.fillStyle='#634933'; ctx.fillRect(x,y+7,2,2); ctx.fillRect(x,y+23,2,2); }
    }
    ctx.fillStyle='#785032'; ctx.fillRect(0,y,512,2);
    ctx.fillStyle='#deb585'; ctx.fillRect(0,y+2,512,1);
  }
  const texture=new T.CanvasTexture(canvas); texture.wrapT=T.repeat;
  texture.colorSpace=T.srgb; texture.anisotropy=4; return texture;
}

// Batch the entire boardwalk into a handful of meshes, including the lamps and railings.
function batch(T, material) {
  const vertices=[], colors=[], uvs=[], indices=[];
  const palette=new Map();
  function quad(a,b,c,d, tint='#ffffff', start=0, end=1) {
    if(!palette.has(tint)) palette.set(tint,new T.Color(tint));
    const col=palette.get(tint), i=vertices.length/3;
    vertices.push(...a,...b,...c,...d);
    for(let j=0;j<4;j++) colors.push(col.r,col.g,col.b);
    uvs.push(0,start,1,start,1,end,0,end);
    indices.push(i,i+1,i+2,i,i+2,i+3);
  }
  function box(p, width, height, length, y, tint) {
    function face(d,h) {
      const at={...p,x:p.x+p.tx*d,z:p.z+p.tz*d};
      return [offset(at,-width/2,h),offset(at,width/2,h)];
    }
    const [a,b]=face(-length/2,y),[c,d]=face(length/2,y);
    const [aa,bb]=face(-length/2,y+height),[cc,dd]=face(length/2,y+height);
    quad(aa,bb,dd,cc,tint); quad(b,a,c,d,tint); quad(a,aa,cc,c,tint);
    quad(bb,b,d,dd,tint); quad(a,b,bb,aa,tint); quad(cc,dd,d,c,tint);
  }
  function finish(name,group) {
    const geo=new T.Geometry();
    geo.setAttribute('position',new T.Attribute(vertices,3));
    geo.setAttribute('color',new T.Attribute(colors,3));
    geo.setAttribute('uv',new T.Attribute(uvs,2));
    geo.setIndex(indices); geo.computeVertexNormals(); geo.computeBoundingSphere();
    const mesh=new T.Mesh(geo,material); mesh.name=name; mesh.receiveShadow=true; group.add(mesh);
  }
  return {quad,box,finish};
}

function rampPoint(ramp,t) {
  const smooth=t*t*(3-2*t);
  const z0=ramp.side*(HALF-HALF_WIDTH);
  const dx=(ramp.shoreX-ramp.x)*6*t*(1-t), dz=ramp.shoreZ-z0, len=Math.hypot(dx,dz);
  return {x:ramp.x+(ramp.shoreX-ramp.x)*smooth, z:z0+dz*t, tx:dx/len,tz:dz/len};
}
function buildCourse(game,T) {
  const deckY=game.water.surfaceElevation+1;
  const group=new T.Group(); group.name='Bandargoh'; game.scene.add(group);
  const planks=batch(T,new T.Lit({map:woodTexture(T),roughness:.91,vertexColors:true,side:T.doubleSide}));
  const timber=batch(T,new T.Lit({vertexColors:true,roughness:.85,emissive:0x26170f,side:T.doubleSide}));
  const accents=batch(T,new T.Basic({vertexColors:true,side:T.doubleSide}));
  const meshVertices=[],meshIndices=[];
  function collision(a,b,c,d) {
    const i=meshVertices.length/3;
    meshVertices.push(...a,...b,...c,...d); meshIndices.push(i,i+1,i+2,i,i+2,i+3);
  }
  function floor(a,b,w,ya,yb,start,end) {
    const l=offset(a,-w/2,ya),r=offset(a,w/2,ya),rr=offset(b,w/2,yb),ll=offset(b,-w/2,yb);
    planks.quad(l,r,rr,ll,'#ffffff',start,end); collision(l,r,rr,ll);
    for(const [u,v] of [[l,ll],[rr,r]]) timber.quad(u,v,[v[0],v[1]-.33,v[2]],[u[0],u[1]-.33,u[2]],'#68432c');
  }
  function rail(a,b,side,yA,yB,i,edge=HALF_WIDTH) {
    const rim=side*edge, inside=side*(edge-.32);
    const at=offset(a,rim,yA+.18),bt=offset(b,rim,yB+.18);
    timber.quad(offset(a,inside,yA+.18),at,bt,offset(b,inside,yB+.18),i%4<2?'#e7d6b7':'#ad4a35');
    for(const h of [.37,.85]) {
      const as=offset(a,rim,yA+h),bs=offset(b,rim,yB+h);
      timber.quad(as,bs,offset(b,rim,yB+h+.13),offset(a,rim,yA+h+.13),h>.5?'#e1aa68':'#825431');
      timber.quad(offset(a,rim,yA+h+.13),offset(b,rim,yB+h+.13),offset(b,rim-side*.15,yB+h+.13),offset(a,rim-side*.15,yA+h+.13),'#b98048');
    }
    // Upright inner face for the chassis; deck remains flat right to the curb.
    collision(offset(a,rim,yA-.20),offset(a,rim,yA+1),offset(b,rim,yB+1),offset(b,rim,yB-.20));
    if(i%3===0) {
      const [x,,z]=at, p={...a,x,z};
      timber.box(p,.28,2.95,.31,yA-1.85,'#815030');
      timber.box(p,.38,.12,.41,yA+1.03,'#694227');
      if(i%9===0) {
        timber.box(p,.32,.12,.34,yA+1.15,'#4a4940');
        accents.box(p,.24,.30,.26,yA+1.27,'#ffe09a');
        timber.box(p,.37,.10,.39,yA+1.57,'#4a4940');
      }
    }
  }
  const gates=ramps.map(r=>({min:Infinity,max:-Infinity,z:r.side*(HALF-HALF_WIDTH)}));
  for(let i=0;i<stations;i++){
    const a=ring[i],b=ring[i+1];floor(a,b,WIDTH,deckY,deckY,i*spacing/4,(i+1)*spacing/4);
    rail(a,b,-1,deckY,deckY,i);
    const j=ramps.findIndex(r=>Math.abs(a.z-r.side*HALF)<.001 && Math.abs((a.x+b.x)/2-r.x)<5.4);
    if(j<0)rail(a,b,1,deckY,deckY,i);
    else {gates[j].min=Math.min(gates[j].min,a.x,b.x);gates[j].max=Math.max(gates[j].max,a.x,b.x);}
    // Direction markers sit by the outer curb on each approach to a bend.
    if(i%6===0 && Math.abs(a.tx*a.tz)>.05) {
      const mark={...a,x:a.x+a.tz*(HALF_WIDTH-1.2),z:a.z-a.tx*(HALF_WIDTH-1.2)};
      const tip={...mark,x:mark.x+mark.tx*.66,z:mark.z+mark.tz*.66};
      for(const side of [-1,1]) {
        const tail={...mark,x:mark.x-mark.tx*.26,z:mark.z-mark.tz*.26};
        accents.quad(offset(tail,side*.67,deckY+.018),offset(tail,side*.45,deckY+.018),
          offset(tip,-side*.08,deckY+.018),offset(tip,side*.16,deckY+.018),'#ffe5a2');
      }
    }
    if(i%8===0) {
      // Brass dots mark the driving direction without painting over the timber.
      for(const side of [-1,1]) {
        const [x,,z]=offset(a,side*(HALF_WIDTH-.6),deckY);
        accents.box({...a,x,z},.12,.015,.72,deckY+.015,'#ffe2a0');
      }
    }
  }
  for(const [j,r] of ramps.entries()){
    const gap=gates[j];
    // Align the ramp flush with the actual opening (the ring is sampled).
    r.x=(gap.min+gap.max)/2;
    const width=gap.max-gap.min;
    for(let i=0;i<20;i++){
      const t=i/20, u=(i+1)/20,a=rampPoint(r,t),b=rampPoint(r,u);
      const y=deckY*(1-t), yy=deckY*(1-u);
      floor(a,b,width,y,yy,t*5,u*5);
      for(const side of [-1,1]) rail(a,b,side,y,yy,i,width/2);
    }
  }
  // Chequered timing line and a clear span above the vehicle.
  const start=ring[0];
  for(let col=0;col<16;col++)for(let row=0;row<2;row++){
    const [x,,z]=offset(start,-HALF_WIDTH+(col+.5)*WIDTH/16,deckY);
    accents.box({...start,x:x+(row-.5)*.45,z},WIDTH/16,.016,.45,deckY+.025,(col+row)%2?'#263237':'#fff0ce');
  }
  for(const side of [-1,1]){
    const [x,,z]=offset(start,side*(HALF_WIDTH+.21),deckY);
    timber.box({...start,x,z},.48,5.2,.5,deckY,'#664839');
    accents.box({...start,x,z},.52,.18,.54,deckY+4.6,'#ffda81');
  }
  const gantry=new T.Mesh(new T.Box(WIDTH+1,.66,.55),
    new T.Glass({color:0xc8cbd8,roughness:.38,metalness:0,transmission:.78,thickness:.28,ior:1.35}));
  gantry.position.set(start.x,deckY+5.30,start.z);gantry.rotation.y=Math.PI/2;group.add(gantry);
  // Both faces of the timing gantry remain legible on approach.
  const sign=document.createElement('canvas');sign.width=640;sign.height=80;
  const ink=sign.getContext('2d');ink.clearRect(0,0,640,80);
  ink.fillStyle='#ffffff';ink.shadowColor='#141520';ink.shadowBlur=3;ink.textAlign='center';ink.textBaseline='middle';ink.font='bold 48px sans-serif';
  ink.fillText('BANDARGOH',320,41);
  const signTexture=new T.CanvasTexture(sign);signTexture.colorSpace=T.srgb;
  const lettering=new T.Basic({map:signTexture,transparent:true,depthWrite:false});
  for(const side of [-1,1]) {
    const plate=new T.Mesh(new T.Plane(4.8,.60),lettering);
    plate.position.set(start.x+side*.284,deckY+5.30,start.z);
    plate.rotation.y=side*Math.PI/2;group.add(plate);
  }
  for(let i=-5;i<=5;i++){
    if(Math.abs(i)<3)continue;
    const [x,,z]=offset(start,i*.9,deckY);
    accents.box({...start,x,z},.50,.11,.57,deckY+5.2,'#ffe3a1');
  }
  planks.finish('Taxta qoplama',group); timber.finish('Panjara va qoziqlar',group); accents.finish('Chiroqlar va start',group);
  const physics=game.physics.world,R=game.RAPIER,mask=game.physics.categories.floor;
  const body=physics.createRigidBody(R.RigidBodyDesc.fixed());
  const collider=R.ColliderDesc.trimesh(Float32Array.from(meshVertices),Uint32Array.from(meshIndices));
  physics.createCollider(collider.setFriction(.9).setRestitution(0).setCollisionGroups(mask),body);
  const gatesPhysical=gates.map(gap=>{
    const gate=R.ColliderDesc.cuboid((gap.max-gap.min)/2+.2,2.5,.3)
      .setTranslation((gap.min+gap.max)/2,deckY+2,gap.z).setCollisionGroups(mask);
    const wall=physics.createCollider(gate,body);wall.setEnabled(false);return wall;
  });
  return {deckY, group, gates:gatesPhysical};
}

const bestKey='island.boardwalk.lap.v1';
function formatTime(ms) {
  const hundredths=Math.floor(ms/10);
  return Math.floor(hundredths/6000)+':'+String(Math.floor(hundredths/100)%60).padStart(2,'0')+'.'+String(hundredths%100).padStart(2,'0');
}
function drawMap(game, visit) {
  const canvas=document.querySelector('#harbour-map');
  const ctx=canvas.getContext('2d'); const size=canvas.width;
  ctx.scale(size/MAP_SIZE,size/MAP_SIZE);ctx.translate(MAP_SIZE/2,MAP_SIZE/2);
  function line(points,width,color){
    ctx.beginPath(); points.forEach((p,i)=>i?ctx.lineTo(p.x,p.z):ctx.moveTo(p.x,p.z));
    ctx.strokeStyle=color;ctx.lineWidth=width;ctx.lineJoin='round';ctx.stroke();
  }
  const routes=[ring,...ramps.map(r=>Array.from({length:21},(_,i)=>rampPoint(r,i/20)))];
  for(const path of routes){line(path,WIDTH+.8,'#664730');line(path,WIDTH-.4,'#c38b53')}
  ctx.setLineDash([.23,1.35]);
  for(const path of routes)line(path,WIDTH-.6,'#af7745');
  ctx.setLineDash([]);
  for(const side of [-1,1]){
    let points=[];
    function flush(){
      if(points.length>1){line(points,.75,'#f5d3a1');ctx.setLineDash([2,2]);line(points,.75,'#b95037');ctx.setLineDash([]);}
      points=[];
    }
    for(const p of ring){
      if(side===1 && ramps.some(r=>Math.abs(p.z-r.side*HALF)<.01 && Math.abs(p.x-r.x)<5.3)){flush();continue;}
      points.push({x:p.x-p.tz*side*(HALF_WIDTH-.35),z:p.z+p.tx*side*(HALF_WIDTH-.35)});
    }
    flush();
  }
  for(let i=0;i<ring.length;i+=9){
    const p=ring[i];ctx.fillStyle='#ffda82';
    for(const side of [-1,1]){const [x,,z]=offset(p,side*HALF_WIDTH,0);ctx.beginPath();ctx.arc(x,z,.63,0,2*Math.PI);ctx.fill()}
  }
  const marker=document.querySelector('#harbour-map-start');
  const point=game.map.worldToMap(startPosition());
  marker.style.left=point.x*100+'%';marker.style.top=point.y*100+'%';
  marker.addEventListener('click',visit);
}
function startPosition(){return {x:0,z:-HALF};}

export function setupBoardwalk(game,T) {
  const course=buildCourse(game,T);
  const panel=document.querySelector('.harbour-race'), label=panel.querySelector('strong');
  const clock=panel.querySelector('output'), detail=panel.querySelector('small'), action=panel.querySelector('button');
  const start=startPosition(), sounds=game.world.areas.circuit.sounds;
  let phase='idle',previous=0,progress=0,nextGate=1,epoch=0,previousPosition=null,best=0,finish=0,signal=0;
  try {best=Number(localStorage.getItem(bestKey))||0;}catch{}
  const underway=()=>phase==='countdown'||phase==='running';
  const canPlay=()=>game.reveal.step===2 && game.player.state===1 && !document.hidden &&
    game.menu.state===game.menu.constructor.CLOSED && game.modals.state===game.modals.constructor.CLOSED &&
    game.world.areas.circuit.state===game.world.areas.circuit.constructor.STATE_PENDING;
  function show(el,value){if(el.textContent!==value)el.textContent=value;}
  function visit(){
    if(underway() || game.world.areas.circuit.state!==game.world.areas.circuit.constructor.STATE_PENDING)return;
    game.menu.close();game.modals.close();
    game.physicalVehicle.moveTo({x:start.x,y:course.deckY+1.1,z:start.z},0);
    game.physicalVehicle.chassis.physical.body.wakeUp();
    game.view.focusPoint.isTracking=true;
  }
  function end(completed) {
    for(const gate of course.gates)gate.setEnabled(false);
    phase=completed?'finished':'idle';
    if(completed) {
      finish=performance.now()-epoch;sounds.finish.play();
      if(!best||finish<best){best=finish;try{localStorage.setItem(bestKey,String(best))}catch{}}
    }
  }
  function begin() {
    if(!canPlay())return;
    visit();phase='countdown';epoch=performance.now();signal=0;
    for(const gate of course.gates)gate.setEnabled(true);
    previous=0;progress=0;nextGate=1;previousPosition=null;game.player.boostLatched=false;
  }
  action.addEventListener('click',()=>underway()?end(false):begin());
  document.querySelector('#harbour-visit').addEventListener('click',visit);
  drawMap(game,visit);
  // Before vehicle physics: a held pedal cannot launch the car during the countdown.
  game.ticker.events.on('tick',()=>{if(phase==='countdown'){
    game.player.accelerating=0;game.player.steering=0;game.player.boosting=0;game.player.braking=1;
  }},1);
  document.addEventListener('visibilitychange',()=>{if(document.hidden&&underway())end(false)});
  game.ticker.events.on('tick',()=>{
    const pos=game.physicalVehicle.position, now=performance.now(), playable=canPlay();
    if(underway()&&!playable)end(false);
    const near=Math.hypot(pos.x-start.x,pos.z-start.z)<14&&Math.abs(pos.y-course.deckY)<4;
    panel.hidden=!playable||(!underway()&&!near);
    if(panel.hidden){if(phase==='finished')phase='idle';return;}
    if(phase==='countdown'){
      const count=Math.ceil((3000-(now-epoch))/1000);
      if(count<=0){phase='running';epoch=now;sounds.countdown2.play()}
      else{if(signal!==count){signal=count;sounds.countdown1.play()}show(clock,String(count));}
    }
    if(phase==='running'){
      const at=locate(pos);
      const jump=previousPosition&&Math.hypot(pos.x-previousPosition.x,pos.z-previousPosition.z)>12;
      if(jump||at.offset>HALF_WIDTH+1.8||Math.abs(pos.y-course.deckY)>4){end(false);return;}
      const delta=wrap(at.s-previous+LAP/2,LAP)-LAP/2;
      progress+=delta; previous=at.s; previousPosition={x:pos.x,z:pos.z};
      if(nextGate<4&&progress>=nextGate*LAP/4){sounds.checkpoint.play(nextGate);nextGate++;}
      if(nextGate===4&&progress>=LAP-.05)end(true);
      else {show(clock,formatTime(now-epoch));show(detail,progress < -3?'Teskari yo‘nalish':Math.min(99,Math.floor(Math.max(0,progress)/LAP*100))+'% · 1 aylana');}
    }
    if(phase==='idle'||phase==='finished'){
      show(label,phase==='finished'?'Marra!':'Bandargoh halqasi');
      show(clock,phase==='finished'?formatTime(finish):'Vaqtli poyga');
      show(detail,best?'Rekord '+formatTime(best):'1 aylana · '+Math.round(LAP)+' m');
      show(action,phase==='finished'?'Qayta poyga':'Poygani boshlash');
    }else{
      show(label,'Bandargoh halqasi');show(action,'Bekor qilish');
      if(phase==='countdown')show(detail,'Startga tayyorlaning');
    }
  },11);
}

(()=>{
'use strict';
/* ================= 方块星球 · 关卡编辑器 =================
   数据结构与 game.js 的 DAYS 数组一一对应，导出可直接贴回。
   编辑器独立于游戏本体运行，修改自动保存到 localStorage。 */

const W=11,H=9;
const LAYER_Z={surface:0,dirt:1,cliff:2,cave:-2};
const LAYER_NAME={surface:'地表',dirt:'土块',cliff:'高台',cave:'矿洞'};
const ACTOR_NAME={farmer:'农民村民',trapped_farmer:'被困村民',sheep:'绵羊',chest:'补给箱',creeper:'苦力怕',creeper_static:'苦力怕（不动）',zombie_static:'僵尸（不动）'};
const NODE_NAME={wood:'木材',stone:'石材',ore:'蓝晶矿',gem:'宝石',fire_ore:'火晶矿',berry:'果子',iron:'铁块'};
const FACILITY_NAME={water_source:'水源（可盛水）',goal:'终点',lava:'岩浆'};
const STORAGE_KEY='blockPlanetEditor.v3';

const $=id=>document.getElementById(id);
const canvas=$('edCanvas'),ctx=canvas.getContext('2d');
window._edBooted=true;  // 标记：主 <script src> 已成功执行，editor.html 的 XHR fallback 可跳过
const key=(x,y)=>x+','+y, inb=(x,y)=>x>=0&&y>=0&&x<W&&y<H;

/* ---------- 内置模板（与 game.js DAYS 完全一致，使用导出 JSON 同构格式） ---------- */
const RIVER_COL5=Array.from({length:H},(_,y)=>[5,y]);
const TEMPLATES=[
  {name:'初访',duration:150,stamina:15,mission:'',tip:'在有限体力范围内，收集稀有资源吧',
   spawn:[2,4],terrain:{cliff:[[1,0],[2,0],[3,0],[4,0],[5,0],[6,0],[7,0],[8,0],[0,1],[1,1],[0,2],[1,2],[0,3],[0,4],[0,5],[0,6],[0,7]],dirt:[[0,0],[9,0],[10,0],[2,1],[3,1],[5,1],[6,1],[7,1],[8,1],[9,1],[10,1],[2,2],[3,2],[5,2],[1,3],[2,3],[3,3],[5,3],[9,3],[1,4],[9,4],[1,5],[9,5],[1,6],[9,6],[1,7],[4,7],[9,7],[0,8],[1,8],[9,8],[10,8]],cave:[]},
   water:[[4,1],[4,2],[4,3],[4,4],[5,4],[6,4],[6,5],[6,6],[6,7],[6,8]],rocks:[],
   ladder:null,hole:null,goal:[10,7],
   nodes:[['stone',7,3,0],['stone',0,5,0],['stone',0,6,0],['berry',10,5,0],['wood',2,8,0],['wood',3,4,0],['stone',5,8,0],['iron',6,2,0],['berry',10,3,0],['wood',7,8,0],['wood',7,6,0],['wood',7,4,0],['wood',7,5,0],['gem',10,6,0],['gem',10,2,0],['gem',10,0,0],['gem',10,4,0],['wood',8,8,0],['stone',7,2,0],['iron',6,3,0]],
   actors:[],crops:[],lava:[],waterSource:[],rockSoil:[[1,8],[10,8],[9,8],[9,7],[9,6],[9,5],[9,4],[9,3],[1,7],[1,6],[1,5],[1,4],[3,3],[2,3]]},
  {name:'村民',duration:200,stamina:14,mission:'救出被困村民，和他聊聊吧',tip:'',
   spawn:[9,1],terrain:{cliff:[[0,0],[1,0],[2,0],[3,0],[4,0],[5,0],[6,0],[7,0],[0,1],[1,1],[3,1],[4,1],[0,2],[1,2],[3,2],[4,2],[0,3],[1,3],[0,4],[1,4],[3,4],[4,4],[0,5],[0,6],[0,7],[0,8],[1,8]],dirt:[[8,0],[9,0],[10,0],[2,1],[5,1],[6,1],[7,1],[8,1],[8,2],[8,3],[8,4],[9,5],[4,6],[5,6],[8,6],[5,7],[9,7],[5,8],[8,8]],cave:[]},
   water:[],rocks:[],
   ladder:null,hole:null,goal:[3,8],
   nodes:[['berry',2,7,0],['fire_ore',1,7,0],['fire_ore',2,8,0],['stone',8,7,0],['stone',8,5,0],['iron',7,6,0],['iron',7,7,0],['iron',7,8,0],['iron',7,5,0],['iron',7,4,0],['iron',6,8,0],['iron',6,7,0],['iron',6,6,0],['iron',6,5,0],['iron',6,4,0],['iron',6,3,0],['iron',7,3,0],['iron',6,2,0],['iron',7,2,0],['berry',1,6,0],['wood',9,8,0],['wood',9,6,0],['wood',9,4,0]],
   actors:[['trapped_farmer',1,5,0]],crops:[],lava:[[3,7],[2,4],[2,3],[2,5],[2,6],[3,6],[2,2],[4,7],[4,8]],waterSource:[[4,3,0],[3,3,0]],rockSoil:[[8,6],[8,4],[8,3],[8,2],[8,1],[8,8]]},
  {name:'探险',duration:180,stamina:12,mission:'前往矿洞，探索真相吧',tip:'',
   spawn:[1,1],terrain:{cliff:[],dirt:[[0,0],[1,0],[2,0],[3,0],[4,0],[5,0],[6,0],[7,0],[8,0],[9,0],[10,0],[0,1],[2,1],[6,1],[10,1],[0,2],[2,2],[6,2],[8,2],[10,2],[0,3],[2,3],[3,3],[4,3],[8,3],[10,3],[0,4],[6,4],[7,4],[8,4],[10,4],[0,5],[1,5],[2,5],[3,5],[6,5],[0,6],[3,6],[6,6],[0,7],[3,7],[6,7],[0,8],[1,8],[2,8],[3,8],[4,8],[5,8],[6,8]],cave:[[7,5],[8,5],[9,5],[10,5],[7,6],[8,6],[9,6],[10,6],[7,7],[8,7],[9,7],[10,7],[7,8],[8,8],[9,8],[10,8]]},
   water:[],rocks:[],
   ladder:null,hole:[9,5],goal:[8,8],
   nodes:[['berry',1,2,0],['berry',1,3,0],['berry',1,4,0],['gem',4,2,0],['wood',1,7,0],['wood',2,7,0],['stone',1,6,0],['stone',2,6,0],['iron',4,6,0],['iron',4,5,0],['berry',3,1,0],['iron',2,5,-2],['iron',4,1,0]],
   actors:[['zombie_static',8,6,-2]],crops:[],lava:[],waterSource:[],rockSoil:[]},
  {name:'重建',duration:240,stamina:99,mission:'帮助村民重建家园吧',tip:'',
   spawn:[4,6],terrain:{cliff:[],dirt:[[2,1],[3,1],[2,2],[3,2],[7,2],[8,2],[7,3],[8,3]],cave:[]},
   water:[],rocks:[],
   ladder:null,hole:null,goal:[6,6],
   nodes:[['wood',0,2,0],['wood',2,4,0],['wood',10,2,0],['wood',9,5,0],['wood',1,1,2],['stone',2,7,0],['stone',9,7,0]],
   actors:[['farmer',5,4,0],['sheep',2,6,0],['creeper',9,3,0]],crops:[[4,4],[6,4],[4,5],[6,5]],lava:[],waterSource:[],rockSoil:[]}
];
/* ================= 状态 ================= */
let store={levels:[],current:0};
let level=null;                       // 当前编辑中的关卡（store.levels[store.current] 的引用）
let tool='select',activeLayer='surface';
let hover=null,selection=null,drag=null,painting=false;
let undoStack=[],redoStack=[];
let play=null;                        // 试玩状态（null = 编辑模式）
let uid=1;

/* ================= 交互音效（Web Audio 合成） ================= */
let audioCtx=null,soundOn=true;
function ac(){if(!soundOn)return null;try{if(!audioCtx)audioCtx=new (window.AudioContext||window.webkitAudioContext)();if(audioCtx.state==='suspended')audioCtx.resume();return audioCtx}catch(e){return null}}
function tone(freq,dur,type,gain,slide){const a=ac();if(!a)return;const t=a.currentTime,o=a.createOscillator(),g=a.createGain();o.type=type||'square';o.frequency.setValueAtTime(freq,t);if(slide)o.frequency.exponentialRampToValueAtTime(Math.max(60,freq+slide),t+dur);g.gain.setValueAtTime(gain||.07,t);g.gain.exponentialRampToValueAtTime(.0001,t+dur);o.connect(g);g.connect(a.destination);o.start(t);o.stop(t+dur+.03)}
const SFX={
  chop(){tone(190,.13,'square',.07,-70)},
  mine(){tone(860,.09,'triangle',.07)},
  gem(){tone(1046,.09,'triangle',.07);setTimeout(()=>tone(1318,.12,'triangle',.07),80)},
  berry(){tone(680,.11,'sine',.09)},
  step(){tone(320,.045,'sine',.03)},
  fail(){tone(150,.18,'sawtooth',.06,-50)},
  noStamina(){tone(210,.22,'sawtooth',.07,-90)},
  build(){tone(250,.14,'square',.06,90)},
  hit(){tone(120,.2,'sawtooth',.08,-60)},
  craft(){tone(420,.1,'triangle',.06);setTimeout(()=>tone(630,.12,'triangle',.06),90)},
  pick(){tone(560,.06,'sine',.05)},
  win(){[523,659,784,1046].forEach((f,i)=>setTimeout(()=>tone(f,.16,'triangle',.07),i*95))}
};

/* ================= 序列化 ================= */
function blankLevel(){
  return{id:uid++,name:'新关卡',duration:150,stamina:12,mission:'在此填写任务目标…',tip:'在此填写玩法提示…',
    spawn:[1,4],terrain:new Array(W*H).fill(0),water:new Array(W*H).fill(false),
    rocks:[],nodes:[],actors:[],crops:[],ladder:null,hole:null,goal:null,lava:[],waterSource:[],rockSoil:[]};
}
function toInternal(t){ // 模板/JSON -> 内部结构
  const l=blankLevel();
  l.name=t.name;l.duration=t.duration;l.stamina=Math.max(1,Math.min(99,Math.round(Number(t.stamina)||12)));l.mission=t.mission;l.tip=t.tip;
  l.spawn=(t.spawn&&inb(t.spawn[0],t.spawn[1]))?[t.spawn[0],t.spawn[1]]:[1,4];
  const tObj=t.terrain||{};
  const cliff=(Array.isArray(tObj)?tObj:tObj.cliff)||[],cave=(Array.isArray(tObj)?[]:tObj.cave)||[],dirtArr=(!Array.isArray(tObj)&&tObj.dirt)||[];
  const grid=new Array(W*H).fill(0);
  for(const [x,y] of cliff)if(inb(x,y))grid[y*W+x]=2;
  for(const [x,y] of dirtArr)if(inb(x,y))grid[y*W+x]=1;
  for(const [x,y] of cave)if(inb(x,y))grid[y*W+x]=-2;
  l.terrain=grid;
  l.water=new Array(W*H).fill(false);
  for(const [x,y] of t.water||[])if(inb(x,y))l.water[y*W+x]=true;
  l.rocks=(t.rocks||[]).filter(p=>inb(p[0],p[1])).map(p=>({x:p[0],y:p[1],z:p[2]||0}));
  l.nodes=(t.nodes||[]).filter(p=>inb(p[1],p[2])).map(p=>({type:p[0],x:p[1],y:p[2],z:p[3]||0}));
  l.actors=(t.actors||[]).filter(p=>inb(p[1],p[2])).map(p=>({type:p[0],x:p[1],y:p[2],z:p[3]||0}));
  l.crops=(t.crops||[]).filter(p=>inb(p[0],p[1])).map(p=>({x:p[0],y:p[1],z:p[2]||0}));
  l.ladder=t.ladder&&inb(t.ladder[0],t.ladder[1])?{x:t.ladder[0],y:t.ladder[1]}:null;
  l.hole=t.hole&&inb(t.hole[0],t.hole[1])?{x:t.hole[0],y:t.hole[1]}:null;
  l.goal=t.goal&&inb(t.goal[0],t.goal[1])?{x:t.goal[0],y:t.goal[1]}:null;
  l.lava=(t.lava||[]).filter(p=>inb(p[0],p[1])).map(p=>({x:p[0],y:p[1]}));
  l.waterSource=(t.waterSource||[]).filter(p=>inb(p[0],p[1])).map(p=>({x:p[0],y:p[1],z:p[2]||0}));
  l.rockSoil=(t.rockSoil||[]).filter(p=>inb(p[0],p[1])).map(p=>({x:p[0],y:p[1]}));
  return l;
}
function serializeLevel(l){ // 内部结构 -> 可导入/可读 JSON 结构
  const cliff=[],dirt=[],cave=[],water=[],rocks=[],nodes=[],actors=[],crops=[],lava=[],waterSource=[],rockSoil=[];
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){
    const t=l.terrain[y*W+x];
    if(t===2)cliff.push([x,y]); else if(t===1)dirt.push([x,y]); else if(t===-2)cave.push([x,y]);
    if(l.water[y*W+x]&&t===0)water.push([x,y]);
  }
  for(const r of l.rocks)rocks.push([r.x,r.y,r.z]);
  for(const n of l.nodes)nodes.push([n.type,n.x,n.y,n.z]);
  for(const a of l.actors)actors.push([a.type,a.x,a.y,a.z]);
  for(const c of l.crops)crops.push([c.x,c.y,c.z||0]);
  for(const v of l.lava||[])lava.push([v.x,v.y]);
  for(const w of l.waterSource||[])waterSource.push([w.x,w.y,w.z||0]);
  for(const v of l.rockSoil||[])rockSoil.push([v.x,v.y]);
  return{format:'blockplanet-level',version:2,name:l.name,duration:l.duration,stamina:l.stamina,mission:l.mission,tip:l.tip,
    spawn:[l.spawn[0],l.spawn[1]],terrain:{cliff,dirt,cave},water,rocks,
    ladder:l.ladder?[l.ladder.x,l.ladder.y]:null,hole:l.hole?[l.hole.x,l.hole.y]:null,
    goal:l.goal?[l.goal.x,l.goal.y]:null,nodes,actors,crops,lava,waterSource,rockSoil};
}
function daysSnippet(l){ // 生成可贴回 game.js DAYS 数组的对象字面量
  const s=serializeLevel(l);
  const waterCols=[...new Set(s.water.map(p=>p[0]))];
  const waterOk=waterCols.length===0||waterCols.length===1&&waterCols[0]===5;
  const q=str=>`'${String(str).replace(/\\/g,'\\\\').replace(/'/g,"\\'")}'`;
  const arr=a=>a.length?`[${a.map(p=>`[${p.join(',')}]`).join(',')}]`:`[]`;
  return`{\n  name:${q(s.name)},duration:${s.duration},stamina:${s.stamina},mission:${q(s.mission)},tip:${q(s.tip)},`+
    `water:${waterOk&&waterCols.length>0},waterCols:${arr(waterCols)},`+
    `cliff:${arr(s.terrain.cliff)},dirt:${arr(s.terrain.dirt||[])},`+
    `ladder:${s.ladder?`[${s.ladder.join(',')}]`:'null'},`+
    `hole:${s.hole?`[${s.hole.join(',')}]`:'null'},cave:${arr(s.terrain.cave)},rocks:${arr(s.rocks.map(p=>[p[0],p[1]]))},`+
    `goal:${s.goal?`[${s.goal.join(',')}]`:'null'},nodes:${arr(s.nodes)},`+
    `actors:${arr(s.actors)},crops:${arr(s.crops)},`+
    `lava:${arr(s.lava||[])},waterSource:${arr(s.waterSource||[])},`+
    `rockSoil:${arr(s.rockSoil||[])}\n}`;
}
function daysArraySnippet(levels){ // 一次生成完整 DAYS 数组字面量（4 关整体导出）
  if(!levels.length)return 'const DAYS=[];';
  return 'const DAYS=[\n'+
    levels.map(l=>daysSnippet(l).split('\n').map(line=>'  '+line).join('\n')).join(',\n')+
    '\n];';
}

/* ---------- localStorage ---------- */
function save(){
  try{
    const editorData={levels:store.levels.map(serializeLevel),current:store.current};
    localStorage.setItem(STORAGE_KEY,JSON.stringify(editorData));
    // 手动导出模式：不再写 'blockPlanetGameDays'（game.js 已取消自动读取编辑器数据）
    // Manual export mode: game.js no longer auto-loads editor data.
  }catch{}  // file:// 沙箱下抛错则静默忽略，纯内存模式
}
function load(){
  let ok=false;
  try{
    const raw=localStorage.getItem(STORAGE_KEY);
    if(raw){
      const d=JSON.parse(raw);
      if(d&&Array.isArray(d.levels)&&d.levels.length){
        const internal=d.levels.map(toInternal);
        // 至少要 1 关有合法 name 才算有效；否则视为脏数据，重置
        if(internal.some(l=>l&&typeof l.name==='string'&&l.name&&l.name!=='新关卡')){
          store.levels=internal;
          store.current=Math.min(Math.max(0,d.current||0),d.levels.length-1);
          ok=true;
          console.info('[editor] 加载本地关卡',internal.length,'关');
        }else{
          console.warn('[editor] localStorage 脏数据，自动重置为 4 关模板');
        }
      }
    }
  }catch(e){console.warn('[editor] 读 localStorage 失败，使用模板',e)}
  if(!ok){
    // 第一次进入 / 脏数据 / 抛错：初始化为 4 关模板 + 立即同步到 localStorage
    try{
      store.levels=TEMPLATES.map(toInternal);
      store.current=0;
      save();
      console.info('[editor] 初始化为 4 关模板（同步到 game.js）');
    }catch(e){
      console.error('[editor] TEMPLATES 初始化失败，用 4 个空关卡兜底',e);
      store.levels=[blankLevel(),blankLevel(),blankLevel(),blankLevel()];
      store.current=0;
    }
  }
}

/* ---------- 撤销 / 重做 ---------- */
function pushUndo(){
  undoStack.push(JSON.stringify(serializeLevel(level)));
  if(undoStack.length>80)undoStack.shift();
  redoStack.length=0;refreshUndoBtns();save();
}
function doUndo(){if(!undoStack.length||play)return;
  redoStack.push(JSON.stringify(serializeLevel(level)));
  applySnapshot(undoStack.pop());save();refreshAll();}
function doRedo(){if(!redoStack.length||play)return;
  undoStack.push(JSON.stringify(serializeLevel(level)));
  applySnapshot(redoStack.pop());save();refreshAll();}
function applySnapshot(s){const l=toInternal(JSON.parse(s));l.id=level.id;store.levels[store.current]=l;level=l;selection=null}
function refreshUndoBtns(){$('undoBtn').disabled=!undoStack.length;$('redoBtn').disabled=!redoStack.length}

/* ================= 关卡查询 ================= */
const terrainZ=(l,x,y)=>{if(!l||!l.terrain)return 0;const t=l.terrain[y*W+x];return typeof t==='number'?t:0};
const isWaterAt=(l,x,y)=>l.water[y*W+x]&&terrainZ(l,x,y)===0;
const isRockSoilAt=(l,x,y)=>(l.rockSoil||[]).some(v=>v.x===x&&v.y===y); // ★ 岩土块（不可挖掘）
const rockAt=(l,x,y,z)=>l.rocks.find(r=>r.x===x&&r.y===y&&r.z===z);
const nodeAt=(l,x,y,z)=>l.nodes.find(n=>n.x===x&&n.y===y&&n.z===z);
const actorAt=(l,x,y,z)=>l.actors.find(a=>a.x===x&&a.y===y&&a.z===z);
const cropAt=(l,x,y)=>l.crops.find(c=>c.x===x&&c.y===y);
function occupiedAt(l,x,y,z){ // 该格该层是否被对象占用（不含地形）
  return nodeAt(l,x,y,z)||rockAt(l,x,y,z)||actorAt(l,x,y,z)||cropAt(l,x,y)||
    (l.ladder&&l.ladder.x===x&&l.ladder.y===y)||(l.hole&&l.hole.x===x&&l.hole.y===y);
}
function tileInfo(l,x,y){
  const z=terrainZ(l,x,y),parts=[];
  parts.push(z===2?'高台':z===1?'土块':z===-2?'矿洞':'草地');
  if(isRockSoilAt(l,x,y))parts.push('\u5CA9\u571F\u5757\uFF08\u4E0D\u53EF\u6316\uFF09');
  if(isWaterAt(l,x,y))parts.push('水面');
  if(rockAt(l,x,y,z))parts.push('岩壁');
  const n=nodeAt(l,x,y,z);if(n)parts.push(NODE_NAME[n.type]);
  const a=actorAt(l,x,y,z);if(a)parts.push(ACTOR_NAME[a.type]);
  if(cropAt(l,x,y))parts.push('麦田');
  if(l.ladder&&l.ladder.x===x&&l.ladder.y===y)parts.push('木梯');
  if(l.hole&&l.hole.x===x&&l.hole.y===y)parts.push('矿洞口');
  if(l.spawn[0]===x&&l.spawn[1]===y)parts.push('降落点');
  if(l.goal&&l.goal.x===x&&l.goal.y===y)parts.push('终点');
  return parts.join(' · ');
}

/* ================= 校验 ================= */
function validate(l){
  const out=[];
  const [sx,sy]=l.spawn;
  const spawnOk=inb(sx,sy)&&l.terrain[sy*W+sx]===0&&!isWaterAt(l,sx,sy)&&!occupiedAt(l,sx,sy,0);
  if(!spawnOk)out.push({level:'error',msg:`降落点 (${sx},${sy}) 不可用：需为无占用的草地面`});
  // 终点
  if(!l.goal)out.push({level:'error',msg:'缺少终点：用「终点」工具放置，玩家到达即通关'});
  else{
    const gz=terrainZ(l,l.goal.x,l.goal.y);
    if(isWaterAt(l,l.goal.x,l.goal.y))out.push({level:'info',msg:`终点 (${l.goal.x},${l.goal.y}) 在水面（试玩可走到；实际玩法仍按"水面需搭桥"规则）`});
    else if(occupiedAt(l,l.goal.x,l.goal.y,gz))out.push({level:'error',msg:`终点 (${l.goal.x},${l.goal.y}) 所在格被资源/岩壁/NPC 占用，玩家无法走上终点`});
    if(sx===l.goal.x&&sy===l.goal.y)out.push({level:'warn',msg:'终点与降落点重合：玩家落地即通关'});
  }
  const oreCount=l.nodes.filter(n=>n.type==='ore').length;
  if(!oreCount)out.push({level:'warn',msg:'本关没有蓝晶矿（不影响通关，可作为收集目标）'});
  // 节点每格唯一（game.js 的 nodes 以格子为键，同格多层会覆盖）
  const nodeCells=new Map();
  for(const n of l.nodes){const k=key(n.x,n.y);nodeCells.set(k,(nodeCells.get(k)||0)+1)}
  for(const [k,c] of nodeCells)if(c>1)out.push({level:'error',msg:`格子 (${k}) 有 ${c} 个资源节点，游戏中会互相覆盖，请移到不同格子`});
  const rockCells=new Map();
  for(const r of l.rocks){const k=key(r.x,r.y);rockCells.set(k,(rockCells.get(k)||0)+1)}
  for(const [k,c] of rockCells)if(c>1)out.push({level:'warn',msg:`格子 (${k}) 有 ${c} 个岩壁，只保留一个`});
  // 梯子 / 洞口位置类型
  if(l.ladder&&l.terrain[l.ladder.y*W+l.ladder.x]!==2)out.push({level:'warn',msg:'木梯未放在高台格上（游戏内梯子位于高台）'});
  if(l.hole&&l.terrain[l.hole.y*W+l.hole.x]!==-2)out.push({level:'warn',msg:'矿洞口未放在矿洞格上（游戏内洞口位于矿洞层）'});
  // ★ 岩土块：必须位于土块高度（terrain=1），且不可被铲/镐破坏
  for(const v of l.rockSoil||[]){
    if(terrainZ(l,v.x,v.y)!==1)out.push({level:'warn',msg:`\u5CA9\u571F\u5757 (${v.x},${v.y}) \u7684\u5730\u5F62\u9AD8\u5EA6\u4E0D\u662F\u571F\u5757\u5C42\uFF0C\u6E38\u620F\u4E2D\u4F1A\u770B\u4E0D\u5230`});
  }
  // NPC 与资源同格同层
  for(const a of l.actors)if(nodeAt(l,a.x,a.y,a.z)||rockAt(l,a.x,a.y,a.z)||cropAt(l,a.x,a.y))
    out.push({level:'error',msg:`${ACTOR_NAME[a.type]} (${a.x},${a.y}) 与资源/岩壁重叠，无法站立`});
  for(const n of l.nodes)if(n.z!==terrainZ(l,n.x,n.y))out.push({level:'warn',msg:`${NODE_NAME[n.type]} (${n.x},${n.y}) 的层(${n.z})与地形不符，采集时会看不到`});
  for(const a of l.actors)if(a.z!==terrainZ(l,a.x,a.y))out.push({level:'warn',msg:`${ACTOR_NAME[a.type]} (${a.x},${a.y}) 的层(${a.z})与地形不符`});
  // 资源感知可达性：模拟玩家“采集 → 转换 → 放置”全过程
  const sim=simulate(l);
  // ★ 需求：取消「终点不可达」对试玩的阻断（降级为提示，仍保留信息）
  if(l.goal&&!sim.goalReach)out.push({level:'warn',msg:'\u7EC8\u70B9\u4E0D\u53EF\u8FBE\uFF1A\u5373\u4F7F\u91C7\u96C6\u6CBF\u9014\u8D44\u6E90\u5E76\u8F6C\u6362\u4E5F\u65E0\u6CD5\u5230\u8FBE\uFF08\u4EC5\u63D0\u793A\uFF0C\u4E0D\u963B\u6B62\u8BD5\u73A9\uFF09'});
  if(oreCount&&sim.ore===0)out.push({level:'warn',msg:'所有蓝晶矿均不可达（不影响通关判定）'});
  else if(oreCount&&sim.ore<oreCount)out.push({level:'info',msg:`${oreCount-sim.ore} 个蓝晶矿不可达`});
  if(sim.notes.bridged)out.push({level:'info',msg:`通关模拟：需搭桥 ${sim.notes.bridged} 格水面（木材 ×${sim.notes.bridged*2}）`});
  if(sim.notes.climbed)out.push({level:'info',msg:`通关模拟：需垫放 ${sim.notes.climbed} 处土块攀上高差（每处土块 ×1，可挖取）`});
  if(sim.notes.ladder)out.push({level:'info',msg:'通关模拟：需先建梯子（木材或石材 ×2）'});
  if(sim.notes.hole)out.push({level:'info',msg:'通关模拟：需合成石镐（木材 ×1 + 石材 ×2）并挖开洞口'});
  if(sim.goalReach){
    if(l.stamina<sim.staminaMin)out.push({level:'warn',msg:`体力不足：通关约需 ${sim.staminaMin} 点交互体力，当前仅 ${l.stamina} 点`});
    else out.push({level:'info',msg:`体力预算：通关约需 ${sim.staminaMin} 点交互体力，当前 ${l.stamina} 点（余量 ${l.stamina-sim.staminaMin}）`});
  }
  if(!out.some(v=>v.level==='error'))out.unshift({level:'ok',msg:'校验通过，关卡可以试玩'});
  return out;
}
function simulate(l){ // 资源感知可达性：BFS + 资源收支迭代至不动点
  const DIRS=[[1,0],[0,1],[-1,0],[0,-1]];
  let wood=0,stone=0,dirt=0,pick=false,ladderBuilt=false,holeOpen=false;
  const seen=new Set([key(l.spawn[0],l.spawn[1])]);
  const bridged=new Set(),climbed=new Set(),dug=new Set(),broken=new Set(),harvested=new Set();
  const stand=(x,y)=>{ // 该格（按基础地形）是否可站
    const z=terrainZ(l,x,y);
    // ★ 改动 1：editor 试玩模拟忽略水面阻挡（玩家可走到水面格）
    //   玩法逻辑保持：试玩中"水面需搭桥"规则由 pStand / placeAt 单独处理
    // ★ 与 canStand / pStand 保持一致：土块(z=1)/高台(z=2) 表面不可行走（梯子/洞口格除外）
    if(z>=1&&!(l.ladder&&l.ladder.x===x&&l.ladder.y===y)&&!(l.hole&&l.hole.x===x&&l.hole.y===y))return false;
    if(rockAt(l,x,y,z)&&!broken.has(key(x,y)+','+z))return false;
    if(nodeAt(l,x,y,z)||actorAt(l,x,y,z)||cropAt(l,x,y))return false;
    return true;
  };
  for(let round=0;round<60;round++){
    let progress=false;
    // 1. 以当前资源扩展可站区域
    const queue=[...seen].map(k=>k.split(',').map(Number));
    for(let i=0;i<queue.length;i++){
      const [x,y]=queue[i],z=terrainZ(l,x,y);
      for(const [dx,dy] of DIRS){
        const nx=x+dx,ny=y+dy;if(!inb(nx,ny))continue;
        const nk=key(nx,ny);if(seen.has(nk))continue;
        const nz=terrainZ(l,nx,ny);
        if(rockAt(l,nx,ny,nz)&&!broken.has(nk+','+nz)){
          if(pick){broken.add(nk+','+nz);stone++;progress=true} // 凿开，下一轮可站上
          continue; // 无镐则被岩壁挡住
        }
        if(nz===0&&isWaterAt(l,nx,ny)){ // ★ 改动 1：editor 试玩模拟忽略水面阻挡，玩家可走到水面格（实际玩法仍按"水面需搭桥"）
          seen.add(nk);queue.push([nx,ny]);progress=true;
          continue;
        }
        const diff=nz-z;
        if(Math.abs(diff)<=1&&stand(nx,ny)){seen.add(nk);queue.push([nx,ny]);progress=true}
        else if(diff===2&&z>=0&&dirt>=1&&stand(nx,ny)){ // 高差 2：垫 1 块土块形成台阶
          dirt--;climbed.add(nk);seen.add(nk);queue.push([nx,ny]);progress=true;
        }
      }
      // 梯子（一次性，木材或石材 ×2）
      if(l.ladder&&terrainZ(l,l.ladder.x,l.ladder.y)===2&&z===0&&
         Math.abs(x-l.ladder.x)+Math.abs(y-l.ladder.y)===1){
        const lk=key(l.ladder.x,l.ladder.y);
        if(!seen.has(lk)&&(ladderBuilt||wood>=2||stone>=2)&&stand(l.ladder.x,l.ladder.y)){
          if(!ladderBuilt){if(wood>=2)wood-=2;else stone-=2;ladderBuilt=true}
          seen.add(lk);queue.push([l.ladder.x,l.ladder.y]);progress=true;
        }
      }
      // 洞口（需石镐）
      if(l.hole&&z===0&&Math.abs(x-l.hole.x)+Math.abs(y-l.hole.y)===1){
        const hk=key(l.hole.x,l.hole.y);
        if(!seen.has(hk)&&pick&&stand(l.hole.x,l.hole.y)){holeOpen=true;seen.add(hk);queue.push([l.hole.x,l.hole.y]);progress=true}
      }
    }
    // 2. 从已站区域采集 / 挖取 / 凿岩
    for(const k of [...seen]){
      const [x,y]=k.split(',').map(Number),z=terrainZ(l,x,y);
      for(const [dx,dy] of DIRS){
        const nx=x+dx,ny=y+dy;if(!inb(nx,ny))continue;
        const nz=terrainZ(l,nx,ny),nk=key(nx,ny);
        const n=nodeAt(l,nx,ny,nz);
        if(n&&n.z===z&&!harvested.has(n)){harvested.add(n);if(n.type==='wood')wood++;else if(n.type==='stone')stone++;progress=true}
        const r=rockAt(l,nx,ny,nz);
        if(r&&r.z===z&&pick&&!broken.has(nk+','+nz)){broken.add(nk+','+nz);stone++;progress=true}
        if(nz===1&&!dug.has(nk)&&!isRockSoilAt(l,nx,ny)&&!nodeAt(l,nx,ny,1)&&!rockAt(l,nx,ny,1)&&!actorAt(l,nx,ny,1)&&!cropAt(l,nx,ny)){
          dug.add(nk);dirt++;progress=true; // 挖土块（可带走垫脚）；★ 岩土块不可挖
        }
      }
    }
    // 3. 合成石镐
    if(!pick&&wood>=1&&stone>=2){wood--;stone-=2;pick=true;progress=true}
    if(!progress)break;
  }
  // 终点：玩家需能站上终点格
  const goalReach=!!l.goal&&seen.has(key(l.goal.x,l.goal.y));
  // 蓝晶矿：相邻同层即可采集
  const ores=new Set();
  for(const k of seen){
    const [x,y]=k.split(',').map(Number),z=terrainZ(l,x,y);
    for(const [dx,dy] of DIRS){
      const nx=x+dx,ny=y+dy;if(!inb(nx,ny))continue;
      const n=nodeAt(l,nx,ny,terrainZ(l,nx,ny));
      if(n&&n.type==='ore'&&n.z===z)ores.add(key(nx,ny));
    }
  }
  // 体力下限估算：搭桥(建+2木采集)×3、垫土(挖+放)×2、梯子(建+登+2材料)×4、矿洞(镐+材料+挖+下)×6
  const staminaMin=bridged.size*3+climbed.size*2+(ladderBuilt?4:0)+((holeOpen&&!!l.hole)?6:0);
  return{goalReach,ore:ores.size,staminaMin,notes:{bridged:bridged.size,climbed:climbed.size,ladder:ladderBuilt,hole:holeOpen&&!!l.hole}};
}

/* ================= 渲染（复刻 game.js 等距管线） ================= */
function shade(hex,f){const v=hex.slice(1).match(/../g).map(s=>Math.min(255,Math.round(parseInt(s,16)*f)));return '#'+v.map(x=>x.toString(16).padStart(2,'0')).join('')}
function poly(pts,color,stroke){ctx.beginPath();ctx.moveTo(...pts[0]);for(let i=1;i<pts.length;i++)ctx.lineTo(...pts[i]);ctx.closePath();ctx.fillStyle=color;ctx.fill();if(stroke){ctx.lineWidth=1;ctx.strokeStyle=stroke;ctx.stroke()}}
/* ★ 方形（等距投影的方格）：以 (cx,cy) 为中心、k 为缩放比（1=满格）的菱形四角 */
function polyDia(g,cx,cy,k){const w=g.tw*.5*(k===undefined?1:k),h=g.th*.5*(k===undefined?1:k);return[[cx-w,cy],[cx,cy-h],[cx+w,cy],[cx,cy+h]]}
function geo(){const w=canvas.clientWidth,h=canvas.clientHeight,available=Math.max(220,h-140),tw=Math.min(w/12,available/7.2,86),th=tw*.49;
  return{tw,th,ox:w*.46,oy:70+Math.max(0,(available-((W+H)*th*.5+tw*.8))/2)+tw*.5,zStep:tw*.52}}
function pos(x,y,z,g){return{x:g.ox+(x-y)*g.tw*.5,y:g.oy+(x+y)*g.th*.5-z*g.zStep}}
function voxel(x,y,z,g,top){const p=pos(x,y,z,g),a=g.tw*.5,b=g.th*.5,d=g.zStep;
  poly([[p.x-a,p.y],[p.x,p.y-b],[p.x+a,p.y],[p.x,p.y+b]],top,'#ffffff39');
  poly([[p.x-a,p.y],[p.x,p.y+b],[p.x,p.y+b+d],[p.x-a,p.y+d]],shade(top,.72));
  poly([[p.x+a,p.y],[p.x,p.y+b],[p.x,p.y+b+d],[p.x+a,p.y+d]],shade(top,.58));}
function glyph(text,x,y,z,g,size=22,color='#fff'){const p=pos(x,y,z,g);ctx.textAlign='center';ctx.textBaseline='middle';
  ctx.font=`900 ${Math.max(15,Math.min(size,g.tw*.4))}px system-ui`;ctx.fillStyle=color;ctx.shadowColor='#153f46';ctx.shadowBlur=5;
  ctx.fillText(text,p.x,p.y-g.tw*.27);ctx.shadowBlur=0}
function drawTree(x,y,z,g){ // 木材节点：树干木纹 + 分层树冠（★ 改动 4：降低树高 — 总高从 ~0.84s 降到 ~0.5s）
  const s=g.tw,p=pos(x,y,z,g);
  ctx.fillStyle='#16483945';ctx.beginPath();ctx.ellipse(p.x,p.y+2,s*.22,s*.09,0,0,Math.PI*2);ctx.fill(); // 落影
  // 树干（棕色 + 纵向木纹）
  ctx.fillStyle='#7c5433';ctx.fillRect(p.x-s*.05,p.y-s*.26,s*.1,s*.28);
  ctx.strokeStyle='#5e3f22';ctx.lineWidth=1;
  for(const o of [-.028,-.004,.022]){
    ctx.beginPath();ctx.moveTo(p.x+s*o,p.y-s*.25);ctx.lineTo(p.x+s*o,p.y+s*.01);ctx.stroke();
  }
  ctx.strokeStyle='#8f6a41';ctx.beginPath();ctx.moveTo(p.x-s*.05,p.y-s*.15);ctx.lineTo(p.x+s*.05,p.y-s*.15);ctx.stroke(); // 横向节疤
  // 树冠（两层绿色球簇）
  ctx.fillStyle='#4f8f45';ctx.beginPath();ctx.arc(p.x,p.y-s*.38,s*.16,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#66ab58';
  ctx.beginPath();ctx.arc(p.x-s*.07,p.y-s*.44,s*.09,0,Math.PI*2);ctx.fill();
  ctx.beginPath();ctx.arc(p.x+s*.07,p.y-s*.43,s*.09,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#7fc168';ctx.beginPath();ctx.arc(p.x+s*.01,p.y-s*.49,s*.06,0,Math.PI*2);ctx.fill();
}
/* ★ 碎石堆（多边形棱角石块）：石材/铁矿/各色晶矿共用同一形状，仅配色不同 */
const PILE_PAL={
  stone:{a:'#8f9a94',b:'#a7b3ac',c:'#c3cec7',hi:'#e2e9e4'},
  iron:{a:'#676d75',b:'#9aa3ad',c:'#dfe6ec',hi:'#ffffff'},
  ore:{a:'#2f7f96',b:'#3ea9c4',c:'#8fe8f7',hi:'#e8fdff'},
  gem:{a:'#8f3c6b',b:'#c14c8a',c:'#ff9bd1',hi:'#ffe1f3'},
  fire_ore:{a:'#b04425',b:'#e3572a',c:'#ffce6a',hi:'#fff1c0'}
};
function drawRubble(x,y,z,g,pal,scale){
  const s=g.tw*(scale||.8),p=pos(x,y,z,g);
  ctx.fillStyle='#16483945';ctx.beginPath();ctx.ellipse(p.x,p.y+2,s*.32,s*.12,0,0,Math.PI*2);ctx.fill();
  const rock=(cx,cy,rx,ry,rot,fill,hi)=>{
    const pts=[];
    for(let i=0;i<6;i++){
      const a=rot+i*Math.PI/3,j=(i%2)?.82:1;
      pts.push([cx+Math.cos(a)*rx*j,cy+Math.sin(a)*ry*j]);
    }
    poly(pts,fill);
    ctx.beginPath();ctx.moveTo(pts[0][0],pts[0][1]);ctx.lineTo(pts[1][0],pts[1][1]);ctx.lineTo(pts[2][0],pts[2][1]);ctx.closePath();
    ctx.fillStyle=hi;ctx.fill();
  };
  rock(p.x+s*.08,p.y-s*.02,s*.26,s*.18,-.35,pal.a,pal.b);   // 大块（右下）
  rock(p.x-s*.12,p.y-s*.1,s*.21,s*.15,.55,pal.b,pal.c);     // 中块（左上）
  rock(p.x+s*.02,p.y-s*.23,s*.16,s*.12,-.85,pal.c,pal.hi);  // 小块（上中）
}
function drawStone(x,y,z,g){ drawRubble(x,y,z,g,PILE_PAL.stone,.58) } // 石材：碎石堆（明显缩小）
function drawOre(x,y,z,g,variant){ // 铁矿/蓝晶矿/宝石/火晶矿：石头形状，不同颜色
  drawRubble(x,y,z,g,PILE_PAL[variant]||PILE_PAL.ore,.8);
}
function drawBerry(x,y,z,g){ // 果子节点：矮灌木 + 粉红浆果
  const s=g.tw,p=pos(x,y,z,g);
  ctx.fillStyle='#16483945';ctx.beginPath();ctx.ellipse(p.x,p.y+2,s*.24,s*.09,0,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#2f6b3a';ctx.beginPath();ctx.arc(p.x,p.y-s*.2,s*.2,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#3f8a48';ctx.beginPath();ctx.arc(p.x-s*.11,p.y-s*.14,s*.13,0,Math.PI*2);ctx.fill();
  ctx.beginPath();ctx.arc(p.x+s*.11,p.y-s*.15,s*.13,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#4ea055';ctx.beginPath();ctx.arc(p.x+s*.01,p.y-s*.3,s*.11,0,Math.PI*2);ctx.fill();
  for(const [dx,dy] of [[-.12,-.22],[.13,-.24],[0,-.36],[-.02,-.12]]){
    ctx.fillStyle='#c9426e';ctx.beginPath();ctx.arc(p.x+s*dx,p.y+s*dy,s*.055,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#ff7aa8';ctx.beginPath();ctx.arc(p.x+s*dx-s*.015,p.y+s*dy-s*.015,s*.03,0,Math.PI*2);ctx.fill();
  }
}

function drawActor(a,g,time){ // 静态/运行态通用绘制（复刻 drawEncounterActor）
  const p=pos(a.x,a.y,a.z,g),s=g.tw;
  ctx.save();ctx.translate(p.x,p.y);
  ctx.fillStyle='#16483945';ctx.beginPath();ctx.ellipse(0,4,s*.24,s*.1,0,0,Math.PI*2);ctx.fill();
  const opened=!!a.opened,sheared=!!a.sheared,fuse=a.fuse||0;
  if(a.type==='farmer'){ctx.fillStyle='#936241';ctx.fillRect(-s*.13,-s*.43,s*.26,s*.43);ctx.fillStyle='#ce9d79';ctx.fillRect(-s*.12,-s*.66,s*.24,s*.24);
    ctx.fillStyle='#e5c570';ctx.fillRect(-s*.2,-s*.68,s*.4,s*.07);ctx.fillRect(-s*.13,-s*.78,s*.26,s*.12);
    ctx.fillStyle='#294d32';ctx.fillRect(-s*.08,-s*.58,s*.04,s*.04);ctx.fillRect(s*.04,-s*.58,s*.04,s*.04);
    ctx.fillStyle='#af7756';ctx.fillRect(-s*.015,-s*.55,s*.075,s*.13);ctx.fillStyle='#714e36';ctx.fillRect(-s*.18,-s*.31,s*.36,s*.09)}
  else if(a.type==='chest'){ctx.fillStyle=opened?'#674329':'#a87637';ctx.fillRect(-s*.25,-s*.3,s*.5,s*.29);
    ctx.fillStyle='#dfa954';ctx.fillRect(-s*.26,-s*(opened?.48:.34),s*.52,s*.1);ctx.fillStyle='#ffe99c';ctx.fillRect(-s*.04,-s*.22,s*.08,s*.11)}
  else if(a.type==='sheep'){const grazing=sheared&&(a.regrowAt||0)-(time||0)<2;
    if(sheared&&(a.grassReadyAt||0)>(time||0)){ctx.fillStyle='#977854';ctx.beginPath();ctx.ellipse(0,5,s*.31,s*.13,0,0,Math.PI*2);ctx.fill()}
    ctx.fillStyle='#927563';for(const o of [-.18,.13])ctx.fillRect(s*o,-s*.14,s*.055,s*.22);
    ctx.fillStyle=sheared?'#d4b3a0':'#fffeed';ctx.fillRect(-s*.27,-s*.4,s*.49,s*.3);
    ctx.fillStyle='#a58c79';ctx.fillRect(s*.14,-s*(grazing?.24:.36),s*.19,s*.21);
    ctx.fillStyle='#273b34';ctx.fillRect(s*.26,-s*(grazing?.19:.31),s*.035,s*.04)}
  else if(a.type==='creeper'){if(fuse>0){ctx.strokeStyle='#ffc080';ctx.lineWidth=3;ctx.beginPath();ctx.ellipse(0,3,s*.43,s*.22,0,0,Math.PI*2);ctx.stroke()}
    ctx.fillStyle=fuse>0&&Math.floor((time||0)*12)%2===0?'#fff5df':'#6ab959';
    ctx.fillRect(-s*.12,-s*.4,s*.24,s*.33);ctx.fillRect(-s*.2,-s*.7,s*.4,s*.3);ctx.fillRect(-s*.19,-s*.09,s*.13,s*.15);ctx.fillRect(s*.06,-s*.09,s*.13,s*.15);
    ctx.fillStyle='#203c2a';ctx.fillRect(-s*.12,-s*.62,s*.08,s*.07);ctx.fillRect(s*.04,-s*.62,s*.08,s*.07);ctx.fillRect(-s*.035,-s*.55,s*.07,s*.07);
    ctx.fillRect(-s*.085,-s*.5,s*.17,s*.07);ctx.fillRect(-s*.085,-s*.45,s*.045,s*.035);ctx.fillRect(s*.04,-s*.45,s*.045,s*.035)}
  else if(a.type==='trapped_farmer'){
    ctx.fillStyle='#936241';ctx.fillRect(-s*.13,-s*.43,s*.26,s*.43);ctx.fillStyle='#ce9d79';ctx.fillRect(-s*.12,-s*.66,s*.24,s*.24);
    ctx.fillStyle='#e5c570';ctx.fillRect(-s*.2,-s*.68,s*.4,s*.07);ctx.fillRect(-s*.13,-s*.78,s*.26,s*.12);
    ctx.fillStyle='#ff6a3c';for(const f of [[-.28,-.4],[.26,-.42],[-.3,-.18],[.28,-.2]])ctx.beginPath(),ctx.arc(f[0]*s,f[1]*s,s*.07,0,Math.PI*2),ctx.fill();
    ctx.fillStyle='#ffd07a';for(const f of [[-.28,-.4],[.26,-.42],[-.3,-.18],[.28,-.2]])ctx.beginPath(),ctx.arc(f[0]*s,f[1]*s,s*.035,0,Math.PI*2),ctx.fill();
  }
  else if(a.type==='creeper_static'){
    const defeated=play&&play.defeatedCreepers&&play.defeatedCreepers.includes(key(a.x,a.y));
    if(!defeated){
      ctx.fillStyle='#3b8a45';ctx.fillRect(-s*.12,-s*.4,s*.24,s*.33);ctx.fillRect(-s*.2,-s*.7,s*.4,s*.3);ctx.fillRect(-s*.19,-s*.09,s*.13,s*.15);ctx.fillRect(s*.06,-s*.09,s*.13,s*.15);
      ctx.fillStyle='#1d3d24';ctx.fillRect(-s*.12,-s*.62,s*.08,s*.07);ctx.fillRect(s*.04,-s*.62,s*.08,s*.07);ctx.fillRect(-s*.035,-s*.55,s*.07,s*.07);
      ctx.fillRect(-s*.085,-s*.5,s*.17,s*.07);ctx.fillRect(-s*.085,-s*.45,s*.045,s*.035);ctx.fillRect(s*.04,-s*.45,s*.045,s*.035);
      ctx.fillStyle='#fff';ctx.fillRect(-s*.13,-s*.7,s*.04,s*.04);ctx.fillRect(s*.09,-s*.7,s*.04,s*.04);
    }else{
      ctx.fillStyle='#3a4a3e';ctx.fillRect(-s*.14,-s*.3,s*.28,s*.04);ctx.fillRect(-s*.1,-s*.34,s*.2,s*.04);
      ctx.fillStyle='#4a5a4e';ctx.fillRect(-s*.14,-s*.3,s*.28,s*.04);ctx.fillRect(-s*.1,-s*.34,s*.2,s*.04);
      ctx.fillStyle='#2a3a2e';ctx.fillRect(-s*.12,-s*.45,s*.24,s*.15);ctx.fillStyle='#5a6a5e';ctx.fillRect(-s*.04,-s*.45,s*.08,s*.05);
    }
  }
  else if(a.type==='zombie_static'){
    const defeated=play&&play.defeatedCreepers&&play.defeatedCreepers.includes(key(a.x,a.y));
    if(!defeated){
      const skin=Math.floor((time||0)*8)%2?'#7da66b':'#6b9461';
      ctx.fillStyle='#5a4a3a';ctx.fillRect(-s*.2,-s*.18,s*.4,s*.27);ctx.fillRect(-s*.19,-s*.09,s*.13,s*.15);ctx.fillRect(s*.06,-s*.09,s*.13,s*.15);
      ctx.fillStyle=skin;ctx.fillRect(-s*.13,-s*.45,s*.26,s*.3);ctx.fillRect(-s*.16,-s*.7,s*.32,s*.28);
      ctx.fillStyle='#3e342a';ctx.fillRect(-s*.16,-s*.7,s*.32,s*.04);ctx.fillRect(s*.12,-s*.5,s*.04,s*.18);
      ctx.fillStyle='#5a4a3a';ctx.fillRect(s*.13,-s*.4,s*.11,s*.22);ctx.fillRect(s*.18,-s*.22,s*.06,s*.18);
      ctx.fillStyle='#ff3a3a';ctx.fillRect(-s*.1,-s*.62,s*.05,s*.05);ctx.fillRect(s*.05,-s*.62,s*.05,s*.05);
      ctx.fillStyle='#3a1a1a';ctx.fillRect(-s*.04,-s*.52,s*.08,s*.04);
    }else{
      ctx.fillStyle='#3a4a3e';ctx.fillRect(-s*.16,-s*.12,s*.32,s*.06);ctx.fillRect(-s*.12,-s*.16,s*.24,s*.05);
      ctx.fillStyle='#5a4a3a';ctx.fillRect(-s*.16,-s*.12,s*.32,s*.06);
      ctx.fillStyle='#2a3a2e';ctx.fillRect(-s*.14,-s*.3,s*.28,s*.18);ctx.fillStyle='#6a5a4a';ctx.fillRect(-s*.04,-s*.3,s*.08,s*.06);
    }
  }
  ctx.restore();
  const label=a.type==='farmer'?(play?'农民村民 · E':'农民村民')
    :a.type==='trapped_farmer'?(play?'被困村民 · E':'被困村民')
    :a.type==='chest'?(play?(a.opened?'空补给箱':'剪刀补给箱 · E'):'补给箱')
    :a.type==='sheep'?(play?(a.sheared?'等待吃草':'绵羊 · E 剪毛'):'绵羊')
    :a.type==='creeper'?(play&&a.fuse>0?'嘶——快退开！':'苦力怕')
    :a.type==='creeper_static'?(play&&(play.defeatedCreepers||[]).includes(key(a.x,a.y))?'苦力怕（已击退）':'苦力怕（不动）')
    :a.type==='zombie_static'?(play&&(play.defeatedCreepers||[]).includes(key(a.x,a.y))?'僵尸（已击退）':'僵尸（不动）')
    :'对象';
  ctx.font=`bold ${Math.max(11,Math.min(13,s*.21))}px system-ui`;ctx.textAlign='center';
  ctx.fillStyle=a.type==='creeper'||a.type==='zombie_static'?'#fff0b7':'#faffdf';ctx.strokeStyle='#255b5b';ctx.lineWidth=3;
  ctx.strokeText(label,p.x,p.y-s*.88);ctx.fillText(label,p.x,p.y-s*.88);
  if((a.happyUntil||0)>(time||0)){ctx.fillStyle='#93f38e';ctx.fillText('✦ 交易成功',p.x,p.y-s*1.1)}
}
function drawCrop(c,g,ready){const p=pos(c.x,c.y,c.z,g),s=g.tw;
  ctx.strokeStyle=ready?'#e9bc48':'#40824a';ctx.lineWidth=Math.max(2,s*.035);
  for(const o of [-.15,0,.15]){ctx.beginPath();ctx.moveTo(p.x+s*o,p.y);ctx.lineTo(p.x+s*o,p.y-s*(ready?.32:.1));ctx.stroke();
    if(ready){ctx.fillStyle='#ffe38c';ctx.fillRect(p.x+s*o-3,p.y-s*.32,6,s*.15)}}}

function render(){
  if(!canvas.width)return;
  // 终极兜底：level 异常时画空画布
  if(!level||!level.terrain){
    const w=canvas.clientWidth,h=canvas.clientHeight;
    ctx.clearRect(0,0,w,h);ctx.fillStyle='#0a3a40';ctx.fillRect(0,0,w,h);
    return;
  }
  const w=canvas.clientWidth,h=canvas.clientHeight,g=geo();
  ctx.clearRect(0,0,w,h);
  const grd=ctx.createRadialGradient(w/2,h*.47,10,w/2,h*.47,w*.65);
  grd.addColorStop(0,'#7cb9af4d');grd.addColorStop(1,'#0a4e6c00');ctx.fillStyle=grd;ctx.fillRect(0,0,w,h);
  const l=level;
  const bridges=play?play.bridges:null,broken=play?play.broken:null;
  for(let sum=0;sum<W+H-1;sum++)for(let x=0;x<W;x++){
    const y=sum-x;if(y<0||y>=H)continue;
    const z=play?pTerrain(x,y):terrainZ(l,x,y),k=key(x,y),water=isWaterAt(l,x,y);
    const bridge=bridges&&bridges.has(k);
    const rock=rockAt(l,x,y,z)&&(!broken||!broken.has(key(x,y)+','+z));
    const n=play?play.nodes.find(m=>m.x===x&&m.y===y&&m.z===z&&!m.taken):nodeAt(l,x,y,z);
    const rs=isRockSoilAt(l,x,y); // ★ 岩土块
    for(let layer=-2;layer<=z;layer++){
      const col=layer===-2?'#667778':layer<z?'#987453':water&&!bridge?'#60bfd0':bridge?'#bb985e':z>=1?((x+y)%3===0?'#b98a55':'#c9995e'):z<0?'#798c83':(x+y)%3===0?'#94c777':'#9fd282';
      voxel(x,y,layer,g,col);
    }
    if(z>=1){ // 土块/高台：顶面覆盖草皮（绿），侧面保持土色
      const p=pos(x,y,z,g),a=g.tw*.5,b=g.th*.5;
      poly([[p.x-a,p.y],[p.x,p.y-b],[p.x+a,p.y],[p.x,p.y+b]],(x+y)%3===0?'#8fcf6f':'#9bd97d','#ffffff39');
    }
    if(rs&&z>=1){ // ★ 岩土块：侧面岩石色 + 岩石纹路（不可挖掘）
      const p=pos(x,y,z,g),a=g.tw*.5,b=g.th*.5,d=g.zStep;
      poly([[p.x-a,p.y],[p.x,p.y+b],[p.x,p.y+b+d],[p.x-a,p.y+d]],'#7d857f');
      poly([[p.x+a,p.y],[p.x,p.y+b],[p.x,p.y+b+d],[p.x+a,p.y+d]],'#666e69');
      poly([[p.x-a,p.y],[p.x,p.y-b],[p.x+a,p.y],[p.x,p.y+b]],(x+y)%3===0?'#8fcf6f':'#9bd97d','#ffffff39');
      ctx.strokeStyle='#495349';ctx.lineWidth=1.2;
      ctx.beginPath();ctx.moveTo(p.x-a*.72,p.y+b*.3);ctx.lineTo(p.x-a*.3,p.y+b*.55+d*.45);ctx.stroke();
      ctx.beginPath();ctx.moveTo(p.x-a*.9,p.y+b*.62);ctx.lineTo(p.x-a*.45,p.y+b*.82+d*.25);ctx.stroke();
      ctx.beginPath();ctx.moveTo(p.x+a*.72,p.y+b*.3);ctx.lineTo(p.x+a*.3,p.y+b*.55+d*.45);ctx.stroke();
      ctx.beginPath();ctx.moveTo(p.x+a*.9,p.y+b*.62);ctx.lineTo(p.x+a*.45,p.y+b*.82+d*.25);ctx.stroke();
    }
    if(water&&!bridge){const p=pos(x,y,z,g);ctx.strokeStyle='#d9ffff99';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(p.x-g.tw*.15,p.y);ctx.lineTo(p.x+g.tw*.12,p.y-g.th*.08);ctx.stroke()}
    if(bridge){const p=pos(x,y,z,g);ctx.strokeStyle='#6f532f';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(p.x-g.tw*.26,p.y);ctx.lineTo(p.x+g.tw*.26,p.y);ctx.stroke()}
    if(rock){voxel(x,y,z+1,g,'#bdc6b1');glyph('⛏',x,y,z+1,g,22)}
    if(n&&n.type==='wood')drawTree(x,y,z,g);
    else if(n&&n.type==='stone')drawStone(x,y,z,g);
    else if(n&&n.type==='berry')drawBerry(x,y,z,g);
    else if(n)drawOre(x,y,z,g,n.type);
    // 岩浆 / 水源（覆盖在地表）
    if(l.lava.some(v=>v.x===x&&v.y===y)&&!(play&&play._extinguished&&play._extinguished.has(k))){
      const p=pos(x,y,z,g),t=play?play.time:performance.now()/1000,pulse=.5+.5*Math.sin(t*4);
      // ★ 方形呈现（贴合格子的菱形方格）
      poly(polyDia(g,p.x,p.y+g.th*.1,.99),'#3a1410');
      poly(polyDia(g,p.x,p.y+g.th*.04,.9),pulse>.5?'#ff6a3c':'#e2531f');
      poly(polyDia(g,p.x-g.tw*.09,p.y-g.th*.05,.44),pulse>.5?'#ffce6a':'#ffa843');
      poly(polyDia(g,p.x+g.tw*.15,p.y-g.th*.08,.24),'#ffd07a');
    }
    if(l.waterSource.some(v=>v.x===x&&v.y===y&&v.z===z)){
      const p=pos(x,y,z,g),t=play?play.time:performance.now()/1000;
      // ★ 方形呈现（贴合格子的菱形方格）
      poly(polyDia(g,p.x,p.y+g.th*.08,.98),'#3f8fa8');
      poly(polyDia(g,p.x,p.y+g.th*.03,.9),'#5cbcd6');
      poly(polyDia(g,p.x,p.y-g.th*.02+Math.sin(t*2.5)*g.th*.03,.64),'#a9e1f3');
      poly(polyDia(g,p.x-g.tw*.14,p.y-g.th*.11,.24),'#d8f4ff');
      ctx.font='bold 11px system-ui';ctx.textAlign='center';ctx.fillStyle='#caf0fa';ctx.strokeStyle='#1c4d6e';ctx.lineWidth=3;ctx.strokeText('💧水源',p.x,p.y-g.tw*.7);ctx.fillText('💧水源',p.x,p.y-g.tw*.7);
    }
    if(l.ladder&&l.ladder.x===x&&l.ladder.y===y){
      const built=!play||play.ladderBuilt;
      glyph(built?'▤':'⇧',x,y,z,g,30,'#ffe899');
      if(!built){const p=pos(x,y,z,g);ctx.strokeStyle='#ffdd79';ctx.lineWidth=2;ctx.strokeRect(p.x-g.tw*.16,p.y-g.tw*.32,g.tw*.32,g.tw*.32)}}
    if(l.hole&&l.hole.x===x&&l.hole.y===y){
      const dug=!play||play.holeDug,p=pos(x,y,z,g);
      ctx.fillStyle=dug?'#183c4f':'#6f8780';ctx.beginPath();ctx.ellipse(p.x,p.y,g.tw*.25,g.th*.27,0,0,Math.PI*2);ctx.fill();
      glyph(dug?'↓':'⊕',x,y,z,g,20,'#f9e69c')}
    if(l.goal&&l.goal.x===x&&l.goal.y===y){
      glyph('⚑',x,y,z,g,30,'#ffd75e')}
    // actors / crops
    const a=(play?play.actors:l.actors).find(m=>m.x===x&&m.y===y&&m.z===z&&(m.alive!==false));
    if(a)drawActor(a,g,play?play.time:0);
    const c=(play?play.crops:l.crops).find(m=>m.x===x&&m.y===y);
    if(c)drawCrop(c,g,play?play.time>=c.readyAt:true);
    // 玩家（试玩）
    if(play&&play.player.x===x&&play.player.y===y&&play.player.z===z)drawPlayer(play.player,g);
  }
  /* ★ 改动 2：试玩交互范围可视化 —— 九宫格可选态（淡金）+ 选中态（亮金脉冲）+ 导航目标（青虚线） */
  if(play&&!play.over){
    const act=pCandidate();
    const dia=(px,py,tw,th)=>{ctx.beginPath();ctx.moveTo(px-tw*.5,py);ctx.lineTo(px,py-th*.5);ctx.lineTo(px+tw*.5,py);ctx.lineTo(px,py+th*.5);ctx.closePath()};
    for(const cc of pCandidates()){
      if(act&&cc.x===act.x&&cc.y===act.y)continue;
      const cz=pTerrain(cc.x,cc.y),cp=pos(cc.x,cc.y,cz,g);
      ctx.strokeStyle='#ffd75e70';ctx.lineWidth=2;dia(cp.x,cp.y,g.tw,g.th);ctx.stroke();
    }
    if(act){
      const az=pTerrain(act.x,act.y),ap=pos(act.x,act.y,az,g);
      const pulse=3.2+Math.sin(performance.now()/170)*1.4;
      ctx.strokeStyle='#00000055';ctx.lineWidth=pulse+3;dia(ap.x,ap.y,g.tw*.98,g.th*.98);ctx.stroke();
      ctx.strokeStyle='#fff2a6';ctx.lineWidth=pulse;dia(ap.x,ap.y,g.tw,g.th);ctx.stroke();
    }
    if(play.focus&&(!act||play.focus.x!==act.x||play.focus.y!==act.y)){
      const fz=pTerrain(play.focus.x,play.focus.y),fp=pos(play.focus.x,play.focus.y,fz,g);
      ctx.strokeStyle='#7ee9ff';ctx.lineWidth=2;ctx.setLineDash([5,4]);dia(fp.x,fp.y,g.tw,g.th);ctx.stroke();ctx.setLineDash([]);
    }
    /* ★ 挖土/放土目标格：脉冲高亮 + 橙(可操作)/红(不可操作) 区分，避免误判选中态 */
    if(play.held==='shovel'||play.held==='dirt'){
      const t=(play.focus&&pAdjacent8(play.focus.x,play.focus.y))?play.focus:null;
      if(t){
        const tz=pTerrain(t.x,t.y),tp=pos(t.x,t.y,tz,g);
        const ok=(play.held==='dirt')?((play.bag.dirt||0)>0&&pTerrain(t.x,t.y)<=2):!!pDiggable(t.x,t.y);
        const pulse=3.4+Math.sin(performance.now()/160)*1.6;
        ctx.strokeStyle=ok?'#ffb347':'#ff6b6b';ctx.lineWidth=pulse;dia(tp.x,tp.y,g.tw,g.th);ctx.stroke();
        ctx.strokeStyle=ok?'#ffb34755':'#ff6b6b55';ctx.lineWidth=pulse+3;dia(tp.x,tp.y,g.tw*.96,g.th*.96);ctx.stroke();
        ctx.font='bold 14px system-ui';ctx.textAlign='center';ctx.fillStyle=ok?'#ffd98a':'#ff8a8a';ctx.strokeStyle='#00000099';ctx.lineWidth=3;
        const mark=ok?'✓':'✕';ctx.strokeText(mark,tp.x,tp.y-g.th*.95);ctx.fillText(mark,tp.x,tp.y-g.th*.95);
      }
    }
  }
  if(!play){ // 编辑模式覆盖层：激活层网格 / hover / 选中 / 降落点
    const lz=LAYER_Z[activeLayer];
    ctx.strokeStyle='rgba(255,255,255,.10)';ctx.lineWidth=1;
    for(let y=0;y<H;y++)for(let x=0;x<W;x++){const p=pos(x,y,lz,g);
      ctx.beginPath();ctx.moveTo(p.x-g.tw*.5,p.y);ctx.lineTo(p.x,p.y-g.th*.5);ctx.lineTo(p.x+g.tw*.5,p.y);ctx.lineTo(p.x,p.y+g.th*.5);ctx.closePath();ctx.stroke()}
    if(hover)outlineTile(hover.x,hover.y,lz,g,'#ffe27a');
    if(selection)outlineTile(selection.x,selection.y,selection.z,g,'#4ff2c8');
    const sp=pos(l.spawn[0],l.spawn[1],0,g);
    outlineTile(l.spawn[0],l.spawn[1],0,g,'#9fe8ff');
    ctx.font='bold 13px system-ui';ctx.fillStyle='#e5fff0';ctx.textAlign='center';
    ctx.fillText('降落点',sp.x,sp.y+g.tw*.52);
    if(l.goal){
      const gz=terrainZ(l,l.goal.x,l.goal.y),gp=pos(l.goal.x,l.goal.y,gz,g);
      outlineTile(l.goal.x,l.goal.y,gz,g,'#ffd75e');
      ctx.fillStyle='#ffe9ad';ctx.fillText('终点',gp.x,gp.y+g.tw*.52);
    }
  }else if(play.blast){ // 爆炸特效
    const p=pos(play.blast.x,play.blast.y,play.blast.z,g);
    ctx.save();ctx.globalAlpha=Math.max(0,(play.blast.until-play.time)/.65);
    ctx.fillStyle='#ffe6a8';ctx.beginPath();ctx.ellipse(p.x,p.y-g.tw*.2,g.tw*.7,g.tw*.5,0,0,Math.PI*2);ctx.fill();ctx.restore();
  }
}
function outlineTile(x,y,z,g,color){const p=pos(x,y,z,g);
  ctx.strokeStyle=color;ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(p.x-g.tw*.5,p.y);ctx.lineTo(p.x,p.y-g.th*.5);
  ctx.lineTo(p.x+g.tw*.5,p.y);ctx.lineTo(p.x,p.y+g.th*.5);ctx.closePath();ctx.stroke()}
function drawPlayer(pl,g){const p=pos(pl.x,pl.y,pl.z,g),s=g.tw;
  ctx.fillStyle='#06465d66';ctx.beginPath();ctx.ellipse(p.x,p.y+5,s*.19,s*.08,0,0,Math.PI*2);ctx.fill();
  ctx.fillStyle='#f9dc95';ctx.fillRect(p.x-s*.085,p.y-s*.62,s*.17,s*.22);
  ctx.fillStyle='#efaf65';ctx.fillRect(p.x-s*.12,p.y-s*.69,s*.24,s*.07);
  ctx.fillStyle='#f7eed0';ctx.fillRect(p.x-s*.13,p.y-s*.38,s*.26,s*.23);
  ctx.fillStyle='#3c9fa2';ctx.fillRect(p.x-s*.11,p.y-s*.28,s*.22,s*.14);
  ctx.fillStyle='#fff2bd';ctx.beginPath();ctx.arc(p.x+s*.12,p.y-s*.58,s*.035,0,Math.PI*2);ctx.fill()}

function resize(){const r=canvas.getBoundingClientRect(),dpr=Math.min(devicePixelRatio||1,2);
  canvas.width=Math.max(1,Math.round(r.width*dpr));canvas.height=Math.max(1,Math.round(r.height*dpr));
  ctx.setTransform(dpr,0,0,dpr,0,0);render()}

/* ================= 命中检测 ================= */
function pickEdit(cx,cy){ // 编辑模式：激活层平面最近格
  const rect=canvas.getBoundingClientRect(),px=cx-rect.left,py=cy-rect.top,g=geo(),z=LAYER_Z[activeLayer];
  let best=null,score=Infinity;
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){
    const p=pos(x,y,z,g),dx=(px-p.x)/(g.tw*.5),dy=(py-p.y)/(g.th*.5),v=Math.abs(dx)+Math.abs(dy);
    if(v<score){score=v;best={x,y}}}
  return score<1.35?best:null;
}
function pickPlay(cx,cy){ // 试玩模式：按地形高度最近格（含节点/岩壁抬高）
  const rect=canvas.getBoundingClientRect(),px=cx-rect.left,py=cy-rect.top,g=geo();
  let best=null,score=Infinity;
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){
    const z=terrainZ(level,x,y),raised=!!nodeAt(level,x,y,z)||!!rockAt(level,x,y,z);
    const p=pos(x,y,z+(raised?1:0),g),dx=(px-p.x)/(g.tw*.5),dy=(py-p.y)/(g.th*.5),v=Math.abs(dx)+Math.abs(dy);
    if(v<score){score=v;best={x,y}}}
  return score<1.5?best:null;
}

/* ================= 编辑操作 ================= */
const PAINT_TOOLS=new Set(['grass','dirt','cliff','cave','water','rock','erase','rock_soil']);
function pickObject(l,x,y){
  const z=LAYER_Z[activeLayer];
  let i=l.actors.findIndex(a=>a.x===x&&a.y===y&&a.z===z);if(i>=0)return{kind:'actor',idx:i,x,y,z};
  if(z===0){i=l.crops.findIndex(c=>c.x===x&&c.y===y);if(i>=0)return{kind:'crop',idx:i,x,y,z:0}}
  i=l.nodes.findIndex(n=>n.x===x&&n.y===y&&n.z===z);if(i>=0)return{kind:'node',idx:i,x,y,z};
  i=l.rocks.findIndex(r=>r.x===x&&r.y===y&&r.z===z);if(i>=0)return{kind:'rock',idx:i,x,y,z};
  if(l.ladder&&l.ladder.x===x&&l.ladder.y===y)return{kind:'ladder',x,y,z:terrainZ(l,x,y)};
  if(l.hole&&l.hole.x===x&&l.hole.y===y)return{kind:'hole',x,y,z:terrainZ(l,x,y)};
  if(l.goal&&l.goal.x===x&&l.goal.y===y)return{kind:'goal',x,y,z:terrainZ(l,x,y)};
  if(z===0&&isWaterAt(l,x,y))return{kind:'water',x,y,z:0};
  i=l.lava.findIndex(v=>v.x===x&&v.y===y);if(i>=0)return{kind:'lava',idx:i,x,y,z:0};
  i=l.waterSource.findIndex(v=>v.x===x&&v.y===y&&v.z===z);if(i>=0)return{kind:'waterSource',idx:i,x,y,z};
  if(l.spawn[0]===x&&l.spawn[1]===y&&z===0)return{kind:'spawn',x,y,z:0};
  // ★ 岩土块（不可挖掘的土块）
  if((l.rockSoil||[]).some(v=>v.x===x&&v.y===y))return{kind:'rockSoil',x,y,z:terrainZ(l,x,y)};
  // ★ 改动 5：surface 层的空地也作为可选中对象（草地/土块/高台/矿洞）
  if(z===0)return{kind:'terrain',x,y,z:0,type:terrainZ(l,x,y)};
  return{kind:'tile',x,y,z};
}
function applyTool(x,y,isRight){
  const l=level,z=LAYER_Z[activeLayer];
  const t=isRight?'erase':tool;
  if(t==='erase')return eraseAt(x,y);
  switch(t){
    case 'grass':setTile(x,y,0);break;
    case 'dirt':setTile(x,y,1);break;
    case 'rock_soil': // ★ 岩土块：高度同土块，但不可挖掘
      if(terrainZ(l,x,y)!==0&&!(l.rockSoil||[]).some(v=>v.x===x&&v.y===y)){toast('岩土块只能放在地表层');return false}
      setTile(x,y,1);
      if(!l.rockSoil.some(v=>v.x===x&&v.y===y))l.rockSoil.push({x,y});
      break;
    case 'cliff':setTile(x,y,2);break;
    case 'cave':setTile(x,y,-2);break;
    case 'water':
      if(terrainZ(l,x,y)!==0){toast('水面只能放在地表层');return false}
      if(l.terrain[y*W+x]!==0)l.terrain[y*W+x]=0;
      l.water[y*W+x]=true;break;
    case 'rock':case 'wood':case 'stone':case 'ore':case 'gem':case 'fire_ore':case 'berry':case 'iron':
    case 'farmer':case 'trapped_farmer':case 'sheep':case 'chest':case 'creeper':case 'creeper_static':case 'zombie_static':case 'crop':
      if(!placeEntity(t,x,y,z))return false;
      break;
    case 'water_source':
      if(terrainZ(l,x,y)!==0){toast('水源需要放在地表层');return false}
      if(l.waterSource.some(p=>p.x===x&&p.y===y&&p.z===z)){toast('该格已有水源');return false}
      l.waterSource.push({x,y,z});break;
    case 'lava':
      if(terrainZ(l,x,y)!==0){toast('岩浆需要放在地表层');return false}
      if(l.lava.some(p=>p.x===x&&p.y===y)){toast('该格已有岩浆');return false}
      l.lava.push({x,y});break;
    case 'ladder':
      if(l.terrain[y*W+x]!==2){toast('木梯需要放在高台格上（建议高台边缘）');return false}
      if(occupiedAt(l,x,y,2)&&!(l.ladder&&l.ladder.x===x&&l.ladder.y===y)){toast('该格已被占用');return false}
      l.ladder={x,y};break;
    case 'hole':
      if(l.terrain[y*W+x]!==-2){toast('矿洞口需要放在矿洞格上');return false}
      l.hole={x,y};break;
    case 'spawn':
      if(terrainZ(l,x,y)!==0||isWaterAt(l,x,y)||occupiedAt(l,x,y,0)){toast('降落点需要无占用的草地面');return false}
      l.spawn=[x,y];break;
    case 'goal':
      if(isWaterAt(l,x,y)){toast('终点不能放在水面上');return false}
      if(occupiedAt(l,x,y,terrainZ(l,x,y))){toast('终点所在格已被占用（玩家要能走上来）');return false}
      l.goal={x,y};break;
    case 'select':return false;
  }
  afterEdit();
  return true;
}
function setTile(x,y,t){ // t：-2 矿洞 / 0 草地 / 1 土块 / 2 高台
  const l=level;
  l.terrain[y*W+x]=t;
  if(t!==0)l.water[y*W+x]=false;
  if(t!==1)l.rockSoil=(l.rockSoil||[]).filter(v=>!(v.x===x&&v.y===y)); // 非土块高度时清除岩土标记
  // 地形变化后，清理与该格地形不符的对象
  l.nodes=l.nodes.filter(n=>!(n.x===x&&n.y===y&&n.z!==t));
  l.actors=l.actors.filter(a=>!(a.x===x&&a.y===y&&a.z!==t));
  l.rocks=l.rocks.filter(r=>!(r.x===x&&r.y===y&&r.z!==t));
  if(t!==0)l.crops=l.crops.filter(c=>!(c.x===x&&c.y===y));
  if(l.ladder&&l.ladder.x===x&&l.ladder.y===y&&t!==2)l.ladder=null;
  if(l.hole&&l.hole.x===x&&l.hole.y===y&&t!==-2)l.hole=null;
}
function placeEntity(t,x,y,z){
  const l=level;
  if(isWaterAt(l,x,y)){toast('水面上无法放置');return false}
  if(t==='crop'&&terrainZ(l,x,y)!==0){toast('麦田只能放在地表');return false}
  if(l.spawn[0]===x&&l.spawn[1]===y&&z===0){toast('降落点被占用，先移开降落点');return false}
  if(occupiedAt(l,x,y,z)){toast('该格已有其他对象');return false}
  if((t==='wood'||t==='stone'||t==='ore'||t==='berry'||t==='iron')&&l.nodes.some(n=>n.x===x&&n.y===y)){toast('该格已有资源节点（同格节点会互相覆盖）');return false}
  if(t==='rock'&&l.rocks.some(r=>r.x===x&&r.y===y)){toast('该格已有岩壁');return false}
  if(t==='crop')l.crops.push({x,y,z:0});
  else if(t==='rock')l.rocks.push({x,y,z});
  else if(NODE_NAME[t])l.nodes.push({type:t,x,y,z});
  else l.actors.push({type:t,x,y,z});
  return true;
}
function eraseAt(x,y){
  const l=level,o=pickObject(l,x,y);
  switch(o.kind){
    case 'actor':l.actors.splice(o.idx,1);break;
    case 'crop':l.crops.splice(o.idx,1);break;
    case 'node':l.nodes.splice(o.idx,1);break;
    case 'rock':l.rocks.splice(o.idx,1);break;
    case 'ladder':l.ladder=null;break;
    case 'hole':l.hole=null;break;
    case 'goal':l.goal=null;break;
    case 'water':l.water[y*W+x]=false;break;
    case 'lava':l.lava.splice(o.idx,1);break;
    case 'waterSource':l.waterSource.splice(o.idx,1);break;
    case 'terrain':setTile(x,y,0);break; // ★ 改动 5：地形格删除 = 变草地
    case 'rockSoil':setTile(x,y,0);break; // ★ 岩土块删除 = 变草地
    case 'tile':toast('此处没有可删除的对象');return false;
  }
  if(selection&&selection.kind===o.kind){
    if(selection.idx===o.idx)selection=null;
    else if(selection.idx>o.idx)selection.idx--;
  }
  afterEdit();
  return true;
}
function afterEdit(){save();refreshProps();refreshValidation();render()}

/* ---------- 选中与拖拽 ---------- */
function selectionRef(){
  const l=level;if(!selection||selection.kind==='tile')return null;
  switch(selection.kind){
    case 'actor':return l.actors[selection.idx];
    case 'crop':return l.crops[selection.idx];
    case 'node':return l.nodes[selection.idx];
    case 'rock':return l.rocks[selection.idx];
    case 'ladder':return l.ladder;
    case 'hole':return l.hole;
    case 'goal':return l.goal;
    case 'spawn':return{get x(){return l.spawn[0]},set x(v){l.spawn[0]=v},get y(){return l.spawn[1]},set y(v){l.spawn[1]=v}};
    // ★ 改动 5：terrain（地形格）也作为可引用对象（实时读 terrain 数组）
    case 'terrain':return{x:selection.x,y:selection.y,z:0,type:terrainZ(l,selection.x,selection.y)};
    case 'rockSoil':return{x:selection.x,y:selection.y,z:terrainZ(l,selection.x,selection.y)}; // ★ 岩土块
  }
}
function moveSelection(dx,dy){
  const ref=selectionRef();if(!ref)return;
  // ★ 改动 5：terrain 不支持拖动
  if(selection.kind==='terrain'||selection.kind==='rockSoil')return;
  const nx=ref.x+dx,ny=ref.y+dy;if(!inb(nx,ny))return;
  if(occupiedAt(level,nx,ny,selection.z)&&!(selection.x===nx&&selection.y===ny)){toast('目标格已被占用');return}
  if(selection.kind==='node'&&level.nodes.some((n,i)=>i!==selection.idx&&n.x===nx&&n.y===ny)){toast('目标格已有资源节点');return}
  if(selection.kind==='rock'&&level.rocks.some((r,i)=>i!==selection.idx&&r.x===nx&&r.y===ny)){toast('目标格已有岩壁');return}
  ref.x=nx;ref.y=ny;selection.x=nx;selection.y=ny;
  afterEdit();
}

/* ================= 画布事件 ================= */
let lastPointer=null,lastClickTime=0,lastClickPos=null; // ★ 改动 6：双击防抖状态
canvas.addEventListener('pointerdown',e=>{
  if(play)return;e.preventDefault();
  if(e.button===2)return; // 右键删除统一交给 contextmenu 处理，避免重复
  canvas.setPointerCapture(e.pointerId);
  const p=pickEdit(e.clientX,e.clientY);if(!p)return;
  lastPointer=p;
  // ★ 改动 6：双击防抖（250ms 内同位置 = 一次）— 试玩不受影响
  const now=performance.now();
  if(lastClickTime&&now-lastClickTime<250&&lastClickPos&&lastClickPos.x===p.x&&lastClickPos.y===p.y){
    lastClickTime=now;return;
  }
  lastClickTime=now;lastClickPos=p;
  if(tool==='select'){
    const o=pickObject(level,p.x,p.y);
    selection=o.kind==='tile'?null:{...o};
    if(selection)drag={startX:p.x,startY:p.y};
    refreshProps();render();return;
  }
  pushUndo();
  if(!applyTool(p.x,p.y,e.button===2))undoStack.pop();
  refreshUndoBtns();painting=true;
});
canvas.addEventListener('pointermove',e=>{
  if(play){render();return}
  const p=pickEdit(e.clientX,e.clientY);
  hover=p;
  if(p)$('hoverInfo').textContent=`(${p.x},${p.y}) ${LAYER_NAME[activeLayer]} · ${tileInfo(level,p.x,p.y)}`;
  else $('hoverInfo').textContent='—';
  if(painting&&p&&PAINT_TOOLS.has(tool)){applyTool(p.x,p.y,false);return}
  if(drag&&p&&(p.x!==drag.startX||p.y!==drag.startY)){
    moveSelection(p.x-drag.startX,p.y-drag.startY);
    drag.startX=p.x;drag.startY=p.y;
  }
  render();
});
window.addEventListener('pointerup',()=>{painting=false;drag=null});
canvas.addEventListener('contextmenu',e=>{
  e.preventDefault();if(play)return;
  const p=pickEdit(e.clientX,e.clientY);
  if(p){pushUndo();if(!eraseAt(p.x,p.y))undoStack.pop();refreshUndoBtns()}
});
canvas.addEventListener('click',e=>{
  if(!play)return;
  const p=pickPlay(e.clientX,e.clientY);
  if(p)playClickTile(p.x,p.y);
});

/* ================= 工具栏 / 属性面板 ================= */
document.querySelectorAll('.tool').forEach(b=>b.onclick=()=>{
  tool=b.dataset.tool;selection=null;
  document.querySelectorAll('.tool').forEach(x=>x.classList.toggle('on',x===b));
  refreshProps();render();
});
document.querySelectorAll('#layerPicker button').forEach(b=>b.onclick=()=>{
  activeLayer=b.dataset.layer;selection=null;
  document.querySelectorAll('#layerPicker button').forEach(x=>x.classList.toggle('on',x===b));
  render();
});

const lvInputs={name:$('lvName'),duration:$('lvDuration'),stamina:$('lvStamina'),mission:$('lvMission'),tip:$('lvTip')};
for(const [k,el] of Object.entries(lvInputs))el.addEventListener('input',()=>{
  if(k==='duration')level[k]=Math.max(30,Math.min(600,Number(el.value)||150));
  else if(k==='stamina')level[k]=Math.max(1,Math.min(99,Math.round(Number(el.value)||12)));
  else level[k]=el.value;
  save();refreshTabs();refreshValidation();
});

function refreshProps(){
  if(!level)return;
  if(document.activeElement!==lvInputs.name)lvInputs.name.value=level.name;
  if(document.activeElement!==lvInputs.duration)lvInputs.duration.value=level.duration;
  if(document.activeElement!==lvInputs.stamina)lvInputs.stamina.value=level.stamina;
  if(document.activeElement!==lvInputs.mission)lvInputs.mission.value=level.mission;
  if(document.activeElement!==lvInputs.tip)lvInputs.tip.value=level.tip;
  refreshSelectionPanel();
}
function refreshSelectionPanel(){
  const body=$('selBody');
  const ref=selection&&selectionRef();
  if(!ref||!selection||selection.kind==='tile'){body.innerHTML='<p class="dim">在「选择/拖动」工具下点击画布中的对象</p>';return}
  // ★ 岩土块面板
  if(selection.kind==='rockSoil'){
    body.innerHTML=`<div class="kv"><span>\u7C7B\u578B</span><b>\u5CA9\u571F\u5757\uFF08\u4E0D\u53EF\u6316\u6398\uFF09</b></div>
      <div class="kv"><span>\u5750\u6807</span><b>(${ref.x}, ${ref.y})</b></div>
      <p class="dim small">\u7EFF\u9876 + \u5CA9\u77F3\u7EB9\u8DEF\uFF1B\u65E0\u6CD5\u7528\u94F2\u5B50\u6216\u9570\u5B50\u6316\u6398\u3002</p>
      <div class="rowbtn"><button id="selDel" class="danger">\u5220\u9664\uFF08\u53D8\u8349\u5730\uFF09</button></div>`;
    $('selDel').onclick=()=>{pushUndo();setTile(ref.x,ref.y,0);selection=null;refreshProps()};
    return;
  }
  // ★ 改动 5：地形格（terrain）独立面板：4 个类型切换 + 删除（变草地）
  if(selection.kind==='terrain'){
    const tname=ref.type===0?'\u8349\u5730':ref.type===1?'\u571F\u5757':ref.type===2?'\u9AD8\u53F0':'\u77FF\u6D1E';
    body.innerHTML=`<div class="kv"><span>\u7C7B\u578B</span><b>\u5730\u5F62 \u00B7 ${tname}</b></div>
      <div class="kv"><span>\u5750\u6807</span><b>(${ref.x}, ${ref.y})</b></div>
      <div class="rowbtn">
        <button id="terGrass" class="${ref.type===0?'on':''}">\u8349\u5730</button>
        <button id="terDirt" class="${ref.type===1?'on':''}">\u571F\u5757</button>
        <button id="terCliff" class="${ref.type===2?'on':''}">\u9AD8\u53F0</button>
        <button id="terCave" class="${ref.type===-2?'on':''}">\u77FF\u6D1E</button>
      </div>
      <div class="rowbtn"><button id="selDel" class="danger">\u5220\u9664\uFF08\u53D8\u8349\u5730\uFF09</button></div>`;
    $('terGrass').onclick=()=>{pushUndo();setTile(ref.x,ref.y,0);refreshProps()};
    $('terDirt').onclick=()=>{pushUndo();setTile(ref.x,ref.y,1);refreshProps()};
    $('terCliff').onclick=()=>{pushUndo();setTile(ref.x,ref.y,2);refreshProps()};
    $('terCave').onclick=()=>{pushUndo();setTile(ref.x,ref.y,-2);refreshProps()};
    $('selDel').onclick=()=>{pushUndo();setTile(ref.x,ref.y,0);selection=null;refreshProps()};
    return;
  }
  const names={actor:'NPC',crop:'麦田',node:'资源节点',rock:'岩壁',ladder:'木梯',hole:'矿洞口',spawn:'降落点',goal:'终点'};
  const label=selection.kind==='actor'?ACTOR_NAME[ref.type]:selection.kind==='node'?NODE_NAME[ref.type]:names[selection.kind];
  let zCtrl='';
  if(['actor','node','rock'].includes(selection.kind))
    zCtrl=`<div class="kv"><span>所在层</span><span><button id="selZDown">−</button> <b>${selZName(ref.z)}</b> <button id="selZUp">＋</button></span></div>`;
  body.innerHTML=`<div class="kv"><span>类型</span><b>${label}</b></div>
    <div class="kv"><span>坐标</span><b>(${ref.x}, ${ref.y})</b></div>${zCtrl}
    <div class="rowbtn"><button id="selDel" class="danger">删除对象</button></div>`;
  $('selDel').onclick=()=>{pushUndo();eraseAt(ref.x,ref.y)};
  const up=$('selZUp'),down=$('selZDown');
  if(up)up.onclick=()=>{pushUndo();ref.z=Math.min(2,ref.z+2);selection.z=ref.z;afterEdit()};
  if(down)down.onclick=()=>{pushUndo();ref.z=Math.max(-2,ref.z-2);selection.z=ref.z;afterEdit()};
}
function selZName(z){return z===2?'高台':z===1?'土块':z===-2?'矿洞':'地表'}

function refreshValidation(){
  const list=validate(level),ul=$('valList');
  ul.innerHTML=list.map(v=>`<li class="${v.level}">${v.msg}</li>`).join('');
  const errs=list.filter(v=>v.level==='error').length,warns=list.filter(v=>v.level==='warn').length;
  $('valSummary').textContent=errs?`${errs} 错误`:warns?`${warns} 提醒`:'通过';
  $('valSummary').style.color=errs?'#ff9b9b':warns?'#ffd166':'#7fe0ab';
}

/* ================= 关卡 Tabs ================= */
function refreshTabs(){
  const nav=$('levelTabs');nav.innerHTML='';
  store.levels.forEach((l,i)=>{
    const b=document.createElement('button');
    b.className='ed-tab'+(i===store.current?' on':'');
    b.innerHTML=`<span>DAY${i+1} · ${escapeHtml(l.name)}</span>`;
    b.onclick=()=>{if(i===store.current)return;store.current=i;level=store.levels[i];selection=null;undoStack=[];redoStack=[];refreshUndoBtns();refreshAll()};
    if(store.levels.length>1){
      const del=document.createElement('span');del.className='del';del.textContent='✕';del.title='删除该关';
      del.onclick=e=>{e.stopPropagation();store.levels.splice(i,1);if(store.current>=store.levels.length)store.current=store.levels.length-1;level=store.levels[store.current];selection=null;undoStack=[];redoStack=[];refreshUndoBtns();save();refreshAll()};
      b.appendChild(del);
    }
    nav.appendChild(b);
  });
}
function escapeHtml(s){return String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]))}
$('addLevelBtn').onclick=()=>{store.levels.push(blankLevel());store.current=store.levels.length-1;level=store.levels[store.current];selection=null;undoStack=[];redoStack=[];refreshUndoBtns();save();refreshAll();toast('已新建空白关卡，先放置终点与资源吧')};
$('undoBtn').onclick=doUndo;$('redoBtn').onclick=doRedo;$('resetBtn').onclick=()=>{if(!confirm('确认重置？\n\n将清掉当前所有自定义关卡并恢复为 4 个内置模板（启程 / 救援 / 战斗 / 归乡）。'))return;localStorage.removeItem(STORAGE_KEY);localStorage.removeItem('blockPlanetGameDays');store.levels=TEMPLATES.map(toInternal);store.current=0;level=store.levels[0];selection=null;undoStack=[];redoStack=[];save();refreshAll();toast('已重置为内置 4 关模板')};
function refreshAll(){
  refreshTabs();refreshProps();refreshValidation();refreshUndoBtns();render();
}

/* ================= 导入 / 导出 ================= */
let exportMode='json';
$('exportBtn').onclick=()=>{openExport()};
$('importBtn').onclick=()=>{$('importModal').classList.remove('hidden')};
$('importCloseBtn').onclick=()=>{$('importModal').classList.add('hidden')};
$('importConfirmBtn').onclick=()=>{
  try{
    const obj=JSON.parse($('importArea').value);
    if(!obj||typeof obj!=='object'||!Array.isArray(obj.nodes))throw 0;
    const l=toInternal(obj);
    store.levels.push(l);store.current=store.levels.length-1;level=l;
    save();refreshAll();$('importModal').classList.add('hidden');$('importArea').value='';
    toast('导入成功');
  }catch{toast('JSON 解析失败，请粘贴本编辑器导出的完整 JSON')}
};
document.querySelectorAll('#exportMode button').forEach(b=>b.onclick=()=>{
  exportMode=b.dataset.mode;
  document.querySelectorAll('#exportMode button').forEach(x=>x.classList.toggle('on',x===b));
  fillExport();
});
function openExport(){exportMode='json';document.querySelectorAll('#exportMode button').forEach(x=>x.classList.toggle('on',x.dataset.mode==='json'));fillExport();$('exportModal').classList.remove('hidden')}
$('exportCloseBtn').onclick=()=>{$('exportModal').classList.add('hidden')};
function fillExport(){
  if(exportMode==='json'){
    $('exportArea').value=JSON.stringify(serializeLevel(level),null,2);
    $('exportNote').textContent='完整数据（含 NPC 与麦田）。可保存备份、在其他设备导入本编辑器继续编辑。';
  }else if(exportMode==='all-days'){
    $('exportArea').value=daysArraySnippet(store.levels);
    $('exportNote').textContent='\u2B50 \u4E00\u6B21\u5BFC\u51FA\u5168\u90E8 '+store.levels.length+' \u5173\u7684\u6574\u4F53 DAYS \u6570\u7EC4\uFF1A\u590D\u5236\u540E\u6574\u4F53\u66FF\u6362 game.js \u4E2D const DAYS=[...] \u7684\u5185\u5BB9\uFF08\u624B\u52A8\u5BFC\u51FA\u6A21\u5F0F\uFF0C\u4E0D\u518D\u81EA\u52A8\u540C\u6B65\uFF09';
  }else{
    $('exportArea').value=daysSnippet(level);
    $('exportNote').textContent='当前关卡的 DAYS 对象字面量：粘贴到 game.js 的 DAYS 数组中。注意：dirt（土块层）、goal（终点）与 stamina（体力点）是新字段，需要先在 game.js 中补充对应支持（地形高度查询、到达终点结算与体力计数）；游戏本体的水固定在第 5 列（x===5），若水面不在该列需将 isWater 改为查表；NPC 与麦田属于 resetEncounters() 硬编码部分，需按相同格式补充。';
  }
}
$('exportCopyBtn').onclick=()=>{
  const ta=$('exportArea');ta.select();
  try{navigator.clipboard?navigator.clipboard.writeText(ta.value):document.execCommand('copy')}catch{document.execCommand('copy')}
  toast('已复制到剪贴板');
};
$('exportDownloadBtn').onclick=()=>{
  const blob=new Blob([JSON.stringify(serializeLevel(level),null,2)],{type:'application/json'});
  const a=document.createElement('a');a.href=URL.createObjectURL(blob);
  a.download=`方块星球关卡-${level.name||'未命名'}.json`;a.click();URL.revokeObjectURL(a.href);
  toast('已下载 .json 文件');
};

/* ================= 试玩模式 ================= */
$('playBtn').onclick=()=>{if(!play)startPlay()};
$('playExitBtn').onclick=()=>finishPlay('主动结束',false);
$('prBackBtn').onclick=()=>{$('playResult').classList.add('hidden');stopPlay()};
$('playExitBtn').disabled=false;

function startPlay(){
  const errs=validate(level).filter(v=>v.level==='error');
  if(errs.length){toast('存在校验错误：'+errs[0].msg);return}
  const l=level;
  play={remaining:-1,stamina:l.stamina,bag:{wood:0,stone:0,ore:0,gem:0,fireOre:0,dirt:0,berry:0,iron:0,wheat:0,emerald:0,wool:0},
    shears:false,pick:false,axe:false,ironPick:false,bucket:false,waterBucket:false,sword:false,
    held:'hand',pending:null,bridges:new Set(),broken:new Set(),dug:new Set(),placed:new Map(),ladderBuilt:false,holeDug:false,
    player:{x:l.spawn[0],y:l.spawn[1],z:0},facing:[1,0],focus:null,walk:[],lastStep:0,time:0,blast:null,over:false,
    nodes:l.nodes.map(n=>({...n,taken:false})),
    actors:l.actors.map(a=>({...a,opened:false,sheared:false,regrowAt:0,grassReadyAt:0,fuse:0,nextMove:0,alive:true,happyUntil:0})),
    crops:l.crops.map(c=>({...c,readyAt:0})),
    _extinguished:new Set(),defeatedCreepers:[],trappedSaved:false,invited:false};
  selection=null;
  $('playHud').classList.remove('hidden');
  updateHud();render();
  if(l.mission)playSay(l.mission); // ★ 进入试玩时提示该关卡的任务描述
}
function stopPlay(){play=null;$('playHud').classList.add('hidden');render();refreshValidation()}
function finishPlay(reason,win){
  if(!play||play.over)return;play.over=true;play.walk=[];
  const w=win===true;
  if(w)SFX.win(); // ★ 改动 4：通关音效
  $('prTitle').textContent=w?'关卡完成！':'旅行结束';
  $('prTitle').style.color=w?'#7fe0ab':'#ffd166';
  const b=play.bag;
  $('prBody').innerHTML=`<p>${reason} · ${w?'已到达终点 ⚑':'未到达终点'}</p>
    <p>⚡ 体力剩余 ${play.stamina} / ${level.stamina} 点</p>
    <p>🪵 木材 ×${b.wood} · 🪨 石材 ×${b.stone} · 💎 蓝晶矿 ×${b.ore} · 🟫 土块 ×${b.dirt}</p>
    <p>${b.wheat?`🌾 小麦 ×${b.wheat} · `:''}${b.emerald?`💚 绿宝石 ×${b.emerald} · `:''}${b.wool?`▧ 羊毛 ×${b.wool}`:''}</p>
    <p class="dim small">试玩不修改关卡数据，返回后可继续编辑。</p>`;
  $('playResult').classList.remove('hidden');
}
function updateHud(){
  if(!play)return;
  // ★ 改动 3：取消关卡时间限制（remaining<0 显示无限）
  const r=Math.max(0,Math.ceil(play.remaining));
  $('phTimer').textContent=play.remaining<0?'\u23F1 \u221E':`\u23F1 ${String(Math.floor(r/60)).padStart(2,'0')}:${String(r%60).padStart(2,'0')}`;
  const st=$('phStamina');
  st.textContent=`⚡${play.stamina}`;
  st.title=`体力 ${play.stamina}/${level.stamina}（每次交互消耗 1 点，移动不消耗）`;
  st.classList.toggle('low',play.stamina<=3);
  const b=play.bag;
  // ★ 与正式关卡同步：显示全部合成材料（木材/石材/铁块/蓝晶/宝石/土块/果子/火晶）
  // ★ 改动 1/2：工具状态独立显示（石镐 / 铁镐 / 水桶空·满）
  $('phBag').textContent=`⛏${play.pick?'石镐':'—'} · ⛏${play.ironPick?'铁镐':'—'} · 🪣${play.waterBucket?'满水':play.bucket?'空桶':'—'} · 🪵${b.wood} · 🪨${b.stone} · ⛓${b.iron} · 💎${b.ore} · 💠${b.gem} · 🟫${b.dirt} · 🔥${b.fireOre} · 🌾${b.wheat} · 💚${b.emerald} · ▧${b.wool}`;
  refreshPHelt();
}
function playSay(msg){toast(msg)}
/* ---------- 试玩背包工具栏：选中工具/物资后点击目标 ---------- */
const PBELT=[
  {id:'hand',icon:'✋',name:'空手',hint:'点击村民/麦田/梯子/洞口/补给箱交互；徒手可采石块/果子（果子直接 +1 体力）'},
  {id:'shovel',icon:'🪏',name:'铲子',hint:'点击土块格挖土（土块 +1）'},
  {id:'axe',icon:'🪓',name:'斧头',hint:'点击树木砍伐（木材 +1）'},
  {id:'pick',icon:'⛏',name:'石镐',hint:'凿岩壁/挖洞/采铁块·蓝晶矿·火晶矿（合成：木材×1+石材×1）'},
  {id:'ironPick',icon:'⛏',name:'铁镐',hint:'开采宝石（合成：铁块×2+木材×1）'},
  {id:'bucket',icon:'🪣',name:'水桶',hint:'点水源盛水 → 点岩浆扑灭（合成：铁块×1+木材×1）'},
  {id:'sword',icon:'🗡',name:'宝剑',hint:'选中后点僵尸攻击，消耗 3 体力（合成：铁块×1+宝石×1）'},
  {id:'shears',icon:'✂',name:'剪刀',hint:'点击绵羊剪毛（羊毛 +2）'},
  {id:'wood',icon:'🪵',name:'木材',hint:'点击河面搭桥，或点击施工点建木梯'},
  {id:'stone',icon:'🪨',name:'石材',hint:'点击施工点建石阶'},
  {id:'ore',icon:'💎',name:'蓝晶矿',hint:'任务目标'},
  {id:'gem',icon:'💠',name:'宝石',hint:'任务目标（需铁镐）'},
  {id:'dirt',icon:'<i class="dirt-icon"></i>',name:'土块',hint:'点击相邻地面放置土块'},
  {id:'iron',icon:'⛓',name:'铁块',hint:'消耗/显示资源'}
];
$('phBelt').innerHTML=PBELT.map((s,i)=>`<button type="button" class="tb-slot${s.id==='ironPick'?' iron':''}" data-slot="${s.id}" title="${s.name}：${s.hint}"><i>${s.icon}</i><b data-b="${s.id}"></b><small>${i+1}</small></button>`).join('')+
  // ★ 改动 2：5 个合成按钮（按图片配方）
  `<button type="button" class="tb-slot tb-craft" data-slot="__craft_axe" title="合成斧头：土块×1+石材×1"><i>🪓</i><small>1</small></button>`+
  `<button type="button" class="tb-slot tb-craft" data-slot="__craft_pick" title="合成石镐：木材×1+石材×1"><i>⚒</i><small>2</small></button>`+
  `<button type="button" class="tb-slot tb-craft" data-slot="__craft_ironPick" title="合成铁镐：铁块×2+木材×1"><i>⛏</i><small>3</small></button>`+
  `<button type="button" class="tb-slot tb-craft" data-slot="__craft_bucket" title="合成水桶：铁块×1+木材×1"><i>🪣</i><small>4</small></button>`+
  `<button type="button" class="tb-slot tb-craft" data-slot="__craft_sword" title="合成宝剑：铁块×1+宝石×1"><i>🗡</i><small>5</small></button>`;
// ★ 合成按钮文字标签（用 \u 转义避免源码中文编码问题）
const CRAFT_LABEL={__craft_pick:'\u77F3\u9550',__craft_axe:'\u91DC\u5934',__craft_bucket:'\u6C34\u6876',__craft_sword:'\u5B9D\u5251',__craft_ironPick:'\u94C1\u9550'};
for(const [slot,label] of Object.entries(CRAFT_LABEL)){
  const btn=$('phBelt').querySelector(`[data-slot="${slot}"]`);if(!btn)continue;
  btn.querySelector('small')?.remove();
  const lb=document.createElement('b');lb.textContent=label;btn.appendChild(lb);
  btn.title='\u5DE6\u952E\u5408\u6210\uFF08\u6D88\u8017\u6750\u6599\uFF09 \u00B7 \u53F3\u952E\u76F4\u63A5\u83B7\u53D6';
}
// ★ 试玩帮助文案更新（右侧为合成按钮，支持右键直接获取工具）
{const h=document.querySelector('.ph-help');if(h)h.textContent='\u70B9\u51FB\u80CC\u5305\u680F\u9009\u62E9\u5DE5\u5177 (1-9) \u2192 \u70B9\u5730\u56FE\u76EE\u6807\u81EA\u52A8\u8D70\u8FD1 \u00B7 \u53F3\u4FA7\u865A\u7EBF\u6309\u94AE=\u5408\u6210\uFF08\u53F3\u952E=\u76F4\u63A5\u83B7\u53D6\uFF09 \u00B7 \u5DE5\u5177\u69FD\u53F3\u952E\u4E5F\u53EF\u76F4\u63A5\u83B7\u53D6 \u00B7 \u91C7\u96C6\u6D88\u8017 1 \u4F53\u529B \u00B7 \u4E0D\u53EF\u884C\u8D70\u4E8E\u571F\u5757/\u9AD8\u53F0\u8868\u9762 \u00B7 \u5230\u8FBE\u7EC8\u70B9\u901A\u5173 \u00B7 Esc \u7ED3\u675F'}
$('phBelt').querySelectorAll('.tb-slot').forEach(b=>b.addEventListener('click',()=>{
  if(!play||play.over)return;
  const s=b.dataset.slot;
  if(s==='__craft_pick'){craftPick();return}
  if(s==='__craft_axe'){craftAxe();return}
  if(s==='__craft_bucket'){craftBucket();return}
  if(s==='__craft_sword'){craftSword();return}
  if(s==='__craft_ironPick'){craftIronPick();return}
  setPHeld(s);
}));
function setPHeld(id){
  if(!play||play.over)return;const s=PBELT.find(p=>p.id===id);if(!s)return;
  if(id==='shears'&&!play.shears){playSay('剪刀还没找到：先点击补给箱');return}
  /* ★ 改动 1：工具槽位需先合成（编辑器可右键直接获取） */
  if(id==='pick'&&!play.pick){playSay('还没有石镐：先合成（木材×1+石材×1）或右键对应工具直接获取');return}
  if(id==='ironPick'&&!play.ironPick){playSay('还没有铁镐：先合成（铁块×2+木材×1）或右键对应工具直接获取');return}
  if(id==='bucket'&&!play.bucket){playSay('还没有水桶：先合成（铁块×1+木材×1）或右键对应工具直接获取');return}
  if(id==='sword'&&!play.sword){playSay('还没有宝剑：先合成（铁块×1+宝石×1）或右键对应工具直接获取');return}
  SFX.pick();play.held=id;play.pending=null;play.walk=[];
  playSay(`已选「${s.name}」：${s.hint}`);updateHud();render();
}
function refreshPHelt(){
  for(const s of PBELT){
    const el=$('phBelt').querySelector(`[data-slot="${s.id}"]`);if(!el)continue;
    el.classList.toggle('sel',play.held===s.id);
    if(s.id==='shears')el.classList.toggle('hidden',!play.shears);
    if(s.id==='pick')el.classList.toggle('up',play.pick);
    if(s.id==='ironPick')el.classList.toggle('up',play.ironPick);
    if(s.id==='bucket'){el.classList.toggle('up',play.bucket);el.classList.toggle('full',play.waterBucket)}
    if(s.id==='axe')el.classList.toggle('up',play.axe);
    if(s.id==='sword')el.classList.toggle('up',play.sword);
    // ★ 工具槽位显示「是否拥有」（✓）；资源槽位显示数量
    const fn={pick:()=>play.pick,ironPick:()=>play.ironPick,bucket:()=>play.bucket,sword:()=>play.sword,axe:()=>play.axe,shears:()=>play.shears}[s.id];
    if(fn){const ok=!!fn();el.querySelector('b').textContent=ok?'✓':'';el.classList.toggle('no',!ok)}
    else{const cnt={wood:play.bag.wood,stone:play.bag.stone,ore:play.bag.ore,gem:play.bag.gem,dirt:play.bag.dirt,iron:play.bag.iron}[s.id];el.querySelector('b').textContent=cnt!==undefined?String(cnt):''}
  }
  // ★ 合成按钮状态：已合成 → 绿框淡显（不禁用，便于右键直接获取其它工具）
  const crafted={__craft_pick:play.pick,__craft_axe:play.axe,__craft_bucket:play.bucket,__craft_sword:play.sword,__craft_ironPick:play.ironPick};
  for(const [slot,ok] of Object.entries(crafted)){
    const btn=$('phBelt').querySelector(`[data-slot="${slot}"]`);if(!btn)continue;
    btn.classList.toggle('done',!!ok);
  }
}
/* ★ 需求 1：编辑器试玩可直接获取所需工具（右键，不消耗材料，便于关卡调试） */
function grantToolName(tool){
  return {pick:'\u77F3\u9550',axe:'\u91DC\u5934',bucket:'\u6C34\u6876',sword:'\u5B9D\u5251',ironPick:'\u94C1\u9550',shears:'\u526A\u5200'}[tool]||tool;
}
function grantTool(tool){
  if(!play||play.over||!tool)return;
  if(play[tool]){playSay('\u5DF2\u62E5\u6709\uFF1A'+grantToolName(tool));return}
  play[tool]=true;SFX.craft();
  playSay('\u3010\u8C03\u8BD5\u3011\u76F4\u63A5\u83B7\u5F97\uFF1A'+grantToolName(tool));
  refreshPHelt();updateHud();render();
}
{ // 合成按钮 + 工具槽 右键 = 直接获取
  const CRAFT_TOOL={__craft_pick:'pick',__craft_axe:'axe',__craft_bucket:'bucket',__craft_sword:'sword',__craft_ironPick:'ironPick'};
  $('phBelt').querySelectorAll('.tb-slot').forEach(btn=>{
    btn.addEventListener('contextmenu',ev=>{
      ev.preventDefault();if(!play||play.over)return;
      const id=btn.dataset.slot;
      if(CRAFT_TOOL[id]){grantTool(CRAFT_TOOL[id]);return}
      if(id==='axe'||id==='pick'||id==='shears')grantTool(id);
    });
  });
}

/* ---------- 试玩规则（复刻 game.js） ---------- */
function pBase(x,y){return terrainZ(level,x,y)}
function pTerrain(x,y){ // 试玩有效高度：含挖取（土块 1→0）与放置（+1）
  let z=pBase(x,y);const k=key(x,y);
  if(z===1&&play.dug.has(k))z=0;
  if(z>=0&&play.placed.has(k))z=Math.min(2,z+1);
  return z;
}
function pWater(x,y){return isWaterAt(level,x,y)}
function pRock(x,y,z){return rockAt(level,x,y,z)&&!play.broken.has(key(x,y)+','+z)}
function pNode(x,y,z){return play.nodes.find(n=>!n.taken&&n.x===x&&n.y===y&&n.z===z)}
function pActor(x,y,z){return play.actors.find(a=>a.alive!==false&&a.x===x&&a.y===y&&a.z===z)}
function pCrop(x,y){return play.crops.find(c=>c.x===x&&c.y===y)}
// ★ 改动 2：试玩辅助：岩浆/水源/僵尸判定
function pLava(x,y){return level.lava&&level.lava.some(v=>v.x===x&&v.y===y)&&!(play&&play._extinguished&&play._extinguished.has(key(x,y)))}
function pWaterSource(x,y,z){return level.waterSource&&level.waterSource.some(v=>v.x===x&&v.y===y&&v.z===(z||0))}
function pZombie(x,y,z){return play.actors.find(a=>(a.type==='zombie_static'||a.type==='creeper_static')&&a.x===x&&a.y===y&&a.z===z&&!(play.defeatedCreepers||[]).includes(key(x,y)))}
function pStand(x,y,z){
  if(!inb(x,y)||pTerrain(x,y)!==z)return false;
  // ★ 需求 2：土块(z=1)/高台(z=2) 表面不可行走（梯子/洞口格除外，用于上下层）
  if(z>=1&&!(level.ladder&&level.ladder.x===x&&level.ladder.y===y)&&!(level.hole&&level.hole.x===x&&level.hole.y===y))return false;
  if(z===0&&pWater(x,y)&&!play.bridges.has(key(x,y)))return false;
  if(z===0&&pLava(x,y))return false; // ★ 改动 3：岩浆不可直接走过（被水扑灭后 pLava 返回 false，地块恢复通行）
  if(pRock(x,y,z)||pNode(x,y,z)||pActor(x,y,z)||pCrop(x,y))return false;
  if(z===0&&level.hole&&level.hole.x===x&&level.hole.y===y)return false;
  return true;
}
function pStep(x,y,nx,ny){const f=pTerrain(x,y),t=pTerrain(nx,ny);return t!==null&&Math.abs(t-f)<=1&&pStand(nx,ny,t)}
function pDiggable(x,y){ // 可挖取的土块格（基础高度 1、无占用）
  const k=key(x,y);
  if(isRockSoilAt(level,x,y))return false; // ★ 岩土块：无法被任何方式挖掘
  return pBase(x,y)===1&&!play.dug.has(k)&&!play.placed.has(k)&&
    !pNode(x,y,1)&&!pRock(x,y,1)&&!pActor(x,y,1)&&!pCrop(x,y)&&
    !(level.goal&&level.goal.x===x&&level.goal.y===y);
}
function pSpecial(x,y){
  const z=pTerrain(x,y);
  return !!pNode(x,y,z)||(pWater(x,y)&&!play.bridges.has(key(x,y)))||!!pRock(x,y,z)||
    (level.ladder&&level.ladder.x===x&&level.ladder.y===y)||(level.hole&&level.hole.x===x&&level.hole.y===y)||
    !!pActor(x,y,z)||!!pCrop(x,y)||pDiggable(x,y);
}
function pPathTo(tx,ty){
  if(!inb(tx,ty))return null;
  const start=key(play.player.x,play.player.y),q=[[play.player.x,play.player.y]],prev=new Map([[start,null]]);
  for(let i=0;i<q.length;i++){
    const [x,y]=q[i],k=key(x,y);
    if(x===tx&&y===ty){const out=[];let cur=k;while(cur!==start){const [a,b]=cur.split(',').map(Number);out.unshift({x:a,y:b,z:pTerrain(a,b)});cur=prev.get(cur)}return out}
    for(const [dx,dy] of [[1,0],[0,1],[-1,0],[0,-1]]){
      const nx=x+dx,ny=y+dy,nk=key(nx,ny);
      if(!prev.has(nk)&&pStep(x,y,nx,ny)){prev.set(nk,k);q.push([nx,ny])}
    }
  }
  return null;
}
function pPathNear(x,y){
  const opts=[];
  for(const [dx,dy] of [[1,0],[0,1],[-1,0],[0,-1]]){
    const nx=x+dx,ny=y+dy;
    if(nx===play.player.x&&ny===play.player.y)return [];
    const p=pPathTo(nx,ny);if(p)opts.push(p);
  }
  opts.sort((a,b)=>a.length-b.length);return opts[0]||null;
}
function pBeltTarget(x,y){return pSpecial(x,y)||play.held==='dirt'}
function playClickTile(x,y){
  if(!play||play.over)return;
  play.focus={x,y};
  if(pBeltTarget(x,y)){
    if(pAdjacent8(x,y)||(play.player.x===x&&play.player.y===y)){play.walk=[];playActAt(x,y);return}
    const p=pPathNear(x,y);if(p===null){playSay('无法靠近');return}
    play.walk=p;play.pending={x,y};
  }else{
    play.pending=null;
    const p=pPathTo(x,y);if(p)play.walk=p;else playSay('无法到达');
  }
  render();
}
function pAdjacent8(x,y){return Math.max(Math.abs(play.player.x-x),Math.abs(play.player.y-y))===1} // ★ 改动 2：九宫格（含斜角）
function pCandidates(){ // ★ 改动 2：九宫格内所有可交互格
  const out=[];
  for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){
    if(!dx&&!dy)continue;
    const x=play.player.x+dx,y=play.player.y+dy;
    if(inb(x,y)&&pSpecial(x,y))out.push({x,y});
  }
  if((level.ladder&&play.player.x===level.ladder.x&&play.player.y===level.ladder.y)||(level.hole&&play.player.x===level.hole.x&&play.player.y===level.hole.y))out.push({x:play.player.x,y:play.player.y});
  return out;
}
function trySpend(n){ // 交互消耗体力（默认 1 点）；移动不消耗
  const need=n||1;
  if(play.stamina<need){SFX.noStamina();playSay(`体力不足！该操作需要 ${need} 点体力（当前 ${play.stamina} 点）`);return false}
  play.stamina-=need;return true;
}
function pCandidate(){
  if(play.focus&&pAdjacent8(play.focus.x,play.focus.y))return play.focus;
  if(level.ladder&&play.player.x===level.ladder.x&&play.player.y===level.ladder.y)return{x:play.player.x,y:play.player.y};
  if(level.hole&&play.player.x===level.hole.x&&play.player.y===level.hole.y)return{x:play.player.x,y:play.player.y};
  const x=play.player.x+play.facing[0],y=play.player.y+play.facing[1];
  if(inb(x,y)&&pSpecial(x,y))return{x,y};
  for(const [dx,dy] of [[1,0],[0,-1],[-1,0],[0,1],[1,1],[1,-1],[-1,1],[-1,-1]]){
    const nx=play.player.x+dx,ny=play.player.y+dy;
    if(inb(nx,ny)&&pSpecial(nx,ny))return{x:nx,y:ny};
  }
  return null;
}
function playInteract(){
  if(!play||play.over)return;
  const c=pCandidate();if(!c){playSay('先靠近目标，或直接点击目标自动走近');return}
  playActAt(c.x,c.y);
}
function playActAt(x,y){ // 点击目标后执行：按当前选中工具/物资判定
  if(!play||play.over||!inb(x,y))return;
  play.pending=null;
  const k=key(x,y),z=pTerrain(x,y);
  const a=pActor(x,y,play.player.z);
  if(a&&pAdjacent8(x,y)){interactActor(a);return}
  const crop=pCrop(x,y);
  if(crop&&pAdjacent8(x,y)&&z===play.player.z){
    if(play.time<crop.readyAt){playSay('小麦未成熟');return}
    if(!trySpend())return;
    play.bag.wheat+=3;crop.readyAt=play.time+20;playSay('小麦 +3');updateHud();render();return;
  }
  const n=pNode(x,y,z);
  if(n&&n.z===play.player.z){
    // ★ 改动 2：按图片重构资源采集规则
    //   木材=斧头；石块=徒手；果子=徒手+1体力；铁块/蓝晶/火晶=石镐子；宝石=铁镐子
    const need = n.type==='wood'?'axe'
              : (n.type==='stone'||n.type==='berry')?'hand'
              : (n.type==='iron'||n.type==='ore'||n.type==='fire_ore')?'pick'
              : n.type==='gem'?'ironPick':'pick';
    if(need==='ironPick'&&!play.ironPick){playSay('开采宝石：需要「铁镐子」（铁块 ×3 合成）');return}
    if(need==='pick'&&!play.pick){playSay('开采'+NODE_NAME[n.type]+'：需要「石镐子」（木材 ×1 + 石材 ×1 合成）');return}
    if(need==='axe'&&!play.axe){playSay('砍伐木材：需要「斧头」（土块 ×1 + 石材 ×1 合成）');return}
    if(n.type!=='berry'&&!trySpend())return; // ★ 果子不消耗体力；其它采集消耗 1 体力
    SFX[n.type==='wood'?'chop':(n.type==='gem'?'gem':(n.type==='berry'?'berry':'mine'))](); // ★ 改动 4：采集音效
    n.taken=true;
    if(n.type==='berry'){
      // ★ 果子：不消耗体力、直接补回 1 体力、不进入背包
      play.stamina=Math.min(99,play.stamina+1);
      playSay('\u679C\u5B50\uFF1A\u4F53\u529B +1');
    } else if(n.type==='iron'){
      play.bag.iron=(play.bag.iron||0)+1;
      playSay('⛓ 铁块 +1');
    } else {
      play.bag[n.type]=(play.bag[n.type]||0)+1;
      playSay(NODE_NAME[n.type]+' +1');
    }
    play.focus=null;updateHud();render();return;
  }
  if(pWater(x,y)&&play.player.z===0&&!play.bridges.has(k)){
    if(play.held!=='wood'){playSay('搭桥：先在背包栏选中「木材」再点击河面');return}
    if(play.bag.wood<2){playSay('搭桥需要木材 ×2。');return}
    if(!trySpend())return;
    SFX.build();play.bag.wood-=2;play.bridges.add(k);playSay('木桥已搭好');play.focus=null;updateHud();render();return;
  }
  // ★ 改动 2：试玩新增交互 — 岩浆灭火 / 水源装水 / 击退僵尸
  if(pLava(x,y)&&pAdjacent8(x,y)&&play.player.z===0){
    if(!play.waterBucket){playSay('扑灭岩浆：先合成「水桶」并在水源盛水');return}
    if(!trySpend())return;
    play._extinguished.add(k);play.waterBucket=false;playSay('💧 岩浆已扑灭，此地块恢复通行；水桶已空（需重新到水源盛水）');play.focus=null;updateHud();render();return;
  }
  if(pWaterSource(x,y,play.player.z)&&pAdjacent8(x,y)){
    if(!play.bucket){playSay('盛水：先合成「水桶」（铁块×1+木材×1）');return}
    if(play.waterBucket){playSay('水桶已是满水状态，先去扑灭岩浆');return}
    if(!trySpend())return;
    SFX.berry();play.waterBucket=true;playSay('💧 水桶已装满水（可扑灭 1 块岩浆）');play.focus=null;updateHud();render();return;
  }
  const zom=pZombie(x,y,play.player.z);
  if(zom&&pAdjacent8(x,y)){
    if(!play.sword){playSay('击退僵尸：先合成「宝剑」（铁块×1+宝石×1）');return}
    if(play.held!=='sword'){playSay('请先在背包栏选中「宝剑」槽位，再攻击僵尸');return}
    if(!trySpend(3))return; // ★ 消耗 3 体力；不足则判定失败
    SFX.hit();play.defeatedCreepers.push(key(x,y));play.bag.fireOre=(play.bag.fireOre||0)+1;
    playSay('⚔ 宝剑挥出！僵尸倒下，获得火晶矿 ×1');play.focus=null;updateHud();render();return;
  }
  if(play.held==='dirt'&&pAdjacent8(x,y)){playPlaceDirtAt(x,y);return}
  if(pDiggable(x,y)&&pAdjacent8(x,y)){
    if(play.held!=='shovel'){playSay('挖土：先在背包栏选中「铲子」再点击土块格');return}
    if(!trySpend())return;
    SFX.mine();play.dug.add(k);play.bag.dirt++;playSay('挖取土块 +1（选中「土块」后点击地面放置）');play.focus=null;updateHud();render();return;
  }
  if(level.ladder&&level.ladder.x===x&&level.ladder.y===y){
    if(play.player.z===2&&play.player.x===x&&play.player.y===y){
      const nx=x-1,ny=y;
      if(pStand(nx,ny,0)){if(!trySpend())return;play.player={x:nx,y:ny,z:0};playSay('回到地面')}else playSay('梯子出口被挡住了。');
      updateHud();render();return;
    }
    if(play.player.z===0&&pAdjacent8(x,y)){
      if(!play.ladderBuilt){
        const t=play.held==='stone'?'stone':'wood';
        if(play.bag[t]<2){playSay((t==='wood'?'木梯需要木材':'石阶需要石材')+' ×2。');return}
        if(!trySpend())return;
        play.bag[t]-=2;play.ladderBuilt=true;playSay('梯子搭好了！点击梯子即可登高。');updateHud();render();return;
      }
      if(!trySpend())return;
      play.player={x,y,z:2};play.focus=null;playSay('到达高台');updateHud();render();return;
    }
  }
  if(level.hole&&level.hole.x===x&&level.hole.y===y){
    if(play.player.z===-2&&play.player.x===x&&play.player.y===y){
      if(!trySpend())return;
      play.player={x:x-1,y,z:0};playSay('回到地表');updateHud();render();return;
    }
    if(play.player.z===0&&pAdjacent8(x,y)){
      if(play.held!=='pick'){playSay('挖洞：先在背包栏选中「镐子」');return}
      if(!play.pick){playSay('需要石镐');return}
      if(!play.holeDug){if(!trySpend())return;play.holeDug=true;playSay('挖出入口！点击洞口即可下到矿层。');render();return}
      if(!trySpend())return;
      play.player={x,y,z:-2};play.focus=null;playSay('进入矿洞');updateHud();render();return;
    }
  }
  if(pRock(x,y,play.player.z)){
    if(play.held!=='pick'){playSay('凿岩壁：先在背包栏选中「镐子」');return}
    if(!play.pick){playSay('岩壁需要石镐。');return}
    if(!trySpend())return;
    SFX.mine();play.broken.add(key(x,y)+','+play.player.z);play.bag.stone++;playSay('凿开岩壁：石材 +1');play.focus=null;updateHud();render();return;
  }
  playSay('高度不够');
}
function interactActor(a){
  if(a.type==='farmer'){
    if(play.bag.wheat>=3){if(!trySpend())return;play.bag.wheat-=3;play.bag.emerald++;a.happyUntil=play.time+1.4;playSay('交易完成：绿宝石 +1')}
    else playSay('「嗯哼！」农民村民：3 份小麦换 1 颗绿宝石。');
    updateHud();render();return;
  }
  if(a.type==='chest'){
    if(a.opened){playSay('箱子已空');return}
    if(!trySpend())return;
    a.opened=true;play.shears=true;playSay('获得剪刀');updateHud();render();return;
  }
  if(a.type==='sheep'){
    if(!play.shears){playSay('绵羊：咩～ 先去找补给箱拿剪刀。');return}
    if(a.sheared){playSay('羊毛还没长好，等它吃草后再来。');return}
    if(!trySpend())return;
    a.sheared=true;a.regrowAt=Math.max(play.time+12,a.grassReadyAt);play.bag.wool+=2;playSay('羊毛 +2');updateHud();render();return;
  }
  if(a.type==='trapped_farmer'){ // ★ 与正式关卡同步：被困村民
    if(!play.trappedSaved){playSay('\u6751\u6C11\uFF1A\u6551\u6211\uFF01\u6211\u88AB\u5CA9\u6D46\u56F4\u4F4F\u4E86\uFF01\u5148\u628A\u5468\u56F4\u7684\u5CA9\u6D46\u6251\u706D\u5427\u3002');return}
    if(!play.invited){
      play.invited=true;play.bag.fireOre=(play.bag.fireOre||0)+1;
      playSay('\u9080\u8BF7\u6210\u529F\uFF01\u6751\u6C11\u8D60\u4F60 1 \u9897\u706B\u6676\u77FF\u3002');
    }else playSay('\u6751\u6C11\uFF1A\u592A\u68D2\u4E86\uFF01\u6B22\u8FCE\u6211\u52A0\u5165\u4F60\u4EEC\u7684\u661F\u7403\u3002');
    updateHud();render();return;
  }
  if(a.type==='creeper')playSay('苦力怕不会交易！留意闪白，及时退开。');
}
function playMove(dx,dy){
  if(!play||play.over)return;
  play.walk=[];play.facing=[dx,dy];play.focus=null;
  const x=play.player.x+dx,y=play.player.y+dy;
  if(pStep(play.player.x,play.player.y,x,y)){SFX.step();play.player={x,y,z:pTerrain(x,y)}}
  checkGoal();
  updateHud();render();
}
function craftPick(){
  if(!play||play.pick||play.bag.wood<1||play.bag.stone<1)return;
  if(!trySpend())return;
  play.bag.wood--;play.bag.stone--;play.pick=true;SFX.craft();playSay('获得石镐');updateHud();render();
}
// ★ 改动 2：试玩模式全套合成（按图片配方）
function craftAxe(){
  if(!play||play.axe||play.bag.dirt<1||play.bag.stone<1)return;
  if(!trySpend())return;
  play.bag.dirt--;play.bag.stone--;play.axe=true;SFX.craft();playSay('获得斧头（土块×1+石材×1）');updateHud();render();
}
function craftBucket(){
  if(!play||play.bucket||play.bag.iron<1||play.bag.wood<1)return;
  if(!trySpend())return;
  play.bag.iron--;play.bag.wood--;play.bucket=true;SFX.craft();playSay('获得水桶（铁块×1+木材×1）');updateHud();render();
}
function craftSword(){
  if(!play||play.sword||play.bag.gem<1||play.bag.iron<1)return;
  if(!trySpend())return;
  play.bag.gem--;play.bag.iron--;play.sword=true;SFX.craft();playSay('获得宝剑（铁块×1+宝石×1）');updateHud();render();
}
function craftIronPick(){
  if(!play||play.ironPick||play.bag.iron<2||play.bag.wood<1)return;
  if(!trySpend())return;
  play.bag.iron-=2;play.bag.wood--;play.ironPick=true;SFX.craft();playSay('获得铁镐（铁块×2+木材×1）');updateHud();render();
}
function playPlaceDirtAt(x,y){ // 选中「土块」后点击相邻地面放置（高度 +1，形成台阶）
  if(!play||play.over)return;
  if(!inb(x,y)){playSay('点击要放置的格子');return}
  if(play.bag.dirt<1){playSay('没有土块：选中「铲子」点击土块格挖取');return}
  const k=key(x,y),b=pBase(x,y);
  if(b<0||b>=2){playSay('此处不能放置土块');return}
  if(play.placed.has(k)){playSay('该格已放置过土块');return}
  if(b===0&&pWater(x,y)&&!play.bridges.has(k)){playSay('水面要用木材搭桥，不能填土');return}
  if(pNode(x,y,b)||pRock(x,y,b)||pActor(x,y,b)||pCrop(x,y)){playSay('该格被占用');return}
  if(level.ladder&&level.ladder.x===x&&level.ladder.y===y){playSay('梯子格不能放土');return}
  if(level.hole&&level.hole.x===x&&level.hole.y===y){playSay('洞口格不能放土');return}
  if(level.goal&&level.goal.x===x&&level.goal.y===y){playSay('终点格不能放土');return}
  if(level.spawn[0]===x&&level.spawn[1]===y&&b===0){playSay('降落点格不能放土');return}
  if(!trySpend())return;
  play.placed.set(k,1);play.bag.dirt--;
  playSay('放置土块（形成台阶）');updateHud();render();
}
function checkGoal(){ // 玩家站上终点格即通关
  if(!play||play.over||!level.goal)return;
  if(play.player.x===level.goal.x&&play.player.y===level.goal.y&&
     play.player.z===pTerrain(level.goal.x,level.goal.y)){
    finishPlay('到达终点',true);
  }
}
function updatePlayEncounters(dt){
  play.time+=dt;
  let changed=false;
  for(const a of play.actors){
    if(a.type==='sheep'&&a.sheared&&play.time>=a.regrowAt){a.sheared=false;a.grassReadyAt=play.time+18;changed=true;playSay('羊毛已长好')}
    // ★ 与正式关卡同步：被困村民 —— 周围岩浆全部扑灭后自动救出，变为可邀请的村民
    if(a.type==='trapped_farmer'&&!play.trappedSaved){
      const allOut=(level.lava||[]).every(p=>play._extinguished.has(key(p.x,p.y)));
      if(allOut){play.trappedSaved=true;a.type='farmer';changed=true;playSay('\u6751\u6C11\u5DF2\u8D70\u51FA\u5CA9\u6D46\uFF0C\u5411\u4F60\u9053\u8C22\u3002')}
    }
    if(a.type!=='creeper'||a.alive===false)continue;
    const dist=play.player.z===a.z?Math.abs(play.player.x-a.x)+Math.abs(play.player.y-a.y):Infinity;
    if(dist<=1){
      if(a.fuse===0){play.walk=[];playSay('嘶——苦力怕正在蓄爆！立刻退开！')}
      a.fuse+=dt;
      if(a.fuse>=1.5){
        a.alive=false;play.blast={x:a.x,y:a.y,z:a.z,until:play.time+.65};
        let cleared=0;
        for(const r of level.rocks){
          if((r.x-a.x)**2+(r.y-a.y)**2<=2.56&&!play.broken.has(key(r.x,r.y)+','+r.z)){play.broken.add(key(r.x,r.y)+','+r.z);play.bag.stone++;cleared++}
        }
        const hitP=play.player.z===a.z&&(play.player.x-a.x)**2+(play.player.y-a.y)**2<=2.56;
        if(hitP){
          const back=level.hole||{x:level.spawn[0],y:level.spawn[1]};
          play.player={x:back.x,y:back.y,z:pTerrain(back.x,back.y)};
          play.focus=null;play.walk=[];playSay('\u7206\u70B8\uFF01\u4F60\u88AB\u9707\u56DE\u4E86\u964D\u843D\u70B9');
        }else playSay(cleared?'岩壁被炸开':'成功躲过爆炸');
        changed=true;
      }
    }else{
      if(a.fuse>0){a.fuse=0;playSay('已脱离危险')}
      if(dist<=4&&play.time>=a.nextMove){
        a.nextMove=play.time+.8;
        const opts=[[1,0],[-1,0],[0,1],[0,-1]].map(([dx,dy])=>({x:a.x+dx,y:a.y+dy}))
          .filter(p=>pStand(p.x,p.y,a.z)&&!(p.x===play.player.x&&p.y===play.player.y));
        opts.sort((p,q)=>(Math.abs(p.x-play.player.x)+Math.abs(p.y-play.player.y))-(Math.abs(q.x-play.player.x)+Math.abs(q.y-play.player.y)));
        if(opts[0]&&Math.abs(opts[0].x-play.player.x)+Math.abs(opts[0].y-play.player.y)<dist){a.x=opts[0].x;a.y=opts[0].y;changed=true}
      }
    }
  }
  if(changed)updateHud();
  if(play.blast&&play.time>=play.blast.until)play.blast=null;
}

/* ---------- 主循环 ---------- */
let lastFrame=null,toastHandle=null,hudHandle=null;
function toast(msg){
  if(!msg)return;const t=$('toast');t.textContent=msg;t.classList.add('show');
  clearTimeout(toastHandle);toastHandle=setTimeout(()=>t.classList.remove('show'),1800);
}
function animate(t){
  if(play&&!play.over){
    const dt=lastFrame===null?0:Math.min(.1,(t-lastFrame)/1000);
    updatePlayEncounters(dt);
    if(play.remaining>=0)play.remaining-=dt; // ★ 改动 3：取消关卡时间限制
    if(!hudHandle||t-hudHandle>500){hudHandle=t;updateHud()}
    if(play.remaining>=0&&play.remaining<=0){play.remaining=0;finishPlay('时间到，自动返程',false)}
    if(play.walk.length&&t-play.lastStep>165){
      play.lastStep=t;
      const step=play.walk.shift();
      if(pStep(play.player.x,play.player.y,step.x,step.y)){
        play.facing=[step.x-play.player.x,step.y-play.player.y];
        play.player={x:step.x,y:step.y,z:pTerrain(step.x,step.y)};
        checkGoal();
      }else{play.walk=[];playSay('道路被挡住了')}
    }
    if(play.pending&&(pAdjacent8(play.pending.x,play.pending.y)||(play.player.x===play.pending.x&&play.player.y===play.pending.y))){
      const t2=play.pending;play.pending=null;play.walk=[];playActAt(t2.x,t2.y);
    }
    render();
  }
  lastFrame=t;
  requestAnimationFrame(animate);
}

/* ---------- 键盘 ---------- */
document.addEventListener('keydown',e=>{
  if(e.key==='Escape'){
    if(!$('exportModal').classList.contains('hidden')){$('exportModal').classList.add('hidden');return}
    if(!$('importModal').classList.contains('hidden')){$('importModal').classList.add('hidden');return}
    if(play&&!play.over){finishPlay('主动结束',false);return}
    e.preventDefault();return;
  }
  if((e.ctrlKey||e.metaKey)&&!play){
    if(e.key.toLowerCase()==='z'){e.preventDefault();e.shiftKey?doRedo():doUndo();return}
    if(e.key.toLowerCase()==='y'){e.preventDefault();doRedo();return}
  }
  if(play){
    if(play.over)return;
    const dirs={w:[0,-1],W:[0,-1],ArrowUp:[0,-1],a:[-1,0],A:[-1,0],ArrowLeft:[-1,0],s:[0,1],S:[0,1],ArrowDown:[0,1],d:[1,0],D:[1,0],ArrowRight:[1,0]};
    if(dirs[e.key]){e.preventDefault();playMove(...dirs[e.key])}
    else if(e.key==='e'||e.key==='E'||e.key===' '){e.preventDefault();playInteract()}
    else if(e.key>='1'&&e.key<='9'){const s=PBELT[+e.key-1];if(s)setPHeld(s.id)}
    // ★ 改动 2：5 个合成快捷键
    else if(e.key==='c'||e.key==='C'){e.preventDefault();craftPick()}
    else if(e.key==='x'||e.key==='X'){e.preventDefault();craftAxe()}
    else if(e.key==='b'||e.key==='B'){e.preventDefault();craftBucket()}
    else if(e.key==='z'||e.key==='Z'){e.preventDefault();craftSword()}
    else if(e.key==='p'||e.key==='P'){e.preventDefault();craftIronPick()}
    return;
  }
  if((e.key==='Delete'||e.key==='Backspace')&&selection&&document.activeElement.tagName!=='INPUT'&&document.activeElement.tagName!=='TEXTAREA'){
    e.preventDefault();const ref=selectionRef();if(ref){pushUndo();eraseAt(ref.x,ref.y)}
  }
});

/* ---------- 模态框背景点击关闭 ---------- */
for(const id of ['exportModal','importModal'])$(id).addEventListener('click',e=>{if(e.target===$(id))$(id).classList.add('hidden')});

/* ---------- 启动 ---------- */
load();
level=store.levels[store.current]||blankLevel();
window.addEventListener('resize',resize);
refreshAll();
resize();
requestAnimationFrame(animate);
})();

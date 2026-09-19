(()=>{
  'use strict';
  // 错误显示：让任何 JS 错误立刻出现在屏幕上（便于排查）
  const _boot=document.getElementById('bootScreen');
  const _bootOK=()=>{if(_boot){_boot.classList.add('ok');_boot.innerHTML='<div style="font-size:48px">✦</div><div>已加载 v3 (4天版本)</div>';setTimeout(()=>_boot.classList.add('hidden'),400);setTimeout(()=>_boot?.remove(),1400)}};
  const _bootErr=(msg)=>{if(_boot){_boot.classList.add('err');_boot.innerHTML='<div style="font-size:36px">⚠</div><div>游戏脚本加载失败</div><pre>'+msg+'</pre><div class="hint">请按 <kbd>Ctrl+Shift+R</kbd> 强刷浏览器，清掉旧版缓存。<br>如果还是看到此页面，说明 game.js 仍有语法错误，需要发给我修复。</div>'}};
  window.addEventListener('error',e=>_bootErr(e.message+' @ '+(e.filename||'?').split('/').pop()+':'+e.lineno+':'+e.colno));
  window.addEventListener('unhandledrejection',e=>_bootErr(String(e.reason)));
  // 同步 try/catch 包裹后面所有初始化代码
  try {
  // 版本戳 — 用于排查浏览器是否加载到旧 game.js
  try{const _v='2026-09-17-4d-v3';if(localStorage.getItem('blockPlanetGameVer')!==_v){localStorage.setItem('blockPlanetGameVer',_v);console.info('[blockPlanet] 加载版本:',_v)}}catch(_){}
  const $=id=>document.getElementById(id), canvas=$('world'),ctx=canvas.getContext('2d');
  const W=11,H=9;
  const DAYS=[
    {name:'初访',duration:150,stamina:15,spawn:[2,4],mission:'在有限体力范围内，收集稀有资源吧',tip:'收集足够的粉宝石',waterCols:[[4],[5],[6]],water:[[4,1],[4,2],[4,3],[4,4],[5,4],[6,4],[6,5],[6,6],[6,7],[6,8]],cliff:[[1,0],[2,0],[3,0],[4,0],[5,0],[6,0],[7,0],[8,0],[0,1],[1,1],[0,2],[1,2],[0,3],[0,4],[0,5],[0,6],[0,7]],dirt:[[0,0],[9,0],[10,0],[2,1],[3,1],[5,1],[6,1],[7,1],[8,1],[9,1],[10,1],[2,2],[3,2],[5,2],[1,3],[2,3],[3,3],[5,3],[9,3],[1,4],[9,4],[1,5],[9,5],[1,6],[9,6],[1,7],[4,7],[9,7],[0,8],[1,8],[9,8],[10,8]],ladder:null,hole:null,cave:[],rocks:[],nodes:[['stone',7,3,0],['stone',0,5,0],['stone',0,6,0],['berry',10,5,0],['wood',2,8,0],['wood',3,4,0],['stone',5,8,0],['iron',6,2,0],['berry',10,3,0],['wood',7,8,0],['wood',7,6,0],['wood',7,4,0],['wood',7,5,0],['gem',10,6,0],['gem',10,2,0],['gem',10,0,0],['gem',10,4,0],['wood',8,8,0],['stone',7,2,0],['iron',6,3,0]],actors:[],crops:[],goal:[10,7],lava:[],waterSource:[],rockSoil:[[1,8],[10,8],[9,8],[9,7],[9,6],[9,5],[9,4],[9,3],[1,7],[1,6],[1,5],[1,4],[3,3],[2,3]]},
    {name:'村民',duration:200,stamina:16,spawn:[9,1],mission:'救出被困村民，和他聊聊吧',tip:'与村民对话即可救出他（岩浆挡路时用水桶扑灭）',waterCols:[],water:[],cliff:[[0,0],[1,0],[2,0],[3,0],[4,0],[5,0],[6,0],[7,0],[0,1],[1,1],[3,1],[4,1],[0,2],[1,2],[3,2],[4,2],[0,3],[1,3],[0,4],[1,4],[3,4],[4,4],[0,5],[0,6],[0,7],[0,8],[1,8]],dirt:[[8,0],[9,0],[10,0],[2,1],[5,1],[6,1],[7,1],[8,1],[8,2],[8,3],[8,4],[9,5],[4,6],[5,6],[8,6],[5,7],[9,7],[5,8],[8,8]],ladder:null,hole:null,cave:[],rocks:[],nodes:[['berry',2,7,0],['fire_ore',1,7,0],['fire_ore',2,8,0],['stone',8,7,0],['stone',8,5,0],['iron',7,6,0],['iron',7,7,0],['iron',7,8,0],['iron',7,5,0],['iron',7,4,0],['iron',6,8,0],['iron',6,7,0],['iron',6,6,0],['iron',6,5,0],['iron',6,4,0],['iron',6,3,0],['iron',7,3,0],['iron',6,2,0],['iron',7,2,0],['berry',1,6,0],['wood',9,8,0],['wood',9,6,0],['wood',9,4,0]],actors:[['trapped_farmer',1,5,0]],crops:[],goal:[3,8],lava:[[3,7],[2,4],[2,3],[2,5],[2,6],[3,6],[2,2],[4,7],[4,8]],waterSource:[[4,3,0],[3,3,0]],rockSoil:[[8,6],[8,4],[8,3],[8,2],[8,1],[8,8]]},
    {name:'探险',duration:180,stamina:12,staminaMax:15,spawn:[1,1],mission:'前往矿洞，探索真相吧',tip:'击败怪物，找到真相',waterCols:[],water:[],cliff:[],dirt:[[0,0],[1,0],[2,0],[3,0],[4,0],[5,0],[6,0],[7,0],[8,0],[9,0],[10,0],[0,1],[2,1],[6,1],[10,1],[0,2],[2,2],[6,2],[8,2],[10,2],[0,3],[2,3],[3,3],[4,3],[8,3],[10,3],[0,4],[6,4],[7,4],[8,4],[10,4],[0,5],[1,5],[2,5],[3,5],[6,5],[0,6],[3,6],[6,6],[0,7],[3,7],[6,7],[0,8],[1,8],[2,8],[3,8],[4,8],[5,8],[6,8]],ladder:null,hole:[9,5],cave:[[7,5],[8,5],[9,5],[10,5],[7,6],[8,6],[9,6],[10,6],[7,7],[8,7],[9,7],[10,7],[7,8],[8,8],[9,8],[10,8]],rocks:[],nodes:[['berry',1,2,0],['berry',1,3,0],['berry',1,4,0],['gem',4,2,0],['wood',1,7,0],['wood',2,7,0],['stone',1,6,0],['stone',2,6,0],['iron',4,6,0],['iron',4,5,0],['berry',3,1,0],['iron',4,1,0]],actors:[['zombie_static',8,6,-2]],crops:[],goal:[8,8],lava:[],waterSource:[],rockSoil:[[0,8],[0,6],[0,5],[0,4],[0,3],[0,2],[0,1],[0,0],[0,7],[2,3],[2,2],[2,1],[1,8],[2,8],[3,8],[6,4],[7,4],[8,4],[10,4],[10,3],[10,2],[10,1],[10,0],[1,0],[2,0],[3,0],[4,0],[5,0],[6,0],[7,0],[8,0],[9,0],[6,2],[6,1],[8,3],[8,2],[3,7],[3,6],[3,5],[6,8],[6,7],[6,6],[6,5],[3,3],[4,3],[4,8],[5,8],[2,5]]},
    {name:'重建',duration:240,stamina:99,spawn:[4,6],mission:'帮助村民重建家园吧',tip:'与村民对话，答应帮他重建家园',waterCols:[],water:[],cliff:[],dirt:[[2,1],[3,1],[2,2],[3,2],[7,2],[8,2],[7,3],[8,3]],ladder:null,hole:null,cave:[],rocks:[],nodes:[['wood',0,2,0],['wood',2,4,0],['wood',10,2,0],['wood',9,5,0],['wood',1,1,2],['stone',2,7,0],['stone',9,7,0]],actors:[['farmer',5,4,0],['creeper',9,3,0]],crops:[[4,4],[6,4],[4,5],[6,5]],goal:[6,6],lava:[],waterSource:[],rockSoil:[]},
  ];
  // 关卡数据仅来自上方内置 DAYS（手动导出模式）。
  // 在编辑器中点「导出」，把生成的片段手动贴回 DAYS 即可，不再有 localStorage 自动同步。
  // (Days come ONLY from the DAYS array above. Export manually, paste here. No auto-sync.)
  function editorDayToGame(l){ // editor 格式（terrain:{...}, water:[[x,y]]） -> game 格式（cliff/cave/cave 平铺, water+waterCols）
    const t=l.terrain||{};
    const cliff=(Array.isArray(t)?t:t.cliff)||[];
    const cave=(Array.isArray(t)?[]:t.cave)||[];
    const dirt=(!Array.isArray(t)&&t.dirt)||[];
    const water=(l.water||[]).filter(p=>Array.isArray(p)&&inb(p[0],p[1])); // ★ 改动 3：保留任意格水
    const waterCols=[...new Set(water.map(p=>p[0]))];
    return{
      name:l.name,duration:l.duration,stamina:Math.max(1,Math.min(99,Number(l.stamina)||12)),
      mission:l.mission,tip:l.tip,
      water:water.length>0,waterCols,water,
      cliff,cave,dirt,
      ladder:l.ladder?[l.ladder[0],l.ladder[1]]:null,
      hole:l.hole?[l.hole[0],l.hole[1]]:null,
      rocks:(l.rocks||[]).map(p=>[p[0],p[1]]),
      nodes:(l.nodes||[]).map(p=>[p[0],p[1],p[2]||0]),
      actors:(l.actors||[]).map(p=>[p[0],p[1],p[2]||0]),
      crops:(l.crops||[]).map(p=>[p[0],p[1]]),
      goal:l.goal?[l.goal[0],l.goal[1]]:null,
      lava:(l.lava||[]).map(p=>[p[0],p[1]]),
      waterSource:(l.waterSource||[]).map(p=>[p[0],p[1],p[2]||0]),
      rockSoil:(l.rockSoil||[]).map(p=>[p[0],p[1]]) // ★ 岩土块（不可挖掘）
    };
  }
  let soilHeights=new Map(),soilPlaced=new Map(),soilWater=new Set(),hitFlash=new Map(),rockSoil=new Set(); // ★ rockSoil：岩土块（不可挖掘）
  const key=(x,y)=>`${x},${y}`, inb=(x,y)=>x>=0&&y>=0&&x<W&&y<H;
  /* ===== ★ 改动 4：交互音效（Web Audio 合成，无需外部音频文件） ===== */
  let audioCtx=null,soundOn=true;
  function ac(){if(!soundOn)return null;try{if(!audioCtx)audioCtx=new (window.AudioContext||window.webkitAudioContext)();if(audioCtx.state==='suspended')audioCtx.resume();return audioCtx}catch(e){return null}}
  function tone(freq,dur,type,gain,slide){const a=ac();if(!a)return;const t=a.currentTime,o=a.createOscillator(),g=a.createGain();o.type=type||'square';o.frequency.setValueAtTime(freq,t);if(slide)o.frequency.exponentialRampToValueAtTime(Math.max(60,freq+slide),t+dur);g.gain.setValueAtTime(gain||.07,t);g.gain.exponentialRampToValueAtTime(.0001,t+dur);o.connect(g);g.connect(a.destination);o.start(t);o.stop(t+dur+.03)}
  const SFX={
    chop(){tone(190,.13,'square',.07,-70)},                                   // 砍树
    mine(){tone(860,.09,'triangle',.07)},                                     // 采石/凿岩
    gem(){tone(1046,.09,'triangle',.07);setTimeout(()=>tone(1318,.12,'triangle',.07),80)}, // 宝石
    berry(){tone(680,.11,'sine',.09)},                                        // 果子/小麦
    step(){tone(320,.045,'sine',.03)},                                        // 走一步
    fail(){tone(150,.18,'sawtooth',.06,-50)},                                 // 操作失败
    noStamina(){tone(210,.22,'sawtooth',.07,-90)},                            // 体力耗尽
    build(){tone(250,.14,'square',.06,90)},                                   // 搭桥/建梯
    hit(){tone(120,.2,'sawtooth',.08,-60)},                                   // 打击
    craft(){tone(420,.1,'triangle',.06);setTimeout(()=>tone(630,.12,'triangle',.06),90)},  // 合成
    pick(){tone(560,.06,'sine',.05)},                                         // 选中槽位
    win(){[523,659,784,1046].forEach((f,i)=>setTimeout(()=>tone(f,.16,'triangle',.07),i*95))} // 通关
  };
  let maxUnlocked=1,selectedDay=0,day=0,phase='home',remaining=0,stamina=0,staminaMax=0,player={x:1,y:4,z:0},facing=[1,0],focus=null,walk=[],nodes=new Map(),bridges=new Set(),brokenRocks=new Set(),ladderBuilt=false,holeDug=false,pick=false,extras={wheat:0,emerald:0,axe:false,bucket:false,waterBucket:false,sword:false,ironPickaxe:false,trappedSaved:false,invited:false,trappedTalk:false,creeperDefeated:false,defeatedCreepers:[],rebuildPromise:false,metFarmer:false},_extinguished=new Set(),held='hand',pendingAction=null,bag={wood:0,stone:0,ore:0,gem:0,fireOre:0,dirt:0,berry:0,iron:0},tickHandle=null,lastStep=0,toastHandle=null,bridgeHint=false,holeConfirmAt=0,farmerTalk=0;
  // ★ 关卡逐个解锁：通关当天才解锁下一关，进度存 localStorage（最多 4 关）
  try{const _u=parseInt(localStorage.getItem('blockPlanetUnlocked'));if(_u>=1&&_u<=4)maxUnlocked=_u}catch{}
  function baseTerrain(x,y){if(!inb(x,y))return null;const d=DAYS[day];if(d.cave.some(p=>p[0]===x&&p[1]===y))return -2;if(d.cliff.some(p=>p[0]===x&&p[1]===y))return 2;return 0}
  function terrain(x,y){return soilHeights.has(key(x,y))?soilHeights.get(key(x,y)):baseTerrain(x,y)}
  function isWater(x,y){
    const d=DAYS[day];
    if(!d)return false;
    // ★ 改动 3：优先查表（任意格水）；兼容旧 waterCols（整列水）
    if(d.water&&Array.isArray(d.water)&&d.water[0]&&Array.isArray(d.water[0])){
      return d.water.some(p=>p[0]===x&&p[1]===y)&&!soilWater.has(key(x,y));
    }
    if(d.waterCols&&d.waterCols.length){
      return d.waterCols.includes(x)&&!soilWater.has(key(x,y));
    }
    return false;
  }
  function isLava(x,y){const d=DAYS[day];return d.lava&&d.lava.some(p=>p[0]===x&&p[1]===y)&&!_extinguished.has(key(x,y))}
  function isWaterSource(x,y,z){const d=DAYS[day];return d.waterSource&&d.waterSource.some(p=>p[0]===x&&p[1]===y&&p[2]===z)}
  function isRock(x,y,z){return DAYS[day].rocks.some(p=>p[0]===x&&p[1]===y)&&!brokenRocks.has(key(x,y))&&(day!==2||z===-2)}
  function atNode(x,y,z){const n=nodes.get(key(x,y));return n&&n.z===z?n:null}
  // ★ 修复：把 actor（村民/被困村民/绵羊/补给箱/僵尸/苦力怕）也算作可交互目标，
  //    否则 candidate()/candidates()/beltTarget() 都找不到 NPC，按 E 只会显示「观察」
  function special(x,y){let z=terrain(x,y),d=DAYS[day];return !!atNode(x,y,z)||!!actorAt(x,y,player.z)||isWater(x,y)&&!bridges.has(key(x,y))||isRock(x,y,z)||isLava(x,y)||isWaterSource(x,y,z)||!!d.ladder&&d.ladder[0]===x&&d.ladder[1]===y||!!d.hole&&d.hole[0]===x&&d.hole[1]===y}
  function canStand(x,y,z){
    if(!inb(x,y)||terrain(x,y)!==z)return false;
    const d=DAYS[day];
    // ★ 需求 2：土块(z=1)/高台(z=2) 表面不可行走（梯子/洞口格除外，用于上下层）
    if(z>=1&&!(d.ladder&&d.ladder[0]===x&&d.ladder[1]===y)&&!(d.hole&&d.hole[0]===x&&d.hole[1]===y))return false;
    if(z===0&&isWater(x,y)&&!bridges.has(key(x,y)))return false;
    if(z===0&&isLava(x,y))return false;
    if(isRock(x,y,z))return false;
    if(atNode(x,y,z))return false;
    if(z===0&&d.hole?.[0]===x&&d.hole?.[1]===y)return false;
    return true;
  }
  function adjacent(x,y){return Math.abs(player.x-x)+Math.abs(player.y-y)===1}
  function adjacent8(x,y){return Math.max(Math.abs(player.x-x),Math.abs(player.y-y))===1} // ★ 改动 2：九宫格（含斜角）
  function say(message,dur){$('statusLine').textContent=message;if(!message)return;const t=$('toast');t.textContent=message;t.classList.add('show');clearTimeout(toastHandle);toastHandle=setTimeout(()=>t.classList.remove('show'),dur||1500)}
  function ensureStamina(){if(stamina<=0){SFX.noStamina();say('体力已耗尽，无法继续行动');finish('体力耗尽，自动返程');return false}stamina--;return true}
  function updateHome(){document.querySelectorAll('.day-card').forEach((el,i)=>{el.classList.toggle('locked',i>=maxUnlocked);el.classList.toggle('selected',i===selectedDay);el.setAttribute('aria-disabled',String(i>=maxUnlocked));el.querySelector('.day-status').textContent=i>=maxUnlocked?'尚未解锁':i===selectedDay?'已选择':'可前往'});const sh=$('selectedHint');if(sh)sh.textContent=`DAY${selectedDay+1} · ${DAYS[selectedDay].name}`}
  function showHome(){clearInterval(tickHandle);phase='home';$('home').classList.remove('hidden');$('game').classList.add('hidden');$('result').classList.add('hidden');updateHome()}
  function resetGame(i){
    day=i;
    const d=DAYS[i];
    remaining=-1; // ★ 改动 3：取消关卡时间限制（-1 = 无限）
    // ★ 初始体力：读取关卡 stamina 上限并回满（保证不会出现 0/xx）
    stamina=Math.max(1,Math.round(Number(d.stamina)||12));
    // ★ 支持关卡单独设定体力上限（d.staminaMax）；未设置时上限 = 初始值
    staminaMax=Math.max(stamina,Math.round(Number(d.staminaMax)||0));
    // ★ 出生点：优先读取关卡自身的 spawn（与编辑器「降落点」一致），缺省回退 [1,4]
    const _sp=(d.spawn&&inb(d.spawn[0],d.spawn[1]))?d.spawn:[1,4];
    player={x:_sp[0],y:_sp[1],z:0};
    facing=[1,0];
    focus=null;
    walk=[];
    nodes=new Map(d.nodes.map(([type,x,y,z])=>[key(x,y),{type,x,y,z}]));
    bridges=new Set();
    brokenRocks=new Set();
    ladderBuilt=false;
    holeDug=false;
    bridgeHint=false;holeConfirmAt=0;farmerTalk=0; // ★ 引导提示状态重置
    pick=false;
    extras={wheat:0,emerald:0,axe:false,bucket:false,waterBucket:false,sword:false,ironPickaxe:false,trappedSaved:false,invited:false,trappedTalk:false,creeperDefeated:false,defeatedCreepers:[],rebuildPromise:false,metFarmer:false};
    _extinguished=new Set();
    held='hand';
    pendingAction=null;
    bag={wood:0,stone:0,ore:0,gem:0,fireOre:0,dirt:0,berry:0,iron:0};
    if(i===3){ // ★ DAY4 重建日：全工具直接持有，资源拉满 99（自由建造）
      pick=true;
      extras.axe=extras.bucket=extras.sword=extras.ironPickaxe=true;
      bag={wood:99,stone:99,ore:99,gem:99,fireOre:99,dirt:99,berry:99,iron:99};
    }
    $('gameDay').textContent=`DAY ${i+1}`;
    $('gameTitle').textContent=d.name;
    $('missionTitle').textContent='任务目标';
    $('missionText').textContent=d.mission||'';
    $('missionText').hidden=!d.mission; // ★ 修复：原来该元素带 hidden 属性，任务描述从未显示过
    $('statusLine').textContent=d.tip;
    updateUI();
    // ★ 进入关卡时用已有提示条弹出任务描述（侧边栏「任务目标」卡片会常驻展示，可随时查看）
    if(d.mission)say(d.mission,4200);
  }
  function start(i=selectedDay){if(i>=maxUnlocked)return;closeMobilePanels();clearInterval(tickHandle);resetGame(i);phase='playing';$('home').classList.add('hidden');$('game').classList.remove('hidden');$('result').classList.add('hidden');updateUI();canvas.parentElement.offsetWidth;requestAnimationFrame(()=>{resize();requestAnimationFrame(()=>{resize();render()})});tickHandle=null;showTutorial();} // ★ 改动 3：取消关卡时间限制（不再启动倒计时）
  // ★ 每关任务目标（label=显示名，ids=计入的背包字段，need=所需数量，free=只要求抵达终点）
  const GOALS=[
    {label:'粉宝石',ids:['gem'],need:3},                      // DAY1 初访
    {label:'稀有资源',ids:['ore','gem','fireOre'],need:1},    // DAY2 村民
    {label:'稀有资源',ids:['ore','gem','fireOre'],need:1},    // DAY3 探险
    {label:'——',ids:[],need:0,free:true}                      // DAY4 重建（抵达终点即可）
  ];
  function goalState(){const g=GOALS[day]||GOALS[1];const got=g.ids.reduce((s,id)=>s+(bag[id]||0),0);return{g,got,done:!!g.free||got>=g.need}}
  function updateUI(){
    const d=DAYS[day];
    const sp=$('staminaBar'),sl=$('staminaLabel');
    if(sp){sp.style.width=(staminaMax?stamina/staminaMax*100:0)+'%';sp.classList.toggle('low',stamina>0&&stamina<=3);sl.textContent=`${stamina}/${staminaMax}`;sl.classList.toggle('low',stamina>0&&stamina<=3);const wrap=sp.parentElement;if(wrap)wrap.classList.toggle('exhausted',stamina<=0)}
    for(const v of ['wood','stone','ore','gem','fireOre','berry','iron']){const el=$(v);if(el)el.textContent=bag[v]}
    // ★ 任务目标计数：按关卡定义（DAY1 = 粉宝石 x/3）
    const gs=goalState();
    $('goalProgress').textContent=gs.g.free?'0 / 0':`${Math.min(gs.got,gs.g.need)} / ${gs.g.need}`;
    $('goalLabel').textContent=gs.g.free?(goalShown()?'目标：抵达终点 ⚑':'目标：先与村民对话，才会出现终点'):(gs.done?`${gs.g.label}已集齐 · 可以前往终点`:`目标：${gs.g.label} ${Math.min(gs.got,gs.g.need)} / ${gs.g.need}`);
    $('layerLabel').textContent=player.z>0?'高台':player.z<0?'地下':'地表';
    $('craftPick').disabled=phase!=='playing'||pick||bag.wood<1||bag.stone<1;
    $('craftPick').innerHTML=pick?'石镐已持有':'合成石镐 <small>木材×1+石材×1</small>';
    const a=$('craftAxe');if(a){a.disabled=phase!=='playing'||extras.axe||bag.dirt<1||bag.stone<1;a.innerHTML=extras.axe?'斧头已持有':'合成斧头 <small>土块×1+石材×1</small>'}
    // ★ DAY1/DAY3 无岩浆，合成区不显示水桶
    const b=$('craftBucket');if(b){const showB=!(day===0||day===2);b.classList.toggle('hidden',!showB);b.disabled=phase!=='playing'||!showB||extras.bucket||bag.iron<1||bag.wood<1;b.innerHTML=extras.bucket?'水桶已持有':'合成水桶 <small>铁块×1+木材×1</small>'}
    const sw=$('craftSword');if(sw){sw.disabled=phase!=='playing'||extras.sword||bag.gem<1||bag.iron<1;sw.innerHTML=extras.sword?'宝剑已持有':'合成宝剑 <small>铁块×1+宝石×1</small>'}
    const ip=$('craftIronPick');if(ip){ip.disabled=phase!=='playing'||extras.ironPickaxe||bag.iron<2||bag.wood<1;ip.innerHTML=extras.ironPickaxe?'铁镐已持有':'合成铁镐 <small>铁块×2+木材×1</small>'}
    // 邀请选择
    // ★ 选项区：DAY2 村民「第一段对话」或其它关卡的邀请场景才显示
    const inv=$('inviteChoice');if(inv){const invA=actors.find(a=>a.alive!==false&&a.type==='farmer'&&extras.trappedSaved);const showD2=!!(day===1&&invA&&!extras.invited&&farmerTalk!==1);const showD4=!!(day===3&&uiMode==='dialogue'&&dialogueActor&&dialogueActor.type==='farmer'&&!extras.rebuildPromise);inv.classList.toggle('hidden',!(showD2||showD4))}
  }
  // ★ 统一终点判定：方向键 / 屏幕方向按钮 / 自动寻路 / 传送 全部走这里；
  //    不再限制 player.z===0，兼容终点位于 cliff / 土块等高台上的关卡。
  // ★ DAY4：终点二次确认面板状态（open=面板已打开；dismissed=玩家关掉过，离开终点后重新武装）
  let questConfirmOpen=false,questConfirmDismissed=false;
  // ★ DAY4：终点需先与村民对话才会出现 —— 未对话时不渲染、不生效
  function goalShown(){return day!==3||!!extras.metFarmer}
  function checkGoal(){
    if(phase!=='playing')return false;
    const g=DAYS[day].goal;if(!g)return false;
    const onGoal=player.x===g[0]&&player.y===g[1];
    if(!onGoal){questConfirmDismissed=false;return false}
    if(!goalShown())return false; // ★ DAY4：未与村民对话前，踩到终点也不触发
    walk=[];pendingAction=null;focus=null;
    // ★ DAY4：抵达终点先弹二次确认，确认后才结算
    if(day===3){if(!questConfirmOpen&&!questConfirmDismissed)showQuestConfirm();return true}
    finish('到达终点 ✦');return true
  }
  function finish(reason){
    if(phase!=='playing')return;clearInterval(tickHandle);phase='result';walk=[];
    if(reason&&reason.includes('\u7EC8\u70B9'))SFX.win(); // ★ 改动 4：到达终点音效
    const d=DAYS[day];
    // ★ 通关判定与「任务目标」计数保持一致（DAY1 需集齐 3 颗粉宝石；DAY4 只需抵达终点）
    const win=goalState().done;
    if(win&&day+2>maxUnlocked){maxUnlocked=Math.min(4,day+2);try{localStorage.setItem('blockPlanetUnlocked',String(maxUnlocked))}catch{}}
    $('resultIcon').textContent=win?'✦':'◇';
    $('resultDay').textContent=`DAY ${day+1} · ${reason}`;
    $('resultTitle').textContent=win?'满载而归！':'旅行结束';
    let txt=win?(day<DAYS.length-1?'新的旅行已解锁。':'你完成了全部四天的方块星球旅行！'):'还有稀有资源没有获取，再试一次吧。';
    if(day===1&&extras.invited)txt+=' 村民接受了邀请，将前往你的星球暂住哦。';
    if(day===2&&extras.creeperDefeated)txt+=' 僵尸已被击退，危机解决。';
    $('resultText').textContent=txt;
    $('resultItems').innerHTML=`<span>🪵 木材 ×${bag.wood}</span><span>🪨 石材 ×${bag.stone}</span>${bag.dirt?`<span>🟫 土块 ×${bag.dirt}</span>`:''}${bag.berry?`<span>🍇 果子 ×${bag.berry}</span>`:''}${bag.iron?`<span>⛓ 铁块 ×${bag.iron}</span>`:''}${bag.ore?`<span>💎 蓝晶矿 ×${bag.ore}</span>`:''}${bag.gem?`<span>💠 宝石 ×${bag.gem}</span>`:''}${bag.fireOre?`<span>🔥 火晶矿 ×${bag.fireOre}</span>`:''}`;
    $('nextDay').classList.toggle('hidden',!win||day===DAYS.length-1);
    $('result').classList.remove('hidden');updateHome()
  }
  function craft(which){
    if(phase!=='playing')return;
    // ★ 改动 2：按图片重构配方
    if(which==='pick'){if(pick||bag.wood<1||bag.stone<1){say('石镐需要 木材×1+石材×1');return}if(!ensureStamina())return;bag.wood--;bag.stone--;pick=true;say('获得石镐');}
    else if(which==='axe'){if(extras.axe||bag.dirt<1||bag.stone<1){say('斧头需要 土块×1+石材×1');return}if(!ensureStamina())return;bag.dirt--;bag.stone--;extras.axe=true;say('获得斧头！');}
    else if(which==='bucket'){if(extras.bucket||bag.iron<1||bag.wood<1){say('水桶需要 铁块×1+木材×1');return}if(!ensureStamina())return;bag.iron--;bag.wood--;extras.bucket=true;say('获得水桶！走到水源盛水');}
    else if(which==='sword'){if(extras.sword||bag.gem<1||bag.iron<1){say('宝剑需要 铁块×1+宝石×1');return}if(!ensureStamina())return;bag.gem--;bag.iron--;extras.sword=true;say('获得宝剑！选中「宝剑」槽位即可攻击（每次消耗 3 体力）');}
    else if(which==='ironPickaxe'){if(extras.ironPickaxe||bag.iron<2||bag.wood<1){say('铁镐需要 铁块×2+木材×1');return}if(!ensureStamina())return;bag.iron-=2;bag.wood--;extras.ironPickaxe=true;say('获得铁镐！可以开采宝石了');}
    SFX.craft();
    updateUI();render()
  }
  function canStepFrom(x,y,nx,ny){const from=terrain(x,y),to=terrain(nx,ny);return to!==null&&Math.abs(to-from)<=1&&canStand(nx,ny,to)}
  function pathTo(tx,ty){if(!inb(tx,ty))return null;const start=key(player.x,player.y),q=[[player.x,player.y]],prev=new Map([[start,null]]);for(let i=0;i<q.length;i++){const [x,y]=q[i],k=key(x,y);if(x===tx&&y===ty){const out=[];let cur=k;while(cur!==start){const [a,b]=cur.split(',').map(Number);out.unshift({x:a,y:b,z:terrain(a,b)});cur=prev.get(cur)}return out}for(const [dx,dy] of [[1,0],[0,1],[-1,0],[0,-1]]){const nx=x+dx,ny=y+dy,nk=key(nx,ny);if(!prev.has(nk)&&canStepFrom(x,y,nx,ny)){prev.set(nk,k);q.push([nx,ny])}}}return null}
  function pathNear(x,y){const options=[];for(const [dx,dy] of [[1,0],[0,1],[-1,0],[0,-1]]){const nx=x+dx,ny=y+dy;if(nx===player.x&&ny===player.y)return [];const p=pathTo(nx,ny);if(p)options.push(p)}options.sort((a,b)=>a.length-b.length);return options[0]||null}
  function clickTile(x,y){if(phase!=='playing'||!inb(x,y))return;focus={x,y};if(special(x,y)){const p=pathNear(x,y);if(p===null){say('无法靠近');render();return}walk=p}else{const p=pathTo(x,y);if(p)walk=p;else say('无法到达')}updateUI();render()}
  function move(dx,dy){if(phase!=='playing')return;walk=[];facing=[dx,dy];focus=null;const x=player.x+dx,y=player.y+dy;if(canStepFrom(player.x,player.y,x,y)){SFX.step();player={x,y,z:terrain(x,y)};pendingAction=null;if(checkGoal())return;updateUI();render()}else if(inb(x,y)){updateUI();render()}}
  /* ★ 改动 2：九宫格内所有可交互格（不含自身；自身在梯子/洞口上时额外加入） */
  function candidates(){
    const out=[];
    for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){
      if(!dx&&!dy)continue;
      const x=player.x+dx,y=player.y+dy;
      if(inb(x,y)&&special(x,y))out.push({x,y});
    }
    const d=DAYS[day];
    if((d.ladder&&player.x===d.ladder[0]&&player.y===d.ladder[1])||(d.hole&&player.x===d.hole[0]&&player.y===d.hole[1]))out.push({x:player.x,y:player.y});
    return out;
  }
  // ★ 改动 2：九宫格判定；优先 focus，其次朝向，再次顺时针（含斜角）
  function candidate(){
    if(focus&&adjacent8(focus.x,focus.y))return focus;
    const d=DAYS[day];
    if(d.ladder&&player.x===d.ladder[0]&&player.y===d.ladder[1])return{x:player.x,y:player.y};
    if(d.hole&&player.x===d.hole[0]&&player.y===d.hole[1])return{x:player.x,y:player.y};
    const x=player.x+facing[0],y=player.y+facing[1];
    if(inb(x,y)&&special(x,y))return{x,y};
    for(const [dx,dy] of [[1,0],[0,-1],[-1,0],[0,1],[1,1],[1,-1],[-1,1],[-1,-1]]){
      const nx=player.x+dx,ny=player.y+dy;
      if(inb(nx,ny)&&special(nx,ny))return{x:nx,y:ny};
    }
    return null;
  }
  // ★ 统一的僵尸攻击流程：E 键交互（interact）与直接点击目标（beltAct）共用同一套规则
  function attackZombie(a){
    if(!a||extras.defeatedCreepers.includes(key(a.x,a.y)))return;
    if(!extras.sword){say('需要武器（铁块×1+宝石×1）');return}
    if(held!=='sword'){say('请先选中「宝剑」再攻击');return}
    if(stamina<3){SFX.fail();say(`体力不足（需要 3 体力，当前 ${stamina}）：攻击失败`);return}
    stamina-=3;SFX.hit();extras.defeatedCreepers.push(key(a.x,a.y));extras.creeperDefeated=true;hitFlash.set(key(a.x,a.y),encounterTime+.28);
    // ★ 击退后原地留下「宝箱」：需再交互一次才能领取 5 火晶矿
    a.type='treasure';
    say('宝剑挥出！僵尸闪白后倒下，原地留下一个宝箱——靠近它开启吧。');focus=null;updateUI();render();
  }
  // ★ 宝箱：击退僵尸后留下的宝藏 → 交互获得 5 火晶矿
  function lootTreasure(a){
    if(!a||a.type!=='treasure')return;
    a.alive=false;bag.fireOre+=5;SFX.gem();say('开启宝箱：火晶矿 ×5！');focus=null;updateUI();render();
  }
  function interact(){if(phase!=='playing')return;const c=candidate();if(!c){say('先靠近目标，或直接点击目标自动走近');return}const {x,y}=c,k=key(x,y),d=DAYS[day],n=atNode(x,y,terrain(x,y));
    // ★ 改动 2：按图片重构资源采集规则
    //   木材=斧头；石块=徒手；果子=徒手+1体力；铁块=石镐子；蓝晶/火晶=石镐子；宝石=铁镐子
    if(n&&n.z===player.z){
      if(n.type==='wood'){
        if(!extras.axe){say('需要斧头（土块×1+石材×1）');return}
        if(!ensureStamina())return;SFX.chop();nodes.delete(k);bag.wood++;say('木材 +1');
        // ★ 引导：木材攒够 2 个（够搭桥）时提醒一次
        if(bag.wood>=2&&!bridgeHint&&DAYS[day].waterCols&&DAYS[day].waterCols.length){bridgeHint=true;setTimeout(()=>say('木材足够了！前往河边建桥吧（先选中「木材」，再点河面）',4500),1600)}
        focus=null;updateUI();render();return
      }
      if(n.type==='stone'){
        // 徒手采石
        if(!ensureStamina())return;SFX.mine();nodes.delete(k);bag.stone++;say('石材 +1');focus=null;updateUI();render();return
      }
      if(n.type==='berry'){
        // ★ 果子：不消耗体力、直接补回 1 体力、不进入背包
        SFX.berry();nodes.delete(k);
        if(stamina<staminaMax)stamina=Math.min(staminaMax,stamina+1);
        say('\u679C\u5B50\uFF1A\u4F53\u529B +1');focus=null;updateUI();render();return
      }
      if(n.type==='iron'){
        if(!pick){say('「需要石镐」（木材×1 石材×1）');return}
        if(!ensureStamina())return;SFX.mine();nodes.delete(k);bag.iron=(bag.iron||0)+1;say('铁块 +1');focus=null;updateUI();render();return
      }
      if(n.type==='ore'){
        if(!pick){say('「需要石镐」（木材×1 石材×1）');return}
        if(!ensureStamina())return;SFX.mine();nodes.delete(k);bag.ore++;say('蓝晶矿 +1');focus=null;updateUI();render();return
      }
      if(n.type==='fire_ore'){
        if(!extras.ironPickaxe){say('「需要铁镐」（铁块×2 木材×1）');return}
        if(!ensureStamina())return;SFX.mine();nodes.delete(k);bag.fireOre++;say('火晶矿 +1');focus=null;updateUI();render();return
      }
      if(n.type==='gem'){
        if(!extras.ironPickaxe){say('需要铁镐（铁块×2 木材×1）');return}
        if(!ensureStamina())return;SFX.gem();nodes.delete(k);bag.gem++;say('粉宝石 +1');focus=null;updateUI();render();return
      }
    }
    // 水源：持水桶 → 满水桶
    if(isWaterSource(x,y,player.z)){
      if(!extras.bucket){say('需要水桶');return}
      if(extras.waterBucket){say('水桶已满');return}
      if(!ensureStamina())return;SFX.berry();extras.waterBucket=true;say('水桶已装满水！去扑灭岩浆吧（选中「水桶」，再点岩浆）',4500);focus=null;updateUI();render();return
    }
    // 岩浆：持满水桶 → 灭火
    if(isLava(x,y)){
      if(!extras.waterBucket){say('需要水源');return}
      if(!ensureStamina())return; // ★ 扑灭岩浆同样消耗 1 体力
      _extinguished.add(k);extras.waterBucket=false;say('岩浆已灭（体力 -1）；水桶已空');focus=null;updateUI();render();return
    }
    // 僵尸/不动苦力怕：选中「宝剑」后攻击 → 消耗 3 体力；体力不足则攻击失败（不结束游戏）
    const zombie=actors.find(a=>(a.type==='zombie_static'||a.type==='creeper_static')&&a.x===x&&a.y===y&&a.z===player.z&&!extras.defeatedCreepers.includes(key(x,y)));
    if(zombie){attackZombie(zombie);return}
    // ★ 宝箱：击退僵尸后留下的宝藏 → 开启获得 5 火晶矿
    const tres=actors.find(a=>a.alive!==false&&a.type==='treasure'&&a.x===x&&a.y===y&&a.z===player.z);
    if(tres){lootTreasure(tres);return}
    // ★ 修复：NPC 交互（村民 / 被困村民 / 绵羊 / 补给箱 / 苦力怕）→ 打开对话
    //    僵尸类已在上面拦截为「攻击」，不会走到这里
    const npc=actorAt(x,y,player.z);
    if(npc&&adjacent8(x,y)){pendingAction=null;walk=[];focus=null;interactEncounter(npc);return}
    // 河水：搭桥
    if(isWater(x,y)&&player.z===0&&!bridges.has(k)){if(held!=='wood'){say('选中木材建桥');return}if(bag.wood<2){say('搭桥需要木材 ×2。');return}SFX.build();bag.wood-=2;bridges.add(k);say('木桥已搭好');focus=null;updateUI();render();return}
    if(d.ladder&&d.ladder[0]===x&&d.ladder[1]===y){if(player.z===2&&player.x===x&&player.y===y){const nx=x-1,ny=y;if(canStand(nx,ny,0)){player={x:nx,y:ny,z:0};say('回到地面')}else say('梯子出口被挡住了。');updateUI();render();return}if(player.z===0&&adjacent8(x,y)){if(!ladderBuilt){const type=held==='stone'?'stone':'wood';if(bag[type]<2){say(type==='wood'?'木梯需要木材 ×2。':'石阶需要石材 ×2。');return}SFX.build();bag[type]-=2;ladderBuilt=true;say(type==='wood'?'木梯搭好了！点击梯子即可登高。':'石阶垫好了！点击梯子即可登高。');updateUI();render();return}player={x,y,z:2};focus=null;say('到达高台');updateUI();render();return}}
    if(d.hole&&d.hole[0]===x&&d.hole[1]===y){if(player.z===-2&&player.x===x&&player.y===y){player={x:x-1,y,z:0};say('回到地表');updateUI();render();return}if(player.z===0&&adjacent8(x,y)){if(held!=='pick'){say('挖洞：先在背包栏选中「镐子」');return}if(!pick){say('需要石镐');return}if(!holeDug){SFX.mine();holeDug=true;say('挖出入口！点击洞口即可下到矿层。');render();return}
      // ★ 二次确认：矿洞危险，需再点一次才进入（6 秒内有效）
      const _now=performance.now();
      if(!holeConfirmAt||_now-holeConfirmAt>6000){holeConfirmAt=_now;say('矿洞里面很危险，请佩戴武器（宝剑）。'+(extras.sword?'':'你还没有宝剑，建议先合成：铁块×1+宝石×1。')+'确认进入吗？再点一次洞口即可进入。',6000);render();return}
      holeConfirmAt=0;player={x,y,z:-2};focus=null;say('进入矿洞');updateUI();render();return}}
    if(isRock(x,y,player.z)){if(held!=='pick'){say('需要镐子');return}if(!pick){say('岩壁需要石镐。');return}if(!ensureStamina())return;SFX.mine();brokenRocks.add(k);bag.stone++;say('凿开岩壁：石材 +1');focus=null;updateUI();render();return}
    say('高度不够')}
  function shade(hex,factor){let vals=hex.slice(1).match(/../g).map(s=>Math.min(255,Math.round(parseInt(s,16)*factor)));return '#'+vals.map(v=>v.toString(16).padStart(2,'0')).join('')}
  function poly(pts,color,stroke){ctx.beginPath();ctx.moveTo(...pts[0]);for(let i=1;i<pts.length;i++)ctx.lineTo(...pts[i]);ctx.closePath();ctx.fillStyle=color;ctx.fill();if(stroke){ctx.lineWidth=1;ctx.strokeStyle=stroke;ctx.stroke()}}
  /* ★ 方形（等距投影的方格）：以 (cx,cy) 为中心、k 为缩放比（1=满格）的菱形四角 */
  function polyDia(g,cx,cy,k){const w=g.tw*.5*(k===undefined?1:k),h=g.th*.5*(k===undefined?1:k);return[[cx-w,cy],[cx,cy-h],[cx+w,cy],[cx,cy+h]]}
  function geo(){const w=canvas.clientWidth,h=canvas.clientHeight,available=Math.max(130,h-200),tw=Math.min(w/12,available/7.2,78),th=tw*.49;return{tw,th,ox:w*.46,oy:100+Math.max(0,(available-((W+H)*th*.5+tw*.8))/2)+tw*.5,zStep:tw*.52}}
  function pos(x,y,z,g){return{x:g.ox+(x-y)*g.tw*.5,y:g.oy+(x+y)*g.th*.5-z*g.zStep}}
  // One world unit is one equal-footprint, equal-height voxel throughout the map.
  function voxel(x,y,z,g,top){const p=pos(x,y,z,g),a=g.tw*.5,b=g.th*.5,depth=g.zStep;poly([[p.x-a,p.y],[p.x,p.y-b],[p.x+a,p.y],[p.x,p.y+b]],top,'#ffffff39');poly([[p.x-a,p.y],[p.x,p.y+b],[p.x,p.y+b+depth],[p.x-a,p.y+depth]],shade(top,.72));poly([[p.x+a,p.y],[p.x,p.y+b],[p.x,p.y+b+depth],[p.x+a,p.y+depth]],shade(top,.58))}
  function glyph(text,x,y,z,g,size=22,color='#fff'){const p=pos(x,y,z,g);ctx.textAlign='center';ctx.textBaseline='middle';ctx.font=`900 ${Math.max(15,Math.min(size,g.tw*.4))}px system-ui`;ctx.fillStyle=color;ctx.shadowColor='#153f46';ctx.shadowBlur=5;ctx.fillText(text,p.x,p.y-g.tw*.27);ctx.shadowBlur=0}
  function drawTree(x,y,z,g){ // 木材节点：树干木纹 + 分层树冠（★ 改动 4：降低树高 — 总高从 ~0.84s 降到 ~0.5s）
    const s=g.tw,p=pos(x,y,z,g);
    ctx.fillStyle='#16483945';ctx.beginPath();ctx.ellipse(p.x,p.y+2,s*.22,s*.09,0,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#7c5433';ctx.fillRect(p.x-s*.05,p.y-s*.26,s*.1,s*.28);
    ctx.strokeStyle='#5e3f22';ctx.lineWidth=1;
    for(const o of [-.028,-.004,.022]){ctx.beginPath();ctx.moveTo(p.x+s*o,p.y-s*.25);ctx.lineTo(p.x+s*o,p.y+s*.01);ctx.stroke()}
    ctx.strokeStyle='#8f6a41';ctx.beginPath();ctx.moveTo(p.x-s*.05,p.y-s*.15);ctx.lineTo(p.x+s*.05,p.y-s*.15);ctx.stroke();
    ctx.fillStyle='#4f8f45';ctx.beginPath();ctx.arc(p.x,p.y-s*.38,s*.16,0,Math.PI*2);ctx.fill();
    ctx.fillStyle='#66ab58';ctx.beginPath();ctx.arc(p.x-s*.07,p.y-s*.44,s*.09,0,Math.PI*2);ctx.fill();
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
  function drawPlayer(g){const p=pos(player.x,player.y,player.z,g),s=g.tw;ctx.fillStyle='#06465d66';ctx.beginPath();ctx.ellipse(p.x,p.y+5,s*.19,s*.08,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#f9dc95';ctx.fillRect(p.x-s*.085,p.y-s*.62,s*.17,s*.22);ctx.fillStyle='#efaf65';ctx.fillRect(p.x-s*.12,p.y-s*.69,s*.24,s*.07);ctx.fillStyle='#f7eed0';ctx.fillRect(p.x-s*.13,p.y-s*.38,s*.26,s*.23);ctx.fillStyle='#3c9fa2';ctx.fillRect(p.x-s*.11,p.y-s*.28,s*.22,s*.14);ctx.fillStyle='#fff2bd';ctx.beginPath();ctx.arc(p.x+s*.12,p.y-s*.58,s*.035,0,Math.PI*2);ctx.fill()}
  function render(){const w=canvas.clientWidth,h=canvas.clientHeight,g=geo(),d=DAYS[day];ctx.clearRect(0,0,w,h);let grd=ctx.createRadialGradient(w/2,h*.47,10,w/2,h*.47,w*.65);grd.addColorStop(0,'#7cb9af4d');grd.addColorStop(1,'#0a4e6c00');ctx.fillStyle=grd;ctx.fillRect(0,0,w,h);
    for(let sum=0;sum<W+H-1;sum++)for(let x=0;x<W;x++){const y=sum-x;if(y<0||y>=H)continue;const z=terrain(x,y),k=key(x,y),water=isWater(x,y),bridge=bridges.has(k),n=atNode(x,y,z),rock=isRock(x,y,z);
      for(let layer=-2;layer<=z;layer++){const top=layer===z,placed=(soilPlaced.get(k)||0)>0,excavated=soilHeights.has(k)&&z<baseTerrain(x,y);let col=layer===-2?'#667778':layer<z?'#987453':water&&!bridge?'#60bfd0':bridge?'#bb985e':placed?'#aa8050':excavated?'#b99065':z>=1?((x+y)%3===0?'#b98a55':'#c9995e'):z<0?'#798c83':(x+y)%3===0?'#94c777':'#9fd282';voxel(x,y,layer,g,col)}
      const rs=rockSoil.has(k);
      if(rs&&z>=1){ // ★ 岩土块：绿顶 + 岩石色侧面 + 岩石纹路（不可挖掘）
        const p=pos(x,y,z,g),a=g.tw*.5,b=g.th*.5,d2=g.zStep;
        poly([[p.x-a,p.y],[p.x,p.y+b],[p.x,p.y+b+d2],[p.x-a,p.y+d2]],'#7d857f');
        poly([[p.x+a,p.y],[p.x,p.y+b],[p.x,p.y+b+d2],[p.x+a,p.y+d2]],'#666e69');
        poly([[p.x-a,p.y],[p.x,p.y-b],[p.x+a,p.y],[p.x,p.y+b]],(x+y)%3===0?'#8fcf6f':'#9bd97d','#ffffff39');
        ctx.strokeStyle='#495349';ctx.lineWidth=1.2;
        ctx.beginPath();ctx.moveTo(p.x-a*.72,p.y+b*.3);ctx.lineTo(p.x-a*.3,p.y+b*.55+d2*.45);ctx.stroke();
        ctx.beginPath();ctx.moveTo(p.x-a*.9,p.y+b*.62);ctx.lineTo(p.x-a*.45,p.y+b*.82+d2*.25);ctx.stroke();
        ctx.beginPath();ctx.moveTo(p.x+a*.72,p.y+b*.3);ctx.lineTo(p.x+a*.3,p.y+b*.55+d2*.45);ctx.stroke();
        ctx.beginPath();ctx.moveTo(p.x+a*.9,p.y+b*.62);ctx.lineTo(p.x+a*.45,p.y+b*.82+d2*.25);ctx.stroke();
      }
      else if(z>=1&&(soilPlaced.get(k)||0)===0&&!(soilHeights.has(k)&&z<baseTerrain(x,y))){const p=pos(x,y,z,g),a=g.tw*.5,b=g.th*.5;poly([[p.x-a,p.y],[p.x,p.y-b],[p.x+a,p.y],[p.x,p.y+b]],(x+y)%3===0?'#8fcf6f':'#9bd97d','#ffffff39')}
      if(water&&!bridge){const p=pos(x,y,z,g);ctx.strokeStyle='#d9ffff99';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(p.x-g.tw*.15,p.y);ctx.lineTo(p.x+g.tw*.12,p.y-g.th*.08);ctx.stroke()}
      if(bridge){const p=pos(x,y,z,g);ctx.strokeStyle='#6f532f';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(p.x-g.tw*.26,p.y);ctx.lineTo(p.x+g.tw*.26,p.y);ctx.stroke()}
      if(rock){voxel(x,y,z+1,g,'#bdc6b1');glyph('⛏',x,y,z+1,g,22)}
      if(n&&n.type==='wood')drawTree(x,y,z,g);
      else if(n&&n.type==='stone')drawStone(x,y,z,g);
      else if(n&&n.type==='berry')drawBerry(x,y,z,g);
      else if(n)drawOre(x,y,z,g,n.type);
      if(d.ladder&&x===d.ladder[0]&&y===d.ladder[1]){glyph(ladderBuilt?'▤':'⇧',x,y,z,g,30,'#ffe899');if(!ladderBuilt){const p=pos(x,y,z,g);ctx.strokeStyle='#ffdd79';ctx.lineWidth=2;ctx.strokeRect(p.x-g.tw*.16,p.y-g.tw*.32,g.tw*.32,g.tw*.32)}}
      if(d.hole&&x===d.hole[0]&&y===d.hole[1]){const p=pos(x,y,z,g);ctx.fillStyle=holeDug?'#183c4f':'#6f8780';ctx.beginPath();ctx.ellipse(p.x,p.y,g.tw*.25,g.th*.27,0,0,Math.PI*2);ctx.fill();glyph(holeDug?'↓':'⊕',x,y,z,g,20,'#f9e69c')}
      if(d.goal&&x===d.goal[0]&&y===d.goal[1]&&goalShown()){ // ★ 终点：金色旗帜 + 光环；DAY4 需先与村民对话才出现
        const p=pos(x,y,z,g),pulse=4+Math.sin(performance.now()/320)*1.6;
        ctx.strokeStyle='#ffd75e';ctx.lineWidth=2.4;
        ctx.beginPath();ctx.ellipse(p.x,p.y,g.tw*.3,g.th*.16,0,0,Math.PI*2);ctx.stroke();
        ctx.strokeStyle='#ffd75e44';ctx.lineWidth=pulse;
        ctx.beginPath();ctx.ellipse(p.x,p.y,g.tw*.34,g.th*.19,0,0,Math.PI*2);ctx.stroke();
        glyph('\u2691',x,y,z,g,32,'#ffd75e');
      }
      drawEncounterActor(x,y,z,g);
      if(player.x===x&&player.y===y&&player.z===z)drawPlayer(g)
    }
    /* ★ 改动 2：交互范围可视化 —— 九宫格可选态（淡金虚线）+ 选中态（亮金脉冲粗描边） */
    if(phase==='playing'){
      const act=candidate();
      const diamond=(px,py,tw,th)=>{ctx.beginPath();ctx.moveTo(px-tw*.5,py);ctx.lineTo(px,py-th*.5);ctx.lineTo(px+tw*.5,py);ctx.lineTo(px,py+th*.5);ctx.closePath()};
      for(const c of candidates()){
        if(act&&c.x===act.x&&c.y===act.y)continue;
        const cz=terrain(c.x,c.y),cp=pos(c.x,c.y,cz,g);
        ctx.strokeStyle='#ffd75e70';ctx.lineWidth=2;
        diamond(cp.x,cp.y,g.tw,g.th);ctx.stroke();
      }
      if(act){
        const az=terrain(act.x,act.y),ap=pos(act.x,act.y,az,g);
        const pulse=3.2+Math.sin(performance.now()/170)*1.4;
        ctx.strokeStyle='#00000055';ctx.lineWidth=pulse+3;diamond(ap.x,ap.y,g.tw*.98,g.th*.98);ctx.stroke();
        ctx.strokeStyle='#fff2a6';ctx.lineWidth=pulse;diamond(ap.x,ap.y,g.tw,g.th);ctx.stroke();
      }
      if(focus&&(!act||focus.x!==act.x||focus.y!==act.y)){
        const fz=terrain(focus.x,focus.y),fp=pos(focus.x,focus.y,fz,g);
        ctx.strokeStyle='#7ee9ff';ctx.lineWidth=2;ctx.setLineDash([5,4]);
        diamond(fp.x,fp.y,g.tw,g.th);ctx.stroke();ctx.setLineDash([]);
      }
      /* ★ 挖土/放土目标格：脉冲高亮 + 橙色(可操作)/红色(不可操作) 区分，避免误判选中态 */
      if(!uiMode&&(held==='shovel'||held==='dirt')){
        const t=soilTarget();
        if(t&&inb(t.x,t.y)){
          const tz=terrain(t.x,t.y),tp=pos(t.x,t.y,tz,g);
          const err=soilCheck(held==='shovel'?'dig':'place',t.x,t.y);
          const pulse=3.4+Math.sin(performance.now()/160)*1.6;
          ctx.strokeStyle=err?'#ff6b6b':'#ffb347';
          ctx.lineWidth=pulse;diamond(tp.x,tp.y,g.tw,g.th);ctx.stroke();
          ctx.strokeStyle=err?'#ff6b6b55':'#ffb34755';
          ctx.lineWidth=pulse+3;diamond(tp.x,tp.y,g.tw*.96,g.th*.96);ctx.stroke();
          ctx.font='bold 14px system-ui';ctx.textAlign='center';
          ctx.fillStyle=err?'#ff8a8a':'#ffd98a';ctx.strokeStyle='#00000099';ctx.lineWidth=3;
          const mark=err?'✕':'✓';
          ctx.strokeText(mark,tp.x,tp.y-g.th*.95);ctx.fillText(mark,tp.x,tp.y-g.th*.95);
        }
      }
    }
    const home=pos(1,4,0,g);ctx.font='bold 13px system-ui';ctx.fillStyle='#e5fff0';ctx.textAlign='center';ctx.fillText('降落点',home.x,home.y+g.tw*.52)
  }
  function hit(clientX,clientY){const rect=canvas.getBoundingClientRect(),px=clientX-rect.left,py=clientY-rect.top,g=geo();let best=null,score=Infinity;for(let y=0;y<H;y++)for(let x=0;x<W;x++){const z=terrain(x,y),raised=!!atNode(x,y,z)||isRock(x,y,z),p=pos(x,y,z+(raised?1:0),g),dx=(px-p.x)/(g.tw*.5),dy=(py-p.y)/(g.th*.5),v=Math.abs(dx)+Math.abs(dy);if(v<score){score=v;best={x,y}}}return score<1.5?best:null}
  function resize(){let w=canvas.clientWidth||canvas.parentElement.clientWidth||800,h=canvas.clientHeight||canvas.parentElement.clientHeight||600;if(w<10)w=800;if(h<10)h=600;const dpr=Math.min(devicePixelRatio||1,2);canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);render()}
  canvas.addEventListener('click',e=>{const p=hit(e.clientX,e.clientY);if(p)clickTile(p.x,p.y)});
  document.addEventListener('keydown',e=>{if(phase!=='playing')return;if(uiMode){if(e.key==='Escape'){e.preventDefault();closeMobilePanels()}return}const dirs={w:[0,-1],W:[0,-1],ArrowUp:[0,-1],a:[-1,0],A:[-1,0],ArrowLeft:[-1,0],s:[0,1],S:[0,1],ArrowDown:[0,1],d:[1,0],D:[1,0],ArrowRight:[1,0]};if(dirs[e.key]){e.preventDefault();move(...dirs[e.key])}else if(e.key==='e'||e.key==='E'||e.key===' '){e.preventDefault();interact()}else if(e.key==='m'||e.key==='M'){e.preventDefault();showBag()}else if(e.key>='1'&&e.key<='9'){const s=BELT[+e.key-1];if(s)setHeld(s.id)}});
  document.querySelectorAll('[data-move]').forEach(b=>b.onclick=()=>move(...b.dataset.move.split(',').map(Number)));
  document.querySelectorAll('.day-card').forEach((b,i)=>b.onclick=()=>{if(i>=maxUnlocked)return;selectedDay=i;updateHome()});
  $('startTravel').onclick=()=>start(selectedDay);$('backHome').onclick=showHome;$('return').onclick=()=>finish('主动返程');$('interact').onclick=interact;$('craftPick').onclick=()=>craft('pick');const _cA=$('craftAxe');if(_cA)_cA.onclick=()=>craft('axe');const _cB=$('craftBucket');if(_cB)_cB.onclick=()=>craft('bucket');const _cS=$('craftSword');if(_cS)_cS.onclick=()=>craft('sword');const _cI=$('craftIronPick');if(_cI)_cI.onclick=()=>craft('ironPickaxe');$('retry').onclick=()=>start(day);$('resultHome').onclick=showHome;$('nextDay').onclick=()=>{selectedDay=day+1;start(selectedDay)};
  function animate(t){const dt=lastFrame===null?0:Math.min(.1,(t-lastFrame)/1000);lastFrame=t;if(phase==='playing'&&!uiMode){if(checkGoal())return;updateEncounters(dt);if(walk.length&&t-lastStep>165){lastStep=t;const step=walk.shift();if(canStepFrom(player.x,player.y,step.x,step.y)){facing=[step.x-player.x,step.y-player.y];player={x:step.x,y:step.y,z:terrain(step.x,step.y)};if(checkGoal())return;updateUI()}else{walk=[];say('道路被挡住了')}}render()}requestAnimationFrame(animate)}

  // Encounters use the same terrain, navigation and E interaction as gathering.
  let actors=[],crops=new Map(),encounterTime=0,lastFrame=null,blast=null,tradeOpen=false;
  const encounterTitles=['启程','村民','探险','重建'];
  const encounterHints=['制作斧头 → 砍木 → 建桥过河 → 采宝石 → 合成石镐 → 采蓝晶矿 → 终点。','走到被困村民身边与他对话即可救出他 → 两轮对话后获赠火晶矿 → 前往终点。（岩浆挡路时：挖土块+采石→合成斧头→砍树→合成石镐→采铁块→合成水桶→盛水扑灭）','前往矿洞，探索真相吧。先把土块挖出 → 采石块 → 合成斧头 → 砍树取木材 → 合成石镐 → 用石镐挖开右下角的矿洞口进入矿洞 → 到达终点。','与村民对话，答应「可以帮我重建我的世界吗？」→ 走到村中央的终点 ⛳，二次确认后完成旅行。'];
  function actorAt(x,y,z){return actors.find(a=>a.alive!==false&&a.x===x&&a.y===y&&a.z===z)}
  function resetEncounters(){encounterTime=0;lastFrame=null;blast=null;tradeOpen=false;extras={wheat:0,emerald:0,axe:false,bucket:false,waterBucket:false,sword:false,trappedSaved:false,invited:false,trappedTalk:false,creeperDefeated:false,defeatedCreepers:[],rebuildPromise:false,metFarmer:false};if(day===3)extras.axe=extras.bucket=extras.sword=extras.ironPickaxe=true;_extinguished=new Set();crops=new Map();actors=[];hitFlash=new Map();
    const d=DAYS[day];
    if(d.crops)for(const [x,y] of d.crops)crops.set(key(x,y),{x,y,z:0,readyAt:0});
    if(d.actors)for(const [type,x,y,z] of d.actors)actors.push({type,x,y,z,alive:type==='creeper'?true:undefined,opened:false,sheared:false,regrowAt:0,grassReadyAt:0,fuse:0,nextMove:0,happyUntil:0});
    $('encounterName').textContent=encounterTitles[day];$('encounterText').textContent=encounterHints[day];$('encounterNote').textContent=day===0?'活动简化交易：3 小麦换 1 绿宝石；作物生长已加速。':day===1?'活动内羊吃草与长草时间已加速；无需伤害绵羊。':day===2?'矿洞层：用「石镐」点右下角洞口挖开入口，再点一次进入；洞内僵尸可用「宝剑」（铁块×1+宝石×1）击退。':'自由建造日：已附送全套工具，背包资源 ×99，走到中央 ⛳ 终点即可完成 4 天旅行。';
  }
  function refreshEncounterUI(){if(!$('encounterBag'))return;const labels=[['wheat','🌾 小麦'],['emerald','💚 绿宝石']];$('encounterBag').innerHTML=labels.filter(([k])=>day<=1&&(extras[k]>0||day===0)).map(([k,label])=>`<span>${label} ×${extras[k]}</span>`).join('');$('trade').classList.toggle('hidden',!tradeOpen||day!==0);const farmer=actors.find(a=>a.type==='farmer');$('trade').disabled=phase!=='playing'||extras.wheat<3||!farmer||player.z!==farmer.z||!adjacent8(farmer.x,farmer.y);}
  function tradeWheat(){const farmer=actors.find(a=>a.type==='farmer');if(phase!=='playing'||!farmer||player.z!==farmer.z||!adjacent8(farmer.x,farmer.y)){say('先靠近村民');return}if(extras.wheat<3){say('小麦不足');return}extras.wheat-=3;extras.emerald++;farmer.happyUntil=encounterTime+1.4;$('encounterText').textContent='「嗯哼！」交易完成：绿宝石 +1。';say('绿宝石 +1');updateUI();render();}
  function interactEncounter(a){
    if(a.type==='farmer'){
      if(extras.trappedSaved){
        tradeOpen=true;$('encounterText').textContent='「嗯哼！」村民开心地拿出礼物：1 颗绿宝石。点击下方按钮确认。';refreshEncounterUI();say('');return
      }
      // DAY 1 村民（无 wheat 交易场景）— 默认说一句对话
      say('村民向你点头：欢迎来到我的世界。');return
    }
    if(a.type==='trapped_farmer'){
      if(!extras.trappedSaved){
        extras.trappedTalk=true;say('村民：救我！我被岩浆围住了！先把周围的岩浆扑灭吧。');return
      }
      // 已救出，提供邀请选择
      if(!extras.invited){
        $('encounterText').textContent='「谢谢你，恩人！」村民感激地说。是否邀请他回星居住？';
        $('inviteChoice').classList.remove('hidden');say('村民：谢谢你！请带我回星球吧。');return
      }
      say('村民：太棒了！欢迎我加入你们的星球。');return
    }
    if(a.type==='creeper')say('苦力怕不会交易！留意闪白，及时退开。');
  }
  function updateEncounters(dt){encounterTime+=dt;let changed=false;for(const a of actors){
      // 不动苦力怕：原地不动，仅当玩家点击时由 interact 逻辑击退
      if(a.type==='creeper_static')continue
      // 被困村民：检测周围岩浆是否全部扑灭 → 设为已救出
      if(a.type==='trapped_farmer'&&!extras.trappedSaved){
        const d=DAYS[day];
        const allOut=d.lava.every(p=>_extinguished.has(key(p[0],p[1])));
        if(allOut){
          extras.trappedSaved=true;a.type='farmer';
          say('村民已走出岩浆，向你道谢。');changed=true
        }
      }
      if(a.type!=='creeper'||a.alive===false)continue;
      const dist=player.z===a.z?Math.abs(player.x-a.x)+Math.abs(player.y-a.y):Infinity;
      if(dist<=1){if(a.fuse===0){walk=[];say('嘶——苦力怕正在蓄爆！立刻退开！')};a.fuse+=dt;if(a.fuse>=1.5){a.alive=false;blast={x:a.x,y:a.y,z:a.z,until:encounterTime+.65};let cleared=0;for(const [x,y] of DAYS[day].rocks){if((x-a.x)**2+(y-a.y)**2<=2.56&&!brokenRocks.has(key(x,y))){brokenRocks.add(key(x,y));bag.stone++;cleared++}}
          const hit=player.z===a.z&&(player.x-a.x)**2+(player.y-a.y)**2<=2.56;if(hit){player={x:7,y:6,z:-2};focus=null;walk=[];say('\u7206\u70B8\uFF01\u4F60\u88AB\u9707\u56DE\u4E86\u964D\u843D\u70B9')}else say(cleared?'岩壁被炸开':'成功躲过爆炸');$('encounterText').textContent=cleared?'苦力怕的爆炸改变了地形，岩壁已被炸开。继续寻找蓝晶矿吧。':'苦力怕已消失，继续寻找蓝晶矿吧。';changed=true}}
      else{if(a.fuse>0){a.fuse=0;say('已脱离危险')}if(dist<=4&&encounterTime>=a.nextMove){a.nextMove=encounterTime+.8;const options=[[1,0],[-1,0],[0,1],[0,-1]].map(([dx,dy])=>({x:a.x+dx,y:a.y+dy})).filter(p=>canStand(p.x,p.y,a.z)&&!(p.x===player.x&&p.y===player.y));options.sort((p,q)=>(Math.abs(p.x-player.x)+Math.abs(p.y-player.y))-(Math.abs(q.x-player.x)+Math.abs(q.y-player.y)));if(options[0]&&Math.abs(options[0].x-player.x)+Math.abs(options[0].y-player.y)<dist){a.x=options[0].x;a.y=options[0].y;changed=true}}}
    }if(changed)updateUI();if(blast&&encounterTime>=blast.until)blast=null;
  }
  function drawEncounterActor(x,y,z,g){
    const p=pos(x,y,z,g),s=g.tw,crop=crops.get(key(x,y)),a=actorAt(x,y,z);
    if(crop){const ready=encounterTime>=crop.readyAt;ctx.strokeStyle=ready?'#e9bc48':'#40824a';ctx.lineWidth=Math.max(2,s*.035);for(const offset of [-.15,0,.15]){ctx.beginPath();ctx.moveTo(p.x+s*offset,p.y);ctx.lineTo(p.x+s*offset,p.y-s*(ready?.32:.1));ctx.stroke();if(ready){ctx.fillStyle='#ffe38c';ctx.fillRect(p.x+s*offset-3,p.y-s*.32,6,s*.15)}}}
    // 水源（蓝色方格波纹）
    if(isWaterSource(x,y,z)){
      ctx.save();ctx.translate(p.x,p.y);
      // ★ 方形呈现（贴合格子的菱形方格）
      poly(polyDia(g,0,s*.08,.98),'#3f8fa8');
      poly(polyDia(g,0,s*.03,.9),'#5cbcd6');
      poly(polyDia(g,0,-s*.02+Math.sin(encounterTime*2.5)*s*.03,.64),'#a9e1f3');
      poly(polyDia(g,-s*.14,-s*.11,.24),'#d8f4ff');
      ctx.restore();
      ctx.font=`bold ${Math.max(11,Math.min(13,s*.21))}px system-ui`;ctx.textAlign='center';ctx.fillStyle='#caf0fa';ctx.strokeStyle='#1c4d6e';ctx.lineWidth=3;ctx.strokeText('💧 水源',p.x,p.y-s*.72);ctx.fillText('💧 水源',p.x,p.y-s*.72);return
    }
    // 岩浆（橙红方格 + 脉动高光）
    if(isLava(x,y)){
      ctx.save();ctx.translate(p.x,p.y);
      const pulse=.5+.5*Math.sin(encounterTime*4);
      // ★ 方形呈现（贴合格子的菱形方格）
      poly(polyDia(g,0,s*.1,.99),'#3a1410');
      poly(polyDia(g,0,s*.04,.9),pulse>.5?'#ff6a3c':'#e2531f');
      poly(polyDia(g,-s*.09,-s*.05,.44),pulse>.5?'#ffce6a':'#ffa843');
      poly(polyDia(g,s*.15,-s*.08,.24),'#ffd07a');
      ctx.restore();
      ctx.font=`bold ${Math.max(11,Math.min(13,s*.21))}px system-ui`;ctx.textAlign='center';ctx.fillStyle='#ffd07a';ctx.strokeStyle='#3a1410';ctx.lineWidth=3;ctx.strokeText('🔥 岩浆',p.x,p.y-s*.78);ctx.fillText('🔥 岩浆',p.x,p.y-s*.78);return
    }
    if(!a)return;
    ctx.save();ctx.translate(p.x,p.y);
    ctx.fillStyle='#16483945';ctx.beginPath();ctx.ellipse(0,4,s*.24,s*.1,0,0,Math.PI*2);ctx.fill();
    if(a.type==='farmer'){ctx.fillStyle='#936241';ctx.fillRect(-s*.13,-s*.43,s*.26,s*.43);ctx.fillStyle='#ce9d79';ctx.fillRect(-s*.12,-s*.66,s*.24,s*.24);ctx.fillStyle='#e5c570';ctx.fillRect(-s*.2,-s*.68,s*.4,s*.07);ctx.fillRect(-s*.13,-s*.78,s*.26,s*.12);ctx.fillStyle='#294d32';ctx.fillRect(-s*.08,-s*.58,s*.04,s*.04);ctx.fillRect(s*.04,-s*.58,s*.04,s*.04);ctx.fillStyle='#af7756';ctx.fillRect(-s*.015,-s*.55,s*.075,s*.13);ctx.fillStyle='#714e36';ctx.fillRect(-s*.18,-s*.31,s*.36,s*.09)}
    else if(a.type==='trapped_farmer'){
      // 村民被围（火焰环）+ 流泪求助
      ctx.fillStyle='#936241';ctx.fillRect(-s*.13,-s*.43,s*.26,s*.43);ctx.fillStyle='#ce9d79';ctx.fillRect(-s*.12,-s*.66,s*.24,s*.24);ctx.fillStyle='#e5c570';ctx.fillRect(-s*.2,-s*.68,s*.4,s*.07);ctx.fillRect(-s*.13,-s*.78,s*.26,s*.12);
      // 围困火焰
      ctx.fillStyle='#ff6a3c';for(const f of [[-.28,-.4],[.26,-.42],[-.3,-.18],[.28,-.2]])ctx.beginPath(),ctx.arc(f[0]*s,f[1]*s,s*.07,0,Math.PI*2),ctx.fill();
      ctx.fillStyle='#ffd07a';for(const f of [[-.28,-.4],[.26,-.42],[-.3,-.18],[.28,-.2]])ctx.beginPath(),ctx.arc(f[0]*s,f[1]*s,s*.035,0,Math.PI*2),ctx.fill();
    }
    else if(a.type==='creeper'){if(a.fuse>0){ctx.strokeStyle='#ffc080';ctx.lineWidth=3;ctx.beginPath();ctx.ellipse(0,3,s*.43,s*.22,0,0,Math.PI*2);ctx.stroke()}ctx.fillStyle=a.fuse>0&&Math.floor(encounterTime*12)%2===0?'#fff5df':'#6ab959';ctx.fillRect(-s*.12,-s*.4,s*.24,s*.33);ctx.fillRect(-s*.2,-s*.7,s*.4,s*.3);ctx.fillRect(-s*.19,-s*.09,s*.13,s*.15);ctx.fillRect(s*.06,-s*.09,s*.13,s*.15);ctx.fillStyle='#203c2a';ctx.fillRect(-s*.12,-s*.62,s*.08,s*.07);ctx.fillRect(s*.04,-s*.62,s*.08,s*.07);ctx.fillRect(-s*.035,-s*.55,s*.07,s*.07);ctx.fillRect(-s*.085,-s*.5,s*.17,s*.07);ctx.fillRect(-s*.085,-s*.45,s*.045,s*.035);ctx.fillRect(s*.04,-s*.45,s*.045,s*.035)}
    else if(a.type==='zombie_static'){const defeated=extras.defeatedCreepers.includes(key(x,y));const flash=hitFlash.get(key(x,y))>encounterTime;if(!defeated){const skin=flash?'#ffffff':(Math.floor(encounterTime*8)%2?'#7da66b':'#6b9461');const cloth=flash?'#ffffff':'#5a4a3a';const cloth2=flash?'#ffffff':'#3e342a';const eyes=flash?'#ffffff':'#ff3a3a';ctx.fillStyle=cloth;ctx.fillRect(-s*.2,-s*.18,s*.4,s*.27);ctx.fillRect(-s*.19,-s*.09,s*.13,s*.15);ctx.fillRect(s*.06,-s*.09,s*.13,s*.15);ctx.fillStyle=skin;ctx.fillRect(-s*.13,-s*.45,s*.26,s*.3);ctx.fillRect(-s*.16,-s*.7,s*.32,s*.28);ctx.fillStyle=cloth2;ctx.fillRect(-s*.16,-s*.7,s*.32,s*.04);ctx.fillRect(s*.12,-s*.5,s*.04,s*.18);ctx.fillStyle=cloth;ctx.fillRect(s*.13,-s*.4,s*.11,s*.22);ctx.fillRect(s*.18,-s*.22,s*.06,s*.18);ctx.fillStyle=eyes;ctx.fillRect(-s*.1,-s*.62,s*.05,s*.05);ctx.fillRect(s*.05,-s*.62,s*.05,s*.05);ctx.fillStyle=flash?'#ff4040':'#3a1a1a';ctx.fillRect(-s*.04,-s*.52,s*.08,s*.04);if(flash){ctx.fillStyle='rgba(255,255,255,.6)';ctx.fillRect(-s*.25,-s*.75,s*.5,s*.85)}}else{ctx.fillStyle='#3a4a3e';ctx.fillRect(-s*.16,-s*.12,s*.32,s*.06);ctx.fillRect(-s*.12,-s*.16,s*.24,s*.05);ctx.fillStyle='#5a4a3a';ctx.fillRect(-s*.16,-s*.12,s*.32,s*.06);ctx.fillStyle='#2a3a2e';ctx.fillRect(-s*.14,-s*.3,s*.28,s*.18);ctx.fillStyle='#6a5a4a';ctx.fillRect(-s*.04,-s*.3,s*.08,s*.06)}}
    else if(a.type==='treasure'){const flash=hitFlash.get(key(x,y))>encounterTime;ctx.fillStyle='#7a4f22';ctx.fillRect(-s*.28,-s*.32,s*.56,s*.34);ctx.fillStyle='#c9913f';ctx.fillRect(-s*.3,-s*.42,s*.6,s*.13);ctx.fillStyle='#ffe08a';ctx.fillRect(-s*.06,-s*.3,s*.12,s*.16);ctx.fillStyle=flash?'#ffffff':'#5a3a18';ctx.fillRect(-s*.28,-s*.32,s*.56,s*.05)}
    ctx.restore();
    ctx.font=`bold ${Math.max(11,Math.min(13,s*.21))}px system-ui`;ctx.textAlign='center';
    const label=a.type==='farmer'?(extras.invited?'村民（已入住）':'农民村民'):a.type==='trapped_farmer'?'被困村民':a.type==='creeper'?(a.fuse>0?'嘶——快退开！':'苦力怕'):a.type==='zombie_static'?(extras.defeatedCreepers.includes(key(x,y))?'僵尸（已击退）':'僵尸'):a.type==='treasure'?'宝箱 · 待开启':'对象';
    ctx.fillStyle=a.type==='creeper'||a.type==='zombie_static'?'#fff0b7':a.type==='treasure'?'#ffe08a':'#faffdf';ctx.strokeStyle='#255b5b';ctx.lineWidth=3;ctx.strokeText(label,p.x,p.y-s*.88);ctx.fillText(label,p.x,p.y-s*.88);
    if(a.happyUntil>encounterTime){ctx.fillStyle='#93f38e';ctx.fillText('✦ 交易成功',p.x,p.y-s*1.1)}
  }
  const originalSpecial=special;special=function(x,y){return originalSpecial(x,y)||!!actorAt(x,y,terrain(x,y))||crops.has(key(x,y))};
  const originalCanStand=canStand;canStand=function(x,y,z){return originalCanStand(x,y,z)&&!actorAt(x,y,z)&&!crops.has(key(x,y))};
  const originalReset=resetGame;resetGame=function(i){originalReset(i);resetEncounters();updateUI()};
  const originalUI=updateUI;updateUI=function(){originalUI();refreshEncounterUI()};
  // ★ 改动 1/2：九宫格判定（adjacent8）；只有「采集成功」才扣体力（对话/未成熟不扣）
  const originalInteract=interact;interact=function(){if(phase!=='playing')return;const c=candidate();if(c&&adjacent8(c.x,c.y)){const a=actorAt(c.x,c.y,player.z),crop=crops.get(key(c.x,c.y));if(a){walk=[];if(a.type==='zombie_static'||a.type==='creeper_static'){attackZombie(a)}else if(a.type==='treasure'){lootTreasure(a)}else interactEncounter(a);render();return}if(crop&&crop.z===player.z){if(encounterTime<crop.readyAt){say('小麦未成熟');return}if(!ensureStamina())return;SFX.berry();extras.wheat+=3;crop.readyAt=encounterTime+20;say('小麦 +3');updateUI();render();return}}originalInteract()};
  const originalFinish=finish;finish=function(reason){if(phase!=='playing')return;originalFinish(reason);$('resultItems').innerHTML+=`${extras.emerald?`<span>💚 绿宝石 ×${extras.emerald}</span>`:''}${extras.wheat?`<span>🌾 小麦 ×${extras.wheat}</span>`:''}`};
  const originalRender=render;render=function(){originalRender();if(blast){const g=geo(),p=pos(blast.x,blast.y,blast.z,g);ctx.save();ctx.globalAlpha=Math.max(0,(blast.until-encounterTime)/.65);ctx.fillStyle='#ffe6a8';ctx.beginPath();ctx.ellipse(p.x,p.y-g.tw*.2,g.tw*.7,g.tw*.5,0,0,Math.PI*2);ctx.fill();ctx.restore()}};
  $('trade').onclick=tradeWheat;
  let uiMode=null,dialogueActor=null,panelReturnFocus=null,holdTimer=null;
  function closeMobilePanels(){if(questConfirmOpen)questConfirmDismissed=true;uiMode=null;dialogueActor=null;tradeOpen=false;questConfirmOpen=false;clearInterval(holdTimer);holdTimer=null;$('npcDialogue').classList.add('hidden');$('bagOverlay').classList.add('hidden');$('tutorialOverlay').classList.add('hidden');$('game').inert=false;lastFrame=null;panelReturnFocus?.focus?.();panelReturnFocus=null;refreshEncounterUI()}
  function showBag(){if(phase!=='playing'||uiMode)return;panelReturnFocus=document.activeElement;uiMode='bag';walk=[];clearInterval(holdTimer);$('game').inert=true;$('bagOverlay').classList.remove('hidden');updateUI();$('closeBag').focus?.()}
  // ★ 新手指南：每次进入关卡时弹出
  function showTutorial(){if(phase!=='playing'||uiMode)return;panelReturnFocus=null;uiMode='tutorial';walk=[];clearInterval(holdTimer);$('game').inert=true;$('tutorialOverlay').classList.remove('hidden');$('tutStart').focus?.()}
  function portrait(a){render();const out=$('npcPortrait'),pc=out.getContext('2d'),g=geo(),p=pos(a.x,a.y,a.z,g),scale=canvas.width/canvas.clientWidth;pc.clearRect(0,0,out.width,out.height);pc.imageSmoothingEnabled=false;pc.drawImage(canvas,(p.x-g.tw*.7)*scale,(p.y-g.tw*1.1)*scale,g.tw*1.4*scale,g.tw*1.4*scale,0,0,out.width,out.height)}
  function dialogueCopy(){const a=dialogueActor;if(!a)return;const action=$('dialogueAction');action.classList.add('hidden');$('trade').classList.add('hidden');$('inviteChoice').classList.add('hidden');$('dialogueContinue').classList.remove('hidden');
    // ★ 修复：先清空文案。resetEncounters() 会把关卡引导语写进同一组 DOM（encounterName/Text/Note），
    //    若对话分支没覆盖到，就会显示上一个面板的残留内容。
    $('encounterText').textContent='';$('encounterNote').textContent='';
    $('encounterName').textContent=a.type==='farmer'?'农民村民':(a.type==='zombie_static'||a.type==='creeper_static')?'苦力怕':'苦力怕';
    // ★ DAY4：抵达终点的二次确认（复用对话面板，不新增 DOM / 样式）
    if(questConfirmOpen){
      $('encounterName').textContent='方块星球';
      $('encounterText').textContent='感谢您为方块星球作出的贡献，离开后作品将会上传活动作品集。';
      $('encounterNote').textContent='确认后即完成本次旅行。';
      action.textContent='确认离开';action.classList.remove('hidden');
      $('dialogueContinue').classList.add('hidden'); // ★ DAY4 二次确认只保留「确认离开」
      return;
    }
    // ★ 修复：僵尸类只作说明（正常应由 attackZombie 拦截，不会走到这里）
    if(a.type==='zombie_static'||a.type==='creeper_static'){
      $('encounterText').textContent='它僵硬地站着，皮肤泛着灰绿的光，对你的靠近没有任何回应。';
      $('encounterNote').textContent='合成「宝剑」（铁块×1+宝石×1）并选中后攻击它，即可击退。';
      return;
    }
    // ★ DAY2「村民」：获救后的两段式对话
    if(a.type==='farmer'&&day===1&&extras.trappedSaved){
      $('encounterName').textContent='村民';
      if(farmerTalk===0){
        $('encounterText').textContent='感谢您救了我，好心人！我是「我的世界」的村民。这些是给你的报酬。';
        action.textContent='不客气，我是「好梦星」的主人「xxx」';
      
      }else{
        $('encounterText').textContent='这太神奇了，我们的世界遭遇了一场变故，我得想办法躲避危险……';
        action.textContent='不介意的话，可以来我的星球暂住';
      }
      action.classList.remove('hidden');
      $('dialogueContinue').classList.add('hidden'); // ★ DAY2 取消「结束对话」按钮
      return;
    }
    // ★ DAY4「重建」：村民询问能否帮他重建（取代原小麦交易）
    if(a.type==='farmer'&&day===3){
      $('encounterName').textContent='村民';
      const wrap=$('inviteChoice');
      if(!extras.rebuildPromise){
        $('encounterText').textContent='「可以帮我重建我的世界吗？」村民期待地看着你。';
        $('encounterNote').textContent='答应他后，走到村中央的终点 ⛳ 完成旅行。';
        $('inviteYes').textContent='没问题';
        $('inviteNo').textContent='我再想想';
        $('inviteNo').classList.remove('hidden'); // ★ DAY4 需要两个选项，恢复「我再想想」按钮
        wrap.classList.remove('hidden');
      }else{
        $('encounterText').textContent='「太感谢了！剩下的交给我们吧。」村民笑着继续忙碌。';
        $('encounterNote').textContent='走到村中央的终点 ⛳，确认后完成旅行。';
      }
      $('dialogueContinue').classList.add('hidden'); // ★ DAY4 村民对话取消「结束对话」按钮
      return;
    }
    // ★ DAY2 被困村民：showDialogue 已就地转为「已救出」，这里只作兜底（绝不会显示求救语）
    if(a.type==='trapped_farmer'){extras.trappedSaved=true;a.type='farmer';dialogueCopy();return}
    if(a.type==='farmer'){tradeOpen=true;$('encounterText').textContent=`「嗯哼！」你带来了小麦吗？我愿意用一颗绿宝石换三份小麦。\n你现在有 ${extras.wheat} 份小麦。`;$('encounterNote').textContent='活动交易：小麦 ×3 → 绿宝石 ×1';refreshEncounterUI()}
    if(a.type==='creeper'){$('encounterText').textContent='「嘶……」它没有回应，只是盯着你。继续旅行后留意距离：靠得太近，它会闪白并准备爆炸。';$('encounterNote').textContent='及时退开可以中断蓄爆。爆炸可能炸开附近岩壁。'}
  }
  // ★ DAY2：只要与被困村民对话，即视为解救成功 → 直接进入两段式对话（不再显示求救对白）
  function showDialogue(a){if(phase!=='playing'||uiMode)return;if(day===1&&a.type==='trapped_farmer'){extras.trappedSaved=true;a.type='farmer'}if(day===3&&a.type==='farmer')extras.metFarmer=true;/* ★ DAY4：与村民对话后终点才出现 */panelReturnFocus=document.activeElement;dialogueActor=a;uiMode='dialogue';walk=[];clearInterval(holdTimer);$('game').inert=true;dialogueCopy();portrait(a);$('npcDialogue').classList.remove('hidden');$('dialogueContinue').focus?.()}
  // ★ DAY4：抵达终点时的二次确认（复用对话面板；没有任何村民时用玩家所在格做立绘）
  function showQuestConfirm(){
    if(phase!=='playing'||uiMode)return;
    questConfirmOpen=true;panelReturnFocus=document.activeElement;
    const who=actors.find(a=>a.alive!==false&&a.type==='farmer')||{type:'quest_confirm',x:player.x,y:player.y,z:player.z};
    dialogueActor=who;uiMode='dialogue';walk=[];pendingAction=null;clearInterval(holdTimer);$('game').inert=true;
    dialogueCopy();portrait(who);$('npcDialogue').classList.remove('hidden');$('dialogueAction').focus?.();
  }
  function confirmDialogue(){if(questConfirmOpen){questConfirmOpen=false;closeMobilePanels();finish('到达终点 ✦');return}const a=dialogueActor;if(uiMode!=='dialogue'||!a||!adjacent8(a.x,a.y)||player.z!==a.z)return;if(day===1&&a.type==='farmer'&&extras.trappedSaved){if(farmerTalk===0){farmerTalk=1;dialogueCopy();return}endFarmerTalk();return}portrait(a)}
  const immediateEncounter=interactEncounter;interactEncounter=function(a){showDialogue(a)};
  const mobileTrade=tradeWheat;tradeWheat=function(){mobileTrade();if(uiMode==='dialogue'&&dialogueActor?.type==='farmer')portrait(dialogueActor)};
  const mobileMove=move;move=function(dx,dy){if(!uiMode)mobileMove(dx,dy)};
  const mobileClick=clickTile;clickTile=function(x,y){if(!uiMode)mobileClick(x,y)};
  const mobileInteract=interact;interact=function(){if(!uiMode)mobileInteract()};
  const mobileUI=updateUI;updateUI=function(){mobileUI();for(const [id,value] of [['quickWood',bag.wood],['quickStone',bag.stone],['quickOre',bag.ore],['quickBerry',bag.berry||0],['quickIron',bag.iron||0],['quickGem',bag.gem]]){const el=$(id);if(el)el.textContent=value}const target=candidate();let label='交互';if(target){const a=actorAt(target.x,target.y,player.z),n=atNode(target.x,target.y,player.z);if(a){const AL={farmer:'对话',trapped_farmer:'对话',zombie_static:'攻击',creeper_static:'攻击',treasure:'开宝箱',creeper:'观察'};label=AL[a.type]||'观察'}else if(n)label=n.type==='wood'?'砍树':'采矿';else if(crops.has(key(target.x,target.y)))label='收割';else if(isWater(target.x,target.y))label='搭桥'}const al=$('actionLabel');if(al)al.textContent=label};
  // ★ DAY2「村民」：对话结束 → 村民离场并给出报酬
  function endFarmerTalk(){
    const a=dialogueActor;
    closeMobilePanels();
    if(a)a.alive=false;
    if(!extras.invited){extras.invited=true;bag.fireOre+=1;say('村民带着谢意离开了，留下报酬：火晶矿 ×1')}
    else say('村民离开了。');
    updateUI();render();
  }
  function acceptInvite(){
    // ★ DAY2 村民 · 选项1：追问他的遭遇（进入第二段对话）
    if(day===1&&dialogueActor&&dialogueActor.type==='farmer'&&extras.trappedSaved&&farmerTalk===0){farmerTalk=1;dialogueCopy();return}
    // ★ DAY4「重建」· 选项「没问题」：记下承诺，走到终点时二次确认
    if(day===3&&dialogueActor&&dialogueActor.type==='farmer'){extras.rebuildPromise=true;SFX.berry();say('你答应了村民：帮他重建「我的世界」。');dialogueCopy();render();return}
    extras.invited=true;
    if(day===1){bag.fireOre+=1;say('村民感激地送你 1 颗火晶矿！')}
    else if(bag.gem>0||bag.fireOre>0){say('村民接受了邀请，回到星球与你同住。')}
    else {bag.ore+=1;say('村民接受了邀请，并赠你 1 颗蓝晶矿！')}
    $('inviteChoice').classList.add('hidden');
    updateUI();render()
  }
  function declineInvite(){
    // ★ DAY2 村民 · 选项2：直接结束对话，村民消失
    if(day===1&&dialogueActor&&dialogueActor.type==='farmer'&&extras.trappedSaved){endFarmerTalk();return}
    // ★ DAY4「重建」· 选项「我再想想」：结束对话，可再次交谈
    if(day===3&&dialogueActor&&dialogueActor.type==='farmer'){say('村民：好的，我等你。');closeMobilePanels();return}
    extras.invited=false;say('村民：好吧，谢谢你救了我。');
    $('inviteChoice').classList.add('hidden');render()
  }
  $('openBag').onclick=showBag;$('quickCraft').onclick=showBag;$('tutStart').onclick=closeMobilePanels;$('openTutorial').onclick=showTutorial;$('closeBag').onclick=closeMobilePanels;$('closeDialogue').onclick=closeMobilePanels;$('dialogueContinue').onclick=closeMobilePanels;$('dialogueAction').onclick=confirmDialogue;$('trade').onclick=()=>tradeWheat();$('interact').onclick=()=>interact();$('backHome').onclick=()=>{closeMobilePanels();showHome()};
  const invY=$('inviteYes'),invN=$('inviteNo');if(invY)invY.onclick=acceptInvite;if(invN)invN.onclick=declineInvite;
  const cA=$('craftAxe'),cB=$('craftBucket'),cS=$('craftSword'),cI=$('craftIronPick');if(cA)cA.onclick=()=>craft('axe');if(cB)cB.onclick=()=>craft('bucket');if(cS)cS.onclick=()=>craft('sword');if(cI)cI.onclick=()=>craft('ironPickaxe');
  $('bagOverlay').addEventListener('click',e=>{if(e.target===$('bagOverlay'))closeMobilePanels()});
  document.querySelectorAll('[data-move]').forEach(b=>{b.onclick=e=>{if(e.detail===0)move(...b.dataset.move.split(',').map(Number))};b.addEventListener('pointerdown',e=>{e.preventDefault();clearInterval(holdTimer);if(uiMode)return;const dir=b.dataset.move.split(',').map(Number);move(...dir);holdTimer=setInterval(()=>move(...dir),160);b.setPointerCapture?.(e.pointerId)})});
  const releasePad=()=>{clearInterval(holdTimer);holdTimer=null};window.addEventListener('pointerup',releasePad);window.addEventListener('pointercancel',releasePad);window.addEventListener('blur',releasePad);
  document.addEventListener('keydown',e=>{if(!uiMode||e.key!=='Tab')return;const root=$(uiMode==='dialogue'?'npcDialogue':'bagOverlay');const buttons=[...root.querySelectorAll('button:not([disabled]):not(.hidden)')];if(!buttons.length)return;const first=buttons[0],last=buttons[buttons.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}});
  function soilTarget(){if(focus&&adjacent8(focus.x,focus.y))return focus;const x=player.x+facing[0],y=player.y+facing[1];return inb(x,y)?{x,y}:null}
  function soilCheck(mode,x,y){if(!inb(x,y)||!adjacent8(x,y))return '先靠近地块';const d=DAYS[day],k=key(x,y),h=terrain(x,y),base=baseTerrain(x,y);if(rockSoil.has(k))return '\u5CA9\u571F\u5757\u65E0\u6CD5\u6316\u6398';if((x===1&&y===4)||[d.ladder,d.hole].some(p=>p&&p[1]===y&&(p[0]===x||p[0]-1===x)))return '这里需要保留';if(nodes.has(k)||actors.some(a=>a.alive!==false&&a.x===x&&a.y===y)||crops.has(k)||isRock(x,y,base)||bridges.has(k))return '地块被占用';if(mode==='dig'){if(isWater(x,y))return '水面没有土块';if(h<1)return '草地无法挖掘（只能挖土块地块）';if(Math.abs(h-player.z)>1)return '够不到';if(h<=-2)return '已挖到岩层'}else{if(rockSoil.has(k))return '\u5CA9\u571F\u5757\u65E0\u6CD5\u653E\u7F6E';if(!(bag.dirt>0))return '土块不足';if(h>player.z+1||h<player.z-2)return '够不到';if(h>=3)return '已到高度上限'}return null}
  function soilDigAt(x,y){if(phase!=='playing'||uiMode)return false;const error=soilCheck('dig',x,y);if(error){say(error);return false}if(!ensureStamina())return false;walk=[];const k=key(x,y),h=terrain(x,y),placed=soilPlaced.get(k)||0;
    if(placed>0){if(placed===1&&soilWater.has(k)){soilWater.delete(k);soilHeights.delete(k)}else soilHeights.set(k,h-1);if(placed===1)soilPlaced.delete(k);else soilPlaced.set(k,placed-1)}else soilHeights.set(k,h-1);bag.dirt=(bag.dirt||0)+1;say('土块 +1');updateUI();render();return true}
  function soilPlaceAt(x,y){if(phase!=='playing'||uiMode)return false;const error=soilCheck('place',x,y);if(error){say(error);return false}if(!ensureStamina())return false;walk=[];const k=key(x,y),h=terrain(x,y),placed=soilPlaced.get(k)||0;
    if(isWater(x,y)){soilWater.add(k);soilHeights.set(k,0)}else soilHeights.set(k,h+1);soilPlaced.set(k,placed+1);bag.dirt--;say('土块 −1');updateUI();render();return true}
  const soilReset=resetGame;resetGame=function(i){soilHeights=new Map();soilPlaced=new Map();soilWater=new Set();rockSoil=new Set();soilReset(i);bag.dirt=(day===3?99:0);
    // ★ 根据 DAYS[day].dirt 初始化预设土块地形（玩家初始可铲的 dirt 格子）
    const dd=DAYS[day];
    if(dd&&dd.dirt&&dd.dirt.length){for(const [x,y] of dd.dirt)soilHeights.set(key(x,y),1)} // terrain height only: keep the same look as the editor (no "player-placed" tint)
    // ★ 岩土块：高度同土块，但不可挖掘
    if(dd&&dd.rockSoil)for(const [x,y] of dd.rockSoil)rockSoil.add(key(x,y));
    // ★ 起点 z 与地形对齐（当关卡起点位于 cliff/土块等高台上时，避免 player.z 与实际地形不一致）
    player.z=terrain(player.x,player.y);
    updateUI()};
  const soilUI=updateUI;updateUI=function(){soilUI();$('dirt').textContent=bag.dirt||0;$('quickDirt').textContent=bag.dirt||0};
  const soilFinish=finish;finish=function(reason){if(phase!=='playing')return;soilFinish(reason);if(bag.dirt)$('resultItems').innerHTML+=`<span>土块 ×${bag.dirt}</span>`};
  /* ===== 背包工具栏：选中工具/物资后点击地图目标，自动走近并执行 ===== */
  const BELT=[
    {id:'hand',icon:'✋',name:'空手',hint:'可采石块/果子'},
    {id:'shovel',icon:'🪏',name:'铲子',hint:'点击相邻地块挖土'},
    {id:'axe',icon:'🪓',name:'斧头',hint:'可砍伐树木'},
    {id:'pick',icon:'⛏',name:'石镐',hint:'可开采铁矿'},
    {id:'ironPick',icon:'⛏',name:'铁镐',hint:'可开采宝石、火晶矿'},
    {id:'bucket',icon:'🪣',name:'水桶',hint:'点水源盛水'},
    {id:'sword',icon:'🗡',name:'宝剑',hint:'选中后攻击，消耗 3 体力'},
    {id:'wood',icon:'🪵',name:'木材',hint:'点击河面搭桥'},
    {id:'stone',icon:'🪨',name:'石材',hint:'可合成工具'},
    {id:'ore',icon:'💎',name:'蓝晶矿',hint:'稀有资源'},
    {id:'gem',icon:'💠',name:'宝石',hint:'稀有资源'},
    {id:'dirt',icon:'<i class="dirt-icon"></i>',name:'土块',hint:'可合成工具'},
    {id:'iron',icon:'⛓',name:'铁块',hint:'可合成工具'}
  ];
  const beltEl=document.createElement('div');beltEl.id='toolbelt';
  // ★ 工具槽位 vs 资源槽位：工具显示「是否拥有」，资源显示数量
  const TOOL_IDS=['hand','shovel','axe','pick','ironPick','bucket','sword'];
  beltEl.innerHTML=BELT.map((s,i)=>{
    const cntId=({wood:'quickWood',stone:'quickStone',ore:'quickOre',dirt:'quickDirt',berry:'quickBerry',iron:'quickIron',gem:'quickGem'})[s.id]||'';
    const isTool=TOOL_IDS.includes(s.id);
    return `<button type="button" class="tb-slot${s.id==='ironPick'?' iron':''}${isTool?' tool':''}" data-slot="${s.id}" title="${s.name}：${s.hint}"><i>${s.icon}</i><b${cntId?` id="${cntId}"`:''}>${isTool?'':0}</b><small>${i+1}</small></button>`;
  }).join('');
  canvas.parentElement.appendChild(beltEl);
  beltEl.querySelectorAll('.tb-slot').forEach(b=>b.addEventListener('click',()=>setHeld(b.dataset.slot)));
  function setHeld(id){const s=BELT.find(b=>b.id===id);if(!s||phase!=='playing'||uiMode)return;/* ★ 改动 1：工具槽位需先合成才能选中 */if(id==='pick'&&!pick){say('还没有石镐：先在下方「合成石镐」（木材×1+石材×1）');return}if(id==='ironPick'&&!extras.ironPickaxe){say('还没有铁镐：先在下方「合成铁镐」（铁块×2+木材×1）');return}if(id==='bucket'&&!extras.bucket){say('还没有水桶：先在下方「合成水桶」（铁块×1+木材×1）');return}if(id==='sword'&&!extras.sword){say('还没有宝剑：先在下方「合成宝剑」（铁块×1+宝石×1）');return}SFX.pick();held=id;pendingAction=null;walk=[];say(`已选「${s.name}」：${s.hint}`);refreshBelt();updateUI()}
  function refreshBelt(){
    // ★ 工具槽位：显示是否拥有（✓ = 已拥有；未拥有则整槽变暗）
    const OWN={pick:()=>pick,ironPick:()=>extras.ironPickaxe,bucket:()=>extras.bucket,sword:()=>extras.sword,axe:()=>extras.axe};
    for(const s of BELT){
      const el=beltEl.querySelector(`[data-slot="${s.id}"]`);if(!el)continue;
      el.classList.toggle('sel',held===s.id);
      if(s.id==='pick')el.classList.toggle('up',pick);
      if(s.id==='ironPick')el.classList.toggle('up',extras.ironPickaxe);
      if(s.id==='bucket'){el.classList.toggle('hidden',day===0||day===2);el.classList.toggle('up',extras.bucket);el.classList.toggle('full',extras.waterBucket)} // ★ DAY1/DAY3 隐藏水桶槽位（无岩浆）
      if(s.id==='axe')el.classList.toggle('up',extras.axe);
      if(s.id==='sword')el.classList.toggle('up',extras.sword);
      const fn=OWN[s.id];
      if(fn){const ok=!!fn();const bEl=el.querySelector('b');if(bEl)bEl.textContent=ok?'✓':'';el.classList.toggle('no',!ok)}
    }
  }
  function beltHint(){const s=BELT.find(b=>b.id===held);if(phase!=='playing'||!s)return '点击下方槽位选择工具与物资，再点击地图目标';
    // ★ 改动 2：水桶两态（空桶 / 满水）
    if(held==='bucket')return `已选「水桶」—— ${extras.waterBucket?'\u{1F4A7} 满水：点击岩浆扑灭（一次只能扑灭 1 块）':'\u{1FAA3} 空桶：点击水源盛水'}`;
    const extra={wood:bag.wood,stone:bag.stone,ore:bag.ore,gem:bag.gem,fireOre:bag.fireOre,dirt:bag.dirt||0,berry:bag.berry||0,iron:bag.iron||0}[s.id];return `已选「${s.name}」${extra!==undefined?' ×'+extra:''}：${s.hint}`}
  function beltNear(x,y){return adjacent8(x,y)||(player.x===x&&player.y===y)}
  function beltTarget(x,y){if(special(x,y))return true;if(held==='shovel')return !isWater(x,y);if(held==='dirt')return true;if(held==='wood')return(isWater(x,y)&&player.z===0&&!bridges.has(key(x,y)))||!!(DAYS[day].ladder&&!ladderBuilt&&DAYS[day].ladder[0]===x&&DAYS[day].ladder[1]===y);return false}
  function beltAct(x,y){if(phase!=='playing'||uiMode||!inb(x,y))return;pendingAction=null;const k=key(x,y),a=actorAt(x,y,player.z);
    // ★ 修复：点击僵尸 / 不动苦力怕 → 走攻击流程（原先误开对话，弹出残留的关卡引导语）
    if(a&&beltNear(x,y)){walk=[];if(a.type==='zombie_static'||a.type==='creeper_static'){attackZombie(a);return}if(a.type==='treasure'){lootTreasure(a);return}interactEncounter(a);render();return}
    const crop=crops.get(k);
    if(crop&&beltNear(x,y)&&crop.z===player.z){if(encounterTime<crop.readyAt){say('小麦未成熟');return}extras.wheat+=3;crop.readyAt=encounterTime+20;say('小麦 +3');updateUI();render();return}
    if(held==='shovel'){soilDigAt(x,y);return}
    if(held==='dirt'){soilPlaceAt(x,y);return}
    focus={x,y};interact()
  }
  const beltClick=clickTile;clickTile=function(x,y){if(phase!=='playing'||!inb(x,y))return;
    if(beltTarget(x,y)){focus={x,y};if(beltNear(x,y)){walk=[];beltAct(x,y);return}const p=pathNear(x,y);if(p===null){say('无法靠近');render();return}walk=p;pendingAction={x,y};updateUI();render();return}
    pendingAction=null;beltClick(x,y)};
  const beltInteract=interact;interact=function(){if(!uiMode&&held==='shovel'){const t=soilTarget();if(t){soilDigAt(t.x,t.y);return}}if(!uiMode&&held==='dirt'){const t=soilTarget();if(t){soilPlaceAt(t.x,t.y);return}}beltInteract()};
  const beltUI=updateUI;updateUI=function(){beltUI();refreshBelt()};
  const beltReset=resetGame;resetGame=function(i){held='hand';pendingAction=null;beltReset(i)};
  (function beltLoop(){requestAnimationFrame(beltLoop);if(phase!=='playing'||uiMode||!pendingAction)return;if(beltNear(pendingAction.x,pendingAction.y)){const t=pendingAction;pendingAction=null;walk=[];beltAct(t.x,t.y)}})();
  window.addEventListener('resize',resize);updateHome();requestAnimationFrame(animate);
  _bootOK();
  } catch(e) {
    _bootErr('IIFE 运行时错误：' + e.message + '\n' + (e.stack||'').split('\n').slice(0,5).join('\n'));
  }
})();


const fs=require('fs');
const t=fs.readFileSync('D:/Desktop/策划笔试/方块星球-v2/game.js','utf8');
let stack=[];
let line=1,col=0;
const pairs={')':'(',']':'[','}':'{'};
const errs=[];
for(let i=0;i<t.length;i++){
  const c=t[i];
  if(c==='\n'){line++;col=0;continue}
  col++;
  if(c==='/'&&t[i+1]==='/'){
    while(i<t.length&&t[i]!=='\n')i++;
    continue;
  }
  if(c==='/'&&t[i+1]==='*'){
    i+=2;
    while(i<t.length&&!(t[i]==='*'&&t[i+1]==='/'))i++;
    i++;
    continue;
  }
  if(c==='"'||c==="'"||c==='`'){
    const q=c;
    i++;
    while(i<t.length&&t[i]!==q){
      if(t[i]==='\\')i++;
      i++;
    }
    continue;
  }
  if('({['.includes(c))stack.push([c,line,col]);
  else if(')}]'.includes(c)){
    if(!stack.length)errs.push('unmatched '+c+'@'+line+':'+col);
    else{
      const o=stack.pop();
      if(pairs[c]!==o[0])errs.push('mismatch '+o[0]+'@'+o[1]+':'+o[2]+' with '+c+'@'+line+':'+col);
    }
  }
}
for(const o of stack)errs.push('unclosed '+o[0]+'@'+o[1]+':'+o[2]);
console.log('errors:',errs.length);
errs.slice(0,30).forEach(e=>console.log(e));

// 也检查重复 let 声明
const letRe=/^\s*let\s+([\s\S]+?);/gm;
const constRe=/^\s*const\s+([\s\S]+?);/gm;
function vars(re){
  const m2={};
  let m;
  while((m=re.exec(t))){
    const body=m[1];
    // 简单 split by , 但忽略 = 后的
    let depth=0,start=0;
    for(let i=0;i<body.length;i++){
      const c=body[i];
      if(c==='('||c==='['||c==='{'||c==='`'||c==='"'||c==="'")depth++;
      else if(c===')'||c===']'||c==='}')depth--;
      else if(c===','&&depth===0){
        const seg=body.substring(start,i).trim();
        const eq=seg.indexOf('=');
        const name=eq<0?seg:seg.substring(0,eq).trim();
        if(name){
          if(m2[name])m2[name].push(m.index);
          else m2[name]=[m.index];
        }
        start=i+1;
      }
    }
    const seg=body.substring(start).trim();
    const eq=seg.indexOf('=');
    const name=eq<0?seg:seg.substring(0,eq).trim();
    if(name){
      if(m2[name])m2[name].push(m.index);
      else m2[name]=[m.index];
    }
  }
  return m2;
}
const lets=vars(letRe);
console.log('\nlet duplicates:');
for(const k in lets){
  if(lets[k].length>1)console.log(k,lets[k].length,'times',lets[k]);
}
const consts=vars(constRe);
console.log('\nconst duplicates:');
for(const k in consts){
  if(consts[k].length>1)console.log(k,consts[k].length,'times',consts[k]);
}

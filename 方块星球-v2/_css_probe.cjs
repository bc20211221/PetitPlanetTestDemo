const fs=require('fs');
const dir='D:/Desktop/策划笔试/方块星球-v2/';
const files=['encounters.css','style.css','mobile-ui.css','toolbelt.css','editor.css'];
const sels=['.invite-choice','.speech-bubble','.dialogue-actions','.primary','.light-button','#inviteChoice','.npc-dialogue','button'];
const esc=s=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
for(const f of files){
  if(!fs.existsSync(dir+f))continue;
  const s=fs.readFileSync(dir+f,'utf8');
  for(const sel of sels){
    const re=new RegExp(esc(sel)+'[^{}]*\\{[^{}]*\\}','g');
    const m=s.match(re);
    if(m&&m.length)console.log('['+f+'] '+sel+'  ('+m.length+')\n   '+m.slice(0,6).join('\n   '));
  }
}

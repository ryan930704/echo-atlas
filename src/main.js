import {cluster} from './model.js';
import {demo} from './demo.js';
const $ = id => document.getElementById(id);
const colors = ['#538573','#b56e41','#898446','#74678d','#557e95'];
let notes = demo.slice(), groups = [], selected = 0, isSample = true;
function node(tag, value, cls) {
  const el = document.createElement(tag);
  el.textContent = value;
  if (cls) el.className = cls;
  return el;
}
function draw() {
  const canvas = $('waves'), rect = canvas.getBoundingClientRect();
  canvas.width = Math.round(rect.width * devicePixelRatio);
  canvas.height = Math.round(rect.height * devicePixelRatio);
  const ctx = canvas.getContext('2d');
  ctx.scale(canvas.width / 600,canvas.height / 240);
  ctx.fillStyle='#173f38';ctx.fillRect(0,0,600,240);
  ctx.strokeStyle='#31564b';ctx.lineWidth=.6;
  for(let x=0;x<600;x+=24){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,240);ctx.stroke();}
  for(let y=0;y<240;y+=24){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(600,y);ctx.stroke();}
  const lines = Math.min(notes.length,40);
  for(let i=0;i<lines;i++){
    const group = groups.findIndex(g=>g.ids.includes(i));
    ctx.strokeStyle= ['#c9ee98','#f0af7a','#e3d48a','#cfb5dc','#9cd7d3'][group%5];
    ctx.lineWidth=1.6;ctx.beginPath();
    for(let x=0;x<=600;x+=2){
      const u=x/600, mix=u*u*(3-2*u);
      const start=35+(i+.5)/lines*165, end=33+(group+.5)/groups.length*165;
      const y=start*(1-mix)+end*mix+Math.sin(u*Math.PI*2+i*.32)*Math.sin(u*Math.PI)*33+(i%5)*mix*2;
      if(x===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);
    }
    ctx.stroke();
  }
  ctx.fillStyle='#daebc6';ctx.font='12px monospace';ctx.fillText('RESPONSE SIGNALS',16,20);ctx.fillText('GROUPED BY LANGUAGE',420,227);
}
function selectGroup(i) {
  selected=i;
  const g=groups[i];
  Array.from($('index').children).forEach((b,j)=>b.setAttribute('aria-pressed',String(i===j)));
  $('theme').textContent=g.name;
  $('quotes').replaceChildren(...g.ids.map(id=>{
    const row=node('div','','quote');
    row.append(node('span','#'+String(id+1).padStart(2,'0')),node('p',notes[id]));
    return row;
  }));
}
function analyze(){
  groups=cluster(notes,Number($('cut').value));
  $('dataset').textContent=isSample?'SAMPLE DATA / CAMPUS EVENT':'YOUR DATA / FEEDBACK';
  const single=groups.filter(g=>g.ids.length===1).length;
  $('stats').replaceChildren(...[[notes.length,'responses'],[groups.length-single,'shared themes'],[single,'standalone notes']].map(([n,title])=>{
    const item=node('div','');item.append(node('b',n),title);return item;
  }));
  $('index').replaceChildren(...groups.map((g,i)=>{
    const b=node('button','','row'), dot=node('span','','dot'), label=node('span',g.name), meter=node('i','','meter');
    dot.style.background=meter.style.background=colors[i%5];
    meter.style.width=(100*g.ids.length/groups[0].ids.length)+'%';
    label.append(meter);b.append(dot,label,node('span',String(g.ids.length),'num'));
    b.onclick=()=>{selectGroup(i);$('status').textContent=g.name+' evidence selected';};return b;
  }));
  selectGroup(0);draw();$('status').textContent=notes.length+' responses analyzed.';
}
$('edit').onclick=()=>{$('raw').value=notes.join('\n');$('error').textContent='';$('editor').showModal();$('raw').focus();};
$('cancel').onclick=()=>$('editor').close();
$('form').onsubmit=e=>{
  e.preventDefault();
  const next=$('raw').value.split(/\r?\n/).map(s=>s.trim()).filter(Boolean);
  if(!next.length || next.length>100){$('error').textContent='Enter between 1 and 100 nonblank lines.';return;}
  notes=next;isSample=false;$('editor').close();analyze();
};
$('sample').onclick=()=>{notes=demo.slice();isSample=true;$('cut').value='.15';analyze();};
$('cut').onchange=analyze;
$('download').onclick=()=>{
  const brief=['Echo Atlas | Feedback brief',isSample?'Campus event sample':'Custom feedback','Grouping: '+$('cut').selectedOptions[0].text,notes.length+' responses',''];
  for(const g of groups) brief.push(g.name,...g.ids.map(i=>'['+(i+1)+'] '+notes[i]),'');
  const url=URL.createObjectURL(new Blob([brief.join('\n')],{type:'text/plain;charset=utf-8'}));
  const link=document.createElement('a');link.href=url;link.download='echo-atlas-brief.txt';link.click();
  setTimeout(()=>URL.revokeObjectURL(url),1000);
};
new ResizeObserver(draw).observe($('waves'));
analyze();

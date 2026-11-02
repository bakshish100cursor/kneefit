const P=self.PLAN,$=id=>document.getElementById(id);
const KEY="kneefit-data";let S=JSON.parse(localStorage.getItem(KEY)||"{}");
const save=()=>localStorage.setItem(KEY,JSON.stringify(S));
const ex={};P.exercises.forEach(e=>ex[e.id]=e);
const start=new Date(P.startDate+"T00:00:00");
let wk=Math.min(P.weeks,Math.max(1,Math.floor((new Date()-start)/864e5/7)+1));
let di=(new Date().getDay()+6)%7,pex=P.exercises[1].id;
$("ttl").textContent=P.title;
for(let i=1;i<=P.weeks;i++)$("wk").add(new Option("Week "+i,i));$("wk").value=wk;
$("wk").onchange=()=>{wk=+$("wk").value;draw()};$("view").onchange=draw;
const fk=(w,d)=>"fin-w"+w+"-"+d, ek=(w,d,id)=>"w"+w+"-"+d+"-"+id;
const isTime=t=>/sec|min/.test(t);
const nSets=t=>{const m=t.match(/^(\d+)\s*x/);return m?+m[1]:1};
function dateOf(w,d){const t=new Date(start);t.setDate(t.getDate()+(w-1)*7+d);return t.getFullYear()+"-"+String(t.getMonth()+1).padStart(2,"0")+"-"+String(t.getDate()).padStart(2,"0")}
function info(id){$("mt").textContent=ex[id].name;$("md").textContent=ex[id].desc;$("modal").style.display="flex"}
function getSets(r){if(!r)return[];if(r.sets)return r.sets;if(r.kg!==undefined||r.act!==undefined)return[{kg:r.kg||"",act:r.act||""}];return[]}
const has=r=>getSets(r).some(s=>s.kg||s.act);
function last(id,cur){for(let i=cur-1;i>=0;i--){const w=Math.floor(i/7)+1,d=i%7;if(P.days[d].exercises.includes(id)){const r=S[ek(w,d,id)];if(has(r))return getSets(r)}}return null}
const fmtSet=(s,wt)=>(wt&&s.kg?s.kg+" kg":"")+(wt&&s.kg&&s.act?" x ":"")+(s.act||"");
function tabs(){$("tabs").innerHTML="";P.days.forEach((d,i)=>{const b=document.createElement("button"),f=S[fk(wk,i)];b.className="tab"+(i==di?" on":"")+(f?" fin":"");b.textContent=d.day.slice(0,3)+(f?" \u2713":"");b.onclick=()=>{di=i;draw()};$("tabs").appendChild(b)})}
function collect(c){const o=[];c.querySelectorAll("[data-s]").forEach(i=>{const n=+i.dataset.s;o[n]=o[n]||{kg:"",act:""};o[n][i.dataset.f]=i.value});return o}
function plan(m){const d=P.days[di],cur=(wk-1)*7+di,fin=!!S[fk(wk,di)];
m.innerHTML="<h2>"+d.day+" "+dateOf(wk,di)+"<br><small>"+d.session+"</small></h2>"+(fin?'<div class="banner">Day finished. Tap Edit to change entries.</div>':"");
d.exercises.forEach(id=>{const e=ex[id],t=e.weeks[wk-1],n=nSets(t),tm=isTime(t),saved=getSets(S[ek(wk,di,id)]),l=last(id,cur);
const c=document.createElement("div");c.className="card";
let h="<h3>"+e.name+'</h3><div class="tgt">Target: '+t+' (tap name for how-to)</div>';
if(l)h+='<div class="last">Last time: '+l.map((s,i)=>"S"+(i+1)+" "+fmtSet(s,e.weighted)).join(" | ")+"</div>";
for(let i=0;i<n;i++){const sv=saved[i],lv=l?(l[i]||l[l.length-1]):null,kv=sv?sv.kg:(lv?lv.kg:""),av=sv?sv.act:(lv?lv.act:"");
h+='<div class="sr '+(e.weighted?"w":"n")+'"><span>Set '+(n>1?(i+1):"")+"</span>"+(e.weighted?'<input data-s="'+i+'" data-f="kg" type="number" inputmode="decimal" step="0.5" placeholder="kg" value="'+(kv||"")+'"'+(fin?" disabled":"")+">":"")+'<input data-s="'+i+'" data-f="act" placeholder="'+(tm?"time":"reps")+'" value="'+(av||"")+'"'+(fin?" disabled":"")+"></div>"}
c.innerHTML=h;c.querySelector("h3").onclick=()=>info(id);
c.querySelectorAll("[data-s]").forEach(i=>i.onchange=()=>{S[ek(wk,di,id)]={sets:collect(c)};save()});
m.appendChild(c)});
const b=document.createElement("button");b.className="b "+(fin?"ed":"ok");b.textContent=fin?"Edit this day":"Finished - submit day";
b.onclick=()=>{if(fin){delete S[fk(wk,di)]}else{m.querySelectorAll(".card").forEach((c,k)=>{S[ek(wk,di,d.exercises[k])]={sets:collect(c)}});S[fk(wk,di)]=new Date().toISOString()}save();draw()};
m.appendChild(b)}
function val(id,r){const s=getSets(r),e=ex[id];const v=s.map(q=>e.weighted&&q.kg!==""&&q.kg!==undefined?+q.kg:parseFloat(String(q.act||"").match(/[\d.]+/))).filter(q=>!isNaN(q));return v.length?Math.max(...v):null}
function series(id){const o=[];for(let w=1;w<=P.weeks;w++)for(let d=0;d<7;d++)if(P.days[d].exercises.includes(id)){const r=S[ek(w,d,id)];if(r){const v=val(id,r);if(v!==null)o.push({lab:"W"+w+" "+P.days[d].day.slice(0,3),y:v,date:dateOf(w,d),sets:getSets(r)})}}return o}
function chart(cv,pts,title,unit){const dpr=window.devicePixelRatio||1,W=cv.clientWidth,H=240;cv.width=W*dpr;cv.height=H*dpr;const g=cv.getContext("2d");g.scale(dpr,dpr);g.clearRect(0,0,W,H);
g.fillStyle="#1F4E78";g.font="bold 13px sans-serif";g.fillText(title+(unit?" ("+unit+")":""),10,18);
if(!pts.length){g.fillStyle="#888";g.font="13px sans-serif";g.fillText("No data yet. Finish a workout to see progress.",10,H/2);return}
const L=40,R=W-14,T=34,B=H-34;let mn=Math.min(...pts.map(p=>p.y)),mx=Math.max(...pts.map(p=>p.y));if(mn==mx){mn-=1;mx+=1}const pad=(mx-mn)*.15;mn-=pad;mx+=pad;
const X=i=>pts.length==1?(L+R)/2:L+(R-L)*i/(pts.length-1),Y=v=>B-(B-T)*(v-mn)/(mx-mn);
g.strokeStyle="#ddd";g.fillStyle="#666";g.font="11px sans-serif";
for(let i=0;i<=4;i++){const v=mn+(mx-mn)*i/4,y=Y(v);g.beginPath();g.moveTo(L,y);g.lineTo(R,y);g.stroke();g.fillText(v.toFixed(1),2,y+4)}
g.strokeStyle="#1F4E78";g.lineWidth=2;g.beginPath();pts.forEach((p,i)=>i?g.lineTo(X(i),Y(p.y)):g.moveTo(X(i),Y(p.y)));g.stroke();
pts.forEach((p,i)=>{g.fillStyle="#1F4E78";g.beginPath();g.arc(X(i),Y(p.y),4,0,7);g.fill();g.fillStyle="#222";g.fillText(p.y,X(i)-8,Y(p.y)-8);
if(pts.length<=10||i%Math.ceil(pts.length/8)==0){g.fillStyle="#666";g.save();g.translate(X(i),B+12);g.rotate(.5);g.fillText(p.lab,0,0);g.restore()}})}
function prog(m){m.innerHTML='<h2>Progress</h2><select id="ps" style="width:100%;padding:8px"></select><p></p><canvas id="c1"></canvas><div id="tb"></div><p></p><canvas id="c2"></canvas><p></p><canvas id="c3"></canvas>';
P.exercises.forEach(e=>$("ps").add(new Option(e.name,e.id)));$("ps").value=pex;
const go=()=>{pex=$("ps").value;const e=ex[pex],s=series(pex),t=e.weeks[0];
chart($("c1"),s,e.name+" (best set)",e.weighted?"kg":(isTime(t)?(/sec/.test(t)?"sec":"min"):"reps"));
$("tb").innerHTML=s.length?"<table><tr><th>Date</th><th>Session</th><th>Sets</th></tr>"+s.map(p=>"<tr><td>"+p.date+"</td><td>"+p.lab+"</td><td>"+p.sets.map(q=>fmtSet(q,e.weighted)).join(" | ")+"</td></tr>").join("")+"</table>":"";};
$("ps").onchange=go;go();
const b=[];for(let w=0;w<=P.weeks;w++){const r=S["body-"+w];if(r&&r.kg)b.push({lab:w?"Wk"+w:"Start",y:+r.kg})}chart($("c2"),b,"Body weight","kg");
const f=[];for(let w=1;w<=P.weeks;w++){let n=0;for(let d=0;d<7;d++)if(S[fk(w,d)])n++;f.push({lab:"Wk"+w,y:n})}chart($("c3"),f,"Days finished per week","days")}
function body(m){m.innerHTML="<h2>Weekly body check</h2><p>Start 94.5 kg. Target 89.5 kg by 31 Dec.</p>";
for(let w=0;w<=P.weeks;w++){const k="body-"+w,r=S[k]||{};const c=document.createElement("div");c.className="card";
c.innerHTML="<b>"+(w?"End of week "+w:"Start")+'</b><div class="f"><div><label>Weight kg</label><input data-f="kg" type="number" step="0.1" value="'+(r.kg||(w?"":94.5))+'"></div><div><label>Waist cm</label><input data-f="waist" type="number" value="'+(r.waist||"")+'"></div></div>';
c.querySelectorAll("[data-f]").forEach(i=>i.onchange=()=>{S[k]=S[k]||{};S[k][i.dataset.f]=i.value;save()});m.appendChild(c)}}
function dl(n,t,mime){const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([t],{type:mime}));a.download=n;a.click()}
function data(m){m.innerHTML='<div class="card"><h3>Backup and export</h3><button class="b" id="csv">Export CSV</button><button class="b" id="exp">Export backup</button><button class="b" id="imp">Import backup</button><input type="file" id="fi" hidden></div>';
$("csv").onclick=()=>{let o=[["Week","Date","Day","Session","Exercise","Target","Set","Weight kg","Reps/time done","Day finished"]];
for(let w=1;w<=P.weeks;w++)P.days.forEach((d,i)=>d.exercises.forEach(id=>{const s=getSets(S[ek(w,i,id)]);const n=Math.max(s.length,1);for(let k=0;k<n;k++){const q=s[k]||{};o.push([w,dateOf(w,i),d.day,d.session,ex[id].name,ex[id].weeks[w-1],k+1,ex[id].weighted?(q.kg||""):"",q.act||"",S[fk(w,i)]?"yes":""])}}));
dl("kneefit_log.csv",o.map(r=>r.map(x=>'"'+String(x).replace(/"/g,'""')+'"').join(",")).join("\n"),"text/csv")};
$("exp").onclick=()=>dl("kneefit_backup.json",JSON.stringify(S),"application/json");
$("imp").onclick=()=>$("fi").click();$("fi").onchange=e=>{const r=new FileReader();r.onload=()=>{S=JSON.parse(r.result);save();alert("Imported");draw()};r.readAsText(e.target.files[0])}}
function draw(){const v=$("view").value,m=$("main");m.innerHTML="";tabs();$("tabs").style.display=v=="plan"?"flex":"none";({plan,prog,body,data})[v](m)}
draw();if("serviceWorker" in navigator&&location.protocol.startsWith("http"))navigator.serviceWorker.register("sw.js");

'use strict';
// ---- Mobile / controller layer: on-screen touch pad, extended Gamepad mapping, landscape + fullscreen helpers ----
(function(){
const setK=(c,d)=>{if(d&&!keys[c])jp.add(c);keys[c]=d};
const isTouch='ontouchstart' in window||navigator.maxTouchPoints>0;
const css=`#tc{position:fixed;inset:0;pointer-events:none;z-index:5;font-family:system-ui,sans-serif;user-select:none;-webkit-user-select:none}
#tc .b{position:absolute;pointer-events:auto;border-radius:50%;background:rgba(255,255,255,.16);border:2px solid rgba(255,255,255,.45);color:#fff;font-weight:700;display:flex;align-items:center;justify-content:center;touch-action:none;-webkit-tap-highlight-color:transparent}
#tc .b.on{background:rgba(255,224,96,.45)}#tc .pad{position:absolute;left:calc(env(safe-area-inset-left) + 18px);bottom:18px;width:150px;height:150px;pointer-events:auto;touch-action:none;border-radius:50%;background:rgba(255,255,255,.10);border:2px solid rgba(255,255,255,.35)}
#tc .nub{position:absolute;left:50px;top:50px;width:50px;height:50px;border-radius:50%;background:rgba(255,255,255,.4)}
#tc .sm{border-radius:12px;font-size:12px}#rot{position:fixed;inset:0;background:#000;color:#ffe060;display:none;align-items:center;justify-content:center;text-align:center;font:600 22px system-ui;z-index:9;padding:30px}
@media (orientation:portrait){#rot.t{display:flex}}`;
const st=document.createElement('style');st.textContent=css;document.head.appendChild(st);
const rot=document.createElement('div');rot.id='rot';rot.innerHTML='Rotate your phone to landscape<br><span style="font-size:15px;color:#ccc">Tip: Share → Add to Home Screen for fullscreen</span>';if(isTouch)rot.classList.add('t');document.body.appendChild(rot);
if(!isTouch&&!/[?&]touch=1/.test(location.search))return startPad();
const tc=document.createElement('div');tc.id='tc';document.body.appendChild(tc);
const btn=(lab,code,css,cls='')=>{const b=document.createElement('div');b.className='b '+cls;b.textContent=lab;b.style.cssText=css;b.dataset.code=code;tc.appendChild(b);
 const dn=e=>{e.preventDefault();b.classList.add('on');setK(code,true);if(code=='Enter')goFull()},up=e=>{e.preventDefault();b.classList.remove('on');setK(code,false)};
 b.addEventListener('touchstart',dn,{passive:false});b.addEventListener('touchend',up,{passive:false});b.addEventListener('touchcancel',up,{passive:false});b.addEventListener('mousedown',dn);b.addEventListener('mouseup',up);return b};
const R='right:calc(env(safe-area-inset-right) + ';
btn('A','KeyZ',R+'24px);bottom:70px;width:72px;height:72px;font-size:26px');btn('B','KeyX',R+'108px);bottom:22px;width:72px;height:72px;font-size:26px');
btn('R','KeyC',R+'108px);bottom:110px;width:58px;height:58px;font-size:20px');btn('L','KeyV',R+'190px);bottom:40px;width:50px;height:50px;font-size:17px');
btn('START','Enter','left:50%;transform:translateX(10px);top:10px;width:76px;height:30px','sm');btn('BACK','Escape','left:50%;transform:translateX(-86px);top:10px;width:76px;height:30px','sm');
// analog-feel D-pad (8-way) -> arrow keys
const pad=document.createElement('div');pad.className='pad';const nub=document.createElement('div');nub.className='nub';pad.appendChild(nub);tc.appendChild(pad);
let pid=null;const dirs={ArrowLeft:0,ArrowRight:0,ArrowUp:0,ArrowDown:0};
const apply=(dx,dy)=>{const m=Math.hypot(dx,dy),dz=18;const n={ArrowLeft:m>dz&&dx<-m*.38,ArrowRight:m>dz&&dx>m*.38,ArrowUp:m>dz&&dy<-m*.38,ArrowDown:m>dz&&dy>m*.38};
 for(const k in n)if(n[k]!=dirs[k]){dirs[k]=n[k];setK(k,n[k])}const c=Math.min(1,50/Math.max(m,1));nub.style.transform=`translate(${dx*c}px,${dy*c}px)`};
const mv=t=>{const r=pad.getBoundingClientRect();apply(t.clientX-r.left-75,t.clientY-r.top-75)};
pad.addEventListener('touchstart',e=>{e.preventDefault();const t=e.changedTouches[0];pid=t.identifier;mv(t)},{passive:false});
pad.addEventListener('touchmove',e=>{e.preventDefault();for(const t of e.changedTouches)if(t.identifier==pid)mv(t)},{passive:false});
const end=e=>{for(const t of e.changedTouches)if(t.identifier==pid){pid=null;apply(0,0)}};pad.addEventListener('touchend',end);pad.addEventListener('touchcancel',end);
document.addEventListener('touchmove',e=>e.preventDefault(),{passive:false});document.addEventListener('gesturestart',e=>e.preventDefault());
document.getElementById('c').addEventListener('touchstart',e=>{e.preventDefault();setK('Enter',true);setTimeout(()=>setK('Enter',false),60);goFull()},{passive:false});
function goFull(){const d=document.documentElement;try{if(!document.fullscreenElement&&d.requestFullscreen)d.requestFullscreen({navigationUI:'hide'}).catch(()=>{});else if(d.webkitRequestFullscreen)d.webkitRequestFullscreen();screen.orientation?.lock?.('landscape').catch(()=>{})}catch(e){}}
startPad();
// Bluetooth controllers (Xbox / PlayStation / MFi) via standard Gamepad mapping -> same key codes
function startPad(){const map={0:'KeyZ',1:'KeyX',2:'KeyC',3:'KeyV',5:'KeyC',4:'KeyV',7:'KeyZ',6:'KeyX',9:'Enter',8:'Escape',12:'ArrowUp',13:'ArrowDown',14:'ArrowLeft',15:'ArrowRight'};const prev={};
 (function loop(){const p=navigator.getGamepads?[...navigator.getGamepads()].find(g=>g):null;if(p){const s={};for(const i in map)s[map[i]]=s[map[i]]||!!p.buttons[i]?.pressed;
  s.ArrowLeft=s.ArrowLeft||p.axes[0]<-.45;s.ArrowRight=s.ArrowRight||p.axes[0]>.45;s.ArrowUp=s.ArrowUp||p.axes[1]<-.45;s.ArrowDown=s.ArrowDown||p.axes[1]>.45;
  for(const k in s)if(s[k]!=!!prev[k]){prev[k]=s[k];setK(k,s[k])}}requestAnimationFrame(loop)})()}
})();
if('serviceWorker' in navigator&&location.protocol=='https:')navigator.serviceWorker.register('sw.js').catch(()=>{});

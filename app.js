/* GariBingo! — a browser-local, 90-ball Christmas game. */
const app=document.querySelector('#app');
const KEY='garibingo-v2';
const roundNames=['The festive opener','Snow much fun','The grand finale','Free play'];
const FREE=3;
const icons=['🎄','❄️','🏆','🎅'];
let state=fresh(),sound=true,busy=false,timer=null,videoToken=0;
function fresh(){return {rounds:Array.from({length:4},()=>({called:[],phase:'new'})),active:0,screen:'home'};}
try{const saved=JSON.parse(localStorage.getItem(KEY));if(saved&&Array.isArray(saved.rounds)&&saved.rounds.length===4&&saved.rounds.every(r=>Array.isArray(r.called)&&new Set(r.called).size===r.called.length&&r.called.every(n=>Number.isInteger(n)&&n>=1&&n<=90)&&['new','line','house','done'].includes(r.phase))&&Number.isInteger(saved.active)&&saved.active>=0&&saved.active<4){state=saved;state.screen='home';}}catch{}
function save(){try{localStorage.setItem(KEY,JSON.stringify(state));}catch{toast('Browser saving is unavailable. Keep this tab open.');}}
function toast(t){const e=document.querySelector('#toast');e.textContent=t;e.classList.add('show');setTimeout(()=>e.classList.remove('show'),3500);}
function machine(){return `<div class="machine-scene" aria-hidden="true"><div class="orbit"></div><span class="star a">✦</span><span class="star b">✧</span><div class="machine"><div class="globe"><div class="cage-line"></div><div class="cage-line two"></div>${[23,8,45,12,90,6,31,54,17,72,39,81].map((n,i)=>`<div class="ball ${['','red','green'][i%3]}" style="left:${35+(i%4)*58}px;top:${58+Math.floor(i/4)*65}px;animation-delay:-${i*.6}s"><span>${n}</span></div>`).join('')}</div><div class="machine-base"><span>THE MAGIC MACHINE</span></div><div class="machine-foot"></div></div><div class="ball red float-ball one"><span>67</span></div><div class="ball green float-ball two"><span>25</span></div><span class="machine-label">A SPIN OF CHRISTMAS MAGIC ↗</span></div>`;}
function home(){stopCall();state.screen='home';setMusic('home');const inProgress=state.rounds.some(r=>['line','house'].includes(r.phase));app.innerHTML=`<section class="hero"><div><span class="eyebrow pill">✦ YOUR CHRISTMAS PARTY STARTS HERE</span><img class="hero-logo" src="logo.svg" alt="GariBingo!"><h1>Big festive fun.<br>A little <em>bingo magic.</em></h1><p>Three prize rounds, plus free play. A little suspense. A whole lot of festive cheer. Eyes down for your Christmas bingo spectacular.</p><div class="actions"><button class="primary" id="start">${inProgress?'Back to the festivities':'Let’s play bingo'} <span style="margin-left:22px">↗</span></button><button class="secondary" id="how">How to play</button></div><p class="small-note">TEACHER IN CONTROL. CHRISTMAS CHAOS ENCOURAGED.</p><div class="hero-badges"><span><b>✦</b> 3 festive rounds</span><span><b>◉</b> Classic 90-ball bingo</span><span><b>✓</b> No sign-up needed</span></div></div>${machine()}</section>`;document.querySelector('#start').onclick=()=>inProgress?rounds():playVideo('Intro.mp4','Welcome to GariBingo!','Eyes down. Christmas is about to get competitive.',rounds);document.querySelector('#how').onclick=()=>confirmBox('Eyes down, everyone!','Play using your paper 90-ball tickets. The teacher draws each number. Shout for one complete line, then a full house. The teacher checks the called-number board and confirms each win.',null,'Got it, let’s play');}
function rounds(){stopCall();state.screen='rounds';setMusic('rounds');save();app.innerHTML=`<section class="section"><div class="section-top"><div><span class="eyebrow">THREE CHANCES FOR CHRISTMAS GLORY</span><h1>Pick your next round<span class="gold">.</span></h1><p>Choose a round, meet the prize, and let the good times roll.</p></div><button class="secondary" id="reset">New event</button></div><div class="round-grid">${state.rounds.map((r,i)=>`<button class="round-card${i===FREE?' free':''}" data-round="${i}" ${r.phase==='done'&&i!==FREE?'disabled':''}><span class="round-index">0${i+1}</span><span class="round-icon">${icons[i]}</span><span class="eyebrow">${i===FREE?'STAFF GAMES · NO PRIZE VIDEOS':`ROUND 0${i+1}`}</span><strong>${roundNames[i]}</strong><small>${i===FREE&&r.phase==='done'?'Tap for a fresh game':r.phase==='done'?'✓ Round complete':r.phase==='new'?'Ready when you are':`Resume · ${r.called.length} numbers called`}</small><span class="arrow">${r.phase==='done'&&i!==FREE?'✓':'↗'}</span></button>`).join('')}</div><p class="game-note">Progress saves on this browser. Each round starts with a fresh set of 90 numbers.</p></section>`;app.querySelectorAll('[data-round]').forEach(b=>b.onclick=()=>startRound(+b.dataset.round));document.querySelector('#reset').onclick=()=>confirmBox('Start a brand-new event?','This clears every round and all called numbers on this browser.',()=>{state=fresh();save();home();},'Start new event');}
function startRound(i){state.active=i;const r=state.rounds[i];if(i===FREE){if(r.phase==='new'||r.phase==='done'){r.called=[];playVideo('FreeLine.mp4','Free play · One line','A fresh board. Eyes down!',()=>{r.phase='line';save();game();});}else game();return;}if(r.phase==='new'){playVideo(`Lineprize${i+1}.mp4`,`Round ${i+1} · The line prize`,'One complete line. One very happy winner.',()=>{r.phase='line';save();game();});}else game();}
function game(){state.screen='game';setMusic('game');save();const r=state.rounds[state.active],last=r.called.at(-1);app.innerHTML=`<section class="section"><div class="game-head"><div class="game-title"><span class="eyebrow">${state.active===FREE?'FREE PLAY':`ROUND 0${state.active+1}`} <span class="gold">✦</span> ${r.phase==='house'?'PLAYING FOR A FULL HOUSE':'PLAYING FOR ONE LINE'}</span><h1>${roundNames[state.active]}<span class="gold">.</span></h1></div><button class="secondary" id="back">← All rounds</button></div><div class="game-layout"><div><div class="draw-stage" id="stage"><div class="big-ball"><span id="current">${last||'?'}</span></div><div class="draw-caption" id="caption">${last?callText(last):'A LITTLE LUCK GOES A LONG WAY'}</div></div><div class="draw-controls"><button class="primary" id="draw" ${r.called.length===90?'disabled':''}>${r.called.length===90?'All 90 balls drawn':'Draw a ball'} <span style="margin-left:20px">↗</span></button><button class="secondary" id="replay" ${last?'':'disabled'} aria-label="Repeat last number">↻ Call</button></div><p class="game-note">${r.phase==='house'?'Every number on the ticket to win.':'One complete row on the ticket to win.'} Check the ticket before confirming.</p><button class="secondary" id="win">${r.phase==='house'?'🏆 Full house win':'✦ Line win confirmed'} →</button><div class="recent"><span class="recent-label">LAST FIVE</span><div class="recent-balls">${r.called.slice(-5).reverse().map((n,i)=>`<span class="recent-ball${i===0?' newest':''}">${n}</span>`).join('')||'<span class="gold">Your first number is waiting…</span>'}</div></div></div><div class="board"><div class="board-head"><span>THE NUMBER BOARD</span><b>${r.called.length} / 90 CALLED</b></div><div class="numbers" aria-label="Called number board">${Array.from({length:90},(_,i)=>`<span class="number ${r.called.includes(i+1)?'called':''} ${last===i+1?'latest':''}" aria-label="${i+1}${r.called.includes(i+1)?', called':', not called'}">${i+1}</span>`).join('')}</div></div></div></section>`;document.querySelector('#draw').onclick=draw;document.querySelector('#replay').onclick=()=>speak(last);document.querySelector('#back').onclick=rounds;document.querySelector('#win').onclick=()=>{if(!r.called.length){toast('Draw some numbers before confirming a winner.');return;}confirmBox(r.phase==='house'?'Full house checked?':'Got a line winner?','Please check the winning ticket against the number board. Confirm only when you are happy every required number has been called.',()=>{if(r.phase==='line'){r.phase='house';save();sfx.win(false);playVideo(state.active===FREE?'FreeHouse.mp4':`Houseprize${state.active+1}.mp4`,'Next up · The full house prize','Same ticket. Same numbers. An even bigger prize.',game);}else{r.phase='done';save();sfx.win(true);confetti();rounds();toast('Round complete. Congratulations to your winners!');}});};}
function randomIndex(length){const a=new Uint32Array(1),limit=Math.floor(4294967296/length)*length;do{crypto.getRandomValues(a);}while(a[0]>=limit);return a[0]%length;}
function draw(){if(busy)return;const r=state.rounds[state.active],remaining=Array.from({length:90},(_,i)=>i+1).filter(n=>!r.called.includes(n));if(!remaining.length)return;busy=true;app.querySelectorAll('button').forEach(b=>b.disabled=true);const stage=document.querySelector('#stage');stage.classList.add('drawing');document.querySelector('#caption').textContent='MIXING UP A LITTLE CHRISTMAS MAGIC…';tone();let ticks=0;timer=setInterval(()=>{document.querySelector('#current').textContent=remaining[randomIndex(remaining.length)];sfx.tick(ticks);if(++ticks>=16){clearInterval(timer);const n=remaining[randomIndex(remaining.length)];r.called.push(n);save();busy=false;game();document.querySelector('#stage').classList.add('revealed');sfx.reveal();setTimeout(()=>{if(state.screen==='game'&&r.called.at(-1)===n)speak(n);},450);if(n===67){document.querySelector('#stage').classList.add('hype');document.querySelector('#stage').insertAdjacentHTML('afterbegin','<div class="hype-text">SIX… SEVEN! 🙌</div>');confetti();setTimeout(()=>{document.querySelector('#stage')?.classList.remove('hype');document.querySelector('.hype-text')?.remove();},4500);}}},75);}
// Bingo calls worded exactly as in the recorded audio clips (shown under the ball and used by the speech fallback).
const BINGO_CALLS = [
  "As low as we go",
  "One little duck, quack quack",
  "Cup of tea, yes please",
  "Knock at the door",
  "Man alive",
  "In a fix",
  "Lucky seven, cha-ching",
  "Garden gate",
  "Doctor's orders",
  "Prime Minister's den",
  "Legs eleven",
  "One dozen",
  "Unlucky for some",
  "Oh look, it's Valentine's Day",
  "One and five",
  "Sweet",
  "Dancing Queen",
  "Keys to the car, brum-brum",
  "Goodbye teens",
  "One score",
  "Key of the door",
  "Two little ducks",
  "Thee and me",
  "Two dozen",
  "Duck and dive",
  "Pick and mix",
  "Gateway to heaven",
  "In a state",
  "Rise and shine",
  "My friend Gertie, oh hello love",
  "Get up and run",
  "Buckle my shoe",
  "All the threes",
  "Ask for more",
  "Jump and jive",
  "Three dozen",
  "More than eleven",
  "Christmas cake",
  "The thirty-nine steps",
  "Life begins",
  "Time for fun",
  "Winnie the Pooh",
  "Four and three",
  "All the fours",
  "Halfway there",
  "Up to tricks",
  "Four and seven",
  "Four dozen",
  "Four and nine",
  "Half a century",
  "Tweak of the thumb",
  "Weeks in a year",
  "Oh look, here comes Herbie",
  "Clean the floor",
  "Snakes alive",
  "Five and six",
  "Heinz varieties",
  "Make them wait",
  "It's the Brighton line",
  "Five dozen",
  "Baker's bun",
  "Tickety-boo",
  "Six and three",
  "That famous Beatles song",
  "Six and five",
  "Clickety-click",
  "Six and seven",
  "Six and eight",
  "Any which way up",
  "Three score and ten",
  "Bang on the drum",
  "Six dozen",
  "Queen bee",
  "Hit the floor",
  "Seven and five",
  "Seven and six, oh, it's the wrong way round",
  "Sunset strip",
  "Heaven's gate",
  "One more time",
  "Blind",
  "Stop and run",
  "Straight on through",
  "Time for tea, oh, lovely",
  "Seven dozen",
  "Staying alive",
  "Eight and six",
  "Torquay and Devon",
  "All the eights",
  "Almost there",
  "Top of the shop"
];
function callText(n){if(!Number.isInteger(n)||n<1||n>90)return '';return n===67?'Six! Seven! Sixty-seven!':`${BINGO_CALLS[n-1]} — ${n}`;}
let audio;
let callAudio=null,callSequence=0;
function stopCall(){callSequence++;if(callAudio){callAudio.pause();callAudio=null;if(typeof duck==='function')duck(false);}if(typeof speechSynthesis!=='undefined')speechSynthesis.cancel();}
// Menu music: vocal theme on the home screen; the instrumental loops everywhere else (quietest on the
// draw screen, dipped further while a number is called). Paused during videos. The music button never
// mutes calls, videos or sound effects.
const MUSIC_KEY='garibingo-music',TRACKS={vocal:'audio/theme-vocal.mp3',instrumental:'audio/theme-instrumental.mp3'},LEVELS={home:.5,rounds:.2,game:.06};
let musicOn=true;try{musicOn=localStorage.getItem(MUSIC_KEY)!=='off';}catch{}
let musicEl=null,musicTrack=null,musicScreen=null,ducked=false,fadeId=0;
function musicTarget(){return musicOn&&musicScreen?LEVELS[musicScreen]*(ducked?.35:1):0;}
function fadeMusic(done){const el=musicEl,id=++fadeId;if(!el)return;const step=()=>{if(id!==fadeId||el!==musicEl)return;const t=musicTarget(),v=el.volume||0,nv=Math.abs(t-v)<.02?t:v+(t>v?.02:-.02);el.volume=Math.max(0,Math.min(1,nv));if(nv===t){if(t===0&&el.pause)el.pause();done?.();}else setTimeout(step,40);};step();}
function setMusic(screen){musicScreen=screen;const track=screen==='home'?'vocal':screen?'instrumental':null;if(!musicOn||!track){fadeMusic();return;}if(musicTrack!==track){if(musicEl&&musicEl.pause)musicEl.pause();musicEl=new Audio(TRACKS[track]);musicEl.loop=true;musicEl.volume=0;musicTrack=track;}const p=musicEl.play?.();if(p&&p.then)p.then(()=>fadeMusic()).catch(()=>{});else fadeMusic();}
function duck(on){ducked=on;fadeMusic();}
document.addEventListener?.('pointerdown',()=>{if(musicOn&&musicScreen&&musicEl&&musicEl.paused)setMusic(musicScreen);},{passive:true});
// Game sound effects, synthesised with Web Audio (they follow the main sound button, not the music button).
function ac(){audio??=new(window.AudioContext||window.webkitAudioContext)();audio.resume();return audio;}
function blip(freq,dur,type='sine',vol=.08,when=0,to=null){if(!sound)return;try{const c=ac(),t=c.currentTime+when,o=c.createOscillator(),g=c.createGain();o.type=type;o.frequency.setValueAtTime(freq,t);if(to)o.frequency.exponentialRampToValueAtTime(to,t+dur);g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(vol,t+.01);g.gain.exponentialRampToValueAtTime(.0008,t+dur);o.connect(g).connect(c.destination);o.start(t);o.stop(t+dur+.05);}catch{}}
function hiss(dur,vol=.05,when=0,from=400,to=4000){if(!sound)return;try{const c=ac(),t=c.currentTime+when,n=c.createBuffer(1,Math.ceil(c.sampleRate*dur),c.sampleRate),d=n.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;const s=c.createBufferSource(),f=c.createBiquadFilter(),g=c.createGain();s.buffer=n;f.type='bandpass';f.Q.value=1.2;f.frequency.setValueAtTime(from,t);f.frequency.exponentialRampToValueAtTime(to,t+dur);g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(vol,t+dur*.4);g.gain.linearRampToValueAtTime(0,t+dur);s.connect(f).connect(g).connect(c.destination);s.start(t);}catch{}}
const sfx={
  click(){blip(720,.07,'triangle',.05,0,540);},
  whoosh(){hiss(.38,.07,0,300,5000);},
  start(){hiss(.5,.05,0,200,2200);blip(196,.35,'triangle',.06,0,392);},
  tick(i){blip(520+i*38,.05,'square',.028);},
  reveal(){[1047,1319,1568,2093].forEach((f,i)=>blip(f,.7,'sine',.07,i*.055));blip(131,.4,'triangle',.09,0,98);},
  jingle(){for(let i=0;i<10;i++)hiss(.06,.04,i*.07+Math.random()*.02,5000,9000);},
  win(big){const n=big?[523,659,784,1047,784,1047]:[523,659,784,1047];n.forEach((f,i)=>{const last=i===n.length-1;blip(f,last?.9:.18,'triangle',.08,i*.15);blip(f*2,last?.9:.18,'sine',.03,i*.15);});this.jingle();}
};
function tone(){sfx.start();}
function speak(n){if(!sound||!n)return;stopCall();const sequence=callSequence;const clip=new Audio(`audio/${String(n).padStart(2,'0')}.mp3`);callAudio=clip;duck(true);clip.onended=()=>{if(callAudio===clip){callAudio=null;duck(false);}};clip.play().catch(()=>{if(sequence!==callSequence||!sound||!('speechSynthesis'in window))return;callAudio=null;speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(callText(n));u.lang='en-GB';const voices=speechSynthesis.getVoices();const british=voices.find(v=>v.lang.toLowerCase()==='en-gb'&&v.localService)||voices.find(v=>v.lang.toLowerCase()==='en-gb');if(british)u.voice=british;u.rate=.88;u.pitch=.85;speechSynthesis.speak(u);});}
function playVideo(file,title,subtitle,next){stopCall();state.screen='video';setMusic(null);sfx.whoosh();const token=++videoToken;let finished=false;const finish=()=>{if(finished||token!==videoToken)return;finished=true;clearTimeout(timer);next();};app.innerHTML=`<section class="video-screen"><div class="video-frame"><span class="eyebrow">GariBingo! CHRISTMAS SPECTACULAR</span><h1>${title}</h1><p>${subtitle}</p><div id="media"><p class="placeholder">VIDEO PLACEHOLDER</p><div class="progress"></div><p style="font-size:11px">${file} · Your video will appear here</p></div><button class="secondary" id="skip">Continue →</button></div></section>`;document.querySelector('#skip').onclick=finish;const video=document.createElement('video');video.controls=true;video.playsInline=true;video.muted=!sound;video.onended=finish;video.onerror=()=>{timer=setTimeout(finish,3000);};video.onloadedmetadata=()=>{if(token!==videoToken||finished)return;document.querySelector('#media').replaceChildren(video);video.play().catch(()=>toast('Press play on the video to continue.'));};video.src=`videos/${file}`;video.load();}
function confirmBox(title,body,action,label='Yes, confirmed ✓'){const d=document.querySelector('#confirm');document.querySelector('#confirm-title').textContent=title;document.querySelector('#confirm-text').textContent=body;document.querySelector('#approve').textContent=label;document.querySelector('#cancel').style.display=action?'':'none';document.querySelector('#cancel').onclick=()=>d.close();document.querySelector('#approve').onclick=()=>{d.close();action?.();};d.showModal();}
function confetti(){if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;for(let i=0;i<65;i++){const e=document.createElement('span');e.className='confetti';e.textContent=['✦','▪','●'][i%3];e.style.cssText=`left:${Math.random()*100}%;color:${['#f7cd76','#9ce3c6','#ff7582','#fff'][i%4]};font-size:${10+Math.random()*16}px;animation-delay:${Math.random()*.6}s`;document.body.append(e);setTimeout(()=>e.remove(),3600);}}
document.querySelector('.brand').onclick=e=>{e.preventDefault();if(!busy&&state.screen!=='video')home();};document.querySelector('#sound').onclick=()=>{sound=!sound;document.querySelector('#sound').textContent=sound?'♫':'♪';document.querySelector('#sound').setAttribute('aria-pressed',String(sound));if(!sound)stopCall();const v=app.querySelector('video');if(v)v.muted=!sound;toast(sound?'Sound on':'Sound off');};const mb=document.querySelector('#music');if(mb&&mb.setAttribute){const paint=()=>{mb.textContent=musicOn?'🎵':'🔇';mb.setAttribute('aria-pressed',String(musicOn));mb.title=musicOn?'Music on (calls, videos and effects keep their sound)':'Music off';};paint();mb.onclick=()=>{musicOn=!musicOn;try{localStorage.setItem(MUSIC_KEY,musicOn?'on':'off');}catch{}paint();setMusic(musicScreen);toast(musicOn?'Music on':'Music off · calls, videos and effects still play');};}
document.addEventListener?.('click',e=>{const b=e.target.closest?.('button');if(b&&b.id!=='draw')sfx.click();});
document.querySelector('#fullscreen').onclick=()=>{if(document.fullscreenElement)document.exitFullscreen?.();else document.documentElement.requestFullscreen?.().catch(()=>toast('Use your browser’s fullscreen control.'));};
function snow(){if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;const c=document.querySelector('#snow'),ctx=c.getContext('2d');let w,h;function resize(){w=c.width=innerWidth;h=c.height=innerHeight;}resize();addEventListener('resize',resize);const flakes=Array.from({length:55},()=>({x:Math.random()*w,y:Math.random()*h,r:Math.random()*1.5+.3,s:Math.random()*.3+.12}));function frame(){ctx.clearRect(0,0,w,h);ctx.fillStyle='#e2ffe7';for(const f of flakes){f.y+=f.s;f.x+=Math.sin(f.y/100)*.08;if(f.y>h){f.y=0;f.x=Math.random()*w;}ctx.globalAlpha=.15+f.r*.14;ctx.beginPath();ctx.arc(f.x,f.y,f.r,0,Math.PI*2);ctx.fill();}requestAnimationFrame(frame);}frame();}home();snow();openGate();
// Start screen: browsers only allow sound after a click, so this click starts the theme music
// and unlocks calls and effects in one go.
function openGate(){const g=document.querySelector('#gate');if(!g||!g.classList)return;let done=false;const go=()=>{if(done)return;done=true;try{ac();}catch{}setMusic(musicScreen||'home');sfx.jingle();sfx.reveal();g.classList.add('gone');setTimeout(()=>g.remove?.(),800);};g.onclick=go;g.addEventListener?.('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();go();}});document.querySelector('#gate-go')?.focus?.();}

if('serviceWorker'in navigator&&location.protocol!=='file:')navigator.serviceWorker.register('./sw.js').catch(()=>{});

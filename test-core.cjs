const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const nodes=new Map(),store={};let tick;
const node=()=>({innerHTML:'',textContent:'',style:{},classList:{add(){},remove(){}},querySelectorAll(){return[]},setAttribute(){},insertAdjacentHTML(){}});
const ctx={console,crypto:require('node:crypto').webcrypto,document:{querySelector(s){if(!nodes.has(s))nodes.set(s,node());return nodes.get(s)}},localStorage:{getItem:k=>store[k]||null,setItem:(k,v)=>store[k]=v},navigator:{},location:{protocol:'http:'},matchMedia:()=>({matches:true}),setTimeout:()=>0,clearTimeout(){},setInterval:f=>(tick=f,1),clearInterval(){},Audio:function(){this.play=()=>Promise.resolve()}};
vm.createContext(ctx);vm.runInContext(fs.readFileSync('app.js','utf8'),ctx);
vm.runInContext("sound=false;state.rounds[0].phase='line';game()",ctx);
for(let i=0;i<90;i++){vm.runInContext('draw()',ctx);for(let j=0;j<16;j++)tick();}
const saved=JSON.parse(store['garibingo-v1']);assert.equal(saved.rounds[0].called.length,90);assert.equal(new Set(saved.rounds[0].called).size,90);assert.deepEqual([...saved.rounds[0].called].sort((a,b)=>a-b),Array.from({length:90},(_,i)=>i+1));
vm.runInContext('draw()',ctx);assert.equal(JSON.parse(store['garibingo-v1']).rounds[0].called.length,90);
const restored=vm.createContext({...ctx}); vm.runInContext(fs.readFileSync('app.js','utf8'),restored); assert.equal(vm.runInContext('state.rounds[0].called.length',restored),90);
console.log('PASS: 90 unique draws, correct range, exhaustion guard, saved state reload.');

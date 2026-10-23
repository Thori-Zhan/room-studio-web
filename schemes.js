(function(root,factory){const value=factory();if(typeof module==='object'&&module.exports)module.exports=value;else root.RoomSchemes=value;})(typeof globalThis!=='undefined'?globalThis:this,function(){
 'use strict';
 function create(storage,prefix){
  const listKey=prefix+'-schemes-v1';
  let entries=[{id:'A',name:'方案 A · 当前布置'},{id:'B',name:'方案 B · 自由规划'},{id:'C',name:'方案 C · 另一种可能'}];
  try{const saved=JSON.parse(storage.getItem(listKey));if(Array.isArray(saved)&&saved.length&&new Set(saved.map(s=>s.id)).size===saved.length&&saved.every(s=>typeof s.id==='string'&&/^[A-Za-z0-9-]+$/.test(s.id)&&typeof s.name==='string'&&s.name.trim().length&&s.name.length<=60))entries=saved;}catch{}
  const key=id=>prefix+'-slot-'+id;
  function find(id){if(!entries.some(s=>s.id===id))throw Error('Unknown scheme');}
  function name(value){const n=String(value).trim();if(!n||n.length>60)throw Error('Invalid name');return n;}
  function list(){return entries.map(e=>({...e}));}
  function save(id,state){find(id);storage.setItem(key(id),JSON.stringify(state));}
  function add(value,state){const title=name(value);let id;do{id='plan-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,8);}while(entries.some(e=>e.id===id));const next=[...entries,{id,name:title}];storage.setItem(key(id),JSON.stringify(state));storage.setItem(listKey,JSON.stringify(next));entries=next;return id;}
  function rename(id,value){find(id);const next=entries.map(e=>e.id===id?{...e,name:name(value)}:e);storage.setItem(listKey,JSON.stringify(next));entries=next;}
  return {list,key,save,add,rename};
 }
 return {create};
});

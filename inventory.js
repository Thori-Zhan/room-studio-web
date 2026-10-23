(function(root,factory){const inventory=factory();if(typeof module==='object'&&module.exports)module.exports=inventory;else root.RoomInventory=inventory;})(typeof globalThis!=='undefined'?globalThis:this,function(){
 'use strict';
 const revision=2;
 const roomRevision=1;
 const measuredRoom={w:343,d:362,wardD:60,wardL:270};
 const specs={
  deskRack:{name:'桌旁 JONAXEL',type:'rack',model:'jonaxel',w:50,d:51,h:70,note:'预设的宜家 JONAXEL，宽 50 × 深 51 × 高 70 cm。'},
  bedRack:{name:'床头 LENNART ①',type:'rack',model:'lennart',w:30,d:34,h:56,note:'预设的宜家 LENNART，两件之一。每件宽 30 × 深 34 × 高 56 cm；两个柜子可分别移动。'},
  bedRack2:{name:'床头 LENNART ②',type:'rack',model:'lennart',w:30,d:34,h:56,note:'预设的第二件宜家 LENNART。宽 30 × 深 34 × 高 56 cm；与第一件独立编辑。'},
  chair:{name:'LOBERGET / MALSKÄR',type:'chair',model:'loberget-malskar',w:67,d:67,h:90,note:'预设的宜家 LOBERGET / MALSKÄR。整体宽 67 × 深 67 × 高 90 cm（含椅脚）；实际升降高度可能不同。无扶手，白色座壳。'},
  fireplace:{name:'Kmart 小壁炉',type:'heater',model:'flame-effect',w:38.2,d:26.2,h:51.8,note:'Kmart Flame Effect Fireplace Heater。同名款公开规格为宽 38.2 × 深 26.2 × 高 51.8 cm；实物 SKU 尚未核对，可按机身规格修正。此模型表示占地，未计算加热使用所需净距。'}
 };
 function apply(item,key){return Object.assign(item,specs[key]);}
 function upgrade(input){const next=JSON.parse(JSON.stringify(input));if((next.roomRevision||0)<roomRevision){Object.assign(next.room,measuredRoom);next.roomRevision=roomRevision;}if((next.inventoryRevision||0)>=revision)return next;
  for(const id of ['deskRack','bedRack','chair']){const item=next.items.find(i=>i.id===id);if(item)apply(item,id);}
  const first=next.items.find(i=>i.id==='bedRack');
  if(first&&!next.items.some(i=>i.id==='bedRack2')){const second={...first,id:'bedRack2'};const offset=first.w+2;if(first.r===90)second.y+=offset;else if(first.r===180)second.x-=offset;else if(first.r===270)second.y-=offset;else second.x+=offset;apply(second,'bedRack2');next.items.splice(next.items.indexOf(first)+1,0,second);}
  if(!next.items.some(i=>i.id==='fireplace')){const rack=next.items.find(i=>i.id==='deskRack');const x=rack?rack.x+(rack.r%180===0?rack.w:rack.d)+8:202;const y=rack?rack.y:12;next.items.push({...specs.fireplace,id:'fireplace',x,y,r:0,color:'#353b38'});}
  next.inventoryRevision=revision;return next;
 }
 return {revision,roomRevision,measuredRoom,specs,apply,upgrade};
});

(function(root,factory){const value=factory();if(typeof module==='object'&&module.exports)module.exports=value;else root.RoomDesignCore=value;})(typeof globalThis!=='undefined'?globalThis:this,function(){
 'use strict';
 const copy=x=>JSON.parse(JSON.stringify(x));
 const boardDefaults=[{id:'cork',name:'Kmart 软木板',wall:'west',offset:5,bottom:125,w:75,h:50,color:'#b99a70'},{id:'magnetic',name:'IKEA 黑色磁吸板',wall:'west',offset:85,bottom:120,w:40,h:60,color:'#303b38'}];
 const outletDefaults=[{id:'west1',name:'左墙插座 1',wall:'west',offset:null,height:null},{id:'west2',name:'左墙插座 2',wall:'west',offset:null,height:null},{id:'entry',name:'入口左侧插座',wall:'south',offset:null,height:null}];
 function normalize(state){const s=copy(state),d=s.design&&typeof s.design==='object'?s.design:{};
  d.boards=boardDefaults.map(b=>{const v=Array.isArray(d.boards)?d.boards.find(o=>o&&o.id===b.id):null;return {...b,...(v?{wall:['west','south'].includes(v.wall)?v.wall:b.wall,offset:Number.isFinite(v.offset)?v.offset:b.offset,bottom:Number.isFinite(v.bottom)?v.bottom:b.bottom}: {})};});
  d.outlets=outletDefaults.map(o=>{const v=Array.isArray(d.outlets)?d.outlets.find(v=>v&&v.id===o.id):null;return {...o,...(v?{wall:o.id==='entry'&&['west','south'].includes(v.wall)?v.wall:o.wall,offset:Number.isFinite(v.offset)?v.offset:null,height:Number.isFinite(v.height)?v.height:null}: {})};});
  d.connections=Array.isArray(d.connections)?d.connections.filter(c=>c&&['desk','charging','heater'].includes(c.id)).map(c=>({id:c.id,itemId:typeof c.itemId==='string'?c.itemId:'',outletId:typeof c.outletId==='string'?c.outletId:'',lengthCm:Number.isFinite(c.lengthCm)&&c.lengthCm>0&&c.lengthCm<=3000?c.lengthCm:null})):[];
  for(const [id,itemId]of [['desk','desk'],['charging',s.items.some(i=>i.id==='deskRack')?'deskRack':'desk'],['heater','fireplace']])if(!d.connections.some(c=>c.id===id))d.connections.push({id,itemId,outletId:'',lengthCm:null});
  s.design=d;return s;
 }
 function extent(i){const f=i.type==='bed'&&i.frame?.enabled?i.frame:i;return i.r%180?{w:f.d,d:f.w}:{w:f.w,d:f.d};}
 function accessZones(input){return input.items.filter(i=>i.type==='rack').map(i=>{const e=extent(i),open=i.model==='cube-shelf',override=Number.isFinite(i.access?.travelCm)&&i.access.travelCm>=0&&i.access.travelCm<=150,travel=override?i.access.travelCm:open?0:i.product?.id==='malm-oak'?27:Math.min(40,Math.max(15,i.d-5)),standing=Number.isFinite(i.access?.standingCm)&&i.access.standingCm>=30&&i.access.standingCm<=150?i.access.standingCm:45,depth=travel+standing;let rect;
  switch(i.r){case 90:rect={x:i.x-depth,y:i.y,w:depth,d:e.d};break;case 180:rect={x:i.x,y:i.y-depth,w:e.w,d:depth};break;case 270:rect={x:i.x+e.w,y:i.y,w:depth,d:e.d};break;default:rect={x:i.x,y:i.y+e.d,w:e.w,d:depth};}
  return {id:i.id,name:i.name,rect,travel,standing,estimated:!override&&!open&&i.product?.id!=='malm-oak',facing:{0:'向房门',90:'向左墙',180:'向窗',270:'向衣柜'}[i.r],depth};});}
 function accessCheck(s){const zones=accessZones(s),issues=[],overlap=(a,b)=>a.x<b.x+b.w-.5&&a.x+a.w>b.x+.5&&a.y<b.y+b.d-.5&&a.y+a.d>b.y+.5;const solids=s.items.filter(i=>i.type!=='rug'),wardrobe={x:s.room.w-s.room.wardD,y:0,w:s.room.wardD,d:s.room.wardL};
  for(const z of zones){const b=z.rect,blocked=solids.filter(i=>i.id!==z.id&&overlap(b,{...i,...extent(i)})).map(i=>i.name);if(overlap(b,wardrobe))blocked.push('入墙衣柜');if(b.x<-.5||b.y<-.5||b.x+b.w>s.room.w+.5||b.y+b.d>s.room.d+.5)blocked.push('墙面');if(blocked.length)issues.push({kind:'access',id:z.id,text:z.name+' 柜前使用区被 '+blocked.join('、')+' 挡住（正面'+z.facing+'，按拉出'+z.travel+'＋站位'+z.standing+'＝'+z.depth+' cm检查）。'});}
  return {zones,issues};}
 function movementCheck(s){const issues=[],overlap=(a,b)=>a.x<b.x+b.w-.5&&a.x+a.w>b.x+.5&&a.y<b.y+b.d-.5&&a.y+a.d>b.y+.5,solids=s.items.filter(i=>i.type!=='rug'),wardrobe={x:s.room.w-s.room.wardD,y:0,w:s.room.wardD,d:s.room.wardL},wardFront={x:wardrobe.x-60,y:0,w:60,d:wardrobe.d};
  const wardrobeBlockers=solids.filter(i=>overlap(wardFront,{...i,...extent(i)}));if(wardrobeBlockers.length)issues.push({kind:'wardrobe',text:'衣柜前60cm取物观察区被 '+wardrobeBlockers.map(i=>i.name).join('、')+' 占用，请调整或实测取物空间。'});
  for(const i of solids.filter(i=>i.type==='chair')){const e=extent(i);let b;switch(i.r){case 90:b={x:i.x-20,y:i.y,w:20,d:e.d};break;case 180:b={x:i.x,y:i.y-20,w:e.w,d:20};break;case 270:b={x:i.x+e.w,y:i.y,w:20,d:e.d};break;default:b={x:i.x,y:i.y+e.d,w:e.w,d:20};}const names=solids.filter(o=>o.id!==i.id&&overlap(b,{...o,...extent(o)})).map(o=>o.name);if(overlap(b,wardrobe))names.push('入墙衣柜');if(b.x<0||b.y<0||b.x+b.w>s.room.w||b.y+b.d>s.room.d)names.push('墙面');if(names.length)issues.push({kind:'chair',text:i.name+' 后退20cm观察区受 '+names.join('、')+' 阻挡，需调整坐站空间。'});}
  return issues;}
 function fixedValid(s){return [['bed',153,203],['desk',120,70],['fireplace',38.2,26.2]].every(([id,w,d])=>{const i=s.items.find(i=>i.id===id);return i&&Math.abs(i.w-w)<.001&&Math.abs(i.d-d)<.001&&(id!=='fireplace'||Math.abs(i.h-51.8)<.001);});}
 function span(o,room){return o.wall==='west'?room.d:room.w-room.doorW;}
 function outletPoint(o,room){if(o.offset===null)return null;return o.wall==='west'?[0,o.offset]:[o.offset,room.d];}
 function scalar(point,wall,room){return wall==='west'?point[1]:wall==='south'?room.d+point[0]:-point[0];}
 function wallPoint(v,room){return v<0?[-v,0]:v<=room.d?[0,v]:[v-room.d,room.d];}
 function cableRoute(item,outlet,room){const size=extent(item),point=outletPoint(outlet,room);if(!point)return null;
  const candidates=[{wall:'west',anchor:[item.x,item.y+size.d/2],at:[0,item.y+size.d/2],gap:item.x},{wall:'north',anchor:[item.x+size.w/2,item.y],at:[item.x+size.w/2,0],gap:item.y},{wall:'south',anchor:[item.x+size.w/2,item.y+size.d],at:[item.x+size.w/2,room.d],gap:room.d-item.y-size.d}].filter(c=>c.gap>=0&&c.at[0]>=0&&c.at[0]<=room.w&&c.at[1]>=0&&c.at[1]<=room.d);
  for(const c of candidates){const a=scalar(c.at,c.wall,room),b=scalar(point,outlet.wall,room),between=[0,room.d].filter(v=>v>Math.min(a,b)&&v<Math.max(a,b)).sort((x,y)=>a<b?x-y:y-x);c.distance=Math.abs(a-b)+c.gap;c.points=[c.anchor,c.at,...between.map(v=>wallPoint(v,room)),point];}
  // Prefer a furniture back close to a wall; never suggest a route along the unpowered east wall.
  candidates.sort((a,b)=>(a.gap>20)-(b.gap>20)||a.distance-b.distance);return candidates[0]||null;
 }
 function analyze(input,geometryMessages=[]){const s=normalize(input),d=s.design,issues=geometryMessages.map(text=>({kind:'layout',text})),warnings=[],routes=[];
  if(!fixedValid(s))issues.push({kind:'fixed',text:'床、书桌或壁炉的固定尺寸不符。'});
  for(const i of s.items)if(i.h+(i.type==='bed'&&i.frame?.enabled?i.frame.h:0)>s.room.h)issues.push({kind:'height',text:i.name+' 高度超过当前层高。'});
  const access=accessCheck(s);issues.push(...access.issues);
  issues.push(...movementCheck(s));
  const missing=d.outlets.filter(o=>o.offset===null);if(missing.length)issues.push({kind:'outlets',text:missing.length+' 处插座尚未定位，请填写沿墙距离。'});
  for(const o of d.outlets){if(o.offset!==null&&(o.offset<0||o.offset>span(o,s.room)))issues.push({kind:'outlets',text:o.name+' 超出可用墙段。'});if(o.height!==null&&(o.height<0||o.height>s.room.h))issues.push({kind:'outlets',text:o.name+' 离地高度超出层高。'});}
  for(const b of d.boards)if(b.offset<0||b.offset+b.w>span(b,s.room)||b.bottom<0||b.bottom+b.h>s.room.h)issues.push({kind:'board',text:b.name+' 超出墙面范围。'});
  const desk=s.items.find(i=>i.id==='desk');if(desk&&desk.y+extent(desk).d/2>s.room.d/2)issues.push({kind:'desk',text:'书桌已离开窗边区域；当前设计要求书桌靠窗。'});
  for(const c of d.connections){const title={desk:'书桌/电脑',charging:'充电收纳',heater:'小壁炉'}[c.id],item=s.items.find(i=>i.id===c.itemId),outlet=d.outlets.find(o=>o.id===c.outletId);
   if(!item){issues.push({kind:'power',text:title+' 尚未选择承载家具。'});continue;}if(c.id==='heater'&&item.type!=='heater'){issues.push({kind:'power',text:'壁炉用电必须关联到壁炉本身。'});continue;}
   if(!outlet||outlet.offset===null){issues.push({kind:'power',text:title+' 尚未关联已定位插座。'});continue;}if(!c.lengthCm){issues.push({kind:'power',text:title+' 电线长度未填写。'});continue;}
   const route=cableRoute(item,outlet,s.room);if(!route){issues.push({kind:'power',text:title+' 无法规划到已知供电墙。'});continue;}routes.push({...route,id:c.id,name:title});
   if(route.gap>20)issues.push({kind:'power',text:title+' 离可沿墙走线的位置较远，先调整家具位置。'});
   if(route.distance>c.lengthCm)issues.push({kind:'power',text:title+' 沿墙平面走线约 '+Math.ceil(route.distance)+' cm，超过已填电线长度。'});
  }
  const solids=s.items.filter(i=>i.type!=='rug');const door={x:s.room.w-s.room.doorW,y:s.room.d-s.room.doorW,w:s.room.doorW,d:s.room.doorW};
  // A 40cm raster clearance check finds a possible approach, not ergonomic or operating certification.
  const radius=20,step=10,free=(x,y)=>x>=radius&&y>=radius&&x<=s.room.w-radius&&y<=s.room.d-radius&&!solids.some(i=>{const r={...i,...extent(i)};return x>r.x-radius&&x<r.x+r.w+radius&&y>r.y-radius&&y<r.y+r.d+radius;})&&!(x>s.room.w-s.room.wardD-radius&&y<s.room.wardL+radius);
  const start=[Math.round((s.room.w-s.room.doorW/2)/step)*step,Math.floor((s.room.d-radius)/step)*step],queue=[start],seen=new Set([start.join(',')]);let reached=false;
  for(let n=0;n<queue.length&&n<20000;n++){const [x,y]=queue[n];if(!free(x,y))continue;if(y<=80&&x>=s.room.windowLeft&&x<=s.room.w-s.room.wardD){reached=true;break;}for(const q of [[x+step,y],[x-step,y],[x,y+step],[x,y-step]]){const key=q.join(',');if(!seen.has(key)&&free(...q)){seen.add(key);queue.push(q);}}}
  if(!reached)issues.push({kind:'window',text:'未找到约40cm宽的连续开窗接近路线，请调整或实测过道。'});
  const heater=s.items.find(i=>i.id==='fireplace');if(heater){const size=extent(heater);if(Math.min(heater.x,heater.y,s.room.d-heater.y-size.d)>20)warnings.push('壁炉未靠近已知可沿墙供电的位置。');}
  warnings.push('走线仅估算平面距离；插座高度、家具背后空间、抽屉/拉椅及壁炉使用净距需现场复核。');
  warnings.push('柜前站位默认45cm，可在柜子详情修改。非MALM抽屉拉出距离为估算，需实测；椅后20cm、衣柜前60cm及开窗40cm均为观察假设，不是舒适度或人体工学认证。');
  return {issues,warnings,routes,accessZones:access.zones,ready:issues.length===0,unlocated:missing.length};
 }
 function fingerprint(input){const s=normalize(input),data={room:s.room,items:s.items.map(({id,type,x,y,w,d,h,r,color,frame,access})=>({id,type,x,y,w,d,h,r,color,frame,access})),boards:s.design.boards,outlets:s.design.outlets,connections:s.design.connections};let hash=2166136261;for(const c of JSON.stringify(data)){hash^=c.charCodeAt(0);hash=Math.imul(hash,16777619);}return 'layout-'+(hash>>>0).toString(16).padStart(8,'0');}
 function prompt(s,analysis){return '根据同一份尺寸布局制作现实氛围预览。布局编号：'+fingerprint(s)+'。\n房间为完整矩形，无入口凹槽、退台或走廊；门在窗户对面墙的右端，朝门看左侧为镜面衣柜，门右侧是连续白墙。窗左距左墙72cm，左横框距地约112cm，左上外开/左下固定、右侧整块固定玻璃。其他窗框边界为估算。\n床垫153×203cm、原白色120×70cm手摇升降桌、原壁炉尺寸不可更改。两块memo board按墙面数据保留；书桌留在窗边。右墙没有插座，不允许新增插座或无来源供电。所有充电设备和壁炉按已记录插座及电线位置，不擅自移动。\n以layout.json和同编号平面/四向2.5D底图为位置依据。画面保留实际小房间尺度，不能拉宽或缩小家具。每套展示门口看窗和窗边看门两个方向。配色温暖低饱和cozy，无碎花、小格纹或波点。\n当前状态：'+(analysis.ready?'尺寸与供电资料已填写，仍需现场确认使用净距。':'草稿，以下问题未解决，先核对，不应当作可实施方案：\n'+analysis.issues.map(x=>'- '+x.text).join('\n'))+'\n不要把独立生成的不同视角当作严格360度实景；如图像偏离底图须明确指出。';}
 return {normalize,extent,accessZones,accessCheck,movementCheck,fixedValid,span,outletPoint,cableRoute,analyze,fingerprint,prompt};
});

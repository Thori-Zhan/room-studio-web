'use strict';
(function(){
 const input=document.getElementById('localPhotos'),urls=new Map();
 const request=indexedDB.open('room-studio-local-photos',1);let database;
 request.onupgradeneeded=()=>request.result.createObjectStore('photos');
 function show(id,blob){if(urls.has(id))URL.revokeObjectURL(urls.get(id));const url=URL.createObjectURL(blob);urls.set(id,url);const button=document.querySelector('[data-photo="'+id+'"]');button.classList.remove('photo-empty');button.innerHTML='<img alt="本机参考照片 '+id+'" src="'+url+'">';}
 request.onsuccess=()=>{database=request.result;for(let id=1;id<=4;id++){const get=database.transaction('photos').objectStore('photos').get(id);get.onsuccess=()=>{if(get.result)show(id,get.result);};}};
 request.onerror=()=>toast('照片存储不可用，仍可规划和保存布局。');
 document.querySelectorAll('[data-photo]').forEach(button=>button.addEventListener('click',()=>{const id=Number(button.dataset.photo),url=urls.get(id);if(!url){input.click();return;}modal('<h2>本机参考照片 · '+id+'</h2><img class="modal-photo" alt="本机参考照片" src="'+url+'"><p>此照片保存在当前浏览器，未上传到网站。</p>');}));
 input.addEventListener('change',async()=>{if(!database){toast('照片存储尚未就绪，请稍后再试。');return;}const files=[...input.files].slice(0,4);for(let id=1;id<=files.length;id++){const file=files[id-1];if(!file.type.startsWith('image/'))continue;if(file.size>15*1024*1024){toast('单张照片请控制在 15MB 内');continue;}await new Promise(resolve=>{const tx=database.transaction('photos','readwrite');tx.objectStore('photos').put(file,id);tx.oncomplete=()=>{show(id,file);resolve();};tx.onerror=()=>{toast('照片保存失败，浏览器存储可能已满');resolve();};});}input.value='';toast('参考照片已保存在此浏览器');});
})();

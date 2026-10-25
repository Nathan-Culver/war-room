import {validateSave} from './engine.js';
const KEY='war-room-situation-room-v1';
export function readStore(){try{return JSON.parse(localStorage.getItem(KEY))||{slots:[]};}catch{return{slots:[]};}}
export function writeStore(data){localStorage.setItem(KEY,JSON.stringify(data));}
export function autosave(state){const store=readStore();store.autosave=state;writeStore(store);}
export function restore(){try{const s=readStore().autosave;return s?validateSave(s):null;}catch{return null;}}
export function saveSlot(name,state){const store=readStore();store.slots||=[];store.slots.unshift({id:Date.now().toString(36),name:String(name).slice(0,80)||'Checkpoint',time:new Date().toISOString(),state});store.slots=store.slots.slice(0,12);writeStore(store);}
export function loadSlot(id){const slot=readStore().slots.find(x=>x.id===id);if(!slot)throw Error('Save slot not found.');return validateSave(slot.state);}
export function parseImport(text){if(text.length>10e6)throw Error('This save is too large.');const obj=JSON.parse(text);return validateSave(obj.game||obj);}
export function exportSave(state){return JSON.stringify({format:'war-room-situation-room',version:1,exportedAt:new Date().toISOString(),game:state},null,2);}
export function download(text,name){const url=URL.createObjectURL(new Blob([text],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),2000);}

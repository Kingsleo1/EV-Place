import {astraCommand,astraConfig,insertOne,json,methodPost,requireAdmin,updateOne} from './_lib.js';
const collections=['products','orders','service_requests','users','admin_settings','audit_logs'];
export default async function handler(req,res){
if(!methodPost(req,res))return;
const actor=requireAdmin(req,res);if(!actor)return;
const {action,astra,products=[],orders=[],services=[]}=req.body||{};
try{
if(action==='astra-test'){
const cfg=astraConfig(astra||{});const result=await astraCommand(cfg,{find:{collection:(astra?.collection||'products'),options:{limit:1}}});
return json(res,200,{ok:true,message:'Astra Data API responded successfully.',documentsFound:result.data?.documents?.length||0})
}
if(action==='astra-create-schema'){
const cfg=astraConfig(astra||{});
const results=[];
for(const name of collections){try{await astraCommand(cfg,{createCollection:{name}});results.push({name,status:'created'})}catch(e){if(/already exists|exist/i.test(e.message))results.push({name,status:'already exists'});else throw new Error('Could not create collection "'+name+'": '+e.message)}}
await updateOne(cfg,'audit_logs',{id:'schema-'+Date.now()},{$set:{id:'schema-'+Date.now(),actor:actor.email,action:'create-collections',createdAt:new Date().toISOString(),collections:results}},true);
return json(res,200,{ok:true,message:'Required Astra Data API collections are ready.',collections:results})
}
if(action==='astra-sync'){
const cfg=astraConfig(astra||{});const batch=[];
for(const p of products){const doc={...p,_id:String(p.id),syncedAt:new Date().toISOString()};await updateOne(cfg,'products',{_id:String(p.id)},{$set:doc},true);batch.push(doc)}
for(const o of orders){const doc={...o,_id:String(o.id),syncedAt:new Date().toISOString()};await updateOne(cfg,'orders',{_id:String(o.id)},{$set:doc},true)}
for(const s of services){const doc={...s,_id:String(s.id),syncedAt:new Date().toISOString()};await updateOne(cfg,'service_requests',{_id:String(s.id)},{$set:doc},true)}
await insertOne(cfg,'audit_logs',{id:'sync-'+Date.now(),actor:actor.email,action:'manual-catalogue-sync',productCount:products.length,orderCount:orders.length,serviceCount:services.length,createdAt:new Date().toISOString()});
return json(res,200,{ok:true,message:'Sync complete.',synced:products.length,orders:orders.length,services:services.length})
}
return json(res,400,{error:'Unsupported admin action.'})
}catch(e){console.error('EV Place admin API error:',e.message);return json(res,500,{error:e.message||'Admin operation failed.'})}
}

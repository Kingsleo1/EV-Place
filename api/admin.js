import {astraCommand,astraConfig,json,methodPost,requireAdmin} from './_lib.js';
const collections=['products','orders','service_requests','users','admin_settings','audit_logs'];
async function replaceManagedDocuments(cfg,collection,docs){
  // Only replace records owned by this storefront sync; leave other app records intact.
  try{await astraCommand(cfg,{deleteMany:{collection,filter:{syncSource:'evplace-storefront'}}})}catch(e){if(!/collection|filter|delete/i.test(e.message))throw e}
  for(let i=0;i<docs.length;i+=50){
    const batch=docs.slice(i,i+50).map(d=>({...d,syncSource:'evplace-storefront',syncedAt:new Date().toISOString()}));
    if(batch.length)await astraCommand(cfg,{insertMany:{collection,documents:batch,options:{ordered:false}}});
  }
}
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
const auditId='schema-'+Date.now();await astraCommand(cfg,{insertOne:{collection:'audit_logs',document:{_id:auditId,id:auditId,actor:actor.email,action:'create-collections',createdAt:new Date().toISOString(),collections:results}}});
return json(res,200,{ok:true,message:'Required Astra Data API collections are ready.',collections:results})
}
if(action==='astra-sync'){
const cfg=astraConfig(astra||{});
const normalizedProducts=products.map(p=>({...p,_id:String(p.id),id:String(p.id)}));
const normalizedOrders=orders.map(o=>({...o,_id:String(o.id),id:String(o.id)}));
const normalizedServices=services.map(s=>({...s,_id:String(s.id),id:String(s.id)}));
await replaceManagedDocuments(cfg,'products',normalizedProducts);
await replaceManagedDocuments(cfg,'orders',normalizedOrders);
await replaceManagedDocuments(cfg,'service_requests',normalizedServices);
const auditId='sync-'+Date.now();await astraCommand(cfg,{insertOne:{collection:'audit_logs',document:{_id:auditId,id:auditId,actor:actor.email,action:'manual-storefront-sync',productCount:products.length,orderCount:orders.length,serviceCount:services.length,createdAt:new Date().toISOString()}}});
return json(res,200,{ok:true,message:'Sync complete.',synced:products.length,orders:orders.length,services:services.length})
}
return json(res,400,{error:'Unsupported admin action.'})
}catch(e){console.error('EV Place admin API error:',e.message);return json(res,500,{error:e.message||'Admin operation failed.'})}
}

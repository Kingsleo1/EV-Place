import {astraCommand,astraConfig,json,methodPost,session} from '../lib/server.js';
const now=()=>new Date().toISOString();
export default async function handler(req,res){
 if(!methodPost(req,res))return;
 const body=req.body||{};const actor=session(req);
 try{
  const cfg=astraConfig();
  if(body.action==='create-enquiry'){
   const items=Array.isArray(body.items)?body.items.slice(0,50):[];
   if(!items.length)return json(res,400,{error:'Add at least one item before submitting an enquiry.'});
   const id=String(body.id||'EVP-'+Date.now().toString().slice(-8));
   const record={_id:id,id,items:items.map(x=>({id:String(x.id||''),name:String(x.name||'Product').slice(0,180),price:Number(x.price||0),type:String(x.type||'product')})),total:items.reduce((n,x)=>n+Math.max(0,Number(x.price)||0),0),status:'New enquiry',customer:actor?.email||String(body.customerEmail||'Guest').slice(0,254),createdAt:now(),syncSource:'evplace-storefront'};
   await astraCommand(cfg,{insertOne:{collection:'orders',document:record}});
   return json(res,201,{ok:true,record:{...record,_id:undefined}});
  }
  if(body.action==='create-service'){
   const s=body.service||{};
   if(!String(s.name||'').trim()||!String(s.phone||'').trim()||!String(s.location||'').trim())return json(res,400,{error:'Name, phone and location are required.'});
   const id=String(s.id||'SR-'+Date.now().toString().slice(-7));
   const record={_id:id,id,name:String(s.name).slice(0,150),phone:String(s.phone).slice(0,40),location:String(s.location).slice(0,250),car:String(s.car||'').slice(0,160),type:String(s.type||'Inspection').slice(0,100),details:String(s.details||'').slice(0,2000),diagnosis:String(s.diagnosis||'').slice(0,2000),status:'New request',createdAt:now(),syncSource:'evplace-storefront',customerEmail:actor?.email||null};
   await astraCommand(cfg,{insertOne:{collection:'service_requests',document:record}});
   return json(res,201,{ok:true,record:{...record,_id:undefined}});
  }
  return json(res,400,{error:'Unsupported record action.'});
 }catch(e){console.error('EV Place record API error:',e.message);return json(res,503,{error:e.message||'Database is not configured or is temporarily unavailable.'})}
}

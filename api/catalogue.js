import {astraCommand,astraConfig,json,methodPost} from '../lib/server.js';
export default async function handler(req,res){
if(!methodPost(req,res))return;
try{
const cfg=astraConfig();
const result=await astraCommand(cfg,{find:{collection:'products',filter:{syncSource:'evplace-storefront'},options:{limit:1000}}});
const products=(result.data?.documents||[]).filter(p=>p.status!=='archived'&&p.status!=='draft').map(p=>({...p,id:p.id||p._id}));
return json(res,200,{products})
}catch(e){return json(res,503,{products:[],error:'Live catalogue is not available yet.'})}
}

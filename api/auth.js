import {ADMIN_EMAIL,astraConfig,checkPassword,clearCookie,cookie,findOne,hashPassword,insertOne,json,methodPost,session,sign,updateOne} from '../lib/server.js';
export default async function handler(req,res){
if(!methodPost(req,res))return;
const {action,email,password,name}=req.body||{};
try{
if(action==='me'){const u=session(req);return json(res,200,{user:u?{id:u.sub,email:u.email,name:u.name,role:u.role}:null})}
if(action==='logout'){clearCookie(res);return json(res,200,{ok:true})}
if(action==='reset-request'){return json(res,200,{ok:true,message:'If the account exists, reset instructions can be sent once an email delivery provider is configured. No account details have been disclosed.'})}
if(action==='change-password'){
const u=session(req);if(!u)return json(res,401,{error:'Please sign in again.'});
const {currentPassword,newPassword}=req.body||{};if(typeof newPassword!=='string'||newPassword.length<12)return json(res,400,{error:'Use a new password with at least 12 characters.'});
if(u.role==='admin'){
const stored=process.env.ADMIN_BOOTSTRAP_PASSWORD||'';
let valid=stored?await checkPassword(currentPassword,await hashPassword(stored)):false;
let cfg;try{cfg=astraConfig()}catch{}
if(cfg){const doc=await findOne(cfg,'admin_settings',{key:'admin_password_hash'});if(doc?.value)valid=await checkPassword(currentPassword,doc.value)||valid}
if(!valid)return json(res,400,{error:'Current password is incorrect. If this is the initial admin, configure ADMIN_BOOTSTRAP_PASSWORD in Vercel.'});
if(!cfg)return json(res,503,{error:'Configure Astra DB server environment variables before changing the administrator password so the new hash can be persisted securely.'});
const hashed=await hashPassword(newPassword);await updateOne(cfg,'admin_settings',{key:'admin_password_hash'},{$set:{key:'admin_password_hash',value:hashed,updatedAt:new Date().toISOString()}},true);
cookie(res,sign({sub:u.sub,email:u.email,name:u.name,role:u.role}));return json(res,200,{ok:true})
}
const cfg=astraConfig();const user=await findOne(cfg,'users',{email:u.email});if(!user||!await checkPassword(currentPassword,user.passwordHash))return json(res,400,{error:'Current password is incorrect.'});const hashed=await hashPassword(newPassword);await updateOne(cfg,'users',{email:u.email},{$set:{passwordHash:hashed,updatedAt:new Date().toISOString()}});return json(res,200,{ok:true})
}
if(action==='login'){
if(typeof email!=='string'||typeof password!=='string')return json(res,400,{error:'Enter your email and password.'});
const normalized=email.trim().toLowerCase();
if(normalized===ADMIN_EMAIL){
let cfg=null,storedHash=null;try{cfg=astraConfig();const doc=await findOne(cfg,'admin_settings',{key:'admin_password_hash'});storedHash=doc?.value||null}catch{}
let valid=storedHash?await checkPassword(password,storedHash):false;
if(!storedHash){const bootstrap=process.env.ADMIN_BOOTSTRAP_PASSWORD;if(bootstrap)valid=await checkPassword(password,await hashPassword(bootstrap))}
if(!valid)return json(res,401,{error:'Email or password is incorrect. Check the admin bootstrap password and Vercel environment settings.'});
const user={sub:'admin-evplace',email:ADMIN_EMAIL,name:'EV Place Administrator',role:'admin'};cookie(res,sign(user));return json(res,200,{user})
}
const cfg=astraConfig();const user=await findOne(cfg,'users',{email:normalized});if(!user||!await checkPassword(password,user.passwordHash))return json(res,401,{error:'Email or password is incorrect.'});if(user.status==='disabled')return json(res,403,{error:'This account is disabled. Contact EV Place support.'});const u={sub:user._id||user.id||normalized,email:normalized,name:user.name||normalized,role:'customer'};cookie(res,sign(u));return json(res,200,{user:u})
}
if(action==='signup'){
if(typeof email!=='string'||typeof password!=='string'||typeof name!=='string'||!name.trim())return json(res,400,{error:'Enter your name, email and password.'});
if(password.length<10)return json(res,400,{error:'Use a password with at least 10 characters.'});
const normalized=email.trim().toLowerCase();if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized))return json(res,400,{error:'Enter a valid email address.'});
if(normalized===ADMIN_EMAIL)return json(res,409,{error:'This email is reserved for the administrator.'});
const cfg=astraConfig();const existing=await findOne(cfg,'users',{email:normalized});if(existing)return json(res,409,{error:'An account with this email already exists.'});
const user={email:normalized,name:name.trim(),passwordHash:await hashPassword(password),role:'customer',status:'active',createdAt:new Date().toISOString()};await insertOne(cfg,'users',user);const u={sub:normalized,email:normalized,name:user.name,role:'customer'};cookie(res,sign(u));return json(res,201,{user:u})
}
return json(res,400,{error:'Unsupported authentication action.'})
}catch(e){console.error('EV Place auth error:',e.message);return json(res,500,{error:e.message||'Authentication service unavailable.'})}
}

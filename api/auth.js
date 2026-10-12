import {createHash,randomBytes} from 'node:crypto';
import {ADMIN_EMAIL,astraCommand,astraConfig,checkPassword,clearCookie,cookie,findOne,hashPassword,insertOne,json,methodPost,session,sign,updateOne} from '../lib/server.js';
export default async function handler(req,res){
if(!methodPost(req,res))return;
const {action,email,password,name}=req.body||{};
try{
if(action==='me'){const u=session(req);return json(res,200,{user:u?{id:u.sub,email:u.email,name:u.name,role:u.role}:null})}
if(action==='logout'){clearCookie(res);return json(res,200,{ok:true})}
if(action==='reset-request'){
const normalized=String(email||'').trim().toLowerCase();
if(!normalized)return json(res,400,{error:'Enter your account email.'});
const cfg=astraConfig();
if(!process.env.RESEND_API_KEY||!process.env.RESEND_FROM_EMAIL||!process.env.APP_BASE_URL)return json(res,503,{error:'Password reset email is not configured yet. Add RESEND_API_KEY, RESEND_FROM_EMAIL and APP_BASE_URL in Vercel.'});
let exists=normalized===ADMIN_EMAIL;
if(!exists)exists=Boolean(await findOne(cfg,'users',{email:normalized}));
if(exists){
const token=randomBytes(32).toString('hex');const tokenHash=createHash('sha256').update(token).digest('hex');const now=Date.now();
await insertOne(cfg,'password_resets',{_id:tokenHash,tokenHash,email:normalized,expiresAt:now+3600000,createdAt:new Date().toISOString()});
const link=process.env.APP_BASE_URL.replace(/\/$/,'')+'/?reset_token='+encodeURIComponent(token);
const response=await fetch('https://api.resend.com/emails',{method:'POST',headers:{'Authorization':'Bearer '+process.env.RESEND_API_KEY,'Content-Type':'application/json'},body:JSON.stringify({from:process.env.RESEND_FROM_EMAIL,to:[normalized],subject:'Reset your EV Place password',html:'<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;color:#102017"><h2>Reset your EV Place password</h2><p>We received a request to reset your password. This link expires in one hour.</p><p><a href="'+link+'" style="display:inline-block;background:#27d879;color:#062114;padding:12px 18px;text-decoration:none;border-radius:5px;font-weight:bold">Reset password</a></p><p>If you did not request this, you can ignore this email.</p></div>'})});
if(!response.ok)console.error('Password reset email provider returned',response.status);
}
return json(res,200,{ok:true,message:'If this email is registered, password reset instructions will be sent shortly.'})
}
if(action==='reset-password'){
const token=String(req.body?.token||'');const newPassword=String(req.body?.newPassword||'');
if(token.length<32||newPassword.length<12)return json(res,400,{error:'Use the valid reset link and a password of at least 12 characters.'});
const cfg=astraConfig();const tokenHash=createHash('sha256').update(token).digest('hex');const record=await findOne(cfg,'password_resets',{tokenHash});
if(!record||Number(record.expiresAt)<Date.now())return json(res,400,{error:'This reset link is invalid or has expired. Request a new one.'});
const hashed=await hashPassword(newPassword);
if(record.email===ADMIN_EMAIL){await updateOne(cfg,'admin_settings',{key:'admin_password_hash'},{$set:{key:'admin_password_hash',value:hashed,updatedAt:new Date().toISOString()}},true)}
else{const account=await findOne(cfg,'users',{email:record.email});if(!account)return json(res,400,{error:'This account could not be reset. Request a new link.'});await updateOne(cfg,'users',{email:record.email},{$set:{passwordHash:hashed,updatedAt:new Date().toISOString()}},false)}
await astraCommand(cfg,{deleteOne:{collection:'password_resets',filter:{tokenHash}}});
return json(res,200,{ok:true,message:'Password reset successfully. Please sign in with your new password.'})
}
if(action==='change-password'){
const u=session(req);if(!u)return json(res,401,{error:'Please sign in again.'});
const {currentPassword,newPassword}=req.body||{};if(typeof newPassword!=='string'||newPassword.length<12)return json(res,400,{error:'Use a new password with at least 12 characters.'});
if(u.role==='admin'){
const stored=process.env.ADMIN_BOOTSTRAP_PASSWORD||'';
let valid=false;
let cfg;try{cfg=astraConfig()}catch{}
let savedHash=null;
if(cfg){const doc=await findOne(cfg,'admin_settings',{key:'admin_password_hash'});savedHash=doc?.value||null}
if(savedHash){valid=await checkPassword(currentPassword,savedHash)}else{const stored=process.env.ADMIN_BOOTSTRAP_PASSWORD;if(stored)valid=await checkPassword(currentPassword,await hashPassword(stored))}
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
let valid=false;
if(storedHash){valid=await checkPassword(password,storedHash)}else{const bootstrap=process.env.ADMIN_BOOTSTRAP_PASSWORD;if(bootstrap)valid=await checkPassword(password,await hashPassword(bootstrap))}
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

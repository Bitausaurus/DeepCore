// DeepCore — compte Google discret, intégré à la colonne profil du mineur.
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.57.0/+esm';
const supabase = createClient('https://gcbvefjjakxxrfxowjwv.supabase.co','sb_publishable_wo-8XwDNejmNu6PP2T4XSg_r_8w5IRJ');
const css = document.createElement('style');
css.textContent = `
#dc-auth{position:relative;min-width:0;width:100%;box-sizing:border-box;font:inherit;color:#f3dfb6;flex-shrink:0}
#dc-auth .dc-auth-trigger{display:flex;align-items:center;justify-content:center;gap:7px;width:100%;min-height:36px;padding:8px 9px;border:1px solid #b88c49;border-radius:9px;background:linear-gradient(145deg,#203d51,#112638);color:#f8e4bd;font:600 12px system-ui,sans-serif;cursor:pointer;box-shadow:inset 0 1px #ffffff16}
#dc-auth .dc-auth-trigger:hover{background:linear-gradient(145deg,#2b4c63,#163247)}
#dc-auth .dc-auth-trigger:focus-visible,#dc-auth button:focus-visible,#dc-auth input:focus-visible{outline:2px solid #ffd16d;outline-offset:2px}
#dc-auth .dc-google-mark{font-weight:800;font-size:15px;color:#8dc2ff}
#dc-auth .dc-auth-menu{margin-top:9px;padding:15px 13px 13px;border:1px solid #b88c49;border-radius:15px;background:linear-gradient(155deg,#1a3347 0%,#0d1e30 65%,#091522 100%);box-shadow:0 12px 32px #0009,inset 0 1px #ffffff18;min-width:0;animation:dc-auth-appear .18s ease-out}
@keyframes dc-auth-appear{from{opacity:0;transform:translateY(-5px)}to{opacity:1;transform:translateY(0)}}
#dc-auth .dc-auth-menu[hidden]{display:none!important}
#dc-auth .dc-auth-menu label{display:block;font:650 11px system-ui;margin-bottom:8px;color:#f1d5a0;letter-spacing:.15px}
#dc-auth .dc-auth-menu input{display:block;width:100%;min-width:0;margin-top:7px;padding:10px 11px;border:1px solid #607a91;border-radius:9px;background:#071624;color:#fff;font:500 12px system-ui;transition:border-color .15s,box-shadow .15s}
#dc-auth .dc-auth-menu input:focus{border-color:#e2b564;box-shadow:0 0 0 3px #e2b56424;outline:none}
#dc-auth .dc-auth-actions{display:flex;gap:8px;margin-top:12px}
#dc-auth .dc-auth-actions button{flex:1 1 0;min-width:0;padding:9px 6px;border:1px solid #6a8195;border-radius:9px;background:linear-gradient(150deg,#2a4861,#1a3148);color:#edf5ff;font:650 11px system-ui;cursor:pointer;transition:filter .15s,transform .15s}
#dc-auth .dc-auth-actions button:first-child{border-color:#d1a35d;background:linear-gradient(145deg,#a47735,#6b4923);color:#fff5dc}
#dc-auth .dc-auth-actions button:hover{filter:brightness(1.15);transform:translateY(-1px)}
#dc-auth .dc-auth-actions button:disabled{opacity:.55;cursor:wait;transform:none}
#dc-auth .dc-auth-msg{font:600 11px/1.5 system-ui;color:#c5d5e7;margin-top:8px;overflow-wrap:anywhere}
#dc-auth .dc-auth-msg:empty{display:none}
#dc-auth .dc-auth-msg.dc-auth-success{color:#a5efc4}
`;
document.head.append(css);
// Retirer l'ancien panneau flottant si un ancien script est resté dans la page.
for (const old of document.querySelectorAll('#dc-auth')) old.remove();
const sidebar = document.querySelector('.dc-profile-sidebar');
const panel = document.createElement('section');
panel.id='dc-auth';panel.setAttribute('aria-label','Compte Google DeepCore');
panel.innerHTML='<button class="dc-auth-trigger" type="button" aria-expanded="false"><span class="dc-google-mark">G</span><span class="dc-auth-label">Connexion Google</span></button><div class="dc-auth-menu" hidden></div><div class="dc-auth-msg" role="status" aria-live="polite"></div>';
if(sidebar){const stats=sidebar.querySelector('.dc-profile-side-stats');if(stats)sidebar.insertBefore(panel,stats);else sidebar.append(panel);}else{document.querySelector('main')?.prepend(panel);}
const trigger=panel.querySelector('.dc-auth-trigger');const label=panel.querySelector('.dc-auth-label');const menu=panel.querySelector('.dc-auth-menu');const msg=panel.querySelector('.dc-auth-msg');
let noticeTimer;const say=(value='',success=false)=>{clearTimeout(noticeTimer);msg.textContent=value;msg.classList.toggle('dc-auth-success',success);if(value&&success)noticeTimer=setTimeout(()=>{msg.textContent='';msg.classList.remove('dc-auth-success');},3500);};
let currentUser=null;let currentName='';
const make=(tag,text,cls)=>{const e=document.createElement(tag);if(text!==undefined)e.textContent=text;if(cls)e.className=cls;return e;};
function toggle(open){menu.hidden=!open;trigger.setAttribute('aria-expanded',String(open));if(open)say('');}
trigger.addEventListener('click',()=>toggle(menu.hidden));
let renderVersion=0;
async function render(){
 const version=++renderVersion;
 const {data:{user},error}=await supabase.auth.getUser();
 if(version!==renderVersion)return;
 currentUser=user||null;if(error)say('Connexion : '+error.message);
 menu.replaceChildren();
 if(!user){label.textContent='Connexion Google';
  const actions=make('div',undefined,'dc-auth-actions');const login=make('button','Se connecter avec Google');
  login.onclick=async()=>{say('Redirection vers Google…');const {error}=await supabase.auth.signInWithOAuth({provider:'google',options:{redirectTo:window.location.origin+window.location.pathname}});if(error)say(error.message);};
  actions.append(login);menu.replaceChildren(actions);return;
 }
 const {data:profile,error:pe}=await supabase.from('profiles').select('username').eq('id',user.id).maybeSingle();
 if(version!==renderVersion)return;
 if(pe)say('Profil : '+pe.message);
 currentName=profile?.username||'';label.textContent=currentName?'👤 '+currentName:'👤 Mon compte';
 const title=make('label','Pseudo du joueur');const input=make('input');input.value=currentName;input.maxLength=24;input.placeholder='3 à 24 caractères';title.append(input);
 const actions=make('div',undefined,'dc-auth-actions');const save=make('button','Enregistrer');const logout=make('button','Déconnexion');
 save.onclick=async()=>{const username=input.value.trim();
  if(username===currentName){toggle(false);return;}
  if(!/^[A-Za-z0-9_-]{3,24}$/.test(username)){say('Pseudo : 3 à 24 caractères, lettres, chiffres, _ ou -.');return;}
  save.disabled=true;const {error}=await supabase.from('profiles').upsert({id:user.id,username},{onConflict:'id'});save.disabled=false;
  if(error){say(error.code==='23505'?'Ce pseudo est déjà pris.':error.message);return;}
  currentName=username;label.textContent='👤 '+username;toggle(false);say('✓ Pseudo enregistré !',true);
};
 logout.onclick=async()=>{const {error}=await supabase.auth.signOut();if(error){say(error.message);return;}say('Déconnecté');toggle(false);await render();};
 actions.append(save,logout);menu.replaceChildren(title,actions);
}
supabase.auth.onAuthStateChange(()=>{setTimeout(render,0);});
render();


// Classements DeepCore : une seule identité Google pour les trois catégories.
// Les données locales sont déclaratives : sans validation serveur des actions de jeu,
// ces classements ne constituent pas une protection anti-triche.
const lbCss=document.createElement('style');
lbCss.textContent=`
#dc-leaderboard{position:relative;width:100%;min-width:0;font:12px system-ui,sans-serif;color:#f4d79f}
#dc-leaderboard .dc-lb-open{width:100%;padding:9px 7px;border:1px solid #b88c49;border-radius:9px;background:linear-gradient(145deg,#273e52,#102639);color:#f6d69b;font-weight:700;cursor:pointer}
#dc-leaderboard .dc-lb-panel[hidden]{display:none!important}
#dc-leaderboard .dc-lb-panel{position:fixed;z-index:10050;inset:0;background:#020810c9;display:flex;align-items:center;justify-content:center;padding:14px;box-sizing:border-box}
#dc-leaderboard .dc-lb-window{width:min(590px,100%);max-height:min(85vh,750px);overflow:auto;box-sizing:border-box;padding:16px;border:2px solid #b88c49;border-radius:14px;background:linear-gradient(155deg,#142a3c,#091421);box-shadow:0 12px 55px #000b}
#dc-leaderboard .dc-lb-top{display:flex;align-items:center;justify-content:space-between;gap:8px}
#dc-leaderboard .dc-lb-close{background:#263e55;border:1px solid #63758a;color:white;border-radius:7px;padding:5px 10px;cursor:pointer}
#dc-leaderboard .dc-lb-tabs{display:flex;flex-wrap:wrap;gap:5px;margin:13px 0}
#dc-leaderboard .dc-lb-tabs button{flex:1 1 auto;padding:8px 5px;background:#1a3045;border:1px solid #5e7184;border-radius:7px;color:#e5ecf4;cursor:pointer;font-size:11px}
#dc-leaderboard .dc-lb-tabs button[aria-pressed=true]{background:#735328;border-color:#e8b55c;color:#fff}
#dc-leaderboard .dc-lb-row{display:grid;grid-template-columns:38px minmax(0,1fr) auto;gap:8px;align-items:center;padding:9px 5px;border-bottom:1px solid #ffffff20;color:#f2e4c7}
#dc-leaderboard .dc-lb-row span:nth-child(2){overflow-wrap:anywhere}
#dc-leaderboard .dc-lb-details{grid-column:2/4;color:#c7d8e6;font-size:11px;line-height:1.7;padding:5px 0}#dc-leaderboard .dc-lb-row summary{cursor:pointer;font-weight:700;color:#f5d59c;padding:6px 0}#dc-leaderboard .dc-lb-breakdown{display:grid;grid-template-columns:repeat(auto-fit,minmax(105px,1fr));gap:7px;margin:8px 0}#dc-leaderboard .dc-lb-breakdown-item{display:flex;justify-content:space-between;gap:8px;padding:7px 9px;border:1px solid #52667a;border-radius:8px;background:#12283b}#dc-leaderboard .dc-lb-breakdown-item strong{color:#ffdb8a}#dc-leaderboard .dc-lb-statue-split{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:8px}#dc-leaderboard .dc-lb-statue-split>div{border:1px solid #6d7283;border-radius:9px;background:#152a3d;padding:10px}#dc-leaderboard .dc-lb-statue-split b{display:block;color:#f2d49e;font-size:12px}#dc-leaderboard .dc-lb-statue-split strong{font-size:18px;color:#fff}#dc-leaderboard .dc-lb-note{font-size:11px;color:#b4c6d5;line-height:1.45;margin-top:11px}
`;document.head.append(lbCss);
const lbRoot=document.createElement('section');lbRoot.id='dc-leaderboard';lbRoot.innerHTML=`<button type="button" class="dc-lb-open">🏆 Classements mondiaux</button><div class="dc-lb-panel" hidden role="dialog" aria-modal="true" aria-label="Classements mondiaux"><div class="dc-lb-window"><div class="dc-lb-top"><strong>🏆 Classements mondiaux</strong><button class="dc-lb-close" type="button">✕ Fermer</button></div><div class="dc-lb-tabs"><button data-lb="max_depth" aria-pressed="true">⛏️ Profondeur</button><button data-lb="max_prestige" aria-pressed="false">⭐ Prestiges</button><button data-lb="rocks_broken_total" aria-pressed="false">🪨 Roches</button><button data-lb="statue_total" aria-pressed="false">🏺 Statuettes</button></div><div class="dc-lb-results" aria-live="polite">Chargement…</div><div class="dc-lb-note">Classements en ligne : connexion Google nécessaire pour envoyer ses scores. Les statistiques sont issues des sauvegardes locales et ne sont pas encore vérifiées contre la triche.</div></div></div>`;
if(sidebar){sidebar.insertBefore(lbRoot,panel.nextSibling);}else document.querySelector('main')?.prepend(lbRoot);
const lbPanel=lbRoot.querySelector('.dc-lb-panel'),lbResults=lbRoot.querySelector('.dc-lb-results');
let lbCategory='max_depth',lbBusy=false,lbLastSignature='';
const lbFormat=n=>Math.floor(Number(n)||0).toLocaleString('fr-FR');
const lbValue=(obj,key)=>Math.max(0,Math.floor(Number(obj?.[key])||0));
const lbOreNames=['Terre','Pierre','Cuivre','Fer','Argent','Or','Diamant','Adamantium','Graphène'];
function lbCounts(src,keys){const out={};for(const key of keys){const n=Math.max(0,Math.floor(Number(src?.[key])||0));if(n)out[key]=n;}return out;}
function lbRead(){
 try{
  const s=JSON.parse(localStorage.getItem('deepcore_clicker_v1')||'null');if(!s||typeof s!=='object')return null;
  const rocks=lbCounts(s.rockCounts||{},Object.keys(s.rockCounts||{}).slice(0,50));
  const statue=lbCounts(s.statueStock||{},Array.from({length:8},(_,i)=>String(i)));
  const shiny=lbCounts(s.shinyStatueStock||{},Array.from({length:8},(_,i)=>String(i)));
  return {prestige:lbValue(s,'prestiges'),depth:Math.max(lbValue(s,'dcCumulativeDepth'),lbValue(s,'dcMaxDepthEver'),lbValue(s,'depth')),rocks:Object.values(rocks).reduce((a,b)=>a+b,0),rockBreakdown:rocks,statueBreakdown:statue,shinyBreakdown:shiny};
 }catch{return null;}
}
function lbBest(){return lbRead();}
async function lbSubmit(){
 if(lbBusy)return;
 const best=lbBest();if(!best||!currentUser)return;
 const signature=currentUser.id+':'+JSON.stringify(best);if(signature===lbLastSignature)return;
 lbBusy=true;
 try{
  const {error}=await supabase.rpc('submit_deepcore_details',{p_rocks:best.rocks,p_depth:best.depth,p_prestige:best.prestige,p_rock_breakdown:best.rockBreakdown,p_statue_breakdown:best.statueBreakdown,p_shiny_breakdown:best.shinyBreakdown});
  if(error){console.warn('DeepCore classement :',error.message);return;}
  lbLastSignature=signature;
 }finally{lbBusy=false;}
}
async function lbRefresh(){
 lbResults.textContent='Chargement du classement…';
 const category=lbCategory;
 const {data:stats,error}=await supabase.from('player_stats').select('user_id,rocks_broken_total,max_depth,max_prestige,rock_breakdown,statue_total,shiny_statue_total,statue_breakdown,shiny_statue_breakdown').order(category,{ascending:false}).limit(20);
 if(category!==lbCategory)return;
 if(error){lbResults.textContent='Classement indisponible : '+error.message;return;}
 if(!stats?.length){lbResults.textContent='Aucun score enregistré pour le moment.';return;}
 const ids=stats.map(x=>x.user_id);
 const {data:profiles}=await supabase.from('profiles').select('id,username').in('id',ids);
 if(category!==lbCategory)return;
 const names=new Map((profiles||[]).map(x=>[x.id,x.username]));
 lbResults.replaceChildren();
 stats.forEach((score,i)=>{
  const line=document.createElement('div');line.className='dc-lb-row';
  const rank=document.createElement('span');rank.textContent=i===0?'🥇':i===1?'🥈':i===2?'🥉':String(i+1)+'.';
  const name=document.createElement('span');name.textContent=names.get(score.user_id)||'Joueur';
  const val=document.createElement('strong');val.textContent=lbFormat(score[category])+(category==='max_depth'?' m':'');
  line.append(rank,name,val);lbResults.append(line);
  if(category==='rocks_broken_total'){
   const details=document.createElement('details');details.className='dc-lb-details';
   const summary=document.createElement('summary');summary.textContent='🪨 Répartition des roches';details.append(summary);
   const entries=Object.entries(score.rock_breakdown||{}).filter(([,v])=>Number(v)>0).sort((a,b)=>Number(b[1])-Number(a[1]));
   const content=document.createElement('div');content.className='dc-lb-breakdown';
   if(!entries.length)content.textContent='Aucun détail publié pour ce joueur.';
   for(const [key,value] of entries){const item=document.createElement('div');item.className='dc-lb-breakdown-item';const label=document.createElement('span');label.textContent=key;const qty=document.createElement('strong');qty.textContent=lbFormat(value);item.append(label,qty);content.append(item);}
   details.append(content);line.append(details);
  }else if(category==='statue_total'){
   const details=document.createElement('details');details.className='dc-lb-details';
   const summary=document.createElement('summary');summary.textContent='🏺 Voir normales et shiny';details.append(summary);
   const split=document.createElement('div');split.className='dc-lb-statue-split';
   for(const [label,value] of [['🏺 Normales',score.statue_total],['✨ Shiny',score.shiny_statue_total]]){const item=document.createElement('div');const title=document.createElement('b');title.textContent=label;const number=document.createElement('strong');number.textContent=lbFormat(value);item.append(title,number);split.append(item);}
   details.append(split);line.append(details);
  }
 });
}
lbRoot.querySelector('.dc-lb-open').addEventListener('click',async()=>{lbPanel.hidden=false;await lbSubmit();await lbRefresh();});
lbRoot.querySelector('.dc-lb-close').addEventListener('click',()=>{lbPanel.hidden=true;});
lbPanel.addEventListener('click',e=>{if(e.target===lbPanel)lbPanel.hidden=true;});
document.addEventListener('keydown',e=>{if(e.key==='Escape')lbPanel.hidden=true;});
for(const b of lbRoot.querySelectorAll('[data-lb]'))b.addEventListener('click',()=>{lbCategory=b.dataset.lb;for(const x of lbRoot.querySelectorAll('[data-lb]'))x.setAttribute('aria-pressed',String(x===b));lbRefresh();});
// Publication espacée pour ne pas ralentir le minage ni saturer Supabase.
setInterval(lbSubmit,30000);
supabase.auth.onAuthStateChange(()=>{setTimeout(()=>{lbLastSignature='';lbSubmit();},1200);});
setTimeout(lbSubmit,2500);

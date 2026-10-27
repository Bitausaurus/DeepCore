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
#dc-auth .dc-auth-menu{margin-top:7px;padding:10px;border:1px solid #84683e;border-radius:10px;background:#0d1c2d;box-shadow:0 6px 18px #0005;min-width:0}
#dc-auth .dc-auth-menu[hidden]{display:none!important}
#dc-auth .dc-auth-menu label{display:block;font:600 11px system-ui;margin-bottom:5px;color:#d5c39d}
#dc-auth .dc-auth-menu input{display:block;width:100%;min-width:0;padding:8px;border:1px solid #65778c;border-radius:7px;background:#071422;color:white;font:12px system-ui}
#dc-auth .dc-auth-actions{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px}
#dc-auth .dc-auth-actions button{flex:1 1 auto;padding:7px 8px;border:1px solid #65778c;border-radius:7px;background:#263e55;color:#fff;font:600 11px system-ui;cursor:pointer}
#dc-auth .dc-auth-msg{font:11px/1.4 system-ui;color:#c5d5e7;margin-top:6px;overflow-wrap:anywhere}
#dc-auth .dc-auth-msg:empty{display:none}
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
const say=(value='')=>{msg.textContent=value;};
let currentUser=null;let currentName='';
const make=(tag,text,cls)=>{const e=document.createElement(tag);if(text!==undefined)e.textContent=text;if(cls)e.className=cls;return e;};
function toggle(open){menu.hidden=!open;trigger.setAttribute('aria-expanded',String(open));}
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
 save.onclick=async()=>{const username=input.value.trim();if(!/^[A-Za-z0-9_-]{3,24}$/.test(username)){say('Pseudo : 3 à 24 caractères, lettres, chiffres, _ ou -.');return;}
  save.disabled=true;const {error}=await supabase.from('profiles').upsert({id:user.id,username},{onConflict:'id'});save.disabled=false;
  if(error){say(error.code==='23505'?'Ce pseudo est déjà pris.':error.message);return;}say('Pseudo enregistré !');await render();};
 logout.onclick=async()=>{const {error}=await supabase.auth.signOut();if(error){say(error.message);return;}say('Déconnecté');toggle(false);await render();};
 actions.append(save,logout);menu.replaceChildren(title,actions);
}
supabase.auth.onAuthStateChange(()=>{setTimeout(render,0);});
render();

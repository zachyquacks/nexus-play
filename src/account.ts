import { createClient, type SupabaseClient, type User } from "@supabase/supabase-js";

const env = (import.meta as ImportMeta & { env: Record<string,string|undefined> }).env;
const supabaseUrl = env.VITE_SUPABASE_URL;
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY;
let client: SupabaseClient | null = null;
let authSubscription: { unsubscribe: () => void } | null = null;
if (supabaseUrl && supabaseAnonKey) client = createClient(supabaseUrl, supabaseAnonKey);

const escapeHtml = (value: string) => value.replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c] || c));
const content = () => document.querySelector<HTMLElement>(".content");
const showMessage = (message: string, error = false) => {
  const node = document.querySelector<HTMLElement>("#account-message");
  if (node) { node.textContent = message; node.className = error ? "account-message error" : "account-message"; }
};
const currentUser = async (): Promise<User | null> => {
  if (!client) return null;
  const { data } = await client.auth.getUser();
  return data.user;
};

export function bindAccountPage() {
  const nav = document.querySelector(".sidebar nav");
  if (!nav || nav.querySelector('[data-extra="Account"]')) return;
  const button = document.createElement("button");
  button.className = "nav-item";
  button.dataset.extra = "Account";
  button.innerHTML = '<span class="nav-icon">◎</span>Account';
  button.addEventListener("click", renderAccountPage);
  nav.appendChild(button);
}
export async function renderAccountPage() {
  document.querySelectorAll(".sidebar [data-view],.sidebar [data-extra]").forEach(x=>x.classList.remove("active"));
  document.querySelector('.sidebar [data-extra="Account"]')?.classList.add("active");
  const target = content();
  if (!target) return;
  target.innerHTML = '<div class="page-heading"><div class="eyebrow">PLAYER ID / PROFILE</div><h1>Your <span>Account</span></h1><p>Sign in to keep your NEXUS identity and preferences across devices.</p></div><div class="account-message" id="account-message">Checking account setup…</div><div class="account-grid"><section class="account-panel" id="account-panel"></section><section class="account-panel account-benefits"><div class="eyebrow">NEXUS PLAYER ID</div><h2>One account.<br><span>Your whole library.</span></h2><p>Account features include a player profile, synced favourites and recently played history when the database is connected.</p><ul><li>Player profile and display name</li><li>Cloud-synced favourites</li><li>Recently played across devices</li><li>Future cloud gaming session history</li></ul><span class="account-note">Your password is handled by Supabase Auth, never stored by NEXUS PLAY.</span></section></div><footer><span>© 2026 NEXUS PLAY</span><span>PLAYER ID / ACCOUNT</span></footer>';
  if (!client) {
    showMessage("Account backend not configured yet. Add the Supabase environment variables in Vercel to enable real sign-up and login.", true);
    renderSetupPanel();
    return;
  }
  const user = await currentUser();
  if (user) { renderSignedIn(user); await syncLibraryToCloud(); }
  else renderSignedOut();
  authSubscription?.unsubscribe();
  authSubscription = client!.auth.onAuthStateChange((event, session) => {
    if (!document.querySelector("#account-panel")) return;
    if (event === "PASSWORD_RECOVERY" && session?.user) { renderRecovery(); return; }
    if (session?.user) { renderSignedIn(session.user); void syncLibraryToCloud(); }
    else renderSignedOut();
  });
}

function renderRecovery() {
  const panel=document.querySelector<HTMLElement>("#account-panel");
  if(!panel)return;
  panel.innerHTML='<h2>Choose a new password</h2><form id="recovery-form" class="auth-form"><label>New password<input name="password" type="password" minlength="8" autocomplete="new-password" required placeholder="At least 8 characters"></label><button class="primary-btn" type="submit">Update password ↗</button></form>';
  panel.querySelector<HTMLFormElement>("#recovery-form")?.addEventListener("submit",async event=>{
    event.preventDefault();
    const password=String(new FormData(event.currentTarget as HTMLFormElement).get("password")||"");
    const {error}=await client!.auth.updateUser({password});
    if(error)showMessage(error.message,true);
    else{showMessage("Password updated successfully.");const user=await currentUser();if(user)renderSignedIn(user);}
  });
}

function renderSetupPanel() {
  const panel = document.querySelector<HTMLElement>("#account-panel");
  if (!panel) return;
  panel.innerHTML = '<h2>Account setup</h2><p class="account-muted">The sign-in screens are ready. Connect a Supabase project to turn on secure accounts.</p><ol class="setup-steps"><li>Create a Supabase project.</li><li>Run the SQL in <code>supabase/schema.sql</code>.</li><li>Add <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> to Vercel.</li><li>Redeploy the site.</li></ol><a class="outline-btn" href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer">Open Supabase dashboard ↗</a>';
}
function renderSignedOut() {
  const panel = document.querySelector<HTMLElement>("#account-panel");
  if (!panel) return;
  panel.innerHTML = '<div class="account-tabs"><button class="account-tab active" data-auth-tab="login">Sign in</button><button class="account-tab" data-auth-tab="signup">Create account</button></div><form id="auth-form" class="auth-form"><label>Email address<input name="email" type="email" autocomplete="email" required placeholder="you@example.com"></label><label>Password<input name="password" type="password" autocomplete="current-password" minlength="8" required placeholder="At least 8 characters"></label><button class="primary-btn" type="submit" id="auth-submit">Sign in ↗</button></form><button class="text-btn" type="button" id="forgot-password">Forgot password?</button><p class="account-muted">Use an email you can access. New accounts may need email confirmation depending on your Supabase settings.</p>';
  let mode: "login"|"signup" = "login";
  panel.querySelectorAll<HTMLButtonElement>("[data-auth-tab]").forEach(button=>button.addEventListener("click",()=>{
    mode = button.dataset.authTab === "signup" ? "signup" : "login";
    panel.querySelectorAll("[data-auth-tab]").forEach(x=>x.classList.toggle("active",x===button));
    const submit=panel.querySelector<HTMLButtonElement>("#auth-submit");
    const password=panel.querySelector<HTMLInputElement>('input[name="password"]');
    if(submit)submit.textContent=mode==="signup"?"Create account ↗":"Sign in ↗";
    if(password)password.autocomplete=mode==="signup"?"new-password":"current-password";
  }));
  panel.querySelector<HTMLButtonElement>("#forgot-password")?.addEventListener("click",async()=>{
    const email=panel.querySelector<HTMLInputElement>('input[name="email"]')?.value.trim();
    if(!email){showMessage("Enter your email address first, then choose Forgot password.",true);return;}
    const {error}=await client!.auth.resetPasswordForEmail(email,{redirectTo:window.location.origin});
    if(error)showMessage(error.message,true);else showMessage("If an account exists for that email, a password reset link has been sent.");
  });
  panel.querySelector<HTMLFormElement>("#auth-form")?.addEventListener("submit",async event=>{
    event.preventDefault();
    const form=event.currentTarget as HTMLFormElement;
    const data=new FormData(form);
    const email=String(data.get("email")||"").trim();
    const password=String(data.get("password")||"");
    const submit=panel.querySelector<HTMLButtonElement>("#auth-submit");
    if(submit){submit.disabled=true;submit.textContent="Please wait…";}
    const result=mode==="signup"
      ? await client!.auth.signUp({email,password})
      : await client!.auth.signInWithPassword({email,password});
    if(submit){submit.disabled=false;submit.textContent=mode==="signup"?"Create account ↗":"Sign in ↗";}
    if(result.error){showMessage(result.error.message,true);return;}
    if(mode==="signup" && !result.data.session){showMessage("Account created. Check your email to confirm the address, then sign in.");}
    else if(result.data.user){showMessage("Signed in successfully.");renderSignedIn(result.data.user);}
  });
}
async function renderSignedIn(user: User) {
  const panel=document.querySelector<HTMLElement>("#account-panel");
  if(!panel)return;
  const metadata=user.user_metadata||{};
  const displayName=String(metadata.display_name||metadata.name||user.email?.split("@")[0]||"Player");
  const initials=displayName.slice(0,1).toUpperCase();
  panel.innerHTML='<div class="profile-heading"><div class="profile-avatar">'+escapeHtml(initials)+'</div><div><span class="eyebrow">SIGNED IN</span><h2>'+escapeHtml(displayName)+'</h2><p>'+escapeHtml(user.email||"")+'</p></div></div><form id="profile-form" class="auth-form"><label>Display name<input name="displayName" maxlength="32" value="'+escapeHtml(displayName)+'" required></label><button class="outline-btn" type="submit">Save profile ↗</button></form><div class="profile-stats"><div><b id="cloud-favourites">—</b><span>SYNCED FAVOURITES</span></div><div><b id="cloud-recent">—</b><span>RECENT GAMES</span></div></div><button class="signout-btn" id="signout">Sign out</button>';
  panel.querySelector<HTMLFormElement>("#profile-form")?.addEventListener("submit",async event=>{
    event.preventDefault();
    const name=String(new FormData(event.currentTarget as HTMLFormElement).get("displayName")||"").trim();
    const {error}=await client!.auth.updateUser({data:{display_name:name}});
    if(error)showMessage(error.message,true);else{showMessage("Profile updated.");renderSignedIn((await currentUser())!);}
  });
  panel.querySelector("#signout")?.addEventListener("click",async()=>{
    const {error}=await client!.auth.signOut();
    if(error)showMessage(error.message,true);else{showMessage("You have signed out.");renderSignedOut();}
  });
  const {count:favourites}=await client!.from("user_favourites").select("*",{count:"exact",head:true});
  const {count:recent}=await client!.from("user_recent_games").select("*",{count:"exact",head:true});
  const fav=document.querySelector<HTMLElement>("#cloud-favourites");
  const rec=document.querySelector<HTMLElement>("#cloud-recent");
  if(fav)fav.textContent=String(favourites??0);
  if(rec)rec.textContent=String(recent??0);
}

export async function syncLibraryToCloud() {
  if (!client) return;
  const { data: auth } = await client.auth.getUser();
  if (!auth.user) return;
  const localFavs: string[] = JSON.parse(localStorage.getItem("nexus-favorites") || "[]");
  const localRecent: string[] = JSON.parse(localStorage.getItem("nexus-recent") || "[]");
  if (localFavs.length) await client.from("user_favourites").upsert(localFavs.map(game_id=>({user_id:auth.user!.id,game_id})),{onConflict:"user_id,game_id"});
  if (localRecent.length) await client.from("user_recent_games").upsert(localRecent.map(game_id=>({user_id:auth.user!.id,game_id,played_at:new Date().toISOString()})),{onConflict:"user_id,game_id"});
  const [favs,recentGames] = await Promise.all([
    client.from("user_favourites").select("game_id"),
    client.from("user_recent_games").select("game_id,played_at").order("played_at",{ascending:false}).limit(30)
  ]);
  if (!favs.error && favs.data) localStorage.setItem("nexus-favorites",JSON.stringify([...new Set([...localFavs,...favs.data.map(row=>row.game_id)])]));
  if (!recentGames.error && recentGames.data) {
    const merged=[...localRecent,...recentGames.data.map(row=>row.game_id)];
    localStorage.setItem("nexus-recent",JSON.stringify([...new Set(merged)].slice(0,30)));
  }
  window.dispatchEvent(new Event("nexus-library-synced"));
}

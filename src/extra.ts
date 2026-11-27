type ExtraPage = "Cloud Gaming" | "GN-Math" | "Classroom 6x" | "Settings";
const sources = {
  "GN-Math": { url: "https://gn-math.dev/#games", description: "Browse the GN-Math browser game collection, with puzzle, logic and arcade picks." },
  "Classroom 6x": { url: "https://sites.google.com/view/classroom6x/", description: "Open the Classroom 6x collection and explore its browser-game categories." }
};
const iconMap: Record<ExtraPage,string> = {"Cloud Gaming":"▣","GN-Math":"⌘","Classroom 6x":"▦","Settings":"⚙"};
export function bindExtraPages() {
  const nav = document.querySelector(".sidebar nav");
  if (!nav) return;
  (["Cloud Gaming","GN-Math","Classroom 6x","Settings"] as ExtraPage[]).forEach((name) => {
    if (nav.querySelector('[data-extra="'+name+'"]')) return;
    const b = document.createElement("button");
    b.className = "nav-item";
    b.dataset.extra = name;
    b.innerHTML = '<span class="nav-icon">'+iconMap[name]+'</span>'+name;
    b.addEventListener("click", () => showExtraPage(name));
    nav.appendChild(b);
  });
}
function showExtraPage(name: ExtraPage) {
  document.querySelectorAll(".sidebar [data-view],.sidebar [data-extra]").forEach(x=>x.classList.remove("active"));
  document.querySelector('.sidebar [data-extra="'+name+'"]')?.classList.add("active");
  const content = document.querySelector<HTMLElement>(".content");
  if (!content) return;
  if (name === "Cloud Gaming") {
    content.innerHTML = `
      <div class="page-heading"><div class="eyebrow">NEXUS REMOTE PLAY / EXPERIMENTAL</div><h1>Cloud <span>Gaming</span></h1><p>Connect to a remote gaming PC from your browser. The interface is ready; a cloud host still needs to be connected.</p></div>
      <section class="cloud-status"><div class="cloud-status-top"><div><span class="status-dot offline"></span><b>Cloud infrastructure not connected</b></div><span class="status-pill">SETUP REQUIRED</span></div><h2>Your gaming PC, streamed to your browser.</h2><p>NEXUS PLAY will handle the library and session interface. A separate cloud machine will run the games and stream video and controls back here.</p><div class="cloud-actions"><button class="primary-btn" id="cloud-check">Check connection status ↻</button><a class="outline-btn" href="https://github.com/zachyquacks/nexus-play" target="_blank" rel="noopener">View setup docs ↗</a></div><div id="cloud-message" class="cloud-message">No remote host configured yet. No session has been started.</div></section>
      <div class="section-head"><div><div class="eyebrow">SESSION CONTROL</div><h2>My <span>sessions</span></h2></div><span class="status-pill">0 ACTIVE</span></div>
      <div class="cloud-grid"><article class="cloud-tile"><span class="tile-icon">▣</span><h3>Personal cloud PC</h3><p>A persistent remote desktop for supported games and apps.</p><span class="tile-state">HOST REQUIRED</span></article><article class="cloud-tile"><span class="tile-icon">⚡</span><h3>Quick game session</h3><p>Short-lived sessions that can be stopped when you're done.</p><span class="tile-state">HOST REQUIRED</span></article><article class="cloud-tile"><span class="tile-icon">◉</span><h3>Stream quality</h3><p>Resolution, frame rate and connection stats will appear here once connected.</p><span class="tile-state">NOT CONNECTED</span></article></div>
      <div class="section-head"><div><div class="eyebrow">HOW IT WILL WORK</div><h2>Remote play <span>pipeline</span></h2></div></div>
      <div class="pipeline"><div><b>01</b><strong>Choose a session</strong><small>Request a personal PC or a temporary game machine.</small></div><div><b>02</b><strong>Provision securely</strong><small>A separate host creates an isolated user session.</small></div><div><b>03</b><strong>Stream to browser</strong><small>WebRTC carries video, audio and input.</small></div><div><b>04</b><strong>End session</strong><small>Stop the machine and revoke its session access.</small></div></div>
      <footer><span>© 2026 NEXUS PLAY</span><span>REMOTE PLAY / INFRASTRUCTURE PREVIEW</span></footer>`;
    document.querySelector("#cloud-check")?.addEventListener("click",()=>{const m=document.querySelector<HTMLElement>("#cloud-message");if(m)m.textContent="Still not connected. Add a cloud host and secure session API before enabling real remote play.";});
    return;
  }
  if (name === "GN-Math" || name === "Classroom 6x") {
    const source = sources[name];
    content.innerHTML = `
      <div class="page-heading"><div class="eyebrow">EXTERNAL GAME LIBRARY / PARTNER SOURCE</div><h1>${name}</h1><p>${source.description} Games remain hosted by their original website.</p></div>
      <div class="source-banner"><div><span class="status-pill">EXTERNAL CATALOGUE</span><h2>Explore more games</h2><p>If the catalogue does not display inside this window, open the original site in a new tab.</p></div><a class="primary-btn" href="${source.url}" target="_blank" rel="noopener noreferrer">Open ${name} ↗</a></div>
      <div class="source-frame-wrap"><div class="source-frame-head"><span><i class="online-dot"></i> SOURCE WEBSITE</span><a href="${source.url}" target="_blank" rel="noopener noreferrer">Open separately ↗</a></div><iframe class="source-frame" src="${source.url}" title="${name} game catalogue" loading="lazy" referrerpolicy="strict-origin-when-cross-origin" allow="fullscreen; gamepad"></iframe></div>
      <p class="source-note">NEXUS PLAY does not own these games. Availability, embedding and play rules are controlled by each original publisher.</p>
      <footer><span>© 2026 NEXUS PLAY</span><span>DISCOVER / ${name.toUpperCase()}</span></footer>`;
    return;
  }
  content.innerHTML = `
    <div class="page-heading"><div class="eyebrow">YOUR NEXUS EXPERIENCE</div><h1>Settings</h1><p>Manage your local player experience and learn about platform integrations.</p></div>
    <div class="settings-grid"><section class="settings-panel"><h2>Player preferences</h2><p>Favourites and recent games are currently saved in this browser only.</p><div class="setting-row"><span>Local favourites</span><b>Enabled</b></div><div class="setting-row"><span>Recently played history</span><b>Enabled</b></div><div class="setting-row"><span>Cloud sync</span><b class="muted">Not configured</b></div></section><section class="settings-panel"><h2>Platform services</h2><p>These services need secure backend configuration before they can go live.</p><div class="setting-row"><span>Account authentication</span><b class="muted">Coming later</b></div><div class="setting-row"><span>Cloud PC provider</span><b class="muted">Not connected</b></div><div class="setting-row"><span>Public leaderboards</span><b class="muted">Not configured</b></div></section></div>
    <footer><span>© 2026 NEXUS PLAY</span><span>SETTINGS</span></footer>`;
}

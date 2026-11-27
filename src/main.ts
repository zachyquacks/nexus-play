import "./style.css";
import { bindExtraPages } from "./extra.js";
import { syncLibraryToCloud } from "./account.js";

type Game = { id: string; title: string; category: string; description: string; players: string; color: string; art: string; featured?: boolean; externalUrl?: string; };
const gameBase = "https://sausi-7.github.io/games/games/";
const games: Game[] = [
  { id:"2048", title:"2048", category:"Puzzle", description:"Slide numbered tiles, merge matching values and work your way to 2048.", players:"Single player", color:"#13d9ff", art:"2048", featured:true, externalUrl:gameBase+"puzzle/2048/index.html" },
  { id:"sudoku", title:"Sudoku", category:"Puzzle", description:"Fill the 9×9 grid so every row, column and box contains each number once.", players:"Single player", color:"#a78bfa", art:"▦", externalUrl:gameBase+"puzzle/sudoku/index.html" },
  { id:"chess", title:"Chess", category:"Board", description:"Play a classic game of chess against the computer.", players:"Vs computer", color:"#72e0a1", art:"♞", externalUrl:gameBase+"board/chess/index.html" },
  { id:"car-race", title:"Car Race", category:"Racing", description:"A 3D traffic-dodging racing game. Keep moving and chase a new best run.", players:"Single player", color:"#ff9d5c", art:"⌁", externalUrl:gameBase+"racing/car-race/index.html" },
  { id:"stack-tower", title:"Stack Tower", category:"Arcade", description:"Time each drop and stack the moving blocks as high as you can.", players:"Score attack", color:"#6f9cff", art:"▤", externalUrl:gameBase+"3d/stack-tower/index.html" },
  { id:"wordlee", title:"Wordlee", category:"Word", description:"Use logic and deduction to guess the hidden five-letter word.", players:"Word puzzle", color:"#f08bc4", art:"A", externalUrl:gameBase+"word-quiz/wordle/index.html" },
  { id:"basketball", title:"Basketball", category:"Sports", description:"Line up your shot and arc the ball through the hoop.", players:"Score attack", color:"#ffb35c", art:"◉", externalUrl:gameBase+"sports/basketball/index.html" },
  { id:"bowling", title:"Bowling", category:"Sports", description:"Aim your roll and try to knock down all the pins.", players:"Single player", color:"#8be0c0", art:"●", externalUrl:gameBase+"sports/bowling/index.html" },
  { id:"breakoid", title:"Breakoid", category:"Arcade", description:"A classic paddle-and-brick arcade challenge.", players:"Score attack", color:"#ef8fbd", art:"▥", externalUrl:gameBase+"arcade/breakoid/index.html" },
  { id:"bubble-pop", title:"Bubble Pop", category:"Casual", description:"Match colourful bubbles and clear the board.", players:"Casual", color:"#7ed9ef", art:"◌", externalUrl:gameBase+"casual/bubble-pop/index.html" },
  { id:"candy-crush", title:"Candy Crush", category:"Casual", description:"Swap and match candies in a colourful match-three puzzle.", players:"Casual", color:"#f08bc4", art:"✿", externalUrl:gameBase+"casual/candy-crush/index.html" }
];

const icon = (name:string) => ({home:"⌂",discover:"⌕",library:"▤",recent:"◷",saved:"♡",settings:"⚙",play:"▶",search:"⌕",arrow:"↗",close:"×"} as Record<string,string>)[name] || "•";
const read = (key:string, fallback:string[] = []) => { try { return JSON.parse(localStorage.getItem(key) || "null") || fallback; } catch { return fallback; } };
let favorites:string[] = read("nexus-favorites");
let recent:string[] = read("nexus-recent");
let activeView = "Home";
let searchTerm = "";
let activeCategory = "All";
let currentGame:Game|null = null;
let snakeTimer:number|undefined;
let snakeState:{x:number;y:number;dx:number;dy:number;food:{x:number;y:number};score:number;body:{x:number;y:number}[]}|null = null;

const app = document.querySelector<HTMLDivElement>("#app")!;
const categories = ["All","Arcade","Puzzle","Racing","Sports","Board","Word","Casual","3D"];
const gameCard = (g:Game) => `
  <article class="game-card" data-game="${g.id}" style="--game-color:${g.color}">
    <button class="artwork" data-open="${g.id}" aria-label="Open ${g.title}">
      <span class="art-grid"></span><span class="art-symbol">${g.art}</span><span class="art-label">${g.category.toUpperCase()}</span>
      <span class="art-glow"></span>
    </button>
    <div class="game-meta"><div><h3>${g.title}</h3><p>${g.players}</p></div>
      <button class="heart ${favorites.includes(g.id)?"is-fav":""}" data-fav="${g.id}" aria-label="Toggle favourite">${favorites.includes(g.id)?"♥":"♡"}</button>
    </div>
  </article>`;

function render() {
  const filtered = games.filter(g => (activeCategory==="All" || g.category===activeCategory) && (activeView!=="Favourites" || favorites.includes(g.id)) && (activeView!=="Recently Played" || recent.includes(g.id)) && (activeView==="My Library" ? true : true) && (g.title+" "+g.category+" "+g.description).toLowerCase().includes(searchTerm.toLowerCase()));
  app.innerHTML = `
    <div class="shell">
      <aside class="sidebar">
        <a class="brand" href="#" data-view="Home"><span class="brand-mark">N</span><span>NEXUS<span class="brand-light">PLAY</span></span></a>
        <div class="side-label">MENU</div>
        <nav>
          ${[["Home","home"],["Discover","discover"],["My Library","library"],["Recently Played","recent"],["Favourites","saved"]].map(([label,ic])=>`<button class="nav-item ${activeView===label?"active":""}" data-view="${label}"><span class="nav-icon">${icon(ic)}</span>${label}${label==="Favourites"?`<span class="nav-count">${favorites.length}</span>`:""}</button>`).join("")}
        </nav>
        <div class="sidebar-bottom"><div class="online-dot"></div><div><b>All systems ready</b><small>Browser gaming · Online</small></div></div>
      </aside>
      <main class="main">
        <header class="topbar"><div class="crumb">NEXUS <span>/</span> <b>${activeView.toUpperCase()}</b></div><div class="top-actions"><label class="search"><span>⌕</span><input id="search" placeholder="Search games..." value="${searchTerm.replace(/"/g,"&quot;")}"><kbd>⌘ K</kbd></label><button class="avatar" title="Local player profile">P</button></div></header>
        <section class="content">
          ${activeView==="Home" ? `
            <div class="welcome"><div><div class="eyebrow"><span class="pulse"></span> YOUR NEXT ADVENTURE STARTS HERE</div><h1>Ready when<br><em>you are.</em></h1><p>Pick a game. Jump straight in. No downloads, no waiting.</p><button class="primary-btn" data-open="2048"><span>▶</span> Play featured game <b>↗</b></button></div><div class="hero-art"><div class="hero-orbit orbit-one"></div><div class="hero-orbit orbit-two"></div><div class="hero-core">N<span>✦</span></div><div class="hero-caption">NEXUS / 001</div><div class="hero-lines"></div></div><div class="hero-index">01 <span>/ 06</span></div></div>
            <div class="section-head"><div><div class="eyebrow">PICK UP WHERE YOU LEFT OFF</div><h2>Featured <span>for you</span></h2></div><button class="text-btn" data-view="Discover">Explore all games ↗</button></div>
            <div class="featured-row">${gameCard(games[0])}<div class="feature-copy"><span class="tag">EDITOR'S PICK</span><h2>2048</h2><p>Slide, merge matching tiles and see if you can reach 2048.</p><div class="feature-stats"><span>◉ PUZZLE</span><span>⌁ QUICK PLAY</span><span>◷ 3–5 MIN</span></div><button class="outline-btn" data-open="2048">View game details <span>↗</span></button></div></div>
            <div class="section-head"><div><div class="eyebrow">THE COMMUNITY IS PLAYING</div><h2>Trending <span>now</span></h2></div><button class="text-btn" data-view="Discover">See collection ↗</button></div><div class="game-grid">${games.slice(1,4).map(gameCard).join("")}</div>
          ` : `
            <div class="page-heading"><div class="eyebrow">THE NEXUS COLLECTION</div><h1>${activeView}</h1><p>${activeView==="Favourites"?"Your saved games, all in one place.":activeView==="Recently Played"?"Jump back into your recent games.":"Find your next favourite. Play instantly in your browser."}</p></div>
            <div class="filters">${categories.map(c=>`<button class="filter ${activeCategory===c?"selected":""}" data-category="${c}">${c}</button>`).join("")}<span class="result-count">${filtered.length} GAMES</span></div>
            <div class="game-grid library-grid">${filtered.length?filtered.map(gameCard).join(""):`<div class="empty-state"><span>⌕</span><h3>No games found</h3><p>Try another search or category.</p><button class="text-btn" data-reset>Clear filters ↗</button></div>`}</div>
          `}
          <footer><span>© 2026 NEXUS PLAY</span><span>MADE FOR THE LOVE OF PLAY <b>✦</b></span></footer>
        </section>
      </main>
    </div>
    <div id="modal-root"></div>`;
  bind();
}
function bind(){
  bindExtraPages();
  app.querySelectorAll<HTMLElement>("[data-view]").forEach(el=>el.addEventListener("click",()=>{activeView=el.dataset.view||"Home";activeCategory="All";render();}));
  app.querySelectorAll<HTMLElement>("[data-category]").forEach(el=>el.addEventListener("click",()=>{activeCategory=el.dataset.category||"All";render();}));
  app.querySelectorAll<HTMLElement>("[data-open]").forEach(el=>el.addEventListener("click",()=>openGame(el.dataset.open||"")));
  app.querySelectorAll<HTMLElement>("[data-fav]").forEach(el=>el.addEventListener("click",()=>{const id=el.dataset.fav||"";favorites=favorites.includes(id)?favorites.filter(x=>x!==id):[...favorites,id];localStorage.setItem("nexus-favorites",JSON.stringify(favorites));void syncLibraryToCloud();render();}));
  app.querySelector<HTMLElement>("[data-reset]")?.addEventListener("click",()=>{searchTerm="";activeCategory="All";render();});
  app.querySelector<HTMLInputElement>("#search")?.addEventListener("input",e=>{searchTerm=(e.target as HTMLInputElement).value;const pos=(e.target as HTMLInputElement).selectionStart;render();const input=app.querySelector<HTMLInputElement>("#search");input?.focus();input?.setSelectionRange(pos,pos);});
  document.onkeydown=e=>{if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==="k"){e.preventDefault();app.querySelector<HTMLInputElement>("#search")?.focus();}if(e.key==="Escape")closeModal();};
}
function openGame(id:string){const g=games.find(x=>x.id===id);if(!g)return;currentGame=g;document.querySelector("#modal-root")!.innerHTML=`
  <div class="modal-backdrop" id="backdrop"><section class="game-modal"><button class="modal-close" id="close">×</button><div class="modal-art" style="--game-color:${g.color}"><span>${g.art}</span></div><div class="modal-content"><div class="eyebrow">${g.category.toUpperCase()} / BROWSER GAME</div><h2>${g.title}</h2><p>${g.description}</p><div class="modal-facts"><span>◉ ${g.players}</span><span>✓ No download required</span></div><button class="primary-btn" id="launch">▶ Launch game <b>↗</b></button></div></section></div>`;
document.querySelector("#close")?.addEventListener("click",closeModal);document.querySelector("#backdrop")?.addEventListener("click",e=>{if(e.target===e.currentTarget)closeModal();});document.querySelector("#launch")?.addEventListener("click",()=>launchGame(g));}
function closeModal(){if(snakeTimer)clearInterval(snakeTimer);snakeTimer=undefined;currentGame=null;document.querySelector("#modal-root")!.innerHTML="";}
function launchGame(g:Game){recent=[g.id,...recent.filter(x=>x!==g.id)].slice(0,8);localStorage.setItem("nexus-recent",JSON.stringify(recent));void syncLibraryToCloud();
if(g.externalUrl){
document.querySelector("#modal-root")!.innerHTML=`
  <div class="modal-backdrop"><section class="play-modal external-player"><div class="play-top"><div><span class="eyebrow">NOW PLAYING · HOSTED GAME</span><h2>${g.title}</h2></div><div class="player-actions"><a class="outline-btn" href="${g.externalUrl}" target="_blank" rel="noopener noreferrer">Open in new tab ↗</a><button class="modal-close" id="exit">×</button></div></div><iframe class="external-game-frame" src="${g.externalUrl}" title="${g.title}" loading="lazy" allow="fullscreen; gamepad" sandbox="allow-scripts allow-same-origin allow-forms allow-pointer-lock"></iframe><div class="play-bottom"><span>GAME HOSTED BY SAUSI-7 GAMES · OPEN-SOURCE COLLECTION</span><span>IF IT DOESN'T LOAD, USE OPEN IN NEW TAB ↗</span></div></section></div>`;
document.querySelector("#exit")?.addEventListener("click",closeModal);return;
}
document.querySelector("#modal-root")!.innerHTML=`
  <div class="modal-backdrop"><section class="play-modal"><div class="play-top"><div><span class="eyebrow">NOW PLAYING</span><h2>${g.title}</h2></div><button class="modal-close" id="exit">×</button></div><div class="game-stage" id="stage"><div class="game-hud"><span>SCORE <b id="score">0</b></span><span>BEST <b id="best">${Number(localStorage.getItem("nexus-best")||0)}</b></span></div><canvas id="game-canvas" width="720" height="420"></canvas><div class="game-overlay" id="overlay"><div class="overlay-mark">✦</div><h3>Ready, player one?</h3><p>Use arrow keys or WASD to move. Collect the glowing orbs. Avoid the walls and yourself.</p><button class="primary-btn" id="start-game">Start playing <b>↗</b></button></div></div><div class="play-bottom"><span>⌨ ARROW KEYS / WASD TO MOVE</span><button class="text-btn" id="restart">Restart game ↻</button></div></section></div>`;
document.querySelector("#exit")?.addEventListener("click",closeModal);document.querySelector("#start-game")?.addEventListener("click",startSnake);document.querySelector("#restart")?.addEventListener("click",startSnake);}
function startSnake(){if(snakeTimer)clearInterval(snakeTimer);const canvas=document.querySelector<HTMLCanvasElement>("#game-canvas")!;const ctx=canvas.getContext("2d")!;const overlay=document.querySelector<HTMLElement>("#overlay")!;overlay.classList.add("hidden");snakeState={x:10,y:10,dx:1,dy:0,food:{x:18,y:10},score:0,body:[{x:10,y:10},{x:9,y:10},{x:8,y:10}]};const cell=20,cols=36,rows=21;let next={x:1,y:0};const key=(e:KeyboardEvent)=>{const k=e.key.toLowerCase();const dirs:Record<string,{x:number;y:number}>={arrowup:{x:0,y:-1},w:{x:0,y:-1},arrowdown:{x:0,y:1},s:{x:0,y:1},arrowleft:{x:-1,y:0},a:{x:-1,y:0},arrowright:{x:1,y:0},d:{x:1,y:0}};if(dirs[k]){e.preventDefault();const d=dirs[k];if(d.x!==-snakeState!.dx||d.y!==-snakeState!.dy)next=d;}};document.addEventListener("keydown",key);snakeTimer=window.setInterval(()=>{if(!snakeState)return;snakeState.dx=next.x;snakeState.dy=next.y;const head={x:snakeState.x+snakeState.dx,y:snakeState.y+snakeState.dy};if(head.x<0||head.y<0||head.x>=cols||head.y>=rows||snakeState.body.some(p=>p.x===head.x&&p.y===head.y)){clearInterval(snakeTimer);snakeTimer=undefined;const best=Math.max(snakeState.score,Number(localStorage.getItem("nexus-best")||0));localStorage.setItem("nexus-best",String(best));document.querySelector("#best")!.textContent=String(best);overlay.classList.remove("hidden");overlay.innerHTML=`<div class="overlay-mark">↻</div><h3>Run complete</h3><p>You scored ${snakeState.score}. Best score: ${best}.</p><button class="primary-btn" id="start-game">Play again <b>↗</b></button>`;document.querySelector("#start-game")?.addEventListener("click",startSnake);document.removeEventListener("keydown",key);return;}snakeState.body.unshift(head);snakeState.x=head.x;snakeState.y=head.y;if(head.x===snakeState.food.x&&head.y===snakeState.food.y){snakeState.score+=10;snakeState.food={x:Math.floor(Math.random()*cols),y:Math.floor(Math.random()*rows)};document.querySelector("#score")!.textContent=String(snakeState.score);}else snakeState.body.pop();ctx.fillStyle="#0a111b";ctx.fillRect(0,0,canvas.width,canvas.height);ctx.strokeStyle="rgba(130,180,210,.055)";for(let x=0;x<=cols;x++){ctx.beginPath();ctx.moveTo(x*cell,0);ctx.lineTo(x*cell,canvas.height);ctx.stroke();}for(let y=0;y<=rows;y++){ctx.beginPath();ctx.moveTo(0,y*cell);ctx.lineTo(canvas.width,y*cell);ctx.stroke();}ctx.fillStyle="#ffbd69";ctx.shadowColor="#ffbd69";ctx.shadowBlur=18;ctx.beginPath();ctx.arc((snakeState.food.x+.5)*cell,(snakeState.food.y+.5)*cell,7,0,Math.PI*2);ctx.fill();ctx.shadowBlur=10;snakeState.body.forEach((p,i)=>{ctx.fillStyle=i===0?"#8cf4ff":"#16bfe2";ctx.shadowColor="#16bfe2";ctx.fillRect(p.x*cell+2,p.y*cell+2,cell-4,cell-4);});ctx.shadowBlur=0;},105);}
render();
window.addEventListener("nexus-library-synced",()=>{favorites=read("nexus-favorites");recent=read("nexus-recent");render();});

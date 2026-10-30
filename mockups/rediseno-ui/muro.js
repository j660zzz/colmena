// Mockups aislados: solo leen el snapshot local; no importan la app ni llaman a Supabase.
const data = await fetch('./data.json').then(r => r.json());
const style = new URLSearchParams(location.search).get('estilo') || 'pares';
const root = document.querySelector('#screen');
root.classList.add(style);
if (['vinculo','directo'].includes(style)) root.classList.add('bloques-evolucion');
const esc = s => String(s).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
const initials = p => p.nombre.split(' ').map(s => s[0]).slice(0, 2).join('');
const avatar = (p, cls = '') => `<span class="avatar ${cls}" aria-hidden="true">${initials(p)}</span>`;
const example = '<span class="example">Ejemplo</span>';
// Íconos reutilizados literalmente de src/components/ui.jsx, sin redibujar la marca.
const paths = {
  plus:'M12 5v14 M5 12h14',
  right:'M9.5 5 16 12l-6.5 7',
  wall:'M4 5.5A1.5 1.5 0 0 1 5.5 4h13A1.5 1.5 0 0 1 20 5.5v3A1.5 1.5 0 0 1 18.5 10h-13A1.5 1.5 0 0 1 4 8.5v-3Z M4 15.5A1.5 1.5 0 0 1 5.5 14h13a1.5 1.5 0 0 1 1.5 1.5v3a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 18.5v-3Z',
  users:'M9.2 4.6a3.3 3.3 0 1 0 0 6.6 3.3 3.3 0 0 0 0-6.6Z M2.8 20c0-3.5 2.9-6.4 6.4-6.4s6.4 2.9 6.4 6.4 M15.8 5.4a3 3 0 0 1 0 5.4 M17.6 14.2c2.1.9 3.6 2.7 3.6 5.8',
  cal:'M4 7.5A2.5 2.5 0 0 1 6.5 5h11A2.5 2.5 0 0 1 20 7.5v11A2.5 2.5 0 0 1 17.5 21h-11A2.5 2.5 0 0 1 4 18.5v-11Z M8 3v4 M16 3v4 M4 10.5h16',
  tools:'M9 7V5.6A1.6 1.6 0 0 1 10.6 4h2.8A1.6 1.6 0 0 1 15 5.6V7 M3.5 7.5h17v11a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2v-11Z M3.5 12.5h17',
  card:'M12 3l7.5 4.4v9.2L12 21l-7.5-4.4V7.4L12 3Z M12 11.4a2.1 2.1 0 1 0 0-4.2 2.1 2.1 0 0 0 0 4.2Z M8.2 16.6c.4-1.9 1.9-2.9 3.8-2.9s3.4 1 3.8 2.9',
  hand:'M8 12.5V6.8a1.4 1.4 0 0 1 2.8 0v5 M10.8 11V5.4a1.4 1.4 0 0 1 2.8 0V11 M13.6 11.4V7a1.4 1.4 0 0 1 2.8 0v6.5c0 3.6-2.4 6.5-6 6.5s-6-2.9-6-6.5v-1.6a1.4 1.4 0 0 1 2.8 0'
};
const icon = (name, cls='') => `<svg class="icon ${cls}" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${paths[name]}"/></svg>`;
const brand = `<span class="brand"><img src="assets/celda-oficial.svg" alt="" width="25" height="28">Colmena</span>`;
const publish = `<button class="primary publish" type="button">${icon('plus')}Publicar</button>`;
const filters = `<div class="filters" role="group" aria-label="Tipo de publicación">${[['all','Todo'],['need','Necesito'],['offer','Ofrezco']].map(([key,label])=>`<button type="button" data-filter="${key}" aria-pressed="${key==='all'}">${label}</button>`).join('')}</div>`;
const people = `<div class="people-strip"><div class="avatar-stack">${data.profiles.slice(0,3).map(p=>avatar(p)).join('')}</div><span><b>Emprender se comparte.</b><small>Perfiles de ejemplo</small></span></div>`;
const nav = `<nav class="bottom-nav" aria-label="Navegación principal">${[['wall','Muro'],['users','Miembros'],['cal','Encuentro'],['tools','Herramientas'],['card','Carnet']].map(([name,label],i)=>`<button type="button" ${i===0?'aria-current="page"':''} data-nav="${label}">${icon(name)}<span>${label}</span></button>`).join('')}</nav>`;
const top = `<header class="topbar">${brand}<button type="button" class="enter" data-nav="Carnet">Entrar ${icon('right')}</button></header>`;
const dates = post => new Intl.DateTimeFormat('es-CO',{day:'numeric',month:'short',timeZone:'America/Bogota'}).format(new Date(post.created_at));
const author = (p, mode='') => `<div class="author">${mode?`<span class="avatar-edge">${avatar(p)}</span>`:avatar(p)}<div><div class="author-name">${esc(p.nombre)} ${example}</div><div class="author-meta">${esc(p.marca)}${mode==='compact'?'':` · ${esc(p.rol)}`}</div></div></div>`;
function postHTML(post) {
  const p = data.profiles.find(p=>p.id===post.autor_id);
  const tag = `<span class="type ${post.tipo}">${post.tipo==='need'?'Necesito':'Ofrezco'}</span>`;
  const details = `<div class="post-meta">${tag}<time datetime="${post.created_at}">${dates(post)}</time></div>`;
  const body = `<p class="post-text">${esc(post.texto)}</p>`;
  const cats = `<span class="post-cats">${post.categorias.map(esc).join(' · ')}</span>`;
  const action = `<button type="button" class="respond" data-response="${esc(p.nombre)}">${icon(post.tipo==='need'?'hand':'right')}<span>${post.tipo==='need'?'Puedo ayudar':'Me interesa'}</span>${style==='bloques'?icon('right'):''}</button>`;
  if(style==='vinculo') return `<article class="post ${post.tipo}" data-type="${post.tipo}">${author(p,'framed')}${details}${body}<div class="post-foot">${cats}${action}</div></article>`;
  if(style==='directo') return `<article class="post ${post.tipo}" data-type="${post.tipo}">${details}${body}<div class="directo-signature">${author(p,'compact')}${action}</div><div class="directo-cats">${cats}</div></article>`;
  if(style==='bloques') return `<article class="post ${post.tipo}" data-type="${post.tipo}">${details}${body}${author(p)}<div class="post-foot">${cats}${action}</div></article>`;
  if(style==='pulso') return `<article class="post ${post.tipo}" data-type="${post.tipo}">${details}${body}${author(p)}<div class="post-foot">${cats}${action}</div></article>`;
  return `<article class="post ${post.tipo}" data-type="${post.tipo}">${author(p)}${details}${body}<div class="post-foot">${cats}${action}</div></article>`;
}
let intro;
if(style==='vinculo') {
  intro = `<div class="intro"><span class="eyebrow">MURO · DCV JAVERIANA</span><h1>Entre todos.</h1><button type="button" class="primary publish compose">¿Qué necesitas o qué ofreces? ${icon('plus')}</button></div>${filters}`;
} else if(style==='directo') {
  intro = `<div class="intro"><div class="directo-title"><div><span class="eyebrow">DCV · JAVERIANA CALI</span><h1>El Muro.</h1></div>${publish}</div><p class="intro-copy">Ideas, manos y lo que hace falta.</p></div>${filters}`;
} else if(style==='bloques') {
  intro = `<div class="intro"><span class="eyebrow">EL MURO · DCV JAVERIANA</span><h1>Lo que haces.<br>Lo que falta.</h1><div class="intro-foot"><p>Conecta las dos cosas.</p>${publish}</div></div>${filters}`;
} else if(style==='pulso') {
  intro = `<div class="intro"><div class="intro-kicker"><span class="eyebrow">MURO DE LA COMUNIDAD</span><span class="edition">DCV / CALI</span></div><h1>Aquí nadie<br>arranca <mark>solo.</mark></h1><div class="intro-foot"><div class="avatar-stack">${data.profiles.slice(0,3).map(p=>avatar(p)).join('')}<span class="stack-label">Perfiles<br>de ejemplo</span></div>${publish}</div></div><div class="feed-head"><h2>Entre nosotros</h2><span>Necesito / ofrezco</span></div>${filters}`;
} else {
  intro = `<div class="intro"><span class="eyebrow">QUÉ BUENO VERTE POR AQUÍ</span><h1>Tu gente,<br>a un mensaje.</h1>${people}<div class="intro-foot"><span class="muro-label">Muro de la comunidad</span>${publish}</div></div>${filters}`;
}
root.innerHTML = `${top}<div class="scroll">${intro}<div class="feed">${data.posts.map(postHTML).join('')}</div><p class="end-note">Estás viendo publicaciones de ejemplo.</p></div>${nav}<div class="mock-notice" role="status" aria-live="polite" hidden></div>`;
let timer;
function notice(message){const el=root.querySelector('.mock-notice');el.textContent=message;el.hidden=false;clearTimeout(timer);timer=setTimeout(()=>el.hidden=true,4500);}
root.addEventListener('click', e => {
  const button=e.target.closest('button'); if(!button)return;
  if(button.dataset.filter){
    root.querySelectorAll('[data-filter]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
    root.querySelectorAll('.post').forEach(p=>p.hidden=button.dataset.filter!=='all'&&p.dataset.type!==button.dataset.filter);
  } else if(button.classList.contains('publish')) notice('Mockup visual. En la app, aquí abrirías el formulario para publicar.');
  else if(button.dataset.response) notice(`Publicación de ejemplo de ${button.dataset.response}. Esta vista no envía respuestas.`);
  else if(button.dataset.nav) notice(button.dataset.nav==='Muro'?'Estás en el Muro.':`Mockup del Muro. La pantalla ${button.dataset.nav} se diseñará después de elegir estilo.`);
});

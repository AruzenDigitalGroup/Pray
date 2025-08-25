import { GoogleGenAI, Type } from '@google/genai';

// ---- Helpers ----
const setEl = (id, prop, val) => { const el = document.getElementById(id); if (el) el[prop] = val; };
const digitsOnly = (str) => (str||'').replace(/\D/g,'');

// ---- Render Ministry Section ----
function renderMinistrySection(data) {
    const primordiauxList = document.getElementById('primordiaux-list'); if(primordiauxList) primordiauxList.innerHTML = data.objectifsPrimordiaux.map(item => `<li>${item}</li>`).join('');
    const secondairesList = document.getElementById('secondaires-list'); if(secondairesList) secondairesList.innerHTML = data.objectifsSecondaires.map(item => `<li>${item}</li>`).join('');
    const delivranceList = document.getElementById('delivrance-list'); if(delivranceList) delivranceList.innerHTML = data.delivrance.map(item => `<li class="space-y-2"><div class="text-4xl text-[var(--accent)]"><i class="${item.icon}"></i></div><h4 class="font-bold">${item.title}</h4><p class="text-sm text-white/70">${item.desc}</p></li>`).join('');
    const benedictionList = document.getElementById('benediction-list'); if(benedictionList) benedictionList.innerHTML = data.benediction.map(item => `<li class="space-y-3"><div class="text-5xl text-[var(--accent)]"><i class="${item.icon}"></i></div><h4 class="text-xl font-bold">${item.title}</h4><p class="text-white/80">${item.desc}</p></li>`).join('');
}

// ---- Animate Hero Title ----
function animateHeroTitle(title, accentWords = []) {
    const titleEl = document.getElementById('heroTitle'); if (!titleEl) return;
    const words = title.split(' '); titleEl.innerHTML = '';
    words.forEach((word, index) => {
        const wordWrapper = document.createElement('span'); wordWrapper.className = 'h1-word-wrapper';
        const wordSpan = document.createElement('span'); wordSpan.className = 'h1-word'; wordSpan.textContent = word;
        if (accentWords.includes(word.replace(/,/g, ''))) { wordSpan.style.color = 'var(--accent)'; }
        wordSpan.style.setProperty('--delay', `${index * 100 + 200}ms`);
        wordWrapper.appendChild(wordSpan); titleEl.appendChild(wordWrapper); titleEl.appendChild(document.createTextNode(' '));
    });
}

// ---- Update Next Service ----
function updateNextService() {
    const serviceEl = document.getElementById('serviceTimes'); if (!serviceEl) return;
    const schedule = [{ day: 2, startTime: '08:00', endTime: '11:00', text: "Mardi 08h00 — 11h00", name: "Culte d'intercession" }, { day: 3, startTime: '16:00', endTime: '19:00', text: "Mercredi 16h00 — 19h00", name: "Culte d'enseignement" }, { day: 0, startTime: '08:30', endTime: '12:00', text: "Dimanche 08h30 — 12h00", name: "Célébration" }];
    const now = new Date(new Date().toLocaleString("en-US", { timeZone: "Africa/Kinshasa" }));
    let upcomingServices = [];
    schedule.forEach(service => {
        const serviceDate = new Date(now); serviceDate.setDate(now.getDate() - now.getDay() + service.day);
        const [startHours, startMinutes] = service.startTime.split(':').map(Number); serviceDate.setHours(startHours, startMinutes, 0, 0);
        const endDate = new Date(serviceDate); const [endHours, endMinutes] = service.endTime.split(':').map(Number); endDate.setHours(endHours, endMinutes, 0, 0);
        if (now > endDate) { serviceDate.setDate(serviceDate.getDate() + 7); }
        upcomingServices.push({ ...service, date: serviceDate });
    });
    upcomingServices.sort((a, b) => a.date - b.date);
    const nextService = upcomingServices[0];
    const [endHours, endMinutes] = nextService.endTime.split(':').map(Number); const nextServiceEndDate = new Date(nextService.date); nextServiceEndDate.setHours(endHours, endMinutes, 0, 0);
    const isLive = now >= nextService.date && now < nextServiceEndDate;
    const badgeEl = document.getElementById('heroBadge');
    if (badgeEl) { badgeEl.innerHTML = isLive ? `<i class="fa-solid fa-tower-broadcast mr-2"></i> En direct : ${nextService.name}` : `<i class="fa-regular fa-clock mr-2"></i> Prochain culte : ${nextService.name}`; }
    serviceEl.textContent = nextService.text;
}

// ---- Render ----
function render(data){
  document.title = `${data.acronym || data.churchName} — Accueil`; setEl('ogImage', 'content', data.brand.ogImage); setEl('preloadHero', 'href', data.hero.image); setEl('logo', 'src', data.brand.logo); setEl('logoFoot', 'src', data.brand.logo); setEl('brandName', 'textContent', data.acronym); setEl('brandFoot', 'textContent', data.churchName);
  const heroBg = document.getElementById('heroBg'); if (heroBg) heroBg.style.backgroundImage = `url('${data.hero.image}')`; setEl('heroBadge', 'textContent', data.hero.badge); animateHeroTitle(data.hero.title, data.hero.accentWords); setEl('heroSubtitle', 'textContent', data.hero.subtitle); setEl('locationName', 'textContent', data.locationName); setEl('whatsapp', 'textContent', data.whatsapp); setEl('aboutImage', 'src', data.about.image); setEl('visionaries', 'textContent', data.about.visionaries);
  if (data.mission) renderMinistrySection(data.mission); setEl('sermonFrame', 'src', data.sermon.embedUrl); setEl('sermonDesc', 'textContent', data.sermon.desc); setEl('watchLink', 'href', data.sermon.watchUrl); setEl('listenLink', 'href', data.sermon.listenUrl); setEl('notesLink', 'href', data.sermon.notesUrl);
  const eventsScroller = document.getElementById('eventsScroller'); eventsScroller.innerHTML=''; (data.events||[]).forEach((e, i) => { const a=document.createElement('a'); a.href=e.href||'#'; a.className='group min-w-[82%] sm:min-w-0 rounded-2xl overflow-hidden border border-white/10 bg-white/5 hover:bg-white/10 transition-all duration-300 hover:-translate-y-1 block snap-start'; a.setAttribute('data-reveal',''); a.style.setProperty('--reveal-delay', `${i * 100}ms`); a.innerHTML=`<div class="aspect-[4/3] w-full bg-center bg-cover" style="background-image:url('${e.img}')" role="img" aria-label="${e.title}"></div><div class="p-4"><p class="text-sm text-white/60">${e.date}</p><h3 class="mt-1 text-lg font-semibold group-hover:text-[var(--accent)] transition-colors">${e.title}</h3></div>`; eventsScroller.appendChild(a); });
  const waDigits = digitsOnly(data.whatsapp); const waUrl = `https://wa.me/${waDigits}`; setEl('waLink', 'href', waUrl); setEl('waLink', 'textContent', data.whatsapp); setEl('emailLink', 'href', 'mailto:' + data.email); setEl('emailLink', 'textContent', data.email); setEl('addressBox', 'textContent', data.address); setEl('footerAddress', 'textContent', `${data.locationName} — ${data.address}`); setEl('year', 'textContent', new Date().getFullYear());
  if (data.socials) { setEl('facebookLink', 'href', data.socials.facebookUrl || '#'); setEl('instagramLink', 'href', data.socials.instagramUrl || '#'); setEl('youtubeLink', 'href', data.socials.youtubeUrl || '#'); }
  const schema = {"@context":"https://schema.org","@type":"Church","name":data.churchName,"url":document.location.href,"logo":data.brand.logo,"address":{"@type":"PostalAddress","streetAddress":data.address,"addressLocality":"Lemba","addressRegion":"Kinshasa","addressCountry":"CD"},"telephone":"+"+waDigits}; setEl('schemaLd', 'textContent', JSON.stringify(schema));
}

// ---- NOUVELLE GESTION DU FORMULAIRE ----
function handleContactFormSubmit(event) {
  event.preventDefault(); // Empêche le rechargement de la page

  const form = document.getElementById('contactForm');
  const submitBtn = document.getElementById('submitBtn');
  const formStatus = document.getElementById('formStatus');
  const formData = new FormData(form);

  // Validation côté client (simple)
  if (!formData.get('name') || !formData.get('phone') || !formData.get('message')) {
    formStatus.textContent = 'Veuillez remplir les champs requis.';
    formStatus.className = 'text-red-400 text-sm font-medium';
    return;
  }

  // Désactiver le bouton et afficher un message de chargement
  submitBtn.disabled = true;
  submitBtn.textContent = 'Envoi en cours...';
  formStatus.textContent = '';
  formStatus.className = 'text-sm font-medium';

  fetch('send_mail.php', {
    method: 'POST',
    body: formData
  })
  .then(response => response.json())
  .then(data => {
    if (data.status === 'success') {
      formStatus.textContent = data.message;
      formStatus.classList.add('text-green-400');
      form.reset(); // Vider le formulaire après succès
    } else {
      // Afficher le message d'erreur renvoyé par PHP
      formStatus.textContent = data.message || 'Une erreur est survenue.';
      formStatus.classList.add('text-red-400');
    }
  })
  .catch(error => {
    console.error('Erreur Fetch:', error);
    formStatus.textContent = 'Une erreur réseau est survenue. Veuillez réessayer.';
    formStatus.classList.add('text-red-400');
  })
  .finally(() => {
    // Réactiver le bouton dans tous les cas
    submitBtn.disabled = false;
    submitBtn.textContent = 'Envoyer le message';
  });
}

// ---- Verse of the day (Gemini) ----
function getApiKey(){
  if (window.GEMINI_API_KEY) return window.GEMINI_API_KEY; const meta = document.querySelector('meta[name="gemini-key"]'); if (meta && meta.getAttribute('content')) return meta.getAttribute('content'); try { return localStorage.getItem('GEMINI_API_KEY') || ''; } catch { return ''; }
}
async function getVerseOfTheDay(){
  const verseEl = document.getElementById('verseText'); const refEl = document.getElementById('verseRef'); if (!verseEl || !refEl) return; const today = new Date().toISOString().split('T')[0]; try { const cached = localStorage.getItem('verseOfTheDay'); if (cached) { const { date, verse, reference } = JSON.parse(cached); if (date === today) { verseEl.textContent = `“${verse}”`; refEl.textContent = reference; return; } } } catch { localStorage.removeItem('verseOfTheDay'); }
  const apiKey = getApiKey(); if (!apiKey) return;
  try {
    const ai = new GoogleGenAI({ apiKey }); const schema = { type: Type.OBJECT, properties: { verse: { type: Type.STRING }, reference: { type: Type.STRING } }, required: ['verse','reference'] };
    const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: "Donne-moi un verset biblique inspirant et encourageant pour la journée, en français. Le verset doit apporter de l'espoir, de la force ou de la paix.", config: { responseMimeType: 'application/json', responseSchema: schema, temperature: 0.8 } });
    const json = JSON.parse(response.text); if (json?.verse && json?.reference){ verseEl.textContent = `“${json.verse}”`; refEl.textContent = json.reference; localStorage.setItem('verseOfTheDay', JSON.stringify({ date: today, verse: json.verse, reference: json.reference })); }
  } catch (err){ console.error('Erreur Gemini:', err); }
}

// ---- UI / Animations ----
const animationManager = {
  revealObserver: null,
  init(){ this.onScroll(); this.setupReveal(); this.setupActiveNav(); this.initSmoothAnchors(); window.addEventListener('scroll', () => this.onScroll(), { passive: true }); document.getElementById('toTop')?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' })); },
  setupReveal(){ if (this.revealObserver) this.revealObserver.disconnect(); this.revealObserver = new IntersectionObserver((entries) => { entries.forEach(entry => { if (entry.isIntersecting) entry.target.classList.add('in-view'); }); }, { threshold: 0.1 }); document.querySelectorAll('[data-reveal]').forEach(el => this.revealObserver.observe(el)); },
  initSmoothAnchors(){ const headerH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--header-h')) || 64; document.querySelectorAll('a[href^="#"]').forEach(a => { const href = a.getAttribute('href'); if (!href || href === '#') return; a.addEventListener('click', (e) => { const target = document.querySelector(href); if (!target) return; e.preventDefault(); const y = target.getBoundingClientRect().top + window.pageYOffset - headerH - 12; window.scrollTo({ top: y, behavior: 'smooth' }); }); }); },
  onScroll(){ const h = document.documentElement; if (h.scrollHeight <= h.clientHeight) return; const scrolled = h.scrollTop / (h.scrollHeight - h.clientHeight); const progressBar = document.querySelector('.progress'); if (progressBar) progressBar.style.transform = `scaleX(${Math.max(0, Math.min(1, scrolled))})`; const toTop = document.getElementById('toTop'); if (toTop) toTop.classList.toggle('hidden', h.scrollTop < 420); },
  setupActiveNav(){ const links = Array.from(document.querySelectorAll('#mainNav a[href^="#"]')); const sections = links.map(a => document.querySelector(a.getAttribute('href'))).filter(Boolean); if (sections.length === 0) return; const io = new IntersectionObserver((entries) => { entries.forEach(entry => { const id = '#' + entry.target.id; links.forEach(link => { if (link.getAttribute('href') === id) { link.classList.toggle('nav-active', entry.isIntersecting); if (entry.isIntersecting) link.setAttribute('aria-current', 'page'); else link.removeAttribute('aria-current'); } }); }); }, { rootMargin: '-40% 0px -50% 0px', threshold: 0.01 }); sections.forEach(sec => io.observe(sec)); }
};

// ---- Mobile menu ----
document.getElementById('menuBtn')?.addEventListener('click', ()=>{ const mobileNav = document.getElementById('mobileNav'); const isOpen = !mobileNav.classList.contains('hidden'); mobileNav.classList.toggle('hidden'); document.getElementById('menuBtn').setAttribute('aria-expanded', String(!isOpen)); });
document.querySelectorAll('#mobileNav a').forEach(a=>a.addEventListener('click', ()=>{ document.getElementById('mobileNav').classList.add('hidden'); document.getElementById('menuBtn').setAttribute('aria-expanded','false'); }));

// ---- App init ----
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch('site.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const siteData = await response.json();

        render(siteData);
        updateNextService();
        getVerseOfTheDay();
        animationManager.init();

        document.getElementById('contactForm')?.addEventListener('submit', handleContactFormSubmit);

    } catch (error) {
        console.error("Could not load site data:", error);
        document.body.innerHTML = '<div style="color: white; text-align: center; padding-top: 50px;">Erreur de chargement du site. Veuillez réessayer plus tard.</div>';
    }
});

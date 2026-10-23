(() => {
  const aboutPortrait = document.querySelector('#men-haqimda img');
  if (aboutPortrait) aboutPortrait.src = '/assets/bexruzbek-about-v2.png';

  const brandMark = document.querySelector('.brand-star');
  if (brandMark) {
    brandMark.innerHTML = '<img src="/assets/penguin.svg" alt="">';
    brandMark.setAttribute('aria-hidden', 'true');
  }

  const cover = document.querySelector('.diplom-cover');
  if (cover) {
    const still = cover.querySelector('.diplom-still');
    if (still) still.hidden = true;
    cover.insertAdjacentHTML('afterbegin', `
    <span class="diplom-grid" aria-hidden="true"></span>
    <span class="diplom-sun" aria-hidden="true">✳︎</span>
    <span class="diplom-paper" aria-hidden="true"><small>YANGI HIKOYA</small><strong>DIPLOM<br>O‘ZI NIMAGA<br>KERAK?</strong><i>?</i></span>
    <span class="diplom-preview" aria-hidden="true"><small>00:18 / HIKOYA</small><strong>DIPLOM<br>HAQIDA</strong><span class="diplom-orbit"></span><i>▶</i><em>QISQA VIDEO</em></span>
  `);
  }

  const onamCover = document.querySelector('.onam-cover');
  if (onamCover) onamCover.insertAdjacentHTML('afterbegin', '<span class="onam-note" aria-hidden="true"><small>3D HIKOYA</small><strong>QACHON<br>TO‘Y ENDI?</strong><em>SUHBAT · KULGI · MOTION</em></span>');

  const workSteps = [
    ['G‘oya', 'Suhbatdan hikoya'],
    ['Sahna', '3D vaziyat va personaj'],
    ['Montaj', 'Ritm, ovoz va yakun']
  ];
  document.querySelectorAll('.work-card').forEach((card, index) => {
    if (card.querySelector('.work-timeline')) return;
    const labels = index === 1 ? [['G‘oya', 'Bir tunlik bosim'], ['Sahna', 'Imtihon oldi'], ['Montaj', 'Ritm va urg‘u']] : index === 2 ? [['G‘oya', 'Savoldan boshlash'], ['Sahna', 'Diplom haqidagi hikoya'], ['Montaj', 'Ovozli yakun']] : workSteps;
    card.querySelector('p')?.insertAdjacentHTML('afterend', `<ol class="work-timeline" aria-label="Videoning tayyorlanish jarayoni">${labels.map((step, stepIndex) => `<li><span>${String(stepIndex + 1).padStart(2, '0')}</span><b>${step[0]}</b><small>${step[1]}</small></li>`).join('')}</ol>`);
  });

  const videoService = document.querySelector('[data-service="video"]');
  if (videoService) {
    videoService.classList.add('video-service-rich');
    const demo = videoService.querySelector('.video-demo');
    if (demo) demo.insertAdjacentHTML('beforeend', '<span class="story-card story-card-one">SAHNA<br>01</span><span class="story-card story-card-two">HARAKAT<br>02</span><span class="story-orbit"></span>');
  }

  const contactLinks = document.querySelector('.contact-links');
  if (contactLinks && !contactLinks.querySelector('.github')) contactLinks.insertAdjacentHTML('beforeend', '<a class="button outline github" href="https://github.com/kuchkarboevbexruzbek" target="_blank" rel="noopener noreferrer">GitHub · kuchkarboevbexruzbek <span>↗︎</span></a>');
})();

// Purposeful local enhancements: comparisons, proof of work and accessible micro-interactions.
(() => {
  const icon = (name) => name === 'arrow' ? '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 19 19 5M8 5h11v11"/></svg>' : '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m9 5 10 7-10 7z"/></svg>';
  const intro = document.querySelector('#tanishuv');
  if (false && intro && !document.querySelector('.motion-compare')) intro.insertAdjacentHTML('afterend', `
    <section class="motion-compare section wrap reveal" aria-labelledby="compare-title">
      <div class="section-head"><div><div class="eyebrow dark">KO‘RINISH VA HIS</div><h2 id="compare-title">ODDIYDAN<br><span>HARAKATGA.</span></h2></div><p>Bir xil g‘oya. Harakat bilan unga kayfiyat, urg‘u va yo‘nalish qo‘shiladi.</p></div>
      <div class="motion-lab"><div class="lab-copy"><span class="scribble plain">Bitta g‘oya, uch xil kayfiyat.</span><h3>HARAKATNI<br><em>TANLANG.</em></h3><p>Har bir harakat tomoshabinning nigohini kerakli joyga olib boradi.</p><div class="compare-tabs" role="tablist" aria-label="Harakat uslubi"><button role="tab" aria-selected="true" aria-controls="compare-demo" data-lab="type">Yozuv</button><button role="tab" aria-selected="false" aria-controls="compare-demo" data-lab="scene">Sahna</button><button role="tab" aria-selected="false" aria-controls="compare-demo" data-lab="flow">Yo‘nalish</button></div></div><div class="compare-demo lab-type" id="compare-demo" role="tabpanel" aria-live="polite"><span class="compare-kicker">MOTION LAB / 01</span><strong>G‘OYA<br><em>HARAKATDA.</em></strong><span class="compare-line"></span><span class="compare-card">YANGI SAHNA</span><span class="compare-cursor">${icon('arrow')}</span><p class="lab-caption">Yozuv bosqichma-bosqich paydo bo‘lib, asosiy fikrga urg‘u beradi.</p></div></div>
    </section>`);

  const cover = document.querySelector('.diplom-cover');
  if (cover) {
    cover.querySelector('.diplom-still')?.remove();
    cover.querySelector('.cover-bottom')?.remove();
    const preview = cover.querySelector('.diplom-preview');
    if (preview) preview.innerHTML = `<small>HIKOYA / 03</small><strong>DIPLOM<br>HAQIDA</strong><span class="diplom-sheet"><b></b><b></b><b></b><b></b></span><i>${icon('play')}</i><em>QISQA VIDEO</em>`;
  }
  const videoService = document.querySelector('[data-service="video"]');
  if (videoService) {
    const demo = videoService.querySelector('.video-demo');
    if (demo) demo.innerHTML = `<div class="story-scene" aria-hidden="true"><span class="scene-moon"></span><span class="scene-house"></span><span class="scene-person"></span><span class="scene-wave"><i></i><i></i><i></i></span></div><div class="story-stages" aria-hidden="true"><span>01<br><b>SAHNA</b></span><span>02<br><b>HARAKAT</b></span><span>03<br><b>OVOZ</b></span></div>`;
  }
  const services = document.querySelector('#yonalishlar');
  if (false && services && !document.querySelector('.proofs')) services.insertAdjacentHTML('afterend', `
    <section class="proofs section wrap" id="tajribalar"><div class="section-head reveal"><div><div class="eyebrow dark">INTERAKTIV TAJRIBA</div><h2>G‘OYANI<br><span>USHLA.</span></h2></div><p>Yulduzchalarni ushlang. Har bir topilgan g‘oya sahnani jonlantiradi.</p></div><article class="proof-card experiment reveal"><div class="idea-game" aria-label="Yulduzchani bosib ushlash o‘yini"><span class="game-orbit" aria-hidden="true"></span><button class="game-star" aria-label="G‘oyani ushlash">✦</button><span class="game-score" aria-live="polite">0 / 6</span><span class="game-message">BOSIB USHLANG</span></div><div><span class="service-index">SHAXSIY MINI-GAME</span><h3>G‘oya ushla</h3><p>Yulduzcha har safar boshqa joyda paydo bo‘ladi. Uni 6 marta ushlasangiz, sahna yakuniy holatga keladi.</p><div class="lab-controls"><button class="lab-reset">Qayta boshlash</button><span class="game-status">Boshlashga tayyor.</span></div></div></article></section>`);
  document.querySelectorAll('.motion-compare.reveal,.proofs .reveal').forEach(el => el.classList.add('visible'));
  const process = document.querySelector('.process .steps');
  if (process && !process.querySelector('.steps-line')) process.insertAdjacentHTML('afterbegin', '<svg class="steps-line" viewBox="0 0 1000 120" aria-hidden="true"><path d="M70 55C235 5 315 104 500 55S770 5 940 55"/></svg>');
  const compare = document.querySelector('.motion-compare');
  if (compare) { const buttons = [...compare.querySelectorAll('[role="tab"]')], demo = compare.querySelector('.compare-demo'); const setMode = b => { buttons.forEach(x => x.setAttribute('aria-selected', x === b)); demo.className = `compare-demo lab-${b.dataset.lab} is-moving`; }; buttons.forEach((b, i) => { b.addEventListener('click', () => setMode(b)); b.addEventListener('keydown', e => { if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { e.preventDefault(); const next = buttons[(i + (e.key === 'ArrowRight' ? 1 : buttons.length - 1)) % buttons.length]; next.focus(); setMode(next); }}); }); }
  const game = document.querySelector('.idea-game');
  if (game) { const star = game.querySelector('.game-star'), score = game.querySelector('.game-score'), status = game.closest('.experiment').querySelector('.game-status'), reset = game.closest('.experiment').querySelector('.lab-reset'); let points = 0; const move = () => { star.style.left = `${12 + Math.random() * 70}%`; star.style.top = `${12 + Math.random() * 68}%`; }; const restart = () => { points = 0; score.textContent = '0 / 6'; status.textContent = 'Boshlashga tayyor.'; star.hidden = false; game.classList.remove('game-won'); move(); }; star.addEventListener('click', () => { points += 1; score.textContent = `${points} / 6`; if (points >= 6) { game.classList.add('game-won'); status.textContent = 'Zo‘r! Sahnani jonlantirdingiz.'; star.hidden = true; } else { status.textContent = 'Yana bittasi!'; move(); }}); reset.addEventListener('click', restart); move(); }
  const processSection = document.querySelector('.process');
  if (processSection) new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) processSection.classList.add('steps-active'); }), { threshold: .25 }).observe(processSection);
  const portrait = document.querySelector('.about-photo');
  if (portrait && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    portrait.addEventListener('pointermove', event => {
      if (event.pointerType === 'touch') return;
      const box = portrait.getBoundingClientRect();
      portrait.style.setProperty('--tilt-x', `${((event.clientY - box.top) / box.height - .5) * -4}deg`);
      portrait.style.setProperty('--tilt-y', `${((event.clientX - box.left) / box.width - .5) * 5}deg`);
    });
    portrait.addEventListener('pointerleave', () => { portrait.style.setProperty('--tilt-x', '0deg'); portrait.style.setProperty('--tilt-y', '0deg'); });
  }
  const telegram = document.querySelector('.contact-links .button.cream');
  if (telegram && !telegram.querySelector('.telegram-plane')) telegram.insertAdjacentHTML('beforeend', '<span class="telegram-plane" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="m3 11 18-8-7 18-3-7zM11 14l4-4"/></svg></span>');
  const instagram = document.querySelector('.contact .instagram');
  if (instagram && !instagram.querySelector('img')) instagram.insertAdjacentHTML('afterbegin', '<img src="/assets/bexruzbek-about-v2.png" alt="" width="30" height="30">');
})();

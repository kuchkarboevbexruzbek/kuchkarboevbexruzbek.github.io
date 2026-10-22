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

  const videoService = document.querySelector('[data-service="video"]');
  if (videoService) {
    videoService.classList.add('video-service-rich');
    const demo = videoService.querySelector('.video-demo');
    if (demo) demo.insertAdjacentHTML('beforeend', '<span class="story-card story-card-one">SAHNA<br>01</span><span class="story-card story-card-two">HARAKAT<br>02</span><span class="story-orbit"></span>');
  }

  const contactLinks = document.querySelector('.contact-links');
  if (contactLinks && !contactLinks.querySelector('.github')) contactLinks.insertAdjacentHTML('beforeend', '<a class="button outline github" href="https://github.com/kuchkarboevbexruzbek" target="_blank" rel="noopener noreferrer">GitHub · kuchkarboevbexruzbek <span>↗︎</span></a>');
})();

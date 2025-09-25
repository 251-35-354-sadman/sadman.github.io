// ...existing code...
(function(){
  const $ = s => document.querySelector(s);
  const $$ = s => Array.from(document.querySelectorAll(s));

  // --- nav follower preview ---
  const follower = document.getElementById('navFollower');
  const toggleBtn = document.getElementById('navFollowerBtn');
  const navLinks = $$('.left-nav a, .side-nav a'); // support both nav variants
  let followerEnabled = true;

  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      followerEnabled = !followerEnabled;
      toggleBtn.setAttribute('aria-pressed', String(followerEnabled));
      // update appearance
      if (followerEnabled) {
        toggleBtn.classList.add('active');
        toggleBtn.textContent = '🔎 Preview on hover';
      } else {
        toggleBtn.classList.remove('active');
        toggleBtn.textContent = '🚫 Preview off';
        // hide follower immediately
        follower.classList.remove('show');
      }
    });
  }

  if (follower && navLinks.length) {
    navLinks.forEach(link => {
      // mouse interactions
      link.addEventListener('mouseenter', (e) => {
        if (!followerEnabled) return;
        const text = link.textContent.trim();
        follower.textContent = text;
        follower.classList.add('show');
      });
      link.addEventListener('mousemove', (e) => {
        if (!followerEnabled) return;
        // slight offset so it doesn't cover cursor
        const x = e.clientX + 18;
        const y = e.clientY + 6;
        follower.style.left = x + 'px';
        follower.style.top = y + 'px';
      });
      link.addEventListener('mouseleave', () => {
        follower.classList.remove('show');
      });

      // keyboard focus support
      link.addEventListener('focus', (e) => {
        if (!followerEnabled) return;
        const rect = link.getBoundingClientRect();
        follower.textContent = link.textContent.trim();
        follower.style.left = (rect.left + rect.width / 2) + 'px';
        follower.style.top = (rect.top - 8) + 'px';
        follower.classList.add('show');
      });
      link.addEventListener('blur', () => follower.classList.remove('show'));

      // touch support: show follower near touch point briefly
      link.addEventListener('touchstart', (e) => {
        if (!followerEnabled) return;
        const touch = e.touches[0];
        follower.textContent = link.textContent.trim();
        follower.style.left = (touch.clientX + 12) + 'px';
        follower.style.top = (touch.clientY + 6) + 'px';
        follower.classList.add('show');
      }, { passive: true });
      link.addEventListener('touchend', () => follower.classList.remove('show'));
    });
  }

  // accessibility: hide follower on ESC
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && follower) follower.classList.remove('show');
  });

  // ensure toggle button can also be toggled with keyboard (Enter/Space)
  if (toggleBtn) {
    toggleBtn.addEventListener('keydown', (e) => {
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        toggleBtn.click();
      }
    });
  }

  // year
  const yearEl = $('#year'); if (yearEl) yearEl.textContent = new Date().getFullYear();

  // form guard
  const form = $('#contactForm'), status = $('#formStatus');
  if (form && status){
    form.addEventListener('submit', e=>{
      e.preventDefault();
      status.textContent = 'Sending...';
      setTimeout(()=>{ status.textContent = 'Message sent. Thank you!'; form.reset(); }, 800);
    });
  }

  // tilt on project cards
  $$('.project').forEach(card=>{
    const inner = document.createElement('div');
    inner.className = 'inner';
    while (card.firstChild) inner.appendChild(card.firstChild);
    card.appendChild(inner);

    card.addEventListener('mousemove', (e)=>{
      const rect = card.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width;
      const py = (e.clientY - rect.top) / rect.height;
      const rx = (py - 0.5) * 10; // rotateX
      const ry = (px - 0.5) * -12; // rotateY
      inner.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg) translateZ(8px)`;
    });
    card.addEventListener('mouseleave', ()=> inner.style.transform = 'none');
  });

  // CTA behavior: scroll to contact and focus form
  const cta = document.querySelector('.cta-unique');
  const contactSection = document.getElementById('contact');
  if (cta && contactSection){
    cta.addEventListener('click', () => {
      // small pulse feedback
      cta.classList.add('pulse');
      setTimeout(()=> cta.classList.remove('pulse'), 900);

      // smooth scroll to contact and focus name input if present
      contactSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setTimeout(()=> {
        const nameInput = contactSection.querySelector('input[name="name"]');
        if (nameInput) nameInput.focus();
      }, 520);
    });
  }

  // contact-email behavior: copy address, autofill form email and focus message
  (function(){
    const contactLink = document.querySelector('.contact-email');
    const primaryEmail = 'sadmansiam260@gmail.com';
    if (!contactLink) return;
    contactLink.addEventListener('click', async (ev) => {
      ev.preventDefault();
      // try to copy to clipboard
      try{
        if (navigator.clipboard && navigator.clipboard.writeText){
          await navigator.clipboard.writeText(primaryEmail);
        } else {
          const tmp = document.createElement('input'); tmp.value = primaryEmail; document.body.appendChild(tmp); tmp.select(); document.execCommand('copy'); tmp.remove();
        }
      }catch(e){
        // fallback: open mail client
        window.location.href = 'mailto:' + primaryEmail; return;
      }

      // scroll to contact form and autofill
      const formEl = document.getElementById('contactForm');
      const contactSec = document.getElementById('contact');
      if (contactSec) contactSec.scrollIntoView({ behavior: 'smooth', block: 'start' });
      if (formEl){
        const emailInput = formEl.querySelector('input[name="email"]');
        if (emailInput) emailInput.value = primaryEmail;
        setTimeout(()=>{
          const msg = formEl.querySelector('textarea[name="message"]');
          if (msg) msg.focus();
          const status = document.getElementById('formStatus');
          if (status){ status.textContent = 'Email copied & auto-filled. You can write your message.'; setTimeout(()=> status.textContent = '', 3000); }
        }, 520);
      }
    });
  })();

  // keep existing reveal/skill fill logic (if present) — basic safe guard
  const revealTargets = $$('[data-animate]');
  const observer = new IntersectionObserver((entries)=>{
    entries.forEach(entry=>{
      if (entry.isIntersecting){
        entry.target.classList.add('in-view');
        // animate skills inside this panel
        entry.target.querySelectorAll && entry.target.querySelectorAll('.skill').forEach(s=>{
          const level = s.dataset.level || '60';
          const fill = s.querySelector('.fill');
          if (fill) fill.style.width = `${Math.min(Math.max(Number(level)||60,0),100)}%`;
        });
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.16 });

  revealTargets.forEach(t => observer.observe(t));

  // resume button: check file then trigger download or open; fallback message
  const resumeBtn = document.getElementById('resumeBtn');
  const resumeStatus = document.getElementById('resumeStatus');

  if (resumeBtn) {
    resumeBtn.addEventListener('click', async function (e) {
      // let anchor fallback behavior if user agent handles download; we intercept to verify
      e.preventDefault();
      const href = resumeBtn.getAttribute('href') || 'assets/resume.pdf';
      // show loading message
      if (resumeStatus) { resumeStatus.style.display = 'block'; resumeStatus.textContent = 'Checking resume...'; }
      // Helpful small helper to trigger anchor fallback
      const triggerAnchor = () => {
        const a = document.createElement('a');
        a.href = href;
        if (resumeBtn.hasAttribute('download')) a.setAttribute('download', '');
        a.target = '_blank';
        document.body.appendChild(a);
        a.click();
        a.remove();
      };

      try {
        // If running from file:// some browsers block fetch; guard that
        const isLocal = location.protocol === 'file:';
        if (!isLocal) {
          // try a HEAD first (works when served over http)
          const res = await fetch(href, { method: 'HEAD' });
          if (res.ok) {
            triggerAnchor();
            if (resumeStatus) { resumeStatus.textContent = 'Resume opened.'; setTimeout(()=> resumeStatus.style.display='none', 2200); }
            return;
          } else {
            throw new Error('Not found');
          }
        } else {
          // on local file serve: try to open directly — many dev setups will handle this
          try {
            triggerAnchor();
            if (resumeStatus) { resumeStatus.textContent = 'Attempting to open resume (local file).'; setTimeout(()=> resumeStatus.style.display='none', 2200); }
            return;
          } catch (errLocal) {
            throw errLocal;
          }
        }
      } catch (err) {
        // fallback: try open in new tab (may work), else show message
        try {
          window.open(href, '_blank');
          if (resumeStatus) { resumeStatus.textContent = 'Opened in new tab (fallback).'; setTimeout(()=> resumeStatus.style.display='none', 2200); }
        } catch (err2) {
          if (resumeStatus) { resumeStatus.textContent = 'Resume not found. Please place assets/resume.pdf in project folder.'; }
          console.warn('Resume fetch failed:', err, err2);
        }
      }
    });
  }

  // avatar: show fallback if image fails to load
  (function handleAvatar(){
    const wrap = document.querySelector('.avatar-wrap');
    const img = wrap && wrap.querySelector('.avatar-img');
    if (!wrap || !img) return;
    // if image already complete and naturalWidth present, mark as loaded
    const markLoaded = () => { wrap.classList.add('has-image'); };
    const markError = () => { wrap.classList.remove('has-image'); };
    if (img.complete && img.naturalWidth > 0) markLoaded();
    img.addEventListener('load', markLoaded);
    img.addEventListener('error', markError);
    // also try to check existence via fetch when served over http
    try {
      if (location.protocol !== 'file:') {
        fetch(img.src, { method: 'HEAD' }).then(res => { if (res.ok) markLoaded(); else markError(); }).catch(()=>{});
      }
    } catch (e){}
  })();
})();
console.info('Enhanced UI loaded');
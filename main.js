document.addEventListener('DOMContentLoaded', () => {
  // Año dinámico
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Toggle menú móvil
  const navToggle = document.querySelector('.nav-toggle');
  const menu = document.getElementById('menu');
  if (navToggle && menu) {
    navToggle.addEventListener('click', () => {
      const open = menu.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', String(open));
    });
  }

  // Smooth scroll accesible
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const targetId = link.getAttribute('href');
      if (!targetId || targetId === '#') return;
      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({behavior:'smooth', block:'start'});
        // Cerrar menú en móvil
        if (menu && menu.classList.contains('open')) {
          menu.classList.remove('open');
          navToggle.setAttribute('aria-expanded', 'false');
        }
      }
    });
  });

  // Formulario de contacto (validación simple)
  const form = document.querySelector('.contact-form');
  const status = document.querySelector('.form-status');
  if (form && status) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const data = new FormData(form);
      const nombre = (data.get('nombre')||'').toString().trim();
      const email = (data.get('email')||'').toString().trim();
      const mensaje = (data.get('mensaje')||'').toString().trim();

      if (!nombre || !email || !mensaje) {
        status.textContent = 'Completá todos los campos.';
        status.style.color = '#FFB703';
        return;
      }
      // Aquí podrías integrar EmailJS o un backend. Por ahora mostramos OK.
      status.textContent = '¡Gracias! Tu mensaje fue registrado.';
      status.style.color = '#8BE9A1';
      form.reset();
    });
  }

  // ---- Render dinámico de candidatos con fallback offline ----
  const grid = document.getElementById('equipo-grid');
  const renderCandidatos = (candidatos) => {
    if (!grid) return;
    if (!Array.isArray(candidatos) || candidatos.length === 0) {
      grid.innerHTML = '<p class="small">Aún no hay candidatos cargados.</p>';
      return;
    }
    const frag = document.createDocumentFragment();
    candidatos.forEach(c => {
      const card = document.createElement('article');
      card.className = 'person';

      const img = document.createElement('img');
      img.alt = c.nombre ? `Foto de ${c.nombre}` : 'Foto de candidato';
      img.src = c.foto || 'scripts/assets/candidatos/placeholder.jpg';
      img.loading = 'lazy';
      img.referrerPolicy = 'no-referrer';
      img.onerror = () => { img.onerror = null; img.src = 'scripts/assets/candidatos/placeholder.jpg'; };

      const h3 = document.createElement('h3');
      h3.textContent = c.nombre || 'Sin nombre';

      const p = document.createElement('p');
      p.textContent = c.rol || '';

      card.appendChild(img);
      card.appendChild(h3);
      card.appendChild(p);

      if (c.redes && (c.redes.instagram || c.redes.facebook)) {
        const socials = document.createElement('p');
        socials.className = 'small';
        const links = [];
        if (c.redes.instagram) links.push(`<a href="${c.redes.instagram}" target="_blank" rel="noopener">Instagram</a>`);
        if (c.redes.facebook) links.push(`<a href="${c.redes.facebook}" target="_blank" rel="noopener">Facebook</a>`);
        socials.innerHTML = links.join(' · ');
        card.appendChild(socials);
      }

      frag.appendChild(card);
    });
    grid.innerHTML = '';
    grid.appendChild(frag);
  };

  if (grid) {
    grid.innerHTML = '<p class="small">Cargando candidatos…</p>';

    const tryInline = () => {
      try {
        const inline = document.getElementById('candidatos-data');
        if (inline && inline.textContent.trim()) {
          const data = JSON.parse(inline.textContent);
          renderCandidatos(data);
          return true;
        }
      } catch (e) {
        console.warn('No se pudo leer candidatos inline:', e);
      }
      return false;
    };

    // Si estamos en file:// es probable que el fetch falle por CORS; usar inline
    if (location.protocol === 'file:') {
      if (!tryInline()) {
        grid.innerHTML = '<p class="small">Abrí el sitio con un servidor local para cargar candidatos (por ejemplo: py -m http.server 8080).</p>';
      }
    } else {
      fetch('scripts/candidatos.json', {cache: 'no-store'})
        .then(r => {
          if (!r.ok) throw new Error('No se pudo cargar candidatos.json');
          return r.json();
        })
        .then(renderCandidatos)
        .catch(err => {
          console.error(err);
          if (!tryInline()) {
            grid.innerHTML = '<p class="small">No se pudo cargar la lista de candidatos. Verificá scripts/candidatos.json o recargá la página.</p>';
          }
        });
    }
  }
});

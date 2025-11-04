// bonos.js
(async function () {
  const listEl = document.getElementById('list');
  const emptyEl = document.getElementById('empty');
  const selCurrency = document.getElementById('filterCurrency');
  const selTime = document.getElementById('filterTime');
  const selType = document.getElementById('filterType');
  const btnReset = document.getElementById('btnReset');

  let data = [];

  function tag(text, color) {
    return `<span class="inline-block text-xs px-2 py-1 rounded bg-${color}-100 text-${color}-800">${text}</span>`;
  }

  function render(items) {
    listEl.innerHTML = '';
    if (!items.length) {
      emptyEl.classList.remove('hidden');
      return;
    }
    emptyEl.classList.add('hidden');

    const frag = document.createDocumentFragment();

    items.forEach((x) => {
      const div = document.createElement('div');
      div.className = 'bg-white rounded-lg shadow p-4';
      div.innerHTML = `
        <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h3 class="font-semibold text-lg">${x.platform}</h3>
            <p class="text-sm text-gray-700">${x.reward}</p>
            <p class="text-xs text-gray-500 mt-1">Región: ${x.region} · Sin depósito: ${x.noDeposit ? 'Sí' : 'No'}</p>
            <div class="mt-2 flex flex-wrap gap-2">
              ${tag(x.currency, 'blue')}
              ${tag(x.type, 'purple')}
              ${tag(x.time, 'green')}
              ${tag(x.risk, x.risk === 'bajo' ? 'emerald' : x.risk === 'medio' ? 'amber' : 'red')}
            </div>
            ${x.notes ? `<p class="text-xs text-gray-600 mt-2">${x.notes}</p>` : ''}
          </div>
          <div class="shrink-0">
            <a href="${x.url}" target="_blank" rel="noopener noreferrer" class="inline-block bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded">Ir a la oferta</a>
          </div>
        </div>
      `;
      frag.appendChild(div);
    });

    listEl.appendChild(frag);
  }

  function applyFilters() {
    const cur = selCurrency.value;
    const t = selTime.value;
    const tp = selType.value;

    const filtered = data.filter((x) => {
      if (cur && x.currency !== cur) return false;
      if (t && x.time !== t) return false;
      if (tp && x.type !== tp) return false;
      if (!x.noDeposit) return false; // garantizar sin depósito
      return true;
    });

    render(filtered);
  }

  try {
    const res = await fetch('./data/bonos.json', { cache: 'no-store' });
    data = await res.json();
  } catch (e) {
    console.error('Error cargando bonos.json', e);
    data = [];
  }

  // Orden inicial: más rápidos primero (inmediato, luego <=72h)
  const orderKey = { 'inmediato': 0, '<=72h': 1, '>72h': 2 };
  data.sort((a, b) => (orderKey[a.time] ?? 99) - (orderKey[b.time] ?? 99));

  render(data.filter(x => x.noDeposit));

  selCurrency.addEventListener('change', applyFilters);
  selTime.addEventListener('change', applyFilters);
  selType.addEventListener('change', applyFilters);
  btnReset.addEventListener('click', () => {
    selCurrency.value = '';
    selTime.value = '';
    selType.value = '';
    render(data.filter(x => x.noDeposit));
  });
})();

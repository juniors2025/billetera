// wallet.js - MVP sin persistencia (clave en memoria). Próximo paso: cifrado WebCrypto.
(() => {
  const $ = (id) => document.getElementById(id);

  const nets = {
    sepolia: {
      name: 'Sepolia',
      rpc: 'https://rpc.sepolia.org',
      symbol: 'ETH'
    },
    polygon: {
      name: 'Polygon',
      rpc: 'https://polygon-rpc.com',
      symbol: 'MATIC'
    },
    ethereum: {
      name: 'Ethereum',
      rpc: 'https://cloudflare-eth.com',
      symbol: 'ETH'
    },
    bsc: {
      name: 'BSC',
      rpc: 'https://bsc-dataseed.binance.org',
      symbol: 'BNB'
    }

  // QR recibir
  function renderQR() {
    const qrEl = document.getElementById('qr');
    if (!qrEl) return;
    qrEl.innerHTML = '';
    if (!wallet) return;
    try {
      // global QRCode from qrcodejs
      // eslint-disable-next-line no-undef
      new QRCode(qrEl, { text: wallet.address, width: 144, height: 144 });
    } catch (e) { console.error(e); }
  }

  // Tokens (ERC-20) en Polygon
  async function loadTokens() {
    const listEl = document.getElementById('tokensList');
    if (!listEl) return;
    listEl.innerHTML = '';
    if (!$('net') || $('net').value !== 'polygon') {
      listEl.textContent = 'Tokens disponibles en la pestaña Polygon.';
      return;
    }
    if (!wallet) { listEl.textContent = 'Desbloqueá/importá una cuenta.'; return; }
    try {
      const abi = [
        'function balanceOf(address) view returns (uint256)',
        'function decimals() view returns (uint8)',
        'function symbol() view returns (string)'
      ];
      for (const [sym, addr] of Object.entries(polygonTokens)) {
        const c = new ethers.Contract(addr, abi, provider);
        const [dec, symbol, bal] = await Promise.all([
          c.decimals(), c.symbol(), c.balanceOf(wallet.address)
        ]);
        const human = Number(ethers.formatUnits(bal, dec));
        const row = document.createElement('div');
        row.className = 'py-2 flex justify-between text-sm';
        row.innerHTML = `<span>${symbol} (${sym})</span><span>${human}</span>`;
        listEl.appendChild(row);
      }
    } catch (e) {
      listEl.textContent = 'Error al cargar tokens.';
      console.error(e);
    }
  }
  };

  let wallet = null; // ethers.Wallet en memoria
  let provider = null;
  const polygonTokens = {
    USDC: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
    USDT: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
    WETH: '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619'
  };
  let lastQuote = null;

  // Tabs simples
  const tabBtns = document.querySelectorAll('.tab-btn');
  const panels = {
    cuenta: document.getElementById('panel-cuenta'),
    enviar: document.getElementById('panel-enviar'),
    recibir: document.getElementById('panel-recebir'),
    tokens: document.getElementById('panel-tokens'),
    trading: document.getElementById('panel-trading'),
    bonos: document.getElementById('panel-bonos'),
  };
  tabBtns.forEach(btn => btn.addEventListener('click', () => {
    const target = btn.getAttribute('data-tab');
    Object.values(panels).forEach(p => p && p.classList.add('hidden'));
    panels[target] && panels[target].classList.remove('hidden');
    tabBtns.forEach(b => b.classList.remove('bg-black','text-white'));
    btn.classList.add('bg-black','text-white');
    if (target === 'recibir') renderQR();
    if (target === 'tokens') loadTokens();
  }));

  function setProvider() {
    const id = $('net').value;
    const rpc = nets[id].rpc;
    provider = new ethers.JsonRpcProvider(rpc);
    if (wallet) wallet = wallet.connect(provider);
  }

  async function refreshBalance() {
    try {
      if (!wallet) { $('bal').textContent = '—'; return; }
      const bal = await provider.getBalance(wallet.address);
      const id = $('net').value;
      $('bal').textContent = `${ethers.formatEther(bal)} ${nets[id].symbol}`;
    } catch (e) {
      $('bal').textContent = 'Error al obtener balance';
      console.error(e);
    }
  }

  function showAddress() {
    $('addr').textContent = wallet ? wallet.address : '—';
    const recv = document.getElementById('addrRecv');
    if (recv) recv.textContent = wallet ? wallet.address : '—';
    renderQR();
  }

  $('btnCreate').addEventListener('click', async () => {
    try {
      setProvider();
      const w = ethers.Wallet.createRandom();
      wallet = w.connect(provider);
      showAddress();
      await refreshBalance();
      alert(`Guardá tu frase semilla en un lugar seguro.\n\n${w.mnemonic?.phrase || '(sin mnemónico)'}`);
    } catch (e) {
      alert('No se pudo crear la billetera');
      console.error(e);
    }
  });

  let importMode = false;
  $('btnImport').addEventListener('click', async () => {
    try {
      if (!importMode) {
        importMode = true;
        $('seedIn').classList.remove('hidden');
        $('seedIn').focus();
        $('btnImport').textContent = 'Importar ahora';
        return;
      }
      const phrase = ($('seedIn').value || '').trim();
      if (!phrase) { alert('Pegá tu frase semilla (12/24 palabras)'); return; }
      setProvider();
      const w = ethers.Wallet.fromPhrase(phrase);
      wallet = w.connect(provider);
      showAddress();
      await refreshBalance();
      $('btnImport').textContent = 'Importar seed';
      $('seedIn').classList.add('hidden');
      importMode = false;
    } catch (e) {
      alert('Semilla inválida o error al importar');
      console.error(e);
    }
  });

  $('btnShowPriv').addEventListener('click', () => {
    if (!wallet) return alert('Primero crea o importa una cuenta');
    alert(`Clave privada (NO la compartas):\n\n${wallet.privateKey}`);
  });

  const btnCopy = document.getElementById('btnCopyAddr');
  if (btnCopy) {
    btnCopy.addEventListener('click', async () => {
      try {
        if (!wallet) return;
        await navigator.clipboard.writeText(wallet.address);
        btnCopy.textContent = 'Copiado';
        setTimeout(()=> btnCopy.textContent = 'Copiar', 1200);
      } catch (_) {}
    });
  }

  $('btnLock').addEventListener('click', () => {
    wallet = null;
    showAddress();
    $('bal').textContent = '—';
  });

  $('net').addEventListener('change', async () => {
    setProvider();
    if (wallet) await refreshBalance();
  });

  $('btnRefresh').addEventListener('click', refreshBalance);

  $('btnSend').addEventListener('click', async () => {
    try {
      if (!wallet) return alert('Desbloqueá/importá una cuenta primero');
      const to = ($('to').value || '').trim();
      const amount = ($('amount').value || '').trim();
      if (!to || !ethers.isAddress(to)) return alert('Dirección destinataria inválida');
      const value = ethers.parseEther(amount);
      $('txStatus').textContent = 'Enviando transacción…';
      const tx = await wallet.sendTransaction({ to, value });
      $('txStatus').textContent = `Tx enviada: ${tx.hash}`;
    } catch (e) {
      $('txStatus').textContent = 'Error al enviar';
      console.error(e);
    }
  });

  if (document.getElementById('btnQuote')) {
    $('btnQuote').addEventListener('click', async () => {
      try {
        if (!wallet) return alert('Desbloqueá/importá una cuenta primero');
        if ($('net').value !== 'polygon') return alert('El trading MVP está habilitado en Polygon');
        const amountStr = ($('tradeAmt').value || '').trim();
        if (!amountStr) return alert('Indicá el monto nativo a vender');
        const sellAmount = ethers.parseEther(amountStr).toString();
        const buySym = $('tradeTo').value;
        const buyToken = polygonTokens[buySym];
        const slip = Math.max(0, parseFloat($('tradeSlip').value || '0.5')) / 100;
        const url = new URL('https://polygon.api.0x.org/swap/v1/quote');
        url.searchParams.set('sellToken', 'MATIC');
        url.searchParams.set('buyToken', buyToken);
        url.searchParams.set('sellAmount', sellAmount);
        url.searchParams.set('slippagePercentage', String(slip));
        url.searchParams.set('takerAddress', wallet.address);
        const res = await fetch(url.toString());
        if (!res.ok) throw new Error('No se pudo obtener la cotización');
        const q = await res.json();
        lastQuote = q;
        $('quoteOut').textContent = JSON.stringify({
          price: q.price,
          guaranteedPrice: q.guaranteedPrice,
          buyAmount: q.buyAmount,
          estimatedGas: q.estimatedGas,
          to: q.to
        }, null, 2);
        $('btnSwap').disabled = false;
      } catch (e) {
        $('quoteOut').textContent = 'Error al cotizar';
        $('btnSwap').disabled = true;
        console.error(e);
      }
    });
    $('btnSwap').addEventListener('click', async () => {
      try {
        if (!wallet) return alert('Desbloqueá/importá una cuenta primero');
        if (!lastQuote) return alert('Primero obtené una cotización');
        $('btnSwap').disabled = true;
        const tx = await wallet.sendTransaction({ to: lastQuote.to, data: lastQuote.data, value: lastQuote.value });
        $('quoteOut').textContent = `Swap enviado: ${tx.hash}`;
      } catch (e) {
        $('quoteOut').textContent = 'Error al enviar swap';
        console.error(e);
      } finally {
        setTimeout(() => { $('btnSwap').disabled = false; }, 1500);
      }
    });
  }

  async function loadBonos() {
    try {
      const el = document.getElementById('bonosList');
      if (!el) return;
      const res = await fetch('./data/bonos.json');
      if (!res.ok) throw new Error('No se pudo cargar bonos');
      const items = await res.json();
      el.innerHTML = '';
      items.forEach(it => {
        const row = document.createElement('div');
        row.className = 'py-3';
        const a = document.createElement('a');
        a.href = it.url;
        a.target = '_blank';
        a.rel = 'noopener';
        a.className = 'text-blue-600 hover:underline';
        a.textContent = `${it.platform} — ${it.type}`;
        const p = document.createElement('p');
        p.className = 'text-sm text-gray-600';
        p.textContent = it.notes || '';
        row.appendChild(a);
        row.appendChild(p);
        el.appendChild(row);
      });
    } catch (e) {
      const el = document.getElementById('bonosList');
      if (el) el.textContent = 'No se pudo cargar el listado';
      console.error(e);
    }
  }

  // init
  setProvider();
  showAddress();
  loadBonos();
  // default tab visible ya es Cuenta; generar QR si corresponde
  renderQR();
})();

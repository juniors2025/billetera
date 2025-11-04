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
  };

  let wallet = null; // ethers.Wallet en memoria
  let provider = null;

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

  // init
  setProvider();
  showAddress();
})();

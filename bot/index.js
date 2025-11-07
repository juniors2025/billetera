import express from 'express';
import axios from 'axios';
import cron from 'node-cron';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const REGION = (process.env.CRAWL_REGION || 'global').toLowerCase();

if (!TOKEN || !CHAT_ID) {
  // No salimos en hard-fail: permitimos arrancar para healthcheck pero avisamos en logs
  console.warn('[WARN] TELEGRAM_BOT_TOKEN o TELEGRAM_CHAT_ID no configurados');
}

const tg = axios.create({ baseURL: `https://api.telegram.org/bot${TOKEN}` });

function formatItem(it) {
  const t = [];
  t.push(`• ${it.platform} — ${it.type}`);
  if (it.reward) t.push(`Recompensa: ${it.reward}`);
  if (it.currency) t.push(`Moneda: ${it.currency}`);
  if (it.time) t.push(`Tiempo: ${it.time}`);
  if (it.noDeposit) t.push(`Sin depósito: ${it.noDeposit ? 'Sí' : 'No'}`);
  if (it.region) t.push(`Región: ${it.region}`);
  if (it.notes) t.push(`Notas: ${it.notes}`);
  t.push(it.url);
  return t.join('\n');
}

async function publishItem(it) {
  if (!TOKEN || !CHAT_ID) return;
  const text = formatItem(it);
  // Evitamos errores por caracteres especiales asegurando form-urlencoded
  await tg.post('/sendMessage', new URLSearchParams({ chat_id: CHAT_ID, text }).toString(), {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  });
}

function loadBonos() {
  const file = path.join(__dirname, 'data/bonos.json');
  const raw = fs.readFileSync(file, 'utf8');
  const items = JSON.parse(raw);
  // Filtro muy simple por región si aplica
  return items.filter(it => {
    if (REGION === 'global') return true;
    return (it.region || '').toLowerCase().includes(REGION);
  });
}

app.get('/health', (req, res) => {
  res.json({ ok: true, time: new Date().toISOString() });
});

app.post('/notify', async (req, res) => {
  try {
    const { text, item } = req.body || {};
    if (text) {
      await publishItem({ platform: 'Aviso', type: 'manual', notes: text, url: '' });
    } else if (item) {
      await publishItem(item);
    } else {
      const list = loadBonos();
      for (const it of list) {
        await publishItem(it);
      }
    }
    res.json({ ok: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ ok: false, error: e.message });
  }
});

// Cron: cada 3 horas
cron.schedule('0 */3 * * *', async () => {
  try {
    const list = loadBonos();
    for (const it of list) {
      await publishItem(it);
    }
    console.log(`[CRON] Publicados ${list.length} items a ${new Date().toISOString()}`);
  } catch (e) {
    console.error('[CRON ERROR]', e);
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Bot backend escuchando en http://0.0.0.0:${PORT}`);
});

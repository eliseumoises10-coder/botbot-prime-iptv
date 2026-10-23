require('dotenv').config();
const express = require('express');
const puppeteer = require('puppeteer');
const axios = require('axios');
const cors = require('cors');
const app = express();
app.use(cors());
app.use(express.json());

const PANEL_URL = process.env.PANEL_URL || 'https://searchdefense.top';
const PANEL_LOGIN = process.env.PANEL_LOGIN;
const PANEL_PASSWORD = process.env.PANEL_PASSWORD;
const XTREAM_HOST = process.env.XTREAM_HOST || 'http://nanoignite.click:8080';

async function gerarUsuarioNoPainel(nota) {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox','--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  try {
    await page.goto(PANEL_URL + '/login', { waitUntil: 'networkidle2' });
    await page.type('input[type=email], input[name=email]', PANEL_LOGIN);
    await page.type('input[type=password], input[name=password]', PANEL_PASSWORD);
    await page.click('button[type=submit]');
    await page.waitForNavigation({ waitUntil: 'networkidle2' });
    await page.goto(PANEL_URL + '/iptv/criar', { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 2000));
    const notaSelector = 'input[name=nota], input[name=notes], textarea[name=nota], #nota';
    try { await page.type(notaSelector, nota); } catch(e){ 
      await page.evaluate((n)=>{ const el=document.querySelector('input[placeholder*=nota i]')||document.querySelector('#nota'); if(el) el.value=n; }, nota); 
    }
    try { await page.click('button:has-text("Gerar"), button:has-text("Criar")'); } catch(e){
      await page.evaluate(()=>{ document.querySelector('button[type=submit]')?.click(); });
    }
    await new Promise(r => setTimeout(r, 5000));
    await page.goto(PANEL_URL + '/iptv/usuarios', { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 2000));
    const ultimo = await page.evaluate(()=>{
      const rows = document.querySelectorAll('table tbody tr');
      if(!rows.length) return null;
      const last = rows[0];
      const tds = last.querySelectorAll('td');
      return { usuario: tds[0]?.innerText?.trim(), senha: tds[1]?.innerText?.trim() };
    });
    await browser.close();
    return ultimo;
  } catch(err){ await browser.close(); throw err; }
}

app.post('/api/gerar-prime', async (req,res)=>{
  const { mac, nome } = req.body;
  if(!mac) return res.status(400).json({erro: 'MAC obrigatorio'});
  const nota = `PRIME - ${nome||'Cliente'} - MAC ${mac} - BotBot ${new Date().toLocaleString('pt-BR')}`;
  try {
    const creds = await gerarUsuarioNoPainel(nota);
    if(!creds?.usuario) throw new Error('Nao gerou usuario');
    const m3u = `http://nanoignite.click/get.php?username=${creds.usuario}&password=${creds.senha}&type=m3u_plus`;
    res.json({ sucesso: true, usuario: creds.usuario, senha: creds.senha, mac, m3u });
  } catch(err){ res.status(500).json({ erro: err.message }); }
});

app.get('/', (req,res)=> res.send('BotBot PRIME IPTV - Online. POST /api/gerar-prime'));
const PORT = process.env.PORT || 3000;
app.listen(PORT, ()=> console.log('Rodando na porta '+PORT));

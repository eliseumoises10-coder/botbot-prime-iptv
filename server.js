const express = require('express');
const app = express();
app.use(express.json());
app.get('/', (req, res) => {
  res.json({ status: 'ONLINE', bot: 'Central Play PRIME' });
});
app.post('/gerar-prime', (req, res) => {
  const { mac } = req.body;
  const user = '10581' + Math.floor(Math.random()*9000);
  const pass = Math.random().toString(36).substring(2,10);
  res.json({
    ok: true,
    mac: mac,
    username: user,
    password: pass,
    server: 'http://nanoignite.click:8080',
    m3u: `http://nanoignite.click/get.php?username=${user}&password=${pass}&type=m3u_plus`
  });
});
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('ONLINE ' + PORT));

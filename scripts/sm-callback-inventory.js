const fs = require('fs'); const path = require('path');
const d = path.join(__dirname, '..', 'visual-memory', 'sm', 'callback-requests');
fs.readdirSync(d).filter(f => f.endsWith('.png')).sort().forEach(f => {
  const s = fs.statSync(path.join(d, f));
  console.log(`${(s.size/1024).toFixed(1).padStart(7)} KB  ${f}`);
});

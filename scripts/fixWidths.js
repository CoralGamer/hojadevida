const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'pages', 'servicios');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

files.forEach(file => {
  const filePath = path.join(dir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  content = content.replace(/max-w-4xl/g, 'max-w-7xl');
  // En algunos lugares puede ser max-w-3xl
  content = content.replace(/max-w-3xl/g, 'max-w-7xl');
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Fixed:', file);
});
console.log('Done replacing widths!');

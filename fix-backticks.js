const fs = require('fs');
const path = require('path');

function fix(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      if (file !== 'node_modules' && file !== '.git') {
        fix(fullPath);
      }
    } else if (fullPath.endsWith('.js')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      // Look for a single backslash followed by a backtick
      if (content.indexOf('\`') !== -1) {
        content = content.split('\`').join('`');
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log('Fixed:', fullPath);
      }
    }
  }
}

fix(__dirname);

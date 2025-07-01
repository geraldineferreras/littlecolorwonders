const fs = require('fs');
const path = require('path');

// Ensure public directory exists
if (!fs.existsSync('public')) {
  fs.mkdirSync('public');
}

// Copy HTML files
const htmlFiles = ['index.html', 'products.html', 'contact.html', 'thank-you.html', 'pinterest-optimization.html', 'pinterest-3a15f.html'];
htmlFiles.forEach(file => {
  if (fs.existsSync(file)) {
    fs.copyFileSync(file, path.join('public', file));
    console.log(`Copied ${file} to public/`);
  }
});

// Copy directories
const directories = ['assets', 'data', 'downloads', 'forms'];
directories.forEach(dir => {
  if (fs.existsSync(dir)) {
    copyDir(dir, path.join('public', dir));
    console.log(`Copied ${dir}/ to public/${dir}/`);
  }
});

function copyDir(src, dest) {
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  
  const entries = fs.readdirSync(src, { withFileTypes: true });
  
  for (let entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

console.log('Build completed! All files copied to public/ directory.'); 
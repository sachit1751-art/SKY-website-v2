const fs = require('fs');
const path = require('path');

const visited = new Set();
const badImports = new Set();

function resolveExtension(filePath) {
  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) return filePath;
  if (fs.existsSync(filePath + '.ts')) return filePath + '.ts';
  if (fs.existsSync(filePath + '.js')) return filePath + '.js';
  if (fs.existsSync(path.join(filePath, 'index.ts'))) return path.join(filePath, 'index.ts');
  return null;
}

function scanFile(filePath) {
  const resolvedPath = resolveExtension(filePath);
  if (!resolvedPath || visited.has(resolvedPath)) return;
  visited.add(resolvedPath);

  const content = fs.readFileSync(resolvedPath, 'utf8');
  // Match `import ... from '...'` and `import('...')`
  const importRegex = /(?:import|from)\s*\(?['"]([^'"]+)['"]\)?/g;
  let match;
  
  while ((match = importRegex.exec(content)) !== null) {
    const importPath = match[1];
    
    // We only care about local relative imports
    if (importPath.startsWith('.')) {
      const absoluteImportPath = path.resolve(path.dirname(resolvedPath), importPath);
      const relativeToRoot = path.relative(process.cwd(), absoluteImportPath);
      
      // If it points anywhere inside the src/ folder, flag it
      if (relativeToRoot.startsWith('src') || relativeToRoot === 'src') {
        badImports.add(`${path.relative(process.cwd(), resolvedPath)} imports '${importPath}' (resolves to ${relativeToRoot})`);
      } else {
        // Recursively scan the dependency
        scanFile(absoluteImportPath);
      }
    }
  }
}

scanFile(path.resolve('api/index.ts'));

console.log("=== DEPENDENCY SCAN RESULTS ===");
if (badImports.size === 0) {
  console.log("✅ SUCCESS: The dependency graph is clean. No local imports point to 'src/'.");
} else {
  console.log("❌ FAILURE: Found non-backend-safe imports pointing to 'src/':");
  Array.from(badImports).forEach(imp => console.log(`  - ${imp}`));
}

// Script to pre-compute Kociemba solver tables
// Run with: node scripts/generate-solver-tables.js

import Cube from 'cubejs';
import 'cubejs/lib/solve.js';
import { writeFileSync } from 'fs';
import { join } from 'path';

console.log('Initializing solver (this takes ~7 seconds)...');
const startTime = performance.now();
Cube.initSolver();
const elapsed = performance.now() - startTime;
console.log(`Solver initialized in ${(elapsed / 1000).toFixed(1)}s`);

// Extract the computed tables
const tables = {
  moveTables: Cube.moveTables,
  pruningTables: Cube.pruningTables,
};

// Serialize to JSON
const json = JSON.stringify(tables);
const jsonSize = Buffer.byteLength(json, 'utf8');
console.log(`JSON size: ${(jsonSize / 1024 / 1024).toFixed(2)} MB`);

// Write to public directory so it's served as a static file
const outputPath = join(process.cwd(), 'public', 'solver-tables.json');
writeFileSync(outputPath, json);
console.log(`Written to: ${outputPath}`);

// Also try a more compact format - the pruning tables are Uint8Arrays
// Let's check the types
console.log('\nTable types:');
for (const [name, table] of Object.entries(Cube.moveTables)) {
  if (table) {
    const type = Array.isArray(table) ? `Array[${table.length}]` : typeof table;
    console.log(`  moveTables.${name}: ${type}`);
  }
}
for (const [name, table] of Object.entries(Cube.pruningTables)) {
  if (table) {
    const type = table.constructor.name;
    console.log(`  pruningTables.${name}: ${type}[${table.length}]`);
  }
}

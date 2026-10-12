/**
 * Script pour exécuter les tests en Node.js
 * Usage: node src/tests/runTests.js
 */

import { runAllTests } from './calculations.test.js';
import './impotRevenu.test.js';
import './cotisationsAndLifetime.test.js';

console.log('\nDémarrage des tests du moteur de calcul succession...\n');

const results = runAllTests();

// Code de sortie selon les résultats
process.exit(results.failed > 0 ? 1 : 0);

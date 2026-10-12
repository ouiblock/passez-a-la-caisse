import { estimateLifetimeTaxes, calculatePerPerson } from '../utils/lifetime/lifetimeCalculations.js';
import { repartitionCotisations } from '../utils/lifetime/adapters/cotisations.js';
import { estimateSuccessionHeritiers } from '../utils/lifetime/adapters/successionEstimation.js';
import { DEFAULT_PROFIL } from '../types/tax.js';

console.log('\n=== TESTS COTISATIONS URSSAF & MOTEUR FISCAL VIE ENTIÈRE ===\n');

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`PASS: ${message}`);
    passed++;
  } else {
    console.error(`FAIL: ${message}`);
    failed++;
  }
}

// 1. Test repartitionCotisations
const testProfil = {
  ...DEFAULT_PROFIL,
  revenuNetMensuel: 3000,
  age: 30,
  ageDebutCarriere: 22,
  retraiteAge: 64,
  esperanceVie: 85,
  statut: 'cadre'
};

const repartition = repartitionCotisations(testProfil);

assert(typeof repartition.salariales === 'object', 'repartition.salariales est un objet');
assert(typeof repartition.patronales === 'object', 'repartition.patronales est un objet');

const salarialesKeys = ['maladie', 'vieillesse', 'vieillesse_dep', 'chomage', 'retraiteCompl', 'ceg', 'csg', 'crds', 'total'];
const patronalesKeys = ['maladie', 'vieillesse', 'vieillesse_dep', 'allocFamiliales', 'chomage', 'retraiteCompl', 'ceg', 'csa', 'accident', 'fnal', 'formation', 'total'];

for (const key of salarialesKeys) {
  const val = repartition.salariales[key];
  assert(typeof val === 'number' && !isNaN(val) && val > 0, `Cotisation salariale ${key} est un nombre positif (${val})`);
}

for (const key of patronalesKeys) {
  const val = repartition.patronales[key];
  assert(typeof val === 'number' && !isNaN(val) && val > 0, `Cotisation patronale ${key} est un nombre positif (${val})`);
}

// 2. Test estimateLifetimeTaxes sur profils variés
const profilsTest = [
  { label: 'Célibataire salarié', statut: 'salarie', situation: 'celibataire', enfants: 0, revenu: 2200 },
  { label: 'Cadre en couple 2 enfants', statut: 'cadre', situation: 'couple', enfants: 2, revenu: 5000 },
  { label: 'Retraité', statut: 'retraite', situation: 'couple', enfants: 1, revenu: 2500 },
  { label: 'Entrepreneur', statut: 'entrepreneur', situation: 'celibataire', enfants: 0, revenu: 4000 }
];

for (const p of profilsTest) {
  const prof = {
    ...DEFAULT_PROFIL,
    statut: p.statut,
    situation: p.situation,
    enfants: p.enfants,
    revenuNetMensuel: p.revenu
  };
  const res = estimateLifetimeTaxes(prof);
  assert(typeof res.total === 'number' && !isNaN(res.total) && res.total > 0, `estimateLifetimeTaxes total valide pour ${p.label}: ${res.total.toLocaleString()} €`);
  assert(typeof res.richesseTotaleCreee === 'number' && !isNaN(res.richesseTotaleCreee) && res.richesseTotaleCreee > 0, `richesseTotaleCreee valide pour ${p.label}`);
  
  const perPerson = calculatePerPerson(res, prof);
  assert(typeof perPerson.parPersonne === 'number' && !isNaN(perPerson.parPersonne), `calculatePerPerson valide pour ${p.label}`);
}

// 3. Test estimateSuccessionHeritiers
const succRes = estimateSuccessionHeritiers(testProfil);
assert(typeof succRes.droitsTotal === 'number' && !isNaN(succRes.droitsTotal), 'estimateSuccessionHeritiers droitsTotal valide');

// 4. Test formatage des chiffres PDF (aucun slash sur les millions)
const { formatNumber: fnLifetime, fmt: fmtLifetime } = await import('../utils/exportLifetimePDF.js');
const formatted1M = fnLifetime(1000000);
assert(!formatted1M.includes('/'), 'formatNumber Lifetime ne contient aucun slash (/)');
assert(formatted1M === '1 000 000', `formatNumber(1000000) === '1 000 000' (obtenu: '${formatted1M}')`);
assert(fmtLifetime(1254380) === '1 254 380 €', `fmtLifetime(1254380) === '1 254 380 €' (obtenu: '${fmtLifetime(1254380)}')`);

const { formatNumber: fnSuccession, fmt: fmtSuccession } = await import('../utils/exportPDF.js');
const formatted10M = fnSuccession(10000000);
assert(!formatted10M.includes('/'), 'formatNumber Succession ne contient aucun slash (/)');
assert(formatted10M === '10 000 000', `formatNumber(10000000) === '10 000 000' (obtenu: '${formatted10M}')`);
assert(fmtSuccession(2500000) === '2 500 000 €', `fmtSuccession(2500000) === '2 500 000 €' (obtenu: '${fmtSuccession(2500000)}')`);

console.log(`\nCotisations & Moteur: ${passed} réussis / ${failed} échoués\n`);

if (failed > 0) {
  process.exit(1);
}

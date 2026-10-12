/**
 * Tests chiffrés pour valider le moteur de calcul fiscal
 * Chaque test inclut les résultats attendus
 */

import { 
  appliquerBareme, 
  getAbattement, 
  calculerDonationsConsommees,
  calculerDroitsBeneficiaire,
  calculerDroitsAVAvant70,
  calculerDroitsAvecAV
} from '../utils/calculations.js';
import { FISC } from '../constants/fiscal.js';

// Utilitaire pour comparer avec tolérance (erreurs d'arrondi)
function assertClose(actual, expected, tolerance = 0.01, label = '') {
  const diff = Math.abs(actual - expected);
  if (diff > tolerance) {
    throw new Error(`${label}: Attendu ${expected}, obtenu ${actual} (diff: ${diff})`);
  }
  return true;
}

// ============================================================================
// TEST 1 : Barème ligne directe - Cas simple
// ============================================================================
export function test1_bareme_ligne_directe() {
  console.log('\n=== TEST 1 : Barème ligne directe ===');
  
  // Montant taxable : 200 000 €
  const montant = 200000;
  const bareme = FISC.baremes.ligne_directe;
  const droits = appliquerBareme(montant, bareme);
  
  // Calcul attendu :
  // 0 → 8 072 : 8 072 × 5% = 403,60 €
  // 8 072 → 12 109 : 4 037 × 10% = 403,70 €
  // 12 109 → 15 932 : 3 823 × 15% = 573,45 €
  // 15 932 → 200 000 : 184 068 × 20% = 36 813,60 €
  // TOTAL = 38 194,35 €
  
  const attendu = 38194.35;
  assertClose(droits, attendu, 1, 'Barème ligne directe 200k');
  console.log(`✓ Montant: ${montant} € → Droits: ${droits.toFixed(2)} € (attendu: ${attendu} €)`);
  
  return true;
}

// ============================================================================
// TEST 2 : Abattement enfant avec donations < 15 ans
// ============================================================================
export function test2_abattement_avec_donations() {
  console.log('\n=== TEST 2 : Abattement enfant avec donations < 15 ans ===');
  
  const beneficiaire = { type: 'enfant', pourcentage: 100 };
  const montantTransmissible = 250000;
  const donations = [
    { montant: 50000, annee: 2020 }, // < 15 ans
    { montant: 30000, annee: 2005 }  // > 15 ans (rechargé)
  ];
  
  const resultat = calculerDroitsBeneficiaire(beneficiaire, montantTransmissible, 100, donations);
  
  // Calcul attendu :
  // Quote-part : 250 000 €
  // Abattement total : 100 000 €
  // Donations < 15 ans : 50 000 €
  // Abattement disponible : 100 000 - 50 000 = 50 000 €
  // Base taxable : 250 000 - 50 000 = 200 000 €
  // Droits : 38 194,35 € (cf TEST 1)
  
  assertClose(resultat.quotePart, 250000, 1, 'Quote-part');
  assertClose(resultat.donationsConsommees, 50000, 1, 'Donations consommées');
  assertClose(resultat.abattementDisponible, 50000, 1, 'Abattement disponible');
  assertClose(resultat.baseTaxable, 200000, 1, 'Base taxable');
  assertClose(resultat.droitsCivils, 38194.35, 1, 'Droits civils');
  
  console.log(`✓ Quote-part: ${resultat.quotePart} €`);
  console.log(`✓ Donations < 15 ans: ${resultat.donationsConsommees} €`);
  console.log(`✓ Abattement disponible: ${resultat.abattementDisponible} €`);
  console.log(`✓ Base taxable: ${resultat.baseTaxable} €`);
  console.log(`✓ Droits: ${resultat.droitsCivils.toFixed(2)} €`);
  
  return true;
}

// ============================================================================
// TEST 3 : Petit-enfant - Donation (790B) vs Succession
// ============================================================================
export function test3_petit_enfant_donation_vs_succession() {
  console.log('\n=== TEST 3 : Petit-enfant - Donation vs Succession ===');
  
  // En DONATION : abattement 790B = 31 865 €
  const abattementDonation = getAbattement('petit_enfant', 'donation');
  assertClose(abattementDonation, 31865, 1, 'Abattement donation 790B');
  console.log(`✓ Donation (790B): ${abattementDonation} €`);
  
  // En SUCCESSION sans représentation : abattement tiers = 1 594 €
  const abattementSuccession = getAbattement('petit_enfant', 'succession');
  assertClose(abattementSuccession, 1594, 1, 'Abattement succession sans représentation');
  console.log(`✓ Succession (sans représentation): ${abattementSuccession} €`);
  
  return true;
}

// ============================================================================
// TEST 4 : Assurance-vie avant 70 ans (990 I)
// ============================================================================
export function test4_assurance_vie_avant_70() {
  console.log('\n=== TEST 4 : Assurance-vie avant 70 ans (990 I) ===');
  
  // Cas 1 : Montant < abattement
  const montant1 = 100000;
  const droits1 = calculerDroitsAVAvant70(montant1);
  // 100 000 < 152 500 → 0 €
  assertClose(droits1, 0, 1, 'AV < abattement');
  console.log(`✓ Cas 1 (100k €): ${droits1} € (< abattement)`);
  
  // Cas 2 : Montant entre abattement et palier 700k
  const montant2 = 500000;
  const droits2 = calculerDroitsAVAvant70(montant2);
  // 500 000 - 152 500 = 347 500 €
  // 347 500 < 700 000 → 347 500 × 20% = 69 500 €
  assertClose(droits2, 69500, 1, 'AV entre abattement et 700k');
  console.log(`✓ Cas 2 (500k €): ${droits2.toFixed(2)} € (attendu: 69 500 €)`);
  
  // Cas 3 : Montant > 700k (après abattement)
  const montant3 = 1000000;
  const droits3 = calculerDroitsAVAvant70(montant3);
  // 1 000 000 - 152 500 = 847 500 €
  // 700 000 × 20% = 140 000 €
  // (847 500 - 700 000) × 31,25% = 147 500 × 31,25% = 46 093,75 €
  // TOTAL = 140 000 + 46 093,75 = 186 093,75 €
  assertClose(droits3, 186093.75, 1, 'AV > 700k après abattement');
  console.log(`✓ Cas 3 (1M €): ${droits3.toFixed(2)} € (attendu: 186 093,75 €)`);
  
  return true;
}

// ============================================================================
// TEST 5 : Barème frères/sœurs
// ============================================================================
export function test5_bareme_freres_soeurs() {
  console.log('\n=== TEST 5 : Barème frères/sœurs ===');
  
  const montant = 100000;
  const bareme = FISC.baremes.freres_soeurs;
  const droits = appliquerBareme(montant, bareme);
  
  // Calcul attendu :
  // 0 → 24 430 : 24 430 × 35% = 8 550,50 €
  // 24 430 → 100 000 : 75 570 × 45% = 34 006,50 €
  // TOTAL = 42 557 €
  
  const attendu = 42557;
  assertClose(droits, attendu, 1, 'Barème frères/sœurs');
  console.log(`✓ Montant: ${montant} € → Droits: ${droits.toFixed(2)} € (attendu: ${attendu} €)`);
  
  return true;
}

// ============================================================================
// TEST 6 : Barème tiers (60%)
// ============================================================================
export function test6_bareme_tiers() {
  console.log('\n=== TEST 6 : Barème tiers (60%) ===');
  
  const montant = 50000;
  const bareme = FISC.baremes.tiers;
  const droits = appliquerBareme(montant, bareme);
  
  // Calcul attendu : 50 000 × 60% = 30 000 €
  const attendu = 30000;
  assertClose(droits, attendu, 1, 'Barème tiers');
  console.log(`✓ Montant: ${montant} € → Droits: ${droits.toFixed(2)} € (attendu: ${attendu} €)`);
  
  return true;
}

// ============================================================================
// TEST 7 : Cas complet - Parent → 2 enfants avec AV
// ============================================================================
export function test7_cas_complet_2_enfants() {
  console.log('\n=== TEST 7 : Cas complet - Parent → 2 enfants avec AV ===');
  
  const beneficiaires = [
    { type: 'enfant', pourcentage: 50, donations: [] },
    { type: 'enfant', pourcentage: 50, donations: [] }
  ];
  
  const montantTransmissible = 400000; // Patrimoine classique
  const avAvant70 = 400000; // AV avant 70 ans
  const avApres70 = 0;
  
  const { resultats, totalDroits } = calculerDroitsAvecAV(
    beneficiaires,
    montantTransmissible,
    avAvant70,
    avApres70
  );
  
  // ENFANT 1 :
  // Patrimoine classique : 200 000 €
  // - Abattement : 100 000 €
  // - Base taxable : 100 000 €
  // - Droits civils : 
  //   * 8 072 × 5% = 403,60 €
  //   * 4 037 × 10% = 403,70 €
  //   * 3 823 × 15% = 573,45 €
  //   * 84 068 × 20% = 16 813,60 €
  //   * TOTAL = 18 194,35 €
  //
  // AV avant 70 : 200 000 €
  // - Abattement : 152 500 €
  // - Base taxable : 47 500 €
  // - Droits AV : 47 500 × 20% = 9 500 €
  //
  // TOTAL ENFANT 1 : 18 194,35 + 9 500 = 27 694,35 €
  
  // ENFANT 2 : identique = 27 694,35 €
  
  // TOTAL GÉNÉRAL : 27 694,35 × 2 = 55 388,70 €
  
  assertClose(resultats[0].droitsCivils, 18194.35, 1, 'Droits civils enfant 1');
  assertClose(resultats[0].droitsAVAvant70, 9500, 1, 'Droits AV enfant 1');
  assertClose(resultats[0].totalDroits, 27694.35, 1, 'Total droits enfant 1');
  
  assertClose(totalDroits, 55388.70, 2, 'Total droits 2 enfants');
  
  console.log(`✓ Enfant 1 - Droits civils: ${resultats[0].droitsCivils.toFixed(2)} €`);
  console.log(`✓ Enfant 1 - Droits AV: ${resultats[0].droitsAVAvant70.toFixed(2)} €`);
  console.log(`✓ Enfant 1 - Total: ${resultats[0].totalDroits.toFixed(2)} €`);
  console.log(`✓ TOTAL GÉNÉRAL: ${totalDroits.toFixed(2)} € (attendu: 55 388,70 €)`);
  
  return true;
}

// ============================================================================
// TEST 8 : Don familial 790G - Vérification constante
// ============================================================================
export function test8_don_familial_790G() {
  console.log('\n=== TEST 8 : Don familial 790G ===');
  
  const montantDonFamilial = FISC.abattements.donation.don_familial_790G;
  assertClose(montantDonFamilial, 31865, 1, 'Don familial 790G');
  console.log(`✓ Don familial 790G: ${montantDonFamilial} €`);
  console.log(`✓ Conditions: ${FISC.regles.don_familial_790G_conditions}`);
  
  return true;
}

// ============================================================================
// TEST 9 : Rechargement abattements après 15 ans
// ============================================================================
export function test9_rechargement_abattements() {
  console.log('\n=== TEST 9 : Rechargement abattements après 15 ans ===');
  
  const anneeActuelle = 2025;
  const donations = [
    { montant: 50000, annee: 2024 }, // 1 an → consommé
    { montant: 30000, annee: 2015 }, // 10 ans → consommé
    { montant: 40000, annee: 2009 }, // 16 ans → rechargé
    { montant: 20000, annee: 2000 }  // 25 ans → rechargé
  ];
  
  const consommees = calculerDonationsConsommees(donations, anneeActuelle);
  
  // Attendu : 50 000 + 30 000 = 80 000 €
  assertClose(consommees, 80000, 1, 'Donations consommées');
  console.log(`✓ Donations < 15 ans: ${consommees} € (attendu: 80 000 €)`);
  console.log(`✓ Donations > 15 ans rechargées: 40 000 + 20 000 = 60 000 €`);
  
  return true;
}

// ============================================================================
// TEST 10 : Neveu/nièce - Barème collatéraux (55%)
// ============================================================================
export function test10_neveu_niece() {
  console.log('\n=== TEST 10 : Neveu/nièce - Barème collatéraux ===');
  
  const beneficiaire = { type: 'neveu_niece', pourcentage: 100 };
  const montantTransmissible = 50000;
  const donations = [];
  
  const resultat = calculerDroitsBeneficiaire(beneficiaire, montantTransmissible, 100, donations);
  
  // Calcul attendu :
  // Quote-part : 50 000 €
  // Abattement : 7 967 €
  // Base taxable : 50 000 - 7 967 = 42 033 €
  // Droits : 42 033 × 55% = 23 118,15 €
  
  assertClose(resultat.abattementDisponible, 7967, 1, 'Abattement neveu/nièce');
  assertClose(resultat.baseTaxable, 42033, 1, 'Base taxable');
  assertClose(resultat.droitsCivils, 23118.15, 1, 'Droits collatéraux');
  
  console.log(`✓ Abattement: ${resultat.abattementDisponible} €`);
  console.log(`✓ Base taxable: ${resultat.baseTaxable} €`);
  console.log(`✓ Droits (55%): ${resultat.droitsCivils.toFixed(2)} €`);
  
  return true;
}

// ============================================================================
// RUNNER - Exécuter tous les tests
// ============================================================================
export function runAllTests() {
  console.log('\n╔═══════════════════════════════════════════════════════════╗');
  console.log('║     TESTS CHIFFRÉS - MOTEUR DE CALCUL FISCAL            ║');
  console.log('╚═══════════════════════════════════════════════════════════╝');
  
  const tests = [
    { name: 'TEST 1 : Barème ligne directe', fn: test1_bareme_ligne_directe },
    { name: 'TEST 2 : Abattement avec donations', fn: test2_abattement_avec_donations },
    { name: 'TEST 3 : Petit-enfant donation vs succession', fn: test3_petit_enfant_donation_vs_succession },
    { name: 'TEST 4 : Assurance-vie avant 70 ans', fn: test4_assurance_vie_avant_70 },
    { name: 'TEST 5 : Barème frères/sœurs', fn: test5_bareme_freres_soeurs },
    { name: 'TEST 6 : Barème tiers', fn: test6_bareme_tiers },
    { name: 'TEST 7 : Cas complet 2 enfants', fn: test7_cas_complet_2_enfants },
    { name: 'TEST 8 : Don familial 790G', fn: test8_don_familial_790G },
    { name: 'TEST 9 : Rechargement abattements', fn: test9_rechargement_abattements },
    { name: 'TEST 10 : Neveu/nièce collatéraux', fn: test10_neveu_niece }
  ];
  
  let passed = 0;
  let failed = 0;
  
  tests.forEach(test => {
    try {
      test.fn();
      passed++;
      console.log(`\n✅ ${test.name} : RÉUSSI`);
    } catch (error) {
      failed++;
      console.error(`\n❌ ${test.name} : ÉCHEC`);
      console.error(`   ${error.message}`);
    }
  });
  
  console.log('\n╔═══════════════════════════════════════════════════════════╗');
  console.log(`║  RÉSULTATS : ${passed} réussis / ${failed} échoués (${tests.length} total)          ║`);
  console.log('╚═══════════════════════════════════════════════════════════╝\n');
  
  return { passed, failed, total: tests.length };
}

// Export pour utilisation dans la console
if (typeof window !== 'undefined') {
  window.runFiscalTests = runAllTests;
}

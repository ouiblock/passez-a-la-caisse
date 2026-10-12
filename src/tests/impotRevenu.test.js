import { calculerImpotAnnuel, calculerParts, appliquerBareme } from '../utils/lifetime/adapters/impotRevenu.js';

function assertEqual(actual, expected, message) {
  if (Math.abs(actual - expected) > 1) {
    throw new Error(`FAIL: ${message} - Attendu: ${expected}, Obtenu: ${actual}`);
  }
  console.log(`PASS: ${message} => ${actual} €`);
}

console.log('=== TESTS CALCUL IMPÔT SUR LE REVENU (BARÈME 2026) ===\n');

// 1. Test du barème par tranches (1 part)
// Jusqu'à 11 600 : 0%
assertEqual(appliquerBareme(10000), 0, 'Tranche 0% : 10 000 € taxable -> 0 €');
// 20 000 € : (20000 - 11600) * 11% = 8400 * 0.11 = 924 €
assertEqual(appliquerBareme(20000), 924, 'Tranche 11% : 20 000 € taxable -> 924 €');
// 40 000 € : 17979 * 11% + (40000 - 29579) * 30% = 1977.69 + 3126.30 = 5103.99 €
assertEqual(Math.round(appliquerBareme(40000)), 5104, 'Tranche 30% : 40 000 € taxable -> 5104 €');

// 2. Test de l'abattement forfaitaire de 10%
// Salaire net de 30 000 € / an -> Revenu imposable = 27 000 € (1 part)
// Impôt sur 27 000 € : (27000 - 11600) * 11% = 15400 * 0.11 = 1694 €
const impot30k = calculerImpotAnnuel(30000, 1);
assertEqual(impot30k, 1694, 'Célibataire 30 000 € net/an (abattement 10% = 27 000 € imposable) -> 1694 €');

// 3. Test salaire moyen INSEE : 2 200 € net/mois = 26 400 € / an
// Abattement 10% = 2 640 € -> Base imposable = 23 760 €
// Impôt : (23760 - 11600) * 11% = 12160 * 0.11 = 1337.60 € (~1338 €)
const impotMoyen = calculerImpotAnnuel(26400, 1);
assertEqual(impotMoyen, 1338, 'Célibataire salaire moyen 2200 €/mois (26 400 €/an) -> 1338 €/an (~111 €/mois)');

// 4. Test quotient familial : Couple sans enfant (2 parts)
// Revenu net foyer : 48 000 € (2 x 2000 €/mois)
// Abattement 10% : 43 200 €
// Par part : 43 200 / 2 = 21 600 €
// Impôt par part : (21600 - 11600) * 11% = 10000 * 0.11 = 1100 €
// Impôt total foyer : 1100 * 2 = 2200 €
const impotCouple = calculerImpotAnnuel(48000, 2);
assertEqual(impotCouple, 2200, 'Couple sans enfant 48 000 € net/an (2 parts) -> 2200 €/an');

// 5. Test quotient familial : Couple avec 2 enfants (3 parts)
// Revenu net foyer : 48 000 €
// Abattement 10% : 43 200 €
// Par part : 43 200 / 3 = 14 400 €
// Impôt par part : (14400 - 11600) * 11% = 2800 * 0.11 = 308 €
// Impôt total foyer : 308 * 3 = 924 €
const impotFamille2Enfants = calculerImpotAnnuel(48000, 3);
assertEqual(impotFamille2Enfants, 924, 'Couple + 2 enfants 48 000 € net/an (3 parts) -> 924 €/an');

// 6. Test parts calculées depuis le profil
assertEqual(calculerParts({ situation: 'celibataire', enfants: 0 }), 1, 'Parts célibataire 0 enfant');
assertEqual(calculerParts({ situation: 'celibataire', enfants: 1 }), 1.5, 'Parts célibataire 1 enfant');
assertEqual(calculerParts({ situation: 'couple', enfants: 0 }), 2, 'Parts couple 0 enfant');
assertEqual(calculerParts({ situation: 'couple', enfants: 2 }), 3, 'Parts couple 2 enfants');
assertEqual(calculerParts({ situation: 'couple', enfants: 3 }), 4, 'Parts couple 3 enfants');

console.log('\nTous les tests unitaires ont réussi avec succès !');

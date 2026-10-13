/**
 * Adapter Placements financiers et Patrimoine
 * Calcule la flat tax sur les revenus du capital et l'IFI
 */

import { FLAT_TAX, BAREME_IFI, FISCALITE_PLACEMENTS } from '../assumptions.js';

/**
 * Calcule la fiscalité sur les revenus du capital selon le type de placement
 * @param {import('../../../types/tax').Profil} profil - Profil utilisateur
 * @returns {number} Total fiscalité placements vie entière
 */
export function calculateFlatTax(profil) {
  if (!profil.placements) return 0;
  
  const rendementPct = (profil.placements.rendementPct || 3) / 100;
  const ageDebut = profil.ageDebutCarriere || 22;
  const duree = Math.max(0, profil.esperanceVie - ageDebut);
  
  let fiscaliteTotale = 0;
  
  // PEA : 17.2% (PS uniquement après 5 ans)
  if (profil.placements.pea > 0) {
    const revenusAnnuels = profil.placements.pea * rendementPct;
    const fiscaliteAnnuelle = revenusAnnuels * FISCALITE_PLACEMENTS.pea.total;
    fiscaliteTotale += fiscaliteAnnuelle * duree;
  }
  
  // Assurance-vie : 24.7% (7.5% + 17.2% après 8 ans et abattement)
  if (profil.placements.assuranceVie > 0) {
    const revenusAnnuels = profil.placements.assuranceVie * rendementPct;
    const fiscaliteAnnuelle = revenusAnnuels * FISCALITE_PLACEMENTS.assuranceVie.total;
    fiscaliteTotale += fiscaliteAnnuelle * duree;
  }
  
  // CTO : 30% (flat tax)
  if (profil.placements.cto > 0) {
    const revenusAnnuels = profil.placements.cto * rendementPct;
    const fiscaliteAnnuelle = revenusAnnuels * FISCALITE_PLACEMENTS.cto.total;
    fiscaliteTotale += fiscaliteAnnuelle * duree;
  }
  
  // Livrets : 0% (exonération totale)
  // Pas de fiscalité sur les livrets réglementés
  
  // Autres placements : 30% (flat tax par défaut)
  if (profil.placements.autresPlacements > 0) {
    const revenusAnnuels = profil.placements.autresPlacements * rendementPct;
    const fiscaliteAnnuelle = revenusAnnuels * FISCALITE_PLACEMENTS.autresPlacements.total;
    fiscaliteTotale += fiscaliteAnnuelle * duree;
  }
  
  return Math.round(fiscaliteTotale);
}

/**
 * Calcule l'IFI (Impôt sur la Fortune Immobilière)
 * @param {import('../../../types/tax').Profil} profil - Profil utilisateur
 * @returns {number} Total IFI vie entière
 */
export function calculateIFI(profil) {
  // Calculer le patrimoine immobilier net
  let patrimoineImmoNet = 0;
  
  // Résidence principale (avec abattement de 30%)
  if (profil.logement.rpAchat && profil.logement.rpPrix) {
    const valeurRP = profil.logement.rpPrix;
    const valeurNetteRP = valeurRP * 0.7; // Abattement 30%
    patrimoineImmoNet += valeurNetteRP;
  }
  
  // Résidence secondaire (pas d'abattement)
  if (profil.logement.rsAchat && profil.logement.rsPrix) {
    patrimoineImmoNet += profil.logement.rsPrix;
  }
  
  // Déduire les crédits immobiliers
  if (profil.credits && profil.credits.capitalRestant > 0) {
    patrimoineImmoNet -= profil.credits.capitalRestant;
  }
  
  // Vérifier si on dépasse le seuil de 1.31M€
  if (patrimoineImmoNet < BAREME_IFI.seuil) return 0;
  
  // Calculer l'IFI selon le barème progressif
  let ifiAnnuel = 0;
  
  for (const tranche of BAREME_IFI.tranches) {
    if (patrimoineImmoNet > tranche.min) {
      const baseImposable = Math.min(patrimoineImmoNet, tranche.max) - tranche.min;
      ifiAnnuel += baseImposable * tranche.taux;
    }
  }
  
  // Durée de vie
  const ageDebut = profil.ageDebutCarriere || 22;
  const duree = Math.max(0, profil.esperanceVie - ageDebut);
  
  // Total sur la vie (hypothèse : patrimoine constant)
  const totalIFI = ifiAnnuel * duree;
  
  return Math.round(totalIFI);
}

/**
 * Calcule les intérêts payés sur les crédits immobiliers
 * @param {import('../../../types/tax').Profil} profil - Profil utilisateur
 * @returns {number} Total intérêts payés
 */
export function calculateInteretsCredits(profil) {
  if (!profil.credits || profil.credits.capitalRestant === 0) return 0;
  
  const capitalRestant = profil.credits.capitalRestant;
  const tauxAnnuel = profil.credits.tauxPct / 100;
  const dureeRestante = profil.credits.dureeRestanteAns;
  
  // Calcul simplifié : intérêts = capital × taux × durée / 2
  // (Formule approximative car le capital diminue au fil du temps)
  const interetsTotal = (capitalRestant * tauxAnnuel * dureeRestante) / 2;
  
  return Math.round(interetsTotal);
}

/**
 * Détail de la flat tax par année
 * @param {import('../../../types/tax').Profil} profil - Profil utilisateur
 * @returns {Array<{annee: number, revenus: number, flatTax: number}>}
 */
export function detailFlatTaxParAnnee(profil) {
  if (!profil.placements || profil.placements.capitalTotal === 0) return [];
  
  const capitalTotal = profil.placements.capitalTotal;
  const rendementPct = profil.placements.rendementPct / 100;
  const revenusAnnuels = capitalTotal * rendementPct;
  const flatTaxAnnuelle = revenusAnnuels * FLAT_TAX.taux;
  
  const ageDebut = profil.ageDebutCarriere || 22;
  const ageFin = profil.esperanceVie;
  
  const timeline = [];
  for (let age = ageDebut; age <= ageFin; age++) {
    timeline.push({
      annee: age - ageDebut + 1,
      age,
      revenus: Math.round(revenusAnnuels),
      flatTax: Math.round(flatTaxAnnuelle)
    });
  }
  
  return timeline;
}

/**
 * Détail de l'IFI par année
 * @param {import('../../../types/tax').Profil} profil - Profil utilisateur
 * @returns {Array<{annee: number, patrimoineNet: number, ifi: number}>}
 */
export function detailIFIParAnnee(profil) {
  // Calculer le patrimoine net
  let patrimoineImmoNet = 0;
  
  if (profil.logement.rpAchat && profil.logement.rpPrix) {
    patrimoineImmoNet += profil.logement.rpPrix * 0.7;
  }
  
  if (profil.logement.rsAchat && profil.logement.rsPrix) {
    patrimoineImmoNet += profil.logement.rsPrix;
  }
  
  if (profil.credits && profil.credits.capitalRestant > 0) {
    patrimoineImmoNet -= profil.credits.capitalRestant;
  }
  
  if (patrimoineImmoNet < BAREME_IFI.seuil) return [];
  
  // Calculer IFI annuel
  let ifiAnnuel = 0;
  for (const tranche of BAREME_IFI.tranches) {
    if (patrimoineImmoNet > tranche.min) {
      const baseImposable = Math.min(patrimoineImmoNet, tranche.max) - tranche.min;
      ifiAnnuel += baseImposable * tranche.taux;
    }
  }
  
  const ageDebut = profil.ageDebutCarriere || 22;
  const ageFin = profil.esperanceVie;
  
  const timeline = [];
  for (let age = ageDebut; age <= ageFin; age++) {
    timeline.push({
      annee: age - ageDebut + 1,
      age,
      patrimoineNet: Math.round(patrimoineImmoNet),
      ifi: Math.round(ifiAnnuel)
    });
  }
  
  return timeline;
}

export default {
  calculateFlatTax,
  calculateIFI,
  calculateInteretsCredits,
  detailFlatTaxParAnnee,
  detailIFIParAnnee
};

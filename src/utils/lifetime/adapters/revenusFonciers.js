/**
 * Calculs pour les revenus fonciers
 */

import { REVENUS_FONCIERS } from '../assumptions.js';

/**
 * Estime la fiscalité sur les revenus fonciers sur toute la vie
 * @param {import('../../../types/tax').Profil} profil - Profil utilisateur
 * @returns {number} Total fiscalité revenus fonciers
 */
export function estimateFiscaliteRevenusFonciers(profil) {
  const revenusFonciersAnnuels = profil.placements?.revenusFonciersAnnuels || 0;
  
  if (revenusFonciersAnnuels === 0) return 0;
  
  // Fiscalité annuelle moyenne
  const fiscaliteAnnuelle = revenusFonciersAnnuels * REVENUS_FONCIERS.tauxFiscaliteMoyen;
  
  // Durée de perception (du début de vie active à l'espérance de vie)
  const ageDebut = profil.ageDebutCarriere || 22;
  const duree = Math.max(0, profil.esperanceVie - ageDebut);
  
  return Math.round(fiscaliteAnnuelle * duree);
}

/**
 * Calcule le total des revenus fonciers bruts perçus sur la vie
 * @param {import('../../../types/tax').Profil} profil - Profil utilisateur
 * @returns {number} Total revenus fonciers bruts
 */
export function calculateTotalRevenusFonciers(profil) {
  const revenusFonciersAnnuels = profil.placements?.revenusFonciersAnnuels || 0;
  
  if (revenusFonciersAnnuels === 0) return 0;
  
  const ageDebut = profil.ageDebutCarriere || 22;
  const duree = Math.max(0, profil.esperanceVie - ageDebut);
  
  return Math.round(revenusFonciersAnnuels * duree);
}

/**
 * Détail des revenus fonciers par année
 * @param {import('../../../types/tax').Profil} profil - Profil utilisateur
 * @returns {Array<{annee: number, age: number, revenusBruts: number, fiscalite: number}>}
 */
export function detailRevenusFonciersParAnnee(profil) {
  const revenusFonciersAnnuels = profil.placements?.revenusFonciersAnnuels || 0;
  
  if (revenusFonciersAnnuels === 0) return [];
  
  const ageDebut = profil.ageDebutCarriere || 22;
  const ageFin = profil.esperanceVie;
  const fiscaliteAnnuelle = revenusFonciersAnnuels * REVENUS_FONCIERS.tauxFiscaliteMoyen;
  
  const timeline = [];
  for (let age = ageDebut; age <= ageFin; age++) {
    timeline.push({
      annee: age - ageDebut + 1,
      age,
      revenusBruts: revenusFonciersAnnuels,
      fiscalite: Math.round(fiscaliteAnnuelle)
    });
  }
  
  return timeline;
}

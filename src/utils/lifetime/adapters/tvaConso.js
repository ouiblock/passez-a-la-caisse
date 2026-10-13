/**
 * Adapter TVA sur consommation
 * Estime la TVA payée sur toute une vie via la consommation courante
 */

import { TVA } from '../assumptions.js';

/**
 * Estime la TVA sur consommation pour un profil donné
 * @param {import('../../../types/tax').Profil} profil - Profil utilisateur
 * @returns {number} TVA totale sur la vie
 */
export function estimateTVAConso(profil) {
  // Consommation mensuelle (hors loyer/crédit)
  const mensuel = profil.consoMensuelle ?? 1800;
  const annuel = mensuel * 12;
  
  // Durée de vie consommation (du début de vie active à l'espérance de vie)
  const ageDebut = profil.ageDebutCarriere || 22;
  const duree = Math.max(0, profil.esperanceVie - ageDebut);
  
  // Taux effectif moyen (panier mixte 20%, 10%, 5.5%)
  // Formule : taux_effectif / (1 + taux_effectif) pour obtenir la part de TVA dans le prix TTC
  const tauxEffectif = TVA.effectif;
  const partTVA = tauxEffectif / (1 + tauxEffectif);
  
  // Total TVA vie entière
  const totalTVA = annuel * duree * partTVA;
  
  return Math.round(totalTVA);
}

/**
 * Détail de la TVA par année
 * @param {import('../../../types/tax').Profil} profil - Profil utilisateur
 * @returns {Array<{annee: number, tva: number}>} TVA par année
 */
export function detailTVAParAnnee(profil) {
  const mensuel = profil.consoMensuelle ?? 1800;
  const annuel = mensuel * 12;
  const tauxEffectif = TVA.effectif;
  const partTVA = tauxEffectif / (1 + tauxEffectif);
  const tvaAnnuelle = annuel * partTVA;
  
  const ageDebut = profil.ageDebutCarriere || 22;
  const ageFin = profil.esperanceVie;
  
  const timeline = [];
  for (let age = ageDebut; age <= ageFin; age++) {
    timeline.push({
      annee: age - ageDebut + 1,
      age,
      tva: Math.round(tvaAnnuelle)
    });
  }
  
  return timeline;
}

/**
 * Répartition de la TVA par taux
 * @param {import('../../../types/tax').Profil} profil - Profil utilisateur
 * @returns {{normal: number, intermediaire: number, reduit: number, total: number}}
 */
export function repartitionTVA(profil) {
  const totalTVA = estimateTVAConso(profil);
  
  // Répartition selon le panier moyen
  const normal = totalTVA * (TVA.repartition.normal * TVA.taux.normal / TVA.effectif);
  const intermediaire = totalTVA * (TVA.repartition.intermediaire * TVA.taux.intermediaire / TVA.effectif);
  const reduit = totalTVA * (TVA.repartition.reduit * TVA.taux.reduit / TVA.effectif);
  
  return {
    normal: Math.round(normal),
    intermediaire: Math.round(intermediaire),
    reduit: Math.round(reduit),
    total: Math.round(totalTVA)
  };
}

export default {
  estimateTVAConso,
  detailTVAParAnnee,
  repartitionTVA
};

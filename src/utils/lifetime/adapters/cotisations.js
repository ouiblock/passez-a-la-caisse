/**
 * Adapter Cotisations sociales
 * Estime les cotisations salariales et patronales sur toute une carrière
 */

import { COTISATIONS, MOYENNES_INSEE, EVOLUTION_REVENUS } from '../assumptions.js';

/**
 * Calcule le salaire brut à partir du net
 * @param {number} net - Salaire net mensuel
 * @returns {number} Salaire brut mensuel
 */
function netToBrut(net) {
  // Formule inverse : brut = net / (1 - taux_cotisations_salariales)
  return net / (1 - COTISATIONS.salariales.total);
}

/**
 * Calcule le coût total employeur
 * @param {number} brut - Salaire brut mensuel
 * @returns {number} Coût total employeur
 */
export function brutToSuperBrut(brut) {
  // Super-brut = brut * (1 + taux_cotisations_patronales)
  return brut * (1 + COTISATIONS.patronales.total);
}

/**
 * Estime les cotisations salariales sur toute la carrière
 * @param {import('../../../types/tax').Profil} profil - Profil utilisateur
 * @returns {number} Total cotisations salariales
 */
export function estimateCotisationsSalariales(profil) {
  // Pour les retraités, utiliser le salaire moyen de carrière
  const netMensuel = profil.statut === 'retraite' 
    ? (profil.salaireMoyenCarriere || 2200) // Salaire moyen carrière ou défaut
    : (profil.revenuNetMensuel ?? MOYENNES_INSEE.revenuNetMensuel[profil.statut]);
  const brutMensuel = netToBrut(netMensuel);
  
  // Cotisations mensuelles
  const cotisationsMensuelles = brutMensuel * COTISATIONS.salariales.total;
  
  // Durée de carrière
  const ageDebut = profil.ageDebutCarriere || 22;
  const ageFin = Math.min(profil.retraiteAge, profil.esperanceVie);
  const dureeCarriere = Math.max(0, ageFin - ageDebut);
  
  // Évolution du salaire
  const croissance = 1 + (profil.croissanceRevenuPct / 100);
  
  let totalCotisations = 0;
  for (let annee = 0; annee < dureeCarriere; annee++) {
    const facteurEvolution = Math.pow(croissance, annee);
    const cotisationsAnnee = cotisationsMensuelles * 12 * facteurEvolution;
    totalCotisations += cotisationsAnnee;
  }
  
  return Math.round(totalCotisations);
}

/**
 * Estime les cotisations patronales sur toute la carrière
 * @param {import('../../../types/tax').Profil} profil - Profil utilisateur
 * @returns {number} Total cotisations patronales
 */
export function estimateCotisationsPatronales(profil) {
  // Pour les retraités, utiliser le salaire moyen de carrière
  const netMensuel = profil.statut === 'retraite' 
    ? (profil.salaireMoyenCarriere || 2200)
    : (profil.revenuNetMensuel ?? MOYENNES_INSEE.revenuNetMensuel[profil.statut]);
  const brutMensuel = netToBrut(netMensuel);
  
  // Cotisations patronales mensuelles
  const cotisationsMensuelles = brutMensuel * COTISATIONS.patronales.total;
  
  const ageDebut = profil.ageDebutCarriere || 22;
  const ageFin = Math.min(profil.retraiteAge, profil.esperanceVie);
  const dureeCarriere = Math.max(0, ageFin - ageDebut);
  
  const croissance = 1 + (profil.croissanceRevenuPct / 100);
  
  let totalCotisations = 0;
  for (let annee = 0; annee < dureeCarriere; annee++) {
    const facteurEvolution = Math.pow(croissance, annee);
    const cotisationsAnnee = cotisationsMensuelles * 12 * facteurEvolution;
    totalCotisations += cotisationsAnnee;
  }
  
  return Math.round(totalCotisations);
}

/**
 * Détail des cotisations par année
 * @param {import('../../../types/tax').Profil} profil - Profil utilisateur
 * @returns {Array<{annee: number, age: number, salariales: number, patronales: number}>}
 */
export function detailCotisationsParAnnee(profil) {
  const netMensuel = profil.revenuNetMensuel ?? MOYENNES_INSEE.revenuNetMensuel[profil.statut];
  const brutMensuel = netToBrut(netMensuel);
  
  const cotSalarialesMensuelles = brutMensuel * COTISATIONS.salariales.total;
  const cotPatronalesMensuelles = brutMensuel * COTISATIONS.patronales.total;
  
  const ageDebut = profil.ageDebutCarriere || 22;
  const ageFin = Math.min(profil.retraiteAge, profil.esperanceVie);
  const croissance = 1 + (profil.croissanceRevenuPct / 100);
  
  const timeline = [];
  for (let annee = 0; annee < (ageFin - ageDebut); annee++) {
    const age = ageDebut + annee;
    const facteurEvolution = Math.pow(croissance, annee);
    
    timeline.push({
      annee: annee + 1,
      age,
      salariales: Math.round(cotSalarialesMensuelles * 12 * facteurEvolution),
      patronales: Math.round(cotPatronalesMensuelles * 12 * facteurEvolution)
    });
  }
  
  return timeline;
}

/**
 * Répartition détaillée des cotisations
 * @param {import('../../../types/tax').Profil} profil - Profil utilisateur
 * @returns {Object} Détail par type de cotisation
 */
export function repartitionCotisations(profil) {
  const netMensuel = profil.revenuNetMensuel ?? MOYENNES_INSEE.revenuNetMensuel[profil.statut];
  const brutMensuel = netToBrut(netMensuel);
  
  const ageDebut = profil.ageDebutCarriere || 22;
  const ageFin = Math.min(profil.retraiteAge, profil.esperanceVie);
  const dureeCarriere = Math.max(0, ageFin - ageDebut);
  const croissance = 1 + (profil.croissanceRevenuPct / 100);
  
  // Calcul avec évolution
  let totalBrut = 0;
  for (let annee = 0; annee < dureeCarriere; annee++) {
    const facteurEvolution = Math.pow(croissance, annee);
    totalBrut += brutMensuel * 12 * facteurEvolution;
  }
  
  return {
    salariales: {
      maladie: Math.round(totalBrut * COTISATIONS.salariales.maladie),
      vieillesse: Math.round(totalBrut * COTISATIONS.salariales.vieillesse),
      vieillesse_dep: Math.round(totalBrut * COTISATIONS.salariales.vieillesse_dep),
      chomage: Math.round(totalBrut * COTISATIONS.salariales.chomage),
      retraiteCompl: Math.round(totalBrut * COTISATIONS.salariales.retraiteCompl),
      ceg: Math.round(totalBrut * COTISATIONS.salariales.ceg),
      csg: Math.round(totalBrut * COTISATIONS.salariales.csg),
      crds: Math.round(totalBrut * COTISATIONS.salariales.crds),
      total: Math.round(totalBrut * COTISATIONS.salariales.total)
    },
    patronales: {
      maladie: Math.round(totalBrut * COTISATIONS.patronales.maladie),
      vieillesse: Math.round(totalBrut * COTISATIONS.patronales.vieillesse),
      vieillesse_dep: Math.round(totalBrut * COTISATIONS.patronales.vieillesse_dep),
      allocFamiliales: Math.round(totalBrut * COTISATIONS.patronales.allocFamiliales),
      chomage: Math.round(totalBrut * COTISATIONS.patronales.chomage),
      retraiteCompl: Math.round(totalBrut * COTISATIONS.patronales.retraiteCompl),
      ceg: Math.round(totalBrut * COTISATIONS.patronales.ceg),
      csa: Math.round(totalBrut * COTISATIONS.patronales.csa),
      accident: Math.round(totalBrut * COTISATIONS.patronales.accident),
      fnal: Math.round(totalBrut * COTISATIONS.patronales.fnal),
      formation: Math.round(totalBrut * COTISATIONS.patronales.formation),
      total: Math.round(totalBrut * COTISATIONS.patronales.total)
    }
  };
}

export default {
  estimateCotisationsSalariales,
  estimateCotisationsPatronales,
  detailCotisationsParAnnee,
  repartitionCotisations
};
